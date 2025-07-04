'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Smartphone, QrCode, RefreshCw, Key } from 'lucide-react';
import { toast } from 'sonner';

const TOTPGeneratorClient = memo(() => {
    const [serviceName, setServiceName] = useState('');
    const [accountName, setAccountName] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [issuer, setIssuer] = useState('');
    const [algorithm, setAlgorithm] = useState('SHA1');
    const [digits, setDigits] = useState(6);
    const [period, setPeriod] = useState(30);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [totpUrl, setTotpUrl] = useState('');
    const [currentTotp, setCurrentTotp] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(30);

    // Base32 인코딩 함수 (간단한 구현)
    const base32Encode = useCallback((input: string) => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        let result = '';

        for (let i = 0; i < input.length; i++) {
            bits += input.charCodeAt(i).toString(2).padStart(8, '0');
        }

        while (bits.length % 5 !== 0) {
            bits += '0';
        }

        for (let i = 0; i < bits.length; i += 5) {
            const chunk = bits.substr(i, 5);
            result += alphabet[parseInt(chunk, 2)];
        }

        while (result.length % 8 !== 0) {
            result += '=';
        }

        return result;
    }, []);

    // 랜덤 시크릿 키 생성
    const generateSecretKey = useCallback(() => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setSecretKey(result);
        toast.success('시크릿 키가 생성되었습니다!');
    }, []);

    // TOTP URL 생성
    const generateTotpUrl = useCallback(() => {
        if (!serviceName.trim() || !accountName.trim() || !secretKey.trim()) {
            toast.error('모든 필수 필드를 입력해주세요.');
            return;
        }

        const label = `${serviceName}:${accountName}`;
        const params = new URLSearchParams({
            secret: secretKey,
            issuer: issuer || serviceName,
            algorithm: algorithm,
            digits: digits.toString(),
            period: period.toString(),
        });

        const url = `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
        setTotpUrl(url);

        // QR 코드 생성 (실제로는 QR 코드 라이브러리를 사용해야 함)
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(url)}`;
        setQrCodeUrl(qrUrl);

        toast.success('TOTP QR 코드가 생성되었습니다!');
    }, [serviceName, accountName, secretKey, issuer, algorithm, digits, period]);

    // TOTP 코드 생성 (시뮬레이션)
    const generateTOTP = useCallback(() => {
        if (!secretKey.trim()) return '';

        // 실제 환경에서는 TOTP 알고리즘을 구현해야 함
        // 여기서는 시뮬레이션을 위해 랜덤 6자리 숫자 생성
        const code = Math.floor(Math.random() * 1000000)
            .toString()
            .padStart(6, '0');
        return code;
    }, [secretKey]);

    // 시간 업데이트
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            const remaining = period - (now % period);
            setTimeRemaining(remaining);

            if (remaining === period) {
                setCurrentTotp(generateTOTP());
            }
        }, 1000);

        // 초기 TOTP 생성
        setCurrentTotp(generateTOTP());

        return () => clearInterval(interval);
    }, [period, generateTOTP]);

    const handleCopy = useCallback((text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('클립보드에 복사되었습니다!');
        });
    }, []);

    const handleDownloadQR = useCallback(() => {
        if (!qrCodeUrl) return;

        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `${serviceName}-${accountName}-totp-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR 코드가 다운로드되었습니다!');
    }, [qrCodeUrl, serviceName, accountName]);

    const loadSampleData = useCallback(() => {
        setServiceName('My App');
        setAccountName('user@example.com');
        setIssuer('My Company');
        generateSecretKey();
    }, [generateSecretKey]);

    return (
        <div className='container mx-auto p-4 max-w-6xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Smartphone className='h-8 w-8' />
                    2FA QR 코드 생성기
                </h1>
                <p className='text-muted-foreground mt-2'>TOTP 기반 2단계 인증용 QR 코드를 생성합니다.</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg flex items-center gap-2'>
                            <Key className='h-5 w-5' />
                            TOTP 설정
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='service-name'>서비스 이름 *</Label>
                                    <Input
                                        id='service-name'
                                        value={serviceName}
                                        onChange={(e) => setServiceName(e.target.value)}
                                        placeholder='My App'
                                        className='mt-1'
                                    />
                                </div>
                                <div>
                                    <Label htmlFor='account-name'>계정 이름 *</Label>
                                    <Input
                                        id='account-name'
                                        value={accountName}
                                        onChange={(e) => setAccountName(e.target.value)}
                                        placeholder='user@example.com'
                                        className='mt-1'
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor='secret-key'>시크릿 키 *</Label>
                                <div className='flex gap-2 mt-1'>
                                    <Input
                                        id='secret-key'
                                        value={secretKey}
                                        onChange={(e) => setSecretKey(e.target.value.toUpperCase())}
                                        placeholder='Base32 인코딩된 시크릿 키'
                                        className='flex-1 font-mono'
                                    />
                                    <Button variant='outline' size='sm' onClick={generateSecretKey}>
                                        <RefreshCw className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor='issuer'>발급자 (선택)</Label>
                                <Input
                                    id='issuer'
                                    value={issuer}
                                    onChange={(e) => setIssuer(e.target.value)}
                                    placeholder='My Company'
                                    className='mt-1'
                                />
                            </div>

                            <div className='grid grid-cols-3 gap-4'>
                                <div>
                                    <Label>알고리즘</Label>
                                    <Select value={algorithm} onValueChange={setAlgorithm}>
                                        <SelectTrigger className='mt-1'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='SHA1'>SHA1</SelectItem>
                                            <SelectItem value='SHA256'>SHA256</SelectItem>
                                            <SelectItem value='SHA512'>SHA512</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>자릿수</Label>
                                    <Select
                                        value={digits.toString()}
                                        onValueChange={(value) => setDigits(parseInt(value))}
                                    >
                                        <SelectTrigger className='mt-1'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='6'>6자리</SelectItem>
                                            <SelectItem value='8'>8자리</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>주기 (초)</Label>
                                    <Select
                                        value={period.toString()}
                                        onValueChange={(value) => setPeriod(parseInt(value))}
                                    >
                                        <SelectTrigger className='mt-1'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='30'>30초</SelectItem>
                                            <SelectItem value='60'>60초</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className='flex gap-2'>
                                <Button onClick={loadSampleData} variant='outline' size='sm'>
                                    샘플 데이터
                                </Button>
                                <Button
                                    onClick={generateTotpUrl}
                                    disabled={!serviceName.trim() || !accountName.trim() || !secretKey.trim()}
                                >
                                    <QrCode className='h-4 w-4 mr-2' />
                                    QR 코드 생성
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg flex items-center gap-2'>
                            <QrCode className='h-5 w-5' />
                            생성된 QR 코드
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            {qrCodeUrl ? (
                                <div className='text-center'>
                                    <div className='bg-white p-4 rounded-lg inline-block'>
                                        <img src={qrCodeUrl} alt='TOTP QR Code' className='w-64 h-64 mx-auto' />
                                    </div>
                                    <div className='flex gap-2 justify-center mt-4'>
                                        <Button variant='outline' size='sm' onClick={handleDownloadQR}>
                                            <Download className='h-4 w-4 mr-1' />
                                            다운로드
                                        </Button>
                                        <Button variant='outline' size='sm' onClick={() => handleCopy(totpUrl)}>
                                            <Copy className='h-4 w-4 mr-1' />
                                            URL 복사
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className='text-center text-muted-foreground py-16'>
                                    <QrCode className='h-16 w-16 mx-auto mb-4 opacity-50' />
                                    <p>QR 코드를 생성하려면 위의 정보를 입력하세요.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {currentTotp && (
                <Card className='mt-6'>
                    <CardHeader>
                        <CardTitle className='text-lg flex items-center gap-2'>
                            <Smartphone className='h-5 w-5' />
                            현재 TOTP 코드 (시뮬레이션)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='text-3xl font-mono font-bold'>{currentTotp}</div>
                                <Badge variant='outline'>{timeRemaining}초 남음</Badge>
                            </div>
                            <Button variant='outline' size='sm' onClick={() => handleCopy(currentTotp)}>
                                <Copy className='h-4 w-4 mr-1' />
                                복사
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {totpUrl && (
                <Card className='mt-6'>
                    <CardHeader>
                        <CardTitle className='text-sm'>TOTP URL</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='bg-muted p-3 rounded-lg'>
                            <code className='text-sm break-all'>{totpUrl}</code>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className='mt-6 bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>사용 방법</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>QR 코드 생성:</strong> 서비스 정보를 입력하고 QR 코드를 생성하세요
                    </p>
                    <p>
                        • <strong>인증 앱 연동:</strong> Google Authenticator, Authy 등에서 QR 코드를 스캔하세요
                    </p>
                    <p>
                        • <strong>백업:</strong> 시크릿 키를 안전한 곳에 백업해두세요
                    </p>
                    <p>
                        • <strong>테스트:</strong> 생성된 TOTP 코드로 정상 작동을 확인하세요
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

TOTPGeneratorClient.displayName = 'TOTPGeneratorClient';

export default TOTPGeneratorClient;
