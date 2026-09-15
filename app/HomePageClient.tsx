'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import type { Integration } from './data/types';
import { useRouter } from 'next/navigation';
import { allTools } from './data/integrations';
import FeaturedIntegrations from '@/app/(main)/integrations/components/FeaturedIntegrations';
import IntegrationGrid from '@/app/(main)/integrations/components/IntegrationGrid';
import Pagination from '@/app/(main)/integrations/components/Pagination';
import SearchBar from '@/app/(main)/integrations/components/SearchBar';
import SortOptions from '@/app/(main)/integrations/components/SortOptions';
import dynamic from 'next/dynamic';

const MotionH1 = dynamic(() => import('framer-motion').then((mod) => mod.motion.h1), { ssr: false });
const MotionDiv = dynamic(() => import('framer-motion').then((mod) => mod.motion.div), { ssr: false });

import { useToolCatalog, type ToolSortValue } from '@/hooks/useToolCatalog';
import { toolPath } from '@/lib/utils/paths';

const ITEMS_PER_PAGE = 30;

export default function HomePageClient() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);

    // 카탈로그 상태(검색·정렬·즐겨찾기·사용기록·추천)는 전부 훅 안에 있다.
    const {
        setQuery,
        sortOption,
        setSortOption,
        sortOptions,
        favorites,
        toggleFavorite,
        visibleTools,
        favoriteTools,
        featuredTools,
        featuredReasons,
    } = useToolCatalog({ tools: allTools });

    const totalPages = Math.ceil(visibleTools.length / ITEMS_PER_PAGE);
    const paginatedIntegrations = visibleTools.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSelectIntegration = (integration: Integration) => {
        router.push(toolPath(integration));
    };

    return (
        <div className='flex h-screen bg-background overflow-hidden'>
            <main className='flex-1 flex flex-col overflow-y-auto'>
                <div className='flex-1 p-4 md:p-6 space-y-4'>
                    <header className='flex items-center gap-4'>
                        <MotionH1
                            className='text-2xl font-bold text-foreground'
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            Integrations & Tools
                        </MotionH1>
                    </header>

                    <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <FeaturedIntegrations
                            integrations={featuredTools}
                            reasonById={featuredReasons}
                            onSelect={handleSelectIntegration}
                        />
                    </MotionDiv>

                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                        <SearchBar
                            onSearch={(query) => {
                                setQuery(query);
                                setCurrentPage(1);
                            }}
                        />
                        <div className='flex items-center gap-4'>
                            <SortOptions
                                options={sortOptions}
                                selectedOption={sortOption}
                                onSelectOption={(value) => setSortOption(value as ToolSortValue)}
                            />
                        </div>
                    </div>

                    <Tabs defaultValue='all' className='w-full'>
                        <TabsList className='bg-muted border-border'>
                            <TabsTrigger
                                value='all'
                                className='text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground'
                            >
                                All Items
                            </TabsTrigger>
                            <TabsTrigger
                                value='favorites'
                                className='text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground'
                            >
                                Favorites ({favoriteTools.length})
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value='all' className='mt-4'>
                            <div className='overflow-auto'>
                                <IntegrationGrid
                                    integrations={paginatedIntegrations}
                                    onSelectIntegration={handleSelectIntegration}
                                    favorites={favorites}
                                    onToggleFavorite={toggleFavorite}
                                />
                                <div className='mt-6'>
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value='favorites' className='mt-4'>
                            {favoriteTools.length > 0 ? (
                                <IntegrationGrid
                                    integrations={favoriteTools}
                                    onSelectIntegration={handleSelectIntegration}
                                    favorites={favorites}
                                    onToggleFavorite={toggleFavorite}
                                />
                            ) : (
                                <div className='text-center py-10'>
                                    <p className='text-muted-foreground'>No favorite items yet.</p>
                                    <p className='text-sm text-muted-foreground mt-2'>
                                        Click the heart icon on any item to add it to your favorites.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
