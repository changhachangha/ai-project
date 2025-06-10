'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export default function CsvJsonConverterTool() {
    const [csv, setCsv] = useState('id,name,age\n1,Alice,30\n2,Bob,25');
    const [json, setJson] = useState('');
    const [error, setError] = useState('');

    const convertCsvToJson = () => {
        setError('');
        try {
            const lines = csv.trim().split('\n');
            const headers = lines[0].split(',').map((h) => h.trim());
            const result = lines.slice(1).map((line) => {
                const data = line.split(',');
                return headers.reduce((obj, nextKey, index) => {
                    obj[nextKey] = data[index].trim();
                    return obj;
                }, {} as Record<string, string>);
            });
            setJson(JSON.stringify(result, null, 2));
        } catch {
            // --- 수정: 사용하지 않는 변수 'e' 제거 ---
            setError('CSV를 JSON으로 변환하는 중 오류가 발생했습니다.');
        }
    };

    const convertJsonToCsv = () => {
        setError('');
        try {
            const data = JSON.parse(json);
            if (!Array.isArray(data) || data.length === 0) {
                setError('유효한 JSON 배열이 아닙니다.');
                return;
            }
            const headers = Object.keys(data[0]);
            let result = headers.join(',') + '\n';
            result += data.map((row) => headers.map((header) => row[header]).join(',')).join('\n');
            setCsv(result);
        } catch {
            // --- 수정: 사용하지 않는 변수 'e' 제거 ---
            setError('JSON을 CSV로 변환하는 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-lg font-semibold mb-2">CSV</h2>
                        <Textarea
                            placeholder="CSV 데이터를 입력하세요..."
                            value={csv}
                            onChange={(e) => setCsv(e.target.value)}
                            className="min-h-[250px] font-mono"
                        />
                        <Button onClick={convertCsvToJson} className="w-full mt-4">
                            JSON으로 변환 →
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-lg font-semibold mb-2">JSON</h2>
                        <Textarea
                            placeholder="JSON 데이터를 입력하세요..."
                            value={json}
                            onChange={(e) => setJson(e.target.value)}
                            className="min-h-[250px] font-mono"
                        />
                        <Button onClick={convertJsonToCsv} className="w-full mt-4">
                            ← CSV로 변환
                        </Button>
                    </CardContent>
                </Card>
            </div>
            {error && (
                <Card className="border-destructive">
                    <CardContent className="p-4 text-destructive">{error}</CardContent>
                </Card>
            )}
        </div>
    );
}
