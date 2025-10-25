// Global variables
let currentVideoData = null;
let selectedFormat = 'video';

// API Configuration
const API_BASE_URL = 'https://youtube-download-api-7jxd.onrender.com'; // Fallback API endpoint
// Alternative APIs can be used if the primary one is down

// Utility function to extract video ID from YouTube URL
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Validate YouTube URL
function isValidYouTubeUrl(url) {
    return extractVideoId(url) !== null;
}

// Show/Hide elements
function showElement(id) {
    document.getElementById(id).classList.remove('hidden');
}

function hideElement(id) {
    document.getElementById(id).classList.add('hidden');
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    errorText.textContent = message;
    showElement('errorMessage');
    setTimeout(() => {
        hideElement('errorMessage');
    }, 5000);
}

// Format duration from seconds to readable format
function formatDuration(seconds) {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
}

// Fetch video information
async function fetchVideoInfo() {
    const urlInput = document.getElementById('videoUrl');
    const url = urlInput.value.trim();
    
    if (!url) {
        showError('Please enter a YouTube URL');
        return;
    }
    
    if (!isValidYouTubeUrl(url)) {
        showError('Please enter a valid YouTube URL');
        return;
    }
    
    const videoId = extractVideoId(url);
    
    // Hide previous results and errors
    hideElement('videoInfo');
    hideElement('errorMessage');
    showElement('loadingSpinner');
    
    try {
        // Try to fetch video info using the API
        const response = await fetch(`${API_BASE_URL}/video/info?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch video information');
        }
        
        const data = await response.json();
        currentVideoData = data;
        
        // Display video information
        displayVideoInfo(data);
        
    } catch (error) {
        console.error('Error fetching video info:', error);
        
        // Fallback: Use YouTube oEmbed API for basic info
        try {
            const oEmbedResponse = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
            const oEmbedData = await oEmbedResponse.json();
            
            currentVideoData = {
                videoId: videoId,
                title: oEmbedData.title,
                author: oEmbedData.author_name,
                thumbnail: oEmbedData.thumbnail_url,
                duration: 'Unknown'
            };
            
            displayVideoInfo(currentVideoData);
        } catch (fallbackError) {
            console.error('Fallback error:', fallbackError);
            showError('Unable to fetch video information. Please check the URL and try again.');
            hideElement('loadingSpinner');
        }
    }
}

// Display video information
function displayVideoInfo(data) {
    hideElement('loadingSpinner');
    
    // Update thumbnail
    const thumbnail = data.thumbnail || data.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`;
    document.getElementById('videoThumbnail').src = thumbnail;
    
    // Update title
    document.getElementById('videoTitle').textContent = data.title || 'Unknown Title';
    
    // Update channel
    document.getElementById('videoChannel').textContent = data.author || data.channel || 'Unknown Channel';
    
    // Update duration
    const duration = data.duration || data.lengthSeconds;
    document.getElementById('videoDuration').textContent = formatDuration(duration);
    
    // Show video info section
    showElement('videoInfo');
    
    // Reset format selection
    selectFormat('video');
}

// Select download format (video or audio)
function selectFormat(format) {
    selectedFormat = format;
    
    const videoBtn = document.getElementById('videoFormatBtn');
    const audioBtn = document.getElementById('audioFormatBtn');
    const qualitySection = document.getElementById('qualitySection');
    
    if (format === 'video') {
        // Highlight video button
        videoBtn.className = 'format-btn active-video';
        
        // Reset audio button
        audioBtn.className = 'format-btn';
        
        // Show quality selection
        showElement('qualitySection');
    } else {
        // Highlight audio button
        audioBtn.className = 'format-btn active-audio';
        
        // Reset video button
        videoBtn.className = 'format-btn';
        
        // Hide quality selection for audio
        hideElement('qualitySection');
    }
}

// Download video
async function downloadVideo() {
    if (!currentVideoData) {
        showError('Please fetch video information first');
        return;
    }
    
    const downloadBtn = document.getElementById('downloadBtn');
    const originalText = downloadBtn.innerHTML;
    
    try {
        // Update button state
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<span class="icon-spinner mr-2"></span> Preparing download...';
        
        const videoId = currentVideoData.videoId || extractVideoId(document.getElementById('videoUrl').value);
        const quality = document.getElementById('qualitySelect').value;
        
        let downloadUrl;
        
        if (selectedFormat === 'audio') {
            // Audio download
            downloadUrl = `${API_BASE_URL}/video/audio?url=https://www.youtube.com/watch?v=${videoId}`;
        } else {
            // Video download with quality
            downloadUrl = `${API_BASE_URL}/video/download?url=https://www.youtube.com/watch?v=${videoId}&quality=${quality}`;
        }
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${currentVideoData.title || 'video'}.${selectedFormat === 'audio' ? 'mp3' : 'mp4'}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        setTimeout(() => {
            downloadBtn.innerHTML = '<span class="icon-check mr-2"></span> Download Started!';
            downloadBtn.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';
            
            setTimeout(() => {
                downloadBtn.innerHTML = originalText;
                downloadBtn.style.background = '';
                downloadBtn.disabled = false;
            }, 2000);
        }, 500);
        
    } catch (error) {
        console.error('Download error:', error);
        showError('Download failed. Please try again or use a different quality.');
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    }
}

// Handle Enter key press in URL input
document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('videoUrl');
    
    urlInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            fetchVideoInfo();
        }
    });
    
    // Auto-focus on URL input
    urlInput.focus();
    
    // Add paste event listener to auto-fetch when URL is pasted
    urlInput.addEventListener('paste', function(event) {
        setTimeout(() => {
            const pastedUrl = event.target.value;
            if (isValidYouTubeUrl(pastedUrl)) {
                // Auto-fetch after a short delay
                setTimeout(fetchVideoInfo, 500);
            }
        }, 100);
    });
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';
