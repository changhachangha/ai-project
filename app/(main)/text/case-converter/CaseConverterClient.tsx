'use client';

import { memo, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Type } from 'lucide-react';
import { toast } from 'sonner';
import { convertAllCases } from '@/lib/tools/case';

const CaseConverterClient = memo(() => {
    const [inputText, setInputText] = useState('');

    const results = useMemo(() => convertAllCases(inputText), [inputText]);

    const handleCopy = async (value: string, label: string) => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} 복사됨`);
        } catch {
            toast.error('클립보드 복사에 실패했습니다.');
        }
    };

    const hasInput = inputText.trim().length > 0;

    return (
        <div className='container mx-auto py-8 px-4'>
            <div className='flex items-center gap-3 mb-2'>
                <Type className='h-7 w-7' />
                <h1 className='text-3xl font-bold'>텍스트 케이스 변환기</h1>
            </div>
            <p className='text-muted-foreground mb-8'>
                camelCase, snake_case, kebab-case 등 9가지 표기법으로 한 번에 변환합니다.
            </p>

            <Card className='mb-6'>
                <CardHeader>
                    <CardTitle>입력</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        className='min-h-[120px] font-mono text-sm'
                        placeholder='예: myVariableName, my_variable_name, My Variable Name ...'
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        aria-label='변환할 텍스트'
                    />
                    <div className='mt-2 text-xs text-muted-foreground'>
                        공백 · 밑줄 · 하이픈 · 점 · camelCase 를 단어 경계로 인식합니다.
                    </div>
                </CardContent>
            </Card>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {results.map((result) => (
                    <Card key={result.type}>
                        <CardHeader className='pb-3'>
                            <CardTitle className='text-sm font-medium text-muted-foreground'>
                                {result.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='flex items-center gap-2'>
                                <code className='flex-1 break-all rounded bg-muted px-2 py-1 font-mono text-sm min-h-[32px]'>
                                    {result.value || '-'}
                                </code>
                                <Button
                                    size='icon'
                                    variant='ghost'
                                    disabled={!hasInput}
                                    onClick={() => handleCopy(result.value, result.label)}
                                    aria-label={`${result.label} 복사`}
                                >
                                    <Copy className='h-4 w-4' />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
});

CaseConverterClient.displayName = 'CaseConverterClient';

export default CaseConverterClient;
