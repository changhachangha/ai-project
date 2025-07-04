'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, Database, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'sql-formatter';

type SqlLanguage = 'sql' | 'mysql' | 'postgresql' | 'sqlite' | 'plsql' | 'tsql';

interface FormatOptions {
    language: SqlLanguage;
    uppercase: boolean;
    linesBetweenQueries: number;
    indentSize: number;
}

const SqlFormatterClient = memo(() => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [isFormatting, setIsFormatting] = useState(false);

    const [options, setOptions] = useState<FormatOptions>({
        language: 'sql',
        uppercase: true,
        linesBetweenQueries: 2,
        indentSize: 2,
    });

    const formatSql = useCallback(async () => {
        if (!input.trim()) {
            setError('SQL 쿼리를 입력해주세요.');
            setOutput('');
            return;
        }

        setIsFormatting(true);
        setError('');

        try {
            const formatted = format(input, {
                language: options.language,
                keywordCase: options.uppercase ? 'upper' : 'lower',
                linesBetweenQueries: options.linesBetweenQueries,
                indentStyle: 'standard',
                tabWidth: options.indentSize,
            });

            setOutput(formatted);
            toast.success('SQL이 포매팅되었습니다!');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'SQL 포매팅 중 오류가 발생했습니다.';
            setError(errorMessage);
            setOutput('');
            toast.error('SQL 포매팅에 실패했습니다.');
        } finally {
            setIsFormatting(false);
        }
    }, [input, options]);

    const handleCopy = useCallback(() => {
        if (!output) {
            toast.error('먼저 SQL을 포매팅해주세요.');
            return;
        }
        navigator.clipboard.writeText(output).then(() => {
            toast.success('포매팅된 SQL이 클립보드에 복사되었습니다!');
        });
    }, [output]);

    const handleOptionChange = useCallback((key: keyof FormatOptions, value: unknown) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    }, []);

    const sampleQueries = [
        {
            name: '기본 SELECT',
            query: "select id,name,email from users where status=1 and created_at>'2023-01-01' order by name;",
        },
        {
            name: 'JOIN 쿼리',
            query: 'select u.name,p.title from users u inner join posts p on u.id=p.user_id where u.status=1;',
        },
        {
            name: '복잡한 쿼리',
            query: 'select count(*) as total,(select avg(age) from users) as avg_age from users where age between 20 and 30 group by department having count(*)>5;',
        },
    ];

    return (
        <div className='container mx-auto p-4 max-w-6xl'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Database className='h-5 w-5' />
                        SQL 포매터
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                    {/* 옵션 */}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                        <div className='space-y-2'>
                            <Label className='text-sm'>SQL 방언</Label>
                            <Select
                                value={options.language}
                                onValueChange={(value: SqlLanguage) => handleOptionChange('language', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='sql'>Standard SQL</SelectItem>
                                    <SelectItem value='mysql'>MySQL</SelectItem>
                                    <SelectItem value='postgresql'>PostgreSQL</SelectItem>
                                    <SelectItem value='sqlite'>SQLite</SelectItem>
                                    <SelectItem value='oracle'>Oracle</SelectItem>
                                    <SelectItem value='mssql'>SQL Server</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label className='text-sm'>키워드 대소문자</Label>
                            <Select
                                value={options.uppercase ? 'upper' : 'lower'}
                                onValueChange={(value) => handleOptionChange('uppercase', value === 'upper')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='upper'>대문자</SelectItem>
                                    <SelectItem value='lower'>소문자</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label className='text-sm'>들여쓰기 크기</Label>
                            <Select
                                value={options.indentSize.toString()}
                                onValueChange={(value) => handleOptionChange('indentSize', parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='2'>2 스페이스</SelectItem>
                                    <SelectItem value='4'>4 스페이스</SelectItem>
                                    <SelectItem value='8'>8 스페이스</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label className='text-sm'>쿼리 간 간격</Label>
                            <Select
                                value={options.linesBetweenQueries.toString()}
                                onValueChange={(value) => handleOptionChange('linesBetweenQueries', parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='1'>1줄</SelectItem>
                                    <SelectItem value='2'>2줄</SelectItem>
                                    <SelectItem value='3'>3줄</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* 샘플 쿼리 */}
                    <div className='space-y-2'>
                        <Label>샘플 쿼리</Label>
                        <div className='flex gap-2 flex-wrap'>
                            {sampleQueries.map((sample, index) => (
                                <Button key={index} variant='outline' size='sm' onClick={() => setInput(sample.query)}>
                                    {sample.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        {/* 입력 */}
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <Label>SQL 입력</Label>
                                <Badge variant='outline'>{input.length} 문자</Badge>
                            </div>
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder='포매팅할 SQL 쿼리를 입력하세요...'
                                className='min-h-80 font-mono text-sm resize-none'
                            />
                        </div>

                        {/* 출력 */}
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <Label>포매팅된 SQL</Label>
                                <div className='flex items-center gap-2'>
                                    {output && <Badge variant='default'>{output.split('\n').length} 줄</Badge>}
                                    <Button variant='outline' size='sm' onClick={handleCopy} disabled={!output}>
                                        <Copy className='h-4 w-4 mr-1' />
                                        복사
                                    </Button>
                                </div>
                            </div>
                            <Textarea
                                value={output}
                                readOnly
                                placeholder='포매팅된 SQL이 여기에 표시됩니다...'
                                className='min-h-80 font-mono text-sm bg-muted/50 resize-none'
                            />
                        </div>
                    </div>

                    {/* 포매팅 버튼 */}
                    <Button onClick={formatSql} disabled={isFormatting || !input.trim()} className='w-full'>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isFormatting ? 'animate-spin' : ''}`} />
                        {isFormatting ? '포매팅 중...' : 'SQL 포매팅'}
                    </Button>

                    {/* 오류 표시 */}
                    {error && (
                        <div className='flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg'>
                            <AlertTriangle className='h-4 w-4 text-destructive mt-0.5' />
                            <div className='text-sm text-destructive'>
                                <strong>포매팅 오류:</strong> {error}
                            </div>
                        </div>
                    )}

                    {/* 사용 팁 */}
                    <div className='text-sm text-muted-foreground space-y-2'>
                        <p>
                            <strong>지원 기능:</strong>
                        </p>
                        <ul className='list-disc list-inside space-y-1'>
                            <li>다양한 SQL 방언 지원 (MySQL, PostgreSQL, SQLite 등)</li>
                            <li>키워드 대소문자 변환</li>
                            <li>들여쓰기 및 줄바꿈 최적화</li>
                            <li>복잡한 JOIN, 서브쿼리, CTE 포매팅</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

SqlFormatterClient.displayName = 'SqlFormatterClient';

export default SqlFormatterClient;
