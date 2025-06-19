'use client';

import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useMemo } from 'react';
import { marked } from 'marked';

export default function ClientMarkdownEditor() {
    const [markdown, setMarkdown] = useState('# 안녕하세요!\n\n이곳에 마크다운을 작성해보세요.');

    const renderedHtml = useMemo(() => {
        try {
            return marked.parse(markdown) as string;
        } catch {
            return '<p><strong>marked</strong> 라이브러리를 설치해주세요: <code>npm install marked</code></p>';
        }
    }, [markdown]);

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 h-[calc(100vh-200px)]'>
            <div className='flex flex-col'>
                <h2 className='text-lg font-semibold mb-2'>Markdown 입력</h2>
                <Textarea
                    placeholder='마크다운을 입력하세요...'
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    className='flex-grow font-mono resize-none'
                />
            </div>
            <div className='flex flex-col'>
                <h2 className='text-lg font-semibold mb-2'>미리보기</h2>
                <Card className='flex-grow overflow-auto'>
                    <CardContent className='p-6'>
                        <div
                            className='prose dark:prose-invert max-w-none'
                            dangerouslySetInnerHTML={{ __html: renderedHtml }}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
