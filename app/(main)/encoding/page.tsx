'use client';

import { useRouter } from 'next/navigation';
import { encodingTools } from '../../data/encoding-tools';
import type { Integration } from '../../data/types';
import SimpleCategoryFilter from './components/SimpleCategoryFilter';
import IntegrationGrid from '../integrations/components/IntegrationGrid';
import SearchBar from '../integrations/components/SearchBar';
import { useToolCatalog } from '@/hooks/useToolCatalog';
import { toolPath } from '@/lib/utils/paths';

export default function EncodingTools() {
    const router = useRouter();

    // 카테고리 목록은 훅이 데이터에서 파생한다 — 이전의 하드코딩 목록은
    // '특수 인코딩' 을 빼먹어 morse-code/caesar-cipher 가 필터에서 안 보였다.
    const {
        setQuery,
        category,
        setCategory,
        categories,
        favorites,
        toggleFavorite,
        visibleTools,
    } = useToolCatalog({ tools: encodingTools, allCategoryLabel: '전체' });

    const handleSelectIntegration = (integration: Integration) => {
        router.push(toolPath(integration));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">인코딩/디코딩 도구</h1>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="w-full md:w-64">
                    <SimpleCategoryFilter
                        categories={['전체', ...categories]}
                        selectedCategory={category}
                        onSelectCategory={setCategory}
                    />
                </div>
                <div className="flex-1">
                    <SearchBar onSearch={setQuery} />
                </div>
            </div>

            <IntegrationGrid
                integrations={visibleTools}
                onSelectIntegration={handleSelectIntegration}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
            />
        </div>
    );
}
