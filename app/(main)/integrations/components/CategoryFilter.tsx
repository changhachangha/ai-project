'use client';

import type { Integration } from '@/app/data/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

type CategoryFilterProps = {
  groupedTools: {
    category: string;
    tools: Integration[];
  }[];
};

export default function CategoryFilter({ groupedTools }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [openCategory, setOpenCategory] = useState<string | null>(() => {
    const currentTool = groupedTools
      .flatMap((g) => g.tools)
      .find((t) => pathname.includes(`/encoding/${t.id}`));
    return currentTool?.category || null;
  });

  const handleToggleCategory = (category: string) => {
    setOpenCategory((prev) => (prev === category ? null : category));
  };

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col h-screen p-4">
      <h2 className="text-lg font-semibold mb-2 px-2">Tools</h2>
      <div className="flex-1 overflow-auto space-y-1">
        {groupedTools.map(({ category, tools }) => (
          <div key={category}>
            <Button
              variant="ghost"
              className="w-full justify-between text-sm font-semibold py-1 px-2 h-auto"
              onClick={() => handleToggleCategory(category)}>
              {category}
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  openCategory === category && 'rotate-180'
                )}
              />
            </Button>

            <AnimatePresence>
              {openCategory === category && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="pl-4 mt-1 space-y-1 border-l-2 ml-3 overflow-hidden">
                  {tools.map((tool) => (
                    <Button
                      key={tool.id}
                      variant="ghost"
                      size="sm"
                      // --- 수정된 부분 ---
                      className={cn(
                        'w-full justify-start font-normal text-muted-foreground hover:bg-accent',
                        pathname.includes(`/encoding/${tool.id}`) &&
                          'bg-primary text-primary-foreground font-semibold hover:bg-primary/90'
                      )}
                      onClick={() => router.push(`/encoding/${tool.id}`)}>
                      {tool.name}
                    </Button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </aside>
  );
}
