/**
 * SEO Configuration and Utilities
 * Centralized SEO data for all pages
 */

export const DEFAULT_SEO = {
    siteName: 'CodeTapasya',
    siteUrl: 'https://codetapasya.com',
    defaultTitle: 'CodeTapasya - Learn Programming Online | Best Coding Courses',
    defaultDescription: 'Master programming with CodeTapasya\'s interactive courses. Learn JavaScript, React, Python, and more with hands-on projects, live classes, and expert guidance.',
    defaultImage: 'https://codetapasya.com/og-image.jpg',
    twitterHandle: '@CodeTapasya',
    themeColor: '#1e40af',
    locale: 'en_US'
};

/**
 * Page-specific SEO configurations
 */
export const PAGE_SEO = {
    home: {
        title: 'CodeTapasya - Learn Programming Online | Best Coding Courses',
        description: 'Master programming with CodeTapasya\'s interactive courses. Learn JavaScript, React, Python, Machine Learning, and Full Stack Development with hands-on projects and expert guidance.',
        keywords: 'programming courses, learn coding, online programming, JavaScript, React, Python, web development, coding bootcamp, machine learning, full stack development',
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: 'CodeTapasya',
            description: 'Online programming education platform offering interactive courses in web development, machine learning, and more.',
            url: 'https://codetapasya.com',
            logo: 'https://codetapasya.com/logo.png',
            sameAs: [
                'https://twitter.com/CodeTapasya',
                'https://linkedin.com/company/codetapasya',
                'https://github.com/codetapasya'
            ],
            contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                email: 'support@codetapasya.com'
            }
        }
    },

    courses: {
        title: 'Programming Courses - Learn Web Development, ML & More',
        description: 'Explore our comprehensive programming courses including JavaScript, React, Python, Machine Learning, and Full Stack Development. Interactive learning with real-world projects.',
        keywords: 'programming courses, web development courses, machine learning courses, JavaScript course, React course, Python course, full stack development',
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Programming Courses',
            description: 'List of programming courses offered by CodeTapasya',
            itemListElement: []
        }
    },

    dashboard: {
        title: 'Dashboard - Track Your Learning Progress',
        description: 'View your course progress, assignments, live classes, and achievements on your personalized CodeTapasya dashboard.',
        keywords: 'student dashboard, learning progress, course tracking, programming assignments',
        noindex: true // Private page
    },

    playground: {
        title: 'Code Playground - Practice Programming Online',
        description: 'Practice coding in our interactive online playground. Write, run, and test JavaScript, Python, and more in your browser.',
        keywords: 'code playground, online code editor, practice coding, JavaScript playground, Python playground',
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'CodeTapasya Playground',
            applicationCategory: 'DeveloperApplication',
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'INR'
            }
        }
    },

    eventRegistration: {
        title: 'Event Registration - Join Our Programming Workshops',
        description: 'Register for CodeTapasya\'s exclusive programming workshops and events. Learn Machine Learning, Full Stack Development, and more from industry experts.',
        keywords: 'programming workshop, coding event, machine learning workshop, full stack workshop, tech event registration',
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: 'CodeTapasya Programming Workshop',
            description: 'Intensive programming workshops covering Machine Learning and Full Stack Development',
            organizer: {
                '@type': 'Organization',
                name: 'CodeTapasya',
                url: 'https://codetapasya.com'
            },
            offers: {
                '@type': 'Offer',
                price: '1500',
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock'
            }
        }
    },

    liveClasses: {
        title: 'Live Classes - Interactive Programming Sessions',
        description: 'Join live programming classes with expert instructors. Interactive sessions covering web development, machine learning, and software engineering.',
        keywords: 'live coding classes, online programming classes, interactive coding sessions, live web development classes',
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: 'Live Programming Classes',
            description: 'Interactive live programming sessions',
            provider: {
                '@type': 'Organization',
                name: 'CodeTapasya'
            }
        }
    },

    assignments: {
        title: 'Programming Assignments - Practice & Improve',
        description: 'Complete hands-on programming assignments to reinforce your learning. Get instant feedback and improve your coding skills.',
        keywords: 'programming assignments, coding exercises, practice problems, coding challenges',
        noindex: true
    },

    leaderboard: {
        title: 'Leaderboard - Top Programmers & Achievers',
        description: 'See the top performers and achievers in the CodeTapasya community. Track your rank and compete with fellow learners.',
        keywords: 'programming leaderboard, top coders, coding competition, student rankings'
    },

    profile: {
        title: 'Your Profile - CodeTapasya',
        description: 'Manage your CodeTapasya profile, view your achievements, and track your learning journey.',
        keywords: 'user profile, student profile, learning achievements',
        noindex: true
    },

    login: {
        title: 'Login - CodeTapasya',
        description: 'Login to your CodeTapasya account to access courses, assignments, and live classes.',
        keywords: 'login, sign in, student login',
        noindex: true
    },

    signup: {
        title: 'Sign Up - Start Learning Programming Today',
        description: 'Create your free CodeTapasya account and start learning programming. Access courses, live classes, and interactive coding playground.',
        keywords: 'sign up, create account, register, join codetapasya'
    },

    payment: {
        title: 'Payment - Subscribe to CodeTapasya',
        description: 'Choose your subscription plan and unlock full access to all CodeTapasya courses and features.',
        keywords: 'subscription, payment, pricing, course subscription',
        noindex: true
    }
};

