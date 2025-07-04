'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Lock, Unlock, Key, FileKey, Shield } from 'lucide-react';
import { toast } from 'sonner';

type AESMode = 'GCM' | 'CBC' | 'CTR';
type KeyLength = 128 | 192 | 256;

const AESEncryptorClient = memo(() => {
    const [inputText, setInputText] = useState('');
    const [password, setPassword] = useState('');
    const [encryptedText, setEncryptedText] = useState('');
    const [decryptedText, setDecryptedText] = useState('');
    const [mode, setMode] = useState<AESMode>('GCM');
    const [keyLength, setKeyLength] = useState<KeyLength>(256);
    const [activeTab, setActiveTab] = useState('encrypt');

    const deriveKey = useCallback(async (password: string, salt: Uint8Array, keyLength: KeyLength) => {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, [
            'deriveBits',
            'deriveKey',
        ]);

        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256',
            },
            keyMaterial,
            { name: 'AES-GCM', length: keyLength },
            false,
            ['encrypt', 'decrypt']
        );
    }, []);

    const aesEncrypt = useCallback(
        async (text: string, password: string) => {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);

            const salt = crypto.getRandomValues(new Uint8Array(16));
            const key = await deriveKey(password, salt, keyLength);

            let encrypted: ArrayBuffer;
            let iv: Uint8Array;

            if (mode === 'GCM') {
                iv = crypto.getRandomValues(new Uint8Array(12));
                encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, data);
            } else if (mode === 'CBC') {
                iv = crypto.getRandomValues(new Uint8Array(16));
                encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv }, key, data);
            } else {
                // CTR
                iv = crypto.getRandomValues(new Uint8Array(16));
                encrypted = await crypto.subtle.encrypt({ name: 'AES-CTR', counter: iv, length: 64 }, key, data);
            }

            // salt, iv, 암호화된 데이터를 결합
            const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
            result.set(salt, 0);
            result.set(iv, salt.length);
            result.set(new Uint8Array(encrypted), salt.length + iv.length);

            return btoa(String.fromCharCode(...result));
        },
        [mode, keyLength, deriveKey]
    );

    const aesDecrypt = useCallback(
        async (encryptedText: string, password: string) => {
            const data = new Uint8Array(
                atob(encryptedText)
                    .split('')
                    .map((c) => c.charCodeAt(0))
            );

            const salt = data.slice(0, 16);
            const ivLength = mode === 'GCM' ? 12 : 16;
            const iv = data.slice(16, 16 + ivLength);
            const encrypted = data.slice(16 + ivLength);

            const key = await deriveKey(password, salt, keyLength);

            let decrypted: ArrayBuffer;

            if (mode === 'GCM') {
                decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, encrypted);
            } else if (mode === 'CBC') {
                decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv }, key, encrypted);
            } else {
                // CTR
                decrypted = await crypto.subtle.decrypt({ name: 'AES-CTR', counter: iv, length: 64 }, key, encrypted);
            }

            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        },
        [mode, keyLength, deriveKey]
    );

    const handleEncrypt = useCallback(async () => {
        if (!inputText.trim()) {
            toast.error('암호화할 텍스트를 입력해주세요.');
            return;
        }
        if (!password.trim()) {
            toast.error('비밀번호를 입력해주세요.');
            return;
        }

        try {
            const result = await aesEncrypt(inputText, password);
            setEncryptedText(result);
            toast.success('텍스트가 암호화되었습니다!');
        } catch {
            toast.error('암호화 중 오류가 발생했습니다.');
        }
    }, [inputText, password, aesEncrypt]);

    const handleDecrypt = useCallback(async () => {
        if (!encryptedText.trim()) {
            toast.error('복호화할 텍스트를 입력해주세요.');
            return;
        }
        if (!password.trim()) {
            toast.error('비밀번호를 입력해주세요.');
            return;
        }

        try {
            const result = await aesDecrypt(encryptedText, password);
            setDecryptedText(result);
            toast.success('텍스트가 복호화되었습니다!');
        } catch {
            toast.error('복호화에 실패했습니다. 비밀번호를 확인해주세요.');
        }
    }, [encryptedText, password, aesDecrypt]);

    const handleCopy = useCallback((text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('클립보드에 복사되었습니다!');
        });
    }, []);

    const generateRandomPassword = useCallback(() => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let result = '';
        for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(result);
        toast.success('랜덤 비밀번호가 생성되었습니다!');
    }, []);

    const loadSampleText = useCallback(() => {
        setInputText('이것은 AES 암호화 테스트용 샘플 텍스트입니다. 최고 수준의 보안을 제공합니다.');
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-6xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <FileKey className='h-8 w-8' />
                    AES 암호화/복호화 도구
                </h1>
                <p className='text-muted-foreground mt-2'>Advanced Encryption Standard를 사용한 군사급 보안 암호화</p>
            </div>

            <div className='mb-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                    <div>
                        <Label htmlFor='password' className='text-sm font-medium'>
                            비밀번호
                        </Label>
                        <div className='flex gap-2 mt-1'>
                            <Input
                                id='password'
                                type='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder='암호화 비밀번호'
                                className='flex-1'
                            />
                            <Button variant='outline' size='sm' onClick={generateRandomPassword}>
                                <Key className='h-4 w-4' />
                            </Button>
                        </div>
                    </div>
                    <div>
                        <Label className='text-sm font-medium'>암호화 모드</Label>
                        <Select value={mode} onValueChange={(value: AESMode) => setMode(value)}>
                            <SelectTrigger className='mt-1'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='GCM'>GCM (권장)</SelectItem>
                                <SelectItem value='CBC'>CBC</SelectItem>
                                <SelectItem value='CTR'>CTR</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className='text-sm font-medium'>키 길이</Label>
                        <Select
                            value={keyLength.toString()}
                            onValueChange={(value) => setKeyLength(parseInt(value) as KeyLength)}
                        >
                            <SelectTrigger className='mt-1'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='128'>128-bit</SelectItem>
                                <SelectItem value='192'>192-bit</SelectItem>
                                <SelectItem value='256'>256-bit (권장)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value='encrypt'>암호화</TabsTrigger>
                    <TabsTrigger value='decrypt'>복호화</TabsTrigger>
                </TabsList>

                <TabsContent value='encrypt' className='space-y-4'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-lg flex items-center gap-2'>
                                    <Lock className='h-5 w-5' />
                                    원본 텍스트
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-4'>
                                    <Textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder='암호화할 텍스트를 입력하세요...'
                                        className='min-h-[300px]'
                                    />
                                    <div className='flex gap-2'>
                                        <Button onClick={loadSampleText} variant='outline' size='sm'>
                                            샘플 텍스트
                                        </Button>
                                        <Button
                                            onClick={handleEncrypt}
                                            disabled={!inputText.trim() || !password.trim()}
                                        >
                                            <Lock className='h-4 w-4 mr-2' />
                                            암호화
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className='flex items-center justify-between'>
                                    <CardTitle className='text-lg flex items-center gap-2'>
                                        <Shield className='h-5 w-5' />
                                        암호화된 텍스트
                                    </CardTitle>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => handleCopy(encryptedText)}
                                        disabled={!encryptedText}
                                    >
                                        <Copy className='h-4 w-4 mr-1' />
                                        복사
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={encryptedText}
                                    readOnly
                                    placeholder='암호화된 텍스트가 여기에 표시됩니다...'
                                    className='min-h-[300px] font-mono text-sm'
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value='decrypt' className='space-y-4'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-lg flex items-center gap-2'>
                                    <Shield className='h-5 w-5' />
                                    암호화된 텍스트
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-4'>
                                    <Textarea
                                        value={encryptedText}
                                        onChange={(e) => setEncryptedText(e.target.value)}
                                        placeholder='복호화할 암호화된 텍스트를 입력하세요...'
                                        className='min-h-[300px] font-mono text-sm'
                                    />
                                    <Button
                                        onClick={handleDecrypt}
                                        disabled={!encryptedText.trim() || !password.trim()}
                                    >
                                        <Unlock className='h-4 w-4 mr-2' />
                                        복호화
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className='flex items-center justify-between'>
                                    <CardTitle className='text-lg flex items-center gap-2'>
                                        <Unlock className='h-5 w-5' />
                                        복호화된 텍스트
                                    </CardTitle>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => handleCopy(decryptedText)}
                                        disabled={!decryptedText}
                                    >
                                        <Copy className='h-4 w-4 mr-1' />
                                        복사
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={decryptedText}
                                    readOnly
                                    placeholder='복호화된 텍스트가 여기에 표시됩니다...'
                                    className='min-h-[300px]'
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <Card className='mt-6 bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>AES 암호화 정보</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>GCM 모드:</strong> 인증과 암호화를 동시에 제공하는 가장 안전한 모드
                    </p>
                    <p>
                        • <strong>CBC 모드:</strong> 블록 체인 방식으로 각 블록이 이전 블록에 의존
                    </p>
                    <p>
                        • <strong>CTR 모드:</strong> 카운터 모드로 병렬 처리 가능
                    </p>
                    <p>
                        • <strong>PBKDF2:</strong> 10만 회 반복으로 브루트 포스 공격 방지
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

AESEncryptorClient.displayName = 'AESEncryptorClient';

export default AESEncryptorClient;
