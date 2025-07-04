'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, FileCode, AlertTriangle, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import * as prettier from 'prettier';

type CodeLanguage = 'javascript' | 'typescript' | 'css' | 'html' | 'json' | 'markdown';

const CodeFormatterClient = memo(() => {
    const [code, setCode] = useState('');
    const [formattedCode, setFormattedCode] = useState('');
    const [language, setLanguage] = useState<CodeLanguage>('javascript');
    const [error, setError] = useState('');

    const formatCode = useCallback(async () => {
        if (!code.trim()) {
            setError('코드를 입력해주세요.');
            setFormattedCode('');
            return;
        }

        try {
            let parser: string;
            switch (language) {
                case 'javascript':
                    parser = 'babel';
                    break;
                case 'typescript':
                    parser = 'typescript';
                    break;
                case 'css':
                    parser = 'css';
                    break;
                case 'html':
                    parser = 'html';
                    break;
                case 'json':
                    parser = 'json';
                    break;
                case 'markdown':
                    parser = 'markdown';
                    break;
                default:
                    parser = 'babel';
            }

            const formatted = await prettier.format(code, {
                parser,
                printWidth: 80,
                tabWidth: 2,
                useTabs: false,
                semi: true,
                singleQuote: true,
                quoteProps: 'as-needed',
                trailingComma: 'es5',
                bracketSpacing: true,
                arrowParens: 'always',
            });

            setFormattedCode(formatted);
            setError('');
            toast.success('코드가 포맷팅되었습니다!');
        } catch (err) {
            setError(err instanceof Error ? err.message : '코드 포맷팅 중 오류가 발생했습니다.');
            setFormattedCode('');
        }
    }, [code, language]);

    const handleCopy = useCallback((text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('클립보드에 복사되었습니다!');
        });
    }, []);

    const loadSampleCode = useCallback(() => {
        const samples: Record<CodeLanguage, string> = {
            javascript: `function calculateSum(a,b){
if(typeof a!=='number'||typeof b!=='number'){
throw new Error('Both arguments must be numbers');
}
return a+b;
}

const result=calculateSum(5,3);
console.log('Result:',result);`,
            typescript: `interface User{
name:string;
age:number;
email?:string;
}

class UserService{
private users:User[]=[];

addUser(user:User):void{
this.users.push(user);
}

getUser(name:string):User|undefined{
return this.users.find(u=>u.name===name);
}
}`,
            css: `body{margin:0;padding:0;font-family:Arial,sans-serif;}
.container{max-width:1200px;margin:0 auto;padding:20px;}
.header{background-color:#333;color:white;padding:1rem;text-align:center;}
.button{background-color:#007bff;color:white;padding:10px 20px;border:none;border-radius:4px;cursor:pointer;}
.button:hover{background-color:#0056b3;}`,
            html: `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sample Page</title>
</head>
<body>
<div class="container">
<h1>Welcome</h1>
<p>This is a sample HTML page.</p>
<button onclick="alert('Hello!')">Click me</button>
</div>
</body>
</html>`,
            json: `{"name":"John Doe","age":30,"address":{"street":"123 Main St","city":"New York","zipcode":10001},"hobbies":["reading","swimming","coding"],"contact":{"email":"john@example.com","phone":"+1-555-123-4567"},"active":true}`,
            markdown: `# Sample Markdown

## Introduction
This is a **sample** markdown document with various elements.

### Code Example
\`\`\`javascript
function hello() {
console.log('Hello, World!');
}
\`\`\`

### List
- Item 1
- Item 2
- Item 3

### Links
[Visit GitHub](https://github.com)`,
        };

        setCode(samples[language]);
    }, [language]);

    return (
        <div className='container mx-auto p-4 max-w-6xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <FileCode className='h-8 w-8' />
                    코드 포맷터
                </h1>
                <p className='text-muted-foreground mt-2'>다양한 프로그래밍 언어의 코드를 정리하고 포맷팅하세요.</p>
            </div>

            <div className='mb-6 flex flex-col sm:flex-row gap-4'>
                <div className='flex-1'>
                    <Select value={language} onValueChange={(value: CodeLanguage) => setLanguage(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder='언어 선택' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='javascript'>JavaScript</SelectItem>
                            <SelectItem value='typescript'>TypeScript</SelectItem>
                            <SelectItem value='css'>CSS</SelectItem>
                            <SelectItem value='html'>HTML</SelectItem>
                            <SelectItem value='json'>JSON</SelectItem>
                            <SelectItem value='markdown'>Markdown</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={loadSampleCode} variant='outline'>
                    샘플 코드 로드
                </Button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg'>코드 입력</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder='포맷팅할 코드를 입력하세요...'
                            className='min-h-[400px] font-mono text-sm'
                        />
                        <div className='mt-4'>
                            <Button onClick={formatCode} className='w-full'>
                                <Wand2 className='h-4 w-4 mr-2' />
                                코드 포맷팅
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='text-lg'>포맷팅된 코드</CardTitle>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => handleCopy(formattedCode)}
                                disabled={!formattedCode}
                            >
                                <Copy className='h-4 w-4 mr-1' />
                                복사
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant='destructive' className='mb-4'>
                                <AlertTriangle className='h-4 w-4' />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Textarea
                            value={formattedCode}
                            readOnly
                            placeholder='포맷팅된 코드가 여기에 표시됩니다...'
                            className='min-h-[400px] font-mono text-sm'
                        />
                    </CardContent>
                </Card>
            </div>

            <Card className='mt-6 bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>지원 언어 및 기능</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>JavaScript/TypeScript:</strong> 세미콜론, 들여쓰기, 따옴표 스타일 통일
                    </p>
                    <p>
                        • <strong>CSS:</strong> 속성 정렬, 들여쓰기, 공백 정리
                    </p>
                    <p>
                        • <strong>HTML:</strong> 태그 정렬, 들여쓰기, 속성 정리
                    </p>
                    <p>
                        • <strong>JSON:</strong> 들여쓰기, 키 정렬, 공백 정리
                    </p>
                    <p>
                        • <strong>Markdown:</strong> 헤더, 리스트, 링크 포맷팅
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

CodeFormatterClient.displayName = 'CodeFormatterClient';

export default CodeFormatterClient;
