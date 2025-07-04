'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, ArrowUpDown, Monitor, Apple, HardDrive } from 'lucide-react';
import { toast } from 'sonner';

type LineBreakType = 'unix' | 'windows' | 'mac';

const LineBreakConverterClient = memo(() => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [targetFormat, setTargetFormat] = useState<LineBreakType>('unix');

    const detectLineBreaks = useCallback((text: string) => {
        const hasWindows = text.includes('\r\n');
        const hasMac = text.includes('\r') && !text.includes('\r\n');
        const hasUnix = text.includes('\n') && !text.includes('\r\n');

        if (hasWindows) return 'Windows (CRLF)';
        if (hasMac) return 'Mac (CR)';
        if (hasUnix) return 'Unix/Linux (LF)';
        return '줄바꿈 없음';
    }, []);

    const convertLineBreaks = useCallback(() => {
        if (!inputText.trim()) {
            setOutputText('');
            return;
        }

        let converted = inputText;

        // 먼저 모든 줄바꿈을 통일
        converted = converted.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // 목표 형식으로 변환
        switch (targetFormat) {
            case 'windows':
                converted = converted.replace(/\n/g, '\r\n');
                break;
            case 'mac':
                converted = converted.replace(/\n/g, '\r');
                break;
            case 'unix':
                // 이미 \n으로 통일되어 있음
                break;
        }

        setOutputText(converted);
        toast.success('줄바꿈이 변환되었습니다!');
    }, [inputText, targetFormat]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(outputText).then(() => {
            toast.success('클립보드에 복사되었습니다!');
        });
    }, [outputText]);

    const loadSampleText = useCallback(() => {
        const sampleText = `첫 번째 줄입니다.
두 번째 줄입니다.
세 번째 줄입니다.

다섯 번째 줄입니다. (빈 줄 포함)
여섯 번째 줄입니다.`;
        setInputText(sampleText);
    }, []);

    const inputLineBreakType = detectLineBreaks(inputText);
    const lineCount = inputText.split(/\r\n|\r|\n/).length;

    return (
        <div className='container mx-auto p-4 max-w-6xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <ArrowUpDown className='h-8 w-8' />
                    줄바꿈 변환기
                </h1>
                <p className='text-muted-foreground mt-2'>Unix, Windows, Mac 간 줄바꿈 형식을 변환하세요.</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg'>텍스트 입력</CardTitle>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Badge variant='outline'>{inputLineBreakType}</Badge>
                            <span>•</span>
                            <span>{lineCount}줄</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <Textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder='변환할 텍스트를 입력하세요...'
                                className='min-h-[300px] font-mono text-sm'
                            />
                            <Button onClick={loadSampleText} variant='outline' className='w-full'>
                                샘플 텍스트 로드
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='text-lg'>변환 결과</CardTitle>
                            <Button variant='outline' size='sm' onClick={handleCopy} disabled={!outputText}>
                                <Copy className='h-4 w-4 mr-1' />
                                복사
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div className='flex items-center gap-4'>
                                <div className='flex-1'>
                                    <label className='text-sm font-medium'>변환 형식</label>
                                    <Select
                                        value={targetFormat}
                                        onValueChange={(value: LineBreakType) => setTargetFormat(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='unix'>
                                                <div className='flex items-center gap-2'>
                                                    <HardDrive className='h-4 w-4' />
                                                    Unix/Linux (LF)
                                                </div>
                                            </SelectItem>
                                            <SelectItem value='windows'>
                                                <div className='flex items-center gap-2'>
                                                    <Monitor className='h-4 w-4' />
                                                    Windows (CRLF)
                                                </div>
                                            </SelectItem>
                                            <SelectItem value='mac'>
                                                <div className='flex items-center gap-2'>
                                                    <Apple className='h-4 w-4' />
                                                    Mac (CR)
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={convertLineBreaks} disabled={!inputText.trim()}>
                                    변환
                                </Button>
                            </div>

                            <Textarea
                                value={outputText}
                                readOnly
                                placeholder='변환된 텍스트가 여기에 표시됩니다...'
                                className='min-h-[300px] font-mono text-sm'
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className='mt-6 bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>사용 방법</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>자동 감지:</strong> 입력된 텍스트의 줄바꿈 형식을 자동으로 감지
                    </p>
                    <p>
                        • <strong>형식 변환:</strong> 원하는 줄바꿈 형식으로 변환
                    </p>
                    <p>
                        • <strong>호환성:</strong> 다양한 운영체제와 에디터 간 호환성 보장
                    </p>
                    <p>
                        • <strong>안전한 변환:</strong> 기존 텍스트 내용은 변경하지 않고 줄바꿈만 변환
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

LineBreakConverterClient.displayName = 'LineBreakConverterClient';

export default LineBreakConverterClient;
