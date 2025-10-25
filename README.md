# YtDown - Free YouTube Downloader 🎬🎵

A free, secure, and easy-to-use YouTube downloader built with HTML, Tailwind CSS, and JavaScript. Download your favorite YouTube videos and music with just a few clicks!

## ✨ Features

- 🎥 **Video Download**: Download YouTube videos in various qualities (1080p, 720p, 480p, 360p)
- 🎵 **Audio Download**: Extract audio from YouTube videos as MP3
- 📱 **Mobile Friendly**: Fully responsive design that works on all devices
- 🔒 **Secure**: No data storage, completely client-side processing where possible
- ⚡ **Fast**: Lightning-fast downloads with a clean, modern interface
- 🎨 **Beautiful UI**: Advanced UX/UI with smooth animations and intuitive design
- 🆓 **100% Free**: No subscriptions, no hidden fees, completely free to use

## 🚀 How to Use

1. Open `index.html` in your web browser
2. Paste a YouTube URL in the input field
3. Click "Fetch Info" or press Enter
4. Choose your preferred format (Video or Audio)
5. Select quality (for video downloads)
6. Click "Download Now" to start the download

## 🛠️ Technologies Used

- **HTML5**: Structure and content
- **Tailwind CSS**: Modern, responsive styling via CDN
- **JavaScript**: Client-side functionality and API integration
- **Font Awesome**: Beautiful icons
- **YouTube Download API**: Backend API for processing downloads

## 📦 API Integration

This project integrates with the [youtube-download-api](https://github.com/MatheusIshiyama/youtube-download-api) to handle video processing and downloads.

### API Endpoints Used:
- `GET /video/info?url={youtube_url}` - Fetch video information
- `GET /video/download?url={youtube_url}&quality={quality}` - Download video
- `GET /video/audio?url={youtube_url}` - Download audio

## 🎯 Key Features Explained

### URL Validation
- Supports standard YouTube URLs (`youtube.com/watch?v=...`)
- Supports shortened URLs (`youtu.be/...`)
- Validates URLs before processing

### Format Selection
- **Video Mode**: Download complete videos with audio in MP4 format
- **Audio Mode**: Extract and download audio only in MP3 format

### Quality Options
- Highest Quality
- 1080p HD
- 720p HD (Default)
- 480p
- 360p
- Lowest Quality (smallest file size)

### User Experience
- Auto-focus on URL input for immediate use
- Auto-fetch on paste for quick downloads
- Enter key support for faster workflow
- Loading indicators and error handling
- Success confirmations
- Smooth animations and transitions

## 📱 Mobile Support

The interface is fully responsive and optimized for:
- 📱 Mobile phones (portrait and landscape)
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ Large displays

## 🔒 Privacy & Security

- No user data is stored
- All processing happens client-side when possible
- Respects YouTube's terms of service
- For personal use only

## ⚠️ Disclaimer

This tool is for personal use only. Please respect copyright laws and YouTube's terms of service. Only download content you have the right to download.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 📄 License

This project is open source and available for personal use.

## 🎉 Credits

- API by [MatheusIshiyama](https://github.com/MatheusIshiyama/youtube-download-api)
- UI Design inspired by modern web standards
- Icons by Font Awesome

---

Made with ❤️ for YouTube lovers
