'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, Copy } from 'lucide-react';
import { toast } from 'sonner';

const APITesterClient = memo(() => {
    const [method, setMethod] = useState('GET');
    const [url, setUrl] = useState('');
    const [headers, setHeaders] = useState('');
    const [body, setBody] = useState('');
    const [response, setResponse] = useState('');
    const [statusCode, setStatusCode] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const sendRequest = useCallback(async () => {
        if (!url.trim()) {
            toast.error('URL을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            // 실제 환경에서는 fetch API를 사용
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const mockResponse = {
                status: 200,
                data: {
                    message: 'API 테스트 성공',
                    timestamp: new Date().toISOString(),
                    method: method,
                    url: url,
                },
            };

            setStatusCode(mockResponse.status);
            setResponse(JSON.stringify(mockResponse.data, null, 2));
            toast.success('API 요청이 완료되었습니다!');
        } catch {
            setStatusCode(500);
            setResponse('API 요청에 실패했습니다.');
            toast.error('API 요청에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [method, url]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(response).then(() => {
            toast.success('응답이 클립보드에 복사되었습니다!');
        });
    }, [response]);

    return (
        <div className='container mx-auto p-4 max-w-6xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Send className='h-8 w-8' />
                    API 테스터
                </h1>
                <p className='text-muted-foreground mt-2'>RESTful API 요청을 테스트하고 응답을 확인합니다.</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>요청 설정</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div className='flex gap-2'>
                                <Select value={method} onValueChange={setMethod}>
                                    <SelectTrigger className='w-32'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='GET'>GET</SelectItem>
                                        <SelectItem value='POST'>POST</SelectItem>
                                        <SelectItem value='PUT'>PUT</SelectItem>
                                        <SelectItem value='DELETE'>DELETE</SelectItem>
                                        <SelectItem value='PATCH'>PATCH</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder='https://api.example.com/users'
                                    className='flex-1'
                                />
                            </div>

                            <div>
                                <Label htmlFor='headers'>헤더 (JSON 형식)</Label>
                                <Textarea
                                    id='headers'
                                    value={headers}
                                    onChange={(e) => setHeaders(e.target.value)}
                                    placeholder='{"Content-Type": "application/json"}'
                                    className='mt-1 font-mono text-sm'
                                    rows={3}
                                />
                            </div>

                            {method !== 'GET' && (
                                <div>
                                    <Label htmlFor='body'>요청 본문</Label>
                                    <Textarea
                                        id='body'
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        placeholder='{"name": "John", "email": "john@example.com"}'
                                        className='mt-1 font-mono text-sm'
                                        rows={6}
                                    />
                                </div>
                            )}

                            <Button onClick={sendRequest} disabled={!url.trim() || isLoading} className='w-full'>
                                <Send className='h-4 w-4 mr-2' />
                                {isLoading ? '요청 중...' : '요청 보내기'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='flex items-center gap-2'>
                                응답
                                {statusCode && (
                                    <Badge variant={statusCode >= 200 && statusCode < 300 ? 'default' : 'destructive'}>
                                        {statusCode}
                                    </Badge>
                                )}
                            </CardTitle>
                            <Button variant='outline' size='sm' onClick={handleCopy} disabled={!response}>
                                <Copy className='h-4 w-4 mr-1' />
                                복사
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={response}
                            readOnly
                            placeholder='API 응답이 여기에 표시됩니다...'
                            className='min-h-[400px] font-mono text-sm'
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
});

APITesterClient.displayName = 'APITesterClient';

export default APITesterClient;
