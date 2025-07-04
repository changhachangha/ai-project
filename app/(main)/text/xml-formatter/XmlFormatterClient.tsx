'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, FileX, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const XmlFormatterClient = memo(() => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [isValid, setIsValid] = useState(false);

    const formatXml = useCallback(() => {
        if (!input.trim()) {
            setOutput('');
            setError('');
            setIsValid(false);
            return;
        }

        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(input, 'text/xml');

            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('XML 파싱 오류: ' + parserError.textContent);
            }

            const serializer = new XMLSerializer();
            const formatted = serializer.serializeToString(xmlDoc);

            // 간단한 포맷팅 (들여쓰기 추가)
            const formattedXml = formatted
                .replace(/></g, '>\n<')
                .split('\n')
                .map((line) => {
                    const depth = line.match(/^<\//) ? -1 : line.match(/^<[^\/]/) ? 0 : 0;
                    return '  '.repeat(Math.max(0, depth)) + line;
                })
                .join('\n');

            setOutput(formattedXml);
            setError('');
            setIsValid(true);
            toast.success('XML이 성공적으로 포맷되었습니다!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'XML 포맷 중 오류가 발생했습니다.');
            setOutput('');
            setIsValid(false);
        }
    }, [input]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(output).then(() => {
            toast.success('클립보드에 복사되었습니다!');
        });
    }, [output]);

    const loadSample = useCallback(() => {
        const sample = `<?xml version="1.0" encoding="UTF-8"?><root><person id="1"><name>홍길동</name><age>30</age><city>서울</city></person><person id="2"><name>김철수</name><age>25</age><city>부산</city></person></root>`;
        setInput(sample);
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-6xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <FileX className='h-8 w-8' />
                    XML 포매터/검증기
                </h1>
                <p className='text-muted-foreground mt-2'>XML 데이터를 정리하고 유효성을 검사하세요.</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg'>XML 입력</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder='XML 데이터를 입력하세요...'
                                className='min-h-[400px] font-mono text-sm'
                            />
                            <div className='flex gap-2'>
                                <Button onClick={formatXml} disabled={!input.trim()}>
                                    포맷 및 검증
                                </Button>
                                <Button onClick={loadSample} variant='outline'>
                                    샘플 로드
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='text-lg flex items-center gap-2'>
                                포맷된 XML
                                {isValid && <CheckCircle className='h-5 w-5 text-green-500' />}
                            </CardTitle>
                            <Button variant='outline' size='sm' onClick={handleCopy} disabled={!output}>
                                <Copy className='h-4 w-4 mr-1' />
                                복사
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={output}
                            readOnly
                            placeholder='포맷된 XML이 여기에 표시됩니다...'
                            className='min-h-[400px] font-mono text-sm'
                        />
                    </CardContent>
                </Card>
            </div>

            {error && (
                <Alert variant='destructive' className='mt-4'>
                    <AlertTriangle className='h-4 w-4' />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
});

XmlFormatterClient.displayName = 'XmlFormatterClient';

export default XmlFormatterClient;
