import {
    Zap, Calendar, CreditCard, Diamond,
    Crown, Trophy, Users
} from 'lucide-react';

export const PLANS = {
    'one-day': {
        id: 'one-day',
        name: 'One-Day Plan',
        price: 10,
        amount: 1000, // in paise
        duration: '24 hours',
        features: ['24-hour full access', 'All courses and projects', 'Community support', 'Code playground access'],
        popular: false,
        icon: Zap,
        color: 'orange'
    },
    'weekly': {
        id: 'weekly',
        name: 'Weekly Plan',
        price: 49,
        amount: 4900,
        duration: '7 days',
        features: ['7-day full access', 'All courses and projects', 'Community support', 'Weekly progress tracking', 'Assignment submissions'],
        popular: false,
        icon: Calendar,
        color: 'green'
    },
    'monthly': {
        id: 'monthly',
        name: 'Monthly Plan',
        price: 99,
        amount: 9900,
        duration: '30 days',
        features: ['30-day full access', 'All courses and projects', 'Priority support', 'Monthly progress tracking', 'Certificate eligibility'],
        popular: true,
        icon: CreditCard,
        color: 'blue'
    },
    'six-month': {
        id: 'six-month',
        name: '6-Month Plan',
        price: 449,
        amount: 44900,
        duration: '6 months',
        features: ['6-month full access', 'All courses and projects', 'Priority support', 'Exclusive projects', 'Career guidance', 'Interview prep'],
        popular: false,
        icon: Diamond,
        color: 'purple'
    },
    'yearly': {
        id: 'yearly',
        name: 'Yearly Plan',
        price: 799,
        amount: 79900,
        duration: '1 year',
        features: ['1-year full access', 'All courses and projects', 'Priority support', 'Early access to new courses'],
        popular: false,
        icon: Crown,
        color: 'yellow'
    },
    'live-classes': {
        id: 'live-classes',
        name: 'Live Classes - Python & AWS',
        price: 10199,
        amount: 1019900,
        duration: '12 weeks',
        features: ['12-week live program', 'Live mentorship sessions', 'Hands-on projects', 'AWS deployment', 'Certificate of completion', 'Career support'],
        popular: true,
        icon: Trophy,
        color: 'pink'
    },
    'live-classes-group': {
        id: 'live-classes-group',
        name: 'Live Classes - Group (3+ Students)',
        price: 5199,
        amount: 519900,
        duration: '12 weeks',
        features: ['12-week live program', 'Special group rate (₹5,199/student)', 'Live mentorship sessions', 'Hands-on projects', 'Team collaboration', 'AWS deployment', 'Certificate for all', 'Priority support'],
        popular: true,
        groupSize: 'Minimum 3 students',
        discount: '49% off per student',
        requiresVerification: true,
        icon: Users,
        color: 'indigo'
    }
};
