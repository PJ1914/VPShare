import React, { useState } from 'react';
import { projectService } from '../services/project.service';
import { Star, Eye, Heart, Edit2, Save, X, ExternalLink, Globe, Lock } from 'lucide-react';
import Button from './ui/Button';

const ShowcaseView = ({ projects }) => {
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({});

    const handleEdit = (project) => {
        setEditingProject(project.repoId);
        setFormData({
            description: project.description || '',
            tags: project.tags ? project.tags.join(', ') : '',
            demoUrl: project.demoUrl || '',
            thumbnail: project.thumbnail || '',
            isFeatured: project.isFeatured,
            isPublic: project.isPublic
        });
    };

    const handleSave = async (repoId) => {
        try {
            await projectService.updateProject(repoId, {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            });
            setEditingProject(null);
            alert('Project updated!');
            // Ideally we should trigger a refresh here or update local state
        } catch (error) {
            console.error(error);
            alert('Failed to update project');
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
                <div key={project.repoId} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all duration-300">
                    {editingProject === project.repoId ? (
                        <div className="p-6 flex flex-col gap-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Editing: {project.repoName}</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                    rows="3"
                                    placeholder="Description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="React, Node.js, ..."
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Demo URL</label>
                                <input
                                    type="url"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="https://..."
                                    value={formData.demoUrl}
                                    onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                                />
                            </div>

                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    checked={formData.isPublic}
                                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                />
                                Make Public (visible to everyone)
                            </label>

                            <div className="flex gap-2 mt-2">
                                <Button size="sm" onClick={() => handleSave(project.repoId)}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingProject(null)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate" title={project.repoName}>
                                        {project.repoName}
                                    </h3>
                                    {project.isPublic ?
                                        <Globe className="w-4 h-4 text-green-500" title="Public" /> :
                                        <Lock className="w-4 h-4 text-gray-400" title="Private" />
                                    }
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                                    {project.description || 'No description'}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.tags && project.tags.map((tag, i) => (
                                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-md font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500" /> {project.stars}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" /> {project.views}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Heart className="w-4 h-4 text-red-500" /> {project.likes}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handleEdit(project)}
                                    className="text-gray-400 hover:text-purple-600 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ShowcaseView;
