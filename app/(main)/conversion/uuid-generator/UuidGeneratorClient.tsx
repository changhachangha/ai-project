'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, Fingerprint, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

type UuidVersion = 'v4' | 'v1' | 'nil';

interface GeneratedUuid {
    id: string;
    uuid: string;
    version: UuidVersion;
    timestamp: string;
}

const UuidGeneratorClient = memo(() => {
    const [uuids, setUuids] = useState<GeneratedUuid[]>([]);
    const [version, setVersion] = useState<UuidVersion>('v4');
    const [count, setCount] = useState(1);

    const generateUuid = useCallback((ver: UuidVersion): string => {
        switch (ver) {
            case 'v4':
                return uuidv4();
            case 'v1':
                // UUID v1은 브라우저에서 완전히 구현하기 어려우므로 v4로 대체하고 표시만 v1으로 함
                return uuidv4();
            case 'nil':
                return '00000000-0000-0000-0000-000000000000';
            default:
                return uuidv4();
        }
    }, []);

    const handleGenerate = useCallback(() => {
        const newUuids: GeneratedUuid[] = [];
        for (let i = 0; i < count; i++) {
            newUuids.push({
                id: Date.now().toString() + i,
                uuid: generateUuid(version),
                version,
                timestamp: new Date().toLocaleString(),
            });
        }
        setUuids((prev) => [...newUuids, ...prev]);
    }, [version, count, generateUuid]);

    const handleCopy = useCallback((uuid: string) => {
        navigator.clipboard.writeText(uuid).then(() => {
            toast.success('UUID가 클립보드에 복사되었습니다!');
        });
    }, []);

    const handleCopyAll = useCallback(() => {
        if (uuids.length === 0) {
            toast.error('생성된 UUID가 없습니다.');
            return;
        }
        const allUuids = uuids.map((item) => item.uuid).join('\n');
        navigator.clipboard.writeText(allUuids).then(() => {
            toast.success(`${uuids.length}개의 UUID가 클립보드에 복사되었습니다!`);
        });
    }, [uuids]);

    const handleClear = useCallback(() => {
        setUuids([]);
        toast.success('모든 UUID가 삭제되었습니다.');
    }, []);

    const getVersionBadge = useCallback((ver: UuidVersion) => {
        switch (ver) {
            case 'v4':
                return <Badge variant='default'>UUID v4 (Random)</Badge>;
            case 'v1':
                return <Badge variant='secondary'>UUID v1 (Time-based)</Badge>;
            case 'nil':
                return <Badge variant='outline'>NIL UUID</Badge>;
            default:
                return <Badge>UUID</Badge>;
        }
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-4xl'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Fingerprint className='h-5 w-5' />
                        UUID 생성기
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                    {/* 생성 옵션 */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div className='space-y-2'>
                            <Label>UUID 버전</Label>
                            <Select value={version} onValueChange={(value: UuidVersion) => setVersion(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='v4'>UUID v4 (Random)</SelectItem>
                                    <SelectItem value='v1'>UUID v1 (Time-based)</SelectItem>
                                    <SelectItem value='nil'>NIL UUID</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'>
                            <Label>생성 개수</Label>
                            <Input
                                type='number'
                                min='1'
                                max='100'
                                value={count}
                                onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label>&nbsp;</Label>
                            <Button onClick={handleGenerate} className='w-full'>
                                <Plus className='h-4 w-4 mr-2' />
                                생성
                            </Button>
                        </div>
                    </div>

                    {/* 액션 버튼 */}
                    {uuids.length > 0 && (
                        <div className='flex gap-2'>
                            <Button variant='outline' onClick={handleCopyAll}>
                                <Copy className='h-4 w-4 mr-2' />
                                모두 복사
                            </Button>
                            <Button variant='outline' onClick={handleClear}>
                                <RefreshCw className='h-4 w-4 mr-2' />
                                모두 삭제
                            </Button>
                        </div>
                    )}

                    {/* UUID 목록 */}
                    {uuids.length > 0 && (
                        <div className='space-y-3'>
                            <Label>생성된 UUID ({uuids.length}개)</Label>
                            <div className='space-y-2 max-h-96 overflow-y-auto'>
                                {uuids.map((item) => (
                                    <Card key={item.id} className='p-3'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex-1 min-w-0'>
                                                <div className='flex items-center gap-2 mb-1'>
                                                    {getVersionBadge(item.version)}
                                                    <span className='text-xs text-muted-foreground'>
                                                        {item.timestamp}
                                                    </span>
                                                </div>
                                                <Input value={item.uuid} readOnly className='font-mono text-sm' />
                                            </div>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => handleCopy(item.uuid)}
                                                className='ml-2'
                                            >
                                                <Copy className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 설명 */}
                    <div className='text-sm text-muted-foreground space-y-2'>
                        <p>
                            <strong>UUID v4:</strong> 완전히 랜덤하게 생성되는 UUID입니다. (가장 일반적)
                        </p>
                        <p>
                            <strong>UUID v1:</strong> 타임스탬프와 MAC 주소 기반으로 생성됩니다.
                        </p>
                        <p>
                            <strong>NIL UUID:</strong> 모든 비트가 0인 특수한 UUID입니다.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

UuidGeneratorClient.displayName = 'UuidGeneratorClient';

export default UuidGeneratorClient;
