import React, { useState, useEffect } from 'react';
import './App.css';
import AdUnit from './components/AdUnit';

function App() {
  // State variables
  const [subredditInput, setSubredditInput] = useState('');
  const [subreddits, setSubreddits] = useState([]);
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add this useEffect at the top of the component
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2228923604379440';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Function to add a subreddit to the list
  const addSubreddit = () => {
    const trimmed = subredditInput.trim().toLowerCase();
    if (trimmed && !subreddits.includes(trimmed)) {
      if (subreddits.length < 3) {
        setSubreddits([...subreddits, trimmed]);
        setSubredditInput('');
      }
    }
  };

  // Function to remove a subreddit from the list
  const removeSubreddit = (sub) => {
    setSubreddits(subreddits.filter(s => s !== sub));
  };

  // Function to fetch posts from Reddit API for each subreddit
  const searchPosts = async () => {
    if (subreddits.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const fetchPromises = subreddits.map((subreddit) =>
        fetch(`https://www.reddit.com/r/${subreddit}/top/.json?limit=50&t=month`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Error fetching from r/${subreddit}. Check spelling. :)`);
            }
            return response.json();
          })
          .then(data =>
            data.data.children.map(child => ({
              id: child.data.id,
              title: child.data.title,
              url: child.data.url,
              ups: child.data.ups,
              // Optionally track which subreddit this post came from
              subreddit: subreddit,
            }))
          )
      );

      const results = await Promise.all(fetchPromises);
      // Flatten the results (which is an array of arrays)
      const combinedPosts = results.flat();
      setPosts(combinedPosts);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If posts are fetched, display the posts in a table
  if (posts) {
    // Group posts by subreddit
    const groupedPosts = posts.reduce((acc, post) => {
      if (!acc[post.subreddit]) {
        acc[post.subreddit] = [];
      }
      acc[post.subreddit].push(post);
      return acc;
    }, {});

    return (
      <div className="App">
        <h1>Top Posts By Subreddit</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <AdUnit />
        {Object.entries(groupedPosts).map(([subreddit, subredditPosts]) => (
          <div key={subreddit} className="subreddit-section">
            <div className="section-header">
              <h2>r/{subreddit}</h2>
              <button 
                className="copy-btn"
                onClick={() => {
                  const titles = subredditPosts
                    .map(post => post.title)
                    .join(', ');
                  navigator.clipboard.writeText(titles)
                    .then(() => {
                      const btn = document.activeElement;
                      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="copy-icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>Copied!`;
                      setTimeout(() => {
                        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="copy-icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>Copy Post Titles to Clipboard`;
                      }, 2000);
                    })
                    .catch(err => console.error('Failed to copy:', err));
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="copy-icon">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy Post Titles to Clipboard
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Upvotes</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {subredditPosts.map(post => (
                  <tr key={post.id}>
                    <td>{post.title}</td>
                    <td>{post.ups}</td>
                    <td>
                      <a href={post.url} target="_blank" rel="noopener noreferrer">
                        Visit
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        <AdUnit />
      </div>
    );
  }

  // Display the subreddit input form if posts have not been loaded
  return (
    <div className="App">
      <h1>Reddit Top Posts Finder</h1>
      <h2>Find the top posts in the last month from any subreddit</h2>
      <AdUnit />
      <div className="input-group">
        <input
          type="text"
          value={subredditInput}
          onChange={e => setSubredditInput(e.target.value)}
          placeholder="Enter subreddit name"
          onKeyPress={e => {
            if (e.key === 'Enter') {
              addSubreddit();
            }
          }}
          disabled={subreddits.length >= 3}
        />
        <button 
          onClick={addSubreddit} 
          disabled={!subredditInput.trim() || subreddits.length >= 3}
        >
          Add
        </button>
      </div>

      <div className="subreddit-list">
        {subreddits.map(sub => (
          <div className="subreddit-item" key={sub}>
            <span>{sub}</span>
            <button onClick={() => removeSubreddit(sub)}>✕</button>
          </div>
        ))}
      </div>

      {subreddits.length > 0 && (
        <button onClick={searchPosts} disabled={loading} className="search-btn">
          {loading ? 'Loading...' : 'Search'}
        </button>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;
