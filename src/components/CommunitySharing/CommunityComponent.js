import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useVoiceService } from '../../hooks/useVoiceService';
import { getMarketplaceListings } from '../../utils/storage';
import { useOfflineStorage } from '../../hooks/useOfflineStorage';
import styles from '../../styles/CommunitySharing.module.css';
import { 
  ChatBubbleLeftIcon, 
  HeartIcon,
  ShareIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

// Sample farmer badges
const farmerBadges = {
  newFarmer: { name: 'New Voice', threshold: 0 },
  activeFarmer: { name: 'Knowledge Sharer', threshold: 3 },
  experiFarmer: { name: 'Village Scientist', threshold: 5 },
  masterFarmer: { name: 'Master Farmer', threshold: 10 }
};

const CommunityComponent = () => {
  const router = useRouter();
  const { playVoice, speakText, startListening } = useVoiceService();
  const { isOnline } = useOfflineStorage();
  
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stories');
  const [newStory, setNewStory] = useState({
    title: '',
    content: '',
    cropType: 'General',
    audioContent: null,
    isCommunityStory: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState({});
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const listings = await getMarketplaceListings();
        const communityStories = listings.filter(listing => listing.isCommunityStory) || [];
        setStories(communityStories);
      } catch (err) {
        setError('Failed to load community stories');
        console.error('Error loading stories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Sort stories by upvotes, highest first
  const sortedStories = [...stories].sort((a, b) => b.upvotes - a.upvotes);

  // Get author badge based on upvotes
  const getAuthorBadge = (upvotes) => {
    if (upvotes >= farmerBadges.masterFarmer.threshold) {
      return farmerBadges.masterFarmer.name;
    } else if (upvotes >= farmerBadges.experiFarmer.threshold) {
      return farmerBadges.experiFarmer.name;
    } else if (upvotes >= farmerBadges.activeFarmer.threshold) {
      return farmerBadges.activeFarmer.name;
    } else {
      return farmerBadges.newFarmer.name;
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'stories') {
      playVoice('community_stories');
    } else {
      playVoice('share_story');
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStory(prev => ({ ...prev, [name]: value }));
  };

  // Handle voice input for content
  const handleVoiceInput = (field) => {
    playVoice('speak_now');
    
    startListening(
      (result) => {
        setNewStory(prev => ({ ...prev, [field]: result }));
      },
      (error) => {
        console.error('Voice recognition error:', error);
        playVoice('voice_error');
      }
    );
  };

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Reset audio chunks
      audioChunksRef.current = [];
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        // Create blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to base64 for storage
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result;
          setNewStory(prev => ({ ...prev, audioContent: base64Audio }));
        };
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setRecording(true);
      playVoice('recording_started');
    } catch (error) {
      console.error('Error starting audio recording:', error);
      playVoice('recording_error');
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      playVoice('recording_stopped');
    }
  };

  // Submit story
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newStory.title || (!newStory.content && !newStory.audioContent)) {
      playVoice('fill_required');
      return;
    }
    
    try {
      setSubmitting(true);
      
      await storeFarmingTip(newStory);
      
      // Success feedback
      playVoice('story_shared');
      speakText('Your story has been shared with the community!');
      
      // Reset form
      setNewStory({
        title: '',
        content: '',
        cropType: 'General',
        audioContent: null,
        isCommunityStory: true
      });
      
      // Switch to stories tab to see the new story
      setActiveTab('stories');
      
      // Refresh stories
      router.reload();
    } catch (error) {
      console.error('Error sharing story:', error);
      playVoice('error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle upvote
  const handleUpvote = async (storyId) => {
    try {
      await upvoteTip(storyId);
      
      // Update local stories state to show immediate feedback
      const updatedStories = stories.map(story => {
        if (story.id === storyId) {
          return { ...story, upvotes: story.upvotes + 1 };
        }
        return story;
      });
      
      // Refresh stories by reloading page
      router.reload();
    } catch (error) {
      console.error('Error upvoting story:', error);
      playVoice('error');
    }
  };

  // Play audio content
  const playAudio = (storyId, audioContent) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = audioContent;
      
      // Update playing state
      setIsPlaying(prev => {
        const newState = {};
        Object.keys(prev).forEach(key => {
          newState[key] = false;
        });
        newState[storyId] = true;
        return newState;
      });
      
      // Play the new audio
      audioRef.current.play();
      
      // Set up ended event to update playing state
      audioRef.current.onended = () => {
        setIsPlaying(prev => ({
          ...prev,
          [storyId]: false
        }));
      };
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    router.push('/');
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    try {
      const story = {
        ...newStory,
        isCommunityStory: true,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: [],
        author: 'Anonymous' // Replace with actual user name when auth is implemented
      };

      await storeFarmingTip(story);
      await loadStories();
      setNewStory({ title: '', content: '' });
      setIsCreating(false);
    } catch (err) {
      console.error('Error creating story:', err);
      setError('Failed to create story');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={loadStories}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Farmer Community</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 flex items-center"
        >
          <PencilSquareIcon className="h-5 w-5 mr-2" />
          Share Your Story
        </button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Share Your Experience</h2>
          <form onSubmit={handleCreateStory}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newStory.title}
                onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Your Story
              </label>
              <textarea
                id="content"
                value={newStory.content}
                onChange={(e) => setNewStory(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
              >
                Share Story
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {stories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No stories shared yet. Be the first to share your experience!</p>
          </div>
        ) : (
          stories.map((story) => (
            <div key={story.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">{story.title}</h2>
              <p className="text-gray-600 mb-4">{story.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleUpvote(story.id)}
                    className="flex items-center space-x-1 hover:text-primary-600"
                  >
                    {story.isLiked ? (
                      <HeartIconSolid className="h-5 w-5 text-primary-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                    <span>{story.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-primary-600">
                    <ChatBubbleLeftIcon className="h-5 w-5" />
                    <span>{story.comments?.length || 0}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-primary-600">
                    <ShareIcon className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <span>{story.author}</span>
                  <span>•</span>
                  <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityComponent;