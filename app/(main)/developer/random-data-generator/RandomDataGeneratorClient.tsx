'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, Shuffle, Download, User, Mail, MapPin, Phone, CreditCard, Calendar, Hash, List } from 'lucide-react';
import { toast } from 'sonner';

type DataType = 'name' | 'email' | 'address' | 'phone' | 'card' | 'date' | 'uuid' | 'number';
type OutputFormat = 'json' | 'csv' | 'text' | 'sql';

interface GeneratedData {
    name?: string;
    email?: string;
    address?: string;
    phone?: string;
    card?: string;
    date?: string;
    uuid?: string;
    number?: number;
}

const RandomDataGeneratorClient = memo(() => {
    const [dataTypes, setDataTypes] = useState<DataType[]>(['name', 'email']);
    const [count, setCount] = useState(10);
    const [outputFormat, setOutputFormat] = useState<OutputFormat>('json');
    const [generatedData, setGeneratedData] = useState<GeneratedData[]>([]);
    const [outputText, setOutputText] = useState('');

    const generateRandomName = useCallback(() => {
        const firstNames = [
            '김민수',
            '이영희',
            '박철수',
            '최지영',
            '정수현',
            '한미래',
            '오성민',
            '임하늘',
            '윤준호',
            '장수정',
        ];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        return firstName;
    }, []);

    const generateRandomEmail = useCallback(() => {
        const domains = ['gmail.com', 'naver.com', 'daum.net', 'yahoo.com', 'outlook.com'];
        const usernames = ['user', 'test', 'demo', 'sample', 'example'];
        const username = usernames[Math.floor(Math.random() * usernames.length)] + Math.floor(Math.random() * 1000);
        const domain = domains[Math.floor(Math.random() * domains.length)];
        return `${username}@${domain}`;
    }, []);

    const generateRandomAddress = useCallback(() => {
        const cities = ['서울시', '부산시', '인천시', '대구시', '대전시', '광주시', '울산시'];
        const districts = ['강남구', '서초구', '종로구', '중구', '용산구', '성동구', '광진구'];
        const streets = ['테헤란로', '강남대로', '세종대로', '을지로', '종로', '명동길'];

        const city = cities[Math.floor(Math.random() * cities.length)];
        const district = districts[Math.floor(Math.random() * districts.length)];
        const street = streets[Math.floor(Math.random() * streets.length)];
        const number = Math.floor(Math.random() * 999) + 1;

        return `${city} ${district} ${street} ${number}`;
    }, []);

    const generateRandomPhone = useCallback(() => {
        const prefixes = ['010', '011', '016', '017', '018', '019'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const middle = Math.floor(Math.random() * 9000) + 1000;
        const last = Math.floor(Math.random() * 9000) + 1000;
        return `${prefix}-${middle}-${last}`;
    }, []);

    const generateRandomCard = useCallback(() => {
        const prefix = '4'; // Visa
        let number = prefix;
        for (let i = 0; i < 15; i++) {
            number += Math.floor(Math.random() * 10);
        }
        return number.replace(/(.{4})/g, '$1 ').trim();
    }, []);

    const generateRandomDate = useCallback(() => {
        const start = new Date(2020, 0, 1);
        const end = new Date();
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return randomDate.toISOString().split('T')[0];
    }, []);

    const generateRandomUUID = useCallback(() => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }, []);

    const generateRandomNumber = useCallback(() => {
        return Math.floor(Math.random() * 100000);
    }, []);

    const generateData = useCallback(() => {
        const data: GeneratedData[] = [];

        for (let i = 0; i < count; i++) {
            const item: GeneratedData = {};

            dataTypes.forEach((type) => {
                switch (type) {
                    case 'name':
                        item.name = generateRandomName();
                        break;
                    case 'email':
                        item.email = generateRandomEmail();
                        break;
                    case 'address':
                        item.address = generateRandomAddress();
                        break;
                    case 'phone':
                        item.phone = generateRandomPhone();
                        break;
                    case 'card':
                        item.card = generateRandomCard();
                        break;
                    case 'date':
                        item.date = generateRandomDate();
                        break;
                    case 'uuid':
                        item.uuid = generateRandomUUID();
                        break;
                    case 'number':
                        item.number = generateRandomNumber();
                        break;
                }
            });

            data.push(item);
        }

        setGeneratedData(data);
        formatOutput(data);
        toast.success(`${count}개의 랜덤 데이터가 생성되었습니다!`);
    }, [
        count,
        dataTypes,
        outputFormat,
        generateRandomName,
        generateRandomEmail,
        generateRandomAddress,
        generateRandomPhone,
        generateRandomCard,
        generateRandomDate,
        generateRandomUUID,
        generateRandomNumber,
    ]);

    const formatOutput = useCallback(
        (data: GeneratedData[]) => {
            let formatted = '';

            switch (outputFormat) {
                case 'json':
                    formatted = JSON.stringify(data, null, 2);
                    break;
                case 'csv':
                    if (data.length > 0) {
                        const headers = Object.keys(data[0]).join(',');
                        const rows = data.map((item) => Object.values(item).join(','));
                        formatted = [headers, ...rows].join('\n');
                    }
                    break;
                case 'text':
                    formatted = data
                        .map((item, index) => {
                            const entries = Object.entries(item);
                            const itemText = entries.map(([key, value]) => `${key}: ${value}`).join('\n');
                            return `[${index + 1}]\n${itemText}`;
                        })
                        .join('\n\n');
                    break;
                case 'sql':
                    if (data.length > 0) {
                        const columns = Object.keys(data[0]);
                        const tableName = 'generated_data';
                        const values = data
                            .map(
                                (item) =>
                                    `(${columns.map((col) => `'${item[col as keyof GeneratedData]}'`).join(', ')})`
                            )
                            .join(',\n');
                        formatted = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n${values};`;
                    }
                    break;
            }

            setOutputText(formatted);
        },
        [outputFormat]
    );

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(outputText).then(() => {
            toast.success('클립보드에 복사되었습니다!');
        });
    }, [outputText]);

    const handleDownload = useCallback(() => {
        const blob = new Blob([outputText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `random-data.${outputFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('파일이 다운로드되었습니다!');
    }, [outputText, outputFormat]);

    const toggleDataType = useCallback((type: DataType) => {
        setDataTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
    }, []);

    const dataTypeIcons = {
        name: User,
        email: Mail,
        address: MapPin,
        phone: Phone,
        card: CreditCard,
        date: Calendar,
        uuid: Hash,
        number: List,
    };

    const dataTypeLabels = {
        name: '이름',
        email: '이메일',
        address: '주소',
        phone: '전화번호',
        card: '카드번호',
        date: '날짜',
        uuid: 'UUID',
        number: '숫자',
    };

    return (
        <div className='container mx-auto p-4 max-w-6xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Shuffle className='h-8 w-8' />
                    랜덤 데이터 생성기
                </h1>
                <p className='text-muted-foreground mt-2'>테스트용 랜덤 데이터를 다양한 형식으로 생성하세요.</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg'>생성 설정</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-6'>
                            <div>
                                <Label className='text-sm font-medium mb-3 block'>데이터 타입</Label>
                                <div className='grid grid-cols-2 gap-2'>
                                    {(Object.keys(dataTypeLabels) as DataType[]).map((type) => {
                                        const Icon = dataTypeIcons[type];
                                        return (
                                            <Button
                                                key={type}
                                                variant={dataTypes.includes(type) ? 'default' : 'outline'}
                                                size='sm'
                                                onClick={() => toggleDataType(type)}
                                                className='justify-start'
                                            >
                                                <Icon className='h-4 w-4 mr-2' />
                                                {dataTypeLabels[type]}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor='count' className='text-sm font-medium'>
                                    생성 개수
                                </Label>
                                <Input
                                    id='count'
                                    type='number'
                                    value={count}
                                    onChange={(e) =>
                                        setCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))
                                    }
                                    min={1}
                                    max={1000}
                                    className='mt-1'
                                />
                            </div>

                            <div>
                                <Label className='text-sm font-medium'>출력 형식</Label>
                                <Select
                                    value={outputFormat}
                                    onValueChange={(value: OutputFormat) => setOutputFormat(value)}
                                >
                                    <SelectTrigger className='mt-1'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='json'>JSON</SelectItem>
                                        <SelectItem value='csv'>CSV</SelectItem>
                                        <SelectItem value='text'>텍스트</SelectItem>
                                        <SelectItem value='sql'>SQL</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button onClick={generateData} disabled={dataTypes.length === 0} className='w-full'>
                                <Shuffle className='h-4 w-4 mr-2' />
                                데이터 생성
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='text-lg'>생성된 데이터</CardTitle>
                            <div className='flex items-center gap-2'>
                                <Badge variant='outline'>{generatedData.length}개</Badge>
                                <Button variant='outline' size='sm' onClick={handleCopy} disabled={!outputText}>
                                    <Copy className='h-4 w-4 mr-1' />
                                    복사
                                </Button>
                                <Button variant='outline' size='sm' onClick={handleDownload} disabled={!outputText}>
                                    <Download className='h-4 w-4 mr-1' />
                                    다운로드
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={outputText}
                            readOnly
                            placeholder='생성된 데이터가 여기에 표시됩니다...'
                            className='min-h-[400px] font-mono text-sm'
                        />
                    </CardContent>
                </Card>
            </div>

            <Card className='mt-6 bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>사용 방법</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>데이터 타입:</strong> 필요한 데이터 유형을 선택하세요
                    </p>
                    <p>
                        • <strong>생성 개수:</strong> 1~1000개의 데이터를 생성할 수 있습니다
                    </p>
                    <p>
                        • <strong>출력 형식:</strong> JSON, CSV, 텍스트, SQL 형식으로 출력 가능
                    </p>
                    <p>
                        • <strong>다운로드:</strong> 생성된 데이터를 파일로 다운로드할 수 있습니다
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

RandomDataGeneratorClient.displayName = 'RandomDataGeneratorClient';

export default RandomDataGeneratorClient;
