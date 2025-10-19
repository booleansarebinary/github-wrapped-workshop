import React, { useState } from 'react';
import axios from 'axios';
import './GitHubWrapped.css';

const GitHubWrapped = () => {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchGitHubData = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setError('');

    try {
      const headers = {};
      if (token.trim()) {
        headers.Authorization = `token ${token}`;
        setIsAuthenticated(true);
      }

      // TODO: Fetch user data using axios and setUserData
      const userResponse = await axios.get(
        `https://api.github.com/users/${username}`,
        {headers}
      );
      setUserData(userResponse.data);
      
      // TODO: Fetch repos data and setRepos accordingly
      const reposResponse = await axios.get(
        `https://api.github.com/users/${username}/repos?per_page=100`,
        { headers }
      );
      setRepos(reposResponse.data);

      // TODO: Set showResults(true) and currentSlide(0) when done
      setShowResults(true);
      setCurrentSlide(0);

    } catch (err) {
      // ✅ Keep error handling
      if (err.response?.status === 401) {
        setError('Invalid token. Please check your GitHub Personal Access Token.');
      } else if (err.response?.status === 404) {
        setError('User not found. Please check the username and try again.');
      } else if (err.response?.status === 403) {
        setError('Rate limit exceeded. Please try again later.');
      } else {
        setError('An error occurred while fetching data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTopLanguages = () => {
    // TODO: Iterate through repos and count occurrences of each language
    const languageCount = {};

    repos.forEach((repo) => {
      const lang = repo.language;
      if(lang){
        languageCount[lang] = (languageCount[lang] || 0) + 1;
      }
      }); 
    // Return an array of top 5 languages sorted by frequency
    const sortedLanguages = Object.entries(languageCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

    return sortedLanguages.map(([language, count]) => ({ language, count }));
  };

  const getTopRepos = () => {
    // TODO: Sort repos by most recently updated and stars as a tiebreaker
    if(!repos || repos.length === 0) return [];

    const sorted = [...repos].sort((a, b) => {
      const dateA = new Date(a.pushed_at);
      const dateB = new Date(b.pushed_at);

      if(dateB > dateA) return 1;
      if(dateB < dateA) return -1;

      return b.stargazers_count - a.stargazers_count
    });
    // Return top 3 repos
    return sorted.slice(0, 3);
  };

const getMostRecentRepo = () => {
  if (!repos || repos.length === 0) return null;

  return repos.reduce((latest, current) => {
    const latestDate = new Date(latest.pushed_at);
    const currentDate = new Date(current.pushed_at);

    return currentDate > latestDate ? current : latest;
  });
};

  const nextSlide = () => {
    if (currentSlide < 4) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const resetWrapped = () => {
    setShowResults(false);
    setCurrentSlide(0);
    setUserData(null);
    setRepos([]);
    setUsername('');
    setToken('');
    setIsAuthenticated(false);
  };

  if (!showResults) {
    return (
      <div className="github-wrapped">
        <div className="welcome-screen">
          <h1>🎵 GitHub Wrapped 2025 🎵</h1>
          <p>Discover your GitHub year in review</p>

          <div className="input-section">
            {/* TODO: Add input fields for GitHub username and optional token */}
            <input
              type="text"
              placeholder="GitHub Username"
              value={username}
              onChange = {(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="GitHub Token (optional)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <button onClick={fetchGitHubData} disabled={loading}>
            {loading ? 'Loading...' : 'Generate Wrapped'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  const slides = [
    // TODO: Implement slide to display user info (avatar, name, etc.)
    userData ? (
  <div key="user-info" className="slide user-info">
    <img src={userData.avatar_url} alt={`${userData.login} avatar`} className="avatar" />
    <h2>{userData.name || userData.login}</h2>
    <p>{userData.bio}</p>
    <p>Followers: {userData.followers} | Following: {userData.following}</p>
    <a href={userData.html_url} target="_blank" rel="noopener noreferrer">View Profile</a>
  </div>
) : null,
    // TODO: Implement slide to show overall stats
    <div key="overall-stats" className="slide overall-stats">
    <h2>Overall Stats</h2>
    <p>Total Repositories: {repos.length}</p>
    {/* Add other stats like total stars, forks, etc. if you want */}
  </div>,
    // TODO: Implement slide for top languages
    <div key="top-languages" className="slide top-languages">
    <h2>Top Languages</h2>
    <ul>
      {getTopLanguages().map(({ language, count }) => (
        <li key={language}>{language}: {count} repos</li>
      ))}
    </ul>
  </div>,
    // TODO: Implement slide for top repos
      <div key="top-repos" className="slide top-repos">
    <h2>Top Repositories</h2>
    <ul>
      {getTopRepos().map((repo) => (
        <li key={repo.id}>
          <a href={repo.html_url} target="_blank" rel="noopener noreferrer">{repo.name}</a> — ⭐ {repo.stargazers_count}
          <br />
          Last updated: {new Date(repo.pushed_at).toLocaleDateString()}
        </li>
      ))}
    </ul>
  </div>,
    // TODO: Implement final summary slide
      <div key="final-summary" className="slide final-summary">
    <h2>Thanks for checking out your GitHub Wrapped!</h2>
    <p>Feel free to refresh or reset to try again.</p>
    <button onClick={resetWrapped}>Reset</button>
  </div>
  ];

  return (
    <div className="github-wrapped">
      <div className="wrapped-container">
        {slides[currentSlide]}
        
        <div className="navigation">
          {currentSlide > 0 && (
            <button onClick={prevSlide} className="nav-btn prev-btn">
              ← Previous
            </button>
          )}
          
          <div className="slide-indicators">
            {slides.map((_, index) => (
              <span 
                key={index} 
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
          
          {currentSlide < slides.length - 1 && (
            <button onClick={nextSlide} className="nav-btn next-btn">
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitHubWrapped;
