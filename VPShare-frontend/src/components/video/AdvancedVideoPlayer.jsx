import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  Settings,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Repeat,
  Shuffle,
  List,
  Loader,
  CheckCircle,
  Eye,
  Clock,
  TrendingUp,
  Zap,
  Film
} from 'lucide-react';
import '../../styles/AdvancedVideoPlayer.css';

const AdvancedVideoPlayer = ({ 
  video, 
  onClose, 
  playlist = [], 
  onPlaylistChange,
  onLike,
  onComment 
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [isBuffering, setIsBuffering] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [loop, setLoop] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  
  // Advanced features state
  const [watchTime, setWatchTime] = useState(0);
  const [heatmap, setHeatmap] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true);

  let controlsTimeout = useRef(null);
  let statsInterval = useRef(null);

  // Initialize video
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      setWatchTime(prev => prev + 0.1);
    };

    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('canplay', handleCanPlay);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('waiting', handleWaiting);
      videoElement.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!keyboardShortcuts) return;

    const handleKeyPress = (e) => {
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'arrowleft':
          e.preventDefault();
          skipBackward();
          break;
        case 'arrowright':
          e.preventDefault();
          skipForward();
          break;
        case 'arrowup':
          e.preventDefault();
          changeVolume(0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          changeVolume(-0.1);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 's':
          e.preventDefault();
          setShowStats(!showStats);
          break;
        case 'l':
          e.preventDefault();
          handleLike();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [keyboardShortcuts, showStats, isPlaying]);

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying) {
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [isPlaying, showControls]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.min(video.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(video.currentTime - 10, 0);
    }
  };

  const handleProgressChange = (e) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const changeVolume = (delta) => {
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const changePlaybackSpeed = (speed) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSettings(false);
    }
  };

  const handleDownload = () => {
    if (video?.videoUrl) {
      window.open(video.videoUrl, '_blank');
    }
  };

  const handleShare = async () => {
    if (navigator.share && video) {
      try {
        await navigator.share({
          title: video.topic || 'Video',
          text: `Check out this video: ${video.topic}`,
          url: video.videoUrl
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) onLike(video.id);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentTime / duration) * 100 || 0;

  return (
    <motion.div
      ref={containerRef}
      className="advanced-video-player"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="video-element"
        src={video?.videoUrl}
        loop={loop}
        onClick={togglePlayPause}
      />

      {/* Buffering Loader */}
      <AnimatePresence>
        {isBuffering && (
          <motion.div
            className="buffering-loader"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Loader className="spin" size={48} />
            <p>Buffering...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Play Button */}
      <AnimatePresence>
        {!isPlaying && !isBuffering && (
          <motion.button
            className="center-play-button"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={togglePlayPause}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Play size={64} fill="white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Video Info Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="video-info-overlay"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="video-header">
              <div className="video-title-section">
                <Film size={20} />
                <h3>{video?.topic || 'Untitled Video'}</h3>
              </div>
              <button className="close-button" onClick={onClose}>×</button>
            </div>
            <div className="video-metadata">
              <span className="metadata-item">
                <Eye size={14} />
                {video?.views || 0} views
              </span>
              <span className="metadata-item">
                <Clock size={14} />
                {formatTime(duration)}
              </span>
              <span className="metadata-item">
                <TrendingUp size={14} />
                {video?.likes || 0} likes
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="video-controls"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {/* Progress Bar */}
            <div className="progress-section">
              <div
                ref={progressBarRef}
                className="progress-bar"
                onClick={handleProgressChange}
              >
                <div className="progress-buffer" />
                <motion.div
                  className="progress-filled"
                  style={{ width: `${progressPercentage}%` }}
                  initial={false}
                  animate={{ width: `${progressPercentage}%` }}
                />
                <motion.div
                  className="progress-thumb"
                  style={{ left: `${progressPercentage}%` }}
                  whileHover={{ scale: 1.5 }}
                  whileTap={{ scale: 1.2 }}
                />
              </div>
              <div className="time-display">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="controls-row">
              <div className="controls-left">
                <motion.button
                  className="control-button"
                  onClick={skipBackward}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Skip 10s backward (←)"
                >
                  <SkipBack size={20} />
                </motion.button>

                <motion.button
                  className="control-button primary"
                  onClick={togglePlayPause}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Play/Pause (Space)"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </motion.button>

                <motion.button
                  className="control-button"
                  onClick={skipForward}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Skip 10s forward (→)"
                >
                  <SkipForward size={20} />
                </motion.button>

                <div className="volume-control">
                  <motion.button
                    className="control-button"
                    onClick={toggleMute}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Mute (M)"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </motion.button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setVolume(val);
                      if (videoRef.current) {
                        videoRef.current.volume = val;
                      }
                      setIsMuted(val === 0);
                    }}
                    className="volume-slider"
                  />
                </div>

                <span className="speed-indicator">
                  {playbackSpeed}x
                </span>
              </div>

              <div className="controls-right">
                <motion.button
                  className={`control-button ${loop ? 'active' : ''}`}
                  onClick={() => setLoop(!loop)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Loop"
                >
                  <Repeat size={20} />
                </motion.button>

                <motion.button
                  className={`control-button ${isLiked ? 'liked' : ''}`}
                  onClick={handleLike}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Like (L)"
                >
                  <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                </motion.button>

                <motion.button
                  className="control-button"
                  onClick={handleShare}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Share"
                >
                  <Share2 size={20} />
                </motion.button>

                <motion.button
                  className="control-button"
                  onClick={handleDownload}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Download"
                >
                  <Download size={20} />
                </motion.button>

                <motion.button
                  className={`control-button ${showSettings ? 'active' : ''}`}
                  onClick={() => setShowSettings(!showSettings)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Settings (S)"
                >
                  <Settings size={20} />
                </motion.button>

                {playlist.length > 0 && (
                  <motion.button
                    className={`control-button ${showPlaylist ? 'active' : ''}`}
                    onClick={() => setShowPlaylist(!showPlaylist)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Playlist"
                  >
                    <List size={20} />
                  </motion.button>
                )}

                <motion.button
                  className="control-button"
                  onClick={toggleFullscreen}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Fullscreen (F)"
                >
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="settings-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h4>Playback Settings</h4>
            
            <div className="setting-group">
              <label>Playback Speed</label>
              <div className="speed-options">
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                  <button
                    key={speed}
                    className={`speed-option ${playbackSpeed === speed ? 'active' : ''}`}
                    onClick={() => changePlaybackSpeed(speed)}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <div className="setting-group">
              <label>Quality</label>
              <div className="quality-options">
                <button className={quality === 'auto' ? 'active' : ''} onClick={() => setQuality('auto')}>
                  Auto
                </button>
                <button className={quality === '1080p' ? 'active' : ''} onClick={() => setQuality('1080p')}>
                  1080p
                </button>
                <button className={quality === '720p' ? 'active' : ''} onClick={() => setQuality('720p')}>
                  720p
                </button>
                <button className={quality === '480p' ? 'active' : ''} onClick={() => setQuality('480p')}>
                  480p
                </button>
              </div>
            </div>

            <div className="setting-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={autoplay}
                  onChange={(e) => setAutoplay(e.target.checked)}
                />
                Autoplay next video
              </label>
            </div>

            <div className="setting-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={keyboardShortcuts}
                  onChange={(e) => setKeyboardShortcuts(e.target.checked)}
                />
                Keyboard shortcuts
              </label>
            </div>

            <div className="setting-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={showStats}
                  onChange={(e) => setShowStats(e.target.checked)}
                />
                Show stats overlay
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Overlay */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            className="stats-overlay"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h4>Video Statistics</h4>
            <div className="stat-row">
              <span>Resolution:</span>
              <span>{quality === 'auto' ? '1080p (auto)' : quality}</span>
            </div>
            <div className="stat-row">
              <span>Playback Speed:</span>
              <span>{playbackSpeed}x</span>
            </div>
            <div className="stat-row">
              <span>Duration:</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="stat-row">
              <span>Watch Time:</span>
              <span>{formatTime(watchTime)}</span>
            </div>
            <div className="stat-row">
              <span>Buffering:</span>
              <span className={isBuffering ? 'buffering' : 'ready'}>
                {isBuffering ? 'Yes' : 'No'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlist Panel */}
      <AnimatePresence>
        {showPlaylist && playlist.length > 0 && (
          <motion.div
            className="playlist-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="playlist-header">
              <h4>Playlist</h4>
              <span>{playlist.length} videos</span>
            </div>
            <div className="playlist-items">
              {playlist.map((item, index) => (
                <motion.div
                  key={item.id}
                  className={`playlist-item ${item.id === video?.id ? 'active' : ''}`}
                  onClick={() => onPlaylistChange && onPlaylistChange(item)}
                  whileHover={{ x: 5 }}
                >
                  <div className="playlist-item-number">{index + 1}</div>
                  <div className="playlist-item-info">
                    <h5>{item.topic}</h5>
                    <span>{formatTime(item.duration || 0)}</span>
                  </div>
                  {item.id === video?.id && (
                    <Zap size={16} className="playing-icon" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help */}
      <motion.div
        className="shortcuts-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 0.6 : 0 }}
      >
        Press S for stats | F for fullscreen | Space to play/pause
      </motion.div>
    </motion.div>
  );
};

export default AdvancedVideoPlayer;
