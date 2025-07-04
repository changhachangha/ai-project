'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, BarChart3, FileText, Clock, Eye, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface TextStats {
    characters: number;
    charactersNoSpaces: number;
    words: number;
    sentences: number;
    paragraphs: number;
    lines: number;
    readingTime: number;
    speakingTime: number;
    mostCommonWords: Array<{ word: string; count: number }>;
}

const TextAnalyzerClient = memo(() => {
    const [text, setText] = useState('');

    const stats = useMemo((): TextStats => {
        if (!text.trim()) {
            return {
                characters: 0,
                charactersNoSpaces: 0,
                words: 0,
                sentences: 0,
                paragraphs: 0,
                lines: 0,
                readingTime: 0,
                speakingTime: 0,
                mostCommonWords: [],
            };
        }

        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, '').length;
        const words = text
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length;
        const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
        const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
        const lines = text.split('\n').length;

        // 읽기 시간 (평균 200 단어/분)
        const readingTime = Math.ceil(words / 200);

        // 말하기 시간 (평균 150 단어/분)
        const speakingTime = Math.ceil(words / 150);

        // 가장 많이 사용된 단어들
        const wordFreq: Record<string, number> = {};
        const cleanWords = text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter((word) => word.length > 2); // 2글자 이하 제외

        cleanWords.forEach((word) => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });

        const mostCommonWords = Object.entries(wordFreq)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));

        return {
            characters,
            charactersNoSpaces,
            words,
            sentences,
            paragraphs,
            lines,
            readingTime,
            speakingTime,
            mostCommonWords,
        };
    }, [text]);

    const handleCopy = useCallback((value: string) => {
        navigator.clipboard.writeText(value).then(() => {
            toast.success('클립보드에 복사되었습니다!');
        });
    }, []);

    const loadSampleText = useCallback(() => {
        const sampleText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`;
        setText(sampleText);
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-6xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <BarChart3 className='h-8 w-8' />
                    텍스트 분석기
                </h1>
                <p className='text-muted-foreground mt-2'>텍스트의 다양한 통계 정보를 분석하고 확인하세요.</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* 텍스트 입력 */}
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg'>텍스트 입력</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <Textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder='분석할 텍스트를 입력하세요...'
                                className='min-h-[300px] text-sm'
                            />
                            <Button onClick={loadSampleText} variant='outline' className='w-full'>
                                <FileText className='h-4 w-4 mr-2' />
                                샘플 텍스트 로드
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 분석 결과 */}
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg'>분석 결과</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            {/* 기본 통계 */}
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                                        <span className='text-sm font-medium'>문자 수</span>
                                        <Badge variant='secondary'>{stats.characters.toLocaleString()}</Badge>
                                    </div>
                                    <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                                        <span className='text-sm font-medium'>공백 제외</span>
                                        <Badge variant='secondary'>{stats.charactersNoSpaces.toLocaleString()}</Badge>
                                    </div>
                                    <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                                        <span className='text-sm font-medium'>단어 수</span>
                                        <Badge variant='secondary'>{stats.words.toLocaleString()}</Badge>
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                                        <span className='text-sm font-medium'>문장 수</span>
                                        <Badge variant='secondary'>{stats.sentences.toLocaleString()}</Badge>
                                    </div>
                                    <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                                        <span className='text-sm font-medium'>문단 수</span>
                                        <Badge variant='secondary'>{stats.paragraphs.toLocaleString()}</Badge>
                                    </div>
                                    <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                                        <span className='text-sm font-medium'>줄 수</span>
                                        <Badge variant='secondary'>{stats.lines.toLocaleString()}</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* 읽기/말하기 시간 */}
                            <div className='space-y-2'>
                                <div className='flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg'>
                                    <div className='flex items-center gap-2'>
                                        <Eye className='h-4 w-4 text-blue-600' />
                                        <span className='text-sm font-medium'>읽기 시간</span>
                                    </div>
                                    <Badge variant='outline'>{stats.readingTime}분</Badge>
                                </div>
                                <div className='flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg'>
                                    <div className='flex items-center gap-2'>
                                        <Clock className='h-4 w-4 text-green-600' />
                                        <span className='text-sm font-medium'>말하기 시간</span>
                                    </div>
                                    <Badge variant='outline'>{stats.speakingTime}분</Badge>
                                </div>
                            </div>

                            {/* 빠른 복사 */}
                            <div className='grid grid-cols-2 gap-2'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => handleCopy(stats.words.toString())}
                                    disabled={!text.trim()}
                                >
                                    <Copy className='h-3 w-3 mr-1' />
                                    단어 수 복사
                                </Button>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => handleCopy(stats.characters.toString())}
                                    disabled={!text.trim()}
                                >
                                    <Copy className='h-3 w-3 mr-1' />
                                    문자 수 복사
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 단어 빈도 */}
            {stats.mostCommonWords.length > 0 && (
                <Card className='mt-6'>
                    <CardHeader>
                        <CardTitle className='text-lg flex items-center gap-2'>
                            <Hash className='h-5 w-5' />
                            자주 사용된 단어 (상위 10개)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
                            {stats.mostCommonWords.map(({ word, count }, index) => (
                                <div key={word} className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                                    <span className='text-sm font-medium truncate'>{word}</span>
                                    <Badge variant='secondary'>{count}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className='mt-6 bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>분석 정보</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>읽기 시간:</strong> 평균 읽기 속도 200 단어/분 기준
                    </p>
                    <p>
                        • <strong>말하기 시간:</strong> 평균 말하기 속도 150 단어/분 기준
                    </p>
                    <p>
                        • <strong>단어 빈도:</strong> 2글자 이하 단어는 제외하고 계산
                    </p>
                    <p>
                        • <strong>실시간 분석:</strong> 텍스트 입력 시 즉시 통계 업데이트
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

TextAnalyzerClient.displayName = 'TextAnalyzerClient';

export default TextAnalyzerClient;
