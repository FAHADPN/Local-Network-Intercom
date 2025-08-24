const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'src')));
app.use(express.static(path.join(__dirname, '..')));

// Store connected clients and their discovery status
const clients = new Map();
const discoveryGroups = new Map();

// Get local network information
function getLocalNetworkInfo() {
    const interfaces = os.networkInterfaces();
    const localNetworks = [];
    
    for (const [name, nets] of Object.entries(interfaces)) {
        for (const net of nets) {
            // Skip internal and non-IPv4 addresses
            if (net.family === 'IPv4' && !net.internal) {
                const network = {
                    name: name,
                    address: net.address,
                    netmask: net.netmask,
                    cidr: getCIDR(net.netmask),
                    network: getNetworkAddress(net.address, net.netmask)
                };
                localNetworks.push(network);
            }
        }
    }
    
    return localNetworks;
}

function getCIDR(netmask) {
    return netmask.split('.').reduce((acc, octet) => {
        return acc + (octet >>> 0).toString(2).replace(/0/g, '').length;
    }, 0);
}

function getNetworkAddress(ip, netmask) {
    const ipParts = ip.split('.').map(Number);
    const maskParts = netmask.split('.').map(Number);
    
    return ipParts.map((part, i) => part & maskParts[i]).join('.');
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Register client
    socket.on('register', (data) => {
        const clientInfo = {
            id: socket.id,
            hostname: data.hostname || 'Unknown Computer',
            userAgent: data.userAgent,
            ip: socket.handshake.address,
            connectedAt: new Date(),
            isDiscovering: false
        };
        
        clients.set(socket.id, clientInfo);
        console.log(`Client registered: ${clientInfo.hostname} (${clientInfo.ip})`);
        
        // Send local network information
        const localNetworks = getLocalNetworkInfo();
        socket.emit('networkInfo', { networks: localNetworks });
    });
    
    // Update device name
    socket.on('updateDeviceName', (data) => {
        const client = clients.get(socket.id);
        if (client) {
            const oldName = client.hostname;
            client.hostname = data.hostname || 'Unknown Computer';
            console.log(`Client ${socket.id} updated device name from "${oldName}" to "${client.hostname}"`);
            
            // Notify other discovering clients about the name change
            clients.forEach((otherClient, otherId) => {
                if (otherId !== socket.id && otherClient.isDiscovering) {
                    io.to(otherId).emit('peerUpdated', {
                        id: client.id,
                        hostname: client.hostname,
                        ip: client.ip
                    });
                }
            });
        }
    });
    
    // Start network discovery
    socket.on('startDiscovery', () => {
        const client = clients.get(socket.id);
        if (!client) return;
        
        client.isDiscovering = true;
        console.log(`Client ${client.hostname} started discovery`);
        
        // Add to discovery group
        if (!discoveryGroups.has(socket.id)) {
            discoveryGroups.set(socket.id, new Set());
        }
        
        // Notify other discovering clients about this client
        clients.forEach((otherClient, otherId) => {
            if (otherId !== socket.id && otherClient.isDiscovering) {
                // Send this client to other discovering clients
                io.to(otherId).emit('peerDiscovered', {
                    id: client.id,
                    hostname: client.hostname,
                    ip: client.ip
                });
                
                // Send other client to this client
                socket.emit('peerDiscovered', {
                    id: otherClient.id,
                    hostname: otherClient.hostname,
                    ip: otherClient.ip
                });
                
                // Add to each other's discovery groups
                discoveryGroups.get(socket.id).add(otherId);
                if (!discoveryGroups.has(otherId)) {
                    discoveryGroups.set(otherId, new Set());
                }
                discoveryGroups.get(otherId).add(socket.id);
            }
        });
    });
    
    // Stop network discovery
    socket.on('stopDiscovery', () => {
        const client = clients.get(socket.id);
        if (!client) return;
        
        client.isDiscovering = false;
        console.log(`Client ${client.hostname} stopped discovery`);
        
        // Remove from discovery groups
        discoveryGroups.forEach((group, groupId) => {
            group.delete(socket.id);
            if (group.size === 0) {
                discoveryGroups.delete(groupId);
            }
        });
        
        // Notify other clients that this client is no longer discovering
        clients.forEach((otherClient, otherId) => {
            if (otherId !== socket.id && otherClient.isDiscovering) {
                io.to(otherId).emit('peerLost', socket.id);
            }
        });
    });
    
    // Handle call signaling
    socket.on('offer', (data) => {
        console.log(`Offer from ${socket.id} to ${data.to}`);
        io.to(data.to).emit('offer', {
            from: socket.id,
            offer: data.offer
        });
    });
    
    socket.on('answer', (data) => {
        console.log(`Answer from ${socket.id} to ${data.to}`);
        io.to(data.to).emit('answer', {
            from: socket.id,
            answer: data.answer
        });
    });
    
    socket.on('iceCandidate', (data) => {
        console.log(`ICE candidate from ${socket.id} to ${data.to}`);
        io.to(data.to).emit('iceCandidate', {
            from: socket.id,
            candidate: data.candidate
        });
    });
    
    socket.on('callRequest', (data) => {
        console.log(`Call request from ${socket.id} to ${data.to}`);
        io.to(data.to).emit('callRequest', {
            from: socket.id,
            offer: data.offer
        });
    });
    
    socket.on('callAccepted', (data) => {
        console.log(`Call accepted by ${socket.id} to ${data.to}`);
        io.to(data.to).emit('callAccepted', {
            from: socket.id,
            answer: data.answer
        });
    });
    
    socket.on('callRejected', (data) => {
        console.log(`Call rejected by ${socket.id} to ${data.to}`);
        io.to(data.to).emit('callRejected', {
            from: socket.id
        });
    });
    
    socket.on('callEnded', (data) => {
        console.log(`Call ended by ${socket.id} to ${data.to}`);
        io.to(data.to).emit('callEnded', {
            from: socket.id
        });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        
        const client = clients.get(socket.id);
        if (client) {
            console.log(`Client ${client.hostname} disconnected`);
            
            // Remove from discovery groups
            discoveryGroups.forEach((group, groupId) => {
                group.delete(socket.id);
                if (group.size === 0) {
                    discoveryGroups.delete(groupId);
                }
            });
            
            // Notify other discovering clients
            clients.forEach((otherClient, otherId) => {
                if (otherId !== socket.id && otherClient.isDiscovering) {
                    io.to(otherId).emit('peerLost', socket.id);
                }
            });
            
            clients.delete(socket.id);
        }
    });
});

