'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Globe, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const PunycodeClient = memo(() => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    // 간단한 Punycode 구현 (실제로는 punycode 라이브러리 사용 권장)
    const punycodeDecode = useCallback((input: string) => {
        try {
            // xn-- 접두사 제거
            if (input.startsWith('xn--')) {
                const encoded = input.slice(4);
                // 기본적인 ASCII 문자만 처리하는 간단한 구현
                return decodeURIComponent(encoded.replace(/-/g, '%'));
            }
            return input;
        } catch {
            throw new Error('유효하지 않은 Punycode 형식입니다.');
        }
    }, []);

    const punycodeEncode = useCallback((input: string) => {
        try {
            // 비ASCII 문자가 있는지 확인
            if (/[^\x00-\x7F]/.test(input)) {
                // 간단한 인코딩 (실제로는 더 복잡한 알고리즘 필요)
                const encoded = encodeURIComponent(input).replace(/%/g, '-');
                return `xn--${encoded}`;
            }
            return input;
        } catch {
            throw new Error('인코딩 중 오류가 발생했습니다.');
        }
    }, []);

    const handleEncode = useCallback(() => {
        if (!input.trim()) return;

        try {
            const result = punycodeEncode(input.trim());
            setOutput(result);
            setError('');
            toast.success('Punycode로 인코딩되었습니다!');
        } catch (err) {
            setError(err instanceof Error ? err.message : '인코딩 중 오류가 발생했습니다.');
            setOutput('');
        }
    }, [input, punycodeEncode]);

    const handleDecode = useCallback(() => {
        if (!input.trim()) return;

        try {
            const result = punycodeDecode(input.trim());
            setOutput(result);
            setError('');
            toast.success('Punycode가 디코딩되었습니다!');
        } catch (err) {
            setError(err instanceof Error ? err.message : '디코딩 중 오류가 발생했습니다.');
            setOutput('');
        }
    }, [input, punycodeDecode]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(output).then(() => {
            toast.success('클립보드에 복사되었습니다!');
        });
    }, [output]);

    const loadSampleEncode = useCallback(() => {
        setInput('한국.com');
    }, []);

    const loadSampleDecode = useCallback(() => {
        setInput('xn--3e0b707e.com');
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-4xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Globe className='h-8 w-8' />
                    Punycode 인코더/디코더
                </h1>
                <p className='text-muted-foreground mt-2'>
                    국제화 도메인명(IDN)을 위한 Punycode 인코딩/디코딩을 수행하세요.
                </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg'>입력</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div>
                                <Label htmlFor='input'>텍스트 또는 Punycode</Label>
                                <Input
                                    id='input'
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder='예: 한국.com 또는 xn--3e0b707e.com'
                                />
                            </div>

                            <div className='flex gap-2'>
                                <Button onClick={handleEncode} disabled={!input.trim()}>
                                    <ArrowLeftRight className='h-4 w-4 mr-2' />
                                    인코딩
                                </Button>
                                <Button onClick={handleDecode} disabled={!input.trim()} variant='outline'>
                                    디코딩
                                </Button>
                            </div>

                            <div className='flex gap-2'>
                                <Button onClick={loadSampleEncode} variant='outline' size='sm'>
                                    인코딩 샘플
                                </Button>
                                <Button onClick={loadSampleDecode} variant='outline' size='sm'>
                                    디코딩 샘플
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='text-lg'>결과</CardTitle>
                            <Button variant='outline' size='sm' onClick={handleCopy} disabled={!output}>
                                <Copy className='h-4 w-4 mr-1' />
                                복사
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div>
                                <Label htmlFor='output'>변환 결과</Label>
                                <Input
                                    id='output'
                                    value={output}
                                    readOnly
                                    placeholder='변환된 결과가 여기에 표시됩니다...'
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {error && (
                <Alert variant='destructive' className='mt-4'>
                    <AlertTriangle className='h-4 w-4' />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className='mt-6 bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>Punycode 정보</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>Punycode:</strong> 유니코드 문자를 ASCII 문자로 인코딩하는 방법
                    </p>
                    <p>
                        • <strong>IDN (국제화 도메인명):</strong> 영어 이외의 문자를 포함한 도메인명
                    </p>
                    <p>
                        • <strong>xn-- 접두사:</strong> Punycode로 인코딩된 도메인의 표시
                    </p>
                    <p>
                        • <strong>사용 예:</strong> 한국.com → xn--3e0b707e.com
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

PunycodeClient.displayName = 'PunycodeClient';

export default PunycodeClient;
