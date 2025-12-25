import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { githubService } from '../services/github.service';
import { projectService } from '../services/project.service';
import { hasGitHubLinked } from '../utils/github';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import ShowcaseView from '../components/ShowcaseView';
import {
    Github, Star, GitFork, Lock, Globe, Plus, Trash2,
    RefreshCw, FolderGit2, AlertCircle, LayoutGrid, List
} from 'lucide-react';

const ProjectsPage = () => {
    const { user } = useAuth();
    const [githubRepos, setGithubRepos] = useState([]);
    const [trackedProjects, setTrackedProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasGitHub, setHasGitHub] = useState(false);
    const [view, setView] = useState('my-repos'); // 'my-repos' or 'showcase'
    const [error, setError] = useState(null);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        if (user) {
            init();
        }
    }, [user]);

    const init = async () => {
        try {
            setLoading(true);
            setError(null);

            // Check if GitHub is linked
            const linked = await hasGitHubLinked();
            setHasGitHub(linked);

            if (linked) {
                // Load tracked projects (Backend)
                // We do this first so we know which GitHub repos are already tracked
                const tracked = await projectService.getMyProjects();
                setTrackedProjects(tracked || []);

                // Load GitHub repos (GitHub API)
                const repos = await githubService.getRepos();
                setGithubRepos(repos || []);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            setError('Failed to load repositories. Please try refreshing.');
        } finally {
            setLoading(false);
        }
    };

    const handleTrackProject = async (repo) => {
        try {
            setSyncing(true);
            await projectService.trackProject(repo);
            // Refresh tracked projects list
            const updatedTracked = await projectService.getMyProjects();
            setTrackedProjects(updatedTracked);
            setView('showcase'); // Switch to showcase view to show it added
        } catch (error) {
            console.error('Failed to track project:', error);
            alert('Failed to add project to showcase');
        } finally {
            setSyncing(false);
        }
    };

    const handleUntrackProject = async (repoId) => {
        if (!window.confirm('Are you sure you want to remove this project from your showcase?')) return;

        try {
            setSyncing(true);
            await projectService.untrackProject(repoId);
            // Refresh tracked projects list
            const updatedTracked = await projectService.getMyProjects();
            setTrackedProjects(updatedTracked);
        } catch (error) {
            console.error('Failed to untrack project:', error);
            alert('Failed to remove project');
        } finally {
            setSyncing(false);
        }
    };

    const isTracked = (repoId) => {
        return trackedProjects.some(p => p.repoId === repoId.toString());
    };

    if (loading) {
        return (
            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center mb-8">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-64" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skeleton key={i} className="h-64 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!hasGitHub) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Github className="w-8 h-8 text-gray-900 dark:text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connect GitHub</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Link your GitHub account to import your repositories and build your developer showcase.
                    </p>
                    <Button
                        className="w-full"
                        onClick={() => window.location.href = '/settings'} // Redirect to settings to link account
                    >
                        Go to Settings to Connect
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FolderGit2 className="w-8 h-8 text-purple-600" />
                        My Projects
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your repositories and build your public creative portfolio.
                    </p>
                </div>

                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex items-center">
                    <button
                        onClick={() => setView('my-repos')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'my-repos'
                                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        <List className="w-4 h-4" />
                        Repositories
                        <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                            {githubRepos.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setView('showcase')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'showcase'
                                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Showcase
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 py-0.5 px-2 rounded-full text-xs">
                            {trackedProjects.length}
                        </span>
                    </button>
                </div>
            </header>

            {error && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                    <button onClick={init} className="ml-auto hover:underline text-sm">Try Again</button>
                </div>
            )}

            <AnimatePresence mode="wait">
                {view === 'my-repos' ? (
                    <motion.div
                        key="repos"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {githubRepos.map(repo => {
                            const isAdded = isTracked(repo.id);
                            return (
                                <Card key={repo.id} className={`h-full flex flex-col border-gray-200 dark:border-gray-800 ${isAdded ? 'bg-purple-50/50 dark:bg-purple-900/5' : 'bg-white dark:bg-gray-900'}`}>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate pr-2" title={repo.name}>
                                                {repo.private ? <Lock className="w-4 h-4 text-gray-400" /> : <Globe className="w-4 h-4 text-green-500" />}
                                                {repo.name}
                                            </h3>
                                            {isAdded && (
                                                <span className="flex-shrink-0 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full font-medium">
                                                    Tracked
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5em]">
                                            {repo.description || 'No description provided'}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-6">
                                            {repo.language && (
                                                <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                                    {repo.language}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Star className="w-3 h-3" /> {repo.stargazers_count}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <GitFork className="w-3 h-3" /> {repo.forks_count}
                                            </span>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                                            <Button
                                                variant={isAdded ? "danger" : "primary"}
                                                className="w-full"
                                                onClick={() => isAdded ? handleUntrackProject(repo.id) : handleTrackProject(repo)}
                                                disabled={syncing}
                                            >
                                                {syncing ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : isAdded ? (
                                                    <>
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Remove
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add to Showcase
                                                    </>
                                                )}
                                            </Button>
                                            <a
                                                href={repo.html_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <Github className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        key="showcase"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <ShowcaseView
                            projects={trackedProjects}
                            onRefresh={async () => {
                                const updated = await projectService.getMyProjects();
                                setTrackedProjects(updated);
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectsPage;
