import React, { useState, useEffect } from 'react';
import './App.css';
import AdUnit from './components/AdUnit';
import useTypingAnimation from './hooks/useTypingAnimation';

// Add this new component above App
const PostsTable = ({ subreddit, posts }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Upvotes</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>
        {posts.map(post => (
          <tr key={`${post.subreddit}-${post.id}`}>
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
  );
};

function App() {
  // State variables
  const [subredditInput, setSubredditInput] = useState('');
  const [subreddits, setSubreddits] = useState([]);
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const placeholderText = useTypingAnimation([
    'marketing',
    'artificial',
    'worldnews',
    'technology',
    'science'
  ]);
  const [cursorPosition, setCursorPosition] = useState(0);

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

  // Replace the cursor position useEffect with this updated version
  useEffect(() => {
    if (!isInputFocused) {
      // Get the input element first
      const inputElement = document.querySelector('.input-group input');
      
      // Only proceed if the input element exists
      if (inputElement) {
        // Create a temporary span to measure text width
        const span = document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.position = 'absolute';
        span.style.whiteSpace = 'pre';
        span.style.font = window.getComputedStyle(inputElement).font;
        span.textContent = placeholderText;
        document.body.appendChild(span);
        
        // Calculate the width
        const width = span.getBoundingClientRect().width;
        document.body.removeChild(span);
        
        setCursorPosition(width);
      }
    }
  }, [placeholderText, isInputFocused]);

  // Add this effect to clean up cursor position when component unmounts
  useEffect(() => {
    return () => {
      setCursorPosition(0);
    };
  }, []);

  // Add this near the top of your component
  useEffect(() => {
    console.log('Posts state changed:', posts);
  }, [posts]);

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
    setPosts(null); // Reset posts before fetching

    try {
      const fetchPromises = subreddits.map((subreddit) =>
        fetch(`https://www.reddit.com/r/${subreddit}/top/.json?limit=50&t=month`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Error fetching from r/${subreddit}. Check spelling. :)`);
            }
            return response.json();
          })
          .then(data => ({
            subreddit,
            posts: data.data.children.map(child => ({
              id: child.data.id,
              title: child.data.title,
              url: child.data.url,
              ups: child.data.ups,
              subreddit: subreddit,
            }))
          }))
      );

      const results = await Promise.all(fetchPromises);
      // Store the results in a more stable format
      const postsData = {};
      results.forEach(({ subreddit, posts }) => {
        postsData[subreddit] = posts;
      });
      setPosts(postsData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If posts are fetched, display the posts in a table
  if (posts && Object.keys(posts).length > 0) {
    return (
      <div className="App">
        <h1>Top Posts By Subreddit</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <AdUnit />
        {Object.entries(posts).map(([subreddit, subredditPosts]) => (
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
                      const icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="copy-icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
                      btn.innerHTML = `${icon}Copied!`;
                      setTimeout(() => {
                        btn.innerHTML = `${icon}Copy Post Titles to Clipboard`;
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
            <PostsTable subreddit={subreddit} posts={subredditPosts} />
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
        <div className="input-wrapper">
          <input
            type="text"
            value={subredditInput}
            onChange={e => setSubredditInput(e.target.value)}
            placeholder={isInputFocused ? "Enter subreddit name" : placeholderText}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                addSubreddit();
              }
            }}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            disabled={subreddits.length >= 3}
          />
          <div 
            className="cursor" 
            style={{ 
              transform: `translateX(${cursorPosition}px)`,
              display: isInputFocused ? 'none' : 'block'
            }}
          />
        </div>
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
