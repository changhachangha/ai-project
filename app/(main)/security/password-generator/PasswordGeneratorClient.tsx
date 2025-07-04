'use client';

import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Copy, Lock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordOptions {
    length: number;
    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
    excludeSimilar: boolean;
}

const PasswordGeneratorClient = memo(() => {
    const [password, setPassword] = useState('');
    const [options, setOptions] = useState<PasswordOptions>({
        length: 12,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
        excludeSimilar: false,
    });

    const generatePassword = useCallback(() => {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const similar = 'il1Lo0O';

        let charset = '';
        if (options.includeUppercase) charset += uppercase;
        if (options.includeLowercase) charset += lowercase;
        if (options.includeNumbers) charset += numbers;
        if (options.includeSymbols) charset += symbols;

        if (options.excludeSimilar) {
            charset = charset
                .split('')
                .filter((char) => !similar.includes(char))
                .join('');
        }

        if (charset === '') {
            toast.error('최소 하나의 문자 유형을 선택해주세요.');
            return;
        }

        let result = '';
        for (let i = 0; i < options.length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        setPassword(result);
    }, [options]);

    const getPasswordStrength = useCallback((pwd: string) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        if (score <= 2) return { strength: '약함', color: 'bg-red-500', variant: 'destructive' as const };
        if (score <= 4) return { strength: '보통', color: 'bg-yellow-500', variant: 'secondary' as const };
        return { strength: '강함', color: 'bg-green-500', variant: 'default' as const };
    }, []);

    const handleCopy = useCallback(() => {
        if (!password) {
            toast.error('먼저 패스워드를 생성해주세요.');
            return;
        }
        navigator.clipboard.writeText(password).then(() => {
            toast.success('패스워드가 클립보드에 복사되었습니다!');
        });
    }, [password]);

    const handleOptionChange = useCallback((key: keyof PasswordOptions, value: boolean | number) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    }, []);

    const strengthInfo = password ? getPasswordStrength(password) : null;

    return (
        <div className='container mx-auto p-4 max-w-2xl'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Lock className='h-5 w-5' />
                        패스워드 생성기
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                    {/* 패스워드 출력 */}
                    <div className='space-y-2'>
                        <Label>생성된 패스워드</Label>
                        <div className='flex gap-2'>
                            <Input
                                value={password}
                                readOnly
                                placeholder='패스워드가 여기에 표시됩니다...'
                                className='font-mono'
                            />
                            <Button variant='outline' size='icon' onClick={handleCopy}>
                                <Copy className='h-4 w-4' />
                            </Button>
                        </div>
                        {strengthInfo && (
                            <div className='flex items-center gap-2'>
                                <Badge variant={strengthInfo.variant}>강도: {strengthInfo.strength}</Badge>
                                <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden'>
                                    <div
                                        className={`h-full ${strengthInfo.color} transition-all duration-300`}
                                        style={{
                                            width:
                                                strengthInfo.strength === '약함'
                                                    ? '33%'
                                                    : strengthInfo.strength === '보통'
                                                    ? '66%'
                                                    : '100%',
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 패스워드 길이 */}
                    <div className='space-y-2'>
                        <Label>패스워드 길이: {options.length}</Label>
                        <Slider
                            value={[options.length]}
                            onValueChange={(value) => handleOptionChange('length', value[0])}
                            min={4}
                            max={50}
                            step={1}
                            className='w-full'
                        />
                    </div>

                    {/* 옵션 */}
                    <div className='space-y-4'>
                        <Label>포함할 문자 유형</Label>
                        <div className='space-y-3'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='uppercase'
                                    checked={options.includeUppercase}
                                    onCheckedChange={(checked) => handleOptionChange('includeUppercase', !!checked)}
                                />
                                <Label htmlFor='uppercase'>대문자 (A-Z)</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='lowercase'
                                    checked={options.includeLowercase}
                                    onCheckedChange={(checked) => handleOptionChange('includeLowercase', !!checked)}
                                />
                                <Label htmlFor='lowercase'>소문자 (a-z)</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='numbers'
                                    checked={options.includeNumbers}
                                    onCheckedChange={(checked) => handleOptionChange('includeNumbers', !!checked)}
                                />
                                <Label htmlFor='numbers'>숫자 (0-9)</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='symbols'
                                    checked={options.includeSymbols}
                                    onCheckedChange={(checked) => handleOptionChange('includeSymbols', !!checked)}
                                />
                                <Label htmlFor='symbols'>특수문자 (!@#$%^&*)</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='excludeSimilar'
                                    checked={options.excludeSimilar}
                                    onCheckedChange={(checked) => handleOptionChange('excludeSimilar', !!checked)}
                                />
                                <Label htmlFor='excludeSimilar'>유사 문자 제외 (i, l, 1, L, o, 0, O)</Label>
                            </div>
                        </div>
                    </div>

                    {/* 생성 버튼 */}
                    <Button onClick={generatePassword} className='w-full'>
                        <RefreshCw className='h-4 w-4 mr-2' />
                        패스워드 생성
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
});

PasswordGeneratorClient.displayName = 'PasswordGeneratorClient';

export default PasswordGeneratorClient;
