'use client';

import { memo, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Image, Upload, Download, AlertTriangle, Settings } from 'lucide-react';
import { toast } from 'sonner';

type ImageFormat = 'png' | 'jpeg' | 'webp' | 'gif';

interface ImageInfo {
    file: File;
    preview: string;
    width: number;
    height: number;
    size: number;
}

const ImageConverterClient = memo(() => {
    const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);
    const [outputFormat, setOutputFormat] = useState<ImageFormat>('png');
    const [quality, setQuality] = useState(80);
    const [width, setWidth] = useState<number | ''>('');
    const [height, setHeight] = useState<number | ''>('');
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 선택할 수 있습니다.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new HTMLImageElement();
            img.onload = () => {
                setSelectedImage({
                    file,
                    preview: e.target?.result as string,
                    width: img.width,
                    height: img.height,
                    size: file.size,
                });
                setWidth(img.width);
                setHeight(img.height);
                setError('');
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }, []);

    const handleWidthChange = useCallback(
        (value: string) => {
            const numValue = parseInt(value) || '';
            setWidth(numValue);

            if (maintainAspectRatio && selectedImage && numValue) {
                const aspectRatio = selectedImage.width / selectedImage.height;
                setHeight(Math.round(numValue / aspectRatio));
            }
        },
        [maintainAspectRatio, selectedImage]
    );

    const handleHeightChange = useCallback(
        (value: string) => {
            const numValue = parseInt(value) || '';
            setHeight(numValue);

            if (maintainAspectRatio && selectedImage && numValue) {
                const aspectRatio = selectedImage.width / selectedImage.height;
                setWidth(Math.round(numValue * aspectRatio));
            }
        },
        [maintainAspectRatio, selectedImage]
    );

    const convertImage = useCallback(async () => {
        if (!selectedImage) {
            setError('이미지를 선택해주세요.');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setError('');

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context를 가져올 수 없습니다.');

            const img = new HTMLImageElement();
            img.onload = () => {
                const targetWidth = width || selectedImage.width;
                const targetHeight = height || selectedImage.height;

                canvas.width = targetWidth;
                canvas.height = targetHeight;

                setProgress(30);

                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                setProgress(60);

                const mimeType = `image/${outputFormat}`;
                const qualityValue = outputFormat === 'jpeg' ? quality / 100 : undefined;

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            setError('이미지 변환에 실패했습니다.');
                            setIsProcessing(false);
                            return;
                        }

                        setProgress(90);

                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `converted_${Date.now()}.${outputFormat}`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);

                        setProgress(100);
                        toast.success('이미지가 변환되어 다운로드되었습니다!');

                        setTimeout(() => {
                            setIsProcessing(false);
                            setProgress(0);
                        }, 1000);
                    },
                    mimeType,
                    qualityValue
                );
            };
            img.src = selectedImage.preview;
        } catch (err) {
            setError(err instanceof Error ? err.message : '이미지 변환 중 오류가 발생했습니다.');
            setIsProcessing(false);
            setProgress(0);
        }
    }, [selectedImage, outputFormat, quality, width, height]);

    const formatFileSize = useCallback((bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    return (
        <div className='container mx-auto p-4 max-w-4xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold flex items-center justify-center gap-2'>
                    <Image className='h-8 w-8' />
                    이미지 변환기
                </h1>
                <p className='text-muted-foreground mt-2'>이미지 형식을 변환하고 크기를 조정하세요.</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* 이미지 업로드 */}
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg'>이미지 선택</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center'>
                                <input
                                    type='file'
                                    accept='image/*'
                                    onChange={handleFileSelect}
                                    ref={fileInputRef}
                                    className='hidden'
                                />
                                <Button
                                    variant='outline'
                                    onClick={() => fileInputRef.current?.click()}
                                    className='w-full'
                                >
                                    <Upload className='h-4 w-4 mr-2' />
                                    이미지 선택
                                </Button>
                                <p className='text-sm text-muted-foreground mt-2'>PNG, JPEG, WebP, GIF 형식 지원</p>
                            </div>

                            {selectedImage && (
                                <div className='space-y-3'>
                                    <div className='relative'>
                                        <img
                                            src={selectedImage.preview}
                                            alt='선택된 이미지'
                                            className='w-full h-48 object-contain rounded-lg bg-muted'
                                        />
                                    </div>
                                    <div className='text-sm text-muted-foreground space-y-1'>
                                        <p>파일명: {selectedImage.file.name}</p>
                                        <p>
                                            크기: {selectedImage.width} × {selectedImage.height}
                                        </p>
                                        <p>용량: {formatFileSize(selectedImage.size)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 변환 설정 */}
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg flex items-center gap-2'>
                            <Settings className='h-5 w-5' />
                            변환 설정
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div>
                                <Label htmlFor='output-format'>출력 형식</Label>
                                <Select
                                    value={outputFormat}
                                    onValueChange={(value: ImageFormat) => setOutputFormat(value)}
                                >
                                    <SelectTrigger id='output-format'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='png'>PNG</SelectItem>
                                        <SelectItem value='jpeg'>JPEG</SelectItem>
                                        <SelectItem value='webp'>WebP</SelectItem>
                                        <SelectItem value='gif'>GIF</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {outputFormat === 'jpeg' && (
                                <div>
                                    <Label htmlFor='quality'>품질: {quality}%</Label>
                                    <Input
                                        id='quality'
                                        type='range'
                                        min='1'
                                        max='100'
                                        value={quality}
                                        onChange={(e) => setQuality(parseInt(e.target.value))}
                                        className='w-full'
                                    />
                                </div>
                            )}

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='width'>너비 (px)</Label>
                                    <Input
                                        id='width'
                                        type='number'
                                        value={width}
                                        onChange={(e) => handleWidthChange(e.target.value)}
                                        placeholder='자동'
                                    />
                                </div>
                                <div>
                                    <Label htmlFor='height'>높이 (px)</Label>
                                    <Input
                                        id='height'
                                        type='number'
                                        value={height}
                                        onChange={(e) => handleHeightChange(e.target.value)}
                                        placeholder='자동'
                                    />
                                </div>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <input
                                    type='checkbox'
                                    id='aspect-ratio'
                                    checked={maintainAspectRatio}
                                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                                    className='rounded'
                                />
                                <Label htmlFor='aspect-ratio' className='text-sm'>
                                    가로세로 비율 유지
                                </Label>
                            </div>

                            {error && (
                                <Alert variant='destructive'>
                                    <AlertTriangle className='h-4 w-4' />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {isProcessing && (
                                <div className='space-y-2'>
                                    <div className='flex items-center justify-between text-sm'>
                                        <span>변환 중...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className='w-full bg-muted rounded-full h-2'>
                                        <div
                                            className='bg-primary h-2 rounded-full transition-all duration-300'
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <Button onClick={convertImage} disabled={!selectedImage || isProcessing} className='w-full'>
                                <Download className='h-4 w-4 mr-2' />
                                {isProcessing ? '변환 중...' : '변환 및 다운로드'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className='mt-6 bg-muted/50'>
                <CardHeader>
                    <CardTitle className='text-sm'>지원 기능</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-2'>
                    <p>
                        • <strong>형식 변환:</strong> PNG, JPEG, WebP, GIF 간 변환
                    </p>
                    <p>
                        • <strong>크기 조정:</strong> 가로세로 비율 유지 또는 자유 조정
                    </p>
                    <p>
                        • <strong>품질 조정:</strong> JPEG 형식의 경우 품질 설정 가능
                    </p>
                    <p>
                        • <strong>즉시 다운로드:</strong> 변환 완료 시 자동 다운로드
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

ImageConverterClient.displayName = 'ImageConverterClient';

export default ImageConverterClient;
