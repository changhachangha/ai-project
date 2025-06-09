'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { allTools } from '../../data/integrations';
import IntegrationGrid from './components/IntegrationGrid';
import SearchBar from './components/SearchBar';
import SortOptions from './components/SortOptions';

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

  const sortedAndFilteredTools = useMemo(() => {
    const filtered = allTools.filter((tool) => {
      const categoryMatch =
        selectedCategory === 'All' || tool.category === selectedCategory;
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

  // --- 수정된 부분 ---
  const handleSelectTool = (tool) => {
    // 현재 선택된 카테고리(selectedCategory)를 쿼리 파라미터로 추가합니다.
    const destination = `/encoding/${tool.id}?category=${encodeURIComponent(selectedCategory)}`;
    router.push(destination);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <motion.h1
        className="text-2xl font-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        Developer Tools
      </motion.h1>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SearchBar onSearch={setSearchQuery} />
        <div className="flex items-center gap-4">
          <SortOptions
            options={sortOptions}
            selectedOption={sortOption}
            onSelectOption={setSortOption}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto mt-4">
        <IntegrationGrid
          integrations={sortedAndFilteredTools}
          onSelectIntegration={handleSelectTool}
          favorites={[]}
          onToggleFavorite={() => {}}
        />
      </div>
    </div>
  );
}
