import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { hackathonService } from '../services/hackathon.service';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';

const JudgingDashboard = () => {
    const { id } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [judgingCriteria, setJudgingCriteria] = useState([]);
    const [scores, setScores] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Parallel loading
        Promise.all([loadSubmissions(), loadHackathonDetails()])
            .finally(() => setLoading(false));
    }, [id]);

    const loadSubmissions = async () => {
        try {
            const data = await hackathonService.getSubmissions(id);
            setSubmissions(Array.isArray(data) ? data.filter(s => s.status === 'submitted') : []);
        } catch (err) {
            console.error('Error loading submissions:', err);
        }
    };

    const loadHackathonDetails = async () => {
        try {
            const hackathon = await hackathonService.getHackathonById(id);
            setJudgingCriteria(hackathon.judgingCriteria || []);

            // Initialize scores structure
            const initialScores = {};
            hackathon.judgingCriteria?.forEach(criteria => {
                initialScores[criteria.name] = 0;
            });
            setScores(initialScores);
        } catch (err) {
            console.error('Error loading hackathon:', err);
        }
    };

    const handleScoreChange = (criteriaName, value) => {
        setScores({
            ...scores,
            [criteriaName]: parseFloat(value) || 0
        });
    };

    const handleSubmitScores = async () => {
        if (!selectedSubmission) return;

        try {
            const scoreData = {
                scores: Object.entries(scores).map(([name, score]) => ({
                    criteriaName: name,
                    score: score,
                    maxScore: judgingCriteria.find(c => c.name === name)?.weight || 100
                })),
                feedback: document.getElementById('feedback').value
            };

            await hackathonService.scoreSubmission(id, selectedSubmission.id, scoreData);
            alert('Scores submitted successfully!');
            setSelectedSubmission(null);
            await loadSubmissions(); // Refresh list to show status changes if any specific visual indicators added
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to submit scores');
        }
    };

    if (loading) return <div className="p-8"><LoadingSpinner /></div>

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl h-[calc(100vh-64px)] flex flex-col">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Judging Dashboard</h1>

            <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
                {/* Submissions List Sidebar */}
                <aside className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h2 className="font-semibold text-gray-700 dark:text-gray-200">Submissions ({submissions.length})</h2>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {submissions.map(submission => (
                            <div
                                key={submission.id}
                                className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedSubmission?.id === submission.id
                                    ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
                                    : 'bg-white border-transparent hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'
                                    }`}
                                onClick={() => setSelectedSubmission(submission)}
                            >
                                <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">{submission.projectTitle}</h4>
                                <p className="text-xs text-gray-500 mt-1">{submission.submitterName}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${submission.scores?.length > 0
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {submission.scores?.length > 0 ? '✓ Scored' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Scoring Panel */}
                <main className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                    {selectedSubmission ? (
                        <div className="flex flex-col h-full overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold mb-2">{selectedSubmission.projectTitle}</h2>
                                <p className="text-gray-500 text-lg mb-4">{selectedSubmission.tagline}</p>
                                <p className="text-gray-700 dark:text-gray-300 mb-6">{selectedSubmission.description}</p>

                                <div className="flex flex-wrap gap-4">
                                    {selectedSubmission.demoUrl && (
                                        <a href={selectedSubmission.demoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">
                                            🔗 Demo
                                        </a>
                                    )}
                                    {selectedSubmission.githubUrl && (
                                        <a href={selectedSubmission.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-black flex items-center gap-1 font-medium">
                                            🔗 GitHub
                                        </a>
                                    )}
                                    {selectedSubmission.videoUrl && (
                                        <a href={selectedSubmission.videoUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800 flex items-center gap-1 font-medium">
                                            🔗 Video
                                        </a>
                                    )}
                                </div>

                                {selectedSubmission.techStack && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {selectedSubmission.techStack.map(tech => (
                                            <span key={tech} className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-gray-50 dark:bg-gray-900/30 flex-1">
                                <h3 className="font-bold text-lg mb-4">Score Submission</h3>

                                <div className="space-y-6">
                                    {judgingCriteria.map(criteria => (
                                        <div key={criteria.name} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="font-medium">
                                                    {criteria.name}
                                                    {criteria.description && (
                                                        <span className="block text-xs text-gray-500 font-normal">{criteria.description}</span>
                                                    )}
                                                </label>
                                                <span className="text-sm font-bold text-gray-400">Max: {criteria.weight}</span>
                                            </div>
                                            <Input
                                                type="number"
                                                min="0"
                                                max={criteria.weight}
                                                step="0.1"
                                                value={scores[criteria.name] || 0}
                                                onChange={(e) => handleScoreChange(criteria.name, e.target.value)}
                                                className="font-mono text-lg"
                                            />
                                        </div>
                                    ))}

                                    <div className="flex justify-between items-center p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <span className="font-bold text-purple-900 dark:text-purple-100">Total Score:</span>
                                        <span className="text-2xl font-black text-purple-700 dark:text-purple-300">
                                            {Object.values(scores).reduce((sum, score) => sum + score, 0).toFixed(2)} / 100
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="font-semibold text-sm">Feedback</label>
                                        <textarea
                                            id="feedback"
                                            rows="4"
                                            placeholder="Provide constructive feedback..."
                                            className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <Button onClick={handleSubmitScores} className="w-full h-12 text-lg">
                                        Submit Scores
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-full mb-4">
                                <span className="text-4xl">⚖️</span>
                            </div>
                            <p className="text-lg">Select a submission from the list to start scoring</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default JudgingDashboard;
