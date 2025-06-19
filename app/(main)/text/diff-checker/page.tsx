'use client';

import React, { useState } from 'react';

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
        <div className='flex flex-col items-center justify-center min-h-screen py-2'>
            <h1 className='text-4xl font-bold mb-8'>Text Diff Tool</h1>
            <div className='flex w-full max-w-6xl space-x-4'>
                <div className='flex flex-col flex-1'>
                    <h2 className='text-2xl font-semibold mb-4'>Original Text</h2>
                    <textarea
                        className='w-full h-96 p-2 border rounded-md resize-none font-mono text-sm'
                        placeholder='Enter original text here...'
                        value={originalText}
                        onChange={(e) => setOriginalText(e.target.value)}
                    ></textarea>
                </div>
                <div className='flex flex-col flex-1'>
                    <h2 className='text-2xl font-semibold mb-4'>New Text</h2>
                    <textarea
                        className='w-full h-96 p-2 border rounded-md resize-none font-mono text-sm'
                        placeholder='Enter new text here...'
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                    ></textarea>
                </div>
            </div>
            <button
                className='mt-8 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xl font-semibold'
                onClick={compareTexts}
            >
                Compare Texts
            </button>
            {diffOutput.length > 0 && (
                <div className='mt-8 w-full max-w-6xl bg-gray-100 p-4 rounded-md font-mono text-sm overflow-auto max-h-[500px]'>
                    <h2 className='text-2xl font-semibold mb-4'>Diff Result</h2>
                    <pre>
                        {diffOutput.map((line, index) => (
                            <p
                                key={index}
                                className={`
                                ${line.startsWith('+') ? 'text-green-700 bg-green-100' : ''}
                                ${line.startsWith('-') ? 'text-red-700 bg-red-100' : ''}
                            `}
                            >
                                {line}
                            </p>
                        ))}
                    </pre>
                </div>
            )}
        </div>
    );
}
