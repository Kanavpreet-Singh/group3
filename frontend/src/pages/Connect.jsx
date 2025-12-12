import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Connect = () => {
  const { currentUser } = useContext(AuthContext);
  const [issueDescription, setIssueDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in first');
      setLoading(false);
      return;
    }

    if (issueDescription.trim().length < 20) {
      setError('Please provide a detailed description (at least 20 characters)');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/connect/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ issueDescription })
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'Failed to process your request');
      }
    } catch (err) {
      setError('Error connecting. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCategory = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow mb-4">Connect with Peers</h1>
          <p className="text-gray text-lg">Share your struggles and find others facing similar challenges</p>
        </div>

        <div className="bg-blue p-8 rounded-lg shadow-lg mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-yellow font-semibold mb-3 text-lg">
                Describe what you're going through *
              </label>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Tell us about your problems in life... (e.g., 'I'm stressed about my upcoming exams and feel overwhelmed with coursework. I can't focus and keep procrastinating.')"
                rows={8}
                required
                minLength={20}
                className="w-full p-4 rounded-lg bg-black text-white border-2 border-yellow focus:outline-none focus:border-yellow-bright resize-none"
              />
              <small className="text-gray">{issueDescription.length} characters (minimum 20)</small>
            </div>

            {error && (
              <div className="bg-red-900 border border-red-500 text-white px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow text-black font-bold py-4 px-6 rounded-lg hover:bg-yellow-bright transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Submit & Find Connections'}
            </button>
          </form>
        </div>

        {result && (
          <div className="bg-blue p-8 rounded-lg shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-yellow mb-2">Your Category</h2>
              <p className="text-xl text-white">{formatCategory(result.category)}</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-yellow mb-4">
                {result.matches.length > 0 ? `Found ${result.matches.length} Peer(s)` : 'No Peers Found Yet'}
              </h2>

              {result.matches.length > 0 ? (
                <div className="space-y-4">
                  {result.matches.map((match, index) => (
                    <div key={index} className="bg-black p-6 rounded-lg border-2 border-yellow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow text-black flex items-center justify-center font-bold text-xl">
                          {match.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">{match.name}</h3>
                          <a 
                            href={`mailto:${match.email}`} 
                            className="text-yellow hover:text-yellow-bright transition"
                          >
                            {match.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray text-center py-8">
                  You're the first in this category. Others will join soon!
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue p-6 rounded-lg">
          <h3 className="text-xl font-bold text-yellow mb-4">How it Works</h3>
          <ol className="space-y-3 text-gray">
            <li><span className="text-yellow font-bold">1.</span> Describe your life problems in detail</li>
            <li><span className="text-yellow font-bold">2.</span> AI classifies your issue into a stress category</li>
            <li><span className="text-yellow font-bold">3.</span> Get matched with top 5 people facing similar issues</li>
            <li><span className="text-yellow font-bold">4.</span> Connect via email for peer support</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Connect;
