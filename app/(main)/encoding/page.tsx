'use client';

import { useState } from 'react';
import { encodingTools } from '../../data/encoding-tools';
import type { Integration } from '../../data/types';
import SimpleCategoryFilter from './components/SimpleCategoryFilter';
import IntegrationGrid from '../integrations/components/IntegrationGrid';
import SearchBar from '../integrations/components/SearchBar';

const categories = ['베이스 인코딩', 'URL/텍스트 처리', '진수 변환'];

export default function EncodingTools() {
    const [selectedCategory, setSelectedCategory] = useState<string>('전체');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [favorites, setFavorites] = useState<string[]>([]);

    const filteredTools = encodingTools.filter((tool) => {
        const matchesCategory = selectedCategory === '전체' || tool.category === selectedCategory;
        const matchesSearch =
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleSelectIntegration = (integration: Integration) => {
        window.location.href = `/encoding/${integration.id}`;
    };

    const handleToggleFavorite = (id: string) => {
        setFavorites((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">인코딩/디코딩 도구</h1>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="w-full md:w-64">
                    <SimpleCategoryFilter
                        categories={['전체', ...categories]}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />
                </div>
                <div className="flex-1">
                    <SearchBar onSearch={handleSearch} />
                </div>
            </div>

            <IntegrationGrid
                integrations={filteredTools}
                onSelectIntegration={handleSelectIntegration}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
            />
        </div>
    );
}
