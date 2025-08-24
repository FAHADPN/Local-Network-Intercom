# Audio Troubleshooting Guide - Tradelink Intercom

## Quick Fixes

### 1. Check Basic Audio Settings
- **System Volume**: Ensure your system volume is not muted and is set to an audible level
- **Browser Volume**: Check if the browser tab is muted (look for the speaker icon in the tab)
- **Device Selection**: Verify the correct audio output device is selected in your system settings

### 2. Browser Permissions
- **Microphone Access**: Allow microphone access when prompted by the browser
- **Site Permissions**: Check browser settings to ensure microphone access is allowed for this site
- **HTTPS Requirement**: Audio may not work on HTTP sites (localhost is an exception)

### 3. Refresh and Restart
- **Refresh Page**: Try refreshing the page to reinitialize audio components
- **Restart Browser**: Close and reopen your browser completely
- **Clear Cache**: Clear browser cache and cookies

## Using the Built-in Tools

### Test Audio Button
Click the **"Test Audio"** button to play a test tone. If you hear a beep, your speakers are working.

### Diagnose Button
Click the **"Diagnose"** button to run a comprehensive audio system check. Check the browser console for detailed results.

### Audio Test Page
Visit `/test-audio` for a dedicated audio testing interface that can help isolate issues.

## Common Issues and Solutions

### Issue: "Microphone: Not connected"
**Symptoms**: Microphone status shows as disconnected
**Solutions**:
1. Check if microphone is physically connected
2. Allow microphone access when prompted
3. Check browser permissions
4. Try a different browser

### Issue: Can't hear incoming audio
**Symptoms**: Microphone works but no sound from speakers
**Solutions**:
1. Use the "Test Audio" button to verify speaker output
2. Check system volume and audio device selection
3. Ensure the volume slider is not set to 0
4. Check if audio is being routed to the wrong device

### Issue: Audio is distorted or choppy
**Symptoms**: Audio quality is poor or intermittent
**Solutions**:
1. Check network connection quality
2. Close other applications using audio
3. Try reducing system audio quality settings
4. Check for audio driver updates

### Issue: "AudioContext not supported"
**Symptoms**: Audio initialization fails
**Solutions**:
1. Update to a modern browser (Chrome, Firefox, Edge, Safari)
2. Enable Web Audio API in browser settings
3. Check if audio is disabled in browser flags

### Issue: "getUserMedia not supported"
**Symptoms**: Microphone access fails
**Solutions**:
1. Use HTTPS (required for production)
2. Update browser to latest version
3. Check browser security settings

## Browser-Specific Issues

### Chrome/Chromium
- Check `chrome://settings/content/microphone`
- Ensure microphone access is allowed
- Check `chrome://flags` for audio-related settings

### Firefox
- Check `about:preferences#privacy` → Permissions → Microphone
- Look for microphone permission prompts
- Check `about:config` for media settings

### Edge
- Check `edge://settings/content/microphone`
- Ensure microphone access is allowed
- Check for Windows audio settings

### Safari
- Check Safari → Preferences → Websites → Microphone
- Ensure microphone access is allowed
- Check system preferences for microphone access

## System-Level Troubleshooting

### Windows
1. **Sound Settings**: Right-click speaker icon → Open Sound settings
2. **Device Manager**: Check for audio driver issues
3. **Privacy Settings**: Settings → Privacy → Microphone
4. **App Permissions**: Ensure browser has microphone access

### macOS
1. **System Preferences**: System Preferences → Sound
2. **Security & Privacy**: System Preferences → Security & Privacy → Microphone
3. **Audio MIDI Setup**: Applications → Utilities → Audio MIDI Setup

### Linux
1. **PulseAudio**: Check `pavucontrol` for audio routing
2. **ALSA**: Check `alsamixer` for audio levels
3. **Permissions**: Ensure user is in `audio` group

## Advanced Troubleshooting

### Check Browser Console
Open Developer Tools (F12) and look for error messages in the Console tab. Common errors include:
- `NotAllowedError`: Permission denied
- `NotFoundError`: Device not found
- `NotSupportedError`: Feature not supported
- `NotReadableError`: Device in use

### Audio Device Enumeration
Use the diagnostic tools to see all available audio devices:
1. Click "Diagnose" button
2. Check console for device list
3. Verify correct devices are detected

### Network Issues
- Check firewall settings
- Ensure WebRTC ports are not blocked
- Verify STUN server connectivity

### Performance Issues
- Close unnecessary browser tabs
- Disable browser extensions that might interfere
- Check system resource usage

## Testing Steps

### Step 1: Basic Audio Test
1. Open the application
2. Click "Test Audio" button
3. Listen for test tone
4. If no sound, check system volume

### Step 2: Microphone Test
1. Click "Test Microphone" button
2. Allow microphone access
3. Speak into microphone
4. Check if status shows "Connected"

### Step 3: Full Diagnostic
1. Click "Diagnose" button
2. Check console for detailed report
3. Address any issues found
4. Re-run diagnostic if needed

### Step 4: Call Test
1. Start discovery to find peers
2. Initiate a call
3. Test both microphone and speaker
4. Check call quality

## Getting Help

If you're still experiencing issues:

1. **Check Console Logs**: Look for error messages in browser console
2. **Run Diagnostics**: Use the built-in diagnostic tools
3. **Test in Different Browser**: Try a different browser to isolate the issue
4. **Check System Audio**: Verify audio works in other applications
5. **Report Issues**: Include browser version, OS, and error messages

## Prevention

- Keep browsers updated to latest versions
- Regularly check audio device connections
- Monitor system audio settings
- Use quality audio equipment
- Maintain stable network connections

---

**Note**: This application uses WebRTC for peer-to-peer audio communication. Audio quality depends on network conditions, device capabilities, and browser implementation.
