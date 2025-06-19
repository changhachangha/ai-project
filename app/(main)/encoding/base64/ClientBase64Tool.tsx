'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useEncoding } from '@/hooks/useEncoding';
import { Upload } from 'lucide-react';
import React, { useRef } from 'react';
import { encodeBase64, decodeBase64, handleFileChangeLogic } from './Base64Logic';

export default function ClientBase64Tool() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { input, setInput, output, setOutput, mode, setMode, handleEncode, handleDecode, handleClear, handleCopy } =
        useEncoding({
            encodeFn: encodeBase64,
            decodeFn: decodeBase64,
        });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFileChangeLogic(event, setOutput, setInput, setMode);
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
