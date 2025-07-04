'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Code, AlertTriangle, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';
import yaml from 'js-yaml';

const YamlJsonConverterClient = memo(() => {
    const [yamlInput, setYamlInput] = useState('');
    const [jsonInput, setJsonInput] = useState('');
    const [yamlOutput, setYamlOutput] = useState('');
    const [jsonOutput, setJsonOutput] = useState('');
    const [yamlError, setYamlError] = useState('');
    const [jsonError, setJsonError] = useState('');

    const convertYamlToJson = useCallback(() => {
        if (!yamlInput.trim()) {
            setJsonError('YAML 입력이 비어있습니다.');
            setJsonOutput('');
            return;
        }

        try {
            const parsed = yaml.load(yamlInput);
            const jsonString = JSON.stringify(parsed, null, 2);
            setJsonOutput(jsonString);
            setJsonError('');
            toast.success('YAML이 JSON으로 변환되었습니다!');
        } catch (error) {
            setJsonError(error instanceof Error ? error.message : 'YAML 파싱 중 오류가 발생했습니다.');
            setJsonOutput('');
        }
    }, [yamlInput]);

    const convertJsonToYaml = useCallback(() => {
        if (!jsonInput.trim()) {
            setYamlError('JSON 입력이 비어있습니다.');
            setYamlOutput('');
            return;
        }

        try {
            const parsed = JSON.parse(jsonInput);
            const yamlString = yaml.dump(parsed, {
                indent: 2,
                lineWidth: 80,
                noRefs: true,
            });
            setYamlOutput(yamlString);
            setYamlError('');
            toast.success('JSON이 YAML로 변환되었습니다!');
        } catch (error) {
            setYamlError(error instanceof Error ? error.message : 'JSON 파싱 중 오류가 발생했습니다.');
            setYamlOutput('');
        }
    }, [jsonInput]);

    const handleCopy = useCallback((text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('클립보드에 복사되었습니다!');
        });
    }, []);

    const loadSampleData = useCallback(() => {
        const sampleYaml = `# 샘플 YAML 데이터
name: John Doe
age: 30
address:
  street: 123 Main St
  city: New York
  zipcode: 10001
hobbies:
  - reading
  - swimming
  - coding
contact:
  email: john@example.com
  phone: "+1-555-123-4567"
active: true`;

        const sampleJson = `{
  "name": "John Doe",
  "age": 30,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipcode": 10001
  },
  "hobbies": [
    "reading",
    "swimming",
    "coding"
  ],
  "contact": {
    "email": "john@example.com",
    "phone": "+1-555-123-4567"
  },
  "active": true
}`;

        setYamlInput(sampleYaml);
        setJsonInput(sampleJson);
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-6xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Code className='h-8 w-8' />
                    YAML ↔️ JSON 변환기
                </h1>
                <p className='text-muted-foreground mt-2'>YAML과 JSON 형식 간 데이터를 쉽게 변환하세요.</p>
            </div>

            <div className='mb-6'>
                <Button onClick={loadSampleData} variant='outline'>
                    샘플 데이터 로드
                </Button>
            </div>

            <Tabs defaultValue='yaml-to-json' className='w-full'>
                <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value='yaml-to-json'>YAML → JSON</TabsTrigger>
                    <TabsTrigger value='json-to-yaml'>JSON → YAML</TabsTrigger>
                </TabsList>

                <TabsContent value='yaml-to-json' className='space-y-4'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-lg'>YAML 입력</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={yamlInput}
                                    onChange={(e) => setYamlInput(e.target.value)}
                                    placeholder='YAML 데이터를 입력하세요...'
                                    className='min-h-[300px] font-mono text-sm'
                                />
                                <div className='mt-4 flex gap-2'>
                                    <Button onClick={convertYamlToJson} className='flex-1'>
                                        <ArrowLeftRight className='h-4 w-4 mr-2' />
                                        JSON으로 변환
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className='flex items-center justify-between'>
                                    <CardTitle className='text-lg'>JSON 출력</CardTitle>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => handleCopy(jsonOutput)}
                                        disabled={!jsonOutput}
                                    >
                                        <Copy className='h-4 w-4 mr-1' />
                                        복사
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {jsonError && (
                                    <Alert variant='destructive' className='mb-4'>
                                        <AlertTriangle className='h-4 w-4' />
                                        <AlertDescription>{jsonError}</AlertDescription>
                                    </Alert>
                                )}
                                <Textarea
                                    value={jsonOutput}
                                    readOnly
                                    placeholder='변환된 JSON이 여기에 표시됩니다...'
                                    className='min-h-[300px] font-mono text-sm'
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value='json-to-yaml' className='space-y-4'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-lg'>JSON 입력</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                    placeholder='JSON 데이터를 입력하세요...'
                                    className='min-h-[300px] font-mono text-sm'
                                />
                                <div className='mt-4 flex gap-2'>
                                    <Button onClick={convertJsonToYaml} className='flex-1'>
                                        <ArrowLeftRight className='h-4 w-4 mr-2' />
                                        YAML로 변환
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className='flex items-center justify-between'>
                                    <CardTitle className='text-lg'>YAML 출력</CardTitle>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => handleCopy(yamlOutput)}
                                        disabled={!yamlOutput}
                                    >
                                        <Copy className='h-4 w-4 mr-1' />
                                        복사
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {yamlError && (
                                    <Alert variant='destructive' className='mb-4'>
                                        <AlertTriangle className='h-4 w-4' />
                                        <AlertDescription>{yamlError}</AlertDescription>
                                    </Alert>
                                )}
                                <Textarea
                                    value={yamlOutput}
                                    readOnly
                                    placeholder='변환된 YAML이 여기에 표시됩니다...'
                                    className='min-h-[300px] font-mono text-sm'
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <Card className='mt-6 bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>사용 방법</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>YAML → JSON:</strong> YAML 형식의 데이터를 JSON으로 변환
                    </p>
                    <p>
                        • <strong>JSON → YAML:</strong> JSON 형식의 데이터를 YAML로 변환
                    </p>
                    <p>
                        • <strong>샘플 데이터:</strong> 예제 데이터를 로드하여 변환 테스트
                    </p>
                    <p>
                        • <strong>오류 검증:</strong> 잘못된 형식의 데이터 입력 시 오류 메시지 표시
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

YamlJsonConverterClient.displayName = 'YamlJsonConverterClient';

export default YamlJsonConverterClient;
