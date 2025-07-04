'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Copy, RotateCcw, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';

const CaesarCipherClient = memo(() => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [shift, setShift] = useState(13);

    const caesarCipher = useCallback((text: string, shift: number, decode = false) => {
        if (decode) shift = -shift;

        return text
            .split('')
            .map((char) => {
                if (char.match(/[a-zA-Z]/)) {
                    const code = char.charCodeAt(0);
                    const base = code >= 65 && code <= 90 ? 65 : 97;
                    return String.fromCharCode(((code - base + shift + 26) % 26) + base);
                }
                return char;
            })
            .join('');
    }, []);

    const handleEncode = useCallback(() => {
        const result = caesarCipher(inputText, shift);
        setOutputText(result);
        toast.success('텍스트가 암호화되었습니다!');
    }, [inputText, shift, caesarCipher]);

    const handleDecode = useCallback(() => {
        const result = caesarCipher(inputText, shift, true);
        setOutputText(result);
        toast.success('텍스트가 복호화되었습니다!');
    }, [inputText, shift, caesarCipher]);

    const handleROT13 = useCallback(() => {
        const result = caesarCipher(inputText, 13);
        setOutputText(result);
        toast.success('ROT13 변환이 완료되었습니다!');
    }, [inputText, caesarCipher]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(outputText).then(() => {
            toast.success('클립보드에 복사되었습니다!');
        });
    }, [outputText]);

    const loadSample = useCallback(() => {
        setInputText('Hello World! This is a Caesar cipher test.');
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-4xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <RotateCcw className='h-8 w-8' />
                    ROT13/Caesar 암호
                </h1>
                <p className='text-muted-foreground mt-2'>
                    고전 암호 알고리즘을 사용하여 텍스트를 암호화/복호화하세요.
                </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg'>텍스트 입력</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <Textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder='암호화할 텍스트를 입력하세요...'
                                className='min-h-[200px]'
                            />
                            <div className='space-y-2'>
                                <Label htmlFor='shift'>이동 값 (Shift)</Label>
                                <Input
                                    id='shift'
                                    type='number'
                                    value={shift}
                                    onChange={(e) => setShift(parseInt(e.target.value) || 0)}
                                    min='0'
                                    max='25'
                                />
                            </div>
                            <div className='flex gap-2'>
                                <Button onClick={handleEncode} disabled={!inputText.trim()}>
                                    <ArrowLeftRight className='h-4 w-4 mr-2' />
                                    암호화
                                </Button>
                                <Button onClick={handleDecode} disabled={!inputText.trim()} variant='outline'>
                                    복호화
                                </Button>
                                <Button onClick={handleROT13} disabled={!inputText.trim()} variant='outline'>
                                    ROT13
                                </Button>
                            </div>
                            <Button onClick={loadSample} variant='outline' className='w-full'>
                                샘플 로드
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='text-lg'>결과</CardTitle>
                            <Button variant='outline' size='sm' onClick={handleCopy} disabled={!outputText}>
                                <Copy className='h-4 w-4 mr-1' />
                                복사
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={outputText}
                            readOnly
                            placeholder='암호화/복호화된 텍스트가 여기에 표시됩니다...'
                            className='min-h-[200px]'
                        />
                    </CardContent>
                </Card>
            </div>

            <Card className='mt-6 bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>암호 알고리즘 정보</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>Caesar 암호:</strong> 알파벳을 일정한 거리만큼 밀어서 다른 알파벳으로 바꾸는 암호
                    </p>
                    <p>
                        • <strong>ROT13:</strong> 13글자씩 이동하는 특별한 Caesar 암호 (자기 자신이 역함수)
                    </p>
                    <p>
                        • <strong>이동 값:</strong> 0-25 사이의 값으로 알파벳 이동 거리 설정
                    </p>
                    <p>
                        • <strong>대소문자 구분:</strong> 대문자와 소문자를 각각 처리
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

CaesarCipherClient.displayName = 'CaesarCipherClient';

export default CaesarCipherClient;
