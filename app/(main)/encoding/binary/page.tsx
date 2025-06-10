'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Binary } from 'lucide-react';
import { useState } from 'react';

type BaseType = '2' | '8' | '10' | '16';

const baseLabels: Record<BaseType, string> = {
    '2': '2진수',
    '8': '8진수',
    '10': '10진수',
    '16': '16진수',
};

export default function BinaryTool() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [fromBase, setFromBase] = useState<BaseType>('10');
    const [toBase, setToBase] = useState<BaseType>('2');

    const handleConvert = () => {
        try {
            // 입력값을 10진수로 변환
            const decimal = parseInt(input, parseInt(fromBase));
            if (isNaN(decimal)) {
                throw new Error('Invalid number');
            }

            // 목표 진수로 변환
            let result = decimal.toString(parseInt(toBase));
            if (toBase === '16') {
                result = result.toUpperCase();
            }

            setOutput(result);
        } catch {
            setOutput('변환 중 오류가 발생했습니다. 유효한 숫자를 입력해주세요.');
        }
    };

    const handleClear = () => {
        setInput('');
        setOutput('');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#607D8B20' }}
                >
                    <Binary className="w-6 h-6" style={{ color: '#607D8B' }} />
                </div>
                <h1 className="text-3xl font-bold">진수 변환기</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                                <Select value={fromBase} onValueChange={(value: BaseType) => setFromBase(value)}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="From" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(baseLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <span>→</span>
                                <Select value={toBase} onValueChange={(value: BaseType) => setToBase(value)}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="To" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(baseLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="outline" onClick={handleClear}>
                                초기화
                            </Button>
                        </div>
                        <Textarea
                            placeholder={`${baseLabels[fromBase]}로 된 숫자를 입력하세요...`}
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                            className="min-h-[200px] mb-4 font-mono"
                        />
                        <Button className="w-full" onClick={handleConvert}>
                            변환
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">결과 ({baseLabels[toBase]})</h2>
                            <Button variant="outline" onClick={handleCopy}>
                                복사
                            </Button>
                        </div>
                        <Textarea value={output} readOnly className="min-h-[200px] font-mono" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
