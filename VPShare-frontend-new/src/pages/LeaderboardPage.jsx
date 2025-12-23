import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { hackathonService } from '../services/hackathon.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/ui/Button';

const LeaderboardPage = () => {
    const { id } = useParams();
    const [leaderboard, setLeaderboard] = useState([]);
    const [winners, setWinners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
        loadWinners();
    }, [id]);

    const loadLeaderboard = async () => {
        try {
            const data = await hackathonService.getLeaderboard(id);
            setLeaderboard(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadWinners = async () => {
        try {
            const data = await hackathonService.getWinners(id);
            setWinners(Array.isArray(data) ? data : []);
        } catch (err) {
            // Winners might not be announced yet
            console.log('Winners not announced yet');
        }
    };

    if (loading) return <div className="p-8"><LoadingSpinner /></div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Leaderboard</h1>

            {/* Winners Section */}
            {winners.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-center text-yellow-600 dark:text-yellow-400">🏆 Winners</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        {winners.map((winner, idx) => {
                            // Podium styling: order 2 (1st) in middle, 1 (2nd) left, 3 (3rd) right
                            let orderClass = 'order-last';
                            let heightClass = 'h-64';
                            if (idx === 0) { orderClass = 'order-2 md:-mt-8'; heightClass = 'h-80 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'; }
                            else if (idx === 1) { orderClass = 'order-1'; heightClass = 'h-72 border-gray-300 bg-gray-50 dark:bg-gray-800'; }
                            else { orderClass = 'order-3'; heightClass = 'h-64 border-orange-300 bg-orange-50 dark:bg-orange-900/20'; }

                            return (
                                <div key={winner.submissionId} className={`flex flex-col p-6 rounded-t-xl border-t-8 shadow-lg ${heightClass} ${orderClass}`}>
                                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                                        <div className="text-4xl font-black opacity-20 mb-2">#{idx + 1}</div>
                                        <h3 className="text-xl font-bold line-clamp-2 mb-1">{winner.projectTitle}</h3>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{winner.teamName || winner.userName}</p>
                                        <div className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                                            {winner.averageScore?.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Full Leaderboard */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold">All Submissions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-3 font-medium">Rank</th>
                                <th className="px-6 py-3 font-medium">Project</th>
                                <th className="px-6 py-3 font-medium">Team/Participant</th>
                                <th className="px-6 py-3 font-medium">Score</th>
                                <th className="px-6 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {leaderboard.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No submissions yet or scores pending.</td>
                                </tr>
                            ) : (
                                leaderboard.map((submission, idx) => (
                                    <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-400">#{idx + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs">
                                                <h4 className="font-semibold text-gray-900 dark:text-white">{submission.projectTitle}</h4>
                                                {submission.tagline && <p className="text-xs text-gray-500 truncate">{submission.tagline}</p>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{submission.teamName || submission.submitterName}</td>
                                        <td className="px-6 py-4 font-mono font-medium">
                                            {submission.averageScore
                                                ? submission.averageScore.toFixed(2)
                                                : 'Not scored'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.open(submission.demoUrl, '_blank')}
                                                disabled={!submission.demoUrl}
                                            >
                                                View Demo
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default LeaderboardPage;
