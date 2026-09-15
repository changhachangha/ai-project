'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useEncoding } from '@/hooks/useEncoding';
import { processEncode, processDecode } from '@/lib/tools/encode';

// lib 결과를 (string)=>string 형태로 어댑트 — errorMessage 는 throw 로 변환.
const encodeHtml = (text: string): string => {
    const result = processEncode({ text, encodingType: 'html' });
    if (result.errorMessage) throw new Error(result.errorMessage);
    return result.encodedText;
};

const decodeHtml = (text: string): string => {
    const result = processDecode({ text, encodingType: 'html' });
    if (result.errorMessage) throw new Error(result.errorMessage);
    return result.decodedText;
};

export default function HtmlTool() {
    const { input, setInput, output, mode, setMode, handleEncode, handleDecode, handleClear, handleCopy } =
        useEncoding({ encodeFn: encodeHtml, decodeFn: decodeHtml, defaultOutput: '' });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="space-x-2">
                                <Button
                                    variant={mode === 'encode' ? 'default' : 'outline'}
                                    onClick={() => setMode('encode')}
                                >
                                    인코딩
                                </Button>
                                <Button
                                    variant={mode === 'decode' ? 'default' : 'outline'}
                                    onClick={() => setMode('decode')}
                                >
                                    디코딩
                                </Button>
                            </div>
                            <Button variant="outline" onClick={handleClear}>
                                초기화
                            </Button>
                        </div>
                        <Textarea
                            placeholder={
                                mode === 'encode'
                                    ? 'HTML 인코딩할 텍스트를 입력하세요...'
                                    : 'HTML 디코딩할 문자열을 입력하세요...'
                            }
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                            className="min-h-[200px] mb-4 font-mono"
                        />
                        <Button className="w-full" onClick={mode === 'encode' ? handleEncode : handleDecode}>
                            {mode === 'encode' ? '인코딩' : '디코딩'}
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
