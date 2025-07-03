'use client';

import React, { useState, useEffect } from 'react';
import { HashToolInput, HashToolOptions, HashToolOutput } from '@/lib/types/tools';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateHash, generateSampleText } from '@/lib/tools/hash';
import { Copy, Hash, Download, CheckCircle, XCircle, FileText } from 'lucide-react';

const HashTool: React.FC = () => {
    const [inputText, setInputText] = useState<string>('');
    const [algorithm, setAlgorithm] = useState<'sha256' | 'sha512' | 'md5' | 'sha1'>('sha512');
    const [outputFormat, setOutputFormat] = useState<'hex' | 'base64'>('hex');
    const [compareHash, setCompareHash] = useState<string>('');
    const [result, setResult] = useState<HashToolOutput | null>(null);

    // 실시간 해시 생성
    useEffect(() => {
        if (inputText.trim()) {
            const input: HashToolInput = {
                text: inputText,
                algorithm,
            };

            const options: HashToolOptions = {
                outputFormat,
                compareHash: compareHash.trim() || undefined,
            };

            try {
                const output = generateHash(input, options);
                setResult(output);
            } catch (error) {
                setResult({
                    hash: '',
                    algorithm: algorithm.toUpperCase(),
                    outputFormat: outputFormat.toUpperCase(),
                    isValid: false,
                    errorMessage: error instanceof Error ? error.message : '해시 생성 중 오류가 발생했습니다.',
                });
            }
        } else {
            setResult(null);
        }
    }, [inputText, algorithm, outputFormat, compareHash]);

    const handleVerifyHash = () => {
        if (!compareHash.trim()) {
            return;
        }

        const input: HashToolInput = {
            text: inputText,
            algorithm,
        };

        const options: HashToolOptions = {
            outputFormat,
            compareHash: compareHash.trim(),
        };

        const output = generateHash(input, options);
        setResult(output);
    };

    const handleGenerateSample = () => {
        const sampleText = generateSampleText();
        setInputText(sampleText);
    };

    const handleCopyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
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

    const getAlgorithmDescription = (algo: string) => {
        const descriptions: Record<string, string> = {
            sha512: 'SHA-512: 512비트 해시, 높은 보안성',
            sha256: 'SHA-256: 256비트 해시, 널리 사용됨',
            sha1: 'SHA-1: 160비트 해시, 보안성 낮음 (권장하지 않음)',
            md5: 'MD5: 128비트 해시, 보안성 낮음 (권장하지 않음)',
        };
        return descriptions[algo] || '';
    };

    return (
        <div className='flex flex-col space-y-6 p-6 max-w-4xl mx-auto'>
            <div className='text-center space-y-2'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Hash className='h-8 w-8' />
                    해시 생성기
                </h1>
                <p className='text-muted-foreground'>
                    텍스트를 다양한 해시 알고리즘으로 변환하고 해시값을 검증할 수 있습니다.
                </p>
            </div>

            <Tabs defaultValue='generate' className='w-full'>
                <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value='generate'>해시 생성</TabsTrigger>
                    <TabsTrigger value='verify'>해시 검증</TabsTrigger>
                </TabsList>

                <TabsContent value='generate' className='space-y-4'>
                    <Card>
                        <CardHeader>
                            <CardTitle>텍스트 해시 생성</CardTitle>
                            <CardDescription>입력한 텍스트의 해시값을 실시간으로 생성합니다.</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='input-text'>입력 텍스트</Label>
                                <Textarea
                                    id='input-text'
                                    placeholder='해시를 생성할 텍스트를 입력하세요...'
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    className='min-h-[120px] font-mono text-sm'
                                />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='algorithm'>해시 알고리즘</Label>
                                    <Select
                                        value={algorithm}
                                        onValueChange={(value: 'sha256' | 'sha512' | 'md5' | 'sha1') =>
                                            setAlgorithm(value)
                                        }
                                    >
                                        <SelectTrigger id='algorithm'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='sha512'>SHA-512 (권장)</SelectItem>
                                            <SelectItem value='sha256'>SHA-256</SelectItem>
                                            <SelectItem value='sha1'>SHA-1</SelectItem>
                                            <SelectItem value='md5'>MD5</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className='text-xs text-muted-foreground'>
                                        {getAlgorithmDescription(algorithm)}
                                    </p>
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='output-format'>출력 형식</Label>
                                    <Select
                                        value={outputFormat}
                                        onValueChange={(value: 'hex' | 'base64') => setOutputFormat(value)}
                                    >
                                        <SelectTrigger id='output-format'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='hex'>HEX (16진수)</SelectItem>
                                            <SelectItem value='base64'>Base64</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className='flex flex-col sm:flex-row gap-2'>
                                <Button
                                    variant='outline'
                                    onClick={handleGenerateSample}
                                    className='flex-1 sm:flex-none'
                                >
                                    <FileText className='h-4 w-4 mr-2' />
                                    샘플 텍스트
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='verify' className='space-y-4'>
                    <Card>
                        <CardHeader>
                            <CardTitle>해시 검증</CardTitle>
                            <CardDescription>입력 텍스트와 해시값이 일치하는지 확인합니다.</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='input-text-verify'>원본 텍스트</Label>
                                <Textarea
                                    id='input-text-verify'
                                    placeholder='검증할 원본 텍스트를 입력하세요...'
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    className='min-h-[100px] font-mono text-sm'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='compare-hash'>비교할 해시값</Label>
                                <Input
                                    id='compare-hash'
                                    placeholder='검증할 해시값을 입력하세요...'
                                    value={compareHash}
                                    onChange={(e) => setCompareHash(e.target.value)}
                                    className='font-mono text-sm'
                                />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='algorithm-verify'>해시 알고리즘</Label>
                                    <Select
                                        value={algorithm}
                                        onValueChange={(value: 'sha256' | 'sha512' | 'md5' | 'sha1') =>
                                            setAlgorithm(value)
                                        }
                                    >
                                        <SelectTrigger id='algorithm-verify'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='sha512'>SHA-512</SelectItem>
                                            <SelectItem value='sha256'>SHA-256</SelectItem>
                                            <SelectItem value='sha1'>SHA-1</SelectItem>
                                            <SelectItem value='md5'>MD5</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='output-format-verify'>출력 형식</Label>
                                    <Select
                                        value={outputFormat}
                                        onValueChange={(value: 'hex' | 'base64') => setOutputFormat(value)}
                                    >
                                        <SelectTrigger id='output-format-verify'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='hex'>HEX (16진수)</SelectItem>
                                            <SelectItem value='base64'>Base64</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button
                                onClick={handleVerifyHash}
                                disabled={!inputText.trim() || !compareHash.trim()}
                                className='w-full'
                            >
                                해시 검증
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center justify-between'>
                            <span>결과</span>
                            <div className='flex gap-2'>
                                <span className='px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm'>
                                    {result.algorithm}
                                </span>
                                <span className='px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm'>
                                    {result.outputFormat}
                                </span>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {result.isValid ? (
                            <>
                                <div className='space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <Label>해시값</Label>
                                        <div className='flex gap-1'>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => handleCopyToClipboard(result.hash)}
                                            >
                                                <Copy className='h-4 w-4' />
                                            </Button>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() =>
                                                    handleDownload(
                                                        result.hash,
                                                        `hash_${result.algorithm.toLowerCase()}.txt`
                                                    )
                                                }
                                            >
                                                <Download className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className='border rounded-md p-4 bg-card text-card-foreground'>
                                        <pre className='whitespace-pre-wrap break-all text-sm font-mono'>
                                            {result.hash}
                                        </pre>
                                    </div>
                                </div>

                                {result.isMatch !== undefined && (
                                    <div
                                        className={`flex items-center gap-2 p-3 rounded-md ${
                                            result.isMatch
                                                ? 'bg-green-50 border border-green-200 text-green-800'
                                                : 'bg-red-50 border border-red-200 text-red-800'
                                        }`}
                                    >
                                        {result.isMatch ? (
                                            <CheckCircle className='h-5 w-5 text-green-600' />
                                        ) : (
                                            <XCircle className='h-5 w-5 text-red-600' />
                                        )}
                                        <span className='font-medium'>
                                            {result.isMatch ? '해시 검증 성공!' : '해시 검증 실패!'}
                                        </span>
                                        <span className='text-sm'>
                                            {result.isMatch
                                                ? '입력 텍스트와 해시값이 일치합니다.'
                                                : '입력 텍스트와 해시값이 일치하지 않습니다.'}
                                        </span>
                                    </div>
                                )}

                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                                    <div>
                                        <Label className='text-xs text-muted-foreground'>알고리즘</Label>
                                        <p className='font-mono'>{result.algorithm}</p>
                                    </div>
                                    <div>
                                        <Label className='text-xs text-muted-foreground'>출력 형식</Label>
                                        <p className='font-mono'>{result.outputFormat}</p>
                                    </div>
                                    <div>
                                        <Label className='text-xs text-muted-foreground'>해시 길이</Label>
                                        <p className='font-mono'>{result.hash.length} 문자</p>
                                    </div>
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
                    <CardTitle className='text-sm'>사용 방법 및 보안 주의사항</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>해시 생성:</strong> 텍스트 입력 시 실시간으로 해시값 생성
                    </p>
                    <p>
                        • <strong>해시 검증:</strong> 원본 텍스트와 해시값이 일치하는지 확인
                    </p>
                    <p>
                        • <strong>SHA-512 권장:</strong> 현재 가장 안전한 해시 알고리즘
                    </p>
                    <p>
                        • <strong>MD5/SHA-1 주의:</strong> 보안 취약점이 있어 중요한 용도로는 권장하지 않음
                    </p>
                    <p>
                        • <strong>단방향 함수:</strong> 해시값으로부터 원본 텍스트를 복원할 수 없음
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default HashTool;
