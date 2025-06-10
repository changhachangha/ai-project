'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useMemo } from 'react';

export default function RegexTesterTool() {
    const [regexStr, setRegexStr] = useState('');
    const [testStr, setTestStr] = useState('');
    const [flags, setFlags] = useState('g');

    const { highlightedText, matchCount, error } = useMemo(() => {
        if (!regexStr) {
            return { highlightedText: testStr, matchCount: 0, error: null };
        }

        try {
            const regex = new RegExp(regexStr, flags);
            let count = 0;
            const highlighted = testStr.replace(regex, (match) => {
                count++;
                return `<mark>${match}</mark>`;
            });
            return { highlightedText: highlighted, matchCount: count, error: null };
        } catch (e) {
            // --- 수정: 'any' 타입 대신 'unknown' 또는 'Error' 타입으로 처리 ---
            const errorMessage = e instanceof Error ? e.message : String(e);
            return { highlightedText: testStr, matchCount: 0, error: errorMessage };
        }
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
                    <div
                        className="p-4 rounded-md bg-secondary min-h-[150px] font-mono text-sm whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: highlightedText.replace(/\n/g, '<br />') }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
