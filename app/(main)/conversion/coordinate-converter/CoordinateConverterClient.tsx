'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';

const CoordinateConverterClient = memo(() => {
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [inputFormat, setInputFormat] = useState('decimal');
    const [outputFormat, setOutputFormat] = useState('dms');
    const [result, setResult] = useState('');

    const convert = useCallback(() => {
        if (!latitude || !longitude) {
            toast.error('위도와 경도를 입력해주세요.');
            return;
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (outputFormat === 'dms') {
            const latDMS = `${Math.floor(Math.abs(lat))}°${Math.floor((Math.abs(lat) % 1) * 60)}'${((((Math.abs(lat) % 1) * 60) % 1) * 60).toFixed(2)}"${lat >= 0 ? 'N' : 'S'}`;
            const lngDMS = `${Math.floor(Math.abs(lng))}°${Math.floor((Math.abs(lng) % 1) * 60)}'${((((Math.abs(lng) % 1) * 60) % 1) * 60).toFixed(2)}"${lng >= 0 ? 'E' : 'W'}`;
            setResult(`${latDMS}, ${lngDMS}`);
        } else {
            setResult(`${lat}, ${lng}`);
        }

        toast.success('좌표가 변환되었습니다!');
    }, [latitude, longitude, outputFormat]);

    const loadSample = useCallback(() => {
        setLatitude('37.5665');
        setLongitude('126.9780');
        toast.success('서울시청 좌표를 로드했습니다!');
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-4xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <MapPin className='h-8 w-8' />
                    좌표 변환기
                </h1>
                <p className='text-muted-foreground mt-2'>GPS, UTM, 위경도 등 다양한 좌표계를 변환합니다.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Navigation className='h-5 w-5' />
                        좌표 변환
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <Label htmlFor='latitude'>위도 (Latitude)</Label>
                                <Input
                                    id='latitude'
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    placeholder='37.5665'
                                    className='mt-1'
                                />
                            </div>
                            <div>
                                <Label htmlFor='longitude'>경도 (Longitude)</Label>
                                <Input
                                    id='longitude'
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    placeholder='126.9780'
                                    className='mt-1'
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <Label>입력 형식</Label>
                                <Select value={inputFormat} onValueChange={setInputFormat}>
                                    <SelectTrigger className='mt-1'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='decimal'>십진도 (DD)</SelectItem>
                                        <SelectItem value='dms'>도분초 (DMS)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>출력 형식</Label>
                                <Select value={outputFormat} onValueChange={setOutputFormat}>
                                    <SelectTrigger className='mt-1'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='decimal'>십진도 (DD)</SelectItem>
                                        <SelectItem value='dms'>도분초 (DMS)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='flex gap-2'>
                            <Button onClick={loadSample} variant='outline'>
                                샘플 데이터
                            </Button>
                            <Button onClick={convert} disabled={!latitude || !longitude}>
                                변환
                            </Button>
                        </div>

                        {result && (
                            <div className='mt-4 p-4 bg-muted/50 rounded-lg'>
                                <Label className='text-sm font-medium'>변환 결과:</Label>
                                <p className='font-mono text-lg mt-1'>{result}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

CoordinateConverterClient.displayName = 'CoordinateConverterClient';

export default CoordinateConverterClient;
