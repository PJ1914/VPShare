import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hackathonService } from '../services/hackathon.service';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SubmissionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        projectTitle: '',
        tagline: '',
        description: '',
        demoUrl: '',
        githubUrl: '',
        videoUrl: '',
        techStack: []
    });
    const [techInput, setTechInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const addTech = () => {
        if (techInput && !formData.techStack.includes(techInput)) {
            setFormData({
                ...formData,
                techStack: [...formData.techStack, techInput]
            });
            setTechInput('');
        }
    };

    const removeTech = (tech) => {
        setFormData({
            ...formData,
            techStack: formData.techStack.filter(t => t !== tech)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            await hackathonService.createSubmission(id, formData);

            // Success - redirect to hackathon detail page
            navigate(`/hackathons/${id}`, {
                state: { message: 'Project submitted successfully!' }
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 text-center">Submit Your Project</h1>
                <p className="text-center text-gray-500 mb-8">Showcase your hard work to the judges and the world.</p>

                {error && <ErrorMessage message={error} className="mb-6" />}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <Input
                            label="Project Title *"
                            name="projectTitle"
                            value={formData.projectTitle}
                            onChange={handleChange}
                            placeholder="e.g. EcoTracker"
                            required
                        />

                        <Input
                            label="Tagline *"
                            name="tagline"
                            value={formData.tagline}
                            onChange={handleChange}
                            placeholder="Short and catchy description"
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Detailed description of your project, the problem it solves, and how you built it..."
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Demo URL"
                                name="demoUrl"
                                value={formData.demoUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                type="url"
                            />
                            <Input
                                label="GitHub URL"
                                name="githubUrl"
                                value={formData.githubUrl}
                                onChange={handleChange}
                                placeholder="https://github.com/..."
                                type="url"
                            />
                        </div>

                        <Input
                            label="Video Demo URL"
                            name="videoUrl"
                            value={formData.videoUrl}
                            onChange={handleChange}
                            placeholder="https://youtube.com/..."
                            type="url"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tech Stack *</label>
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={techInput}
                                    onChange={(e) => setTechInput(e.target.value)}
                                    placeholder="Add technology (e.g. React, Node.js)"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                                    className="flex-1"
                                />
                                <Button type="button" onClick={addTech} variant="secondary">Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {formData.techStack.map(tech => (
                                    <span key={tech} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-2">
                                        {tech}
                                        <button type="button" onClick={() => removeTech(tech)} className="hover:text-blue-900 font-bold">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <Button
                            type="submit"
                            className="w-full h-12 text-lg"
                            isLoading={loading}
                            disabled={loading || !formData.projectTitle || !formData.description}
                        >
                            {loading ? 'Submitting...' : 'Submit Project'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmissionPage;
