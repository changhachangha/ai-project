'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Copy, FileType, RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';

// Lorem Ipsum 텍스트 데이터
const loremIpsumData = {
    classic: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
        'Nisi ut aliquip ex ea commodo consequat.',
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
        'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.',
        'Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
        'Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.',
        'Et harum quidem rerum facilis est et expedita distinctio.',
    ],
    korean: [
        '가나다라마바사아자차카타파하.',
        '동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세.',
        '무궁화 삼천리 화려강산 대한사람 대한으로 길이 보전하세.',
        '남산 위의 저 소나무 철갑을 두른 듯 바람 서리 불변함은 우리 기상일세.',
        '가을 하늘 공활한데 높고 구름 없이 밝은 달은 우리 가슴 일편단심일세.',
        '이 기상과 이 마음으로 충성을 다하여 괴로우나 즐거우나 나라 사랑하세.',
        '한글은 우리나라의 고유한 문자로서 세계에서 가장 과학적인 문자 중 하나입니다.',
        '세종대왕께서 창제하신 훈민정음은 백성을 사랑하는 마음에서 비롯되었습니다.',
        '우리의 전통과 문화를 소중히 여기며 발전시켜 나가야 합니다.',
        '미래를 향해 나아가는 대한민국의 힘찬 발걸음을 응원합니다.',
    ],
    tech: [
        'JavaScript는 웹 개발에서 가장 중요한 프로그래밍 언어 중 하나입니다.',
        'React는 사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리입니다.',
        'Node.js는 서버 사이드 JavaScript 런타임 환경입니다.',
        'TypeScript는 JavaScript에 정적 타입을 추가한 언어입니다.',
        'Next.js는 React 기반의 풀스택 웹 애플리케이션 프레임워크입니다.',
        'Tailwind CSS는 유틸리티 우선 CSS 프레임워크입니다.',
        'Git은 분산 버전 관리 시스템으로 개발자들이 협업할 때 사용합니다.',
        'Docker는 컨테이너화 기술을 통해 애플리케이션 배포를 간소화합니다.',
        'AWS는 클라우드 컴퓨팅 서비스를 제공하는 플랫폼입니다.',
        'MongoDB는 NoSQL 데이터베이스로 유연한 스키마를 제공합니다.',
    ],
};

type LoremType = 'classic' | 'korean' | 'tech';

