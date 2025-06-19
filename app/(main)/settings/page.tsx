'use client';

import React from 'react';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const SettingsPage: React.FC = () => {
    const {
        theme,
        fontSize,
        dateFormat,
        jsonIndentation,
        toggleTheme,
        setFontSize,
        setDateFormat,
        setJsonIndentation,
    } = useSettingsStore();

    return (
        <div className='flex flex-col space-y-8 p-8'>
            <h1 className='text-3xl font-bold'>Settings</h1>

            <section className='space-y-4'>
                <h2 className='text-2xl font-semibold'>Theme</h2>
                <div className='flex items-center space-x-4'>
                    <Label htmlFor='theme-select'>Select Theme:</Label>
                    <Select onValueChange={(value: 'light' | 'dark') => toggleTheme(value)} defaultValue={theme}>
                        <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Select a theme' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='light'>Light</SelectItem>
                            <SelectItem value='dark'>Dark</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => toggleTheme()}>Toggle Theme</Button>
                </div>
            </section>

            <section className='space-y-4'>
                <h2 className='text-2xl font-semibold'>Font Size</h2>
                <div className='flex items-center space-x-4'>
                    <Label htmlFor='font-size-select'>Select Font Size:</Label>
                    <Select onValueChange={(value: 'sm' | 'md' | 'lg') => setFontSize(value)} defaultValue={fontSize}>
                        <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Select font size' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='sm'>Small</SelectItem>
                            <SelectItem value='md'>Medium</SelectItem>
                            <SelectItem value='lg'>Large</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </section>

            <section className='space-y-4'>
                <h2 className='text-2xl font-semibold'>Date Format</h2>
                <div className='flex items-center space-x-4'>
                    <Label htmlFor='date-format-select'>Select Date Format:</Label>
                    <Select
                        onValueChange={(value: 'YYYY-MM-DD' | 'MM/DD/YYYY') => setDateFormat(value)}
                        defaultValue={dateFormat}
                    >
                        <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Select date format' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='YYYY-MM-DD'>YYYY-MM-DD</SelectItem>
                            <SelectItem value='MM/DD/YYYY'>MM/DD/YYYY</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </section>

            <section className='space-y-4'>
                <h2 className='text-2xl font-semibold'>JSON Indentation</h2>
                <div className='flex items-center space-x-4'>
                    <Label htmlFor='json-indentation-select'>Select JSON Indentation:</Label>
                    <Select
                        onValueChange={(value: string) => {
                            if (value === 'tab') {
                                setJsonIndentation('tab');
                            } else {
                                setJsonIndentation(parseInt(value));
                            }
                        }}
                        defaultValue={jsonIndentation.toString()}
                    >
                        <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Select indentation' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='2'>2 Spaces</SelectItem>
                            <SelectItem value='4'>4 Spaces</SelectItem>
                            <SelectItem value='tab'>Tab</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </section>
        </div>
    );
};

export default SettingsPage;
