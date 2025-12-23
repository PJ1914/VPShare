import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hackathonService } from '../services/hackathon.service';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Calendar, Users, Award, Clock } from 'lucide-react';

const HackathonDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // AuthContext uses 'user' not 'isAuthenticated' directly (user object implies auth)
    const isAuthenticated = !!user;

    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadHackathon();
    }, [id, user]);

    const loadHackathon = async () => {
        try {
            setLoading(true);
            const data = await hackathonService.getHackathonById(id);
            setHackathon(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load hackathon');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = () => {
        if (!isAuthenticated) {
            // Basic login redirect. You might want to pass 'state' for redirect back.
            navigate('/login', { state: { from: `/hackathons/${id}` } });
            return;
        }
        navigate(`/hackathons/${id}/register`);
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size={48} /></div>;
    if (error) return <div className="p-8"><ErrorMessage message={error} /></div>;
    if (!hackathon) return <div className="p-8 text-center">Hackathon not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Hero Section */}
            <div className="relative h-[400px] w-full overflow-hidden">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${hackathon.bannerImage || hackathon.coverImage || 'https://images.unsplash.com/photo-1504384308090-c54be3852f33?auto=format&fit=crop&q=80'})` }}
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center text-white max-w-7xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">{hackathon.title}</h1>
                    <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl">{hackathon.tagline}</p>

                    <div className="flex flex-wrap gap-6 text-sm md:text-base mb-8 font-medium">
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                            <Calendar size={18} />
                            <span>{new Date(hackathon.hackathonStartDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                            <Users size={18} />
                            <span>{hackathon.totalRegistrations || 0} Registered</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                            <Award size={18} />
                            <span>{hackathon.participantType === 'team' ? 'Team Event' : 'Individual'}</span>
                        </div>
                    </div>

                    <div className="mt-auto md:mt-0">
                        {hackathon.registrationStatus === 'open' && !hackathon.isRegistered && (
                            <Button
                                size="lg"
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all"
                                onClick={handleRegister}
                            >
                                Register Now
                            </Button>
                        )}
                        {hackathon.isRegistered && (
                            <div className="flex items-center gap-4">
                                <div className="bg-green-500/20 text-green-300 border border-green-500/50 px-6 py-2 rounded-full font-bold backdrop-blur-md">
                                    ✅ You're Registered
                                </div>
                                {hackathon.userTeamId && (
                                    <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black" onClick={() => navigate(`/hackathons/${id}/team`)}>
                                        View Team
                                    </Button>
                                )}
                                <Button variant="secondary" onClick={() => navigate(`/hackathons/${id}/submissions/create`)}>
                                    Submit Project
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 relative z-10 max-w-7xl">
                <Card className="shadow-xl bg-white dark:bg-gray-800 border-none">
                    {/* Navigation Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                        {['overview', 'prizes', 'timeline', 'submissions', 'leaderboard'].map(tab => (
                            <button
                                key={tab}
                                className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab
                                        ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                {tab === 'submissions' && ` (${hackathon.totalSubmissions || 0})`}
                            </button>
                        ))}
                    </div>

                    <CardContent className="p-6 md:p-8 min-h-[400px]">
                        {activeTab === 'overview' && (
                            <div className="prose dark:prose-invert max-w-none">
                                <section className="mb-8">
                                    <h2 className="text-2xl font-bold mb-4">About</h2>
                                    <ReactMarkdown>{hackathon.description}</ReactMarkdown>
                                </section>

                                {hackathon.themes && hackathon.themes.length > 0 && (
                                    <section className="mb-8">
                                        <h2 className="text-2xl font-bold mb-4">Themes</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {hackathon.themes.map((theme, idx) => (
                                                <span key={idx} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                                                    {theme}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {hackathon.judgingCriteria && (
                                    <section className="mb-8">
                                        <h2 className="text-2xl font-bold mb-4">Judging Criteria</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {hackathon.judgingCriteria.map((criteria, idx) => (
                                                <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="font-bold text-lg">{criteria.name}</h4>
                                                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold">{criteria.weight}%</span>
                                                    </div>
                                                    {criteria.description && <p className="text-sm text-gray-500 dark:text-gray-400">{criteria.description}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {hackathon.rules && (
                                    <section>
                                        <h2 className="text-2xl font-bold mb-4">Rules</h2>
                                        <ReactMarkdown>{hackathon.rules}</ReactMarkdown>
                                    </section>
                                )}
                            </div>
                        )}

                        {activeTab === 'prizes' && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold mb-6">Prizes</h2>
                                {hackathon.prizes && hackathon.prizes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {hackathon.prizes.map((prize, idx) => (
                                            <div key={idx} className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-700 p-6 rounded-xl text-center shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                                                <div className="text-4xl font-bold text-yellow-500 mb-2">#{prize.rank}</div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{prize.title}</h3>
                                                {prize.amount && (
                                                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                                                        {prize.currency} {prize.amount.toLocaleString()}
                                                    </div>
                                                )}
                                                {prize.perks && prize.perks.length > 0 && (
                                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                        {prize.perks.map((perk, i) => (
                                                            <li key={i}>{perk}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Prize details coming soon...</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Important Dates</h2>
                                <div className="space-y-4 max-w-2xl">
                                    {[
                                        { label: 'Registration Opens', date: hackathon.registrationStartDate },
                                        { label: 'Registration Closes', date: hackathon.registrationEndDate },
                                        { label: 'Hackathon Starts', date: hackathon.hackathonStartDate },
                                        { label: 'Submission Deadline', date: hackathon.submissionDeadline },
                                        { label: 'Results Announced', date: hackathon.resultAnnouncementDate },
                                    ].filter(item => item.date).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                                            <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full text-purple-600 dark:text-purple-300">
                                                <Clock size={20} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{item.label}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Placeholders for Submissions and Leaderboard - Logic would go here */}
                        {activeTab === 'submissions' && (
                            <div className="text-center py-12">
                                <Button onClick={() => navigate(`/hackathons/${id}/leaderboard`)}>View Submissions Gallery</Button>
                            </div>
                        )}

                        {activeTab === 'leaderboard' && (
                            <div className="text-center py-12">
                                <Button onClick={() => navigate(`/hackathons/${id}/leaderboard`)}>Go to Leaderboard</Button>
                            </div>
                        )}

                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HackathonDetailPage;
