import React, { useState } from 'react';
import { EncodeToolInput, DecodeToolInput } from '@/lib/types/tools';
import { processEncode, processDecode } from '@/lib/tools/encode';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EncodeTool: React.FC = () => {
    const [inputText, setInputText] = useState<string>('');
    const [outputText, setOutputText] = useState<string>('');
    const [encodingType, setEncodingType] = useState<'base64' | 'url' | 'html'>('base64');
    const [isEncoding, setIsEncoding] = useState<boolean>(true);

    const handleProcess = () => {
        if (isEncoding) {
            const input: EncodeToolInput = { text: inputText, encodingType };
            const result = processEncode(input);
            setOutputText(result.encodedText || result.errorMessage || '');
        } else {
            const input: DecodeToolInput = { text: inputText, encodingType };
            const result = processDecode(input);
            setOutputText(result.decodedText || result.errorMessage || '');
        }
    };

    return (
        <div className='flex flex-col space-y-4 p-4'>
            <h2 className='text-2xl font-bold'>Encode / Decode Tool</h2>

            <div className='flex space-x-4'>
                <Button onClick={() => setIsEncoding(true)} variant={isEncoding ? 'default' : 'outline'}>
                    Encode
                </Button>
                <Button onClick={() => setIsEncoding(false)} variant={!isEncoding ? 'default' : 'outline'}>
                    Decode
                </Button>
            </div>

            <Select
                onValueChange={(value: 'base64' | 'url' | 'html') => setEncodingType(value)}
                defaultValue={encodingType}
            >
                <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='base64'>Base64</SelectItem>
                    <SelectItem value='url'>URL</SelectItem>
                    <SelectItem value='html'>HTML</SelectItem>
                </SelectContent>
            </Select>

            <Textarea
                placeholder='Enter text here...'
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className='min-h-[200px]'
            />
            <Button onClick={handleProcess}>{isEncoding ? 'Encode' : 'Decode'}</Button>
            <Textarea placeholder='Result...' value={outputText} readOnly className='min-h-[200px] bg-muted/50' />
        </div>
    );
};

export default EncodeTool;
