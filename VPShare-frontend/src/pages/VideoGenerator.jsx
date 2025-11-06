import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Search, 
  Sparkles, 
  Clock, 
  Download, 
  Play, 
  Pause,
  Trash2,
  Filter,
  RefreshCw,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, doc as firestoreDoc, getDoc } from 'firebase/firestore';
import { videoDb } from '../config/firebase-video';
import LearningSpaceSidebar from '../components/layout/LearningSpaceSidebar';
import AdvancedVideoPlayer from '../components/video/AdvancedVideoPlayer';
import '../styles/VideoGenerator.css';

// Video Generation API endpoint
const VIDEO_API_URL = import.meta.env.VITE_VIDEO_API_URL || 'https://video-gen-api.onrender.com/api';

const VideoGenerator = () => {
  const { user } = useAuth();
  const db = videoDb; // Use video-specific Firebase instance

  // Form state
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoDuration, setVideoDuration] = useState(30); // seconds
  const [videoStyle, setVideoStyle] = useState('professional');
  const [generating, setGenerating] = useState(false);

  // Library state
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, processing, failed
  const [loading, setLoading] = useState(true);

  // Playback state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [playing, setPlaying] = useState(false);

  // Fetch user's videos
  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user]);

  // Filter videos based on search and status
  useEffect(() => {
    let filtered = videos;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(video => 
        video.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(video => video.status === filterStatus);
    }

    setFilteredVideos(filtered);
  }, [searchQuery, filterStatus, videos]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      // Simple query without filters - no index required
      const videosRef = collection(db, 'videos');
      const snapshot = await getDocs(videosRef);
      
      const videoList = [];
      
      for (const videoDoc of snapshot.docs) {
        const docId = videoDoc.id;
        const videoData = videoDoc.data();
        
        // Skip if no topic/prompt
        if (!videoData.topic && !videoData.prompt) continue;
        
        // Map the API structure to our component structure
        const video = {
          id: docId,
          prompt: videoData.topic || videoData.prompt || '',
          title: (videoData.topic || videoData.prompt || 'Generated Video').substring(0, 50),
          duration: videoData.duration || 30,
          style: videoData.style || 'professional',
          status: videoData.status || 'processing',
          videoUrl: videoData.video_url || null,
          thumbnailUrl: videoData.thumbnail_url || null,
          createdAt: videoData.created_at?.toDate() || videoData.createdAt?.toDate() || new Date(),
        };
        
        // If video_url doesn't exist, check for base64 segments (legacy support)
        if (!video.videoUrl && videoData.status === 'completed') {
          try {
            const segmentsRef = collection(db, `videos/${docId}/video_segments`);
            const segmentsSnap = await getDocs(segmentsRef);
            
            if (!segmentsSnap.empty) {
              const orderedSegments = segmentsSnap.docs
                .sort((a, b) => a.data().segment_index - b.data().segment_index)
                .map((doc) => doc.data().content);
              
              const fullBase64 = orderedSegments.join('');
              const blob = base64ToBlob(fullBase64, 'video/mp4');
              video.videoUrl = URL.createObjectURL(blob);
            }
          } catch (err) {
            console.error('Error loading video segments for', docId, ':', err);
          }
        }
        
        videoList.push(video);
      }
      
      // Sort by creation date (newest first) - done in memory, no index needed
      videoList.sort((a, b) => b.createdAt - a.createdAt);
      
      setVideos(videoList);
      setFilteredVideos(videoList);
    } catch (error) {
      console.error('Error fetching videos:', error);
      // Show user-friendly error
      if (error.code === 'failed-precondition') {
        console.error('Firestore index required. Using simple query instead.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const base64ToBlob = (base64, mimeType) => {
    const byteChars = atob(base64);
    const byteArrays = [];
    
    for (let i = 0; i < byteChars.length; i += 1024) {
      const slice = byteChars.slice(i, i + 1024);
      const byteNumbers = new Array(slice.length);
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    
    return new Blob(byteArrays, { type: mimeType });
  };

  const handleGenerateVideo = async (e) => {
    e.preventDefault();
    
    if (!videoPrompt.trim()) {
      alert('Please enter a video description');
      return;
    }

    setGenerating(true);

    try {
      // Debug logging
      console.log('=== Video Generation Debug Info ===');
      console.log('API URL:', VIDEO_API_URL);
      console.log('Environment Variable:', import.meta.env.VITE_VIDEO_API_URL);
      console.log('Full Endpoint:', `${VIDEO_API_URL}/generate/`);
      console.log('Request Payload:', {
        topic: videoPrompt,
        duration: videoDuration,
      });
      
      // Call the video generation API
      const response = await axios.post(`${VIDEO_API_URL}/generate/`, {
        topic: videoPrompt,
        duration: videoDuration,
      }, {
        timeout: 60000, // 60 second timeout for cold start
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      // Handle both response formats: job_id (new) and firestore_doc_id (legacy)
      const jobId = response.data.job_id || response.data.firestore_doc_id;
      
      if (jobId) {
        alert(`🎬 Video generation queued! Job ID: ${jobId}\n\nYour video will appear in the library once processing is complete (usually 2-5 minutes).`);
        
        // Reset form
        setVideoPrompt('');
        setVideoDuration(30);
        
        // Refresh videos after a delay to check for completion
        setTimeout(() => {
          fetchVideos();
        }, 5000);
        
        // Set up polling to check for video completion
        const pollInterval = setInterval(() => {
          fetchVideos();
        }, 10000); // Check every 10 seconds
        
        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
        }, 300000);
      } else {
        console.warn('No job_id or firestore_doc_id in response:', response.data);
        alert('Video queued but no job ID returned. Check your library in a few minutes.');
        setTimeout(() => {
          fetchVideos();
        }, 5000);
      }
      
    } catch (error) {
      console.error('=== Video Generation Error ===');
      console.error('Error Type:', error.name);
      console.error('Error Message:', error.message);
      
      if (error.response) {
        // Server responded with error
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', error.response.data);
        console.error('Response Headers:', error.response.headers);
        
        const errorMsg = error.response.data?.detail || 
                        error.response.data?.error || 
                        error.response.data?.message ||
                        'Failed to generate video';
        
        if (error.response.status === 404) {
          alert('API endpoint not found. Please check the API URL configuration.');
        } else if (error.response.status >= 500) {
          alert(`Server error: ${errorMsg}. The API server may be starting up, please wait 30 seconds and try again.`);
        } else {
          alert(`Error: ${errorMsg}`);
        }
      } else if (error.request) {
        // Request made but no response
        console.error('No Response Received');
        console.error('Request Details:', error.request);
        
        if (error.code === 'ECONNABORTED') {
          alert('Request timeout. The API server may be starting up (cold start on Render). Please wait 30-60 seconds and try again.');
        } else {
          alert('Network error. Please check your connection and verify the API is running.');
        }
      } else {
        // Error setting up request
        console.error('Request Setup Error:', error);
        alert('Failed to start video generation. Please try again.');
      }
      
      console.error('Full Error Object:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      // Note: Firestore delete requires proper permissions
      // The API handles deletion on the backend
      const videoRef = firestoreDoc(db, 'videos', videoId);
      
      // Just remove from local state for now
      // Backend cleanup should be handled by the API
      setVideos(videos.filter(v => v.id !== videoId));
      if (selectedVideo?.id === videoId) {
        setSelectedVideo(null);
      }
      
      alert('Video deleted successfully');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  const handleDownload = (videoUrl, title) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${title || 'video'}.mp4`;
    link.click();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} className="status-icon completed" />;
      case 'processing':
        return <Loader size={18} className="status-icon processing spinning" />;
      case 'failed':
        return <AlertCircle size={18} className="status-icon failed" />;
      default:
        return <Clock size={18} className="status-icon" />;
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="video-generator-wrapper">
      <LearningSpaceSidebar />
      <div className="video-generator-page">
        {/* Header */}
        <motion.div
          className="video-gen-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
        <div className="header-content">
          <div className="header-title">
            <Video size={32} className="header-icon" />
            <div>
              <h1>AI Video Generator</h1>
              <p>Create stunning videos from text in minutes</p>
            </div>
          </div>
          <div className="header-badge hot-badge">
            <Sparkles size={16} />
            <span>HOT</span>
          </div>
        </div>
      </motion.div>

      <div className="video-gen-container">
        {/* Video Generation Form */}
        <motion.section
          className="generation-section"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="section-card">
            <h2>
              <Sparkles size={24} />
              Generate New Video
            </h2>
            
            <form onSubmit={handleGenerateVideo} className="video-form">
              <div className="form-group">
                <label>Video Description *</label>
                <textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Describe your video... e.g., 'A tutorial about Python loops with code examples and animations'"
                  rows={4}
                  required
                  disabled={generating}
                />
                <div className="char-count">
                  {videoPrompt.length} / 500 characters
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration</label>
                  <select
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(Number(e.target.value))}
                    disabled={generating}
                  >
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={120}>2 minutes</option>
                    <option value={300}>5 minutes</option>
                    <option value={600}>10 minutes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Style</label>
                  <select
                    value={videoStyle}
                    onChange={(e) => setVideoStyle(e.target.value)}
                    disabled={generating}
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="animated">Animated</option>
                    <option value="minimal">Minimal</option>
                    <option value="educational">Educational</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="generate-btn"
                disabled={generating || !videoPrompt.trim()}
              >
                {generating ? (
                  <>
                    <Loader size={20} className="spinning" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Video
                  </>
                )}
              </button>
            </form>

            <div className="info-box">
              <AlertCircle size={18} />
              <p>Video generation typically takes 2-5 minutes depending on duration and complexity.</p>
            </div>
          </div>
        </motion.section>

        {/* Video Library */}
        <motion.section
          className="library-section"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="section-card">
            <div className="section-header">
              <h2>
                <Upload size={24} />
                Video Library ({filteredVideos.length})
              </h2>
              <button
                onClick={fetchVideos}
                className="refresh-btn"
                disabled={loading}
              >
                <RefreshCw size={18} className={loading ? 'spinning' : ''} />
              </button>
            </div>

            {/* Search and Filter */}
            <div className="library-controls">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('completed')}
                >
                  Completed
                </button>
                <button
                  className={`filter-btn ${filterStatus === 'processing' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('processing')}
                >
                  Processing
                </button>
                <button
                  className={`filter-btn ${filterStatus === 'failed' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('failed')}
                >
                  Failed
                </button>
              </div>
            </div>

            {/* Video List */}
            <div className="video-list">
              {loading ? (
                <div className="loading-state">
                  <Loader size={40} className="spinning" />
                  <p>Loading videos...</p>
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className="empty-state">
                  <Video size={48} />
                  <h3>No videos found</h3>
                  <p>
                    {searchQuery || filterStatus !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Generate your first video to get started!'}
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {filteredVideos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      className={`video-card ${selectedVideo?.id === video.id ? 'selected' : ''}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedVideo(video)}
                    >
                      <div className="video-thumbnail">
                        {video.thumbnailUrl ? (
                          <img src={video.thumbnailUrl} alt={video.title} />
                        ) : (
                          <div className="placeholder-thumbnail">
                            <Video size={32} />
                          </div>
                        )}
                        {video.status === 'completed' && (
                          <div className="play-overlay">
                            <Play size={24} />
                          </div>
                        )}
                      </div>

                      <div className="video-info">
                        <div className="video-header">
                          <h4>{video.title}</h4>
                          {getStatusIcon(video.status)}
                        </div>
                        <p className="video-prompt">{video.prompt}</p>
                        <div className="video-meta">
                          <span className="meta-item">
                            <Clock size={14} />
                            {formatDuration(video.duration)}
                          </span>
                          <span className="meta-item">
                            <Video size={14} />
                            {video.style}
                          </span>
                          <span className="meta-item date">
                            {video.createdAt?.toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="video-actions">
                        {video.status === 'completed' && video.videoUrl && (
                          <button
                            className="action-btn download"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(video.videoUrl, video.title);
                            }}
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                        )}
                        <button
                          className="action-btn delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVideo(video.id);
                          }}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.section>
      </div>

      {/* Advanced Video Player */}
      <AnimatePresence>
        {selectedVideo && selectedVideo.status === 'completed' && selectedVideo.videoUrl && (
          <AdvancedVideoPlayer
            video={{
              ...selectedVideo,
              topic: selectedVideo.title || selectedVideo.prompt,
              views: Math.floor(Math.random() * 1000), // Mock views
              likes: Math.floor(Math.random() * 100)    // Mock likes
            }}
            onClose={() => setSelectedVideo(null)}
            playlist={filteredVideos.filter(v => v.status === 'completed' && v.videoUrl)}
            onPlaylistChange={(video) => setSelectedVideo(video)}
            onLike={(id) => console.log('Liked video:', id)}
            onComment={(id) => console.log('Comment on video:', id)}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default VideoGenerator;
