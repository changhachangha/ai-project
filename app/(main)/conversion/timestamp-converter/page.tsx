'use client';

import React, { useState } from 'react';

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

    return (
        <div className='flex flex-col items-center justify-center min-h-screen py-2'>
            <h1 className='text-4xl font-bold mb-8'>Timestamp Converter</h1>
            <div className='flex w-full max-w-4xl space-x-4 mb-8'>
                <div className='flex flex-col flex-1'>
                    <h2 className='text-2xl font-semibold mb-4'>Timestamp to Date/Time</h2>
                    <input
                        type='text'
                        className='w-full p-2 border rounded-md mb-2'
                        placeholder='Enter Unix Timestamp (seconds)'
                        value={timestampInput}
                        onChange={(e) => setTimestampInput(e.target.value)}
                    />
                    <button
                        className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
                        onClick={convertTimestampToDateTime}
                    >
                        Convert
                    </button>
                    <p className='mt-4 text-lg'>Result: {dateTimeOutput}</p>
                </div>
                <div className='flex flex-col flex-1'>
                    <h2 className='text-2xl font-semibold mb-4'>Date/Time to Timestamp</h2>
                    <input
                        type='text'
                        className='w-full p-2 border rounded-md mb-2'
                        placeholder='Enter Date/Time (e.g., YYYY-MM-DD HH:MM:SS)'
                        value={dateTimeInput}
                        onChange={(e) => setDateTimeInput(e.target.value)}
                    />
                    <button
                        className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
                        onClick={convertDateTimeToTimestamp}
                    >
                        Convert
                    </button>
                    <p className='mt-4 text-lg'>Result: {timestampOutput}</p>
                </div>
            </div>
            {error && <p className='text-red-500'>Error: {error}</p>}
        </div>
    );
}
