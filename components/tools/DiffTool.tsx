import React, { useState } from 'react';
import { DiffToolOutput } from '@/lib/types/tools';
// import { processDiff } from '@/lib/tools/diff'; // Removed local processing
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DiffTool: React.FC = () => {
    const [originalText, setOriginalText] = useState<string>('');
    const [newText, setNewText] = useState<string>('');
    const [diffType, setDiffType] = useState<'chars' | 'words' | 'lines'>('lines');
    const [diffOutput, setDiffOutput] = useState<DiffToolOutput | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleProcess = async () => {
        setIsLoading(true);
        setError(null);
        setDiffOutput(null);

        try {
            const response = await fetch('/api/diff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ originalText, newText, diffType }),
            });

            const data: DiffToolOutput = await response.json();

            if (!response.ok) {
                throw new Error(data.errorMessage || 'Failed to process diff.');
            }

            setDiffOutput(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setDiffOutput({
                diffResult: '',
                errorMessage: err instanceof Error ? err.message : 'An unknown error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex flex-col space-y-4 p-4'>
            <h2 className='text-2xl font-bold'>Text Diff Tool</h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Textarea
                    placeholder='Enter original text...'
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    className='min-h-[150px]'
                />
                <Textarea
                    placeholder='Enter new text...'
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className='min-h-[150px]'
                />
            </div>

            <Select onValueChange={(value: 'chars' | 'words' | 'lines') => setDiffType(value)} defaultValue={diffType}>
                <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Select diff type' />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='lines'>Lines</SelectItem>
                    <SelectItem value='words'>Words</SelectItem>
                    <SelectItem value='chars'>Characters</SelectItem>
                </SelectContent>
            </Select>

            <Button onClick={handleProcess} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Generate Diff'}
            </Button>

            {error && (
                <div className='border p-4 rounded-md bg-destructive text-destructive-foreground'>
                    <h3 className='font-semibold'>Error:</h3>
                    <p>{error}</p>
                </div>
            )}

            {diffOutput && !error && (
                <div className='border p-4 rounded-md bg-card text-card-foreground'>
                    <div dangerouslySetInnerHTML={{ __html: diffOutput.diffResult }} />
                </div>
            )}
        </div>
    );
};

export default DiffTool;