// API endpoints
app.get('/api/status', (req, res) => {
    const status = {
        connectedClients: clients.size,
        discoveryGroups: discoveryGroups.size,
        uptime: process.uptime(),
        localNetworks: getLocalNetworkInfo()
    };
    res.json(status);
});

app.get('/api/clients', (req, res) => {
    const clientsList = Array.from(clients.values()).map(client => ({
        id: client.id,
        hostname: client.hostname,
        ip: client.ip,
        connectedAt: client.connectedAt,
        isDiscovering: client.isDiscovering
    }));
    res.json(clientsList);
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve PWA manifest
app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'manifest.json'));
});

// Serve service worker
app.get('/service-worker.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'service-worker.js'));
});

// Serve microphone test page
app.get('/test-mic', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-mic.html'));
});

// Serve audio test page
app.get('/test-audio', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-audio.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Tradelink Intercom Server running on port ${PORT}`);
    console.log(`📱 PWA available at http://localhost:${PORT}`);
    console.log(`🌐 Network discovery enabled for local network`);
    
    const localNetworks = getLocalNetworkInfo();
    if (localNetworks.length > 0) {
        console.log('📡 Local networks detected:');
        localNetworks.forEach(network => {
            console.log(`   - ${network.name}: ${network.network}/${network.cidr}`);
        });
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
