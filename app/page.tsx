'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
// --- 수정: allTools와 allCategories를 import ---
import { useRouter } from 'next/navigation'; // useRouter 훅 import
import { allCategories, allTools } from './data/integrations';
import CategoryFilter from './integrations/components/CategoryFilter';
import FeaturedIntegrations from './integrations/components/FeaturedIntegrations';
import IntegrationGrid from './integrations/components/IntegrationGrid';
import IntegrationModal from './integrations/components/IntegrationModal';
import Pagination from './integrations/components/Pagination';
import SearchBar from './integrations/components/SearchBar';
import SortOptions from './integrations/components/SortOptions';

const ITEMS_PER_PAGE = 30;

const sortOptions = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'category', label: 'Category' },
];

export default function Home() {
  const router = useRouter(); // router 인스턴스 생성
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState('name-asc');
  const [favorites, setFavorites] = useState<string[]>([]);

  // useEffect 등 나머지 로직은 그대로 유지...
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteIntegrations');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favoriteIntegrations', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      if (prev.includes(id)) {
        return prev.filter((favId) => favId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const sortedAndFilteredTools = useMemo(() => {
    // --- 수정: allTools를 사용 ---
    const filtered = allTools.filter((integration) => {
      const categoryMatch =
        selectedCategory === 'All' || integration.category === selectedCategory;
      const searchMatch =
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
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

  const favoriteIntegrations = useMemo(() => {
    return allTools.filter((integration) => favorites.includes(integration.id));
  }, [favorites, allTools]);

  const totalPages = Math.ceil(sortedAndFilteredTools.length / ITEMS_PER_PAGE);
  const paginatedIntegrations = sortedAndFilteredTools.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- 수정: 카드 클릭 시 분기 처리 ---
  const handleSelectIntegration = (integration) => {
    const encodingToolCategories = [
      '베이스 인코딩',
      'URL/텍스트 처리',
      '진수 변환',
    ];
    if (encodingToolCategories.includes(integration.category)) {
      // 인코딩 도구일 경우, 해당 페이지로 이동
      router.push(`/encoding/${integration.id}`);
    } else {
      // 일반 Integration일 경우, 모달 열기
      setSelectedIntegration(integration);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* --- 수정: allCategories를 전달 --- */}
      <CategoryFilter
        categories={allCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={(category) => {
          setSelectedCategory(category);
          setCurrentPage(1);
        }}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 md:p-6 space-y-4">
          <motion.h1
            className="text-2xl font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            Integrations & Tools
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}>
            {/* --- 수정: allTools에서 일부를 추천 목록으로 사용 --- */}
            <FeaturedIntegrations
              integrations={allTools.slice(0, 10)}
              onSelect={handleSelectIntegration}
            />
          </motion.div>

          {/* 나머지 UI 코드는 거의 동일 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <SearchBar
              onSearch={(query) => {
                setSearchQuery(query);
                setCurrentPage(1);
              }}
            />
            <div className="flex items-center gap-4">
              <SortOptions
                options={sortOptions}
                selectedOption={sortOption}
                onSelectOption={setSortOption}
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="favorites">
                Favorites ({favoriteIntegrations.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="flex-1 overflow-auto">
                <IntegrationGrid
                  integrations={paginatedIntegrations}
                  onSelectIntegration={handleSelectIntegration}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="favorites" className="mt-4">
              {favoriteIntegrations.length > 0 ? (
                <IntegrationGrid
                  integrations={favoriteIntegrations}
                  onSelectIntegration={handleSelectIntegration}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No favorite items yet.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Click the heart icon on any item to add it to your
                    favorites.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <IntegrationModal
          integration={selectedIntegration}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isFavorite={
            selectedIntegration
              ? favorites.includes(selectedIntegration.id)
              : false
          }
          onToggleFavorite={toggleFavorite}
        />
      </main>
    </div>
  );
}
