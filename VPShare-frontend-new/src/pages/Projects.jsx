import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FolderGit2, Star, GitBranch, Code, ExternalLink,
    Search, Filter, ChevronRight, X, Layers, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

const Projects = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState('all'); // all, beginner, intermediate, advanced
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);

    // Mock data for fallback
    const MOCK_PROJECTS = [
        {
            id: '1',
            title: 'E-Commerce Dashboard',
            difficulty: 'Intermediate',
            techStack: ['React', 'Tailwind', 'Chart.js'],
            description: 'Build a comprehensive admin dashboard for an online store. Features include sales visualization, order management, and inventory tracking.',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
            stars: 124,
            forks: 45
        },
        {
            id: '2',
            title: 'Real-time Chat Application',
            difficulty: 'Advanced',
            techStack: ['Node.js', 'Socket.io', 'MongoDB'],
            description: 'Create a real-time messaging platform with private chats, group rooms, and file sharing capabilities.',
            image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
            stars: 89,
            forks: 32
        },
        {
            id: '3',
            title: 'Weather Forecast App',
            difficulty: 'Beginner',
            techStack: ['JavaScript', 'OpenWeather API'],
            description: 'A simple yet elegant weather application that fetches real-time data based on user location or search.',
            image: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800&q=80',
            stars: 256,
            forks: 89
        },
        {
            id: '4',
            title: 'Task Management System',
            difficulty: 'Intermediate',
            techStack: ['Vue.js', 'Firebase'],
            description: 'A Kanban-style task manager with drag-and-drop functionality and team collaboration features.',
            image: 'https://images.unsplash.com/photo-1540350394557-8d14678e7f91?w=800&q=80',
            stars: 167,
            forks: 54
        }
    ];

    useEffect(() => {
        // Simulate fetch
        setTimeout(() => {
            setProjects(MOCK_PROJECTS);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.techStack.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filter === 'all' || project.difficulty.toLowerCase() === filter;
        return matchesSearch && matchesFilter;
    });

    const getDifficultyColor = (difficulty) => {
        switch (difficulty.toLowerCase()) {
            case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Skeleton key={i} className="h-80 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FolderGit2 className="w-8 h-8 text-purple-600" />
                            Projects
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Build real-world applications to boost your portfolio
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none w-full sm:w-64"
                            />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            <option value="all">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredProjects.map((project) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                layout
                            >
                                <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 group bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold backdrop-blur-md ${getDifficultyColor(project.difficulty)}`}>
                                                {project.difficulty}
                                            </span>
                                            <div className="flex gap-2">
                                                <span className="flex items-center text-white text-xs bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                                                    <Star className="w-3 h-3 text-yellow-400 mr-1" /> {project.stars}
                                                </span>
                                                <span className="flex items-center text-white text-xs bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                                                    <GitBranch className="w-3 h-3 text-blue-400 mr-1" /> {project.forks}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                            {project.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                                            {project.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {project.techStack.map((tech, i) => (
                                                <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-md font-medium">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>

                                        <Button
                                            className="w-full group-hover:translate-y-[-2px] transition-transform"
                                            onClick={() => setSelectedProject(project)}
                                        >
                                            View Project
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Project Details Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="relative h-48 sm:h-64 flex-shrink-0">
                                <img
                                    src={selectedProject.image}
                                    alt={selectedProject.title}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-md"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white">{selectedProject.title}</h2>
                                    <div className="flex items-center gap-4 mt-2 text-gray-200 text-sm">
                                        <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> {selectedProject.difficulty}</span>
                                        <span className="flex items-center gap-1"><Code className="w-4 h-4" /> {selectedProject.techStack.join(', ')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8 overflow-y-auto">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">About this Project</h3>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {selectedProject.description}
                                            <br /><br />
                                            This project is designed to test your skills in {selectedProject.techStack.join(', ')}.
                                            You will learn how to structure a large application, manage state effectively, and deploy to production.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Key Features</h3>
                                        <ul className="grid sm:grid-cols-2 gap-3">
                                            {['Responsive Design', 'Authentication', 'Database Integration', 'API Handling', 'State Management', 'Testing'].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                                    <Zap className="w-4 h-4 text-yellow-500" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <Button className="flex-1">
                                            Start Project
                                            <Code className="w-4 h-4 ml-2" />
                                        </Button>
                                        <Button variant="outline" className="flex-1">
                                            View Demo
                                            <ExternalLink className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Projects;
