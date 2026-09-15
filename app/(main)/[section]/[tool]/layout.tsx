import type { Metadata } from 'next';

import { allTools } from '@/app/data/integrations';
import { toolPath } from '@/lib/utils/paths';
import RelatedTools from '@/components/recommend/RelatedTools';

// 메타데이터는 데이터 레코드에서 파생한다 — 도구마다 따로 적던 47개 layout 을
// 하나로 합친 것이다. title 템플릿('| AI 개발자 도구')은 루트 레이아웃이 붙인다.
export async function generateMetadata({
    params,
}: {
    params: Promise<{ section: string; tool: string }>;
}): Promise<Metadata> {
    const { section, tool } = await params;
    const record = allTools.find((item) => item.id === tool && item.section === section);
    if (!record) return {};

    return {
        title: record.name,
        description: record.description,
        alternates: {
            canonical: toolPath(record),
        },
    };
}

export default async function ToolLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ section: string; tool: string }>;
}) {
    const { section, tool } = await params;
    const record = allTools.find((item) => item.id === tool && item.section === section);

    const Icon = record?.icon;

    return (
        <div className='container mx-auto px-4 py-8'>
            {/* 이전에는 encoding/security/text 섹션에만 있던 헤더다.
                레코드 기반으로 바꾸면서 conversion/developer 도구에도 적용된다. */}
            {record && Icon && (
                <div className='flex items-center gap-3 mb-8'>
                    <div
                        className='w-12 h-12 rounded-full flex items-center justify-center'
                        style={{ backgroundColor: `${record.color}20` }}
                    >
                        <Icon className='w-6 h-6' style={{ color: record.color }} />
                    </div>
                    <h1 className='text-3xl font-bold'>{record.name}</h1>
                </div>
            )}

            {children}

            {record && <RelatedTools toolId={record.id} />}
        </div>
    );
}
