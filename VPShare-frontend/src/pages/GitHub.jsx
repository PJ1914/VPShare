import React, { useState } from 'react';
import '../styles/GitHub.css';

function GitHub() {
  const [isConnected, setIsConnected] = useState(false);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('');

  // Placeholder: Replace with your backend OAuth endpoint
  const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize?client_id=YOUR_CLIENT_ID&scope=repo';

  const handleConnect = () => {
    // Redirect to GitHub OAuth (replace with your backend logic)
    window.location.href = GITHUB_AUTH_URL;
  };

  // Placeholder: Simulate fetching repos after OAuth
  const fetchRepos = async () => {
    setLoading(true);
    setError('');
    try {
      // Replace with real API call to your backend
      // Simulated repos
      setTimeout(() => {
        setRepos([
          { name: 'my-first-repo', url: 'https://github.com/user/my-first-repo' },
          { name: 'awesome-project', url: 'https://github.com/user/awesome-project' },
        ]);
        setIsConnected(true);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to fetch repositories.');
      setLoading(false);
    }
  };

  const handlePush = () => {
    if (!selectedRepo) return;
    // Placeholder: Implement push logic via backend
    alert(`Code pushed to ${selectedRepo}! (Simulated)`);
  };

  return (
    <div className="github-page">
      <h1>GitHub Integration</h1>
      <p>Connect your GitHub account to showcase your repositories and contributions.</p>
      {!isConnected ? (
        <button className="github-connect-btn" onClick={fetchRepos}>
          Connect with GitHub
        </button>
      ) : (
        <div className="github-repos-section">
          <h2>Your Repositories</h2>
          {loading ? (
            <p>Loading repositories...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <ul className="github-repo-list">
              {repos.map((repo) => (
                <li key={repo.name}>
                  <label>
                    <input
                      type="radio"
                      name="repo"
                      value={repo.name}
                      checked={selectedRepo === repo.name}
                      onChange={() => setSelectedRepo(repo.name)}
                    />
                    <a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.name}</a>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <button
            className="github-push-btn"
            onClick={handlePush}
            disabled={!selectedRepo}
          >
            Push Code to Selected Repo
          </button>
        </div>
      )}
    </div>
  );
}

export default GitHub;