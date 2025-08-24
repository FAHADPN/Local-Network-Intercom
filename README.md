# 🎤 Tradelink Intercom

A Progressive Web App (PWA) for voice communication over local networks, similar to an intercom system. This application allows two or more computers on the same local network to communicate via voice using WebRTC technology.

## ✨ Features

- **🔍 Network Discovery**: Automatically discover other computers on your local network
- **📞 Voice Communication**: High-quality voice calls using WebRTC
- **📱 PWA Support**: Install as a desktop/mobile app for offline access
- **🌐 Local Network**: Works entirely within your local network (no external servers)
- **🎛️ Audio Controls**: Microphone permissions and volume control
- **📊 Real-time Status**: Live connection status and call information
- **🎨 Modern UI**: Responsive design with dark mode support

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) package manager (recommended) or Node.js
- Modern web browser with WebRTC support
- Microphone access permissions
- Computers on the same local network

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Tradelink-intercom
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start the development server**
   ```bash
   bun run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000` in your web browser

### Building for Production

```bash
# Build the application
bun run build

# Start production server
bun run start
```

## 📖 Usage Guide

### First Time Setup

1. **Open the application** in your web browser
2. **Allow microphone access** when prompted
3. **Start network discovery** to find other computers
4. **Wait for peers to appear** in the Available Peers section

### Making a Call

1. **Ensure discovery is running** on both computers
2. **Click "Call"** next to the desired peer
3. **Wait for the other party** to accept the call
4. **Speak naturally** - your voice will be transmitted in real-time

### Receiving a Call

1. **Answer incoming calls** when prompted
2. **Grant microphone permissions** if not already given
3. **Enjoy the conversation** with crystal-clear audio

### Network Discovery

- **Start Discovery**: Begins searching for other computers on the network
- **Stop Discovery**: Halts the discovery process
- **Peer List**: Shows all discovered computers with their hostnames and IP addresses

## 🏗️ Architecture

### Frontend (PWA)
- **HTML5**: Semantic markup with PWA meta tags
- **CSS3**: Modern styling with responsive design and dark mode
- **JavaScript**: ES6+ classes with WebRTC implementation
- **Service Worker**: Offline functionality and caching

### Backend (Server)
- **Express.js**: HTTP server with REST API endpoints
- **Socket.IO**: Real-time WebSocket communication
- **Network Discovery**: Automatic peer detection on local networks

### Communication Protocol
- **WebRTC**: Peer-to-peer voice streaming
- **STUN Servers**: Network traversal for NAT/firewall compatibility
- **ICE Candidates**: Connection establishment between peers

## 🔧 Configuration

### Environment Variables

```bash
PORT=3000                    # Server port (default: 3000)
NODE_ENV=production         # Environment mode
```

### Network Settings

The application automatically detects your local network configuration:
- **IP Address**: Your computer's local IP address
- **Network Range**: CIDR notation of your local network
- **Interface**: Network interface being used

## 📱 PWA Installation

### Desktop Installation
1. Open the application in Chrome/Edge
2. Click the install icon in the address bar
3. Follow the installation prompts
4. Access from your desktop/start menu

### Mobile Installation
1. Open in Safari (iOS) or Chrome (Android)
2. Tap "Add to Home Screen"
3. The app will appear as a native app icon
4. Launch from your home screen

## 🌐 Network Requirements

### Local Network Setup
- **Same Subnet**: All computers must be on the same local network
- **Firewall**: Ensure port 3000 is accessible on your local network
- **Router**: No special router configuration required
- **Bandwidth**: Minimal bandwidth usage (voice-only communication)

### Security Considerations
- **Local Only**: Communication stays within your local network
- **No External Servers**: All data remains private
- **HTTPS**: Consider using HTTPS for production deployments
- **Firewall**: Restrict access to trusted local networks only

## 🐛 Troubleshooting

### Common Issues

#### Microphone Not Working
- Check browser permissions for microphone access
- Ensure microphone is not being used by other applications
- Try refreshing the page and granting permissions again

#### No Peers Discovered
- Verify both computers are on the same local network
- Check firewall settings on both computers
- Ensure the discovery process is running on both sides
- Check browser console for error messages

#### Call Quality Issues
- Check network bandwidth and latency
- Ensure stable local network connection
- Try reducing background network usage
- Check microphone quality and positioning

#### Connection Problems
- Verify server is running on the correct port
- Check network connectivity between computers
- Ensure no antivirus/firewall is blocking connections
- Try using different network interfaces

### Debug Mode

Enable debug logging in the browser console:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
location.reload();
```

## 🔮 Future Enhancements

- **Video Support**: Add video calling capabilities
- **Group Calls**: Support for multiple participants
- **File Sharing**: Secure file transfer between peers
- **Chat**: Text messaging alongside voice
- **Recording**: Call recording functionality
- **Mobile Apps**: Native iOS/Android applications
- **End-to-End Encryption**: Enhanced security features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **WebRTC**: Real-time communication technology
- **Socket.IO**: WebSocket implementation
- **Express.js**: Web application framework
- **PWA Standards**: Progressive Web App specifications

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the browser console for error messages
- Ensure all prerequisites are met

---

**Happy Communicating! 🎤✨**
