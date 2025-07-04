'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TextDiffPage() {
    const [originalText, setOriginalText] = useState('');
    const [newText, setNewText] = useState('');
    const [diffOutput, setDiffOutput] = useState<string[]>([]);

    const compareTexts = () => {
        const originalLines = originalText.split('\n');
        const newLines = newText.split('\n');

        const diffResult: string[] = [];

        // Simple line-by-line comparison
        let i = 0,
            j = 0;
        while (i < originalLines.length || j < newLines.length) {
            if (i < originalLines.length && j < newLines.length) {
                if (originalLines[i] === newLines[j]) {
                    diffResult.push(`  ${originalLines[i]}`); // Unchanged
                    i++;
                    j++;
                } else {
                    // Look ahead to find matches and determine if it's an addition or deletion
                    let originalFound = false;
                    for (let k = j; k < newLines.length; k++) {
                        if (originalLines[i] === newLines[k]) {
                            originalFound = true;
                            break;
                        }
                    }

                    let newFound = false;
                    for (let k = i; k < originalLines.length; k++) {
                        if (newLines[j] === originalLines[k]) {
                            newFound = true;
                            break;
                        }
                    }

                    if (!originalFound && newFound) {
                        diffResult.push(`- ${originalLines[i]}`); // Deletion
                        i++;
                    } else if (originalFound && !newFound) {
                        diffResult.push(`+ ${newLines[j]}`); // Addition
                        j++;
                    } else {
                        // No clear match, treat as both deletion and addition
                        diffResult.push(`- ${originalLines[i]}`); // Deletion
                        diffResult.push(`+ ${newLines[j]}`); // Addition
                        i++;
                        j++;
                    }
                }
            } else if (i < originalLines.length) {
                diffResult.push(`- ${originalLines[i]}`); // Remaining deletions
                i++;
            } else if (j < newLines.length) {
                diffResult.push(`+ ${newLines[j]}`); // Remaining additions
                j++;
            }
        }
        setDiffOutput(diffResult);
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
                                {diffOutput.map((line, index) => (
                                    <p
                                        key={index}
                                        className={`
                                            ${
                                                line.startsWith('+')
                                                    ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-950'
                                                    : ''
                                            }
                                            ${
                                                line.startsWith('-')
                                                    ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950'
                                                    : ''
                                            }
                                            ${line.startsWith('  ') ? 'text-muted-foreground' : ''}
                                        `}
                                    >
                                        {line}
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