export default function LoremIpsumClient() {
    const [type, setType] = useState<LoremType>('classic');
    const [paragraphs, setParagraphs] = useState(3);
    const [sentences, setSentences] = useState(5);
    const [words, setWords] = useState(50);
    const [generatedText, setGeneratedText] = useState('');
    const [outputType, setOutputType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');

    const generateText = () => {
        const sourceText = loremIpsumData[type];
        let result = '';

        switch (outputType) {
            case 'paragraphs':
                for (let i = 0; i < paragraphs; i++) {
                    const paragraph = [];
                    for (let j = 0; j < sentences; j++) {
                        paragraph.push(sourceText[Math.floor(Math.random() * sourceText.length)]);
                    }
                    result += paragraph.join(' ') + '\n\n';
                }
                break;

            case 'sentences':
                for (let i = 0; i < sentences; i++) {
                    result += sourceText[Math.floor(Math.random() * sourceText.length)] + ' ';
                }
                break;

            case 'words':
                const allWords = sourceText.join(' ').split(' ');
                for (let i = 0; i < words; i++) {
                    result += allWords[Math.floor(Math.random() * allWords.length)] + ' ';
                }
                break;
        }

        setGeneratedText(result.trim());
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedText);
            toast.success('텍스트가 클립보드에 복사되었습니다!');
        } catch {
            toast.error('클립보드 복사에 실패했습니다.');
        }
    };

    const handleDownload = () => {
        const blob = new Blob([generatedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lorem-ipsum-${type}-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('파일이 다운로드되었습니다!');
    };

    const handleClear = () => {
        setGeneratedText('');
    };

    return (
        <div className='container mx-auto px-4 py-8 max-w-4xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold mb-4 flex items-center justify-center gap-2'>
                    <FileType className='h-8 w-8' />
                    Lorem Ipsum 생성기
                </h1>
                <p className='text-muted-foreground'>
                    다양한 형태의 더미 텍스트를 생성하여 디자인과 개발에 활용하세요.
                </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* 설정 패널 */}
                <Card>
                    <CardHeader>
                        <CardTitle>생성 설정</CardTitle>
                        <CardDescription>원하는 형태의 텍스트를 설정하세요</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        <div className='space-y-2'>
                            <Label htmlFor='type'>텍스트 유형</Label>
                            <Select value={type} onValueChange={(value: LoremType) => setType(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='텍스트 유형 선택' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='classic'>클래식 Lorem Ipsum</SelectItem>
                                    <SelectItem value='korean'>한국어 더미 텍스트</SelectItem>
                                    <SelectItem value='tech'>기술 관련 텍스트</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='outputType'>출력 형태</Label>
                            <Select
                                value={outputType}
                                onValueChange={(value: 'paragraphs' | 'sentences' | 'words') => setOutputType(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='출력 형태 선택' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='paragraphs'>문단</SelectItem>
                                    <SelectItem value='sentences'>문장</SelectItem>
                                    <SelectItem value='words'>단어</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {outputType === 'paragraphs' && (
                            <>
                                <div className='space-y-2'>
                                    <Label htmlFor='paragraphs'>문단 수</Label>
                                    <Input
                                        id='paragraphs'
                                        type='number'
                                        min='1'
                                        max='20'
                                        value={paragraphs}
                                        onChange={(e) => setParagraphs(parseInt(e.target.value) || 1)}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='sentences'>문단당 문장 수</Label>
                                    <Input
                                        id='sentences'
                                        type='number'
                                        min='1'
                                        max='20'
                                        value={sentences}
                                        onChange={(e) => setSentences(parseInt(e.target.value) || 1)}
                                    />
                                </div>
                            </>
                        )}

                        {outputType === 'sentences' && (
                            <div className='space-y-2'>
                                <Label htmlFor='sentences'>문장 수</Label>
                                <Input
                                    id='sentences'
                                    type='number'
                                    min='1'
                                    max='50'
                                    value={sentences}
                                    onChange={(e) => setSentences(parseInt(e.target.value) || 1)}
                                />
                            </div>
                        )}

                        {outputType === 'words' && (
                            <div className='space-y-2'>
                                <Label htmlFor='words'>단어 수</Label>
                                <Input
                                    id='words'
                                    type='number'
                                    min='1'
                                    max='500'
                                    value={words}
                                    onChange={(e) => setWords(parseInt(e.target.value) || 1)}
                                />
                            </div>
                        )}

                        <div className='flex gap-2'>
                            <Button onClick={generateText} className='flex-1'>
                                <RefreshCw className='w-4 h-4 mr-2' />
                                생성하기
                            </Button>
                            <Button variant='outline' onClick={handleClear}>
                                초기화
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 결과 패널 */}
                <Card>
                    <CardHeader>
                        <CardTitle>생성된 텍스트</CardTitle>
                        <CardDescription>생성된 더미 텍스트를 확인하고 복사하세요</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <Textarea
                                value={generatedText}
                                onChange={(e) => setGeneratedText(e.target.value)}
                                placeholder='생성하기 버튼을 클릭하여 텍스트를 생성하세요...'
                                className='min-h-[300px] resize-none'
                            />

                            <div className='flex gap-2'>
                                <Button onClick={handleCopy} disabled={!generatedText} className='flex-1'>
                                    <Copy className='w-4 h-4 mr-2' />
                                    복사
                                </Button>
                                <Button variant='outline' onClick={handleDownload} disabled={!generatedText}>
                                    <Download className='w-4 h-4 mr-2' />
                                    다운로드
                                </Button>
                            </div>

                            {generatedText && (
                                <div className='text-sm text-muted-foreground'>
                                    <p>문자 수: {generatedText.length}</p>
                                    <p>단어 수: {generatedText.split(' ').length}</p>
                                    <p>문장 수: {generatedText.split('.').length - 1}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
