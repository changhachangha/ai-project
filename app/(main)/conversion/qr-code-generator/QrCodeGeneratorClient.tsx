'use client';

import { memo, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

interface QrOptions {
    errorCorrectionLevel: ErrorCorrectionLevel;
    width: number;
    margin: number;
    color: {
        dark: string;
        light: string;
    };
}

const QrCodeGeneratorClient = memo(() => {
    const [text, setText] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [options, setOptions] = useState<QrOptions>({
        errorCorrectionLevel: 'M',
        width: 256,
        margin: 4,
        color: {
            dark: '#000000',
            light: '#FFFFFF',
        },
    });

    const generateQrCode = useCallback(async () => {
        if (!text.trim()) {
            toast.error('텍스트를 입력해주세요.');
            return;
        }

        setIsGenerating(true);
        try {
            const canvas = canvasRef.current;
            if (!canvas) return;

            await QRCode.toCanvas(canvas, text, {
                errorCorrectionLevel: options.errorCorrectionLevel,
                width: options.width,
                margin: options.margin,
                color: options.color,
            });

            // Canvas를 Data URL로 변환
            const dataUrl = canvas.toDataURL('image/png');
            setQrCodeUrl(dataUrl);

            toast.success('QR 코드가 생성되었습니다!');
        } catch (error) {
            console.error('QR 코드 생성 오류:', error);
            toast.error('QR 코드 생성 중 오류가 발생했습니다.');
        } finally {
            setIsGenerating(false);
        }
    }, [text, options]);

    const downloadQrCode = useCallback(() => {
        if (!qrCodeUrl) {
            toast.error('먼저 QR 코드를 생성해주세요.');
            return;
        }

        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = qrCodeUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('QR 코드가 다운로드되었습니다!');
    }, [qrCodeUrl]);

    const handleOptionChange = useCallback((key: keyof QrOptions, value: unknown) => {
        setOptions((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    const handleColorChange = useCallback((colorType: 'dark' | 'light', value: string) => {
        setOptions((prev) => ({
            ...prev,
            color: {
                ...prev.color,
                [colorType]: value,
            },
        }));
    }, []);

    const presetTexts = [
        { label: '웹사이트 URL', value: 'https://example.com' },
        { label: '이메일', value: 'mailto:example@email.com' },
        { label: '전화번호', value: 'tel:+821234567890' },
        { label: 'WiFi 연결', value: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;' },
        { label: 'SMS', value: 'sms:+821234567890:안녕하세요!' },
    ];

    return (
        <div className='container mx-auto p-4 max-w-4xl'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <QrCode className='h-5 w-5' />
                        QR 코드 생성기
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        {/* 입력 영역 */}
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <Label>텍스트 또는 URL</Label>
                                <Textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder='QR 코드로 변환할 텍스트나 URL을 입력하세요...'
                                    className='min-h-24'
                                />
                            </div>

                            {/* 프리셋 */}
                            <div className='space-y-2'>
                                <Label>빠른 입력</Label>
                                <div className='grid grid-cols-2 gap-2'>
                                    {presetTexts.map((preset, index) => (
                                        <Button
                                            key={index}
                                            variant='outline'
                                            size='sm'
                                            onClick={() => setText(preset.value)}
                                            className='text-xs'
                                        >
                                            {preset.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* 옵션 */}
                            <div className='space-y-4'>
                                <Label>QR 코드 옵션</Label>

                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label className='text-sm'>오류 수정 레벨</Label>
                                        <Select
                                            value={options.errorCorrectionLevel}
                                            onValueChange={(value: ErrorCorrectionLevel) =>
                                                handleOptionChange('errorCorrectionLevel', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='L'>L (낮음)</SelectItem>
                                                <SelectItem value='M'>M (중간)</SelectItem>
                                                <SelectItem value='Q'>Q (높음)</SelectItem>
                                                <SelectItem value='H'>H (최고)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className='space-y-2'>
                                        <Label className='text-sm'>크기</Label>
                                        <Input
                                            type='number'
                                            min='128'
                                            max='512'
                                            value={options.width}
                                            onChange={(e) =>
                                                handleOptionChange('width', parseInt(e.target.value) || 256)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label className='text-sm'>전경색</Label>
                                        <Input
                                            type='color'
                                            value={options.color.dark}
                                            onChange={(e) => handleColorChange('dark', e.target.value)}
                                        />
                                    </div>

                                    <div className='space-y-2'>
                                        <Label className='text-sm'>배경색</Label>
                                        <Input
                                            type='color'
                                            value={options.color.light}
                                            onChange={(e) => handleColorChange('light', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button onClick={generateQrCode} disabled={isGenerating || !text.trim()} className='w-full'>
                                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                                {isGenerating ? '생성 중...' : 'QR 코드 생성'}
                            </Button>
                        </div>

                        {/* 출력 영역 */}
                        <div className='space-y-4'>
                            <Label>생성된 QR 코드</Label>
                            <div className='flex flex-col items-center space-y-4'>
                                <div className='border rounded-lg p-4 bg-white'>
                                    <canvas
                                        ref={canvasRef}
                                        style={{
                                            maxWidth: '100%',
                                            height: 'auto',
                                        }}
                                    />
                                </div>

                                {qrCodeUrl && (
                                    <Button onClick={downloadQrCode} variant='outline'>
                                        <Download className='h-4 w-4 mr-2' />
                                        PNG로 다운로드
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 사용 팁 */}
                    <div className='text-sm text-muted-foreground space-y-2'>
                        <p>
                            <strong>사용 팁:</strong>
                        </p>
                        <ul className='list-disc list-inside space-y-1'>
                            <li>URL은 http:// 또는 https://로 시작해야 합니다.</li>
                            <li>WiFi 연결: WIFI:T:WPA;S:네트워크명;P:비밀번호;;</li>
                            <li>오류 수정 레벨이 높을수록 손상에 강하지만 크기가 커집니다.</li>
                            <li>생성된 QR 코드는 PNG 형식으로 다운로드할 수 있습니다.</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

QrCodeGeneratorClient.displayName = 'QrCodeGeneratorClient';

export default QrCodeGeneratorClient;
