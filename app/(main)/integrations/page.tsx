// app/(main)/integrations/page.tsx

'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Integration } from '../../data/types';
import { allTools } from '../../data/integrations';
import IntegrationGrid from './components/IntegrationGrid';
import SearchBar from './components/SearchBar';
import SortOptions from './components/SortOptions'; // --- 추가된 부분 ---

import { useToolCatalog, type ToolSortValue } from '@/hooks/useToolCatalog';
import { toolPath } from '@/lib/utils/paths';

export default function IntegrationsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const selectedCategory = searchParams.get('category') || 'All';

    // URL 파라미터가 카테고리를 제어하므로 controlled 로 넘긴다.
    const { setQuery, sortOption, setSortOption, sortOptions, favorites, toggleFavorite, visibleTools } = useToolCatalog(
        { tools: allTools, category: selectedCategory }
    );

    const handleSelectTool = (tool: Integration) => {
        router.push(toolPath(tool));
    };

    return (
        <div className='p-4 md:p-6 space-y-4'>
            <motion.h1
                className='text-2xl font-bold'
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Developer Tools
            </motion.h1>

            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                <SearchBar onSearch={setQuery} />
                <div className='flex items-center gap-4'>
                    <SortOptions
                        options={sortOptions}
                        selectedOption={sortOption}
                        onSelectOption={(value) => setSortOption(value as ToolSortValue)}
                    />
                </div>
            </div>

            <div className='flex-1 overflow-auto mt-4'>
                <IntegrationGrid
                    integrations={visibleTools}
                    onSelectIntegration={handleSelectTool}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                />
            </div>
        </div>
    );
}
