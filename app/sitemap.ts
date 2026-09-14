import type { MetadataRoute } from 'next';
import { allTools } from '@/app/data/integrations';
import { getPathForCategory } from '@/lib/utils/routing';
import { SITE_URL } from '@/lib/site';

/** 정적 페이지 (도구가 아닌 고정 라우트) */
const STATIC_ROUTES: { path: string; priority: number }[] = [
    { path: '/', priority: 1 },
    { path: '/encoding', priority: 0.8 },
    { path: '/integrations', priority: 0.6 },
    { path: '/settings', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
        url: `${SITE_URL}${route.path}`,
        lastModified,
        changeFrequency: route.path === '/' ? 'daily' : 'weekly',
        priority: route.priority,
    }));

    const toolEntries: MetadataRoute.Sitemap = allTools.map((tool) => ({
        url: `${SITE_URL}/${getPathForCategory(tool.category)}/${tool.id}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    return [...staticEntries, ...toolEntries];
}
