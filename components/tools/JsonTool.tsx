import React, { useState } from 'react';
import { JsonToolInput, JsonToolOutput, JsonToolOptions } from '@/lib/types/tools';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { processJson } from '@/lib/tools/json';

const JsonTool: React.FC = () => {
    const [jsonInput, setJsonInput] = useState<string>('');
    const [jsonOutput, setJsonOutput] = useState<JsonToolOutput | null>(null);

    const handleProcess = () => {
        try {
            const parsedInput: JsonToolInput = { jsonString: jsonInput };
            const options: JsonToolOptions = { indentation: 2, minify: false, sortKeys: false };
            const result = processJson(parsedInput, options);
            setJsonOutput(result);
        } catch (error: unknown) {
            setJsonOutput({
                formattedJson: '',
                isValid: false,
                errorMessage: error instanceof Error ? error.message : 'An unknown error occurred.',
            });
        }
    };

    return (
        <div className='flex flex-col space-y-4 p-4'>
            <h2 className='text-2xl font-bold'>JSON Formatter & Validator</h2>
            <Textarea
                placeholder='Enter JSON here...'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className='min-h-[200px]'
            />
            <Button onClick={handleProcess}>Process JSON</Button>
            {jsonOutput && (
                <div className='border p-4 rounded-md bg-card text-card-foreground'>
                    {jsonOutput.isValid ? (
                        <pre className='whitespace-pre-wrap break-all'>{jsonOutput.formattedJson}</pre>
                    ) : (
                        <div className='text-destructive'>
                            <h3 className='font-semibold'>Error:</h3>
                            <p>{jsonOutput.errorMessage || 'Invalid JSON'}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default JsonTool;
