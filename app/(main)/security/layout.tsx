// 파일 경로: app/(main)/security/layout.tsx

'use client';

import { Button } from '@/components/ui/button';
import { allTools } from '@/app/data/integrations';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export default function SecurityToolLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const currentTool = useMemo(() => {
        const toolId = pathname.split('/').pop();
        return allTools.find((tool) => tool.id === toolId);
    }, [pathname]);

    const Icon = currentTool?.icon;

    return (
        <div className="container mx-auto px-4 py-8">
            {currentTool && Icon && (
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${currentTool.color}20` }}
                        >
                            <Icon className="w-6 h-6" style={{ color: currentTool.color }} />
                        </div>
                        <h1 className="text-3xl font-bold">{currentTool.name}</h1>
                    </div>

                    <Link href="/" passHref>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            모든 도구 보기
                        </Button>
                    </Link>
                </div>
            )}

            {children}
        </div>
    );
}
