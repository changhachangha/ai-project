'use client';

import React, { useState } from 'react';
import { CryptoToolInput, CryptoToolOptions, CryptoToolOutput } from '@/lib/types/tools';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { extractPublicKey, generateSampleRSAKey } from '@/lib/tools/crypto';
import { Copy, Key, Download } from 'lucide-react';

const CryptoTool: React.FC = () => {
    const [privateKeyInput, setPrivateKeyInput] = useState<string>('');
    const [outputFormat, setOutputFormat] = useState<'pem' | 'der' | 'jwk' | 'hex'>('pem');
    const [result, setResult] = useState<CryptoToolOutput | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleExtractPublicKey = async () => {
        setIsProcessing(true);

        const input: CryptoToolInput = {
            privateKey: privateKeyInput,
            keyFormat: 'auto',
        };

        const options: CryptoToolOptions = {
            outputFormat,
            keyType: 'auto',
        };

        try {
            const output = extractPublicKey(input, options);
            setResult(output);
        } catch (error) {
            setResult({
                publicKey: '',
                keyInfo: { keyType: 'unknown' },
                isValid: false,
                errorMessage: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGenerateSample = () => {
        const sampleKey = generateSampleRSAKey();
        if (sampleKey) {
            setPrivateKeyInput(sampleKey);
        }
    };

    const handleCopyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            // 간단한 피드백을 위해 임시로 버튼 텍스트 변경 등을 할 수 있음
        } catch (error) {
            console.error('클립보드 복사 실패:', error);
        }
    };

    const handleDownload = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className='flex flex-col space-y-6 p-6 max-w-4xl mx-auto'>
            <div className='text-center space-y-2'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Key className='h-8 w-8' />
                    암호화 키 도구
                </h1>
                <p className='text-muted-foreground'>
                    개인키를 입력하여 공개키를 추출하고 다양한 형식으로 변환할 수 있습니다.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>개인키 입력</CardTitle>
                    <CardDescription>RSA 개인키를 PEM 형식으로 입력해주세요. (PKCS#1 또는 PKCS#8 지원)</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='private-key'>개인키</Label>
                        <Textarea
                            id='private-key'
                            placeholder='-----BEGIN RSA PRIVATE KEY-----&#10;또는&#10;-----BEGIN PRIVATE KEY-----&#10;개인키 내용을 여기에 붙여넣기...'
                            value={privateKeyInput}
                            onChange={(e) => setPrivateKeyInput(e.target.value)}
                            className='min-h-[200px] font-mono text-sm'
                        />
                    </div>

                    <div className='flex flex-col sm:flex-row gap-4'>
                        <div className='space-y-2 flex-1'>
                            <Label htmlFor='output-format'>출력 형식</Label>
                            <Select
                                value={outputFormat}
                                onValueChange={(value: 'pem' | 'der' | 'jwk' | 'hex') => setOutputFormat(value)}
                            >
                                <SelectTrigger id='output-format'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='pem'>PEM</SelectItem>
                                    <SelectItem value='der'>DER (Base64)</SelectItem>
                                    <SelectItem value='jwk'>JWK</SelectItem>
                                    <SelectItem value='hex'>HEX</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-2'>
                        <Button
                            onClick={handleExtractPublicKey}
                            disabled={!privateKeyInput.trim() || isProcessing}
                            className='flex-1'
                        >
                            {isProcessing ? '처리 중...' : '공개키 추출'}
                        </Button>
                        <Button variant='outline' onClick={handleGenerateSample} className='flex-1 sm:flex-none'>
                            샘플 키 생성
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center justify-between'>
                            <span>결과</span>
                            {result.isValid && (
                                <div className='flex gap-2'>
                                    <span className='px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm'>
                                        {result.keyInfo.keyType.toUpperCase()}
                                        {result.keyInfo.keySize && ` ${result.keyInfo.keySize}bit`}
                                    </span>
                                </div>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {result.isValid ? (
                            <>
                                <div className='space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <Label>공개키 ({outputFormat.toUpperCase()})</Label>
                                        <div className='flex gap-1'>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => handleCopyToClipboard(result.publicKey)}
                                            >
                                                <Copy className='h-4 w-4' />
                                            </Button>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() =>
                                                    handleDownload(
                                                        result.publicKey,
                                                        `public_key.${outputFormat === 'pem' ? 'pem' : 'txt'}`
                                                    )
                                                }
                                            >
                                                <Download className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className='border rounded-md p-4 bg-card text-card-foreground'>
                                        <pre className='whitespace-pre-wrap break-all text-sm font-mono'>
                                            {result.publicKey}
                                        </pre>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                                    <div>
                                        <Label className='text-xs text-muted-foreground'>키 유형</Label>
                                        <p className='font-mono'>{result.keyInfo.keyType.toUpperCase()}</p>
                                    </div>
                                    {result.keyInfo.keySize && (
                                        <div>
                                            <Label className='text-xs text-muted-foreground'>키 크기</Label>
                                            <p className='font-mono'>{result.keyInfo.keySize} bits</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className='text-destructive space-y-2'>
                                <h3 className='font-semibold'>오류 발생</h3>
                                <p className='text-sm'>{result.errorMessage}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card className='bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>사용 방법</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>• RSA 개인키를 PEM 형식으로 입력하세요.</p>
                    <p>
                        • 지원 형식: PKCS#1 (-----BEGIN RSA PRIVATE KEY-----) 또는 PKCS#8 (-----BEGIN PRIVATE KEY-----)
                    </p>
                    <p>• 출력 형식을 선택하여 공개키를 원하는 형태로 변환할 수 있습니다.</p>
                    <p>• 테스트용 샘플 키가 필요하면 &quot;샘플 키 생성&quot; 버튼을 사용하세요.</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default CryptoTool;
