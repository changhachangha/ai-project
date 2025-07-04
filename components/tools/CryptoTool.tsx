'use client';

import React, { useState } from 'react';
import { CryptoToolInput, CryptoToolOptions, CryptoToolOutput } from '@/lib/types/tools';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { extractPublicKey, generateSampleRSAKey } from '@/lib/tools/crypto';
import { Copy, Key, Download, Server, AlertTriangle, Terminal } from 'lucide-react';

const CryptoTool: React.FC = () => {
    const [privateKeyInput, setPrivateKeyInput] = useState<string>('');
    const [outputFormat, setOutputFormat] = useState<'pem' | 'der' | 'jwk' | 'hex'>('pem');
    const [result, setResult] = useState<CryptoToolOutput | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // SSH 관련 상태
    const [sshHost, setSshHost] = useState<string>('');
    const [sshPort, setSshPort] = useState<string>('22');
    const [sshUsername, setSshUsername] = useState<string>('');
    const [sshFilePath, setSshFilePath] = useState<string>('');
    const [sshAuthMethod, setSshAuthMethod] = useState<'password' | 'key'>('password');
    const [sshKeyPath, setSshKeyPath] = useState<string>('');

    const handleExtractPublicKey = async () => {
        setIsProcessing(true);

        const input: CryptoToolInput = {
            privateKey: privateKeyInput,
            keyFormat: 'auto',
        };

        const options: CryptoToolOptions = {
            outputFormat,
            keyType: 'auto',
        };

        try {
            const output = extractPublicKey(input, options);
            setResult(output);
        } catch (error) {
            setResult({
                publicKey: '',
                keyInfo: { keyType: 'unknown' },
                isValid: false,
                errorMessage: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const generateSSHCommand = () => {
        if (!sshHost || !sshUsername || !sshFilePath) {
            return '';
        }

        let command = 'ssh';

        // 포트 지정 (기본값이 22가 아닌 경우)
        if (sshPort && sshPort !== '22') {
            command += ` -p ${sshPort}`;
        }

        // 키 기반 인증인 경우 키 파일 경로 추가
        if (sshAuthMethod === 'key' && sshKeyPath) {
            command += ` -i ${sshKeyPath}`;
        }

        // 사용자@호스트 및 원격 명령어
        command += ` ${sshUsername}@${sshHost} "cat ${sshFilePath}"`;

        return command;
    };

    const handleGenerateSample = () => {
        const sampleKey = generateSampleRSAKey();
        if (sampleKey) {
            setPrivateKeyInput(sampleKey);
        }
    };

    const handleCopyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error('클립보드 복사 실패:', error);
        }
    };

    const handleDownload = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className='flex flex-col space-y-6 p-6 max-w-4xl mx-auto'>
            <div className='text-center space-y-2'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Key className='h-8 w-8' />
                    암호화 키 도구
                </h1>
                <p className='text-muted-foreground'>
                    개인키를 입력하거나 SSH 명령어를 사용하여 원격 파일을 가져와 공개키를 추출하고 다양한 형식으로
                    변환할 수 있습니다.
                </p>
            </div>

            <Tabs defaultValue='manual' className='w-full'>
                <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value='manual'>직접 입력</TabsTrigger>
                    <TabsTrigger value='ssh'>SSH 명령어</TabsTrigger>
                </TabsList>

                <TabsContent value='manual' className='space-y-4'>
                    <Card>
                        <CardHeader>
                            <CardTitle>개인키 직접 입력</CardTitle>
                            <CardDescription>
                                RSA 개인키를 PEM 형식으로 입력해주세요. (PKCS#1 또는 PKCS#8 지원)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='private-key'>개인키</Label>
                                <Textarea
                                    id='private-key'
                                    placeholder='-----BEGIN RSA PRIVATE KEY-----&#10;또는&#10;-----BEGIN PRIVATE KEY-----&#10;개인키 내용을 여기에 붙여넣기...'
                                    value={privateKeyInput}
                                    onChange={(e) => setPrivateKeyInput(e.target.value)}
                                    className='min-h-[200px] font-mono text-sm'
                                />
                            </div>

                            <div className='flex flex-col sm:flex-row gap-4'>
                                <div className='space-y-2 flex-1'>
                                    <Label htmlFor='output-format'>출력 형식</Label>
                                    <Select
                                        value={outputFormat}
                                        onValueChange={(value: 'pem' | 'der' | 'jwk' | 'hex') => setOutputFormat(value)}
                                    >
                                        <SelectTrigger id='output-format'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='pem'>PEM</SelectItem>
                                            <SelectItem value='der'>DER (Base64)</SelectItem>
                                            <SelectItem value='jwk'>JWK</SelectItem>
                                            <SelectItem value='hex'>HEX</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className='flex flex-col sm:flex-row gap-2'>
                                <Button
                                    onClick={handleExtractPublicKey}
                                    disabled={!privateKeyInput.trim() || isProcessing}
                                    className='flex-1'
                                >
                                    {isProcessing ? '처리 중...' : '공개키 추출'}
                                </Button>
                                <Button
                                    variant='outline'
                                    onClick={handleGenerateSample}
                                    className='flex-1 sm:flex-none'
                                >
                                    샘플 키 생성
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='ssh' className='space-y-4'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Server className='h-5 w-5' />
                                SSH 명령어 생성기
                            </CardTitle>
                            <CardDescription>
                                SSH를 통해 원격 서버의 개인키 파일을 가져오는 SSH 명령어를 생성합니다.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='flex items-start gap-2 p-3 border border-primary/20 bg-primary/5 rounded-md'>
                                <AlertTriangle className='h-4 w-4 text-primary mt-0.5' />
                                <div className='text-sm text-primary'>
                                    <strong>사용 방법:</strong> 아래 정보를 입력하면 SSH 명령어가 생성됩니다. 터미널에서
                                    실행한 후 결과를 위의 &quot;직접 입력&quot; 탭에 붙여넣으세요.
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='ssh-host-cmd'>호스트</Label>
                                    <Input
                                        id='ssh-host-cmd'
                                        placeholder='예: 192.168.1.100'
                                        value={sshHost}
                                        onChange={(e) => setSshHost(e.target.value)}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='ssh-port-cmd'>포트</Label>
                                    <Input
                                        id='ssh-port-cmd'
                                        placeholder='22'
                                        value={sshPort}
                                        onChange={(e) => setSshPort(e.target.value)}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='ssh-username-cmd'>사용자명</Label>
                                    <Input
                                        id='ssh-username-cmd'
                                        placeholder='예: ubuntu, root'
                                        value={sshUsername}
                                        onChange={(e) => setSshUsername(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label>인증 방식</Label>
                                <Select
                                    value={sshAuthMethod}
                                    onValueChange={(value: 'password' | 'key') => setSshAuthMethod(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='password'>비밀번호 인증</SelectItem>
                                        <SelectItem value='key'>키 기반 인증</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {sshAuthMethod === 'key' && (
                                <div className='space-y-2'>
                                    <Label htmlFor='ssh-key-path'>SSH 개인키 파일 경로</Label>
                                    <Input
                                        id='ssh-key-path'
                                        placeholder='예: ~/.ssh/id_rsa, /path/to/private_key'
                                        value={sshKeyPath}
                                        onChange={(e) => setSshKeyPath(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className='space-y-2'>
                                <Label htmlFor='ssh-file-path-cmd'>읽을 파일 경로</Label>
                                <Input
                                    id='ssh-file-path-cmd'
                                    placeholder='예: /home/user/.ssh/id_rsa, /etc/ssl/private/server.key'
                                    value={sshFilePath}
                                    onChange={(e) => setSshFilePath(e.target.value)}
                                />
                            </div>

                            {generateSSHCommand() && (
                                <div className='space-y-2'>
                                    <Label className='flex items-center gap-2'>
                                        <Terminal className='h-4 w-4' />
                                        생성된 SSH 명령어
                                    </Label>
                                    <div className='border rounded-md p-4 bg-card text-card-foreground'>
                                        <div className='flex items-center justify-between gap-2'>
                                            <code className='text-sm font-mono break-all'>{generateSSHCommand()}</code>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => handleCopyToClipboard(generateSSHCommand())}
                                            >
                                                <Copy className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className='text-sm text-muted-foreground space-y-1'>
                                        <p>
                                            이 명령어를 터미널에서 실행한 후, 출력된 개인키를 &quot;직접 입력&quot; 탭에
                                            붙여넣으세요.
                                        </p>
                                        {sshAuthMethod === 'password' && (
                                            <p className='text-amber-600'>
                                                ⚠️ 비밀번호 인증: 명령어 실행 시 비밀번호를 입력하라는 프롬프트가
                                                나타납니다.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className='space-y-3 p-4 border border-border bg-muted rounded-md'>
                                <h4 className='font-semibold text-sm'>사용 예시:</h4>
                                <div className='space-y-2 text-sm text-muted-foreground'>
                                    <p>
                                        <strong>1단계:</strong> 연결 정보 및 인증 방식 선택
                                    </p>
                                    <p>
                                        <strong>2단계:</strong> 생성된 SSH 명령어를 터미널에서 실행
                                    </p>
                                    <p>
                                        <strong>3단계:</strong>{' '}
                                        {sshAuthMethod === 'password' ? '비밀번호 입력 후' : '키 기반 인증으로'} 파일
                                        내용 출력
                                    </p>
                                    <p>
                                        <strong>4단계:</strong> 출력된 개인키를 복사하여 &quot;직접 입력&quot; 탭에
                                        붙여넣기
                                    </p>
                                    <p>
                                        <strong>5단계:</strong> 공개키 추출 실행
                                    </p>
                                </div>

                                <div className='pt-2 border-t border-border'>
                                    <h5 className='font-medium text-sm mb-2'>인증 방식별 특징:</h5>
                                    <div className='space-y-1 text-xs text-muted-foreground'>
                                        <p>
                                            <strong>• 비밀번호 인증:</strong> 명령어 실행 시 대화형으로 비밀번호 입력
                                        </p>
                                        <p>
                                            <strong>• 키 기반 인증:</strong> 미리 설정된 SSH 키를 사용하여 자동 인증
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center justify-between'>
                            <span>결과</span>
                            {result.isValid && (
                                <div className='flex gap-2'>
                                    <span className='px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm'>
                                        {result.keyInfo.keyType.toUpperCase()}
                                        {result.keyInfo.keySize && ` ${result.keyInfo.keySize}bit`}
                                    </span>
                                </div>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {result.isValid ? (
                            <>
                                <div className='space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <Label>공개키 ({outputFormat.toUpperCase()})</Label>
                                        <div className='flex gap-1'>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => handleCopyToClipboard(result.publicKey)}
                                            >
                                                <Copy className='h-4 w-4' />
                                            </Button>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() =>
                                                    handleDownload(
                                                        result.publicKey,
                                                        `public_key.${outputFormat === 'pem' ? 'pem' : 'txt'}`
                                                    )
                                                }
                                            >
                                                <Download className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className='border rounded-md p-4 bg-card text-card-foreground'>
                                        <pre className='whitespace-pre-wrap break-all text-sm font-mono'>
                                            {result.publicKey}
                                        </pre>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                                    <div>
                                        <Label className='text-xs text-muted-foreground'>키 유형</Label>
                                        <p className='font-mono'>{result.keyInfo.keyType.toUpperCase()}</p>
                                    </div>
                                    {result.keyInfo.keySize && (
                                        <div>
                                            <Label className='text-xs text-muted-foreground'>키 크기</Label>
                                            <p className='font-mono'>{result.keyInfo.keySize} bits</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className='text-destructive space-y-2'>
                                <h3 className='font-semibold'>오류 발생</h3>
                                <p className='text-sm'>{result.errorMessage}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card className='bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>사용 방법</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>직접 입력:</strong> RSA 개인키를 PEM 형식으로 직접 붙여넣기
                    </p>
                    <p>
                        • <strong>SSH 명령어:</strong> 원격 서버의 개인키 파일을 가져오는 SSH 명령어 생성
                    </p>
                    <p>
                        • 지원 형식: PKCS#1 (-----BEGIN RSA PRIVATE KEY-----) 또는 PKCS#8 (-----BEGIN PRIVATE KEY-----)
                    </p>
                    <p>• 출력 형식을 선택하여 공개키를 원하는 형태로 변환할 수 있습니다.</p>
                    <p>• 테스트용 샘플 키가 필요하면 &quot;샘플 키 생성&quot; 버튼을 사용하세요.</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default CryptoTool;
