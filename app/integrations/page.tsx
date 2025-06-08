'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { categories, integrations } from '../data/integrations';
import CategoryFilter from './components/CategoryFilter';
import FeaturedIntegrations from './components/FeaturedIntegrations';
import IntegrationGrid from './components/IntegrationGrid';
import IntegrationModal from './components/IntegrationModal';
import Pagination from './components/Pagination';
import SearchBar from './components/SearchBar';
import SortOptions from './components/SortOptions';

const ITEMS_PER_PAGE = 30;

const sortOptions = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'category', label: 'Category' },
];

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState('name-asc');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [view, setView] = useState('grid');

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteIntegrations');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage whenever they change
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

  const sortedAndFilteredIntegrations = useMemo(() => {
    const filtered = integrations.filter((integration) => {
      const categoryMatch =
        selectedCategory === 'All' || integration.category === selectedCategory;
      const searchMatch =
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });

    // Apply sorting
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
    return integrations.filter((integration) =>
      favorites.includes(integration.id)
    );
  }, [favorites]);

  const totalPages = Math.ceil(
    sortedAndFilteredIntegrations.length / ITEMS_PER_PAGE
  );
  const paginatedIntegrations = sortedAndFilteredIntegrations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSelectIntegration = (integration) => {
    setSelectedIntegration(integration);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <CategoryFilter
        categories={categories}
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
            Integrations
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}>
            <FeaturedIntegrations
              integrations={integrations.slice(0, 10)}
              onSelect={handleSelectIntegration}
            />
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
              <TabsTrigger value="all">All Integrations</TabsTrigger>
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
                  <p className="text-gray-500">No favorite integrations yet.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Click the heart icon on any integration to add it to your
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
