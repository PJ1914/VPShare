/**
 * Sitemap Generator for CodeTapasya
 * Generate sitemap.xml for better SEO
 */

export const generateSitemap = (courses = [], assignments = [], liveClasses = []) => {
    const baseUrl = 'https://codetapasya.com';
    const currentDate = new Date().toISOString().split('T')[0];

    const staticPages = [
        { url: '/', changefreq: 'daily', priority: '1.0' },
        { url: '/courses', changefreq: 'daily', priority: '0.9' },
        { url: '/playground', changefreq: 'weekly', priority: '0.8' },
        { url: '/event-registration', changefreq: 'monthly', priority: '0.8' },
        { url: '/live-classes', changefreq: 'daily', priority: '0.8' },
        { url: '/leaderboard', changefreq: 'daily', priority: '0.7' },
        { url: '/signup', changefreq: 'monthly', priority: '0.6' },
        { url: '/login', changefreq: 'monthly', priority: '0.5' }
    ];

    const coursePages = courses.map(course => ({
        url: `/courses/${course.id}`,
        changefreq: 'weekly',
        priority: '0.8',
        lastmod: course.updatedAt || currentDate
    }));

    const assignmentPages = assignments.map(assignment => ({
        url: `/assignments/${assignment.id}`,
        changefreq: 'weekly',
        priority: '0.6',
        lastmod: assignment.updatedAt || currentDate
    }));

    const liveClassPages = liveClasses.map(liveClass => ({
        url: `/live-classes/${liveClass.id}`,
        changefreq: 'daily',
        priority: '0.7',
        lastmod: liveClass.updatedAt || currentDate
    }));

    const allPages = [
        ...staticPages,
        ...coursePages,
        ...assignmentPages,
        ...liveClassPages
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allPages.map(page => `    <url>
        <loc>${baseUrl}${page.url}</loc>
        <lastmod>${page.lastmod || currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`).join('\n')}
</urlset>`;

    return xml;
};

/**
 * Static sitemap for immediate use
 */
export const STATIC_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://codetapasya.com/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://codetapasya.com/courses</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://codetapasya.com/playground</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://codetapasya.com/event-registration</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://codetapasya.com/live-classes</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://codetapasya.com/leaderboard</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://codetapasya.com/signup</loc>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
</urlset>`;