/**
 * Generate course-specific SEO data
 */
export const generateCourseSEO = (course) => {
    if (!course) return PAGE_SEO.courses;

    return {
        title: `${course.title} - Learn ${course.category}`,
        description: course.description || `Master ${course.title} with CodeTapasya. ${course.lessons?.length || 0} lessons covering everything from basics to advanced concepts.`,
        keywords: `${course.title}, ${course.category}, programming course, online learning, ${course.title} tutorial`,
        type: 'article',
        section: course.category,
        tags: [course.category, 'programming', 'online course'],
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: course.title,
            description: course.description,
            provider: {
                '@type': 'Organization',
                name: 'CodeTapasya',
                url: 'https://codetapasya.com'
            },
            hasCourseInstance: {
                '@type': 'CourseInstance',
                courseMode: 'online',
                courseWorkload: `PT${course.duration || 40}H`
            },
            offers: {
                '@type': 'Offer',
                category: 'Subscription',
                priceCurrency: 'INR'
            },
            aggregateRating: course.rating ? {
                '@type': 'AggregateRating',
                ratingValue: course.rating,
                ratingCount: course.enrolledCount || 100
            } : undefined
        }
    };
};

/**
 * Generate assignment-specific SEO data
 */
export const generateAssignmentSEO = (assignment) => {
    if (!assignment) return PAGE_SEO.assignments;

    return {
        title: `${assignment.title} - Programming Assignment`,
        description: assignment.description || `Complete this programming assignment to practice your coding skills. Difficulty: ${assignment.difficulty}`,
        keywords: `programming assignment, coding exercise, ${assignment.difficulty} level, practice coding`,
        noindex: true
    };
};

/**
 * Generate live class SEO data
 */
export const generateLiveClassSEO = (liveClass) => {
    if (!liveClass) return PAGE_SEO.liveClasses;

    return {
        title: `${liveClass.title} - Live Programming Class`,
        description: liveClass.description || `Join this live programming session on ${liveClass.topic}. Interactive learning with expert instructors.`,
        keywords: `live class, ${liveClass.topic}, online programming class, interactive session`,
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: liveClass.title,
            description: liveClass.description,
            startDate: liveClass.scheduledAt,
            eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
            eventStatus: 'https://schema.org/EventScheduled',
            organizer: {
                '@type': 'Organization',
                name: 'CodeTapasya'
            }
        }
    };
};

/**
 * Generate breadcrumb structured data
 */
export const generateBreadcrumbs = (items) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `https://codetapasya.com${item.path}`
        }))
    };
};

/**
 * Generate FAQ structured data
 */
export const generateFAQStructuredData = (faqs) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
            }
        }))
    };
};

/**
 * Get SEO data for a specific page
 */
export const getSEOForPage = (pageName, data = null) => {
    // Handle dynamic pages
    if (pageName === 'course' && data) {
        return generateCourseSEO(data);
    }
    if (pageName === 'assignment' && data) {
        return generateAssignmentSEO(data);
    }
    if (pageName === 'liveClass' && data) {
        return generateLiveClassSEO(data);
    }

    // Return static page SEO or default
    return PAGE_SEO[pageName] || {
        title: DEFAULT_SEO.defaultTitle,
        description: DEFAULT_SEO.defaultDescription
    };
};
