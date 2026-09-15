'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className='container mx-auto p-8 space-y-8'>
            <h1 className='text-3xl font-bold text-foreground'>Settings</h1>

            <Card className='bg-card border-border'>
                <CardHeader>
                    <CardTitle className='text-card-foreground'>테마 설정</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex items-center space-x-4'>
                        <Label htmlFor='theme-select' className='text-card-foreground'>
                            테마 선택:
                        </Label>
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger className='w-[180px] bg-background border-border text-foreground'>
                                <SelectValue placeholder='테마를 선택하세요' />
                            </SelectTrigger>
                            <SelectContent className='bg-popover border-border'>
                                <SelectItem value='light' className='text-popover-foreground'>
                                    라이트 모드
                                </SelectItem>
                                <SelectItem value='dark' className='text-popover-foreground'>
                                    다크 모드
                                </SelectItem>
                                <SelectItem value='system' className='text-popover-foreground'>
                                    시스템 설정
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant='outline'
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            className='border-border text-foreground hover:bg-accent hover:text-accent-foreground'
                        >
                            테마 전환
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsPage;
