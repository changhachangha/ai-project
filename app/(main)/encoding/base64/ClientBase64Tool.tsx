'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useEncoding } from '@/hooks/useEncoding';
import { processEncode, processDecode } from '@/lib/tools/encode';
import { Upload } from 'lucide-react';
import React, { useRef } from 'react';

// useEncoding 은 (string)=>string 형태를 원하므로 lib 결과를 어댑트한다.
// errorMessage 가 있으면 던져서 훅의 오류 메시지 경로를 탄다.
const encodeBase64 = (text: string): string => {
    const result = processEncode({ text, encodingType: 'base64' });
    if (result.errorMessage) throw new Error(result.errorMessage);
    return result.encodedText;
};

const decodeBase64 = (text: string): string => {
    const result = processDecode({ text, encodingType: 'base64' });
    if (result.errorMessage) throw new Error(result.errorMessage);
    return result.decodedText;
};

export default function ClientBase64Tool() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { input, setInput, output, setOutput, mode, setMode, handleEncode, handleDecode, handleClear, handleCopy } =
        useEncoding({
            encodeFn: encodeBase64,
            decodeFn: decodeBase64,
        });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                setOutput(result.split(',')[1]);
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

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className='container mx-auto px-4 py-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <Card>
                    <CardContent className='p-6'>
                        <div className='flex justify-between items-center mb-4'>
                            <div className='space-x-2'>
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
                            <Button variant='outline' onClick={customClear}>
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
                            className='min-h-[200px] mb-4'
                        />
                        <div className='flex w-full gap-2'>
                            <Button className='flex-1' onClick={mode === 'encode' ? handleEncode : handleDecode}>
                                {mode === 'encode' ? '텍스트 인코딩' : '디코딩'}
                            </Button>

                            <Button variant='outline' className='flex-1' onClick={handleUploadButtonClick}>
                                <Upload className='mr-2 h-4 w-4' /> 파일 업로드
                            </Button>
                        </div>
                        <input
                            id='file-upload'
                            type='file'
                            ref={fileInputRef}
                            className='hidden'
                            onChange={handleFileChange}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className='p-6'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-lg font-semibold'>결과</h2>
                            <Button variant='outline' onClick={handleCopy}>
                                복사
                            </Button>
                        </div>
                        <Textarea value={output} readOnly className='min-h-[200px]' />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
