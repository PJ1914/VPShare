import React, { useState, useEffect } from 'react';
import { githubService } from '../services/github.service';
import { projectService } from '../services/project.service';
import { hasGitHubLinked } from '../utils/github';
import { FolderGit2, Star, GitBranch, Search, ExternalLink, Github, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFriendlyErrorMessage } from '../lib/auth-helpers';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card'; // Assuming Card is exported from standard ui folder
import ShowcaseView from '../components/ShowcaseView';

const Projects = () => {
    const { linkGithub } = useAuth();
    const [githubRepos, setGithubRepos] = useState([]);
    const [trackedProjects, setTrackedProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasGitHub, setHasGitHub] = useState(false);
    const [view, setView] = useState('my-repos'); // 'my-repos' or 'showcase'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        setLoading(true);
        try {
            // Check if GitHub is linked
            const linked = await hasGitHubLinked();
            setHasGitHub(linked);

            if (linked) {
                try {
                    // Load GitHub repos
                    const repos = await githubService.getRepos();
                    setGithubRepos(repos);
                } catch (e) {
                    console.error("Failed to load repos:", e);
                    if (e.message.includes("GitHub not linked")) {
                        setHasGitHub(false); // Force re-link UI
                    }
                }

                // Load tracked projects
                const tracked = await projectService.getMyProjects();
                setTrackedProjects(tracked);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTrackProject = async (repo) => {
        try {
            await projectService.trackProject(repo);
            // alert('Project added to showcase!');
            await init(); // Refresh
        } catch (error) {
            console.error(error);
            alert('Failed to track project');
        }
    };

    const handleUntrackProject = async (repoId) => {
        try {
            await projectService.untrackProject(repoId);
            await init();
        } catch (error) {
            console.error(error);
            alert('Failed to untrack project');
        }
    };

    const isTracked = (repoId) => {
        return trackedProjects.some(p => p.repoId === repoId.toString());
    };

    const filteredRepos = githubRepos.filter(repo =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!hasGitHub) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl text-center border border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Github className="w-8 h-8 text-gray-900 dark:text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Link Your GitHub Account</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Connect GitHub to manage your projects, track progress, and showcase your work to the world.
                    </p>
                    <Button
                        onClick={async () => {
                            try {
                                await linkGithub();
                                await init();
                            } catch (e) {
                                const msg = getFriendlyErrorMessage(e);
                                if (msg) alert(msg);
                            }
                        }}
                        className="w-full"
                    >
                        Link GitHub Account
                    </Button>
                </div>
            </div >
        );
    }

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <FolderGit2 className="w-8 h-8 text-purple-600" />
                            My Projects
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage your repositories and showcase your best work
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'my-repos'
                                ? 'bg-white dark:bg-gray-900 text-purple-600 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            onClick={() => setView('my-repos')}
                        >
                            My Repositories
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'showcase'
                                ? 'bg-white dark:bg-gray-900 text-purple-600 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            onClick={() => setView('showcase')}
                        >
                            Showcase
                        </button>
                    </div>
                </header>

                {view === 'my-repos' && (
                    <div className="space-y-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search repositories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRepos.map(repo => (
                                <div key={repo.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-2" title={repo.name}>
                                            {repo.name}
                                        </h3>
                                        {repo.language && (
                                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full whitespace-nowrap">
                                                {repo.language}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-1 line-clamp-3">
                                        {repo.description || 'No description available'}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                        <span className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500" /> {repo.stargazers_count}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <GitBranch className="w-4 h-4 text-blue-500" /> {repo.forks_count}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                                            {repo.private ? 'Private' : 'Public'}
                                        </span>
                                    </div>

                                    <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <a
                                            href={repo.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1"
                                        >
                                            <Button variant="outline" className="w-full text-xs">
                                                <ExternalLink className="w-3 h-3 mr-2" />
                                                GitHub
                                            </Button>
                                        </a>

                                        {isTracked(repo.id) ? (
                                            <Button
                                                onClick={() => handleUntrackProject(repo.id.toString())}
                                                variant="secondary"
                                                className="flex-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 border-red-200 dark:border-red-900"
                                            >
                                                Remove
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => handleTrackProject(repo)}
                                                className="flex-1 text-xs"
                                            >
                                                Add to Showcase
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {view === 'showcase' && (
                    <ShowcaseView projects={trackedProjects} />
                )}
            </div>
        </div>
    );
};

export default Projects;
