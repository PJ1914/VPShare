import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

/**
 * SEO Component - Production-grade SEO implementation
 * Handles meta tags, Open Graph, Twitter Cards, and structured data
 */
const SEO = ({
    title = 'CodeTapasya - Learn Programming Online | Best Coding Courses',
    description = 'Master programming with CodeTapasya\'s interactive courses. Learn JavaScript, React, Python, and more with hands-on projects, live classes, and expert guidance.',
    keywords = 'programming courses, learn coding, online programming, JavaScript, React, Python, web development, coding bootcamp, programming tutorials, machine learning, full stack development',
    image = 'https://codetapasya.com/og-image.jpg',
    type = 'website',
    structuredData = null,
    canonical = null,
    noindex = false,
    author = 'CodeTapasya',
    publishedTime = null,
    modifiedTime = null,
    section = null,
    tags = []
}) => {
    const location = useLocation();
    const baseUrl = 'https://codetapasya.com';

    // Construct full URL
    const url = canonical || `${baseUrl}${location.pathname}`;

    // Ensure title includes brand name
    const fullTitle = title.includes('CodeTapasya') ? title : `${title} | CodeTapasya`;

    useEffect(() => {
        // Update document title
        document.title = fullTitle;

        // Update meta tags
        updateMetaTag('name', 'description', description);
        updateMetaTag('name', 'keywords', keywords);
        updateMetaTag('name', 'author', author);
        updateMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

        // Open Graph
        updateMetaTag('property', 'og:type', type);
        updateMetaTag('property', 'og:url', url);
        updateMetaTag('property', 'og:title', fullTitle);
        updateMetaTag('property', 'og:description', description);
        updateMetaTag('property', 'og:image', image);
        updateMetaTag('property', 'og:site_name', 'CodeTapasya');
        updateMetaTag('property', 'og:locale', 'en_US');

        // Article-specific Open Graph tags
        if (type === 'article') {
            if (publishedTime) updateMetaTag('property', 'article:published_time', publishedTime);
            if (modifiedTime) updateMetaTag('property', 'article:modified_time', modifiedTime);
            if (author) updateMetaTag('property', 'article:author', author);
            if (section) updateMetaTag('property', 'article:section', section);
            tags.forEach(tag => {
                const meta = document.createElement('meta');
                meta.setAttribute('property', 'article:tag');
                meta.content = tag;
                document.head.appendChild(meta);
            });
        }

        // Twitter Card
        updateMetaTag('name', 'twitter:card', 'summary_large_image');
        updateMetaTag('name', 'twitter:site', '@CodeTapasya');
        updateMetaTag('name', 'twitter:creator', '@CodeTapasya');
        updateMetaTag('name', 'twitter:title', fullTitle);
        updateMetaTag('name', 'twitter:description', description);
        updateMetaTag('name', 'twitter:image', image);

        // Canonical URL
        updateCanonicalLink(url);

        // Structured Data
        if (structuredData) {
            updateStructuredData(structuredData);
        }

        // Cleanup function
        return () => {
            // Remove article tags on unmount
            if (type === 'article') {
                document.querySelectorAll('meta[property^="article:"]').forEach(el => el.remove());
            }
        };
    }, [fullTitle, description, keywords, author, noindex, type, url, image, publishedTime, modifiedTime, section, tags, structuredData]);

    return null;
};

/**
 * Helper function to update or create meta tags
 */
const updateMetaTag = (attribute, key, content) => {
    if (!content) return;

    let element = document.querySelector(`meta[${attribute}="${key}"]`);

    if (element) {
        element.setAttribute('content', content);
    } else {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        element.setAttribute('content', content);
        document.head.appendChild(element);
    }
};

/**
 * Helper function to update canonical link
 */
const updateCanonicalLink = (url) => {
    let link = document.querySelector('link[rel="canonical"]');

    if (link) {
        link.setAttribute('href', url);
    } else {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        link.setAttribute('href', url);
        document.head.appendChild(link);
    }
};

/**
 * Helper function to update structured data
 */
const updateStructuredData = (data) => {
    // Remove existing structured data
    const existing = document.querySelector('script[type="application/ld+json"]');
    if (existing) {
        existing.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
};

SEO.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    keywords: PropTypes.string,
    image: PropTypes.string,
    type: PropTypes.string,
    structuredData: PropTypes.object,
    canonical: PropTypes.string,
    noindex: PropTypes.bool,
    author: PropTypes.string,
    publishedTime: PropTypes.string,
    modifiedTime: PropTypes.string,
    section: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string)
};

export default SEO;
