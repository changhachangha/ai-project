'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface JwtPayload {
    [key: string]: unknown;
    exp?: number;
    iat?: number;
}

interface DecodedJwt {
    header: Record<string, unknown>;
    payload: JwtPayload;
    signature: string;
    isExpired: boolean;
    expiresAt?: string;
    issuedAt?: string;
}

const JwtDecoderClient = memo(() => {
    const [token, setToken] = useState('');
    const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
    const [error, setError] = useState('');

    const decodeJwt = useCallback((jwt: string): DecodedJwt | null => {
        try {
            const parts = jwt.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }

            const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            const signature = parts[2];

            const now = Math.floor(Date.now() / 1000);
            const isExpired = payload.exp ? payload.exp < now : false;
            const expiresAt = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : undefined;
            const issuedAt = payload.iat ? new Date(payload.iat * 1000).toLocaleString() : undefined;

            return {
                header,
                payload,
                signature,
                isExpired,
                expiresAt,
                issuedAt,
            };
        } catch {
            throw new Error('Invalid JWT token');
        }
    }, []);

    const handleDecode = useCallback(() => {
        if (!token.trim()) {
            setError('JWT 토큰을 입력해주세요.');
            setDecoded(null);
            return;
        }

        try {
            const result = decodeJwt(token.trim());
            setDecoded(result);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : '토큰 디코딩 중 오류가 발생했습니다.');
            setDecoded(null);
        }
    }, [token, decodeJwt]);

    const handleCopy = useCallback((text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('클립보드에 복사되었습니다!');
        });
    }, []);

    const formatJson = useCallback((obj: unknown) => {
        return JSON.stringify(obj, null, 2);
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-4xl'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Shield className='h-5 w-5' />
                        JWT 토큰 디코더
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>JWT 토큰</label>
                        <Textarea
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder='JWT 토큰을 입력하세요... (예: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)'
                            className='min-h-24 font-mono text-sm'
                        />
                    </div>

                    <Button onClick={handleDecode} className='w-full'>
                        토큰 디코딩
                    </Button>

                    {error && (
                        <Alert variant='destructive'>
                            <AlertTriangle className='h-4 w-4' />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {decoded && (
                        <div className='space-y-4'>
                            {/* 토큰 상태 */}
                            <div className='flex items-center gap-2'>
                                {decoded.isExpired ? (
                                    <Badge variant='destructive' className='flex items-center gap-1'>
                                        <AlertTriangle className='h-3 w-3' />
                                        만료됨
                                    </Badge>
                                ) : (
                                    <Badge variant='default' className='flex items-center gap-1 bg-green-500'>
                                        <CheckCircle className='h-3 w-3' />
                                        유효함
                                    </Badge>
                                )}
                                {decoded.expiresAt && (
                                    <span className='text-sm text-muted-foreground'>만료: {decoded.expiresAt}</span>
                                )}
                            </div>

                            {/* 헤더 */}
                            <Card>
                                <CardHeader className='pb-3'>
                                    <div className='flex items-center justify-between'>
                                        <CardTitle className='text-lg'>헤더 (Header)</CardTitle>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => handleCopy(formatJson(decoded.header))}
                                        >
                                            <Copy className='h-4 w-4 mr-1' />
                                            복사
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <pre className='bg-muted p-3 rounded text-sm overflow-x-auto'>
                                        {formatJson(decoded.header)}
                                    </pre>
                                </CardContent>
                            </Card>

                            {/* 페이로드 */}
                            <Card>
                                <CardHeader className='pb-3'>
                                    <div className='flex items-center justify-between'>
                                        <CardTitle className='text-lg'>페이로드 (Payload)</CardTitle>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => handleCopy(formatJson(decoded.payload))}
                                        >
                                            <Copy className='h-4 w-4 mr-1' />
                                            복사
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <pre className='bg-muted p-3 rounded text-sm overflow-x-auto'>
                                        {formatJson(decoded.payload)}
                                    </pre>
                                    {decoded.issuedAt && (
                                        <div className='mt-3 text-sm text-muted-foreground'>
                                            발행일: {decoded.issuedAt}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* 서명 */}
                            <Card>
                                <CardHeader className='pb-3'>
                                    <div className='flex items-center justify-between'>
                                        <CardTitle className='text-lg'>서명 (Signature)</CardTitle>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => handleCopy(decoded.signature)}
                                        >
                                            <Copy className='h-4 w-4 mr-1' />
                                            복사
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <pre className='bg-muted p-3 rounded text-sm overflow-x-auto break-all'>
                                        {decoded.signature}
                                    </pre>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
});

JwtDecoderClient.displayName = 'JwtDecoderClient';

export default JwtDecoderClient;
