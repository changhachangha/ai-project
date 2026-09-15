'use client';

import React, { useState, useCallback } from 'react';
import { ColorWheel } from '@/components/ui/color-wheel';
import { processColor } from '@/lib/tools/color';

// 페이지 입력 형식('255, 0, 0' / '0, 100%, 50%')을 lib 형식('rgb(255,0,0)' 등)으로 어댑트.
const toLibColor = (source: string, value: string): string => {
    const v = value.trim();
    if (source === 'hex') {
        const hex = v.startsWith('#') ? v : `#${v}`;
        const shorthand = /^#([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
        if (shorthand) {
            return `#${shorthand[1]}${shorthand[1]}${shorthand[2]}${shorthand[2]}${shorthand[3]}${shorthand[3]}`;
        }
        return hex;
    }
    if (source === 'rgb') {
        return `rgb(${v})`;
    }
    // hsl: '0, 100%, 50%' 또는 '0, 100, 50' 모두 허용 — % 를 보정한다.
    const parts = v.split(',').map((part) => part.trim());
    if (parts.length === 3) {
        return `hsl(${parts[0]}, ${parts[1].replace(/%?$/, '%')}, ${parts[2].replace(/%?$/, '%')})`;
    }
    return `hsl(${v})`;
};

const toDisplayRgb = (rgb: string): string => rgb.replace(/^rgb\(|\)$/g, '').split(',').join(', ');
const toDisplayHsl = (hsl: string): string =>
    hsl
        .replace(/^hsl\(|\)$/g, '')
        .split(',')
        .map((part) => part.trim())
        .join(', ');

export default function ColorConverterTool() {
    const [hex, setHex] = useState('');
    const [rgb, setRgb] = useState('');
    const [hsl, setHsl] = useState('');

    const convertColors = useCallback((source: string, value: string) => {
        const result = processColor({ color: toLibColor(source, value) });
        if (result.errorMessage) {
            // 기존 동작 유지: 변환 실패 시 필드를 그대로 둔다.
            console.error('Color conversion error:', result.errorMessage);
            return;
        }

        if (source !== 'hex') setHex(result.hex);
        if (source !== 'rgb') setRgb(toDisplayRgb(result.rgb));
        if (source !== 'hsl') setHsl(toDisplayHsl(result.hsl));
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
