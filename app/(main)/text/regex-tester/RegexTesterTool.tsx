'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useMemo } from 'react';
import { testRegex } from '@/lib/tools/regex';

export default function RegexTesterTool() {
    const [regexStr, setRegexStr] = useState('');
    const [testStr, setTestStr] = useState('');
    const [flags, setFlags] = useState('g');

    const { segments, matchCount, error } = useMemo(() => {
        const result = testRegex(regexStr, flags, testStr);
        return { segments: result.segments, matchCount: result.matchCount, error: result.errorMessage ?? null };
    }, [regexStr, testStr, flags]);

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-2">정규표현식</h2>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-muted-foreground">/</span>
                        <Input
                            placeholder="표현식을 입력하세요"
                            value={regexStr}
                            onChange={(e) => setRegexStr(e.target.value)}
                            className="font-mono flex-1"
                        />
                        <span className="font-mono text-muted-foreground">/</span>
                        <Input
                            placeholder="flags (g, i, m)"
                            value={flags}
                            onChange={(e) => setFlags(e.target.value)}
                            className="font-mono w-24"
                        />
                    </div>
                    {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-2">테스트 문자열</h2>
                    <Textarea
                        placeholder="정규표현식을 테스트할 문자열을 입력하세요..."
                        value={testStr}
                        onChange={(e) => setTestStr(e.target.value)}
                        className="min-h-[200px] font-mono"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-2">결과 ({matchCount}개 일치)</h2>
                    <div className="p-4 rounded-md bg-secondary min-h-[150px] font-mono text-sm whitespace-pre-wrap">
                        {segments.map((segment, index) =>
                            segment.matched ? (
                                <mark key={index}>{segment.text}</mark>
                            ) : (
                                <span key={index}>{segment.text}</span>
                            )
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
