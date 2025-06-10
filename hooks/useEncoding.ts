import { useCallback, useState } from 'react';

// 훅에 전달할 함수의 타입 정의
type EncodeFn = (input: string) => string;
type DecodeFn = (input: string) => string;

interface UseEncodingParams {
    initialMode?: 'encode' | 'decode';
    encodeFn: EncodeFn;
    decodeFn: DecodeFn;
    defaultInput?: string;
    defaultOutput?: string;
}

export const useEncoding = ({
    initialMode = 'encode',
    encodeFn,
    decodeFn,
    defaultInput = '',
    defaultOutput = '결과가 여기에 표시됩니다.',
}: UseEncodingParams) => {
    const [input, setInput] = useState(defaultInput);
    const [output, setOutput] = useState(defaultOutput);
    const [mode, setMode] = useState<'encode' | 'decode'>(initialMode);

    const handleEncode = useCallback(() => {
        try {
            setOutput(encodeFn(input));
        } catch {
            setOutput('인코딩 중 오류가 발생했습니다. 유효한 텍스트를 입력해주세요.');
        }
    }, [input, encodeFn]);

    const handleDecode = useCallback(() => {
        try {
            setOutput(decodeFn(input));
        } catch {
            setOutput('디코딩 중 오류가 발생했습니다. 유효한 문자열을 입력해주세요.');
        }
    }, [input, decodeFn]);

    const handleClear = useCallback(() => {
        setInput('');
        setOutput('결과가 여기에 표시됩니다.');
    }, []);

    const handleCopy = useCallback(() => {
        if (output && output !== '결과가 여기에 표시됩니다.') {
            navigator.clipboard.writeText(output);
        }
    }, [output]);

    const swapInputOutput = useCallback(() => {
        const temp = input;
        setInput(output === defaultOutput ? '' : output);
        setOutput(temp === '' ? defaultOutput : temp);
    }, [input, output, defaultOutput]);

    return {
        input,
        setInput,
        output,
        setOutput,
        mode,
        setMode, // 이제 순수 상태 변경 함수를 반환
        handleEncode,
        handleDecode,
        handleClear,
        handleCopy,
        swapInputOutput, // 새로 추가된 함수
    };
};
