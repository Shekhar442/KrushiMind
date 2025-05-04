import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const STORIES_KEY = 'farmer_stories';
const MAX_STORIES = 5;

const CommunityPage = () => {
  const [stories, setStories] = useState([]);
  const [newStory, setNewStory] = useState({
    title: '',
    content: '',
    author: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = () => {
    try {
      const storedStories = localStorage.getItem(STORIES_KEY);
      if (storedStories) {
        setStories(JSON.parse(storedStories));
      } else {
        // Initialize with default stories if none exist
        const defaultStories = [
          {
            id: 1,
            title: "My First Organic Farming Experience",
            content: "Starting organic farming was challenging but rewarding. The transition from conventional to organic methods required patience and learning...",
            author: "Rajesh Kumar",
            date: "2024-03-15"
          },
          {
            id: 2,
            title: "Sustainable Water Management",
            content: "Implementing drip irrigation changed everything. We reduced water usage by 40% while increasing crop yield...",
            author: "Priya Sharma",
            date: "2024-03-10"
          }
        ];
        setStories(defaultStories);
        localStorage.setItem(STORIES_KEY, JSON.stringify(defaultStories));
      }
    } catch (error) {
      setError('Failed to load stories from storage');
      console.error('Error loading stories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const newStoryData = {
        id: Date.now(), // Use timestamp as unique ID
        title: newStory.title,
        content: newStory.content,
        author: newStory.author,
        date: new Date().toISOString().split('T')[0]
      };

      // Get current stories and add new one
      const currentStories = JSON.parse(localStorage.getItem(STORIES_KEY) || '[]');
      const updatedStories = [newStoryData, ...currentStories].slice(0, MAX_STORIES);
      
      // Save to localStorage
      localStorage.setItem(STORIES_KEY, JSON.stringify(updatedStories));
      
      // Update state
      setStories(updatedStories);
      setNewStory({ title: '', content: '', author: '' });
    } catch (error) {
      setError('Failed to save story. Please try again.');
      console.error('Error saving story:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Farming Community</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Connect with other farmers and share your experiences
          </p>
        </div>

        {/* Story Submission Form */}
        <div className="mt-12">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Share Your Story</h2>
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="title"
                  value={newStory.title}
                  onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">Your Name</label>
                <input
                  type="text"
                  id="author"
                  value={newStory.author}
                  onChange={(e) => setNewStory({ ...newStory, author: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">Your Story</label>
                <textarea
                  id="content"
                  value={newStory.content}
                  onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Share Your Story'}
              </button>
            </form>
          </div>
        </div>

        {/* Stories Archive */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Farmer Stories</h2>
          {error && stories.length === 0 ? (
            <div className="text-center text-gray-500">
              Failed to load stories. Please try again later.
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center text-gray-500">
              No stories yet. Be the first to share your farming experience!
            </div>
          ) : (
            <div className="grid gap-6">
              {stories.map((story) => (
                <div key={story.id} className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{story.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">By {story.author} • {story.date}</p>
                  <p className="mt-4 text-gray-600 whitespace-pre-line">{story.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Community Features Section */}
        <div className="mt-12">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" className="h-6 w-6 text-primary-600 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">Community Features</h2>
            </div>
            <div className="mt-4 space-y-4">
              <p className="text-gray-600">
                Share your farming experiences, ask questions, and learn from other farmers in the community.
              </p>
              <p className="text-gray-600">
                Coming soon: Forums, discussion boards, and farmer profiles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;