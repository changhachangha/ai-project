'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Ruler, ArrowLeftRight, Thermometer, Weight, Droplets } from 'lucide-react';
import { toast } from 'sonner';

type UnitCategory = 'length' | 'weight' | 'temperature' | 'volume' | 'area' | 'speed';

interface UnitConversion {
    [key: string]: {
        name: string;
        symbol: string;
        toBase: (value: number) => number;
        fromBase: (value: number) => number;
    };
}

const UnitConverterClient = memo(() => {
    const [category, setCategory] = useState<UnitCategory>('length');
    const [fromUnit, setFromUnit] = useState('');
    const [toUnit, setToUnit] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [outputValue, setOutputValue] = useState('');

    // 단위 변환 정의
    const conversions: Record<UnitCategory, UnitConversion> = {
        length: {
            mm: { name: '밀리미터', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
            cm: { name: '센티미터', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
            m: { name: '미터', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
            km: { name: '킬로미터', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
            inch: { name: '인치', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
            ft: { name: '피트', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
            yard: { name: '야드', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
            mile: { name: '마일', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
        },
        weight: {
            mg: { name: '밀리그램', symbol: 'mg', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
            g: { name: '그램', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
            kg: { name: '킬로그램', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
            ton: { name: '톤', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
            oz: { name: '온스', symbol: 'oz', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
            lb: { name: '파운드', symbol: 'lb', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
        },
        temperature: {
            celsius: { name: '섭씨', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
            fahrenheit: {
                name: '화씨',
                symbol: '°F',
                toBase: (v) => ((v - 32) * 5) / 9,
                fromBase: (v) => (v * 9) / 5 + 32,
            },
            kelvin: { name: '켈빈', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
        },
        volume: {
            ml: { name: '밀리리터', symbol: 'ml', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
            l: { name: '리터', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
            cup: { name: '컵', symbol: 'cup', toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
            pint: { name: '파인트', symbol: 'pt', toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
            quart: { name: '쿼트', symbol: 'qt', toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
            gallon: { name: '갤런', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
        },
        area: {
            sqmm: { name: '제곱밀리미터', symbol: 'mm²', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
            sqcm: { name: '제곱센티미터', symbol: 'cm²', toBase: (v) => v / 10000, fromBase: (v) => v * 10000 },
            sqm: { name: '제곱미터', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
            sqkm: { name: '제곱킬로미터', symbol: 'km²', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
            sqin: { name: '제곱인치', symbol: 'in²', toBase: (v) => v * 0.00064516, fromBase: (v) => v / 0.00064516 },
            sqft: { name: '제곱피트', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
            acre: { name: '에이커', symbol: 'ac', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
        },
        speed: {
            mps: { name: '미터/초', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
            kph: { name: '킬로미터/시', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
            mph: { name: '마일/시', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
            knot: { name: '노트', symbol: 'kt', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
        },
    };

    const convert = useCallback(() => {
        if (!inputValue || !fromUnit || !toUnit) return;

        const value = parseFloat(inputValue);
        if (isNaN(value)) return;

        const fromConversion = conversions[category][fromUnit];
        const toConversion = conversions[category][toUnit];

        if (!fromConversion || !toConversion) return;

        // 기준 단위로 변환 후 목표 단위로 변환
        const baseValue = fromConversion.toBase(value);
        const result = toConversion.fromBase(baseValue);

        setOutputValue(result.toFixed(6).replace(/\.?0+$/, ''));
    }, [inputValue, fromUnit, toUnit, category, conversions]);

    useEffect(() => {
        convert();
    }, [convert]);

    useEffect(() => {
        // 카테고리 변경 시 첫 번째 단위로 초기화
        const units = Object.keys(conversions[category]);
        if (units.length > 0) {
            setFromUnit(units[0]);
            setToUnit(units[1] || units[0]);
        }
        setInputValue('');
        setOutputValue('');
    }, [category, conversions]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(outputValue).then(() => {
            toast.success('결과가 클립보드에 복사되었습니다!');
        });
    }, [outputValue]);

    const swapUnits = useCallback(() => {
        const temp = fromUnit;
        setFromUnit(toUnit);
        setToUnit(temp);
        setInputValue(outputValue);
    }, [fromUnit, toUnit, outputValue]);

    const getCategoryIcon = (cat: UnitCategory) => {
        const icons = {
            length: Ruler,
            weight: Weight,
            temperature: Thermometer,
            volume: Droplets,
            area: Ruler,
            speed: ArrowLeftRight,
        };
        const Icon = icons[cat];
        return <Icon className='h-4 w-4' />;
    };

    const getCategoryName = (cat: UnitCategory) => {
        const names = {
            length: '길이',
            weight: '무게',
            temperature: '온도',
            volume: '부피',
            area: '면적',
            speed: '속도',
        };
        return names[cat];
    };

    return (
        <div className='container mx-auto p-4 max-w-4xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Ruler className='h-8 w-8' />
                    단위 변환기
                </h1>
                <p className='text-muted-foreground mt-2'>다양한 단위를 간편하게 변환하세요.</p>
            </div>

            <Tabs value={category} onValueChange={(value) => setCategory(value as UnitCategory)}>
                <TabsList className='grid w-full grid-cols-6'>
                    <TabsTrigger value='length'>
                        <div className='flex items-center gap-1'>
                            <Ruler className='h-3 w-3' />
                            길이
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value='weight'>
                        <div className='flex items-center gap-1'>
                            <Weight className='h-3 w-3' />
                            무게
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value='temperature'>
                        <div className='flex items-center gap-1'>
                            <Thermometer className='h-3 w-3' />
                            온도
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value='volume'>
                        <div className='flex items-center gap-1'>
                            <Droplets className='h-3 w-3' />
                            부피
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value='area'>
                        <div className='flex items-center gap-1'>
                            <Ruler className='h-3 w-3' />
                            면적
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value='speed'>
                        <div className='flex items-center gap-1'>
                            <ArrowLeftRight className='h-3 w-3' />
                            속도
                        </div>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={category} className='mt-6'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-lg flex items-center gap-2'>
                                {getCategoryIcon(category)}
                                {getCategoryName(category)} 변환
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                {/* 입력 */}
                                <div className='space-y-4'>
                                    <div>
                                        <Label htmlFor='from-unit'>변환할 단위</Label>
                                        <Select value={fromUnit} onValueChange={setFromUnit}>
                                            <SelectTrigger id='from-unit'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(conversions[category]).map(([key, unit]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {unit.name} ({unit.symbol})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor='input-value'>값</Label>
                                        <Input
                                            id='input-value'
                                            type='number'
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder='변환할 값을 입력하세요'
                                        />
                                    </div>
                                </div>

                                {/* 변환 버튼 */}
                                <div className='flex items-center justify-center'>
                                    <Button
                                        variant='outline'
                                        size='icon'
                                        onClick={swapUnits}
                                        disabled={!fromUnit || !toUnit}
                                    >
                                        <ArrowLeftRight className='h-4 w-4' />
                                    </Button>
                                </div>

                                {/* 출력 */}
                                <div className='space-y-4'>
                                    <div>
                                        <Label htmlFor='to-unit'>변환될 단위</Label>
                                        <Select value={toUnit} onValueChange={setToUnit}>
                                            <SelectTrigger id='to-unit'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(conversions[category]).map(([key, unit]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {unit.name} ({unit.symbol})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor='output-value'>결과</Label>
                                        <div className='flex gap-2'>
                                            <Input
                                                id='output-value'
                                                value={outputValue}
                                                readOnly
                                                placeholder='변환 결과'
                                            />
                                            <Button
                                                variant='outline'
                                                size='icon'
                                                onClick={handleCopy}
                                                disabled={!outputValue}
                                            >
                                                <Copy className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 변환 공식 표시 */}
                            {inputValue && outputValue && fromUnit && toUnit && (
                                <div className='mt-6 p-4 bg-muted rounded-lg'>
                                    <p className='text-sm font-medium mb-2'>변환 결과:</p>
                                    <p className='text-lg'>
                                        {inputValue} {conversions[category][fromUnit]?.symbol} = {outputValue}{' '}
                                        {conversions[category][toUnit]?.symbol}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Card className='mt-6 bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>지원하는 단위</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>길이:</strong> mm, cm, m, km, inch, ft, yard, mile
                    </p>
                    <p>
                        • <strong>무게:</strong> mg, g, kg, ton, oz, lb
                    </p>
                    <p>
                        • <strong>온도:</strong> 섭씨(°C), 화씨(°F), 켈빈(K)
                    </p>
                    <p>
                        • <strong>부피:</strong> ml, L, cup, pint, quart, gallon
                    </p>
                    <p>
                        • <strong>면적:</strong> mm², cm², m², km², in², ft², acre
                    </p>
                    <p>
                        • <strong>속도:</strong> m/s, km/h, mph, knot
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

UnitConverterClient.displayName = 'UnitConverterClient';

export default UnitConverterClient;
