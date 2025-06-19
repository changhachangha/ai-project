'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export default function ClientCsvJsonConverterTool() {
    const [csv, setCsv] = useState('id,name,age\n1,Alice,30\n2,Bob,25');
    const [json, setJson] = useState('');
    const [error, setError] = useState('');

    const convertCsvToJson = () => {
        setError('');
        if (typeof window === 'undefined') {
            return;
        }
        try {
            if (!csv.trim()) {
                setError('CSV 입력이 비어 있습니다. 유효한 CSV 데이터를 입력해주세요.');
                return;
            }

            const lines = csv.trim().split('\n');
            if (lines.length === 0) {
                setError('CSV 입력에 유효한 데이터가 없습니다.');
                return;
            }

            const headers = lines[0].split(',').map((h) => h.trim());
            if (headers.some((h) => h === '')) {
                setError('CSV 헤더에 빈 값이 포함되어 있습니다. 모든 헤더에 유효한 이름을 지정해주세요.');
                return;
            }

            const result = lines.slice(1).map((line, lineIndex) => {
                const data = line.split(',');
                if (data.length !== headers.length) {
                    setError(`CSV 데이터의 ${lineIndex + 2}번째 줄에 헤더와 열의 개수가 일치하지 않습니다.`);
                    throw new Error('Data mismatch'); // Early exit to prevent further processing
                }
                return headers.reduce((obj, nextKey, index) => {
                    obj[nextKey] = data[index].trim();
                    return obj;
                }, {} as Record<string, string>);
            });
            setJson(JSON.stringify(result, null, 2));
        } catch (e: unknown) {
            if (e instanceof Error && e.message === 'Data mismatch') {
                // Specific error already set
            } else {
                setError('CSV를 JSON으로 변환하는 중 알 수 없는 오류가 발생했습니다. CSV 형식을 확인해주세요.');
            }
        }
    };

    const convertJsonToCsv = () => {
        setError('');
        if (typeof window === 'undefined') {
            return;
        }
        try {
            const data = JSON.parse(json);
            if (!Array.isArray(data)) {
                setError('JSON 입력이 유효한 배열이 아닙니다.');
                return;
            }
            if (data.length === 0) {
                setError('JSON 배열이 비어 있습니다. 변환할 데이터가 없습니다.');
                return;
            }

            const headers = Object.keys(data[0]);
            let result = headers.join(',') + '\n';
            result += data
                .map((row) =>
                    headers
                        .map((header) => {
                            // Ensure all rows have the same keys as the first row's headers
                            if (row[header] === undefined) {
                                throw new Error(`JSON 데이터에 일치하지 않는 키가 있습니다: '${header}'`);
                            }
                            return row[header];
                        })
                        .join(',')
                )
                .join('\n');
            setCsv(result);
        } catch (e: unknown) {
            if (e instanceof SyntaxError) {
                setError('JSON 구문 오류가 발생했습니다. 유효한 JSON 형식을 입력해주세요.');
            } else if (e instanceof Error && e.message.includes('JSON 데이터에 일치하지 않는 키가 있습니다')) {
                setError(e.message);
            } else {
                setError('JSON을 CSV로 변환하는 중 알 수 없는 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div className='space-y-4'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-start'>
                <Card>
                    <CardContent className='p-6'>
                        <h2 className='text-lg font-semibold mb-2'>CSV</h2>
                        <Textarea
                            placeholder='CSV 데이터를 입력하세요...'
                            value={csv}
                            onChange={(e) => setCsv(e.target.value)}
                            className='min-h-[250px] font-mono'
                        />
                        <Button onClick={convertCsvToJson} className='w-full mt-4'>
                            JSON으로 변환 →
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='p-6'>
                        <h2 className='text-lg font-semibold mb-2'>JSON</h2>
                        <Textarea
                            placeholder='JSON 데이터를 입력하세요...'
                            value={json}
                            onChange={(e) => setJson(e.target.value)}
                            className='min-h-[250px] font-mono'
                        />
                        <Button onClick={convertJsonToCsv} className='w-full mt-4'>
                            ← CSV로 변환
                        </Button>
                    </CardContent>
                </Card>
            </div>
            {error && (
                <Card className='border-destructive'>
                    <CardContent className='p-4 text-destructive'>{error}</CardContent>
                </Card>
            )}
        </div>
    );
}
