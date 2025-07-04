'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ColorWheelProps {
    size?: number;
    onColorChange?: (color: {
        hex: string;
        rgb: { r: number; g: number; b: number };
        hsl: { h: number; s: number; l: number };
    }) => void;
    className?: string;
}

interface HSV {
    h: number; // 0-360
    s: number; // 0-100
    v: number; // 0-100
}

interface RGB {
    r: number;
    g: number;
    b: number;
}

interface HSL {
    h: number;
    s: number;
    l: number;
}

// HSV를 RGB로 변환
const hsvToRgb = (h: number, s: number, v: number): RGB => {
    h = h / 360;
    s = s / 100;
    v = v / 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = v - c;

    let r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 1 / 6) {
        r = c;
        g = x;
        b = 0;
    } else if (1 / 6 <= h && h < 2 / 6) {
        r = x;
        g = c;
        b = 0;
    } else if (2 / 6 <= h && h < 3 / 6) {
        r = 0;
        g = c;
        b = x;
    } else if (3 / 6 <= h && h < 4 / 6) {
        r = 0;
        g = x;
        b = c;
    } else if (4 / 6 <= h && h < 5 / 6) {
        r = x;
        g = 0;
        b = c;
    } else if (5 / 6 <= h && h < 1) {
        r = c;
        g = 0;
        b = x;
    }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
    };
};

// RGB를 HSL로 변환
const rgbToHsl = (r: number, g: number, b: number): HSL => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
};

// RGB를 HEX로 변환
const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const ColorWheel: React.FC<ColorWheelProps> = ({ size = 300, onColorChange, className = '' }) => {
    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        // 초기 크기 설정
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 반응형 크기 계산
    const responsiveSize = Math.min(size, windowWidth - 80, 350);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hsv, setHsv] = useState<HSV>({ h: 0, s: 100, v: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [brightnessSlider, setBrightnessSlider] = useState(100);

    // 색상 휠 그리기
    const drawColorWheel = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const centerX = responsiveSize / 2;
        const centerY = responsiveSize / 2;
        const radius = responsiveSize / 2 - 10;

        // 캔버스 클리어
        ctx.clearRect(0, 0, responsiveSize, responsiveSize);

        // 색상 휠 그리기 (ImageData 사용으로 성능 개선)
        const imageData = ctx.createImageData(responsiveSize, responsiveSize);
        const data = imageData.data;

        for (let y = 0; y < responsiveSize; y++) {
            for (let x = 0; x < responsiveSize; x++) {
                const relativeX = x - centerX;
                const relativeY = y - centerY;
                const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);

                if (distance <= radius) {
                    const angle = (Math.atan2(relativeY, relativeX) * 180) / Math.PI;
                    const hue = angle < 0 ? angle + 360 : angle;
                    const saturation = (distance / radius) * 100;

                    const rgb = hsvToRgb(hue, saturation, brightnessSlider);

                    const index = (y * responsiveSize + x) * 4;
                    data[index] = rgb.r; // Red
                    data[index + 1] = rgb.g; // Green
                    data[index + 2] = rgb.b; // Blue
                    data[index + 3] = 255; // Alpha
                } else {
                    const index = (y * responsiveSize + x) * 4;
                    data[index + 3] = 0; // 투명하게
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // 선택된 색상 포인터 그리기
        const selectedRadius = (hsv.s / 100) * radius;
        const selectedAngle = (hsv.h * Math.PI) / 180;
        const pointerX = centerX + selectedRadius * Math.cos(selectedAngle);
        const pointerY = centerY + selectedRadius * Math.sin(selectedAngle);

        ctx.beginPath();
        ctx.arc(pointerX, pointerY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
    }, [responsiveSize, hsv, brightnessSlider]);

    // 마우스 위치에서 색상 계산
    const getColorFromPosition = useCallback(
        (x: number, y: number) => {
            const canvas = canvasRef.current;
            if (!canvas) return null;

            const rect = canvas.getBoundingClientRect();
            const centerX = responsiveSize / 2;
            const centerY = responsiveSize / 2;
            const radius = responsiveSize / 2 - 10;

            const relativeX = x - rect.left - centerX;
            const relativeY = y - rect.top - centerY;

            const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
            if (distance > radius) return null;

            const angle = (Math.atan2(relativeY, relativeX) * 180) / Math.PI;
            const hue = angle < 0 ? angle + 360 : angle;
            const saturation = (distance / radius) * 100;

            return { h: hue, s: saturation, v: brightnessSlider };
        },
        [responsiveSize, brightnessSlider]
    );

    // 마우스 이벤트 핸들러
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            const color = getColorFromPosition(e.clientX, e.clientY);
            if (color) {
                setHsv(color);
                setIsDragging(true);
            }
        },
        [getColorFromPosition]
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!isDragging) return;

            const color = getColorFromPosition(e.clientX, e.clientY);
            if (color) {
                setHsv(color);
            }
        },
        [isDragging, getColorFromPosition]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // 터치 이벤트 핸들러
    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            e.preventDefault();
            const touch = e.touches[0];
            const color = getColorFromPosition(touch.clientX, touch.clientY);
            if (color) {
                setHsv(color);
                setIsDragging(true);
            }
        },
        [getColorFromPosition]
    );

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (!isDragging) return;
            e.preventDefault();

            const touch = e.touches[0];
            const color = getColorFromPosition(touch.clientX, touch.clientY);
            if (color) {
                setHsv(color);
            }
        },
        [isDragging, getColorFromPosition]
    );

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // 밝기 슬라이더 변경 핸들러
    const handleBrightnessChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newBrightness = parseInt(e.target.value);
        setBrightnessSlider(newBrightness);
        setHsv((prev) => ({ ...prev, v: newBrightness }));
    }, []);

    // 색상 변경 시 콜백 호출
    useEffect(() => {
        if (onColorChange) {
            const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

            onColorChange({ hex, rgb, hsl });
        }
    }, [hsv, onColorChange]);

    // 캔버스 다시 그리기
    useEffect(() => {
        drawColorWheel();
    }, [drawColorWheel]);

    return (
        <div className={`flex flex-col items-center space-y-4 ${className}`}>
            <canvas
                ref={canvasRef}
                width={responsiveSize}
                height={responsiveSize}
                className='cursor-crosshair rounded-full shadow-lg max-w-full'
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            />

            {/* 밝기 조절 슬라이더 */}
            <div className='w-full max-w-xs px-2'>
                <label className='block text-sm sm:text-base font-medium text-gray-700 mb-3 text-center'>
                    밝기: {brightnessSlider}%
                </label>
                <input
                    type='range'
                    min='0'
                    max='100'
                    value={brightnessSlider}
                    onChange={handleBrightnessChange}
                    className='w-full h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation'
                    style={{
                        background: `linear-gradient(to right, #000000 0%, #ffffff 100%)`,
                    }}
                />
            </div>
        </div>
    );
};
