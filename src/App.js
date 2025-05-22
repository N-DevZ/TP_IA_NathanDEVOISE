import React, { useState, useEffect, useRef, useCallback } from 'react';
import JsSIP from 'jssip';
import LoginPage from './LoginPage';
import Settings from './Settings';
import Profile from './Profile';
import CustomTitleBar from './CustomTitleBar';
import './App.css';
import moment from 'moment-timezone';
import CallHistory from './CallHistory'; // Nous allons créer ce composant
import SideMenu from './SideMenu';
import defaultPhoto from './assets/pdp.png';
import './LoadingSpinner.css';
import LoadingSpinner from './LoadingSpinner';
import ContactDirectory from './ContactDirectory';
import { translations } from './translations';
import ReactCountryFlag from "react-country-flag"
import callIcon from './assets/call.png';
import videocallicon from './assets/videocall.png';
import hangupicon from './assets/hangup.png';
import enablevideoicon from './assets/enablevideo.png';
import disablevideoicon from './assets/disablevideo.png';
import enablemicroicon from './assets/enablemicro.png';
import disablemicroicon from './assets/disablemicro.png';


import { FaPhone, FaVideo } from 'react-icons/fa';

// Activation du débogage JsSIP
JsSIP.debug.enable('JsSIP:*');

// Initialisation de ipcRenderer pour Electron (si disponible)
let ipcRenderer;
if (window.require) {
  const electron = window.require('electron');
  ipcRenderer = electron.ipcRenderer;
}

