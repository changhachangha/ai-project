'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const CurrencyConverterClient = memo(() => {
    const [amount, setAmount] = useState('1');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('KRW');
    const [result, setResult] = useState('');

    const currencies = [
        { code: 'USD', name: '미국 달러', rate: 1 },
        { code: 'KRW', name: '한국 원', rate: 1350 },
        { code: 'EUR', name: '유로', rate: 0.85 },
        { code: 'JPY', name: '일본 엔', rate: 110 },
        { code: 'GBP', name: '영국 파운드', rate: 0.75 },
    ];

    const convert = useCallback(() => {
        const fromRate = currencies.find((c) => c.code === fromCurrency)?.rate || 1;
        const toRate = currencies.find((c) => c.code === toCurrency)?.rate || 1;
        const usdAmount = parseFloat(amount) / fromRate;
        const convertedAmount = usdAmount * toRate;
        setResult(convertedAmount.toLocaleString('ko-KR', { maximumFractionDigits: 2 }));
        toast.success('환율이 변환되었습니다!');
    }, [amount, fromCurrency, toCurrency, currencies]);

    return (
        <div className='container mx-auto p-4 max-w-4xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <DollarSign className='h-8 w-8' />
                    통화 변환기
                </h1>
                <p className='text-muted-foreground mt-2'>실시간 환율로 다양한 통화를 변환하세요.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>통화 변환</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder='금액' />
                        <div className='grid grid-cols-2 gap-4'>
                            <Select value={fromCurrency} onValueChange={setFromCurrency}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies.map((currency) => (
                                        <SelectItem key={currency.code} value={currency.code}>
                                            {currency.code} - {currency.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={toCurrency} onValueChange={setToCurrency}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies.map((currency) => (
                                        <SelectItem key={currency.code} value={currency.code}>
                                            {currency.code} - {currency.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={convert} className='w-full'>
                            <ArrowUpDown className='h-4 w-4 mr-2' />
                            변환
                        </Button>
                        {result && (
                            <div className='text-center text-2xl font-bold'>
                                {result} {toCurrency}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

CurrencyConverterClient.displayName = 'CurrencyConverterClient';

export default CurrencyConverterClient;
