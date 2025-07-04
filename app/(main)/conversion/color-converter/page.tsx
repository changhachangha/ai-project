'use client';

import React, { useState, useCallback } from 'react';
import { ColorWheel } from '@/components/ui/color-wheel';

const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
};

const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
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

const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
};

export default function ColorPage() {
    const [hex, setHex] = useState('');
    const [rgb, setRgb] = useState('');
    const [hsl, setHsl] = useState('');

    const convertColors = useCallback((source: string, value: string) => {
        let r = 0,
            g = 0,
            b = 0;
        let h = 0,
            s = 0,
            l = 0;
        let hexValue = '';
        let rgbValue = '';
        let hslValue = '';

        try {
            if (source === 'hex') {
                const rgb = hexToRgb(value);
                if (rgb) {
                    r = rgb.r;
                    g = rgb.g;
                    b = rgb.b;
                } else {
                    throw new Error('Invalid HEX color');
                }
            } else if (source === 'rgb') {
                const parts = value.match(/\d+/g)?.map(Number);
                if (parts && parts.length === 3) {
                    [r, g, b] = parts;
                } else {
                    throw new Error('Invalid RGB color. Format: R, G, B');
                }
            } else if (source === 'hsl') {
                const parts = value.match(/\d+/g)?.map(Number);
                if (parts && parts.length === 3) {
                    [h, s, l] = parts;
                    const rgbResult = hslToRgb(h, s, l);
                    r = rgbResult.r;
                    g = rgbResult.g;
                    b = rgbResult.b;
                } else {
                    throw new Error('Invalid HSL color. Format: H, S, L');
                }
            }

            // Convert to all formats
            if (source !== 'hex') hexValue = rgbToHex(r, g, b);
            else hexValue = value;

            if (source !== 'rgb') rgbValue = `${r}, ${g}, ${b}`;
            else rgbValue = value;

            if (source !== 'hsl') {
                const hslResult = rgbToHsl(r, g, b);
                hslValue = `${hslResult.h}, ${hslResult.s}, ${hslResult.l}`;
            } else hslValue = value;

            setHex(hexValue);
            setRgb(rgbValue);
            setHsl(hslValue);
        } catch (error: unknown) {
            console.error('Color conversion error:', error);
            // Optionally, display error to user
        }
    }, []);

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setHex(value);
        convertColors('hex', value);
    };

    const handleRgbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRgb(value);
        convertColors('rgb', value);
    };

    const handleHslChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setHsl(value);
        convertColors('hsl', value);
    };

    const handleWheelColorChange = useCallback(
        (color: {
            hex: string;
            rgb: { r: number; g: number; b: number };
            hsl: { h: number; s: number; l: number };
        }) => {
            setHex(color.hex);
            setRgb(`${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`);
            setHsl(`${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%`);
        },
        []
    );

    return (
        <div className='flex flex-col items-center justify-center min-h-screen py-4 sm:py-8 bg-gray-50 px-4'>
            <h1 className='text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center'>Color Converter</h1>

            {/* 색상 선택 섹션 */}
            <div className='w-full max-w-4xl mb-6 sm:mb-8'>
                <h2 className='text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center'>색상 선택</h2>
                <div className='bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md border'>
                    <div className='flex justify-center'>
                        <ColorWheel size={280} onColorChange={handleWheelColorChange} className='mx-auto max-w-full' />
                    </div>
                </div>
            </div>

            {/* 색상 변환 입력 필드 */}
            <div className='w-full max-w-4xl mb-6 sm:mb-8'>
                <h3 className='text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center'>색상 변환</h3>
                <div className='bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md border'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                        <div className='flex flex-col'>
                            <label htmlFor='hexInput' className='mb-2 text-base sm:text-lg font-medium text-gray-700'>
                                HEX
                            </label>
                            <input
                                id='hexInput'
                                type='text'
                                className='p-2 sm:p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-sm sm:text-base'
                                placeholder='e.g., #FF0000'
                                value={hex}
                                onChange={handleHexChange}
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label htmlFor='rgbInput' className='mb-2 text-base sm:text-lg font-medium text-gray-700'>
                                RGB
                            </label>
                            <input
                                id='rgbInput'
                                type='text'
                                className='p-2 sm:p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-sm sm:text-base'
                                placeholder='e.g., 255, 0, 0'
                                value={rgb}
                                onChange={handleRgbChange}
                            />
                        </div>
                        <div className='flex flex-col sm:col-span-2 lg:col-span-1'>
                            <label htmlFor='hslInput' className='mb-2 text-base sm:text-lg font-medium text-gray-700'>
                                HSL
                            </label>
                            <input
                                id='hslInput'
                                type='text'
                                className='p-2 sm:p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-sm sm:text-base'
                                placeholder='e.g., 0, 100%, 50%'
                                value={hsl}
                                onChange={handleHslChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* 색상 미리보기 영역 */}
            <div className='w-full max-w-4xl'>
                <h3 className='text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center'>색상 미리보기</h3>
                <div className='bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md border'>
                    <div
                        className='w-full h-24 sm:h-32 rounded-lg border-2 border-gray-300 shadow-inner'
                        style={{
                            backgroundColor: hex || rgb || hsl ? `rgb(${rgb.replace(/\s/g, '')})` : 'transparent',
                            backgroundImage:
                                hex || rgb || hsl
                                    ? 'none'
                                    : 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px',
                        }}
                    ></div>
                    {(hex || rgb || hsl) && (
                        <div className='mt-3 sm:mt-4 text-center'>
                            <p className='text-xs sm:text-sm text-gray-600'>
                                현재 선택된 색상: <span className='font-mono font-bold break-all'>{hex}</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
