import { notFound } from 'next/navigation';

import { allTools } from '@/app/data/integrations';
import ToolHost from '@/components/tools/tool-host';

// 47개 정적 조합만 생성한다. 그 외 경로는 404.
export const dynamicParams = false;

export function generateStaticParams() {
    return allTools.map((tool) => ({ section: tool.section, tool: tool.id }));
}

export default async function ToolPage({ params }: { params: Promise<{ section: string; tool: string }> }) {
    const { section, tool } = await params;

    const record = allTools.find((item) => item.id === tool && item.section === section);
    if (!record) notFound();

    return <ToolHost toolId={record.id} />;
}
