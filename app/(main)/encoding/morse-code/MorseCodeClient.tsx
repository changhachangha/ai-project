'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Radio, ArrowLeftRight, AlertTriangle, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

const MorseCodeClient = memo(() => {
    const [textInput, setTextInput] = useState('');
    const [morseInput, setMorseInput] = useState('');
    const [textOutput, setTextOutput] = useState('');
    const [morseOutput, setMorseOutput] = useState('');
    const [error, setError] = useState('');

    // Morse 코드 매핑
    const morseMap: Record<string, string> = {
        A: '.-',
        B: '-...',
        C: '-.-.',
        D: '-..',
        E: '.',
        F: '..-.',
        G: '--.',
        H: '....',
        I: '..',
        J: '.---',
        K: '-.-',
        L: '.-..',
        M: '--',
        N: '-.',
        O: '---',
        P: '.--.',
        Q: '--.-',
        R: '.-.',
        S: '...',
        T: '-',
        U: '..-',
        V: '...-',
        W: '.--',
        X: '-..-',
        Y: '-.--',
        Z: '--..',
        '0': '-----',
        '1': '.----',
        '2': '..---',
        '3': '...--',
        '4': '....-',
        '5': '.....',
        '6': '-....',
        '7': '--...',
        '8': '---..',
        '9': '----.',
        '.': '.-.-.-',
        ',': '--..--',
        '?': '..--..',
        "'": '.----.',
        '!': '-.-.--',
        '/': '-..-.',
        '(': '-.--.',
        ')': '-.--.-',
        '&': '.-...',
        ':': '---...',
        ';': '-.-.-.',
        '=': '-...-',
        '+': '.-.-.',
        '-': '-....-',
        _: '..--.-',
        '"': '.-..-.',
        $: '...-..-',
        '@': '.--.-.',
    };

    // 역방향 매핑
    const textMap: Record<string, string> = Object.fromEntries(
        Object.entries(morseMap).map(([key, value]) => [value, key])
    );

    const convertTextToMorse = useCallback(() => {
        if (!textInput.trim()) {
            setMorseOutput('');
            setError('');
            return;
        }

        try {
            const morse = textInput
                .toUpperCase()
                .split('')
                .map((char) => {
                    if (char === ' ') return '/';
                    return morseMap[char] || '';
                })
                .filter((code) => code !== '')
                .join(' ');

            setMorseOutput(morse);
            setError('');
            toast.success('텍스트가 Morse 코드로 변환되었습니다!');
        } catch {
            setError('텍스트를 Morse 코드로 변환하는 중 오류가 발생했습니다.');
            setMorseOutput('');
        }
    }, [textInput, morseMap]);

    const convertMorseToText = useCallback(() => {
        if (!morseInput.trim()) {
            setTextOutput('');
            setError('');
            return;
        }

        try {
            const text = morseInput
                .split(' ')
                .map((code) => {
                    if (code === '/') return ' ';
                    return textMap[code] || '';
                })
                .join('');

            setTextOutput(text);
            setError('');
            toast.success('Morse 코드가 텍스트로 변환되었습니다!');
        } catch {
            setError('Morse 코드를 텍스트로 변환하는 중 오류가 발생했습니다.');
            setTextOutput('');
        }
    }, [morseInput, textMap]);

    const handleCopy = useCallback((text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('클립보드에 복사되었습니다!');
        });
    }, []);

    const loadSampleData = useCallback(() => {
        const sampleText = 'HELLO WORLD';
        const sampleMorse = '.... . .-.. .-.. --- / .-- --- .-. .-.. -..';

        setTextInput(sampleText);
        setMorseInput(sampleMorse);
    }, []);

    // Morse 코드 재생 기능 (Web Audio API 사용)
    const playMorse = useCallback((morseCode: string) => {
        if (!morseCode.trim()) return;

        const AudioContextClass =
            window.AudioContext ||
            (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const frequency = 600; // Hz
        const dotDuration = 100; // ms
        const dashDuration = 300; // ms
        const pauseDuration = 100; // ms

        let currentTime = audioContext.currentTime;

        morseCode.split('').forEach((char) => {
            if (char === '.') {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, currentTime);
                oscillator.start(currentTime);
                oscillator.stop(currentTime + dotDuration / 1000);

                currentTime += (dotDuration + pauseDuration) / 1000;
            } else if (char === '-') {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, currentTime);
                oscillator.start(currentTime);
                oscillator.stop(currentTime + dashDuration / 1000);

                currentTime += (dashDuration + pauseDuration) / 1000;
            } else if (char === ' ') {
                currentTime += (pauseDuration * 2) / 1000; // 문자 간 간격
            } else if (char === '/') {
                currentTime += (pauseDuration * 4) / 1000; // 단어 간 간격
            }
        });

        toast.success('Morse 코드 재생을 시작합니다!');
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-6xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Radio className='h-8 w-8' />
                    Morse 코드 변환기
                </h1>
                <p className='text-muted-foreground mt-2'>
                    텍스트를 Morse 코드로 변환하거나 Morse 코드를 텍스트로 변환하세요.
                </p>
            </div>

            <div className='mb-6'>
                <Button onClick={loadSampleData} variant='outline'>
                    샘플 데이터 로드
                </Button>
            </div>

            <Tabs defaultValue='text-to-morse' className='w-full'>
                <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value='text-to-morse'>텍스트 → Morse</TabsTrigger>
                    <TabsTrigger value='morse-to-text'>Morse → 텍스트</TabsTrigger>
                </TabsList>

                <TabsContent value='text-to-morse' className='space-y-4'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-lg'>텍스트 입력</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder='Morse 코드로 변환할 텍스트를 입력하세요...'
                                    className='min-h-[200px] font-mono text-sm'
                                />
                                <div className='mt-4'>
                                    <Button onClick={convertTextToMorse} className='w-full'>
                                        <ArrowLeftRight className='h-4 w-4 mr-2' />
                                        Morse 코드로 변환
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className='flex items-center justify-between'>
                                    <CardTitle className='text-lg'>Morse 코드 출력</CardTitle>
                                    <div className='flex gap-2'>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => playMorse(morseOutput)}
                                            disabled={!morseOutput}
                                        >
                                            <Volume2 className='h-4 w-4 mr-1' />
                                            재생
                                        </Button>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => handleCopy(morseOutput)}
                                            disabled={!morseOutput}
                                        >
                                            <Copy className='h-4 w-4 mr-1' />
                                            복사
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={morseOutput}
                                    readOnly
                                    placeholder='변환된 Morse 코드가 여기에 표시됩니다...'
                                    className='min-h-[200px] font-mono text-sm'
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value='morse-to-text' className='space-y-4'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-lg'>Morse 코드 입력</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={morseInput}
                                    onChange={(e) => setMorseInput(e.target.value)}
                                    placeholder='텍스트로 변환할 Morse 코드를 입력하세요... (예: .... . .-.. .-.. --- / .-- --- .-. .-.. -..)'
                                    className='min-h-[200px] font-mono text-sm'
                                />
                                <div className='mt-4 flex gap-2'>
                                    <Button onClick={convertMorseToText} className='flex-1'>
                                        <ArrowLeftRight className='h-4 w-4 mr-2' />
                                        텍스트로 변환
                                    </Button>
                                    <Button
                                        variant='outline'
                                        onClick={() => playMorse(morseInput)}
                                        disabled={!morseInput}
                                    >
                                        <Volume2 className='h-4 w-4 mr-1' />
                                        재생
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className='flex items-center justify-between'>
                                    <CardTitle className='text-lg'>텍스트 출력</CardTitle>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => handleCopy(textOutput)}
                                        disabled={!textOutput}
                                    >
                                        <Copy className='h-4 w-4 mr-1' />
                                        복사
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={textOutput}
                                    readOnly
                                    placeholder='변환된 텍스트가 여기에 표시됩니다...'
                                    className='min-h-[200px] font-mono text-sm'
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {error && (
                <Alert variant='destructive' className='mt-4'>
                    <AlertTriangle className='h-4 w-4' />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Morse 코드 참조표 */}
            <Card className='mt-6'>
                <CardHeader>
                    <CardTitle className='text-lg'>Morse 코드 참조표</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm'>
                        {Object.entries(morseMap).map(([letter, morse]) => (
                            <div key={letter} className='flex items-center justify-between p-2 bg-muted rounded'>
                                <span className='font-bold'>{letter}</span>
                                <span className='font-mono'>{morse}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className='mt-6 bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>사용 방법 및 규칙</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>문자 구분:</strong> Morse 코드에서 각 문자는 공백으로 구분
                    </p>
                    <p>
                        • <strong>단어 구분:</strong> 단어 간 구분은 &apos;/&apos; 기호 사용
                    </p>
                    <p>
                        • <strong>지원 문자:</strong> 영문자(A-Z), 숫자(0-9), 기본 특수문자
                    </p>
                    <p>
                        • <strong>음성 재생:</strong> Web Audio API를 사용하여 Morse 코드 소리 재생
                    </p>
                    <p>
                        • <strong>점(.):</strong> 짧은 신호, <strong>대시(-):</strong> 긴 신호
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

MorseCodeClient.displayName = 'MorseCodeClient';

export default MorseCodeClient;
