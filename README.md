# 🎤 Tradelink Intercom

A modern, real-time voice communication application for local networks, built with WebRTC and Socket.IO. Perfect for intercom systems, team communication, or any local network voice chat needs.

## ✨ Features

### 🎵 **Audio Communication**
- **High-quality voice calls** using WebRTC
- **Real-time audio streaming** with minimal latency
- **Echo cancellation** and noise suppression
- **Volume control** for incoming audio
- **Audio testing tools** for troubleshooting

### 🏷️ **Device Identification**
- **Custom device names** for easy identification
- **Smart default names** based on platform (Windows PC, Mac Computer, etc.)
- **Real-time name updates** across all connected peers
- **Device information display** (platform, browser, user agent)

### 🌐 **Network Discovery**
- **Automatic peer discovery** on local networks
- **Real-time peer updates** with connection status
- **Network information display** (IP addresses, network ranges)
- **Cross-platform compatibility** (Windows, macOS, Linux)

### 🔧 **Built-in Tools**
- **Audio diagnostics** for troubleshooting
- **Connection debugging** for WebRTC issues
- **Audio testing interface** at `/test-audio`
- **Comprehensive error handling** with user-friendly messages

### 📱 **Progressive Web App (PWA)**
- **Installable** on desktop and mobile devices
- **Offline-capable** with service worker
- **Responsive design** for all screen sizes
- **Native app-like experience**

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher) or [Bun](https://bun.sh/) (recommended)
- Modern web browser with WebRTC support (Chrome, Firefox, Edge, Safari)
- [ngrok](https://ngrok.com/) (for HTTPS in production environments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Tradelink-intercom
   ```

2. **Install dependencies**
   ```bash
   # Using Bun (recommended)
   bun install
   
   # Or using npm
   npm install
   ```

3. **Start the development server**
   ```bash
   # Using Bun
   bun run dev
   
   # Or using npm
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Allow microphone access when prompted
   - Set a custom device name for easy identification

## 🌐 HTTPS Setup for Production

### Why HTTPS is Required
Modern browsers require HTTPS for microphone access in production environments. While `localhost` works for development, you'll need HTTPS for:
- **Production deployments**
- **Remote access**
- **Mobile devices**
- **Cross-origin requests**

### Using ngrok for HTTPS

1. **Install ngrok**
   ```bash
   # Using npm
   npm install -g ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your local server**
   ```bash
   bun run dev
   # Server runs on http://localhost:3000
   ```

3. **Expose with ngrok**
   ```bash
   # Create HTTPS tunnel
   ngrok http 3000
   ```

4. **Access your app**
   - ngrok will provide a public HTTPS URL
   - Example: `https://abc123.ngrok.io`
   - Use this URL to access your app with HTTPS

#### 🚀 Quick Setup Scripts
We provide setup scripts to make ngrok configuration easier:

**Linux/macOS:**
```bash
chmod +x setup-ngrok.sh
./setup-ngrok.sh
```

**Windows:**
```cmd
setup-ngrok.bat
```

These scripts will:
- Check if ngrok is installed
- Guide you through authentication
- Start the tunnel automatically
- Provide helpful instructions

### ngrok Configuration Options

#### Basic Setup
```bash
# Simple HTTP to HTTPS tunnel
ngrok http 3000
```

#### Custom Domain (ngrok Pro)
```bash
# Use custom subdomain
ngrok http 3000 --subdomain=myintercom
```

#### Authentication
```bash
# Add basic auth
ngrok http 3000 --basic-auth="username:password"
```

#### Custom Headers
```bash
# Add custom headers
ngrok http 3000 --header="X-Custom-Header: value"
```

### Alternative HTTPS Solutions

#### 1. **Self-Signed Certificates**
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Update server.js to use HTTPS
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(3000);
```

#### 2. **Let's Encrypt (Free SSL)**
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Use in your application
```

#### 3. **Reverse Proxy (Nginx/Apache)**
```nginx
# Nginx configuration
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Environment-Specific Setup

#### Development
- **localhost**: Microphone works without HTTPS
- **Local IP**: May require HTTPS depending on browser
- **No external access**: Perfect for testing

#### Production
- **Public domain**: HTTPS required
- **ngrok**: Quick HTTPS setup
- **SSL certificates**: Proper production setup

#### Testing
- **Multiple devices**: Use ngrok for external access
- **Mobile testing**: HTTPS required for mobile browsers
- **Cross-origin**: HTTPS resolves CORS issues

### Troubleshooting HTTPS Issues

#### Common Problems
1. **Mixed Content**: Ensure all resources use HTTPS
2. **Certificate Errors**: Check certificate validity
3. **CORS Issues**: Configure proper headers
4. **ngrok Limits**: Free tier has connection limits

#### Solutions
```bash
# Check ngrok status
ngrok status

# View ngrok logs
ngrok http 3000 --log=stdout

# Restart ngrok tunnel
ngrok http 3000 --region=us
```

### Security Considerations

#### ngrok Security
- **Public exposure**: Your local server becomes publicly accessible
- **Authentication**: Consider adding basic auth
- **Firewall**: Ensure only necessary ports are exposed
- **Monitoring**: Monitor ngrok logs for suspicious activity

#### Production Security
- **SSL certificates**: Use valid certificates
- **Domain verification**: Verify domain ownership
- **Access control**: Implement proper authentication
- **Rate limiting**: Prevent abuse

## 📖 Usage Guide

### 🎯 **Getting Started**

1. **Set Device Name**
   - Enter a custom name for your device in the "Device Name" field
   - Click "Save Name" to apply changes
   - Your device name will be visible to other users

2. **Start Discovery**
   - Click "Start Discovery" to find other devices on your network
   - Other devices running the app will appear in the "Available Peers" list
   - Each peer shows their device name, IP address, and connection ID

3. **Make a Call**
   - Click "Call" next to any discovered peer
   - The other user will receive a call notification
   - Once connected, you can communicate via voice

### 🎵 **Audio Controls**

- **Test Audio**: Click to verify your speakers are working
- **Diagnose**: Run comprehensive audio system diagnostics
- **Debug Connections**: View WebRTC connection states
- **Volume Slider**: Control incoming audio volume

### 🔍 **Troubleshooting**

- **Audio Issues**: Use the built-in diagnostic tools
- **Connection Problems**: Check the "Debug Connections" button
- **Microphone Access**: Ensure browser permissions are granted
- **Network Issues**: Verify local network connectivity

## 🛠️ Development

### Project Structure
```
Tradelink-intercom/
├── src/
│   ├── app.js              # Main application logic
│   ├── server.js           # Socket.IO server
│   ├── index.html          # Main application UI
│   ├── styles.css          # Application styles
│   ├── test-audio.html     # Audio testing interface
│   ├── test-mic.html       # Microphone testing interface
│   ├── service-worker.js   # PWA service worker
│   └── manifest.json       # PWA manifest
├── electron/               # Electron app assets
├── package.json            # Project dependencies
└── README.md              # This file
```

### Available Scripts

```bash
# Development server with hot reload
bun run dev

# Build the application
bun run build

# Start production server
bun run start

# Clean build artifacts
bun run clean
```

### Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js with Express
- **Real-time Communication**: Socket.IO
- **Voice Communication**: WebRTC
- **Package Manager**: Bun (with npm fallback)
- **PWA**: Service Worker, Web App Manifest

## 🌐 Network Requirements

### Local Network
- **Same subnet**: All devices must be on the same local network
- **Firewall**: Ensure ports 3000 (HTTP) and WebRTC ports are open
- **Router**: No special configuration required for most home routers

### WebRTC Ports
The application uses standard WebRTC ports:
- **UDP 3478**: STUN server communication
- **UDP 49152-65535**: Dynamic port range for media streaming

## 🔒 Security & Privacy

### Local Network Only
- **No external servers**: All communication stays on your local network
- **Peer-to-peer**: Direct device-to-device communication
- **No data logging**: No voice data is stored or transmitted externally

### Browser Permissions
- **Microphone access**: Required for voice communication
- **Local storage**: Used for device name persistence
- **Network access**: Required for peer discovery

## 🐛 Troubleshooting

### Common Issues

#### Audio Not Working
1. **Check permissions**: Ensure microphone access is allowed
2. **Test audio**: Use the "Test Audio" button
3. **Run diagnostics**: Click "Diagnose" for detailed analysis
4. **Check volume**: Verify system and browser volume settings
5. **HTTPS requirement**: Ensure you're using HTTPS in production

#### Can't Find Peers
1. **Network discovery**: Ensure "Start Discovery" is clicked
2. **Same network**: Verify all devices are on the same local network
3. **Firewall**: Check if firewall is blocking connections
4. **Router settings**: Ensure local network discovery is enabled
5. **HTTPS mismatch**: Ensure all devices use the same protocol (HTTP vs HTTPS)

#### Connection Issues
1. **Debug connections**: Use "Debug Connections" button
2. **Check console**: Look for error messages in browser console
3. **Restart discovery**: Stop and restart network discovery
4. **Refresh page**: Try refreshing the application
5. **ngrok tunnel**: Check if ngrok tunnel is still active

#### HTTPS and ngrok Issues
1. **Tunnel expired**: Restart ngrok tunnel
2. **Certificate errors**: Check ngrok status and logs
3. **Connection limits**: Free ngrok has connection limits
4. **Mixed content**: Ensure all resources use HTTPS
5. **CORS errors**: Check server CORS configuration

### Browser Compatibility

| Browser | Version | Status | HTTPS Required |
|---------|---------|---------|----------------|
| Chrome | 60+ | ✅ Full Support | Production only |
| Firefox | 55+ | ✅ Full Support | Production only |
| Edge | 79+ | ✅ Full Support | Production only |
| Safari | 11+ | ✅ Full Support | Production only |

### HTTPS Requirements by Environment

| Environment | HTTPS Required | Solution |
|-------------|----------------|----------|
| **localhost** | ❌ No | Works out of the box |
| **Local IP** | ⚠️ Maybe | Depends on browser |
| **Public Domain** | ✅ Yes | SSL certificate or ngrok |
| **Mobile Testing** | ✅ Yes | ngrok recommended |
| **Production** | ✅ Yes | Proper SSL setup |

## 📱 PWA Features

### Installation
- **Desktop**: Look for the install prompt in the address bar
- **Mobile**: Add to home screen from browser menu
- **Offline**: Basic functionality works without internet connection

### Service Worker
- **Caching**: App resources are cached for offline use
- **Updates**: Automatic updates when new versions are available
- **Background sync**: Handles network requests in background

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- **JavaScript**: ES6+ with modern syntax
- **CSS**: BEM methodology for class naming
- **HTML**: Semantic HTML5 elements
- **Comments**: Clear, descriptive comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **WebRTC**: For real-time communication capabilities
- **Socket.IO**: For reliable real-time networking
- **Bun**: For fast JavaScript runtime and package management
- **PWA**: For modern web app capabilities

## 📞 Support

### Getting Help
1. **Check troubleshooting**: Review the troubleshooting section above
2. **Console logs**: Look for error messages in browser console
3. **Audio diagnostics**: Use built-in diagnostic tools
4. **GitHub issues**: Report bugs or request features

### Feature Requests
- **Audio quality**: Request specific audio improvements
- **UI enhancements**: Suggest interface improvements
- **Network features**: Propose additional networking capabilities
- **Platform support**: Request support for additional platforms

---

**Built with ❤️ for seamless local network communication**

*Tradelink Intercom - Making local voice communication simple and reliable*
