'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { processTimestamp } from '@/lib/tools/timestamp';

export default function TimestampConverterTool() {
    const [timestampInput, setTimestampInput] = useState('');
    const [dateTimeOutput, setDateTimeOutput] = useState('');
    const [dateTimeInput, setDateTimeInput] = useState('');
    const [timestampOutput, setTimestampOutput] = useState('');
    const [error, setError] = useState('');

    // 값은 호출 시 인자로 받는다 — state 경유 시 setState 직후 호출하면
    // stale 값을 읽는다 ("Now" 버튼 버그의 원인이었다).
    const convertTimestampToDateTime = (input: string = timestampInput) => {
        setError('');
        if (!input) {
            setDateTimeOutput('');
            return;
        }
        const timestamp = parseInt(input, 10);
        if (isNaN(timestamp)) {
            setError('Invalid timestamp. Please enter a number.');
            setDateTimeOutput('');
            return;
        }

        const result = processTimestamp({ timestamp });
        if (result.errorMessage) {
            setError(result.errorMessage);
            setDateTimeOutput('');
            return;
        }
        setDateTimeOutput(result.humanReadableDate);
    };

    const convertDateTimeToTimestamp = (input: string = dateTimeInput) => {
        setError('');
        if (!input) {
            setTimestampOutput('');
            return;
        }

        const result = processTimestamp({ timestamp: input });
        if (result.errorMessage) {
            setError(result.errorMessage);
            setTimestampOutput('');
            return;
        }
        setTimestampOutput(result.unixTimestamp.toString());
    };

    const getCurrentTimestamp = () => {
        const now = Math.floor(Date.now() / 1000).toString();
        setTimestampInput(now);
        convertTimestampToDateTime(now);
    };

    const getCurrentDateTime = () => {
        const now = new Date().toISOString().slice(0, 16);
        setDateTimeInput(now);
        convertDateTimeToTimestamp(now);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className='container mx-auto py-8 px-4'>
            <div className='text-center mb-8'>
                <h1 className='text-4xl font-bold mb-2'>Timestamp Converter</h1>
                <p className='text-muted-foreground'>Convert between Unix timestamps and human-readable dates</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Clock className='h-5 w-5' />
                            Timestamp to Date/Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='flex gap-2'>
                            <Input
                                type='text'
                                placeholder='Enter Unix Timestamp (seconds)'
                                value={timestampInput}
                                onChange={(e) => setTimestampInput(e.target.value)}
                                className='flex-1'
                            />
                            <Button variant='outline' onClick={getCurrentTimestamp}>
                                Now
                            </Button>
                        </div>
                        <Button
                            onClick={() => convertTimestampToDateTime()}
                            className='w-full'
                            disabled={!timestampInput.trim()}
                        >
                            Convert to Date/Time
                        </Button>
                        {dateTimeOutput && (
                            <div className='flex items-center gap-2 p-3 bg-muted rounded-md'>
                                <span className='flex-1 font-mono'>{dateTimeOutput}</span>
                                <Button variant='outline' size='sm' onClick={() => copyToClipboard(dateTimeOutput)}>
                                    <Copy className='h-4 w-4' />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Calendar className='h-5 w-5' />
                            Date/Time to Timestamp
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='flex gap-2'>
                            <Input
                                type='datetime-local'
                                placeholder='Enter Date/Time'
                                value={dateTimeInput}
                                onChange={(e) => setDateTimeInput(e.target.value)}
                                className='flex-1'
                            />
                            <Button variant='outline' onClick={getCurrentDateTime}>
                                Now
                            </Button>
                        </div>
                        <Button
                            onClick={() => convertDateTimeToTimestamp()}
                            className='w-full'
                            disabled={!dateTimeInput.trim()}
                        >
                            Convert to Timestamp
                        </Button>
                        {timestampOutput && (
                            <div className='flex items-center gap-2 p-3 bg-muted rounded-md'>
                                <span className='flex-1 font-mono'>{timestampOutput}</span>
                                <Button variant='outline' size='sm' onClick={() => copyToClipboard(timestampOutput)}>
                                    <Copy className='h-4 w-4' />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {error && (
                <div className='flex items-center gap-2 p-3 bg-muted rounded-md'>
                    <AlertTriangle className='h-4 w-4 text-destructive' />
                    <span className='flex-1 font-mono'>{error}</span>
                </div>
            )}
        </div>
    );
}
