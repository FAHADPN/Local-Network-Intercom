class IntercomApp {
    constructor() {
        this.socket = null;
        this.localStream = null;
        this.peerConnections = new Map();
        this.discoveredPeers = new Map();
        this.isDiscovering = false;
        this.currentCall = null;
        this.callTimer = null;
        this.callStartTime = null;
        this.audioContext = null;
        this.remoteAudioElements = new Map();
        this.speakerVolume = 0.5;
        this.deviceName = this.getDeviceName();
        
        this.initializeElements();
        this.initializeSocket();
        this.initializeAudio();
        this.bindEvents();
        this.detectNetworkInfo();
        this.loadDeviceName();
        this.populateDeviceInfo();
    }

    initializeElements() {
        // Network discovery elements
        this.startDiscoveryBtn = document.getElementById('startDiscovery');
        this.stopDiscoveryBtn = document.getElementById('stopDiscovery');
        this.localIPElement = document.getElementById('localIP');
        this.networkInfoElement = document.getElementById('networkInfo');
        this.peersListElement = document.getElementById('peersList');
        
        // Device identity elements
        this.deviceNameInput = document.getElementById('deviceName');
        this.saveDeviceNameBtn = document.getElementById('saveDeviceName');
        
        // Communication elements
        this.startCallBtn = document.getElementById('startCall');
        this.endCallBtn = document.getElementById('endCall');
        this.micStatusElement = document.getElementById('micStatus');
        this.volumeSlider = document.getElementById('volumeSlider');
        
        // Status elements
        this.connectionStatusElement = document.getElementById('connectionStatus');
        this.statusDotElement = document.querySelector('.status-dot');
        this.statusTextElement = document.querySelector('.status-text');
        this.callStatusElement = document.getElementById('callStatus');
        this.connectedPeerElement = document.getElementById('connectedPeer');
        this.callTimerElement = document.getElementById('callTimer');
    }

    async initializeSocket() {
        try {
            this.socket = io();
            this.setupSocketEvents();
            this.updateConnectionStatus(true);
        } catch (error) {
            console.error('Failed to connect to server:', error);
            this.updateConnectionStatus(false);
        }
    }

    setupSocketEvents() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.updateConnectionStatus(true);
            this.socket.emit('register', {
                hostname: this.deviceName,
                userAgent: navigator.userAgent
            });
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.updateConnectionStatus(false);
        });

        this.socket.on('peerDiscovered', (peer) => {
            console.log('Peer discovered:', peer);
            this.addDiscoveredPeer(peer);
        });

        this.socket.on('peerLost', (peerId) => {
            console.log('Peer lost:', peerId);
            this.removeDiscoveredPeer(peerId);
        });

        this.socket.on('peerUpdated', (peer) => {
            console.log('Peer updated:', peer);
            this.updateDiscoveredPeer(peer);
        });

        this.socket.on('callRequest', async (data) => {
            console.log('Incoming call from:', data.from);
            await this.handleIncomingCall(data);
        });

        this.socket.on('callAccepted', async (data) => {
            console.log('Call accepted by:', data.to);
            await this.handleCallAccepted(data);
        });

        this.socket.on('callRejected', (data) => {
            console.log('Call rejected by:', data.to);
            this.handleCallRejected(data);
        });

        this.socket.on('callEnded', (data) => {
            console.log('Call ended by:', data.from);
            this.handleCallEnded(data);
        });

        this.socket.on('iceCandidate', async (data) => {
            console.log('Received ICE candidate:', data);
            await this.handleIceCandidate(data);
        });

        this.socket.on('offer', async (data) => {
            console.log('Received offer:', data);
            await this.handleIncomingCallRequest(data);
        });

        this.socket.on('answer', async (data) => {
            console.log('Received answer:', data);
            await this.handleAnswer(data);
        });
    }

    async initializeAudio() {
        try {
            // Initialize audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Check if audio context is supported
            if (!this.audioContext) {
                throw new Error('AudioContext not supported in this browser');
            }
            
            // Request microphone access
            this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000,
                    channelCount: 1
                }
            });
            
            this.updateMicStatus(true);
            this.setupVolumeControl();
            
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Check audio tracks
            const audioTracks = this.localStream.getAudioTracks();
            if (audioTracks.length === 0) {
                throw new Error('No audio tracks found in microphone stream');
            }
            
            console.log('Audio initialized successfully');
            console.log('Audio context state:', this.audioContext.state);
            console.log('Audio tracks:', audioTracks.length);
            
        } catch (error) {
            console.error('Failed to access microphone:', error);
            this.updateMicStatus(false);
            
            if (error.name === 'NotAllowedError') {
                alert('Microphone access denied. Please allow microphone access and refresh the page.');
            } else if (error.name === 'NotFoundError') {
                alert('No microphone found. Please connect a microphone and refresh the page.');
            } else if (error.name === 'NotSupportedError') {
                alert('Audio capture not supported. Try using HTTPS or a different browser.');
            } else if (error.name === 'NotReadableError') {
                alert('Microphone is already in use by another application. Please close other apps using the microphone.');
            } else {
                alert(`Audio initialization failed: ${error.message}`);
            }
        }
    }

    setupVolumeControl() {
        this.volumeSlider.addEventListener('input', (e) => {
            this.speakerVolume = e.target.value / 100;
            this.updateRemoteAudioVolume();
        });
    }

    updateRemoteAudioVolume() {
        this.remoteAudioElements.forEach((audioElement) => {
            if (audioElement && !audioElement.paused) {
                audioElement.volume = this.speakerVolume;
            }
        });
    }

    createRemoteAudioElement(peerId) {
        // Remove existing audio element if any
        if (this.remoteAudioElements.has(peerId)) {
            const existingAudio = this.remoteAudioElements.get(peerId);
            existingAudio.remove();
        }

        // Create new audio element
        const audioElement = document.createElement('audio');
        audioElement.id = `remote-audio-${peerId}`;
        audioElement.controls = true;
        audioElement.autoplay = true;
        audioElement.volume = this.speakerVolume;
        audioElement.style.display = 'none'; // Hide by default, show when call starts
        
        // Add to DOM
        document.body.appendChild(audioElement);
        this.remoteAudioElements.set(peerId, audioElement);
        
        return audioElement;
    }

    bindEvents() {
        this.startDiscoveryBtn.addEventListener('click', () => this.startDiscovery());
        this.stopDiscoveryBtn.addEventListener('click', () => this.stopDiscovery());
        this.startCallBtn.addEventListener('click', () => this.startCall());
        this.endCallBtn.addEventListener('click', () => this.endCall());
        
        // Add test audio button event listener
        const testAudioBtn = document.getElementById('testAudio');
        if (testAudioBtn) {
            testAudioBtn.addEventListener('click', () => this.testAudioOutput());
        }
        
        // Add diagnose audio button event listener
        const diagnoseAudioBtn = document.getElementById('diagnoseAudio');
        if (diagnoseAudioBtn) {
            diagnoseAudioBtn.addEventListener('click', () => this.runAudioDiagnostics());
        }
        
        // Add debug connections button event listener
        const debugConnectionsBtn = document.getElementById('debugConnections');
        if (debugConnectionsBtn) {
            debugConnectionsBtn.addEventListener('click', () => this.logPeerConnectionStates());
        }
        
        // Add save device name button event listener
        if (this.saveDeviceNameBtn) {
            this.saveDeviceNameBtn.addEventListener('click', () => this.saveDeviceNameHandler());
        }
    }

    async detectNetworkInfo() {
        try {
            // Get local IP address using WebRTC
            const pc = new RTCPeerConnection();
            pc.createDataChannel('');
            pc.createOffer().then(offer => pc.setLocalDescription(offer));
            
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    const ip = event.candidate.candidate.split(' ')[4];
                    if (ip && ip.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
                        this.localIPElement.textContent = ip;
                        this.networkInfoElement.textContent = `Local Network (${ip.split('.')[0]}.${ip.split('.')[1]}.${ip.split('.')[2]}.0/24)`;
                    }
                }
            };
        } catch (error) {
            console.error('Failed to detect network info:', error);
            this.localIPElement.textContent = 'Unknown';
            this.networkInfoElement.textContent = 'Unknown';
        }
    }

    startDiscovery() {
        if (!this.socket || !this.socket.connected) {
            alert('Not connected to server. Please wait for connection.');
            return;
        }

        this.isDiscovering = true;
        this.socket.emit('startDiscovery');
        
        this.startDiscoveryBtn.disabled = true;
        this.stopDiscoveryBtn.disabled = false;
        
        // Clear existing peers
        this.discoveredPeers.clear();
        this.updatePeersList();
        
        console.log('Started network discovery');
    }

    stopDiscovery() {
        this.isDiscovering = false;
        this.socket.emit('stopDiscovery');
        
        this.startDiscoveryBtn.disabled = false;
        this.stopDiscoveryBtn.disabled = true;
        
        console.log('Stopped network discovery');
    }

    addDiscoveredPeer(peer) {
        this.discoveredPeers.set(peer.id, peer);
        this.updatePeersList();
        this.updateCallButtonState();
    }

    removeDiscoveredPeer(peerId) {
        this.discoveredPeers.delete(peerId);
        this.updatePeersList();
        this.updateCallButtonState();
    }

    updateDiscoveredPeer(peer) {
        if (this.discoveredPeers.has(peer.id)) {
            this.discoveredPeers.set(peer.id, peer);
            this.updatePeersList();
            this.updateCallButtonState();
        }
    }

    updatePeersList() {
        if (this.discoveredPeers.size === 0) {
            this.peersListElement.innerHTML = '<p class="no-peers">No peers discovered yet. Start discovery to find other computers.</p>';
            return;
        }

        this.peersListElement.innerHTML = '';
        this.discoveredPeers.forEach((peer, id) => {
            const peerElement = document.createElement('div');
            peerElement.className = 'peer-item';
            peerElement.innerHTML = `
                <div class="peer-info">
                    <div class="peer-name">${peer.hostname || 'Unknown Computer'}</div>
                    <div class="peer-details">
                        <span class="peer-ip">${peer.ip || 'Unknown IP'}</span>
                        <span class="peer-id">ID: ${id.substring(0, 8)}...</span>
                    </div>
                </div>
                <button class="btn btn-success" onclick="app.callPeer('${id}')" ${this.currentCall ? 'disabled' : ''}>
                    Call
                </button>
            `;
            this.peersListElement.appendChild(peerElement);
        });
    }

    updateCallButtonState() {
        this.startCallBtn.disabled = this.discoveredPeers.size === 0 || this.currentCall !== null;
    }

    async callPeer(peerId) {
        if (!this.localStream) {
            alert('Microphone not available. Please check permissions.');
            return;
        }

        const peer = this.discoveredPeers.get(peerId);
        if (!peer) return;

        try {
            this.currentCall = {
                peerId: peerId,
                peer: peer,
                isInitiator: true
            };

            // Create peer connection
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ]
            });

            this.peerConnections.set(peerId, pc);

            // Add local stream
            this.localStream.getTracks().forEach(track => {
                pc.addTrack(track, this.localStream);
            });

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    this.socket.emit('iceCandidate', {
                        to: peerId,
                        candidate: event.candidate
                    });
                }
            };

            // Create and send offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            this.socket.emit('offer', {
                to: peerId,
                offer: offer
            });

            this.updateCallUI();
            console.log('Call initiated to:', peer.hostname);

        } catch (error) {
            console.error('Failed to initiate call:', error);
            this.currentCall = null;
            alert('Failed to initiate call. Please try again.');
        }
    }

    async handleIncomingCall(data) {
        const peer = this.discoveredPeers.get(data.from);
        if (!peer) return;

        const accept = confirm(`Incoming call from ${peer.hostname || 'Unknown Computer'}. Accept?`);
        
        if (accept) {
            await this.acceptCall(data.from, data.offer);
        } else {
            this.socket.emit('callRejected', { to: data.from });
        }
    }

    async handleIncomingCallRequest(data) {
        try {
            console.log('Handling incoming call request from:', data.from);
            
            // Check if we already have a peer connection
            let pc = this.peerConnections.get(data.from);
            
            if (!pc) {
                // Create new peer connection for incoming call
                pc = new RTCPeerConnection({
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' }
                    ]
                });
                
                this.peerConnections.set(data.from, pc);
                
                // Add local stream
                if (this.localStream) {
                    this.localStream.getTracks().forEach(track => {
                        pc.addTrack(track, this.localStream);
                    });
                }
                
                // Create remote audio element
                const remoteAudio = this.createRemoteAudioElement(data.from);
                
                // Handle remote stream
                pc.ontrack = (event) => {
                    console.log('Remote stream received in incoming call request:', event.streams[0]);
                    if (event.streams && event.streams[0]) {
                        remoteAudio.srcObject = event.streams[0];
                        
                        // Ensure audio context is running
                        if (this.audioContext && this.audioContext.state === 'suspended') {
                            this.audioContext.resume();
                        }
                        
                        // Play the audio
                        remoteAudio.play().catch(error => {
                            console.error('Failed to play remote audio:', error);
                            // Show audio element for manual play
                            remoteAudio.style.display = 'block';
                            remoteAudio.controls = true;
                        });
                        
                        // Update volume
                        remoteAudio.volume = this.speakerVolume;
                    }
                };
                
                // Handle ICE candidates
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        this.socket.emit('iceCandidate', {
                            to: data.from,
                            candidate: event.candidate
                        });
                    }
                };
                
                // Handle connection state changes
                pc.onconnectionstatechange = () => {
                    console.log('Connection state changed:', pc.connectionState);
                    if (pc.connectionState === 'connected') {
                        console.log('WebRTC connection established');
                    } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                        console.log('WebRTC connection failed or disconnected');
                    }
                };
                
                // Handle ICE connection state changes
                pc.oniceconnectionstatechange = () => {
                    console.log('ICE connection state:', pc.iceConnectionState);
                };
            }
            
            // Set remote description
            await pc.setRemoteDescription(data.offer);
            console.log('Remote description set successfully');
            
            // Create and send answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            
            this.socket.emit('answer', {
                to: data.from,
                answer: answer
            });
            
            console.log('Answer sent successfully');
            
            // Update call status
            this.currentCall = {
                peerId: data.from,
                peer: this.discoveredPeers.get(data.from) || { hostname: 'Unknown Computer' },
                isInitiator: false
            };
            this.updateCallUI();
            
        } catch (error) {
            console.error('Failed to handle incoming call request:', error);
            alert(`Failed to handle incoming call: ${error.message}`);
        }
    }

    async acceptCall(peerId, offer) {
        try {
            console.log('Accepting call from:', peerId);
            
            this.currentCall = {
                peerId: peerId,
                peer: this.discoveredPeers.get(peerId),
                isInitiator: false
            };

            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ]
            });

            this.peerConnections.set(peerId, pc);

            // Add local stream
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    pc.addTrack(track, this.localStream);
                });
            }

            // Create remote audio element
            const remoteAudio = this.createRemoteAudioElement(peerId);

            // Handle remote stream
            pc.ontrack = (event) => {
                console.log('Remote stream received in acceptCall:', event.streams[0]);
                if (event.streams && event.streams[0]) {
                    remoteAudio.srcObject = event.streams[0];
                    
                    // Ensure audio context is running
                    if (this.audioContext && this.audioContext.state === 'suspended') {
                        this.audioContext.resume();
                    }
                    
                    // Play the audio
                    remoteAudio.play().catch(error => {
                        console.error('Failed to play remote audio:', error);
                        // Show audio element for manual play
                        remoteAudio.style.display = 'block';
                        remoteAudio.controls = true;
                    });
                    
                    // Update volume
                    remoteAudio.volume = this.speakerVolume;
                }
            };

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    this.socket.emit('iceCandidate', {
                        to: peerId,
                        candidate: event.candidate
                    });
                }
            };

            // Handle connection state changes
            pc.onconnectionstatechange = () => {
                console.log('Connection state changed:', pc.connectionState);
                if (pc.connectionState === 'connected') {
                    console.log('WebRTC connection established');
                } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                    console.log('WebRTC connection failed or disconnected');
                }
            };

            // Set remote description and create answer
            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            this.socket.emit('answer', {
                to: peerId,
                answer: answer
            });

            this.updateCallUI();
            console.log('Call accepted from:', this.currentCall.peer.hostname);

        } catch (error) {
            console.error('Failed to accept call:', error);
            this.currentCall = null;
            alert('Failed to accept call. Please try again.');
        }
    }



    async handleAnswer(data) {
        try {
            console.log('Handling answer from:', data.from);
            const pc = this.peerConnections.get(data.from);
            if (!pc) {
                console.error('No peer connection found for answer from:', data.from);
                return;
            }

            await pc.setRemoteDescription(data.answer);
            console.log('Remote description set from answer successfully');
            
        } catch (error) {
            console.error('Failed to set remote description from answer:', error);
        }
    }

    async handleIceCandidate(data) {
        try {
            console.log('Handling ICE candidate from:', data.from);
            const pc = this.peerConnections.get(data.from);
            if (!pc) {
                console.error('No peer connection found for ICE candidate from:', data.from);
                return;
            }

            await pc.addIceCandidate(data.candidate);
            console.log('ICE candidate added successfully');
            
        } catch (error) {
            console.error('Failed to add ICE candidate:', error);
        }
    }

    handleCallRejected(data) {
        alert('Call was rejected by the other party.');
        this.currentCall = null;
        this.updateCallUI();
    }

    handleCallEnded(data) {
        this.endCall();
    }

    endCall() {
        if (this.currentCall) {
            const peerId = this.currentCall.peerId;
            
            // Close peer connection
            const pc = this.peerConnections.get(peerId);
            if (pc) {
                pc.close();
                this.peerConnections.delete(peerId);
            }

            // Remove remote audio element
            if (this.remoteAudioElements.has(peerId)) {
                const audioElement = this.remoteAudioElements.get(peerId);
                audioElement.remove();
                this.remoteAudioElements.delete(peerId);
            }

            // Notify other party
            this.socket.emit('callEnded', { to: peerId });

            this.currentCall = null;
            this.updateCallUI();
            console.log('Call ended');
        }
    }

    updateCallUI() {
        console.log('Updating call UI, currentCall:', this.currentCall);
        
        if (this.currentCall) {
            this.callStatusElement.style.display = 'block';
            this.connectedPeerElement.textContent = this.currentCall.peer.hostname || 'Unknown Computer';
            this.startCallBtn.disabled = true;
            this.endCallBtn.disabled = false;
            this.startCallTimer();
            
            // Add visual feedback for active call
            document.body.classList.add('call-active');
            
            console.log('Call UI updated - Call active with:', this.currentCall.peer.hostname);
        } else {
            this.callStatusElement.style.display = 'none';
            this.startCallBtn.disabled = false;
            this.endCallBtn.disabled = true;
            this.stopCallTimer();
            
            // Remove visual feedback for active call
            document.body.classList.remove('call-active');
            
            console.log('Call UI updated - No active call');
        }
    }

    startCallTimer() {
        this.callStartTime = Date.now();
        this.callTimer = setInterval(() => {
            const elapsed = Date.now() - this.callStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.callTimerElement.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopCallTimer() {
        if (this.callTimer) {
            clearInterval(this.callTimer);
            this.callTimer = null;
        }
        this.callTimerElement.textContent = '00:00';
    }

    updateConnectionStatus(connected) {
        if (connected) {
            this.statusDotElement.classList.add('connected');
            this.statusTextElement.textContent = 'Connected';
        } else {
            this.statusDotElement.classList.remove('connected');
            this.statusTextElement.textContent = 'Disconnected';
        }
    }

    updateMicStatus(connected) {
        if (connected) {
            this.micStatusElement.textContent = 'Microphone: Connected';
            this.micStatusElement.style.color = '#10b981';
        } else {
            this.micStatusElement.textContent = 'Microphone: Not connected';
            this.micStatusElement.style.color = '#ef4444';
        }
    }

    // Add method to test audio output
    testAudioOutput() {
        try {
            if (!this.audioContext) {
                alert('Audio context not initialized. Please refresh the page.');
                return;
            }
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Create a simple test tone
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4 note
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);
            
            console.log('Audio output test completed');
            
            // Show success message
            const testBtn = document.getElementById('testAudio');
            if (testBtn) {
                const originalText = testBtn.textContent;
                testBtn.textContent = '✓ Audio Working!';
                testBtn.style.background = '#10b981';
                setTimeout(() => {
                    testBtn.textContent = originalText;
                    testBtn.style.background = '';
                }, 2000);
            }
            
        } catch (error) {
            console.error('Audio output test failed:', error);
            alert(`Audio test failed: ${error.message}`);
        }
    }

    // Add method to check audio devices
    async checkAudioDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(device => device.kind === 'audioinput');
            const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
            
            console.log('Audio input devices:', audioInputs);
            console.log('Audio output devices:', audioOutputs);
            
            return { audioInputs, audioOutputs };
        } catch (error) {
            console.error('Failed to enumerate audio devices:', error);
            return { audioInputs: [], audioOutputs: [] };
        }
    }

    // Add method to diagnose audio issues
    async diagnoseAudioIssues() {
        const issues = [];
        
        // Check audio context
        if (!this.audioContext) {
            issues.push('AudioContext not initialized');
        } else if (this.audioContext.state === 'suspended') {
            issues.push('AudioContext is suspended - user interaction required');
        }
        
        // Check microphone
        if (!this.localStream) {
            issues.push('No microphone stream available');
        } else {
            const audioTracks = this.localStream.getAudioTracks();
            if (audioTracks.length === 0) {
                issues.push('No audio tracks in microphone stream');
            }
        }
        
        // Check browser support
        if (!navigator.mediaDevices) {
            issues.push('MediaDevices API not supported');
        }
        
        if (!window.AudioContext && !window.webkitAudioContext) {
            issues.push('AudioContext not supported');
        }
        
        // Check for HTTPS requirement
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            issues.push('HTTPS required for audio in production');
        }
        
        return issues;
    }

    // Add method to log peer connection states
    logPeerConnectionStates() {
        console.log('=== Peer Connection States ===');
        this.peerConnections.forEach((pc, peerId) => {
            console.log(`Peer ${peerId}:`);
            console.log(`  Connection State: ${pc.connectionState}`);
            console.log(`  ICE Connection State: ${pc.iceConnectionState}`);
            console.log(`  ICE Gathering State: ${pc.iceGatheringState}`);
            console.log(`  Signaling State: ${pc.signalingState}`);
        });
        console.log('=============================');
    }

    // Add method to run audio diagnostics
    async runAudioDiagnostics() {
        try {
            const diagnoseBtn = document.getElementById('diagnoseAudio');
            if (diagnoseBtn) {
                diagnoseBtn.textContent = 'Running...';
                diagnoseBtn.disabled = true;
            }
            
            // Check audio devices
            const devices = await this.checkAudioDevices();
            
            // Diagnose issues
            const issues = await this.diagnoseAudioIssues();
            
            // Create diagnostic report
            let report = '=== Audio Diagnostic Report ===\n\n';
            
            // Device information
            report += `Audio Input Devices: ${devices.audioInputs.length}\n`;
            devices.audioInputs.forEach((device, index) => {
                report += `  ${index + 1}. ${device.label || 'Unknown Device'} (${device.deviceId})\n`;
            });
            
            report += `\nAudio Output Devices: ${devices.audioOutputs.length}\n`;
            devices.audioOutputs.forEach((device, index) => {
                report += `  ${index + 1}. ${device.label || 'Unknown Device'} (${device.deviceId})\n`;
            });
            
            // Issues found
            if (issues.length > 0) {
                report += '\nIssues Found:\n';
                issues.forEach(issue => {
                    report += `  ❌ ${issue}\n`;
                });
            } else {
                report += '\n✅ No issues detected\n';
            }
            
            // Audio context status
            if (this.audioContext) {
                report += `\nAudio Context Status: ${this.audioContext.state}\n`;
                report += `Sample Rate: ${this.audioContext.sampleRate}Hz\n`;
            }
            
            // Microphone status
            if (this.localStream) {
                const audioTracks = this.localStream.getAudioTracks();
                report += `\nMicrophone Tracks: ${audioTracks.length}\n`;
                audioTracks.forEach((track, index) => {
                    report += `  Track ${index + 1}: ${track.enabled ? 'Enabled' : 'Disabled'}\n`;
                });
            }
            
            // Show report in console and alert
            console.log(report);
            alert('Audio diagnostic completed. Check console for detailed report.');
            
        } catch (error) {
            console.error('Audio diagnostics failed:', error);
            alert(`Audio diagnostics failed: ${error.message}`);
        } finally {
            const diagnoseBtn = document.getElementById('diagnoseAudio');
            if (diagnoseBtn) {
                diagnoseBtn.textContent = 'Diagnose';
                diagnoseBtn.disabled = false;
            }
        }
    }

    // Add method to get device name
    getDeviceName() {
        const storedName = localStorage.getItem('deviceName');
        if (storedName) {
            return storedName;
        }
        
        // Generate a meaningful default name
        return this.generateDefaultDeviceName();
    }

    // Add method to generate default device name
    generateDefaultDeviceName() {
        const platform = navigator.platform;
        const userAgent = navigator.userAgent;
        
        if (platform.includes('Win')) {
            return 'Windows PC';
        } else if (platform.includes('Mac')) {
            return 'Mac Computer';
        } else if (platform.includes('Linux')) {
            return 'Linux Computer';
        } else if (userAgent.includes('Android')) {
            return 'Android Device';
        } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
            return 'iOS Device';
        } else {
            return 'Computer';
        }
    }

    // Add method to save device name
    saveDeviceName(name) {
        localStorage.setItem('deviceName', name);
        this.deviceName = name;
        
        // Update the server with the new device name
        if (this.socket && this.socket.connected) {
            this.socket.emit('updateDeviceName', { hostname: name });
        }
    }

    // Add method to load device name
    loadDeviceName() {
        if (this.deviceNameInput) {
            this.deviceNameInput.value = this.deviceName;
        }
        this.updateCurrentDeviceNameDisplay();
    }

    // Add method to update current device name display
    updateCurrentDeviceNameDisplay() {
        const currentDeviceNameElement = document.getElementById('currentDeviceName');
        if (currentDeviceNameElement) {
            currentDeviceNameElement.textContent = this.deviceName;
        }
    }

    // Add method to populate device info
    populateDeviceInfo() {
        // Platform info
        const platformElement = document.getElementById('devicePlatform');
        if (platformElement) {
            platformElement.textContent = navigator.platform || 'Unknown';
        }

        // Browser info
        const browserElement = document.getElementById('deviceBrowser');
        if (browserElement) {
            browserElement.textContent = this.getBrowserInfo();
        }

        // User Agent info
        const userAgentElement = document.getElementById('deviceUserAgent');
        if (userAgentElement) {
            userAgentElement.textContent = navigator.userAgent.substring(0, 100) + '...';
        }
    }

    // Add method to get browser information
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browserName = 'Unknown';
        
        if (userAgent.includes('Chrome')) {
            browserName = 'Chrome';
        } else if (userAgent.includes('Firefox')) {
            browserName = 'Firefox';
        } else if (userAgent.includes('Safari')) {
            browserName = 'Safari';
        } else if (userAgent.includes('Edge')) {
            browserName = 'Edge';
        } else if (userAgent.includes('Opera')) {
            browserName = 'Opera';
        }
        
        return browserName;
    }

    // Add method to handle save device name button click
    saveDeviceNameHandler() {
        const newDeviceName = this.deviceNameInput.value.trim();
        if (newDeviceName) {
            this.saveDeviceName(newDeviceName);
            this.loadDeviceName(); // Update the input field and display with the new name
            alert('Device name saved successfully!');
        } else {
            alert('Device name cannot be empty. Please enter a name.');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new IntercomApp();
});

// Handle PWA install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button or prompt
    console.log('PWA install prompt available');
});

// Handle PWA installation
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
});
