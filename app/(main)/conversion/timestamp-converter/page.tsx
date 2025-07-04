'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Calendar, Clock, AlertTriangle } from 'lucide-react';

export default function TimestampPage() {
    const [timestampInput, setTimestampInput] = useState('');
    const [dateTimeOutput, setDateTimeOutput] = useState('');
    const [dateTimeInput, setDateTimeInput] = useState('');
    const [timestampOutput, setTimestampOutput] = useState('');
    const [error, setError] = useState('');

    const convertTimestampToDateTime = () => {
        setError('');
        if (!timestampInput) {
            setDateTimeOutput('');
            return;
        }
        const timestamp = parseInt(timestampInput, 10);
        if (isNaN(timestamp)) {
            setError('Invalid timestamp. Please enter a number.');
            setDateTimeOutput('');
            return;
        }

        try {
            const date = new Date(timestamp * 1000); // Assuming Unix timestamp (seconds)
            setDateTimeOutput(date.toLocaleString());
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
            setDateTimeOutput('');
        }
    };

    const convertDateTimeToTimestamp = () => {
        setError('');
        if (!dateTimeInput) {
            setTimestampOutput('');
            return;
        }

        try {
            const date = new Date(dateTimeInput);
            if (isNaN(date.getTime())) {
                setError('Invalid date/time format.');
                setTimestampOutput('');
                return;
            }
            setTimestampOutput(Math.floor(date.getTime() / 1000).toString());
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
            setTimestampOutput('');
        }
    };

    const getCurrentTimestamp = () => {
        const now = Math.floor(Date.now() / 1000);
        setTimestampInput(now.toString());
        convertTimestampToDateTime();
    };

    const getCurrentDateTime = () => {
        const now = new Date().toISOString().slice(0, 16);
        setDateTimeInput(now);
        convertDateTimeToTimestamp();
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
                            onClick={convertTimestampToDateTime}
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
                            onClick={convertDateTimeToTimestamp}
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
