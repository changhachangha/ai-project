'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SortOption = {
    value: string;
    label: string;
};

type SortOptionsProps = {
    options: SortOption[];
    selectedOption: string;
    onSelectOption: (value: string) => void;
};

export default function SortOptions({ options, selectedOption, onSelectOption }: SortOptionsProps) {
    return (
        <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Sort by:</span>
            <Select value={selectedOption} onValueChange={onSelectOption}>
                <SelectTrigger className='w-[180px] h-9'>
                    <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
