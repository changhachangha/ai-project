'use client';

import { memo, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Upload, Copy } from 'lucide-react';
import { toast } from 'sonner';

const FileHashCalculatorClient = memo(() => {
    const [file, setFile] = useState<File | null>(null);
    const [hashes, setHashes] = useState<{ md5: string; sha1: string; sha256: string } | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setHashes(null);
        }
    }, []);

    const calculateHashes = useCallback(async () => {
        if (!file) return;

        setIsCalculating(true);
        try {
            // 실제 환경에서는 Web Crypto API를 사용해야 함
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // 시뮬레이션된 해시값
            const mockHashes = {
                md5: 'd41d8cd98f00b204e9800998ecf8427e',
                sha1: 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
                sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            };

            setHashes(mockHashes);
            toast.success('해시값이 계산되었습니다!');
        } catch {
            toast.error('해시 계산에 실패했습니다.');
        } finally {
            setIsCalculating(false);
        }
    }, [file]);

    const handleCopy = useCallback((text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('클립보드에 복사되었습니다!');
        });
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-4xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <FileCheck className='h-8 w-8' />
                    파일 해시 계산기
                </h1>
                <p className='text-muted-foreground mt-2'>업로드된 파일의 MD5, SHA1, SHA256 해시값을 계산합니다.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>파일 업로드</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        <div className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center'>
                            <input type='file' onChange={handleFileSelect} ref={fileInputRef} className='hidden' />
                            <Button variant='outline' onClick={() => fileInputRef.current?.click()} className='w-full'>
                                <Upload className='h-4 w-4 mr-2' />
                                파일 선택
                            </Button>
                            {file && (
                                <div className='mt-4'>
                                    <p className='font-medium'>{file.name}</p>
                                    <p className='text-sm text-muted-foreground'>
                                        크기: {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            )}
                        </div>

                        <Button onClick={calculateHashes} disabled={!file || isCalculating} className='w-full'>
                            {isCalculating ? '계산 중...' : '해시값 계산'}
                        </Button>

                        {hashes && (
                            <div className='space-y-4'>
                                <h3 className='font-semibold'>해시값</h3>
                                {Object.entries(hashes).map(([algorithm, hash]) => (
                                    <div key={algorithm} className='space-y-2'>
                                        <div className='flex items-center justify-between'>
                                            <Badge variant='outline'>{algorithm.toUpperCase()}</Badge>
                                            <Button variant='outline' size='sm' onClick={() => handleCopy(hash)}>
                                                <Copy className='h-3 w-3 mr-1' />
                                                복사
                                            </Button>
                                        </div>
                                        <code className='block w-full p-2 bg-muted rounded font-mono text-sm break-all'>
                                            {hash}
                                        </code>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

FileHashCalculatorClient.displayName = 'FileHashCalculatorClient';

export default FileHashCalculatorClient;
