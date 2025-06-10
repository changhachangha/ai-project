// app/(main)/integrations/page.tsx

'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import type { Integration } from '../../data/types';
import { allTools } from '../../data/integrations';
import IntegrationGrid from './components/IntegrationGrid';
import SearchBar from './components/SearchBar';
import SortOptions from './components/SortOptions'; // --- 추가된 부분 ---

// 카테고리 이름을 URL 경로로 변환하는 헬퍼 함수
const getPathForCategory = (category: string) => {
    switch (category) {
        case '텍스트 처리':
            return 'text';
        case '보안/암호화':
            return 'security';
        default:
            return 'encoding';
    }
};

const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'category', label: 'Category' },
];

export default function IntegrationsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const selectedCategory = searchParams.get('category') || 'All';

    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('name-asc');
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        const savedFavorites = localStorage.getItem('favoriteIntegrations');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('favoriteIntegrations', JSON.stringify(favorites));
    }, [favorites]);

    const handleToggleFavorite = (id: string) => {
        setFavorites((prev) => (prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]));
    };

    const sortedAndFilteredTools = useMemo(() => {
        const filtered = allTools.filter((tool) => {
            const categoryMatch = selectedCategory === 'All' || tool.category === selectedCategory;
            const searchMatch =
                tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.description.toLowerCase().includes(searchQuery.toLowerCase());
            return categoryMatch && searchMatch;
        });

        return filtered.sort((a, b) => {
            switch (sortOption) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'category':
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });
    }, [selectedCategory, searchQuery, sortOption]);

    const handleSelectTool = (tool: Integration) => {
        const path = `/${getPathForCategory(tool.category)}/${tool.id}`;
        router.push(path);
    };

    return (
        <div className="p-4 md:p-6 space-y-4">
            <motion.h1
                className="text-2xl font-bold"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Developer Tools
            </motion.h1>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <SearchBar onSearch={setSearchQuery} />
                <div className="flex items-center gap-4">
                    <SortOptions options={sortOptions} selectedOption={sortOption} onSelectOption={setSortOption} />
                </div>
            </div>

            <div className="flex-1 overflow-auto mt-4">
                <IntegrationGrid
                    integrations={sortedAndFilteredTools}
                    onSelectIntegration={handleSelectTool}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                />
            </div>
        </div>
    );
}
