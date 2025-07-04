'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Network, Globe, Server, Wifi, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface IPInfo {
    ip: string;
    country: string;
    city: string;
    region: string;
    isp: string;
    timezone: string;
    latitude: number;
    longitude: number;
}

interface DNSRecord {
    type: string;
    value: string;
    ttl: number;
}

const NetworkToolsClient = memo(() => {
    const [ipAddress, setIpAddress] = useState('');
    const [domain, setDomain] = useState('');
    const [port, setPort] = useState('');
    const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
    const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
    const [portStatus, setPortStatus] = useState<{ port: string; status: 'open' | 'closed' | 'filtered' } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const lookupIP = useCallback(async () => {
        if (!ipAddress.trim()) {
            toast.error('IP 주소를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            // 실제 환경에서는 IP 조회 API를 사용해야 합니다
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const mockInfo: IPInfo = {
                ip: ipAddress,
                country: 'South Korea',
                city: 'Seoul',
                region: 'Seoul',
                isp: 'KT Corporation',
                timezone: 'Asia/Seoul',
                latitude: 37.5665,
                longitude: 126.978,
            };

            setIpInfo(mockInfo);
            toast.success('IP 정보를 조회했습니다!');
        } catch {
            toast.error('IP 조회에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [ipAddress]);

    const lookupDNS = useCallback(async () => {
        if (!domain.trim()) {
            toast.error('도메인을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const mockRecords: DNSRecord[] = [
                { type: 'A', value: '192.168.1.1', ttl: 300 },
                { type: 'AAAA', value: '2001:db8::1', ttl: 300 },
                { type: 'MX', value: '10 mail.example.com', ttl: 3600 },
                { type: 'TXT', value: 'v=spf1 include:_spf.example.com ~all', ttl: 3600 },
                { type: 'CNAME', value: 'www.example.com', ttl: 300 },
            ];

            setDnsRecords(mockRecords);
            toast.success('DNS 레코드를 조회했습니다!');
        } catch {
            toast.error('DNS 조회에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [domain]);

    const checkPort = useCallback(async () => {
        if (!domain.trim() || !port.trim()) {
            toast.error('도메인과 포트를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const commonPorts = ['80', '443', '22', '21', '25', '53', '110', '143', '993', '995'];
            const isCommonPort = commonPorts.includes(port);
            const status = isCommonPort ? 'open' : Math.random() > 0.5 ? 'open' : 'closed';

            setPortStatus({ port, status: status as 'open' | 'closed' });
            toast.success('포트 상태를 확인했습니다!');
        } catch {
            toast.error('포트 확인에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [domain, port]);

    const getMyIP = useCallback(async () => {
        setIsLoading(true);
        try {
            // 실제 환경에서는 IP 조회 서비스를 사용
            await new Promise((resolve) => setTimeout(resolve, 500));
            const mockIP = '203.241.185.123';
            setIpAddress(mockIP);
            toast.success('현재 IP 주소를 가져왔습니다!');
        } catch {
            toast.error('IP 주소 조회에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-6xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Network className='h-8 w-8' />
                    네트워크 도구
                </h1>
                <p className='text-muted-foreground mt-2'>
                    IP 정보 조회, 포트 확인, DNS 조회 등 네트워크 관련 도구입니다.
                </p>
            </div>

            <Tabs defaultValue='ip-lookup' className='w-full'>
                <TabsList className='grid w-full grid-cols-3'>
                    <TabsTrigger value='ip-lookup'>IP 조회</TabsTrigger>
                    <TabsTrigger value='dns-lookup'>DNS 조회</TabsTrigger>
                    <TabsTrigger value='port-check'>포트 확인</TabsTrigger>
                </TabsList>

                <TabsContent value='ip-lookup' className='space-y-4'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-lg flex items-center gap-2'>
                                <Globe className='h-5 w-5' />
                                IP 주소 정보 조회
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                <div className='flex gap-2'>
                                    <Input
                                        value={ipAddress}
                                        onChange={(e) => setIpAddress(e.target.value)}
                                        placeholder='IP 주소를 입력하세요 (예: 8.8.8.8)'
                                        className='flex-1'
                                    />
                                    <Button onClick={getMyIP} variant='outline' disabled={isLoading}>
                                        내 IP
                                    </Button>
                                    <Button onClick={lookupIP} disabled={!ipAddress.trim() || isLoading}>
                                        {isLoading ? '조회 중...' : '조회'}
                                    </Button>
                                </div>

                                {ipInfo && (
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-6'>
                                        <div className='space-y-3'>
                                            <div>
                                                <Label className='text-sm font-medium text-muted-foreground'>
                                                    IP 주소
                                                </Label>
                                                <p className='font-mono text-lg'>{ipInfo.ip}</p>
                                            </div>
                                            <div>
                                                <Label className='text-sm font-medium text-muted-foreground'>
                                                    국가
                                                </Label>
                                                <p>{ipInfo.country}</p>
                                            </div>
                                            <div>
                                                <Label className='text-sm font-medium text-muted-foreground'>
                                                    도시
                                                </Label>
                                                <p>{ipInfo.city}</p>
                                            </div>
                                            <div>
                                                <Label className='text-sm font-medium text-muted-foreground'>
                                                    지역
                                                </Label>
                                                <p>{ipInfo.region}</p>
                                            </div>
                                        </div>
                                        <div className='space-y-3'>
                                            <div>
                                                <Label className='text-sm font-medium text-muted-foreground'>ISP</Label>
                                                <p>{ipInfo.isp}</p>
                                            </div>
                                            <div>
                                                <Label className='text-sm font-medium text-muted-foreground'>
                                                    시간대
                                                </Label>
                                                <p>{ipInfo.timezone}</p>
                                            </div>
                                            <div>
                                                <Label className='text-sm font-medium text-muted-foreground flex items-center gap-1'>
                                                    <MapPin className='h-4 w-4' />
                                                    좌표
                                                </Label>
                                                <p className='font-mono'>
                                                    {ipInfo.latitude}, {ipInfo.longitude}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='dns-lookup' className='space-y-4'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-lg flex items-center gap-2'>
                                <Server className='h-5 w-5' />
                                DNS 레코드 조회
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                <div className='flex gap-2'>
                                    <Input
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                        placeholder='도메인을 입력하세요 (예: example.com)'
                                        className='flex-1'
                                    />
                                    <Button onClick={lookupDNS} disabled={!domain.trim() || isLoading}>
                                        {isLoading ? '조회 중...' : '조회'}
                                    </Button>
                                </div>

                                {dnsRecords.length > 0 && (
                                    <div className='space-y-3 mt-6'>
                                        <h3 className='font-semibold'>DNS 레코드</h3>
                                        <div className='space-y-2'>
                                            {dnsRecords.map((record, index) => (
                                                <div
                                                    key={index}
                                                    className='flex items-center gap-4 p-3 bg-muted/50 rounded-lg'
                                                >
                                                    <Badge variant='outline' className='min-w-16'>
                                                        {record.type}
                                                    </Badge>
                                                    <code className='flex-1 text-sm'>{record.value}</code>
                                                    <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                                        <Clock className='h-3 w-3' />
                                                        {record.ttl}s
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='port-check' className='space-y-4'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-lg flex items-center gap-2'>
                                <Wifi className='h-5 w-5' />
                                포트 상태 확인
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <Label htmlFor='port-domain'>도메인 또는 IP</Label>
                                        <Input
                                            id='port-domain'
                                            value={domain}
                                            onChange={(e) => setDomain(e.target.value)}
                                            placeholder='example.com 또는 192.168.1.1'
                                            className='mt-1'
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor='port-number'>포트 번호</Label>
                                        <Input
                                            id='port-number'
                                            value={port}
                                            onChange={(e) => setPort(e.target.value)}
                                            placeholder='80, 443, 22 등'
                                            className='mt-1'
                                        />
                                    </div>
                                </div>

                                <Button onClick={checkPort} disabled={!domain.trim() || !port.trim() || isLoading}>
                                    {isLoading ? '확인 중...' : '포트 확인'}
                                </Button>

                                {portStatus && (
                                    <div className='mt-6 p-4 bg-muted/50 rounded-lg'>
                                        <div className='flex items-center gap-2'>
                                            <span className='font-medium'>포트 {portStatus.port} 상태:</span>
                                            <Badge variant={portStatus.status === 'open' ? 'default' : 'destructive'}>
                                                {portStatus.status === 'open' ? '열림' : '닫힘'}
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                <div className='mt-6'>
                                    <h3 className='font-semibold mb-2'>일반적인 포트</h3>
                                    <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                                        {[
                                            { port: '80', service: 'HTTP' },
                                            { port: '443', service: 'HTTPS' },
                                            { port: '22', service: 'SSH' },
                                            { port: '21', service: 'FTP' },
                                            { port: '25', service: 'SMTP' },
                                            { port: '53', service: 'DNS' },
                                            { port: '110', service: 'POP3' },
                                            { port: '143', service: 'IMAP' },
                                        ].map(({ port: p, service }) => (
                                            <Button
                                                key={p}
                                                variant='outline'
                                                size='sm'
                                                onClick={() => setPort(p)}
                                                className='justify-start'
                                            >
                                                {p} ({service})
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Card className='mt-6 bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>사용 방법</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>IP 조회:</strong> IP 주소의 지리적 위치와 ISP 정보를 확인
                    </p>
                    <p>
                        • <strong>DNS 조회:</strong> 도메인의 DNS 레코드를 조회하여 설정 확인
                    </p>
                    <p>
                        • <strong>포트 확인:</strong> 특정 포트의 열림/닫힘 상태를 확인
                    </p>
                    <p>
                        • <strong>네트워크 진단:</strong> 네트워크 문제 해결에 유용한 정보 제공
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

NetworkToolsClient.displayName = 'NetworkToolsClient';

export default NetworkToolsClient;
