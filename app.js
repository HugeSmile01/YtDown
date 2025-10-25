// Global variables
let currentVideoData = null;
let selectedFormat = 'video';

// API Configuration with multiple fallback endpoints
const API_ENDPOINTS = [
    'https://youtube-download-api.matheusishiyama.repl.co', // Official endpoint
    'https://youtube-download-api-7jxd.onrender.com',      // Render deployment
    'https://yt-download-api.vercel.app',                  // Vercel deployment (if available)
];

let currentApiIndex = 0;
let API_BASE_URL = API_ENDPOINTS[0];

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

// Try different API endpoints with fallback
async function tryApiEndpoint(endpoint, urlPath, url) {
    const response = await fetch(`${endpoint}${urlPath}?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
    }
    
    return response.json();
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
    
    let apiWorked = false;
    
    // Try each API endpoint
    for (let i = 0; i < API_ENDPOINTS.length && !apiWorked; i++) {
        try {
            const apiEndpoint = API_ENDPOINTS[i];
            console.log(`Trying API: ${apiEndpoint}`);
            
            // Try with /info endpoint (original API structure)
            const data = await tryApiEndpoint(apiEndpoint, '/info', url);
            
            // Success! Update the current API index and base URL
            currentApiIndex = i;
            API_BASE_URL = apiEndpoint;
            
            currentVideoData = {
                videoId: videoId,
                title: data.title,
                author: data.author || data.channel || 'Unknown Channel',
                thumbnail: data.thumbnail,
                duration: data.duration || data.lengthSeconds || 'Unknown'
            };
            
            displayVideoInfo(currentVideoData);
            apiWorked = true;
            
        } catch (error) {
            console.error(`Error with API ${API_ENDPOINTS[i]}:`, error);
            // Continue to next API endpoint
        }
    }
    
    // If no API worked, try YouTube oEmbed as fallback
    if (!apiWorked) {
        try {
            const oEmbedResponse = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
            const oEmbedData = await oEmbedResponse.json();
            
            currentVideoData = {
                videoId: videoId,
                title: oEmbedData.title,
                author: oEmbedData.author_name,
                thumbnail: oEmbedData.thumbnail_url,
                duration: 'Unknown',
                fallbackMode: true  // Flag to indicate we're in fallback mode
            };
            
            displayVideoInfo(currentVideoData);
            
            // Show warning about limited functionality
            showError('⚠️ Download API is currently unavailable. Video information displayed using fallback mode. Downloads may not work.');
        } catch (fallbackError) {
            console.error('Fallback error:', fallbackError);
            showError('Unable to fetch video information. The download API is currently unavailable. Please try again later or check the URL.');
            hideElement('loadingSpinner');
        }
    }
}

// Display video information
function displayVideoInfo(data) {
    hideElement('loadingSpinner');
    
    // Update thumbnail - validate and sanitize URL
    // Sanitize videoId to only allow valid YouTube video ID characters (alphanumeric, -, _)
    const safeVideoId = String(data.videoId || '').replace(/[^a-zA-Z0-9_-]/g, '');
    let thumbnail = data.thumbnail || data.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${safeVideoId}/maxresdefault.jpg`;
    
    // Ensure thumbnail URL is from trusted YouTube domains
    if (thumbnail && (thumbnail.startsWith('https://i.ytimg.com/') || 
                       thumbnail.startsWith('https://img.youtube.com/') ||
                       thumbnail.startsWith('https://i9.ytimg.com/'))) {
        document.getElementById('videoThumbnail').src = thumbnail;
    } else {
        // Fallback to default thumbnail with sanitized videoId
        document.getElementById('videoThumbnail').src = `https://img.youtube.com/vi/${safeVideoId}/maxresdefault.jpg`;
    }
    
    // Update title - use textContent to prevent XSS
    document.getElementById('videoTitle').textContent = data.title || 'Unknown Title';
    
    // Update channel - use textContent to prevent XSS
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
    
    // Check if we're in fallback mode
    if (currentVideoData.fallbackMode) {
        showError('⚠️ Download functionality is currently unavailable. The YouTube download API is not accessible. Please try again later.');
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
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        let downloadUrl;
        
        // Use the correct API endpoint structure based on the original API
        if (selectedFormat === 'audio') {
            // Use /mp3 endpoint for audio
            downloadUrl = `${API_BASE_URL}/mp3?url=${encodeURIComponent(youtubeUrl)}`;
        } else {
            // Use /mp4 endpoint for video
            downloadUrl = `${API_BASE_URL}/mp4?url=${encodeURIComponent(youtubeUrl)}`;
        }
        
        // Validate that downloadUrl is from an expected API domain
        try {
            const url = new URL(downloadUrl);
            const validDomains = API_ENDPOINTS.map(endpoint => new URL(endpoint).origin);
            if (!validDomains.includes(url.origin)) {
                throw new Error('Invalid download URL');
            }
        } catch (error) {
            console.error('Download URL validation failed:', error);
            showError('Invalid download request. Please try again.');
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
            return;
        }
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        // Sanitize filename to prevent directory traversal
        const safeTitle = (currentVideoData.title || 'video').replace(/[^a-zA-Z0-9-_ ]/g, '_');
        link.download = `${safeTitle}.${selectedFormat === 'audio' ? 'mp3' : 'mp4'}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer'; // Security best practice
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
        showError('Download failed. The API might be temporarily unavailable. Please try again later.');
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
