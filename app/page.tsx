'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import type { Integration } from './data/types';
import { useRouter } from 'next/navigation';
import { allTools } from './data/integrations';
import CategoryFilter from '@/app/(main)/integrations/components/CategoryFilter';
import FeaturedIntegrations from '@/app/(main)/integrations/components/FeaturedIntegrations';
import IntegrationGrid from '@/app/(main)/integrations/components/IntegrationGrid';
import IntegrationModal from '@/app/(main)/integrations/components/IntegrationModal';
import Pagination from '@/app/(main)/integrations/components/Pagination';
import SearchBar from '@/app/(main)/integrations/components/SearchBar';
import SortOptions from '@/app/(main)/integrations/components/SortOptions';
import { Menu } from 'lucide-react'; // --- 추가: 아이콘 import ---
import { Button } from '@/components/ui/button'; // --- 추가: 버튼 import ---

const ITEMS_PER_PAGE = 30;

const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'category', label: 'Category' },
];

export default function Home() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortOption, setSortOption] = useState('name-asc');
    const [favorites, setFavorites] = useState<string[]>([]);

    // --- 추가: 사이드바 상태 관리 ---
    const [isSidebarOpen, setSidebarOpen] = useState(false);

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
        const filtered = allTools.filter((integration) => {
            const searchMatch =
                integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                integration.description.toLowerCase().includes(searchQuery.toLowerCase());
            return searchMatch;
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
    }, [searchQuery, sortOption]);

    const favoriteIntegrations = useMemo(() => {
        return allTools.filter((integration) => favorites.includes(integration.id));
    }, [favorites]);

    const groupedTools = useMemo(() => {
        return allTools.reduce((acc, tool) => {
            let group = acc.find((g) => g.category === tool.category);
            if (!group) {
                group = { category: tool.category, tools: [] };
                acc.push(group);
            }
            group.tools.push(tool);
            return acc;
        }, [] as { category: string; tools: Integration[] }[]);
    }, []);

    const totalPages = Math.ceil(sortedAndFilteredTools.length / ITEMS_PER_PAGE);
    const paginatedIntegrations = sortedAndFilteredTools.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleLearnMore = (id: string) => {
        // 실제로는 여기에서 문서 페이지 등으로 이동하는 로직을 구현합니다.
        alert(`Learn More 버튼 클릭: ${id}`);
    };

    const handleConnect = (id: string) => {
        // 실제로는 여기에서 API 호출이나 인증 로직을 구현합니다.
        alert(`Connect 버튼 클릭: ${id}`);
    };

    const handleSelectIntegration = (integration: Integration) => {
        const encodingToolCategories = ['베이스 인코딩', 'URL/텍스트 처리', '진수 변환'];
        if (encodingToolCategories.includes(integration.category)) {
            router.push(`/encoding/${integration.id}`);
        } else {
            setSelectedIntegration(integration);
            setIsModalOpen(true);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* --- 수정: 사이드바에 상태 props 전달 --- */}
            <CategoryFilter groupedTools={groupedTools} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 flex flex-col overflow-y-auto">
                {/* --- 수정: 메인 콘텐츠 영역을 감싸고 헤더 추가 --- */}
                <div className="flex-1 p-4 md:p-6 space-y-4">
                    <header className="flex items-center gap-4">
                        {/* --- 추가: 모바일용 햄버거 메뉴 버튼 --- */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <motion.h1
                            className="text-2xl font-bold"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            Integrations & Tools
                        </motion.h1>
                    </header>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <FeaturedIntegrations integrations={allTools.slice(0, 10)} onSelect={handleSelectIntegration} />
                    </motion.div>

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
                            <TabsTrigger value="favorites">Favorites ({favoriteIntegrations.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="mt-4">
                            <div className="overflow-auto">
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
                                        Click the heart icon on any item to add it to your favorites.
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
                    isFavorite={selectedIntegration ? favorites.includes(selectedIntegration.id) : false}
                    onToggleFavorite={toggleFavorite}
                    onLearnMore={handleLearnMore}
                    onConnect={handleConnect}
                />
            </main>
        </div>
    );
}
