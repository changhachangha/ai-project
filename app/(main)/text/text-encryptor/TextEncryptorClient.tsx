'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Lock, Unlock, Key, Shield } from 'lucide-react';
import { toast } from 'sonner';

type EncryptionMethod = 'aes' | 'simple';

const TextEncryptorClient = memo(() => {
    const [inputText, setInputText] = useState('');
    const [password, setPassword] = useState('');
    const [encryptedText, setEncryptedText] = useState('');
    const [decryptedText, setDecryptedText] = useState('');
    const [encryptionMethod, setEncryptionMethod] = useState<EncryptionMethod>('aes');
    const [activeTab, setActiveTab] = useState('encrypt');

    // 간단한 XOR 암호화 (데모용)
    const simpleEncrypt = useCallback((text: string, key: string) => {
        if (!key) return text;
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }
        return btoa(result); // Base64 인코딩
    }, []);

    const simpleDecrypt = useCallback((encryptedText: string, key: string) => {
        if (!key) return encryptedText;
        try {
            const decodedText = atob(encryptedText); // Base64 디코딩
            let result = '';
            for (let i = 0; i < decodedText.length; i++) {
                const charCode = decodedText.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                result += String.fromCharCode(charCode);
            }
            return result;
        } catch {
            throw new Error('잘못된 암호화 텍스트입니다.');
        }
    }, []);

    // AES 암호화 (Web Crypto API 사용)
    const aesEncrypt = useCallback(async (text: string, password: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);

        // 비밀번호를 키로 변환
        const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, [
            'deriveBits',
            'deriveKey',
        ]);

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256',
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, data);

        // salt, iv, 암호화된 데이터를 결합
        const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
        result.set(salt, 0);
        result.set(iv, salt.length);
        result.set(new Uint8Array(encrypted), salt.length + iv.length);

        return btoa(String.fromCharCode(...result));
    }, []);

    const aesDecrypt = useCallback(async (encryptedText: string, password: string) => {
        try {
            const data = new Uint8Array(
                atob(encryptedText)
                    .split('')
                    .map((c) => c.charCodeAt(0))
            );

            const salt = data.slice(0, 16);
            const iv = data.slice(16, 28);
            const encrypted = data.slice(28);

            const encoder = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256',
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt']
            );

            const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, encrypted);

            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch {
            throw new Error('복호화에 실패했습니다. 비밀번호를 확인해주세요.');
        }
    }, []);

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
            let result = '';
            if (encryptionMethod === 'aes') {
                result = await aesEncrypt(inputText, password);
            } else {
                result = simpleEncrypt(inputText, password);
            }
            setEncryptedText(result);
            toast.success('텍스트가 암호화되었습니다!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '암호화 중 오류가 발생했습니다.');
        }
    }, [inputText, password, encryptionMethod, aesEncrypt, simpleEncrypt]);

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
            let result = '';
            if (encryptionMethod === 'aes') {
                result = await aesDecrypt(encryptedText, password);
            } else {
                result = simpleDecrypt(encryptedText, password);
            }
            setDecryptedText(result);
            toast.success('텍스트가 복호화되었습니다!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '복호화 중 오류가 발생했습니다.');
        }
    }, [encryptedText, password, encryptionMethod, aesDecrypt, simpleDecrypt]);

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
        setInputText('이것은 암호화할 샘플 텍스트입니다. 중요한 정보를 안전하게 보호하세요!');
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-6xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Shield className='h-8 w-8' />
                    텍스트 암호화 도구
                </h1>
                <p className='text-muted-foreground mt-2'>
                    AES 암호화를 사용하여 텍스트를 안전하게 암호화/복호화하세요.
                </p>
            </div>

            <div className='mb-6'>
                <div className='flex items-center gap-4 mb-4'>
                    <div className='flex-1'>
                        <Label htmlFor='password' className='text-sm font-medium'>
                            비밀번호
                        </Label>
                        <div className='flex gap-2 mt-1'>
                            <Input
                                id='password'
                                type='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder='암호화/복호화 비밀번호를 입력하세요...'
                                className='flex-1'
                            />
                            <Button variant='outline' size='sm' onClick={generateRandomPassword}>
                                <Key className='h-4 w-4 mr-1' />
                                생성
                            </Button>
                        </div>
                    </div>
                    <div>
                        <Label className='text-sm font-medium'>암호화 방식</Label>
                        <Select
                            value={encryptionMethod}
                            onValueChange={(value: EncryptionMethod) => setEncryptionMethod(value)}
                        >
                            <SelectTrigger className='w-32 mt-1'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='aes'>AES-256</SelectItem>
                                <SelectItem value='simple'>간단 암호화</SelectItem>
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
                    <CardTitle className='text-sm'>보안 정보</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>AES-256:</strong> 군사급 암호화 표준으로 높은 보안성을 제공
                    </p>
                    <p>
                        • <strong>PBKDF2:</strong> 비밀번호 기반 키 유도 함수로 브루트 포스 공격 방지
                    </p>
                    <p>
                        • <strong>Salt & IV:</strong> 각 암호화마다 고유한 값을 사용하여 보안성 강화
                    </p>
                    <p>
                        • <strong>클라이언트 사이드:</strong> 모든 암호화는 브라우저에서 처리되어 서버로 전송되지 않음
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

TextEncryptorClient.displayName = 'TextEncryptorClient';

export default TextEncryptorClient;
