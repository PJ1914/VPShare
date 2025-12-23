import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hackathonService } from '../services/hackathon.service';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RegistrationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        phone: '',
        college: '',
        year: '',
        skills: [],
        experience: 'Beginner',
        motivation: ''
    });
    const [skillInput, setSkillInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const addSkill = () => {
        if (skillInput && !formData.skills.includes(skillInput)) {
            setFormData({
                ...formData,
                skills: [...formData.skills, skillInput]
            });
            setSkillInput('');
        }
    };

    const removeSkill = (skill) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(s => s !== skill)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            await hackathonService.register(id, formData);

            // Success - redirect to hackathon detail page
            navigate(`/hackathons/${id}`, {
                state: { message: 'Registration successful!' }
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">Register for Hackathon</h1>

                {error && <ErrorMessage message={error} className="mb-6" />}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                            <Input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+91-9876543210"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">College/University *</label>
                            <Input
                                type="text"
                                name="college"
                                value={formData.college}
                                onChange={handleChange}
                                placeholder="XYZ University"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year of Study</label>
                        <select
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Select Year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="Graduate">Graduate</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills *</label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                placeholder="Add a skill (e.g. React, Python)"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                className="flex-1"
                            />
                            <Button type="button" onClick={addSkill} variant="secondary">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {formData.skills.map(skill => (
                                <span key={skill} className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full flex items-center gap-2">
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-purple-900 font-bold">×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience Level *</label>
                        <select
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Why do you want to participate? *</label>
                        <textarea
                            name="motivation"
                            value={formData.motivation}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Tell us about your motivation..."
                            required
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg"
                        isLoading={loading}
                        disabled={loading || formData.skills.length === 0}
                    >
                        {loading ? 'Registering...' : 'Complete Registration'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default RegistrationPage;
