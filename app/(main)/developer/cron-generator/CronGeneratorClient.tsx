'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Calendar, Clock, Copy } from 'lucide-react';
import { toast } from 'sonner';

const CronGeneratorClient = memo(() => {
    const [minute, setMinute] = useState('*');
    const [hour, setHour] = useState('*');
    const [day, setDay] = useState('*');
    const [month, setMonth] = useState('*');
    const [weekday, setWeekday] = useState('*');
    const [cronExpression, setCronExpression] = useState('* * * * *');
    const [description, setDescription] = useState('');

    const generateCron = useCallback(() => {
        const expression = `${minute} ${hour} ${day} ${month} ${weekday}`;
        setCronExpression(expression);

        // 간단한 설명 생성
        let desc = '';
        if (minute === '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
            desc = '매분 실행';
        } else if (minute !== '*' && hour !== '*') {
            desc = `매일 ${hour}시 ${minute}분에 실행`;
        } else if (hour !== '*') {
            desc = `매일 ${hour}시에 실행`;
        } else {
            desc = '사용자 정의 스케줄';
        }

        setDescription(desc);
        toast.success('Cron 표현식이 생성되었습니다!');
    }, [minute, hour, day, month, weekday]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(cronExpression).then(() => {
            toast.success('Cron 표현식이 클립보드에 복사되었습니다!');
        });
    }, [cronExpression]);

    const loadPreset = useCallback((preset: string) => {
        switch (preset) {
            case 'every-minute':
                setMinute('*');
                setHour('*');
                setDay('*');
                setMonth('*');
                setWeekday('*');
                break;
            case 'hourly':
                setMinute('0');
                setHour('*');
                setDay('*');
                setMonth('*');
                setWeekday('*');
                break;
            case 'daily':
                setMinute('0');
                setHour('0');
                setDay('*');
                setMonth('*');
                setWeekday('*');
                break;
            case 'weekly':
                setMinute('0');
                setHour('0');
                setDay('*');
                setMonth('*');
                setWeekday('0');
                break;
            case 'monthly':
                setMinute('0');
                setHour('0');
                setDay('1');
                setMonth('*');
                setWeekday('*');
                break;
        }
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-4xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Calendar className='h-8 w-8' />
                    Cron 표현식 생성기
                </h1>
                <p className='text-muted-foreground mt-2'>Cron 작업 스케줄 표현식을 시각적으로 생성하고 검증합니다.</p>
            </div>

            <Card className='mb-6'>
                <CardHeader>
                    <CardTitle>Cron 표현식 설정</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        <div className='grid grid-cols-5 gap-4'>
                            <div>
                                <Label>분 (0-59)</Label>
                                <Input
                                    value={minute}
                                    onChange={(e) => setMinute(e.target.value)}
                                    placeholder='*'
                                    className='mt-1'
                                />
                            </div>
                            <div>
                                <Label>시 (0-23)</Label>
                                <Input
                                    value={hour}
                                    onChange={(e) => setHour(e.target.value)}
                                    placeholder='*'
                                    className='mt-1'
                                />
                            </div>
                            <div>
                                <Label>일 (1-31)</Label>
                                <Input
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    placeholder='*'
                                    className='mt-1'
                                />
                            </div>
                            <div>
                                <Label>월 (1-12)</Label>
                                <Input
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    placeholder='*'
                                    className='mt-1'
                                />
                            </div>
                            <div>
                                <Label>요일 (0-6)</Label>
                                <Input
                                    value={weekday}
                                    onChange={(e) => setWeekday(e.target.value)}
                                    placeholder='*'
                                    className='mt-1'
                                />
                            </div>
                        </div>

                        <Button onClick={generateCron} className='w-full'>
                            <Clock className='h-4 w-4 mr-2' />
                            Cron 표현식 생성
                        </Button>

                        <div className='flex flex-wrap gap-2'>
                            <span className='text-sm font-medium'>프리셋:</span>
                            <Button variant='outline' size='sm' onClick={() => loadPreset('every-minute')}>
                                매분
                            </Button>
                            <Button variant='outline' size='sm' onClick={() => loadPreset('hourly')}>
                                매시간
                            </Button>
                            <Button variant='outline' size='sm' onClick={() => loadPreset('daily')}>
                                매일
                            </Button>
                            <Button variant='outline' size='sm' onClick={() => loadPreset('weekly')}>
                                매주
                            </Button>
                            <Button variant='outline' size='sm' onClick={() => loadPreset('monthly')}>
                                매월
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <CardTitle>생성된 Cron 표현식</CardTitle>
                        <Button variant='outline' size='sm' onClick={handleCopy} disabled={!cronExpression}>
                            <Copy className='h-4 w-4 mr-1' />
                            복사
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        <div className='bg-muted p-4 rounded-lg'>
                            <code className='text-lg font-mono'>{cronExpression}</code>
                        </div>

                        {description && (
                            <div>
                                <Label className='text-sm font-medium'>설명:</Label>
                                <p className='mt-1'>{description}</p>
                            </div>
                        )}

                        <div className='space-y-2'>
                            <Label className='text-sm font-medium'>Cron 표현식 형식:</Label>
                            <div className='text-sm text-muted-foreground space-y-1'>
                                <p>분(0-59) 시(0-23) 일(1-31) 월(1-12) 요일(0-6)</p>
                                <p>* = 모든 값, , = 여러 값, - = 범위, / = 간격</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

CronGeneratorClient.displayName = 'CronGeneratorClient';

export default CronGeneratorClient;
