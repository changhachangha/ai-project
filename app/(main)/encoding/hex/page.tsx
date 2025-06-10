'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Hash } from 'lucide-react';
import { useState } from 'react';

export default function HexTool() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');

    const handleEncode = () => {
        try {
            const encoded = Array.from(input)
                .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('');
            setOutput(encoded.toUpperCase());
        } catch {
            setOutput('인코딩 중 오류가 발생했습니다. 유효한 텍스트를 입력해주세요.');
        }
    };

    const handleDecode = () => {
        try {
            const cleanHex = input.replace(/\s+/g, '');
            if (!/^[0-9A-Fa-f]*$/.test(cleanHex)) {
                throw new Error('Invalid hex string');
            }
            const decoded =
                cleanHex
                    .match(/.{1,2}/g)
                    ?.map((byte) => String.fromCharCode(parseInt(byte, 16)))
                    .join('') || '';
            setOutput(decoded);
        } catch {
            setOutput('디코딩 중 오류가 발생했습니다. 유효한 16진수 문자열을 입력해주세요.');
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
                    style={{ backgroundColor: '#9C27B020' }}
                >
                    <Hash className="w-6 h-6" style={{ color: '#9C27B0' }} />
                </div>
                <h1 className="text-3xl font-bold">Hex(Base16) 변환기</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="space-x-2">
                                <Button
                                    variant={mode === 'encode' ? 'default' : 'outline'}
                                    onClick={() => setMode('encode')}
                                >
                                    텍스트 → Hex
                                </Button>
                                <Button
                                    variant={mode === 'decode' ? 'default' : 'outline'}
                                    onClick={() => setMode('decode')}
                                >
                                    Hex → 텍스트
                                </Button>
                            </div>
                            <Button variant="outline" onClick={handleClear}>
                                초기화
                            </Button>
                        </div>
                        <Textarea
                            placeholder={
                                mode === 'encode'
                                    ? '16진수로 변환할 텍스트를 입력하세요...'
                                    : '텍스트로 변환할 16진수를 입력하세요...'
                            }
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                            className="min-h-[200px] mb-4 font-mono"
                        />
                        <Button className="w-full" onClick={mode === 'encode' ? handleEncode : handleDecode}>
                            변환
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">결과</h2>
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
