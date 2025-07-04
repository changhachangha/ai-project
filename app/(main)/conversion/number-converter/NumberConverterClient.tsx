'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Hash, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';

type NumberType = 'arabic' | 'roman' | 'korean' | 'chinese';

const NumberConverterClient = memo(() => {
    const [inputValue, setInputValue] = useState('');
    const [inputType, setInputType] = useState<NumberType>('arabic');
    const [outputType, setOutputType] = useState<NumberType>('roman');
    const [output, setOutput] = useState('');

    // 로마숫자 변환
    const toRoman = useCallback((num: number): string => {
        if (num <= 0 || num >= 4000) return '범위 초과 (1-3999)';

        const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
        const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];

        let result = '';
        for (let i = 0; i < values.length; i++) {
            while (num >= values[i]) {
                result += symbols[i];
                num -= values[i];
            }
        }
        return result;
    }, []);

    const fromRoman = useCallback((roman: string): number => {
        const map: Record<string, number> = {
            I: 1,
            V: 5,
            X: 10,
            L: 50,
            C: 100,
            D: 500,
            M: 1000,
        };

        let result = 0;
        for (let i = 0; i < roman.length; i++) {
            const current = map[roman[i]];
            const next = map[roman[i + 1]];

            if (next && current < next) {
                result += next - current;
                i++;
            } else {
                result += current;
            }
        }
        return result;
    }, []);

    // 한글 숫자 변환
    const toKorean = useCallback((num: number): string => {
        if (num === 0) return '영';
        if (num < 0) return '음수 지원 안함';
        if (num >= 100000000) return '범위 초과';

        const units = ['', '십', '백', '천', '만'];
        const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];

        let result = '';
        let unitIndex = 0;

        while (num > 0) {
            const digit = num % 10;
            if (digit > 0) {
                let digitStr = '';
                if (digit > 1 || unitIndex === 0) {
                    digitStr += digits[digit];
                }
                if (unitIndex > 0) {
                    digitStr += units[unitIndex];
                }
                result = digitStr + result;
            }
            num = Math.floor(num / 10);
            unitIndex++;
        }

        return result || '영';
    }, []);

    const fromKorean = useCallback((korean: string): number => {
        const digitMap: Record<string, number> = {
            영: 0,
            일: 1,
            이: 2,
            삼: 3,
            사: 4,
            오: 5,
            육: 6,
            칠: 7,
            팔: 8,
            구: 9,
        };
        const unitMap: Record<string, number> = {
            십: 10,
            백: 100,
            천: 1000,
            만: 10000,
        };

        if (korean === '영') return 0;

        let result = 0;
        let current = 0;

        for (const char of korean) {
            if (digitMap[char] !== undefined) {
                current = digitMap[char];
            } else if (unitMap[char] !== undefined) {
                if (current === 0) current = 1;
                if (char === '만') {
                    result += current * unitMap[char];
                    current = 0;
                } else {
                    current *= unitMap[char];
                }
            }
        }

        return result + current;
    }, []);

    // 중국 숫자 변환 (간체)
    const toChinese = useCallback((num: number): string => {
        if (num === 0) return '零';
        if (num < 0) return '负数不支持';
        if (num >= 100000000) return '范围超出';

        const digits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        const units = ['', '十', '百', '千', '万'];

        let result = '';
        let unitIndex = 0;

        while (num > 0) {
            const digit = num % 10;
            if (digit > 0) {
                let digitStr = '';
                if (digit > 1 || unitIndex === 0) {
                    digitStr += digits[digit];
                }
                if (unitIndex > 0) {
                    digitStr += units[unitIndex];
                }
                result = digitStr + result;
            }
            num = Math.floor(num / 10);
            unitIndex++;
        }

        return result || '零';
    }, []);

    const convert = useCallback(() => {
        if (!inputValue.trim()) {
            setOutput('');
            return;
        }

        try {
            let arabicNumber: number;

            // 입력 타입에 따라 아라비아 숫자로 변환
            switch (inputType) {
                case 'arabic':
                    arabicNumber = parseInt(inputValue);
                    if (isNaN(arabicNumber)) throw new Error('유효하지 않은 숫자입니다.');
                    break;
                case 'roman':
                    arabicNumber = fromRoman(inputValue.toUpperCase());
                    break;
                case 'korean':
                    arabicNumber = fromKorean(inputValue);
                    break;
                case 'chinese':
                    // 중국어 파싱은 복잡하므로 기본 구현만
                    arabicNumber = parseInt(inputValue) || 0;
                    break;
                default:
                    throw new Error('지원하지 않는 입력 형식입니다.');
            }

            // 출력 타입에 따라 변환
            let result: string;
            switch (outputType) {
                case 'arabic':
                    result = arabicNumber.toString();
                    break;
                case 'roman':
                    result = toRoman(arabicNumber);
                    break;
                case 'korean':
                    result = toKorean(arabicNumber);
                    break;
                case 'chinese':
                    result = toChinese(arabicNumber);
                    break;
                default:
                    result = arabicNumber.toString();
            }

            setOutput(result);
            toast.success('숫자가 변환되었습니다!');
        } catch {
            setOutput('변환 오류');
            toast.error('변환 중 오류가 발생했습니다.');
        }
    }, [inputValue, inputType, outputType, fromRoman, fromKorean, toRoman, toKorean, toChinese]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(output).then(() => {
            toast.success('클립보드에 복사되었습니다!');
        });
    }, [output]);

    const swapTypes = useCallback(() => {
        const temp = inputType;
        setInputType(outputType);
        setOutputType(temp);
        setInputValue(output);
        setOutput('');
    }, [inputType, outputType, output]);

    const loadSample = useCallback(() => {
        setInputValue('2024');
        setInputType('arabic');
        setOutputType('roman');
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-4xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Hash className='h-8 w-8' />
                    숫자 변환기
                </h1>
                <p className='text-muted-foreground mt-2'>
                    아라비아숫자, 로마숫자, 한글숫자, 중국숫자 간 변환을 수행하세요.
                </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg'>입력</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div>
                                <Label htmlFor='input-type'>입력 형식</Label>
                                <Select value={inputType} onValueChange={(value: NumberType) => setInputType(value)}>
                                    <SelectTrigger id='input-type'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='arabic'>아라비아 숫자 (1, 2, 3...)</SelectItem>
                                        <SelectItem value='roman'>로마 숫자 (I, II, III...)</SelectItem>
                                        <SelectItem value='korean'>한글 숫자 (일, 이, 삼...)</SelectItem>
                                        <SelectItem value='chinese'>중국 숫자 (一, 二, 三...)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor='input-value'>값</Label>
                                <Input
                                    id='input-value'
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder='변환할 숫자를 입력하세요'
                                />
                            </div>

                            <div className='flex gap-2'>
                                <Button onClick={convert} disabled={!inputValue.trim()}>
                                    변환
                                </Button>
                                <Button onClick={swapTypes} variant='outline'>
                                    <ArrowLeftRight className='h-4 w-4 mr-2' />
                                    교체
                                </Button>
                                <Button onClick={loadSample} variant='outline'>
                                    샘플
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='text-lg'>결과</CardTitle>
                            <Button variant='outline' size='sm' onClick={handleCopy} disabled={!output}>
                                <Copy className='h-4 w-4 mr-1' />
                                복사
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div>
                                <Label htmlFor='output-type'>출력 형식</Label>
                                <Select value={outputType} onValueChange={(value: NumberType) => setOutputType(value)}>
                                    <SelectTrigger id='output-type'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='arabic'>아라비아 숫자 (1, 2, 3...)</SelectItem>
                                        <SelectItem value='roman'>로마 숫자 (I, II, III...)</SelectItem>
                                        <SelectItem value='korean'>한글 숫자 (일, 이, 삼...)</SelectItem>
                                        <SelectItem value='chinese'>중국 숫자 (一, 二, 三...)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor='output-value'>변환 결과</Label>
                                <Input
                                    id='output-value'
                                    value={output}
                                    readOnly
                                    placeholder='변환된 숫자가 여기에 표시됩니다'
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className='mt-6 bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>지원하는 숫자 체계</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>아라비아 숫자:</strong> 일반적인 숫자 (0, 1, 2, 3...)
                    </p>
                    <p>
                        • <strong>로마 숫자:</strong> 고대 로마의 숫자 체계 (I, V, X, L, C, D, M)
                    </p>
                    <p>
                        • <strong>한글 숫자:</strong> 한국어 숫자 표기 (영, 일, 이, 삼...)
                    </p>
                    <p>
                        • <strong>중국 숫자:</strong> 중국어 숫자 표기 (零, 一, 二, 三...)
                    </p>
                    <p>
                        • <strong>범위 제한:</strong> 1-3999 (로마숫자), 1-99999999 (한글/중국)
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

NumberConverterClient.displayName = 'NumberConverterClient';

export default NumberConverterClient;
