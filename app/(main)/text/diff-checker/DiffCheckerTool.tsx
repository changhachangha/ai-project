'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { processDiff } from '@/lib/tools/diff';
import type { DiffPart } from '@/lib/types/tools';

export default function DiffCheckerTool() {
    const [originalText, setOriginalText] = useState('');
    const [newText, setNewText] = useState('');
    const [diffOutput, setDiffOutput] = useState<DiffPart[]>([]);

    const compareTexts = () => {
        setDiffOutput(processDiff({ originalText, newText }, 'lines').parts);
    };

    return (
        <div className='container mx-auto py-8 px-4'>
            <h1 className='text-4xl font-bold mb-8 text-center'>Text Diff Tool</h1>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
                <Card>
                    <CardHeader>
                        <CardTitle>Original Text</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            className='h-96 font-mono text-sm resize-none'
                            placeholder='Enter original text here...'
                            value={originalText}
                            onChange={(e) => setOriginalText(e.target.value)}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>New Text</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            className='h-96 font-mono text-sm resize-none'
                            placeholder='Enter new text here...'
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className='text-center mb-8'>
                <Button size='lg' onClick={compareTexts} disabled={!originalText.trim() || !newText.trim()}>
                    Compare Texts
                </Button>
            </div>

            {diffOutput.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Diff Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='bg-muted p-4 rounded-md font-mono text-sm overflow-auto max-h-[500px]'>
                            <pre>
                                {diffOutput.map((part, index) => (
                                    <p
                                        key={index}
                                        className={`
                                            ${
                                                part.added
                                                    ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-950'
                                                    : ''
                                            }
                                            ${
                                                part.removed
                                                    ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950'
                                                    : ''
                                            }
                                            ${!part.added && !part.removed ? 'text-muted-foreground' : ''}
                                        `}
                                    >
                                        {part.added ? '+ ' : part.removed ? '- ' : '  '}
                                        {part.value}
                                    </p>
                                ))}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
