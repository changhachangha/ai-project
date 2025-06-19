'use client';

import React, { useState } from 'react';

export default function JsonPage() {
    const [jsonInput, setJsonInput] = useState('');
    const [jsonOutput, setJsonOutput] = useState('');
    const [error, setError] = useState('');

    const formatJson = () => {
        try {
            const parsedJson = JSON.parse(jsonInput);
            setJsonOutput(JSON.stringify(parsedJson, null, 4));
            setError('');
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
            setJsonOutput('');
        }
    };

    return (
        <div className='flex flex-col items-center justify-center min-h-screen py-2'>
            <h1 className='text-4xl font-bold mb-8'>JSON Formatter</h1>
            <div className='flex w-full max-w-4xl space-x-4'>
                <div className='flex flex-col flex-1'>
                    <textarea
                        className='w-full h-96 p-2 border rounded-md resize-none'
                        placeholder='Enter JSON here...'
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                    ></textarea>
                    <button
                        className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
                        onClick={formatJson}
                    >
                        Format JSON
                    </button>
                </div>
                <div className='flex flex-col flex-1'>
                    <textarea
                        className='w-full h-96 p-2 border rounded-md bg-gray-100 resize-none'
                        readOnly
                        value={jsonOutput}
                    ></textarea>
                    {error && <p className='text-red-500 mt-2'>{error}</p>}
                </div>
            </div>
        </div>
    );
}
