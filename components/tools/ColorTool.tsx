import React, { useState } from 'react';
import { ColorToolInput, ColorToolOutput } from '@/lib/types/tools';
import { processColor } from '@/lib/tools/color';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ColorTool: React.FC = () => {
    const [colorInput, setColorInput] = useState<string>('');
    const [colorOutput, setColorOutput] = useState<ColorToolOutput | null>(null);

    const handleProcess = () => {
        const input: ColorToolInput = { color: colorInput };
        const result = processColor(input);
        setColorOutput(result);
    };

    return (
        <div className='flex flex-col space-y-4 p-4'>
            <h2 className='text-2xl font-bold'>Color Converter</h2>

            <Input
                placeholder='Enter color (e.g., #RRGGBB, rgb(R,G,B), hsl(H,S,L))...'
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
            />

            <Button onClick={handleProcess}>Convert Color</Button>

            {colorOutput && (
                <div className='border p-4 rounded-md bg-card text-card-foreground'>
                    {colorOutput.errorMessage ? (
                        <div className='text-destructive'>
                            <h3 className='font-semibold'>Error:</h3>
                            <p>{colorOutput.errorMessage}</p>
                        </div>
                    ) : (
                        <div className='space-y-2'>
                            <p>
                                <strong>Hex:</strong> {colorOutput.hex}
                            </p>
                            <p>
                                <strong>RGB:</strong> {colorOutput.rgb}
                            </p>
                            <p>
                                <strong>HSL:</strong> {colorOutput.hsl}
                            </p>
                            {colorOutput.hex && (
                                <div
                                    className='w-full h-10 rounded-md mt-4 border'
                                    style={{ backgroundColor: colorOutput.hex }}
                                ></div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ColorTool;
