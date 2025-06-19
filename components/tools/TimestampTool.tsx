import React, { useState } from 'react';
import { TimestampToolInput, TimestampToolOptions, TimestampToolOutput } from '@/lib/types/tools';
import { processTimestamp } from '@/lib/tools/timestamp';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TimestampTool: React.FC = () => {
    const [timestampInput, setTimestampInput] = useState<string>('');
    const [format, setFormat] = useState<string>('YYYY-MM-DD HH:mm:ss');
    const [timezone, setTimezone] = useState<string>('Asia/Seoul');
    const [timestampOutput, setTimestampOutput] = useState<TimestampToolOutput | null>(null);

    const handleProcess = () => {
        const input: TimestampToolInput = { timestamp: timestampInput };
        const options: TimestampToolOptions = { format, timezone };
        const result = processTimestamp(input, options);
        setTimestampOutput(result);
    };

    // Example timezones - a real app would have a more comprehensive list
    const timezones = [
        { label: 'Seoul', value: 'Asia/Seoul' },
        { label: 'New York', value: 'America/New_York' },
        { label: 'London', value: 'Europe/London' },
        { label: 'UTC', value: 'UTC' },
    ];

    // Example formats - a real app would have more options
    const formats = [
        { label: 'YYYY-MM-DD HH:mm:ss', value: 'YYYY-MM-DD HH:mm:ss' },
        { label: 'MM/DD/YYYY h:mm:ss A', value: 'MM/DD/YYYY h:mm:ss A' },
        { label: 'Unix Timestamp', value: 'X' }, // Unix timestamp (seconds)
        { label: 'Unix Millisecond Timestamp', value: 'x' }, // Unix timestamp (milliseconds)
    ];

    return (
        <div className='flex flex-col space-y-4 p-4'>
            <h2 className='text-2xl font-bold'>Timestamp Converter</h2>

            <Textarea
                placeholder='Enter timestamp or date string...'
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                className='min-h-[100px]'
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Select onValueChange={setFormat} defaultValue={format}>
                    <SelectTrigger>
                        <SelectValue placeholder='Select format' />
                    </SelectTrigger>
                    <SelectContent>
                        {formats.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                                {f.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select onValueChange={setTimezone} defaultValue={timezone}>
                    <SelectTrigger>
                        <SelectValue placeholder='Select timezone' />
                    </SelectTrigger>
                    <SelectContent>
                        {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                                {tz.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button onClick={handleProcess}>Convert Timestamp</Button>

            {timestampOutput && (
                <div className='border p-4 rounded-md bg-card text-card-foreground'>
                    {timestampOutput.errorMessage ? (
                        <div className='text-destructive'>
                            <h3 className='font-semibold'>Error:</h3>
                            <p>{timestampOutput.errorMessage}</p>
                        </div>
                    ) : (
                        <>
                            <p>
                                <strong>Human Readable:</strong> {timestampOutput.humanReadableDate}
                            </p>
                            <p>
                                <strong>Unix Timestamp:</strong> {timestampOutput.unixTimestamp}
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default TimestampTool;
