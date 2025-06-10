'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useEncoding } from '@/hooks/useEncoding';
import { FileCode, Upload } from 'lucide-react';
// --- 수정: useRef를 추가로 import 합니다 ---
import React, { useRef } from 'react';

export default function Base64Tool() {
    // --- 수정: file input을 참조하기 위한 ref 생성 ---
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        input,
        setInput,
        output,
        setOutput, // 이제 이 함수를 정상적으로 사용할 수 있습니다.
        mode,
        setMode,
        handleEncode,
        handleDecode,
        handleClear,
        handleCopy,
    } = useEncoding({
        encodeFn: (text) => btoa(unescape(encodeURIComponent(text))),
        decodeFn: (base64) => decodeURIComponent(escape(atob(base64))),
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                const base64Data = result.split(',')[1];
                setOutput(base64Data);
                setInput(`파일: ${file.name} (${Math.round(file.size / 1024)} KB)`);
                setMode('encode');
            }
        };
        reader.onerror = () => {
            setOutput('파일을 읽는 중 오류가 발생했습니다.');
        };
        reader.readAsDataURL(file);
    };

    const customClear = () => {
        handleClear();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // --- 추가: 버튼 클릭 시 파일 입력을 트리거하는 함수 ---
    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#4CAF5020' }}
                >
                    <FileCode className="w-6 h-6" style={{ color: '#4CAF50' }} />
                </div>
                <h1 className="text-3xl font-bold">Base64 인코더/디코더</h1>
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
                                    인코딩
                                </Button>
                                <Button
                                    variant={mode === 'decode' ? 'default' : 'outline'}
                                    onClick={() => setMode('decode')}
                                >
                                    디코딩
                                </Button>
                            </div>
                            <Button variant="outline" onClick={customClear}>
                                초기화
                            </Button>
                        </div>
                        <Textarea
                            placeholder={
                                mode === 'encode'
                                    ? '인코딩할 텍스트를 입력하거나 파일을 업로드하세요...'
                                    : '디코딩할 Base64 문자열을 입력하세요...'
                            }
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="min-h-[200px] mb-4"
                        />
                        <div className="flex w-full gap-2">
                            <Button className="flex-1" onClick={mode === 'encode' ? handleEncode : handleDecode}>
                                {mode === 'encode' ? '텍스트 인코딩' : '디코딩'}
                            </Button>

                            {/* --- 수정된 부분: asChild와 label을 사용하지 않고 일반 버튼으로 변경 --- */}
                            <Button variant="outline" className="flex-1" onClick={handleUploadButtonClick}>
                                <Upload className="mr-2 h-4 w-4" /> 파일 업로드
                            </Button>
                        </div>
                        {/* --- 추가: 숨겨진 파일 입력 필드 --- */}
                        <input
                            id="file-upload"
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />
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