function App() {
  // États pour gérer l'application
  const [userAgent, setUserAgent] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const [registrationStatus, setRegistrationStatus] = useState('');
  const [callStatus, setCallStatus] = useState('');
  const [session, setSession] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [username, setUsername] = useState('');
  const [callTo, setCallTo] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const availableLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'nl', 'ru', 'ja', 'ko', 'ar', 'zh', 'uk', 'pl', 'tr', 'vi', 'ro', 'sv', 'no', 'fi', 'el', 'hu', 'sr', 'id', 'ur', 'hr', 'is', 'et', 'lt', 'be', 'af'];

  const [token, setToken] = useState(null);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [isTestingVideo, setIsTestingVideo] = useState(false);
  const audioVisualizerRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
  const t = (key) => translations[language][key] || key;

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    color: '#000000',
    photo: null,
  });

  const languageToCountryCode = {
    'en': 'GB',
    'fr': 'FR',
    'es': 'ES',
    'de': 'DE',
    'it': 'IT',
    'pt': 'PT',
    'nl': 'NL',
    'ru': 'RU',
    'ja': 'JP',
    'ko': 'KR',
    'ar': 'SA',
    'zh': 'CN',
    'uk': 'UA',
    'pl': 'PL',
    'tr': 'TR',
    'vi': 'VN',
    'ro': 'RO',
    'sv': 'SE',
    'no': 'NO',
    'fi': 'FI',
    'el': 'GR',
    'hu': 'HU',
    'sr': 'RS',
    'id': 'ID',
    'ur': 'PK',
    'hr': 'HR',
    'is': 'IS',
    'et': 'EE',
    'lt': 'LT',
    'be': 'BY',
    'af': 'ZA'
  };
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const generateToken = useCallback(async () => {
    try {
      const response = await fetch('http://192.168.1.29:3000/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: 'my_client_id',
          client_secret: 'my_client_secret',
        }),
        credentials: 'include', // Ajout de cette ligne
        mode: 'cors'

      });

      if (!response.ok) {
        throw new Error('Failed to generate token');
      }

      const data = await response.json();
      setToken(data.access_token);
      console.log('Token generated successfully', data.access_token);
    } catch (error) {
      console.error('Error generating token:', error);
    }
  }, []);

  // Générer le token au lancement de l'application
  useEffect(() => {
    generateToken();
  }, [generateToken]);
  // Références pour les éléments vidéo
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  useEffect(() => {
    const token = localStorage.getItem('sessionToken');
    if (token) {
      // Vérifiez la validité du token ici

      setIsLoggedIn(true);
    }
  }, []);
  // Fonction de connexion
  const handleLogin = useCallback((extension, password) => {
    setUsername(extension);

    // Configuration SIP
    const socket = new JsSIP.WebSocketInterface('ws://192.168.1.29:5066');
    const configuration = {
      sockets: [socket],
      uri: `sip:${extension}@192.168.1.29:5070`,
      password: password,
      sessionTimersExpires: 600,
      register: true,
      registrar_server: 'sip:192.168.1.29',
      pcConfig: {
        iceServers: [
          { urls: ['stun:stun.freeswitch.org'] },
        ],
        iceTransportPolicy: 'all',
        iceCandidatePoolSize: 0,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
      },
      rtcpMuxPolicy: 'require',
      hackStripTcp: true,
      hackStripSsrc: true,
      iceCheckingTimeout: 5000 // Ajoute un timeout de 5 secondes pour la collecte des candidats ICE
    };

    const ua = new JsSIP.UA(configuration);
    setInterval(() => {
      if (ua.isRegistered()) {
        ua.sendOptions(`sip:${extension}@192.168.1.29:5070`);
      }
    }, 30000);
    // Gestion des événements de l'agent utilisateur
    ua.on('connected', () => {
      console.log(`${extension} connected to FreeSWITCH server`);
      setConnectionFailed(false);
    });
    ua.on('disconnected', () => {
      setRegistrationStatus('Disconnected');
      setConnectionFailed(true);
      console.log('Disconnected. Attempting to reconnect...');
      setTimeout(() => ua.register(), 5000); // Tente de se reconnecter après 5 secondes
    });
    ua.on('registered', () => {
      setRegistrationStatus('Registered');
      setIsLoggedIn(true);
      setConnectionFailed(false);
    });
    ua.on('unregistered', () => {
      setRegistrationStatus('Unregistered');
      setConnectionFailed(true);
    });
    ua.on('registrationFailed', (e) => {
      setRegistrationStatus(`Registration failed: ${e.cause}`);
      setConnectionFailed(true);
      console.error(`Login failed: ${e.cause}`);
      if (e.cause === 'Connection Error') {
        console.log('Connection error. Attempting to reconnect...');
        setTimeout(() => ua.register(), 5000); // Tente de se reconnecter après 5 secondes
      }
    });

    // Gestion des nouvelles sessions RTC
    // Fonction de gestion de la nouvelle session RTC
    ua.on('newRTCSession', (data) => {
      const newSession = data.session;

      if (newSession.direction === 'incoming') {
        setIncomingCall(newSession);
        setCallStatus('Incoming call');
      } else {
        setSession(newSession);
        setCallStatus('Outgoing call');
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
        setIsVideoEnabled(false);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      });

      newSession.on('failed', (e) => {
        console.error('Call failed:', e);
        setCallStatus(`Call failed: ${e.cause}`);
        setSession(null);
        setIncomingCall(null);
        setIsVideoEnabled(false);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      });

      newSession.on('peerconnection', (e) => {
        console.log('Peer connection event:', e.type);
        const peerconnection = e.peerconnection;

        // Ajout de l'événement 'icecandidate'
        peerconnection.addEventListener('icecandidate', (event) => {
          const candidate = event.candidate;

          if (!candidate) {
            // Si aucun candidat n'est trouvé, force l'envoi du SDP après 2000ms
            console.log('No more ICE candidates, forcing SDP emit after timeout');
            setTimeout(() => {
              if (newSession.iceGatheringState !== 'complete') {
                console.log('ICE Gathering timeout reached');
                // Force l'envoi du SDP
                const e = { originator: 'local', type: 'offer', sdp: newSession.localDescription.sdp };
                newSession.emit('sdp', e);
                setCallStatus('Call in progress');
              }
            }, 2000); // Timeout à 2 secondes
          }
        });

        peerconnection.ontrack = (event) => {
          console.log('Remote track added');
          const [remoteStream] = event.streams;
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        };
      });
    });


    setUserAgent(ua);
    ua.start();
  }, []);

  const attemptReconnection = useCallback(() => {
    if (userAgent && !userAgent.isRegistered()) {
      console.log('Attempting to reconnect...');
      userAgent.register();
    }
  }, [userAgent]);

  useEffect(() => {
    if (userAgent) {
      const reconnectionInterval = setInterval(attemptReconnection, 60000); // Tente de se reconnecter toutes les minutes
      return () => clearInterval(reconnectionInterval);
    }
  }, [userAgent, attemptReconnection]);
  useEffect(() => {
    if (userAgent) {
      const checkConnection = () => {
        if (userAgent.isConnected()) {
          setConnectionFailed(false);
        } else {
          setConnectionFailed(true);
        }
      };

      // Vérifiez la connexion toutes les 5 secondes
      const intervalId = setInterval(checkConnection, 5000);

      // Nettoyage
      return () => clearInterval(intervalId);
    }
  }, [userAgent]);
  // Nettoyage de l'agent utilisateur lors du démontage du composant
  useEffect(() => {
    return () => {
      if (userAgent) {
        userAgent.stop();
      }
    };
  }, [userAgent]);

  // Fonction pour initier un appel
  const handleCall = useCallback(async (withVideo = false) => {
    if (!userAgent || !callTo) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: withVideo
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const options = {
        mediaStream: stream,
        mediaConstraints: { audio: true, video: withVideo },
        pcConfig: {
          iceServers: [
            { urls: ['stun:stun.freeswitch.org'] },
          ],
          iceTransportPolicy: 'all',
        },
        rtcOfferConstraints: {
          offerToReceiveAudio: 1,
          offerToReceiveVideo: withVideo ? 1 : 0
        },
        sessionTimersExpires: 600
      };

      console.log('Initiating call to:', `sip:${callTo}@192.168.1.29:5070`);
      const newSession = userAgent.call(`sip:${callTo}@192.168.1.29:5070`, options);
      setSession(newSession);
      setCallStatus('Calling...');
      setIsVideoEnabled(withVideo);

      newSession.on('accepted', () => {
        console.log('Call accepted by remote party');
        setCallStatus('Call in progress');
      });

      newSession.on('confirmed', () => {
        console.log('Call confirmed');
      });

      newSession.connection.ontrack = (event) => {
        console.log('Remote track received in outgoing call');
        const [remoteStream] = event.streams;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  }, [userAgent, callTo]);
  const handleEdit = (field) => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({ ...profile });
  };

  const handleSave = () => {
    setProfile({ ...editedProfile });
    setIsEditing(false);
    // Ici, vous pouvez ajouter une logique pour sauvegarder les modifications sur le serveur
  };
  const handleTestMicrophone = async () => {
    setIsTestingMic(!isTestingMic);
    if (!isTestingMic) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: selectedAudioDevice }
        });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const canvas = audioVisualizerRef.current;
        const canvasCtx = canvas.getContext('2d');
        const draw = () => {
          requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);
          canvasCtx.fillStyle = 'rgb(200, 200, 200)';
          canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
          const barWidth = (canvas.width / bufferLength) * 2.5;
          let barHeight;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
            canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
            canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);
            x += barWidth + 1;
          }
        };
        draw();
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    }
  };

  const handleTestCamera = async () => {
    setIsTestingVideo(!isTestingVideo);
    if (!isTestingVideo) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedVideoDevice }
        });
        videoPreviewRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    } else {
      const stream = videoPreviewRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };
  const handleInputChange = (field, value) => {
    setEditedProfile({ ...editedProfile, [field]: value });
  };
  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };
  const toggleVideo = useCallback(() => {
    if (session) {
      const videoTrack = session.connection.getSenders()
        .find(sender => sender.track && sender.track.kind === 'video');
      if (videoTrack) {
        videoTrack.track.enabled = !videoTrack.track.enabled;
        setIsVideoEnabled(videoTrack.track.enabled);
      } else if (!isVideoEnabled) {
        // Si la vidéo n'est pas encore activée, on l'active
        handleCall(true);
      }
    }
  }, [session, isVideoEnabled, handleCall]);

  const toggleAudio = useCallback(() => {
    if (session) {
      const audioTrack = session.connection.getSenders()
        .find(sender => sender.track && sender.track.kind === 'audio');
      if (audioTrack) {
        audioTrack.track.enabled = !audioTrack.track.enabled;
        setIsAudioEnabled(audioTrack.track.enabled);
      }
    }
  }, [session]);

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);
      if (audioInputs.length > 0) setSelectedAudioDevice(audioInputs[0].deviceId);
      if (videoInputs.length > 0) setSelectedVideoDevice(videoInputs[0].deviceId);
    } catch (error) {
      console.error('Error getting devices:', error);
    }
  }, []);
  useEffect(() => {
    getDevices();
  }, [getDevices]);
  // Fonction pour répondre à un appel entrant
  const handleAnswer = useCallback(async () => {
    if (incomingCall) {
      console.log('Answering incoming call');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

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
        setIsVideoEnabled(true);
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    }
  }, [incomingCall]);

  // Fonction pour rejeter un appel entrant
  const handleReject = useCallback(() => {
    if (incomingCall) {
      console.log('Rejecting incoming call');
      incomingCall.terminate();
      setIncomingCall(null);
    }
  }, [incomingCall]);
  const fetchCallHistory = useCallback(async () => {
    if (token && username) {
      try {
        const response = await fetch(`http://192.168.1.29:3000/cdr/${username}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch call history');
        }
        const data = await response.json();
        setCallHistory(data);
      } catch (error) {
        console.error('Error fetching call history:', error);
      }
    }
  }, [token, username]);

  // Appeler fetchCallHistory après la connexion et après chaque appel
  useEffect(() => {
    if (isLoggedIn) {
      fetchCallHistory();
    }
  }, [isLoggedIn, fetchCallHistory]);
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      if (userAgent) {
        await new Promise((resolve, reject) => {
          userAgent.unregister();
          userAgent.once('unregistered', resolve);
          userAgent.once('registrationFailed', reject);

          // Ajoute un timeout au cas où l'unregister ne se termine pas
          const timeoutId = setTimeout(() => {
            reject(new Error('Unregister timeout'));
          }, 5000);

          // Nettoie le timeout si l'unregister se termine avant
          userAgent.once('unregistered', () => clearTimeout(timeoutId));
          userAgent.once('registrationFailed', () => clearTimeout(timeoutId));
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        await new Promise((resolve, reject) => {
          userAgent.register();
          userAgent.once('registered', resolve);
          userAgent.once('registrationFailed', reject);

          // Ajoute un timeout au cas où le register ne se termine pas
          const timeoutId = setTimeout(() => {
            reject(new Error('Register timeout'));
          }, 5000);

          // Nettoie le timeout si le register se termine avant
          userAgent.once('registered', () => clearTimeout(timeoutId));
          userAgent.once('registrationFailed', () => clearTimeout(timeoutId));
        });
      }
      await fetchCallHistory();
      setConnectionFailed(false);
      console.log('Application refreshed successfully');
    } catch (error) {
      console.error('Error refreshing application:', error);
      setConnectionFailed(true);
      // Tente de se reconnecter après une erreur
      setTimeout(() => userAgent.register(), 5000);
    } finally {
      setIsLoading(false);
    }
  }, [userAgent, fetchCallHistory]);
  // Fonction pour raccrocher
  const handleHangup = useCallback(async () => {
    if (session) {
      console.log('Hanging up call');
      session.terminate();

      // Insérer les données CDR
      if (token) {
        try {
          const now = new Date();

          const nowInFrance = moment().tz('Europe/Paris').add(2, 'hours');
          const utcNow = nowInFrance.clone().tz('UTC');

          const start_time = session.start_time
            ? moment(session.start_time).tz('Europe/Paris').add(2, 'hours').tz('UTC')
            : utcNow;
          const connect_time = session.connect_time
            ? moment(session.connect_time).tz('Europe/Paris').add(2, 'hours').tz('UTC')
            : utcNow;

          const cdrData = {
            local_ip_v4: '192.168.1.29', // Remplacez par l'IP réelle
            caller_id_name: session.remote_identity?.display_name || '',
            caller_id_number: session.remote_identity?.uri?.user || '',
            destination_number: session.local_identity?.uri?.user || '',
            context: 'default',
            start_stamp: start_time.toISOString(),
            answer_stamp: connect_time.toISOString(),
            end_stamp: utcNow.toISOString(),
            duration: Math.max(0, utcNow.diff(start_time, 'seconds')),
            billsec: Math.max(0, utcNow.diff(connect_time, 'seconds')),
            hangup_cause: session.cause || '',
            uuid: session.id || '',
            bleg_uuid: '',
            accountcode: '',
            read_codec: session.connection?.getReceivers()[0]?.track.getSettings().codec || '',
            write_codec: session.connection?.getSenders()[0]?.track.getSettings().codec || '',
            sip_hangup_disposition: '',
            ani: session.local_identity?.uri?.user || '',
          };

          const response = await fetch('http://192.168.1.29:3000/cdr', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(cdrData),
          });

          if (!response.ok) {
            throw new Error('Failed to insert CDR data');
          }

          console.log('CDR data inserted successfully');
        } catch (error) {
          console.error('Error inserting CDR data:', error);
        }
      }
    }
    await fetchCallHistory(); // Mettre à jour l'historique après l'appel

  }, [session, token, fetchCallHistory]);

  // Fonction de déconnexion
  const handleLogout = useCallback(() => {
    if (userAgent) {
      userAgent.stop();
    } localStorage.removeItem('sessionToken');

    setIsLoggedIn(false);
    setUsername('');
    setCallTo('');
    setRegistrationStatus('');
    setCallStatus('');
    setIsVideoEnabled(false);
  }, [userAgent]);

  // Fonction pour gérer l'appui sur une touche du clavier numérique
  const handleKeyPress = useCallback((key) => {
    setCallTo(prevCallTo => prevCallTo + key);
  }, []);

  // Fonctions pour gérer les changements de thème, de langue et de profil
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleLanguageChange = (newLanguage) => {
    if (availableLanguages.includes(newLanguage)) {
      setLanguage(newLanguage);
    }
  };
  const handleProfileUpdate = (newProfile) => {
    setProfile(newProfile);
  };
  const handleProfilePhotoClick = () => {
    setCurrentPage('profile');
  };
  // Si l'utilisateur n'est pas connecté, afficher la page de connexion
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} t={t} />;
  }

  // Configuration des boutons du clavier numérique
  const keypadButtons = [
    { key: '1', letters: '' },
    { key: '2', letters: 'ABC' },
    { key: '3', letters: 'DEF' },
    { key: '4', letters: 'GHI' },
    { key: '5', letters: 'JKL' },
    { key: '6', letters: 'MNO' },
    { key: '7', letters: 'PQRS' },
    { key: '8', letters: 'TUV' },
    { key: '9', letters: 'WXYZ' },
    { key: '*', letters: '' },
    { key: '0', letters: '+' },
    { key: '#', letters: '' },
  ];

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} t={t} />;
  }


  // Rendu de l'interface utilisateur principale
  return (
    <div className={`app-container ${theme}`}>
      <CustomTitleBar />
      <div className="app-content">
        <SideMenu
          onNavigate={setCurrentPage}
          currentPage={currentPage}
          onRefresh={handleRefresh}
          t={t}
        />
        <main className="app-main">
          {currentPage === 'home' && (
            <>
              
              <header className="app-header">
                <img
                  src={profile.photo || defaultPhoto}
                  alt=""
                  id="profile-photo"
                  onClick={handleProfilePhotoClick}
                  style={{ cursor: 'pointer' }}
                />
                <h2>
                  {profile.name || username}
                  {connectionFailed && (
                    <span
                      className="connection-warning"
                      title={t('connectionFailedWarning')}
                    >
                      ⚠️
                    </span>
                  )}
                </h2>
                <button className="logout-button" onClick={handleLogout}>{t('logout')}</button>
              </header>
              <div className="call-status">
                <p>{t('callStatus')}: {t(callStatus)}</p>
              </div>
              <div className="keypad">
                <input
                  type="text"
                  value={callTo}
                  onChange={(e) => setCallTo(e.target.value)}
                  placeholder={t('enterNumber')}
                  className="call-input"
                />
                <div className="keypad-buttons">
                  {keypadButtons.map((button) => (
                    <button
                      key={button.key}
                      onClick={() => handleKeyPress(button.key)}
                      className="keypad-button"
                    >
                      {button.key}
                      <small>{button.letters}</small>
                    </button>
                  ))}
                </div>
              </div>
              <div className="call-controls">
                {!session && !incomingCall && (
                  <>
                    <button className="call-button" onClick={() => handleCall(false)} title={t('voiceCall')}>
                      <img src={callIcon} alt={t('voiceCall')} className="call-icon" />
                    </button>
                    <button className="video-call-button" onClick={() => handleCall(true)} title={t('videoCall')}>
                      <img src={videocallicon} alt={t('videoCall')} className="video-call-icon" />
                    </button>
                  </>
                )}
                {incomingCall && (
                  <>
                    <button className="answer-button" onClick={handleAnswer}>{t('answer')}</button>
                    <button className="reject-button" onClick={handleReject}>{t('reject')}</button>
                  </>
                )}
                {session && (
                  <>
                    <button className="hangup-button" onClick={handleHangup} title={t('hangUp')}>
                      <img src={hangupicon} alt={t('hangUp')} className="hangup-icon" />
                    </button>
                    <button
                      className={`toggle-video-button ${isVideoEnabled ? 'active' : ''}`}
                      onClick={toggleVideo}
                      title={isVideoEnabled ? t('disableVideo') : t('enableVideo')}
                    >
                      <img
                        src={isVideoEnabled ? disablevideoicon : enablevideoicon}
                        alt={t('toggleVideo')}
                        className="control-icon"
                      />
                    </button>
                    <button
                      className={`toggle-audio-button ${isAudioEnabled ? 'active' : ''}`}
                      onClick={toggleAudio}
                      title={isAudioEnabled ? t('muteAudio') : t('unmuteAudio')}
                    >
                      <img
                        src={isAudioEnabled ? enablemicroicon : disablemicroicon}
                        alt={t('toggleAudio')}
                        className="control-icon"
                      />
                    </button>
                  </>
                )}
              </div>
              <div className="video-container">
                {isVideoEnabled && (
                  <>
                    <div className="video-box">
                      <h3>{t('localVideo')}</h3>
                      <video ref={localVideoRef} autoPlay muted></video>
                    </div>
                    <div className="video-box">
                      <h3>{t('remoteVideo')}</h3>
                      <video ref={remoteVideoRef} autoPlay></video>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          {currentPage === 'callHistory' && (
            <CallHistory history={callHistory} username={username} t={t} />
          )}
          {currentPage === 'contacts' && (
            <ContactDirectory
              onCallContact={(number) => {
                setCallTo(number);
                setCurrentPage('home');
              }}
              token={token}
              t={t}
            />
          )}
          {currentPage === 'profile' && (
            <div className="profile-page">
              <div className="profile-header">
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
                <div
                  className="profile-photo-container"
                  onClick={() => document.getElementById('photo-upload').click()}
                  title={t('changeProfilePicture')}
                >
                  <img
                    src={profile.photo || defaultPhoto}
                    alt={t('profilePicture')}
                    className="profile-photo"
                  />
                  <div className="profile-photo-overlay">
                    <span className="profile-photo-icon">📷</span>
                  </div>
                </div>
                <h2 className="profile-name">{profile.name || username}</h2>
              </div>

              <div className="profile-field">
                <label>{t('name')}</label>
                <input
                  type="text"
                  value={isEditing ? editedProfile.name : profile.name}
                  readOnly={!isEditing}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {!isEditing && <button className="edit-button" onClick={() => handleEdit('name')}>✏️</button>}
              </div>

              <div className="profile-field">
                <label>{t('email')}</label>
                <input
                  type="email"
                  value={isEditing ? editedProfile.email : profile.email}
                  readOnly={!isEditing}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                {!isEditing && <button className="edit-button" onClick={() => handleEdit('email')}>✏️</button>}
              </div>

              <div className="profile-field">
                <label>{t('bio')}</label>
                <textarea
                  value={isEditing ? editedProfile.bio : profile.bio}
                  readOnly={!isEditing}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                ></textarea>
                {!isEditing && <button className="edit-button" onClick={() => handleEdit('bio')}>✏️</button>}
              </div>

              {isEditing && (
                <div className="profile-actions">
                  <button className="cancel-button" onClick={handleCancel}>{t('cancel')}</button>
                  <button className="save-button" onClick={handleSave}>{t('save')}</button>
                </div>
              )}
            </div>
          )}
          {currentPage === 'settings' && (
            <div className="settings-page">
              <h2>{t('settings')}</h2>
              <div className="settings-section">
                <h3>{t('appearance')}</h3>
                <div className="setting-item">
                  <label htmlFor="theme-select">{t('theme')}:</label>
                  <select
                    id="theme-select"
                    value={theme}
                    onChange={(e) => handleThemeChange(e.target.value)}
                  >
                    <option value="light">{t('light')}</option>
                    <option value="dark">{t('dark')}</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label htmlFor="language-select">{t('language')}:</label>
                  <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                    <option value="pt">Português</option>
                    <option value="nl">Nederlands</option>
                    <option value="ru">Русский</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                    <option value="ar">العربية</option>
                    <option value="zh">中文</option>
                    <option value="uk">Українська</option>
                    <option value="pl">Polski</option>
                    <option value="tr">Türkçe</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="ro">Română</option>
                    <option value="sv">Svenska</option>
                    <option value="no">Norsk</option>
                    <option value="fi">Suomi</option>
                    <option value="el">Ελληνικά</option>
                    <option value="hu">Magyar</option>
                    <option value="sr">Српски</option>
                    <option value="id">Bahasa Indonesia</option>
                    <option value="ur">اردو</option>
                    <option value="hr">Hrvatski</option>
                    <option value="is">Íslenska</option>
                    <option value="et">Eesti</option>
                    <option value="lt">Lietuvių</option>
                    <option value="be">Беларуская</option>
                    <option value="af">Afrikaans</option>
                  </select>
                </div>
              </div>
              <div className="settings-section">
                <h3>{t('audioAndVideo')}</h3>
                <div className="setting-item">
                  <label htmlFor="audio-device-select">{t('audioInputDevice')}:</label>
                  <select
                    id="audio-device-select"
                    value={selectedAudioDevice}
                    onChange={(e) => setSelectedAudioDevice(e.target.value)}
                  >
                    {audioDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `${t('microphone')} ${audioDevices.indexOf(device) + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="setting-item">
                  <label htmlFor="video-device-select">{t('videoInputDevice')}:</label>
                  <select
                    id="video-device-select"
                    value={selectedVideoDevice}
                    onChange={(e) => setSelectedVideoDevice(e.target.value)}
                  >
                    {videoDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `${t('camera')} ${videoDevices.indexOf(device) + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="setting-item">
                  <div className="test-buttons">
                    <button onClick={handleTestMicrophone}>
                      {isTestingMic ? t('stopMicrophoneTest') : t('testMicrophone')}
                    </button>
                    <button onClick={handleTestCamera}>
                      {isTestingVideo ? t('stopCameraTest') : t('testCamera')}
                    </button>
                  </div>
                  {isTestingMic && (
                    <canvas ref={audioVisualizerRef} className="audio-visualizer"></canvas>
                  )}
                  {isTestingVideo && (
                    <video ref={videoPreviewRef} className="video-preview" autoPlay playsInline></video>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      {showProfile && (
        <Profile
          onClose={() => setShowProfile(false)}
          profile={profile}
          onUpdate={handleProfileUpdate}
          t={t}
        />
      )}
      {isLoading && <LoadingSpinner />}
    </div>
  );
}

export default App;