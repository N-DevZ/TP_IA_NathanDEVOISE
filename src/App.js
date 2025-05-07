import React, { useState, useEffect, useRef } from 'react';
import JsSIP from 'jssip';

JsSIP.debug.enable('JsSIP:*');

function App({ username, password, callTo }) {
  const [userAgent, setUserAgent] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState('');
  const [callStatus, setCallStatus] = useState('');
  const [session, setSession] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    // Check media permissions
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then(stream => {
        console.log('Permissions granted for audio and video');
        // Optionally, you can set the local video stream here
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(error => {
        console.error('Error accessing media devices:', error);
      });

    // SIP configuration
    const socket = new JsSIP.WebSocketInterface('ws://192.168.1.28:5066');
    const configuration = {
      sockets: [socket],
      uri: `sip:${username}@192.168.1.28:5080`,
      password: password,
      sessionTimersExpires: 600,
      register: true,
      registrar_server: 'sip:192.168.1.28:5080'
    };

    const ua = new JsSIP.UA(configuration);

    ua.on('connected', () => console.log(`${username} connected to FreeSWITCH server`));
    ua.on('disconnected', () => setRegistrationStatus('Disconnected'));
    ua.on('registered', () => setRegistrationStatus('Registered'));
    ua.on('unregistered', () => setRegistrationStatus('Unregistered'));
    ua.on('registrationFailed', (e) => setRegistrationStatus(`Registration failed: ${e.cause}`));

    ua.on('newRTCSession', (data) => {
      const newSession = data.session;

      if (newSession.direction === 'incoming') {
        setIncomingCall(newSession);
        setCallStatus('Incoming call');
      }

      newSession.on('accepted', () => {
        console.log('Call accepted');
        setCallStatus('Call in progress');
      });
      newSession.on('confirmed', () => {
        console.log('Call confirmed');
      });
      newSession.on('ended', () => {
        console.log('Call ended');
        setCallStatus('Call ended');
        setSession(null);
        setIncomingCall(null);
      });
      newSession.on('failed', (e) => {
        console.error('Call failed:', e);
        setCallStatus(`Call failed: ${e.cause}`);
        setSession(null);
        setIncomingCall(null);
      });

      newSession.connection.addEventListener('track', (event) => {
        const [remoteStream] = event.streams;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        event.streams[0].getTracks().forEach(track => {
          console.log(`Remote track added: ${track.kind}`);
          track.onended = () => console.log(`Remote ${track.kind} track ended`);
          track.onmute = () => console.log(`Remote ${track.kind} track muted`);
          track.onunmute = () => console.log(`Remote ${track.kind} track unmuted`);
        });
      });

      newSession.on('iceconnectionstatechange', () => {
        console.log('ICE connection state:', newSession.connection.iceConnectionState);
      });

      newSession.on('peerconnection', (e) => {
        console.log('Peer connection event:', e.type);
        e.peerconnection.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('ICE candidate:', event.candidate);
          }
        };
        e.peerconnection.oniceconnectionstatechange = () => {
          console.log('ICE connection state:', e.peerconnection.iceConnectionState);
        };
      });
    });

    setUserAgent(ua);
    ua.start();

    return () => {
      ua.stop();
    };
  }, [username, password]);

  const handleCall = async () => {
    if (!userAgent) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    localVideoRef.current.srcObject = stream;

    const options = {
      mediaStream: stream, // 👈 IMPORTANT : donner le flux ici
      mediaConstraints: { audio: true, video: true },
      pcConfig: {
        iceServers: [
          { urls: ['stun:stun.freeswitch.org'] },
        ],
        iceTransportPolicy: 'all',
      },
      rtcOfferConstraints: {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
      },
      sessionTimersExpires: 600
    };

    console.log('Initiating call to:', `sip:${callTo}@192.168.1.28:5080`);
    const newSession = userAgent.call(`sip:${callTo}@192.168.1.28:5080`, options);
    setSession(newSession);
    setCallStatus('Calling...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      console.log('Local media stream obtained');
      localVideoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const handleAnswer = async () => {
    if (incomingCall) {
      console.log('Answering incoming call');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localVideoRef.current.srcObject = stream;
      incomingCall.answer({
        mediaStream: stream,
        mediaConstraints: { audio: true, video: true },
        pcConfig: {
          iceServers: [
            { urls: ['stun:stun.freeswitch.org'] },
          ],
          iceTransportPolicy: 'all',
        },
        rtcAnswerConstraints: {
          offerToReceiveAudio: 1,
          offerToReceiveVideo: 1
        },
        sessionTimersExpires: 600
      });
      setSession(incomingCall);
      setIncomingCall(null);
    }
  };

  const handleReject = () => {
    if (incomingCall) {
      console.log('Rejecting incoming call');
      incomingCall.terminate();
      setIncomingCall(null);
    }
  };

  const handleHangup = () => {
    if (session) {
      console.log('Hanging up call');
      session.terminate();
    }
  };

  return (
    <div>
      <h2>{username}</h2>
      <p>Status: {registrationStatus}</p>
      <p>Call Status: {callStatus}</p>
      {!incomingCall && <button onClick={handleCall}>Call {callTo}</button>}
      {incomingCall && (
        <>
          <button onClick={handleAnswer}>Answer</button>
          <button onClick={handleReject}>Reject</button>
        </>
      )}
      <button onClick={handleHangup}>Hang up</button>
      <div>
        <h3>Local Video</h3>
        <video ref={localVideoRef} autoPlay muted style={{ width: '320px' }}></video>
      </div>
      <div>
        <h3>Remote Video</h3>
        <video ref={remoteVideoRef} autoPlay style={{ width: '320px' }}></video>
      </div>
    </div>
  );
}

export default App;