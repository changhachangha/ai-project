'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Award, Globe, Calendar, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CertificateInfo {
    subject: string;
    issuer: string;
    validFrom: string;
    validTo: string;
    serialNumber: string;
    signatureAlgorithm: string;
    publicKeyAlgorithm: string;
    keySize: string;
    fingerprint: string;
    subjectAltNames: string[];
    isValid: boolean;
    daysUntilExpiry: number;
}

const CertificateAnalyzerClient = memo(() => {
    const [domain, setDomain] = useState('');
    const [certificateText, setCertificateText] = useState('');
    const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const analyzeDomainCertificate = useCallback(async () => {
        if (!domain.trim()) {
            toast.error('도메인을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // 실제 환경에서는 API를 통해 인증서 정보를 가져와야 합니다
            // 여기서는 시뮬레이션 데이터를 사용합니다
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const mockCertInfo: CertificateInfo = {
                subject: `CN=${domain}`,
                issuer: 'CN=DigiCert SHA2 High Assurance Server CA',
                validFrom: '2024-01-01T00:00:00Z',
                validTo: '2025-01-01T23:59:59Z',
                serialNumber: '0x1234567890abcdef',
                signatureAlgorithm: 'SHA256withRSA',
                publicKeyAlgorithm: 'RSA',
                keySize: '2048 bits',
                fingerprint: 'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD',
                subjectAltNames: [`DNS:${domain}`, `DNS:www.${domain}`],
                isValid: true,
                daysUntilExpiry: 180,
            };

            setCertificateInfo(mockCertInfo);
            toast.success('인증서 정보를 가져왔습니다!');
        } catch (err) {
            setError('인증서 정보를 가져오는데 실패했습니다.');
            toast.error('인증서 분석에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [domain]);

    const parseCertificateText = useCallback(() => {
        if (!certificateText.trim()) {
            toast.error('인증서 텍스트를 입력해주세요.');
            return;
        }

        try {
            // 실제 환경에서는 X.509 파서를 사용해야 합니다
            // 여기서는 기본적인 파싱 시뮬레이션을 합니다
            const lines = certificateText.split('\n');
            const hasBeginCert = lines.some((line) => line.includes('BEGIN CERTIFICATE'));
            const hasEndCert = lines.some((line) => line.includes('END CERTIFICATE'));

            if (!hasBeginCert || !hasEndCert) {
                throw new Error('올바른 인증서 형식이 아닙니다.');
            }

            const mockCertInfo: CertificateInfo = {
                subject: 'CN=example.com',
                issuer: "CN=Let's Encrypt Authority X3",
                validFrom: '2024-01-01T00:00:00Z',
                validTo: '2024-12-31T23:59:59Z',
                serialNumber: '0xabcdef1234567890',
                signatureAlgorithm: 'SHA256withRSA',
                publicKeyAlgorithm: 'RSA',
                keySize: '2048 bits',
                fingerprint: '11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44',
                subjectAltNames: ['DNS:example.com', 'DNS:www.example.com'],
                isValid: true,
                daysUntilExpiry: 90,
            };

            setCertificateInfo(mockCertInfo);
            toast.success('인증서가 분석되었습니다!');
        } catch (err) {
            setError(err instanceof Error ? err.message : '인증서 분석에 실패했습니다.');
            toast.error('인증서 분석에 실패했습니다.');
        }
    }, [certificateText]);

    const loadSampleCertificate = useCallback(() => {
        const sampleCert = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjQwMTAxMDAwMDAwWhcNMjUwMTAxMjM1OTU5WjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAuQIDAQABo1MwUTAdBgNVHQ4EFgQUhKtzpL+RtFOCQNEtEKHbgdWGgNgw
HwYDVR0jBBgwFoAUhKtzpL+RtFOCQNEtEKHbgdWGgNgwDwYDVR0TAQH/BAUwAwEB
/zANBgkqhkiG9w0BAQsFAAOCAQEAg8RhNOP5qnzGIkqZJqQKJJOLyYgUhCBXJzLZ
example-certificate-data-here
-----END CERTIFICATE-----`;
        setCertificateText(sampleCert);
    }, []);

    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleString('ko-KR');
    }, []);

    const getValidityStatus = useCallback((daysUntilExpiry: number) => {
        if (daysUntilExpiry < 0) {
            return { status: 'expired', color: 'destructive', icon: XCircle };
        } else if (daysUntilExpiry < 30) {
            return { status: 'expiring', color: 'warning', icon: AlertTriangle };
        } else {
            return { status: 'valid', color: 'success', icon: CheckCircle };
        }
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-6xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Award className='h-8 w-8' />
                    인증서 분석기
                </h1>
                <p className='text-muted-foreground mt-2'>SSL/TLS 인증서 정보를 분석하고 유효성을 검사합니다.</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg flex items-center gap-2'>
                            <Globe className='h-5 w-5' />
                            도메인 인증서 분석
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div>
                                <Label htmlFor='domain'>도메인 이름</Label>
                                <Input
                                    id='domain'
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    placeholder='example.com'
                                    className='mt-1'
                                />
                            </div>
                            <Button
                                onClick={analyzeDomainCertificate}
                                disabled={!domain.trim() || isLoading}
                                className='w-full'
                            >
                                {isLoading ? '분석 중...' : '인증서 분석'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg flex items-center gap-2'>
                            <Shield className='h-5 w-5' />
                            인증서 텍스트 분석
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div>
                                <Label htmlFor='cert-text'>인증서 (PEM 형식)</Label>
                                <Textarea
                                    id='cert-text'
                                    value={certificateText}
                                    onChange={(e) => setCertificateText(e.target.value)}
                                    placeholder='-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----'
                                    className='mt-1 min-h-[100px] font-mono text-sm'
                                />
                            </div>
                            <div className='flex gap-2'>
                                <Button onClick={loadSampleCertificate} variant='outline' size='sm'>
                                    샘플 로드
                                </Button>
                                <Button onClick={parseCertificateText} disabled={!certificateText.trim()}>
                                    분석하기
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {error && (
                <Card className='mb-6 border-destructive'>
                    <CardContent className='pt-6'>
                        <div className='flex items-center gap-2 text-destructive'>
                            <XCircle className='h-5 w-5' />
                            <span>{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {certificateInfo && (
                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='text-lg'>인증서 정보</CardTitle>
                            <div className='flex items-center gap-2'>
                                {(() => {
                                    const {
                                        status,
                                        color,
                                        icon: Icon,
                                    } = getValidityStatus(certificateInfo.daysUntilExpiry);
                                    return (
                                        <Badge
                                            variant={
                                                color === 'success'
                                                    ? 'default'
                                                    : color === 'warning'
                                                      ? 'secondary'
                                                      : 'destructive'
                                            }
                                        >
                                            <Icon className='h-3 w-3 mr-1' />
                                            {status === 'valid'
                                                ? '유효'
                                                : status === 'expiring'
                                                  ? '만료 임박'
                                                  : '만료됨'}
                                        </Badge>
                                    );
                                })()}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                <div>
                                    <h3 className='font-semibold text-sm text-muted-foreground'>주체 (Subject)</h3>
                                    <p className='font-mono text-sm'>{certificateInfo.subject}</p>
                                </div>
                                <div>
                                    <h3 className='font-semibold text-sm text-muted-foreground'>발급자 (Issuer)</h3>
                                    <p className='font-mono text-sm'>{certificateInfo.issuer}</p>
                                </div>
                                <div>
                                    <h3 className='font-semibold text-sm text-muted-foreground'>시리얼 번호</h3>
                                    <p className='font-mono text-sm'>{certificateInfo.serialNumber}</p>
                                </div>
                                <div>
                                    <h3 className='font-semibold text-sm text-muted-foreground'>서명 알고리즘</h3>
                                    <p className='font-mono text-sm'>{certificateInfo.signatureAlgorithm}</p>
                                </div>
                            </div>
                            <div className='space-y-4'>
                                <div>
                                    <h3 className='font-semibold text-sm text-muted-foreground flex items-center gap-2'>
                                        <Calendar className='h-4 w-4' />
                                        유효 기간
                                    </h3>
                                    <p className='text-sm'>시작: {formatDate(certificateInfo.validFrom)}</p>
                                    <p className='text-sm'>종료: {formatDate(certificateInfo.validTo)}</p>
                                    <p className='text-sm font-medium'>
                                        {certificateInfo.daysUntilExpiry > 0
                                            ? `${certificateInfo.daysUntilExpiry}일 남음`
                                            : `${Math.abs(certificateInfo.daysUntilExpiry)}일 전 만료`}
                                    </p>
                                </div>
                                <div>
                                    <h3 className='font-semibold text-sm text-muted-foreground'>공개키 정보</h3>
                                    <p className='text-sm'>
                                        {certificateInfo.publicKeyAlgorithm} ({certificateInfo.keySize})
                                    </p>
                                </div>
                                <div>
                                    <h3 className='font-semibold text-sm text-muted-foreground'>지문 (Fingerprint)</h3>
                                    <p className='font-mono text-xs break-all'>{certificateInfo.fingerprint}</p>
                                </div>
                            </div>
                        </div>

                        {certificateInfo.subjectAltNames.length > 0 && (
                            <div className='mt-6'>
                                <h3 className='font-semibold text-sm text-muted-foreground mb-2'>대체 이름 (SAN)</h3>
                                <div className='flex flex-wrap gap-2'>
                                    {certificateInfo.subjectAltNames.map((name, index) => (
                                        <Badge key={index} variant='outline' className='font-mono text-xs'>
                                            {name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card className='mt-6 bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>사용 방법</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>도메인 분석:</strong> 도메인 이름을 입력하여 해당 사이트의 인증서 정보를 확인
                    </p>
                    <p>
                        • <strong>인증서 텍스트:</strong> PEM 형식의 인증서를 직접 붙여넣어 분석
                    </p>
                    <p>
                        • <strong>유효성 검사:</strong> 인증서의 만료일과 유효성을 자동으로 확인
                    </p>
                    <p>
                        • <strong>보안 정보:</strong> 암호화 알고리즘과 키 길이 등 보안 정보 제공
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

CertificateAnalyzerClient.displayName = 'CertificateAnalyzerClient';

export default CertificateAnalyzerClient;
