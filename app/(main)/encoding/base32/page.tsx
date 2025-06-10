'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useEncoding } from '@/hooks/useEncoding';
// --- 수정: 'rfc4648' 라이브러리에서 base32 객체를 import ---
import { base32 } from 'rfc4648';

export default function Base32Tool() {
    const {
        input,
        setInput,
        output,
        mode,
        setMode,
        handleEncode,
        handleDecode,
        handleClear,
        handleCopy,
        swapInputOutput,
    } = useEncoding({
        // --- 수정: rfc4648 라이브러리의 API에 맞게 로직 변경 ---
        encodeFn: (text) => {
            const textAsBytes = new TextEncoder().encode(text);
            // rfc4648의 stringify 메소드를 사용하여 인코딩
            return base32.stringify(textAsBytes, { pad: false });
        },
        decodeFn: (base32String) => {
            // rfc4648의 parse 메소드를 사용하여 디코딩
            const bytes = base32.parse(base32String);
            return new TextDecoder().decode(bytes);
        },
    });

    const handleModeChange = (newMode: 'encode' | 'decode') => {
        if (mode !== newMode) {
            swapInputOutput(); // 모드가 변경될 때만 값 교환
            setMode(newMode);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="space-x-2">
                                <Button
                                    variant={mode === 'encode' ? 'default' : 'outline'}
                                    onClick={() => handleModeChange('encode')}
                                >
                                    인코딩
                                </Button>
                                <Button
                                    variant={mode === 'decode' ? 'default' : 'outline'}
                                    onClick={() => handleModeChange('decode')}
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
                                    ? '인코딩할 텍스트를 입력하세요...'
                                    : '디코딩할 Base32 문자열을 입력하세요...'
                            }
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="min-h-[200px] mb-4"
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
                        <Textarea value={output} readOnly className="min-h-[200px]" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
