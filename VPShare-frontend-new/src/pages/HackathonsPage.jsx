import React, { useState, useEffect } from 'react';
import { hackathonService } from '../services/hackathon.service';
import HackathonCard from '../components/hackathon/HackathonCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/ui/Button';

const HackathonsPage = () => {
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState(''); // '', 'upcoming', 'ongoing', 'completed'

    useEffect(() => {
        loadHackathons();
    }, [filter]);

    const loadHackathons = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await hackathonService.getAllHackathons(filter);
            // Ensure data is array (handle API response structure)
            setHackathons(Array.isArray(data) ? data : (data.items || []));
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to load hackathons');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8"><LoadingSpinner /></div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hackathons</h1>
                    <p className="text-gray-500 mt-1">Join the best coding competitions and showcase your skills.</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    {['', 'upcoming', 'ongoing', 'completed'].map((f) => (
                        <button
                            key={f}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                            onClick={() => setFilter(f)}
                        >
                            {f === '' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </header>

            {error && <ErrorMessage message={error} className="mb-6" />}

            {hackathons.length === 0 && !loading && !error ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No hackathons found</h3>
                    <p className="text-gray-500">Check back later for new events.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hackathons.map(hackathon => (
                        <HackathonCard key={hackathon.id} hackathon={hackathon} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HackathonsPage;
