'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Loader2, Copy } from 'lucide-react';

export default function RsaKeyGeneratorClient() {
    const [publicKey, setPublicKey] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const generateKeys = async () => {
        setIsLoading(true);
        setPublicKey('');
        setPrivateKey('');

        // ArrayBuffer를 PEM 형식 문자열로 변환하는 함수
        function arrayBufferToPem(buffer: ArrayBuffer, label: string) {
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
            const pem = `-----BEGIN ${label}-----\n${base64.match(/.{1,64}/g)?.join('\n')}\n-----END ${label}-----`;
            return pem;
        }

        try {
            // 빌드 시 서버 환경에서 crypto.subtle이 없어서 발생하는 오류를 방지
            if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
                throw new Error('Web Crypto API는 브라우저 환경에서만 지원됩니다.');
            }

            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: 'RSA-OAEP',
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: 'SHA-256',
                },
                true, // export 가능 여부
                ['encrypt', 'decrypt']
            );

            const spki = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
            const pkcs8 = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

            setPublicKey(arrayBufferToPem(spki, 'PUBLIC KEY'));
            setPrivateKey(arrayBufferToPem(pkcs8, 'PRIVATE KEY'));
        } catch (error: unknown) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            setPublicKey(`키 생성 중 오류가 발생했습니다: ${errorMessage}`);
            setPrivateKey(`키 생성 중 오류가 발생했습니다: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text: string) => {
        if (text) navigator.clipboard.writeText(text);
    };

    return (
        <div className='space-y-6'>
            <Card>
                <CardContent className='p-6 text-center'>
                    <Button onClick={generateKeys} disabled={isLoading} size='lg'>
                        {isLoading ? <Loader2 className='mr-2 h-5 w-5 animate-spin' /> : null}
                        2048비트 RSA 키 페어 생성
                    </Button>
                </CardContent>
            </Card>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <Card>
                    <CardContent className='p-6 space-y-2'>
                        <div className='flex justify-between items-center'>
                            <h2 className='text-lg font-semibold'>Public Key (공개키)</h2>
                            <Button variant='outline' size='sm' onClick={() => handleCopy(publicKey)}>
                                <Copy className='mr-2 h-4 w-4' /> 복사
                            </Button>
                        </div>
                        <Textarea
                            readOnly
                            value={publicKey}
                            className='min-h-[300px] font-mono'
                            placeholder='공개키가 여기에 생성됩니다.'
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='p-6 space-y-2'>
                        <div className='flex justify-between items-center'>
                            <h2 className='text-lg font-semibold'>Private Key (개인키)</h2>
                            <Button variant='outline' size='sm' onClick={() => handleCopy(privateKey)}>
                                <Copy className='mr-2 h-4 w-4' /> 복사
                            </Button>
                        </div>
                        <Textarea
                            readOnly
                            value={privateKey}
                            className='min-h-[300px] font-mono'
                            placeholder='개인키가 여기에 생성됩니다.'
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
