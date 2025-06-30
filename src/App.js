import React, { useState, useEffect, useRef, useCallback } from 'react';
import JsSIP from 'jssip';
import LoginPage from './LoginPage';
import Settings from './Settings';
import Profile from './Profile';
import Messages from './Messages';
import VoiceMessages from './VoiceMessages'; // Importez le nouveau composant

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


import { FaPhone, FaPhoneVolume, FaVideo } from 'react-icons/fa';
import { MdPhoneInTalk, MdVideocam, MdVideocamOff, MdCallEnd, MdMic, MdMicOff, MdPhoneForwarded, MdBedtime, MdBedtimeOff, MdEdit, MdRemoveRedEye, MdExpandMore, MdExpandLess, MdBrush, MdSettings, MdPersonAdd, MdLock, MdSecurity, MdMessage } from 'react-icons/md';
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
  const [shouldInitiateCall, setShouldInitiateCall] = useState(false);
  const [refreshContacts, setRefreshContacts] = useState(false);
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [callProgress, setCallProgress] = useState('initial');

  const [userAgent, setUserAgent] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [isVoicemail, setIsVoicemail] = useState(false);
  const animationFrameRef = useRef(null);
  const [registrationStatus, setRegistrationStatus] = useState('');
  const [callStatus, setCallStatus] = useState('');
  const [session, setSession] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [username, setUsername] = useState('');
  const [callTo, setCallTo] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  // Ajoutez ceci avec les autres déclarations useState au début du composant
  const [voicemailTimer, setVoicemailTimer] = useState(null);
  const [showTransferPopup, setShowTransferPopup] = useState(false);
  const [showAddExtensionPopup, setShowAddExtensionPopup] = useState(false);
  const [extensionToAdd, setExtensionToAdd] = useState('');
  const [expandedSection, setExpandedSection] = useState('display');
  const [callDuration, setCallDuration] = useState(0);
  const [remotePartyName, setRemotePartyName] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const availableLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'nl', 'ru', 'ja', 'ko', 'ar', 'zh', 'uk', 'pl', 'tr', 'vi', 'ro', 'sv', 'no', 'fi', 'el', 'hu', 'sr', 'id', 'ur', 'hr', 'is', 'et', 'lt', 'be', 'af'];
  const [isTransferMode, setIsTransferMode] = useState(false);
  const [token, setToken] = useState(null);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [participants, setParticipants] = useState([]);
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
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });
  // TODO 2 tokens + fichiers de configurations avec les identifiants auth2.0.
  const generateToken = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/token', {
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
  const fetchUserInfo = useCallback(async () => {
    if (token && username) {
      try {
        const response = await fetch(`http://192.168.1.95:3000/users/${username}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }
        const data = await response.json();
        setUserInfo(data);
        setIsAdmin(data.is_admin || false);

        // Utiliser directement l'image en base64 si elle existe
        const photoUrl = data.profile_picture || defaultPhoto;

        setProfile(prevProfile => ({
          ...prevProfile,
          name: data.name || '',
          photo: photoUrl,
        }));

        console.log('User data received:', data);

        // Déclencher le rechargement des contacts
        setRefreshContacts(prev => !prev);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    }
  }, [token, username]);
  const updateProfilePhoto = useCallback(async (base64Image) => {
    console.log("Attempting to update profile photo");

    if (!token || !username) {
      console.log("Token or username is missing");
      return;
    }

    try {
      // Préparer l'image base64 propre
      const imageData = base64Image.startsWith("data:image")
        ? base64Image.split(',')[1]
        : base64Image;

      if (!imageData) {
        throw new Error("Image base64 invalide ou vide");
      }

      console.log("Sending request to update profile photo");

      const response = await fetch(`http://192.168.1.95:3000/users/${username}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profile_picture: imageData })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile picture: ${errorText}`);
      }

      console.log("Base64 image data (truncated):", imageData.substring(0, 100));
      console.log('Profile picture updated successfully');
      await fetchUserInfo();
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  }, [token, username, fetchUserInfo]);

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

  const updateUserStatus = useCallback(async (status) => {
    if (!token || !username) return;

    try {
      const response = await fetch(`http://localhost:3000/users/${username}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      console.log(`User status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }, [token, username]);
  const resetMediaStreams = () => {
    // Arrêter et nettoyer le flux vidéo distant
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      const tracks = remoteVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      remoteVideoRef.current.srcObject = null;
    }

    // Arrêter et nettoyer le flux vidéo local
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }

    // Réinitialiser l'état de l'audio et de la vidéo
    setIsAudioEnabled(true);
    setIsVideoEnabled(false);

    // Si vous avez un analyseur audio, le réinitialiser aussi
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    // Annuler toute animation en cours
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };
  // Fonction de connexion
  const handleLogin = useCallback((extension, password) => {
    setUsername(extension);

    // Configuration SIP
    const socket = new JsSIP.WebSocketInterface('ws://192.168.1.95:5066');
    const configuration = {
      sockets: [socket],
      uri: `sip:${extension}@192.168.1.95:5070`,
      password: password,
      sessionTimersExpires: 600,
      register: true,
      session_timers: false,

      registrar_server: 'sip:192.168.1.95',
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
        ua.sendOptions(`sip:${extension}@192.168.1.95:5070`);
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
    ua.on('registered', async () => {
      setRegistrationStatus('Registered');
      setIsLoggedIn(true);
      setConnectionFailed(false);
      updateUserStatus('online');
      await fetchUserInfo(); // Appel après l'enregistrement

      // Récupération du nom du contact après l'enregistrement réussi
      try {
        const response = await fetch(`http://192.168.1.95:3000/users/${extension}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userData = await response.json();

        // Mise à jour du profil avec le nom du contact
        setProfile(prevProfile => ({
          ...prevProfile,
          name: userData.name || `${userData.prenom} ${userData.nom}`.trim(),
        }));

        console.log(`User ${extension} logged in as ${userData.name}`);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
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
        const callerName = newSession.remote_identity.display_name || newSession.remote_identity.uri.user;
        setParticipants([{ name: callerName, extension: newSession.remote_identity.uri.user }]);
      } else {
        setSession(newSession);
        setCallStatus('Outgoing call');
      }

      newSession.on('accepted', () => {
        console.log('Call accepted');
        setCallStatus('Call in progress');
        setIsCallInProgress(true); // Ajoutez cette ligne
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
        resetMediaStreams();
        setCallDuration(0);
        setParticipants([]);
        setIsCallInProgress(false); // Ajoutez cette ligne


        // Arrêter tous les tracks de la vidéo locale
        if (localVideoRef.current && localVideoRef.current.srcObject) {
          const tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
          localVideoRef.current.srcObject = null;
        }
      });

      newSession.on('failed', (e) => {
        console.error('Call failed:', e);
        setCallStatus(`Call failed: ${e.cause}`);
        setSession(null);
        setIncomingCall(null);
        setIsVideoEnabled(false);
        resetMediaStreams();

        // Optionnel : Réinitialiser d'autres états liés à l'appel si nécessaire
        setCallDuration(0);
        setParticipants([]);
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
    updateUserStatus('online');


    setUserAgent(ua);
    ua.start();

  }, [updateUserStatus]);
  const handleTransferClick = useCallback((contact) => {
    console.log('handleTransferClick called with contact:', contact);

    if (session && contact.extension) {
      console.log('Session and contact extension are valid');
      const target = `sip:${contact.extension}@192.168.1.95:5070`;
      console.log('Transfer target:', target);

      try {
        console.log('Preparing transfer options');
        const options = {
          extraHeaders: [
            `Referred-By: <sip:${username}@192.168.1.95:5070>`,
            'Session-Expires: 600',
            'Min-SE: 120'
          ]
        };
        console.log('Transfer options:', options);

        console.log('Initiating transfer');
        session.refer(target, options);

        console.log('Adding refer event listener');
        session.on('refer', (response) => {
          console.log('Refer event received, response:', response);
          console.log('Refer response status code:', response.status_code);

          if (response.status_code === 202) {
            console.log(`Transfer to ${contact.extension} initiated successfully`);
            setShowTransferPopup(false);
            setIsTransferMode(false);
            setCurrentPage('home');

            console.log('Adding ended event listener for transfer completion');
            session.on('ended', () => {
              console.log('Transfer completed, original call ended');
              setSession(null);
              setCallStatus('Call transferred');
            });
          } else {
            console.error(`Transfer failed with status code: ${response.status_code}`);
            console.log('Full response object:', response);
          }
        });

        console.log('Transfer process initiated');
      } catch (error) {
        console.error('Transfer failed:', error);
        console.log('Error details:', error.message);
        console.log('Error stack:', error.stack);
      }
    } else {
      console.log('Invalid session or contact extension');
      console.log('Session:', session);
      console.log('Contact:', contact);
    }
  }, [session, username]);
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
  const handleDoNotDisturb = () => {
    const newStatus = doNotDisturb ? 'online' : 'dnd';

    setDoNotDisturb(prevState => !prevState);
    updateUserStatus(newStatus);

  };

  useEffect(() => {
    let timer;
    if (session) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [session]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const playBeepSound = useCallback(() => {
    console.log('Playing beep sound');
    const beep = new Audio('/assets/beep.mp3');
    beep.play();
  }, []);
  const playVoicemailGreeting = useCallback(() => {
  console.log('Playing voicemail greeting audio file');
  console.log(`Voici le token :${token}`);

  const soundId = 2;  // ID du son par défaut

  // Requête pour récupérer l'audio MP3 en base64 depuis l'API
  fetch(`http://192.168.1.95:3000/defauts-sound/${soundId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch audio data');
      }
      return response.json();
    })
    .then(data => {
      console.log('Données reçues:', data);

      if (data.mp3_data) {
        // Décode les données Base64 en format binaire
        try {
          const audioData = new Uint8Array(atob(data.mp3_data).split('').map(char => char.charCodeAt(0)));

          // Crée un Blob à partir des données décodées et un URL à partir de ce Blob
          const audioBlob = new Blob([audioData], { type: 'audio/mp3' });
          const audioUrl = URL.createObjectURL(audioBlob);

          // Crée un élément audio et joue-le
          const greetingAudio = new Audio(audioUrl);
          greetingAudio.onended = () => {
            console.log('Greeting audio ended, playing beep sound');
            playBeepSound(); // Logique pour jouer un autre son après
          };

          // Joue l'audio
          greetingAudio.play().catch(error => {
            console.error('Error playing greeting audio:', error);
          });
        } catch (e) {
          console.error('Erreur de décodage Base64:', e);
        }
      } else {
        console.error('Aucune donnée audio trouvée dans la réponse');
      }
    })
    .catch(error => {
      console.error('Error fetching the audio:', error);
    });
}, [token, playBeepSound]);





  const handleVoicemail = useCallback(() => {
    console.log("Handling voicemail");
    playVoicemailGreeting();
    // Autres actions nécessaires pour la messagerie vocale
  }, [playVoicemailGreeting]);
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

    console.log('Initiating call to:', `sip:${callTo}@192.168.1.95:5070`);
    const newSession = userAgent.call(`sip:${callTo}@192.168.1.95:5070`, options);
    setSession(newSession);
    setCallStatus('Calling...');
    setIsVideoEnabled(withVideo);
    setParticipants([{ name: callTo, extension: callTo }]);
    setCallProgress('calling');

    // Timer pour passer en mode messagerie vocale après 19 secondes
    const voicemailTimer = setTimeout(() => {
      console.log('Voicemail timer triggered');
      if (callProgressRef.current === 'calling' || callProgressRef.current === 'progress') {
        console.log('Call still in progress, activating voicemail');
        setIsVoicemail(true);
        handleVoicemail();  // Démarre la messagerie vocale
        
        // Met l'appel en attente pour éviter le raccrochage automatique
        if (newSession && newSession.isInProgress()) {
          newSession.hold();  // Met l'appel en attente
        }
      } else {
        console.log('Call status changed, not activating voicemail');
      }
    }, 19000);

    setVoicemailTimer(voicemailTimer);

    newSession.on('progress', () => {
      console.log('Call in progress');
      setCallProgress('progress');
    });

    newSession.on('accepted', () => {
      console.log('Call accepted by remote party');
      setCallStatus('Call in progress');
      setCallProgress('accepted');
      clearTimeout(voicemailTimer);  // Supprime le timer de la messagerie vocale si l'appel est accepté
      setVoicemailTimer(null);
    });

    newSession.on('failed', (e) => {
      console.log('Call failed:', e.cause);
      clearTimeout(voicemailTimer);
      setVoicemailTimer(null);
      setCallStatus(`Call failed: ${e.cause}`);
      setSession(null);
      setIsVideoEnabled(false);
      resetMediaStreams();
    });

    newSession.on('ended', () => {
      console.log('Call ended');
      clearTimeout(voicemailTimer);
      setVoicemailTimer(null);
      setCallStatus('Call ended');
      setSession(null);
      setIsVideoEnabled(false);
      resetMediaStreams();
      setCallDuration(0);
      setParticipants([]);
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

  setIsCallInProgress(true);

}, [userAgent, callTo, voicemailTimer, handleVoicemail, playVoicemailGreeting]);

  const callProgressRef = useRef('calling');

  useEffect(() => {
    callProgressRef.current = callProgress;
  }, [callProgress]);

  const handleEdit = (field) => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };
  useEffect(() => {
    if (callTo && currentPage === 'home' && shouldInitiateCall) {
      console.log("Initiating call from useEffect");
      handleCall(false);
      setShouldInitiateCall(false); // Réinitialise le flag après avoir initié l'appel
    }
  }, [callTo, currentPage, handleCall, shouldInitiateCall]);
  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({ ...profile });
  };

  useEffect(() => {
    return () => {
      if (voicemailTimer) {
        clearTimeout(voicemailTimer);
      }
    };
  }, [voicemailTimer]);
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
      if (isAudioEnabled) {
        session.mute({ audio: true });
        stopAudioAnalysis();
      } else {
        session.unmute({ audio: true });
        startAudioAnalysis();
      }
      setIsAudioEnabled(!isAudioEnabled);
    }
  }, [session, isAudioEnabled]);

  const startAudioAnalysis = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(session.connection.getLocalStreams()[0]);
    source.connect(analyserRef.current);
    analyserRef.current.fftSize = 32;

    const updateMicAnimation = () => {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length / 255;

      const micButton = document.querySelector('.btn-success-micro');
      if (micButton) {
        const angle = Math.min(volume * 360, 360);
        micButton.style.setProperty('--mic-volume', `${angle}deg`);
      }

      animationFrameRef.current = requestAnimationFrame(updateMicAnimation);
    };

    updateMicAnimation();
  }, [session]);

  const stopAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    const micButton = document.querySelector('.btn-success-micro');
    if (micButton) {
      micButton.style.setProperty('--mic-volume', '0deg');
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAudioAnalysis();
    };
  }, [stopAudioAnalysis]);

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

  const handleCallContact = useCallback((extension) => {
    console.log("handleCallContact called with extension:", extension);
    if (extension) {
      setCallTo(extension);
      setShouldInitiateCall(true);
      setCurrentPage('home');
    }
  }, []);

  const handleVideoCallContact = useCallback((extension) => {
    setCallTo(extension);
    handleCall(true);  // true pourcall-icon un appel vidéo
  }, [setCallTo, handleCall]);
  const onVideoCallContact = useCallback((extension) => {
    setCallTo(extension);
    setCurrentPage('home');
    setIsVideoEnabled(true);
  }, []);
  useEffect(() => {
    if (shouldInitiateCall && callTo) {
      handleCall(callTo, true);
      setShouldInitiateCall(false);
    }
  }, [shouldInitiateCall, callTo, handleCall]);
  const handleAddExtension = useCallback(() => {
    setShowAddExtensionPopup(true);
  }, []);
  const handleAddContactToCall = useCallback((contact) => {
    if (session && contact.extension && userAgent) {
      const conferenceId = session.data?.conferenceId || `conf_${Date.now()}`;

      if (!session.data?.conferenceId) {
        session.sendDTMF('*2');
        session.data = { ...session.data, conferenceId };
      }

      const extraHeaders = [`Referred-By: <sip:${username}@192.168.1.95:5070>`];

      if (session.remote_identity?.uri && session.remote_identity?.parameters?.tag && session.local_identity?.parameters?.tag) {
        extraHeaders.push(`Join: ${session.remote_identity.uri};to-tag=${session.remote_identity.parameters.tag};from-tag=${session.local_identity.parameters.tag}`);
      }

      const options = {
        extraHeaders: [
          ...extraHeaders,
          'Session-Expires: 600',
          'Min-SE: 120'
        ],
        mediaConstraints: { audio: true, video: false },
        rtcOfferConstraints: {
          offerToReceiveAudio: 1,
          offerToReceiveVideo: 0
        },
        pcConfig: {
          iceServers: [{ urls: ['stun:stun.freeswitch.org'] }],
          iceTransportPolicy: 'all',
        },
        sessionTimersExpires: 600
      };

      try {
        const newSession = userAgent.call(`sip:${contact.extension}@192.168.1.95:5070`, options);

        newSession.on('accepted', () => {
          console.log(`Extension ${contact.extension} added to conference ${conferenceId}`);
          setParticipants(prevParticipants => [...prevParticipants, contact]);

        });

        setShowAddExtensionPopup(false);
      } catch (error) {
        console.error('Error initiating call:', error);
      }
    }
  }, [session, username, userAgent]);
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
        const response = await fetch(`http://192.168.1.95:3000/cdr/${username}`, {
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
      updateUserStatus('online');
      fetchCallHistory();
      fetchUserInfo(); // Ajoutez cette ligne
    }
  }, [isLoggedIn, fetchCallHistory, updateUserStatus]);
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

      // Mettre à jour le statut d'appel
      setCallStatus(t('Call ended')); // Assurez-vous que 'callEnded' est défini dans vos traductions

      // Effacer le statut après 5 secondes
      setTimeout(() => {
        setCallStatus('');
      }, 3000);

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
            local_ip_v4: '192.168.1.95', // Remplacez par l'IP réelle
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

          const response = await fetch('http://192.168.1.95:3000/cdr', {
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
    setIsCallInProgress(false);

  }, [session, token, fetchCallHistory]);
  const handlePhotoChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1]; // Obtenir seulement la partie base64
        await updateProfilePhoto(base64Image);
        // Mettre à jour l'état local immédiatement
        setProfile(prevProfile => ({
          ...prevProfile,
          photo: reader.result // Utilisez l'URL data complète ici
        }));
      };
      reader.readAsDataURL(file);
    }
  }, [updateProfilePhoto]);
  // Fonction de déconnexion
  const handleLogout = useCallback(() => {
    if (userAgent) {
      userAgent.stop();
    } localStorage.removeItem('sessionToken');

    setIsLoggedIn(false);
    setUsername('');
    updateUserStatus('offline');

    setCallTo('');
    setRegistrationStatus('');
    setCallStatus('');
    setIsVideoEnabled(false);
  }, [userAgent, updateUserStatus]);
  useEffect(() => {
    const handleBeforeUnload = () => {
      updateUserStatus('offline');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [updateUserStatus]);
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
  const handleProfileUpdate = useCallback(async (updatedProfile) => {
    if (updatedProfile.photo && updatedProfile.photo !== profile.photo) {
      await updateProfilePhoto(updatedProfile.photo);
    }
    // Update other profile fields if necessary
    setProfile(updatedProfile);
  }, [updateProfilePhoto, profile]);
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


  const handleTransferPopupOpen = () => {
    setShowTransferPopup(true);
  };
  const handleTransferToContact = (contactNumber) => {
    if (session) {
      session.refer(`sip:${contactNumber}@192.168.1.95:5070`);
      setIsTransferMode(false);
      setShowTransferPopup(false);
    }
  };
  // Rendu de l'interface utilisateur principale
  return (
    <div className={`app-container ${theme} ${doNotDisturb ? 'dnd-active' : ''}`}>
      <CustomTitleBar />
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} t={t} />
      ) : (
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
                    {connectionFailed && (
                      <span
                        className="connection-warning"
                        title={t('connectionFailedWarning')}
                      >
                        ⚠️
                      </span>
                    )}


                  </h2>
                  <div className="header-buttons">
                    <button
                      className={`btn-circle btn-warning ${doNotDisturb ? 'active' : ''}`}
                      onClick={handleDoNotDisturb}
                      title={doNotDisturb ? t('Come back') : t('Do not disturb')}
                    >
                      {doNotDisturb ? <MdBedtimeOff /> : <MdBedtime />}
                    </button>
                    <button className="btn-circle-logout btn-danger" onClick={handleLogout} title={t('logout')}>
                      <MdCallEnd />
                    </button>
                  </div>
                </header>
                <div className="call-status">
                  <p>{t(callStatus)}</p>
                </div>

                {(!isCallInProgress && !incomingCall) && (
                  <div className="keypad">
                    <div className="call-input-container">
                      <input
                        type="text"
                        value={callTo}
                        onChange={(e) => setCallTo(e.target.value)}
                        placeholder={t('enterNumber')}
                        className="call-input"
                      />
                    </div>
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
                )}
                <div className="call-controls">
                  {callStatus === 'Incoming call' ? (
                    <>
                      <button className="btn-circle btn-success" onClick={handleAnswer} title={t('answer')}>
                        <MdPhoneInTalk />
                      </button>
                      <button className="btn-circle-hangup" onClick={handleReject} title={t('reject')}>
                        <MdCallEnd />
                      </button>
                    </>
                  ) : (
                    <>
                      {!session && !incomingCall && (
                        <>
                          <button className="btn-circle btn-success" onClick={() => handleCall(false)} title={t('voiceCall')}>
                            <MdPhoneInTalk />
                          </button>
                          <button className="btn-circle btn-success" onClick={() => handleCall(true)} title={t('videoCall')}>
                            <MdVideocam />
                          </button>
                        </>
                      )}
                      {session && (
                        <><div className="active-call">
                          <h3>Appel en cours</h3>
                          <p>Durée: {formatDuration(callDuration)}</p>
                          <div>
                            <h4>Participants:</h4>
                            <ul>
                              {participants.map((participant, index) => (
                                <li key={index}>{participant.name} ({participant.extension})</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                          <button
                            className="btn-circle-add-extension"
                            onClick={() => setShowAddExtensionPopup(true)}
                            title={t('Add Extension')}
                          >
                            <MdPersonAdd />
                          </button>
                          <button className="btn-circle-hangup" onClick={handleHangup} title={t('hangUp')}>
                            <MdCallEnd />
                          </button>
                          <button
                            className={`btn-success-videocall ${isVideoEnabled ? 'active' : ''}`}
                            onClick={toggleVideo}
                            title={isVideoEnabled ? t('disableVideo') : t('enableVideo')}
                          >
                            {isVideoEnabled ? <MdVideocam /> : <MdVideocamOff />}
                          </button>
                          <button
                            className={`btn-success-micro ${isAudioEnabled ? 'active' : ''}`}
                            onClick={toggleAudio}
                            title={isAudioEnabled ? t('muteAudio') : t('unmuteAudio')}
                            style={{ '--mic-volume': '0deg' }}
                          >
                            {isAudioEnabled ? <MdMic /> : <MdMicOff />}
                          </button>
                          <button
                            className="btn-circle-transfer"
                            onClick={handleTransferPopupOpen}
                            title={t('Transfer')}
                          >
                            <MdPhoneForwarded />
                          </button>
                        </>
                      )}
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
            {currentPage === 'messages' && (
              <Messages username={username} token={token} t={t} />
            )}
            {currentPage === 'voiceMessages' && (
              <VoiceMessages /> // Nouveau composant pour les messages vocaux
            )}
            {currentPage === 'contacts' && (
              <ContactDirectory
                onCallContact={handleCall}
                onVideoCallContact={(extension) => handleCall(extension, true)}
                isTransferMode={isTransferMode}
                isAddMode={false}
                setShouldInitiateCall={setShouldInitiateCall}
                handleTransferClick={handleTransferClick}
                t={t}
                isAdmin={isAdmin}

                token={token}
                fetchUserInfo={fetchUserInfo}
                refreshTrigger={refreshContacts}

              />
            )}
            {showTransferPopup && (
              <div className="transfer-popup">
                <div className="transfer-popup-content">
                  <button className="close-popup" onClick={() => setShowTransferPopup(false)}>×</button>
                  <button
                    className="eye-icon"
                    onMouseEnter={() => document.querySelector('.transfer-popup-content').style.opacity = '0.05'}
                    onMouseLeave={() => document.querySelector('.transfer-popup-content').style.opacity = '1'}
                  >
                    <MdRemoveRedEye />
                  </button>
                  <ContactDirectory
                    onCallContact={handleCallContact}
                    onVideoCallContact={onVideoCallContact}
                    setShouldInitiateCall={setShouldInitiateCall}
                    handleTransferClick={handleTransferClick}

                    isAdmin={isAdmin}
                    fetchUserInfo={fetchUserInfo}
                    refreshTrigger={refreshContacts}

                    isTransferMode={true}
                    onTransfer={handleTransferToContact}
                    t={t}
                    token={token}
                    title={t('Transfer')}
                  />
                </div>
              </div>
            )}
            {showAddExtensionPopup && (
              <div className="transfer-popup">
                <div className="transfer-popup-content">
                  <button className="close-popup" onClick={() => setShowAddExtensionPopup(false)}>×</button>
                  <button
                    className="eye-icon"
                    onMouseEnter={() => document.querySelector('.transfer-popup-content').style.opacity = '0.05'}
                    onMouseLeave={() => document.querySelector('.transfer-popup-content').style.opacity = '1'}
                  >
                    <MdRemoveRedEye />
                  </button>
                  <ContactDirectory
                    onCallContact={handleAddContactToCall}
                    setShouldInitiateCall={setShouldInitiateCall}
                    handleTransferClick={handleTransferClick}
                    onVideoCallContact={onVideoCallContact}
                    isAdmin={isAdmin}
                    fetchUserInfo={fetchUserInfo}
                    refreshTrigger={refreshContacts}

                    isAddMode={true}
                    t={t}
                    token={token}
                    title={t('Invite')}
                  />
                </div>
              </div>
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
                  {!isEditing && (
                    <button
                      className="edit-button"
                      onClick={() => handleEdit('name')}
                      title={t('Modify')}
                    >
                      <MdEdit />
                    </button>
                  )}
                </div>

                <div className="profile-field">
                  <label>{t('email')}</label>
                  <input
                    type="email"
                    value={isEditing ? editedProfile.email : profile.email}
                    readOnly={!isEditing}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                  {!isEditing && (
                    <button
                      className="edit-button"
                      onClick={() => handleEdit('email')}
                      title={t('Modify')}
                    >
                      <MdEdit />
                    </button>
                  )}
                </div>

                <div className="profile-field">
                  <label>{t('bio')}</label>
                  <textarea
                    value={isEditing ? editedProfile.bio : profile.bio}
                    readOnly={!isEditing}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                  ></textarea>
                  {!isEditing && (
                    <button
                      className="edit-button"
                      onClick={() => handleEdit('bio')}
                      title={t('Modify')}
                    >
                      <MdEdit />
                    </button>
                  )}
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

                <h2><MdSettings /> {t('settings')}</h2>

                <div className={`settings-section ${expandedSection === 'appearance' ? 'expanded' : ''}`}>
                  <div className="section-header" onClick={() => toggleSection('appearance')}>
                    <h3><MdBrush /> {t('appearance')}</h3>
                    {expandedSection === 'appearance' ? <MdExpandLess /> : <MdExpandMore />}
                  </div>
                  {expandedSection === 'appearance' && (
                    <div className="section-content">
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
                  )}
                </div>

                <div className={`settings-section ${expandedSection === 'audioAndVideo' ? 'expanded' : ''}`}>
                  <div className="section-header" onClick={() => toggleSection('audioAndVideo')}>
                    <h3><MdSettings /> {t('audioAndVideo')}</h3>
                    {expandedSection === 'audioAndVideo' ? <MdExpandLess /> : <MdExpandMore />}
                  </div>
                  {expandedSection === 'audioAndVideo' && (
                    <div className="section-content">
                      <div className="setting-item">
                        <label htmlFor="audio-device-select">{t('audioInputDevice')}:</label>
                        <select
                          id="audio-device-select"
                          value={selectedAudioDevice}
                          onChange={(e) => setSelectedAudioDevice(e.target.value)}
                        >
                          {audioDevices.map((device) => (
                            <option key={device.deviceId} value={device.deviceId}>
                              {device.label || `Microphone ${device.deviceId}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="setting-item">
                        <button className="test-audio" onClick={handleTestMicrophone}>
                          {isTestingMic ? t('stopMicrophoneTest') : t('testMicrophone')}
                        </button>
                        <canvas ref={audioVisualizerRef} className="audio-visualizer"></canvas>
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
                              {device.label || `Camera ${device.deviceId}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="setting-item">
                        <button className="test-video" onClick={handleTestCamera}>
                          {isTestingVideo ? t('stopCameraTest') : t('testCamera')}
                        </button>
                        <video ref={videoPreviewRef} className="video-preview" autoPlay playsInline muted></video>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>)}{userInfo && userInfo.is_admin && (
          <MdSecurity className="admin-icon" title={t('adminUser')} />
        )}
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