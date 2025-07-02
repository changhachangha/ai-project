import React, { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    togglePalette: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, togglePalette }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    // Dummy list of tools for now
    const tools = [
        { id: 'json', name: 'JSON Formatter' },
        { id: 'encode', name: 'Encode / Decode Tool' },
        { id: 'timestamp', name: 'Timestamp Converter' },
        { id: 'color', name: 'Color Converter' },
        { id: 'diff', name: 'Text Diff Tool' },
        { id: 'public-key-extractor', name: 'Public Key Extractor' },
    ];

    const filteredTools = tools.filter((tool) => tool.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleToolSelect = (toolId: string) => {
        if (toolId === 'public-key-extractor') {
            router.push(`/(main)/security/${toolId}`);
        } else {
            router.push(`/(main)/tools/${toolId}`);
        }
        onClose();
    };

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                togglePalette();
            }
        },
        [togglePalette]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>Command Palette</DialogTitle>
                    <DialogDescription>Search for a tool or action.</DialogDescription>
                </DialogHeader>
                <Input
                    placeholder='Search tools...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='col-span-3'
                />
                <div className='grid gap-4 py-4'>
                    {filteredTools.length > 0 ? (
                        filteredTools.map((tool) => (
                            <div
                                key={tool.id}
                                className='p-2 border rounded-md cursor-pointer hover:bg-muted'
                                onClick={() => handleToolSelect(tool.id)}
                            >
                                {tool.name}
                            </div>
                        ))
                    ) : (
                        <p className='text-center text-muted-foreground'>No tools found.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CommandPalette;
