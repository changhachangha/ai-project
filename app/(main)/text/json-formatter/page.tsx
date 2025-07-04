'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ButtonLoading } from '@/components/loading-spinner';
import { Copy, Download, Upload, FileCheck } from 'lucide-react';

export default function JsonPage() {
    const [jsonInput, setJsonInput] = useState('');
    const [jsonOutput, setJsonOutput] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const formatJson = async () => {
        setIsProcessing(true);
        try {
            if (!jsonInput.trim()) {
                throw new Error('JSON 입력이 비어 있습니다.');
            }

            const parsedJson = JSON.parse(jsonInput);
            const formatted = JSON.stringify(parsedJson, null, 2);
            setJsonOutput(formatted);
            setError('');
            toast.success('JSON이 성공적으로 포매팅되었습니다!');
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            setError(errorMessage);
            setJsonOutput('');
            toast.error(`JSON 포매팅 실패: ${errorMessage}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const minifyJson = async () => {
        setIsProcessing(true);
        try {
            if (!jsonInput.trim()) {
                throw new Error('JSON 입력이 비어 있습니다.');
            }

            const parsedJson = JSON.parse(jsonInput);
            const minified = JSON.stringify(parsedJson);
            setJsonOutput(minified);
            setError('');
            toast.success('JSON이 성공적으로 압축되었습니다!');
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            setError(errorMessage);
            setJsonOutput('');
            toast.error(`JSON 압축 실패: ${errorMessage}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const copyToClipboard = async () => {
        if (!jsonOutput) {
            toast.error('복사할 내용이 없습니다.');
            return;
        }

        try {
            await navigator.clipboard.writeText(jsonOutput);
            toast.success('클립보드에 복사되었습니다!');
        } catch {
            toast.error('클립보드 복사에 실패했습니다.');
        }
    };

    const downloadJson = () => {
        if (!jsonOutput) {
            toast.error('다운로드할 내용이 없습니다.');
            return;
        }

        const blob = new Blob([jsonOutput], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formatted.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('JSON 파일이 다운로드되었습니다!');
    };

    return (
        <div className='container mx-auto p-6 max-w-7xl'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <FileCheck className='h-5 w-5' />
                        JSON 포매터 & 검증기
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between'>
                                <h3 className='text-sm font-medium'>JSON 입력</h3>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = '.json';
                                        input.onchange = (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (e) => {
                                                    setJsonInput(e.target?.result as string);
                                                };
                                                reader.readAsText(file);
                                            }
                                        };
                                        input.click();
                                    }}
                                >
                                    <Upload className='h-4 w-4 mr-2' />
                                    파일 업로드
                                </Button>
                            </div>
                            <Textarea
                                placeholder='JSON 데이터를 입력하세요...'
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                className='min-h-[400px] font-mono text-sm'
                            />
                            <div className='flex gap-2'>
                                <Button onClick={formatJson} disabled={isProcessing} className='flex-1'>
                                    <ButtonLoading isLoading={isProcessing}>포매팅</ButtonLoading>
                                </Button>
                                <Button
                                    onClick={minifyJson}
                                    disabled={isProcessing}
                                    variant='outline'
                                    className='flex-1'
                                >
                                    <ButtonLoading isLoading={isProcessing}>압축</ButtonLoading>
                                </Button>
                            </div>
                        </div>

                        <div className='space-y-4'>
                            <div className='flex items-center justify-between'>
                                <h3 className='text-sm font-medium'>결과</h3>
                                <div className='flex gap-2'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={copyToClipboard}
                                        disabled={!jsonOutput}
                                    >
                                        <Copy className='h-4 w-4 mr-2' />
                                        복사
                                    </Button>
                                    <Button variant='outline' size='sm' onClick={downloadJson} disabled={!jsonOutput}>
                                        <Download className='h-4 w-4 mr-2' />
                                        다운로드
                                    </Button>
                                </div>
                            </div>
                            <Textarea
                                readOnly
                                value={jsonOutput}
                                placeholder='포매팅된 JSON이 여기에 표시됩니다...'
                                className='min-h-[400px] font-mono text-sm bg-muted'
                            />
                            {error && (
                                <div className='p-3 bg-destructive/10 border border-destructive/20 rounded-md'>
                                    <p className='text-sm text-destructive font-medium'>오류:</p>
                                    <p className='text-sm text-destructive/80'>{error}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
