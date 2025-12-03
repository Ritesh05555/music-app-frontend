
// import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { fas } from '@fortawesome/free-solid-svg-icons';
// import { library } from '@fortawesome/fontawesome-svg-core';
// import './index.css';
// library.add(fas);

// // --- Music Player Context ---
// const MusicPlayerContext = createContext();

// function MusicPlayerProvider({ children }) {
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [volume, setVolume] = useState(0.5);
//     const [isMinimized, setIsMinimized] = useState(true);
//     const [currentSongIndex, setCurrentSongIndex] = useState(0);
//     const audioRef = useRef(null);
//     const location = useLocation();
//     const lastMinimizedRef = useRef(true);

//     // stable refs for handlers to read latest state
//     const selectedSongRef = useRef(selectedSong);
//     useEffect(() => { selectedSongRef.current = selectedSong; }, [selectedSong]);
//     const isPlayingRef = useRef(isPlaying);
//     useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

//     useEffect(() => {
//         if (selectedSong && !isMinimized && lastMinimizedRef.current) {
//             window.history.pushState({ musicPlayer: 'open' }, '');
//         }
//         lastMinimizedRef.current = isMinimized;
//     }, [selectedSong, isMinimized]);

//     useEffect(() => {
//         const onPopState = () => {
//             if (selectedSong && !isMinimized) setIsMinimized(true);
//         };
//         window.addEventListener('popstate', onPopState);
//         return () => window.removeEventListener('popstate', onPopState);
//     }, [selectedSong, isMinimized]);

//     // next / prev logic (stable)
//     const nextTrack = useCallback(() => {
//         const current = selectedSongRef.current;
//         const list = Array.isArray(current?.songList) ? current.songList : [];
//         if (!list.length) { setIsPlaying(false); return; }
//         const currentId = current?._id || current?.id;
//         const idx = list.findIndex(s => (s._id || s.id) === currentId);
//         const nextIndex = (idx === -1 ? 0 : (idx + 1) % list.length);
//         const next = list[nextIndex];
//         if (next) { setSelectedSong({ ...next, songList: list }); setIsPlaying(true); }
//     }, []);

//     const prevTrack = useCallback(() => {
//         const current = selectedSongRef.current;
//         const list = Array.isArray(current?.songList) ? current.songList : [];
//         if (!list.length) { setIsPlaying(false); return; }
//         const currentId = current?._id || current?.id;
//         const idx = list.findIndex(s => (s._id || s.id) === currentId);
//         const prevIndex = (idx === -1 ? 0 : (idx - 1 + list.length) % list.length);
//         const prev = list[prevIndex];
//         if (prev) { setSelectedSong({ ...prev, songList: list }); setIsPlaying(true); }
//     }, []);

//     // Media Session integration: set handlers once and keep metadata updated later
//     useEffect(() => {
//         const ms = navigator.mediaSession;
//         if (!ms) return;

//         try {
//             ms.setActionHandler('nexttrack', nextTrack);
//             ms.setActionHandler('previoustrack', prevTrack);
//             ms.setActionHandler('play', () => setIsPlaying(true));
//             ms.setActionHandler('pause', () => setIsPlaying(false));
//             ms.setActionHandler('stop', () => setIsPlaying(false));
//             ms.setActionHandler('seekto', (details) => {
//                 const audio = audioRef.current;
//                 if (!audio || typeof details.seekTime !== 'number') return;
//                 // fastSeek if supported (better on mobile)
//                 try {
//                     if (details.fastSeek && typeof audio.fastSeek === 'function') audio.fastSeek(details.seekTime);
//                     else audio.currentTime = details.seekTime;
//                 } catch (err) {
//                     audio.currentTime = details.seekTime;
//                 }
//             });
//         } catch (err) {
//             // ignore browsers that restrict handlers
//             console.warn('MediaSession handler setup failed', err);
//         }

//         return () => {
//             try {
//                 ms.setActionHandler('nexttrack', null);
//                 ms.setActionHandler('previoustrack', null);
//                 ms.setActionHandler('play', null);
//                 ms.setActionHandler('pause', null);
//                 ms.setActionHandler('stop', null);
//                 ms.setActionHandler('seekto', null);
//             } catch {}
//         };
//     }, [nextTrack, prevTrack]);

//     useEffect(() => {
//         const audioSrc = selectedSong?.audioUrl || selectedSong?.audio;

//         const cleanupAudioListeners = () => {
//             if (!audioRef.current) return;
//             audioRef.current.pause();
//             audioRef.current.onended = null;
//             audioRef.current.ontimeupdate = null;
//             audioRef.current.onerror = null;
//         };

//         if (!audioSrc) {
//             cleanupAudioListeners();
//             if (audioRef.current) audioRef.current.src = '';
//             // clear media metadata
//             if (navigator.mediaSession) navigator.mediaSession.metadata = null;
//             if (navigator.mediaSession) navigator.mediaSession.playbackState = 'none';
//             setCurrentTime(0);
//             return;
//         }

//         // replace audio element when source changes
//         if (!audioRef.current || audioRef.current.src !== audioSrc) {
//             cleanupAudioListeners();
//             audioRef.current = new Audio(audioSrc);
//             audioRef.current.preload = 'auto';
//             audioRef.current.crossOrigin = 'anonymous'; // helps some platforms show artwork
//             audioRef.current.onerror = () => console.error('Audio load error for:', audioSrc);

//             audioRef.current.ontimeupdate = () => {
//                 if (!audioRef.current) return;
//                 setCurrentTime(audioRef.current.currentTime);
//                 // update position state for MediaSession (so remote UI shows progress and seek works)
//                 try {
//                     const ms = navigator.mediaSession;
//                     if (ms && typeof ms.setPositionState === 'function' && audioRef.current.duration && isFinite(audioRef.current.duration)) {
//                         ms.setPositionState({
//                             duration: Math.max(0, audioRef.current.duration),
//                             position: audioRef.current.currentTime,
//                             playbackRate: audioRef.current.playbackRate || 1
//                         });
//                     }
//                 } catch (err) {
//                     // ignore
//                 }
//             };

//             audioRef.current.onended = () => {
//                 // use selectedSongRef so this handler works even if state changed by other effects
//                 const current = selectedSongRef.current;
//                 const list = Array.isArray(current?.songList) ? current.songList : [];
//                 if (!list.length) { setIsPlaying(false); return; }
//                 const currentId = current?._id || current?.id;
//                 const idx = list.findIndex(s => (s._id || s.id) === currentId);
//                 const nextIndex = (idx === -1 ? 0 : (idx + 1) % list.length);
//                 const next = list[nextIndex];
//                 if (next) { setSelectedSong({ ...next, songList: list }); setIsPlaying(true); }
//                 else setIsPlaying(false);
//             };
//         }

//         // update media metadata for lockscreen / remote UI
//         try {
//             const ms = navigator.mediaSession;
//             if (ms) {
//                 ms.metadata = new window.MediaMetadata({
//                     title: selectedSong?.title || '',
//                     artist: selectedSong?.singer || '',
//                     album: selectedSong?.movie || selectedSong?.genre || '',
//                     artwork: [
//                         { src: selectedSong?.thumbnailUrl || selectedSong?.thumbnail || '', sizes: '300x300', type: 'image/png' }
//                     ]
//                 });
//                 ms.playbackState = isPlaying ? 'playing' : 'paused';
//             }
//         } catch (err) {
//             // ignore metadata errors
//         }

//         // apply volume & play/pause
//         if (audioRef.current) {
//             audioRef.current.volume = typeof volume === 'number' ? volume : 0.5;
//             if (isPlaying) {
//                 const p = audioRef.current.play();
//                 if (p && typeof p.catch === 'function') {
//                     p.catch(err => {
//                         if (err?.name !== 'NotAllowedError') console.error('Audio play error:', err);
//                     });
//                 }
//             } else {
//                 audioRef.current.pause();
//             }
//         }

//         // keep currentSongIndex for UI
//         if (selectedSong?.songList) {
//             const idx = selectedSong.songList.findIndex(s => (s._id || s.id) === (selectedSong._id || selectedSong.id));
//             setCurrentSongIndex(idx !== -1 ? idx : 0);
//         }

//         // ensure mediaSession playbackState reflects current play state
//         try { if (navigator.mediaSession) navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'; } catch {}

//         return () => {
//             if (audioRef.current) {
//                 audioRef.current.ontimeupdate = null;
//                 audioRef.current.onended = null;
//                 audioRef.current.onerror = null;
//             }
//         };
//     }, [selectedSong, isPlaying, volume]);

//     // keep playbackState in media session when play/pause toggles
//     useEffect(() => {
//         try { if (navigator.mediaSession) navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'; } catch {}
//     }, [isPlaying]);

//     const contextValue = {
//         selectedSong, setSelectedSong, isPlaying, setIsPlaying,
//         currentTime, setCurrentTime, volume, setVolume,
//         isMinimized, setIsMinimized, currentSongIndex, setCurrentSongIndex, audioRef,
//         nextTrack, prevTrack
//     };

//     return (
//         <MusicPlayerContext.Provider value={contextValue}>
//             {children}
//         </MusicPlayerContext.Provider>
//     );
// }

// function useMusicPlayer() {
//     return useContext(MusicPlayerContext);
// }

// // --- Auth Context ---
// const AuthContext = createContext();

// function AuthProvider({ children }) {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const processUserData = (userData) => {
//         if (userData && typeof userData.joinDate === 'string') {
//             return { ...userData, joinDate: new Date(userData.joinDate) };
//         }
//         return userData;
//     };

//     const fetchUserProfile = useCallback(async () => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/user/profile');
//                 setUser(processUserData(res.data));
//             } catch {
//                 setUser(null);
//                 localStorage.removeItem('token');
//                 delete axios.defaults.headers.common['Authorization'];
//             }
//         } else {
//             setUser(null);
//         }
//         setLoading(false);
//     }, []);

//     useEffect(() => {
//         fetchUserProfile();
//     }, [fetchUserProfile]);

//     const login = (token, userData, navigate) => {
//         localStorage.setItem('token', token);
//         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//         setUser(processUserData(userData));
//         sessionStorage.setItem('showWelcome', 'true');
//         navigate('/main');
//     };

//     const logout = (navigate) => {
//         localStorage.removeItem('token');
//         delete axios.defaults.headers.common['Authorization'];
//         setUser(null);
//         sessionStorage.removeItem('showWelcome');
//         navigate('/login');
//     };

//     const updateUser = async (userData) => {
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) return { success: false, message: 'No authentication token found.' };
//             await axios.put('https://music-backend-akb5.onrender.com/api/user/profile', userData, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             await fetchUserProfile();
//             return { success: true, message: 'Profile updated successfully!' };
//         } catch (error) {
//             return {
//                 success: false,
//                 message: error.response?.data?.message || 'Server error. Please try again later.',
//             };
//         }
//     };

//     return (
//         <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }

// function useAuth() {
//     return useContext(AuthContext);
// }

// // --- Playlist Context ---
// const PlaylistContext = createContext();

// function PlaylistProvider({ children }) {
//     const [playlists, setPlaylists] = useState([]);
//     const [playlistItemIds, setPlaylistItemIds] = useState(new Set());
//     const [loadingPlaylists, setLoadingPlaylists] = useState(false);
//     const { user } = useAuth();
//     const token = localStorage.getItem('token');

//     const fetchPlaylists = useCallback(async () => {
//         if (!user || !token) {
//             setPlaylists([]);
//             setPlaylistItemIds(new Set());
//             return;
//         }
//         setLoadingPlaylists(true);
//         try {
//             const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             const fetchedPlaylists = res.data || [];
//             setPlaylists(fetchedPlaylists);
//             const itemIds = new Set(
//                 fetchedPlaylists.flatMap(p => p.items?.map(item => item.itemRef?._id) || [])
//             );
//             setPlaylistItemIds(itemIds);
//         } catch (error) {
//             console.error('Failed to fetch playlists:', error);
//             setPlaylists([]);
//         } finally {
//             setLoadingPlaylists(false);
//         }
//     }, [user, token]);

//     useEffect(() => {
//         fetchPlaylists();
//     }, [fetchPlaylists]);

//     const addToPlaylist = async (itemId, playlistId, itemType) => {
//         try {
//             const playlist = playlists.find(p => p._id === playlistId);
//             if (playlist?.items?.some(item => item.itemRef?._id === itemId)) {
//                 return { success: false, message: 'Item already in playlist' };
//             }
//             await axios.post(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}/addItem`, 
//                 { itemType: itemType, itemRef: itemId },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             await fetchPlaylists();
//             return { success: true, message: 'Item added to playlist!' };
//         } catch (err) {
//             console.error('Failed to add item:', err);
//             return { success: false, message: 'Failed to add item.' };
//         }
//     };
    
//     const createPlaylist = async (name) => {
//         try {
//             await axios.post('https://music-backend-akb5.onrender.com/api/playlists', { name: name }, { headers: { Authorization: `Bearer ${token}` } });
//             await fetchPlaylists();
//             return { success: true, message: 'Playlist created!' };
//         } catch (error) {
//             console.error('Failed to create playlist:', error);
//             return { success: false, message: 'Failed to create playlist.' };
//         }
//     };

//     const removeItemFromPlaylist = async (playlistId, itemId) => {
//         try {
//             await axios.delete(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}/items/${itemId}`, 
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             await fetchPlaylists();
//             return { success: true, message: 'Item removed successfully!' };
//         } catch (error) {
//             console.error('Failed to remove item:', error);
//             return { success: false, message: 'Failed to remove item.' };
//         }
//     };

//     const value = { playlists, playlistItemIds, loadingPlaylists, addToPlaylist, createPlaylist, removeItemFromPlaylist };

//     return (
//         <PlaylistContext.Provider value={value}>
//             {children}
//         </PlaylistContext.Provider>
//     );
// }

// function usePlaylist() {
//     return useContext(PlaylistContext);
// }

// // --- Route Components ---
// function ProtectedRoute({ children }) {
//     const { user, loading } = useAuth();
//     if (loading) return <div className="loading"><div></div></div>;
//     if (!user) return <Navigate to="/login" replace />;
//     return children;
// }

// function PublicRoute({ children }) {
//     const { user, loading } = useAuth();
//     if (loading) return <div className="loading"><div></div></div>;
//     if (user) return <Navigate to="/main" replace />;
//     return children;
// }

// // --- UI Components ---
// function SplashScreen() {
//     const navigate = useNavigate();
//     const { user, loading } = useAuth();

//     useEffect(() => {
//         if (loading) return;
//         const timer = setTimeout(() => {
//             if (user) navigate('/main');
//             else navigate('/login');
//         }, 2000);
//         return () => clearTimeout(timer);
//     }, [navigate, user, loading]);
//     return (
//         <div className="splash-screen">
//             <h1>SunDhun</h1>
//         </div>
//     );
// }

// function AuthScreen() {
//     const [isLogin, setIsLogin] = useState(true);
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [fullName, setFullName] = useState('');
//     const [phone, setPhone] = useState('');
//     const [loading, setLoading] = useState(false);
//     const { login, user } = useAuth();
//     const navigate = useNavigate();
//     const [message, setMessage] = useState('');

//     useEffect(() => {
//         if (user) {
//             navigate('/main', { replace: true });
//         }
//     }, [user, navigate]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage('');
//         try {
//             const endpoint = isLogin ? 'https://music-backend-akb5.onrender.com/api/auth/login' : 'https://music-backend-akb5.onrender.com/api/auth/register';
//             const data = isLogin ? { email, password } : { fullName, email, password, phone };
//             const res = await axios.post(endpoint, data);
//             if (res.data.token && res.data.user) {
//                 login(res.data.token, res.data.user, navigate);
//             }
//         } catch (error) {
//             setMessage(error.response?.data?.message || 'An unknown error occurred');
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     return (
//         <div className="auth-screen">
//             <form onSubmit={handleSubmit} className="auth-form">
//                 <h2>{isLogin ? 'Login' : 'Signup'}</h2>
//                 {!isLogin && (
//                     <>
//                         <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required />
//                         <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" required />
//                     </>
//                 )}
//                 <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
//                 <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
//                 <button type="submit" disabled={loading}>{loading ? 'Processing...' : (isLogin ? 'Login' : 'Signup')}</button>
//                 <p className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Need an account? Signup' : 'Already have an account? Login'}</p>
//                 {message && <div className="error-message">{message}</div>}
//             </form>
//         </div>
//     );
// }

// function Navbar({ toggleSidebar }) {
//     const navigate = useNavigate();

//     return (
//         <div className="navbar">
//             <div className="navbar-logo" onClick={() => navigate('/main')}>SunDhun</div>
//             <div className="navbar-right">
//                 <div className="search-box" onClick={() => navigate('/search')}>
//                     <FontAwesomeIcon icon="fa-search" />
//                 </div>
//                 <div className="sidebar-toggle" onClick={toggleSidebar}>☰</div>
//             </div>
//         </div>
//     );
// }

// function Sidebar({ isOpen, onClose, onRequestSongOpen }) {
//     const navigate = useNavigate();
//     const { user, logout } = useAuth();
//     const { setSelectedSong, setIsPlaying, audioRef } = useMusicPlayer();
//     const { playlists, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
//     const [showModeDropdown, setShowModeDropdown] = useState(false);
//     const [mode, setMode] = useState(localStorage.getItem('mode') || 'dark');
//     const sidebarRef = useRef(null);

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (
//                 isOpen &&
//                 sidebarRef.current &&
//                 !sidebarRef.current.contains(event.target) &&
//                 !event.target.closest('.sidebar-toggle')
//             ) {
//                 onClose();
//                 setShowModeDropdown(false);
//                 setShowPlaylistDropdown(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [isOpen, onClose]);

//     useEffect(() => {
//         document.body.dataset.mode = mode;
//         localStorage.setItem('mode', mode);
//     }, [mode]);

//     const handleLogout = () => {
//         if (audioRef.current) {
//             audioRef.current.pause();
//             audioRef.current.src = '';
//         }
//         setIsPlaying(false);
//         setSelectedSong(null);
//         logout(navigate);
//         onClose();
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             const result = await createPlaylist(playlistName.trim());
//             if (result.success) {
//                 setShowPlaylistDropdown(true);
//             }
//         }
//     };
//     return (
//         <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
//             <a href="/account" onClick={(e) => { e.preventDefault(); navigate('/account'); onClose(); }}>Account</a>
//             <div className="sidebar-item-with-dropdown">
//                 <a href="#" onClick={(e) => { e.preventDefault(); setShowModeDropdown((prev) => !prev); }}>Mode</a>
//                 {showModeDropdown && (
//                     <div className="mode-dropdown">
//                         <span onClick={() => { setMode('dark'); setShowModeDropdown(false); }}>Dark</span>
//                         <span onClick={() => { setMode('light'); setShowModeDropdown(false); }}>Light</span>
//                         <span onClick={() => { setMode('neon'); setShowModeDropdown(false); }}>Neon</span>
//                     </div>
//                 )}
//             </div>
//             <a href="#" onClick={(e) => { e.preventDefault(); setShowPlaylistDropdown(!showPlaylistDropdown); }}>Playlist</a>
//             {showPlaylistDropdown && (
//                 <div className="playlist-dropdown">
//                     {loadingPlaylists ? <span>Loading...</span> : (
//                         <>
//                             {playlists.map(playlist => (
//                                 <span key={playlist._id} onClick={() => { navigate(`/playlist/${playlist._id}`); onClose(); }}>
//                                     {playlist.name}
//                                 </span>
//                             ))}
//                             <span onClick={handleCreatePlaylist} className="create-playlist">
//                                 <FontAwesomeIcon icon="fa-plus" /> Create New
//                             </span>
//                         </>
//                     )}
//                 </div>
//             )}
            
//           <a href="#" onClick={(e) => { e.preventDefault(); onRequestSongOpen(); onClose(); }}>Request a Song</a>
//             {user && (
//                 <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
//             )}
//         </div>
//     );
// }

// function MusicPlayer() {
//     const {
//         selectedSong,
//         setSelectedSong,
//         isPlaying,
//         setIsPlaying,
//         currentTime,
//         setCurrentTime,
//         volume,
//         setVolume,
//         isMinimized,
//         setIsMinimized,
//         currentSongIndex,
//         audioRef
//     } = useMusicPlayer();

//     const location = useLocation();
//     const excludedPaths = ['/login', '/'];
//     const showPlayer = !excludedPaths.includes(location.pathname);

//     useEffect(() => {
//         document.body.classList.toggle('no-scroll', !isMinimized);
//     }, [isMinimized]);

//     if (!selectedSong || !showPlayer) return null;

//     const togglePlay = () => setIsPlaying(!isPlaying);

//     const changeSong = (offset) => {
//         if (!selectedSong?.songList?.length) return;
//         const newIndex = (currentSongIndex + offset + selectedSong.songList.length) % selectedSong.songList.length;
//         setSelectedSong({ ...selectedSong.songList[newIndex], songList: selectedSong.songList });
//         setIsPlaying(true);
//     };

//     const handleTimeDrag = (e) => {
//         if (audioRef.current?.duration) {
//             const newTime = (e.target.value / 100) * audioRef.current.duration;
//             audioRef.current.currentTime = newTime;
//             setCurrentTime(newTime);
//         }
//     };

//     const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
//     const duration = audioRef.current?.duration || 0;
    
//     const thumbnailUrl = selectedSong.thumbnailUrl || selectedSong.thumbnail || 'https://placehold.co/100x100';
//     const primaryText = selectedSong.title || 'Unknown Title';
//     const secondaryText = selectedSong.singer || selectedSong.category || '';
//     const albumText = selectedSong.movie || selectedSong.movieName || selectedSong.genre || 'Audio';

//     return (
//         <div className={`music-player ${isMinimized ? 'minimized' : 'full-screen'}`}>
//             {isMinimized ? (
//                 <div className="player-minimized-content" onClick={() => setIsMinimized(false)}>
//                     <img src={thumbnailUrl} alt={primaryText} className="player-minimized-thumbnail" loading="lazy" />
//                     <div className="player-minimized-info">
//                         <h4>{primaryText}</h4>
//                         <p>{secondaryText}</p>
//                     </div>
//                     <div className="player-minimized-buttons">
//                         {/* REPLACED: when minimized, this button now advances to next track without opening full-screen */}
//                         <button
//                             className="minimize-player-button"
//                             onClick={(e) => { e.stopPropagation(); changeSong(1); }}
//                             aria-label="Next track"
//                         >
//                             <FontAwesomeIcon icon="fa-step-forward" />
//                         </button>

//                         <button className="close-player-button" onClick={(e) => { e.stopPropagation(); setSelectedSong(null); audioRef.current.pause(); audioRef.current.src = ''; }}>
//                             <FontAwesomeIcon icon="fa-times" />
//                         </button>
//                     </div>
//                 </div>
//             ) : (
//                 <>
//                     <button className="minimize-player-button" onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}>
//                         <FontAwesomeIcon icon="fa-chevron-down" />
//                     </button>
//                     <button className="close-player-button" onClick={(e) => { e.stopPropagation(); setSelectedSong(null); audioRef.current.pause(); audioRef.current.src = ''; }}>
//                         <FontAwesomeIcon icon="fa-times" />
//                     </button>
//                     <div className="player-content" onClick={(e) => e.stopPropagation()}>
//                         <div className="player-background-blur" style={{ backgroundImage: `url(${thumbnailUrl})` }}></div>
//                         <div className="player-foreground-content">
//                             <img src={thumbnailUrl} alt={primaryText} className="player-main-thumbnail" loading="lazy" />
//                             <div className="song-info">
//                                 <h2>{primaryText}</h2>
//                                 <h3>{secondaryText}</h3>
//                                 <p className="song-album">{albumText}</p>
//                             </div>
//                             <div className="controls">
//                                 <div className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</div>
//                                 <input type="range" min="0" max="100" value={duration ? (currentTime / duration) * 100 : 0} onChange={handleTimeDrag} className="progress-bar" style={{ '--progress': duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
//                                 <div className="player-buttons">
//                                     <button onClick={() => changeSong(-1)}><FontAwesomeIcon icon="fa-step-backward" /></button>
//                                     <button onClick={togglePlay}><FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} /></button>
//                                     <button onClick={() => changeSong(1)}><FontAwesomeIcon icon="fa-step-forward" /></button>
//                                 </div>
//                                 <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="volume-slider" />
//                             </div>
//                         </div>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }
// function SongList({ songs, onSongClick, onAddToPlaylist, playlistItemIds }) {
//     return (
//         <div className="songs-row">
//             {songs.map((song) => (
//                 <div
//                     key={song._id}
//                     className="song-tile"
//                     onClick={() => onSongClick(song)}
//                 >
//                     <img
//                         src={song.thumbnailUrl || 'https://placehold.co/120x120/333/FFF?text=♪'}
//                         alt={song.title}
//                         className="song-tile-thumbnail"
//                         loading="lazy"
//                     />
//                     <div className="song-tile-details">
//                         <div className="song-tile-title">{song.title}</div>
//                         <div className="song-tile-singer">{song.singer}</div>
//                         <div className="song-tile-label">{song.movie ? song.movie : 'Album'}</div>
//                     </div>
//                     {!playlistItemIds.has(song._id) && (
//                         <button
//                             className="add-song-button"
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 onAddToPlaylist(song._id, 'Song');
//                             }}
//                             title="Add to Playlist"
//                         >
//                             <FontAwesomeIcon icon="fa-plus" />
//                         </button>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// }

// function LifeLessonList({ items, onItemClick, onAddToPlaylist, playlistItemIds }) {
//     return (
//         <div className="songs-row">
//             {items.map((item) => (
//                 <div
//                     key={item._id}
//                     className="song-tile"
//                     onClick={() => onItemClick(item)}
//                 >
//                     <img
//                         src={item.thumbnail || 'https://placehold.co/120x120/333/FFF?text=♪'}
//                         alt={item.title}
//                         className="song-tile-thumbnail"
//                         loading="lazy"
//                     />
//                     <div className="song-tile-details">
//                         <div className="song-tile-title">{item.title}</div>
//                     </div>
//                     {!playlistItemIds.has(item._id) && (
//                         <button
//                             className="add-song-button"
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 onAddToPlaylist(item._id, 'LifeLesson');
//                             }}
//                             title="Add to Playlist"
//                         >
//                             <FontAwesomeIcon icon="fa-plus" />
//                         </button>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// }

// function OTSList({ items, onItemClick, onAddToPlaylist, playlistItemIds }) {
//     return (
//         <div className="songs-row">
//             {items.map((item) => (
//                 <div
//                     key={item._id}
//                     className="song-tile"
//                     onClick={() => onItemClick(item)}
//                 >
//                     <img
//                         src={item.thumbnail || 'https://placehold.co/120x120/333/FFF?text=♪'}
//                         alt={item.title}
//                         className="song-tile-thumbnail"
//                         loading="lazy"
//                     />
//                     <div className="song-tile-details">
//                         <div className="song-tile-title">{item.title}</div>
//                         <div className="song-tile-label">{item.movieName || 'OTS'}</div>
//                     </div>
//                     {!playlistItemIds.has(item._id) && (
//                         <button
//                             className="add-song-button"
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 onAddToPlaylist(item._id, 'OTS');
//                             }}
//                             title="Add to Playlist"
//                         >
//                             <FontAwesomeIcon icon="fa-plus" />
//                         </button>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// }

// function PlaylistSelectionModal({ isOpen, onClose, onSelectPlaylist, playlists, loading, message, onCreatePlaylist }) {
//     if (!isOpen) return null;
//     return (
//         <div className="playlist-modal-overlay" onClick={onClose}>
//             <div className="playlist-modal" onClick={(e) => e.stopPropagation()}>
//                 <h4>Select Playlist</h4>
//                 {loading ? (
//                     <div className="loading-bar">
//                         <div className="loading-bar-progress"></div>
//                     </div>
//                 ) : playlists.length > 0 ? (
//                     <ul>
//                         {playlists.map((pl) => (
//                             <li key={pl._id}>
//                                 <button className="playlist-modal-btn" onClick={() => onSelectPlaylist(pl._id)}>
//                                     {pl.name}
//                                 </button>
//                             </li>
//                         ))}
//                     </ul>
//                 ) : (
//                     <div className="no-playlist-container">
//                         <p>No playlists found.</p>
//                         <button className="create-playlist-btn" onClick={onCreatePlaylist}>
//                             Create Playlist
//                         </button>
//                     </div>
//                 )}
//                 {message && <div className="playlist-modal-message">{message}</div>}
//                 <button className="playlist-modal-cancel" onClick={onClose}>Cancel</button>
//             </div>
//         </div>
//     );
// }

// function RequestSongModal({ isOpen, onClose }) {
//     const [requests, setRequests] = useState([{ title: '', movie: '' }]);
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState('');
//     const [isSuccess, setIsSuccess] = useState(false);
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         if (isOpen) {
//             setRequests([{ title: '', movie: '' }]);
//             setMessage('');
//             setLoading(false);
//             setIsSuccess(false);
//         }
//     }, [isOpen]);

//     const handleRequestChange = (index, field, value) => {
//         const newRequests = [...requests];
//         newRequests[index][field] = value;
//         setRequests(newRequests);
//     };

//     const handleAddRequest = () => {
//         if (requests.length < 5) {
//             setRequests([...requests, { title: '', movie: '' }]);
//         }
//     };
//     const handleRemoveRequest = (index) => {
//         if (requests.length > 1) {
//             const newRequests = requests.filter((_, i) => i !== index);
//             setRequests(newRequests);
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setMessage('');

//         const validRequests = requests.filter(req => req.title.trim() && req.movie.trim());

//         if (validRequests.length === 0) {
//             setMessage('Please fill out at least one complete song request.');
//             return;
//         }

//         if (validRequests.length !== requests.filter(r => r.title.trim() || r.movie.trim()).length) {
//             setMessage('Please fill out both song title and movie/album for each request line.');
//             return;
//         }

//         setLoading(true);
//         try {
//             await axios.post('https://music-backend-akb5.onrender.com/api/song-requests', validRequests, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setLoading(false);
//             setIsSuccess(true);
//             setMessage('Your requests have been submitted successfully!');
            
//             setTimeout(() => {
//                 onClose();
//             }, 1000);
//         } catch (error) {
//             setLoading(false);
//             setMessage(error.response?.data?.message || 'Failed to submit requests. Please try again.');
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="request-song-modal-overlay" onClick={onClose}>
//             <div className="request-song-modal" onClick={(e) => e.stopPropagation()}>
//                 {isSuccess ? (
//                     <div className="request-success-view">
//                         <FontAwesomeIcon icon="fa-check-circle" style={{fontSize: '3rem', color: '#4caf50', marginBottom: '1rem'}}/>
//                         <h3>Success!</h3>
//                         <p>{message}</p>
//                     </div>
//                 ) : (
//                     <>
//                         <h3 className="request-song-modal-header">Request a Song</h3>
//                         <p className="request-song-modal-subheader">You can request up to 5 songs.</p>
//                         <form onSubmit={handleSubmit}>
//                             <div className="request-list">
//                                 {requests.map((req, index) => (
//                                     <div key={index} className="request-item">
//                                         <input
//                                             type="text"
//                                             placeholder="Song Title"
//                                             value={req.title}
//                                             onChange={(e) => handleRequestChange(index, 'title', e.target.value)}
//                                             className="request-input"
//                                             required
//                                         />
//                                         <input
//                                             type="text"
//                                             placeholder="Movie / Album"
//                                             value={req.movie}
//                                             onChange={(e) => handleRequestChange(index, 'movie', e.target.value)}
//                                             className="request-input"
//                                             required
//                                         />
//                                         <button
//                                             type="button"
//                                             onClick={() => handleRemoveRequest(index)}
//                                             className="remove-request-btn"
//                                             disabled={requests.length <= 1 || loading}
//                                             title="Remove request"
//                                         >
//                                             <FontAwesomeIcon icon="fa-times" />
//                                         </button>
//                                     </div>
//                                 ))}
//                             </div>
//                             <div className="request-song-actions">
//                                 <button
//                                     type="button"
//                                     onClick={handleAddRequest}
//                                     className="add-request-btn"
//                                     disabled={requests.length >= 5 || loading}
//                                 >
//                                     <FontAwesomeIcon icon="fa-plus" /> Add another
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="submit-requests-btn"
//                                     disabled={loading}
//                                 >
//                                     {loading ? 'Submitting...' : 'Submit Requests'}
//                                 </button>
//                             </div>
//                             <div className="request-song-modal-footer">
//                                 {message && <div className="request-modal-message">{message}</div>}
//                                 <button type="button" className="request-modal-cancel" onClick={onClose} disabled={loading}>
//                                     Cancel
//                                 </button>
//                             </div>
//                         </form>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }

// function MoodsScreen({ openRequestModal }) {
//   const navigate = useNavigate();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const moodCategories = [
//     { name: 'happy', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513535/hap_oihkap.jpg' },
//     { name: 'sad', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/sad_lbqcin.jpg' },
//     { name: 'workout', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752961155/gym_ivap8k.png' },
//      { name: 'love', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752515509/love_bnjlgc.jpg' },
//       { name: 'travel', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/travel_xwu6mq.jpg' },
//     { name: 'heartbreak', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513535/heartb_deh8ds.png' },
//     { name: 'spiritual', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513536/spi_o1tzp7.png' },
//     { name: 'motivational', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/motiva_bvntm6.jpg' },
//     { name: 'nostalgic', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/nos_tv6k55.jpg' },
    
//   ];

//   return (
//     <div className="moods-page-screen">
//       <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//       <Sidebar
//         isOpen={isSidebarOpen}
//         onClose={() => setIsSidebarOpen(false)}
//         onRequestSongOpen={openRequestModal}
//       />
//       <div className="moods-screen content-area">
//         <h2>Choose Your Mood</h2>
//         <div className="mood-cards">
//           {moodCategories.map((mood) => (
//             <div
//               key={mood.name}
//               className="mood-card"
//               onClick={() => navigate(`/moods/${mood.name}`)}
//             >
//               <img src={mood.image} alt={mood.name} />
//             </div>
//           ))}
//         </div>
//       </div>
//       <MusicPlayer />
//     </div>
//   );
// }

// function LifeLessonsScreen({ openRequestModal }) {
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [lifeLessons, setLifeLessons] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [itemToAdd, setItemToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         const fetchLifeLessons = async () => {
//             if (!token) return;
//             setLoading(true);
//             setError(null);
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/lifelessons/all', {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setLifeLessons(Array.isArray(res.data) ? res.data : []);
//             } catch (err) {
//                 console.error('Failed to fetch life lessons:', err);
//                 setError('Failed to fetch life lessons. Please try again later.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchLifeLessons();
//     }, [token]);

//     const handleAddToPlaylist = (itemId, itemType) => {
//         setItemToAdd({ id: itemId, type: itemType });
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         if (!itemToAdd) return;
//         const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
//         setAddMessage(result.message);
//         if (result.success) {
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setItemToAdd(null);
//             }, 1000);
//         }
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             await createPlaylist(playlistName.trim());
//         }
//     };

//     return (
//         <div className="lifelessons-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 <h2>Life Lessons</h2>
//                 {loading ? (
//                     <div className="loading"><div></div></div>
//                 ) : error ? (
//                     <div className="search-message">{error}</div>
//                 ) : lifeLessons.length > 0 ? (
//                     <LifeLessonList
//                         items={lifeLessons}
//                         onItemClick={(item) => {
//                             setSelectedSong({ ...item, songList: lifeLessons });
//                             setIsPlaying(true);
//                             setIsMinimized(false);
//                         }}
//                         onAddToPlaylist={handleAddToPlaylist}
//                         playlistItemIds={playlistItemIds}
//                     />
//                 ) : (
//                     <div className="search-message">No life lessons found.</div>
//                 )}
//             </div>
//             <PlaylistSelectionModal
//                 isOpen={showPlaylistModal}
//                 onClose={() => setShowPlaylistModal(false)}
//                 onSelectPlaylist={handleSelectPlaylist}
//                 playlists={playlists}
//                 loading={loadingPlaylists}
//                 message={addMessage}
//                 onCreatePlaylist={handleCreatePlaylist}
//             />
//             <MusicPlayer />
//         </div>
//     );
// }

// // NEW COMPONENT
// function OTSScreen({ openRequestModal }) {
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [otsItems, setOtsItems] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [itemToAdd, setItemToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         const fetchOtsItems = async () => {
//             if (!token) return;
//             setLoading(true);
//             setError(null);
//             try {
//                 // NOTE: Using assumed API endpoint /api/ots/all as it was not provided.
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/ots/all', {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setOtsItems(Array.isArray(res.data) ? res.data : []);
//             } catch (err) {
//                 console.error('Failed to fetch OTS items:', err);
//                 setError('Failed to fetch OTS items. Please try again later.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchOtsItems();
//     }, [token]);

//     const handleAddToPlaylist = (itemId, itemType) => {
//         setItemToAdd({ id: itemId, type: itemType });
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         if (!itemToAdd) return;
//         const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
//         setAddMessage(result.message);
//         if (result.success) {
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setItemToAdd(null);
//             }, 1000);
//         }
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             await createPlaylist(playlistName.trim());
//         }
//     };

//     return (
//         <div className="ots-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 <h2>OTS</h2>
//                 {loading ? (
//                     <div className="loading"><div></div></div>
//                 ) : error ? (
//                     <div className="search-message">{error}</div>
//                 ) : otsItems.length > 0 ? (
//                     <OTSList
//                         items={otsItems}
//                         onItemClick={(item) => {
//                             setSelectedSong({ ...item, songList: otsItems });
//                             setIsPlaying(true);
//                             setIsMinimized(false);
//                         }}
//                         onAddToPlaylist={handleAddToPlaylist}
//                         playlistItemIds={playlistItemIds}
//                     />
//                 ) : (
//                     <div className="search-message">No OTS items found.</div>
//                 )}
//             </div>
//             <PlaylistSelectionModal
//                 isOpen={showPlaylistModal}
//                 onClose={() => setShowPlaylistModal(false)}
//                 onSelectPlaylist={handleSelectPlaylist}
//                 playlists={playlists}
//                 loading={loadingPlaylists}
//                 message={addMessage}
//                 onCreatePlaylist={handleCreatePlaylist}
//             />
//             <MusicPlayer />
//         </div>
//     );
// }

// function MainScreen({ openRequestModal }) {
//   const { user } = useAuth();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(false);
//   const navigate = useNavigate();

//   const singersContainerRef = useRef(null);
//   const [showPrev, setShowPrev] = useState(false);
//   const [showNext, setShowNext] = useState(true);

//   useEffect(() => {
//     if (sessionStorage.getItem('showWelcome')) {
//       setShowWelcome(true);
//       const timer = setTimeout(() => {
//         setShowWelcome(false);
//         sessionStorage.removeItem('showWelcome');
//       }, 2500);
//       return () => clearTimeout(timer);
//     }
//   }, [user]);

//   useEffect(() => {
//     const container = singersContainerRef.current;
//     if (!container) return;
//     const handleScroll = () => {
//       const { scrollLeft, scrollWidth, clientWidth } = container;
//       setShowPrev(scrollLeft > 0);
//       setShowNext(scrollLeft < scrollWidth - clientWidth - 1);
//     };
//     handleScroll();
//     container.addEventListener('scroll', handleScroll);
//     return () => container.removeEventListener('scroll', handleScroll);
//   }, []);

//   const singers = [
//     { name: '', id: 'sonu nigam', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/sonu_ztsynp.webp' },
//     { name: '', id: 'lata mangeshkar', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/lata_ezfr2n.webp' },
//     { name: '', id: 'kk', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/kk_py1off.webp' },
//     { name: '', id: 'mohd rafi', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/rafi_n9wslm.webp' },
//     { name: '', id: 'kailash kher', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751878756/kail_ufykhi.jpg' },
//     { name: '', id: 'neha kakkar', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/neha_lzh67j.webp' },
//     { name: '', id: 'kishore kumar', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/kishor_smr0v8.webp' },
//     { name: '', id: 'anirudh', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/ani_wbajfs.webp' },
//     { name: '', id: 'rahat fateh ali khan', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751787551/raha_hinul7.png' },
//     { name: '', id: 'udit narayan', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751878759/udit_idlojx.png' },
//     { name: '', id: 'diljit dosanjh', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/diljit_ftpuid.webp' },
//     { name: '', id: 'jubin nautiyal', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/jubin_am3rn2.webp' },
//     { name: '', id: 'shreya ghoshal', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/sherya_qkynbl.webp' },
//     { name: '', id: 'arijit singh', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/arjit_g4zpgt.webp' },
//     { name: '', id: 'shaan', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751878758/shaan_ayuxds.png' },
//     { name: '', id: 'monali thakur', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751878760/monali_qdoefu.png' },
//   ];
//   const genres = [
//     { name: '', id: 'rap', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751730905/rap_g0sheq.jpg ' },
//     { name: '', id: 'classical', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751730906/class_kh980u.png ' },
//     { name: '', id: 'party', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751730905/party_lm1glx.jpg ' },
//     { name: '', id: 'lo-fi', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751730905/lofi_mpmwqv.jpg ' },
//   ];

//   const scrollSingers = (direction) => {
//     if (singersContainerRef.current) {
//       const scrollAmount = direction === 'right' ? 400 : -400;
//       singersContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
//     }
//   };

//   const handleSingerClick = (singerId) => {
//     navigate(`/singers/${encodeURIComponent(singerId)}`);
//   };

//   const handleGenreClick = (genreId) => {
//     navigate(`/genres/${encodeURIComponent(genreId)}`);
//   };

//   return (
//     <div className="main-screen">
//       {showWelcome && user && (
//         <div className="welcome-overlay fade-in-out">
//           Welcome, {user.fullName.split(' ')[0]}!
//         </div>
//       )}

//       <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//       <Sidebar
//         isOpen={isSidebarOpen}
//         onClose={() => setIsSidebarOpen(false)}
//         onRequestSongOpen={openRequestModal}
//       />

//       <div className="content-area">
//         <section className="singers-section">
//           <h2>Artist Spotlight</h2>
//           <div className="singers-container">
//             <div className="singers-scroll" ref={singersContainerRef}>
//               {singers.map((singer) => (
//                 <div
//                   key={singer.id}
//                   className="singer-card"
//                   onClick={() => handleSingerClick(singer.id)}
//                 >
//                   <img src={singer.imageFileName} alt={singer.name} className="singer-card-image fade-in" loading="lazy" />
//                   <h3>{singer.name}</h3>
//                 </div>
//               ))}
//             </div>
//             {showPrev && ( <button className="singers-scroll-btn left" onClick={() => scrollSingers('left')}><FontAwesomeIcon icon="fa-chevron-left" /></button> )}
//             {showNext && ( <button className="singers-scroll-btn right" onClick={() => scrollSingers('right')}><FontAwesomeIcon icon="fa-chevron-right" /></button> )}
//           </div>
//         </section>

//        <section className="mood-section">
//   <h2>Explore</h2>
//   <div className="mood-cards">
//     <div
//       className="explore-card"
//       onClick={() => navigate('/moods')}
//     >
//       <img
//         src="https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/mood_b1af7g.jpg"
//         alt="Moods"
//       />
//     </div>

//     <div
//       className="explore-card"
//       onClick={() => navigate('/ots')}
//     >
//       <img
//         src="https://res.cloudinary.com/dt2nr7rjg/image/upload/v1764221872/ost_ulo8a3.png"
//         alt="OTS"
//       />
//     </div>

//      <div
//       className="explore-card"
//       onClick={() => navigate('/lifelessons')}
//     >
//       <img
//         src="https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752523470/WhatsApp_Image_2025-07-15_at_01.34.03_bba81101_rybrke.jpg"
//         alt="Life Lessons"
//       />
//     </div>
//   </div>
// </section>

//         <section className="genre-section">
//           <h2>Genres</h2>
//           <div className="genres-cards">
//             {genres.map((genre) => (
//               <div key={genre.id} className="genre-card" onClick={() => handleGenreClick(genre.id)}>
//                 <img src={genre.imageFileName} alt={genre.name} className="genre-card-image fade-in" loading="lazy" />
//                 <h3>{genre.name}</h3>
//               </div>
//             ))}
//           </div>
//         </section>
//       </div>
//       <MusicPlayer />
//     </div>
//   );
// }

// function SearchScreen({ openRequestModal }) {
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [loadingSearch, setLoadingSearch] = useState(false);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [itemToAdd, setItemToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [isListening, setIsListening] = useState(false);
//     const [voiceError, setVoiceError] = useState('');
//     const recognitionRef = useRef(null);
//     const token = localStorage.getItem('token');

//     const debouncedSearch = useMemo(() => {
//         let timeoutId;
//         return (query) => {
//             clearTimeout(timeoutId);
//             if (!query.trim()) {
//                 setSearchResults([]);
//                 setLoadingSearch(false);
//                 return;
//             }
//             timeoutId = setTimeout(async () => {
//                 setLoadingSearch(true);
//                 try {
//                     const url = `https://music-backend-akb5.onrender.com/api/songs?search=${encodeURIComponent(query.trim())}`;
//                     const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
//                     setSearchResults(Array.isArray(res.data) ? res.data : []);
//                 } catch (error) {
//                     console.error('Search error:', error);
//                     setSearchResults([]);
//                 } finally {
//                     setLoadingSearch(false);
//                 }
//             }, 300);
//         };
//     }, [token]);

//     useEffect(() => {
//         debouncedSearch(searchQuery);
//     }, [searchQuery, debouncedSearch]);

//     const handleAddToPlaylist = (itemId, itemType) => {
//         setItemToAdd({ id: itemId, type: itemType });
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         if (!itemToAdd) return;
//         const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
//         setAddMessage(result.message);
//         if (result.success) {
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setItemToAdd(null);
//             }, 1000);
//         }
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             await createPlaylist(playlistName.trim());
//         }
//     };

//     const checkMicrophonePermission = useCallback(async () => {
//         try {
//             const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
//             if (permissionStatus.state === 'denied') {
//                 setVoiceError('Microphone access denied.');
//                 return false;
//             }
//             return true;
//         } catch (err) {
//             setVoiceError('Error checking mic permissions.');
//             return false;
//         }
//     }, []);

//     const startVoiceSearch = useCallback(async () => {
//         const hasPermission = await checkMicrophonePermission();
//         if (!hasPermission) return;

//         const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//         if (!SpeechRecognition) {
//             setVoiceError('Voice search not supported.');
//             return;
//         }

//         recognitionRef.current = new SpeechRecognition();
//         recognitionRef.current.lang = 'en-US';
//         recognitionRef.current.interimResults = true;
//         recognitionRef.current.onstart = () => setIsListening(true);
//         recognitionRef.current.onresult = (event) => setSearchQuery(event.results[0][0].transcript);
//         recognitionRef.current.onerror = (event) => {
//             setIsListening(false);
//             setVoiceError('Voice recognition error: ' + event.error);
//         };
//         recognitionRef.current.onend = () => setIsListening(false);
//         recognitionRef.current.start();
//     }, [checkMicrophonePermission]);

//     const toggleVoiceSearch = useCallback(() => {
//         if (isListening) {
//             recognitionRef.current?.stop();
//         } else {
//             startVoiceSearch();
//         }
//     }, [isListening, startVoiceSearch]);

//     useEffect(() => {
//         return () => recognitionRef.current?.stop();
//     }, []);

//     return (
//         <div className="search-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 <h2>Search Songs</h2>
//                 <div className="search-input-container">
//                     <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input-field" placeholder="Search..." autoFocus/>
//                     <button className={`mic-button ${isListening ? 'listening' : ''}`} onClick={toggleVoiceSearch} title="Voice Search">
//                         <FontAwesomeIcon icon={isListening ? 'fa-microphone-slash' : 'fa-microphone'} />
//                     </button>
//                 </div>
//                 {voiceError && <div className="error-message">{voiceError}</div>}
//                 <div className="search-results-section">
//                     {loadingSearch ? <div className="search-message">Searching...</div> :
//                      searchQuery.trim() && searchResults.length > 0 ? (
//                         <SongList
//                             songs={searchResults}
//                             onSongClick={(song) => {
//                                 setSelectedSong({ ...song, songList: searchResults });
//                                 setIsPlaying(true);
//                                 setIsMinimized(false);
//                             }}
//                             onAddToPlaylist={handleAddToPlaylist}
//                             playlistItemIds={playlistItemIds}
//                         />
//                     ) : searchQuery.trim() && !loadingSearch ? (
//                         <div className="search-message">No songs found.</div>
//                     ) : null}
//                 </div>
//             </div>
//             <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} onCreatePlaylist={handleCreatePlaylist}/>
//             <MusicPlayer />
//         </div>
//     );
// }

// function PlaylistDetailScreen({ openRequestModal }) {
//     const { playlistId } = useParams();
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, removeItemFromPlaylist, loadingPlaylists } = usePlaylist();
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
//     const playlist = useMemo(() => playlists.find((p) => p._id === playlistId), [playlists, playlistId]);

//     const handleRemoveItem = async (itemId) => {
//         if (!window.confirm('Are you sure?')) return;
//         const result = await removeItemFromPlaylist(playlistId, itemId);
//         setMessage(result.message);
//         setTimeout(() => setMessage(''), 2000);
//     };

//     if (loadingPlaylists) return <div className="content-area loading"><div></div></div>;
//     if (!playlist) return <div className="content-area"><p>Playlist not found.</p></div>;

//     const playableList = playlist.items?.map(item => ({...(item.itemRef), _id: item.itemRef?._id || item._id})) || [];

//     return (
//         <div className="playlist-detail-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 <h2>{playlist.name}</h2>
//                 {message && <div className="info-message">{message}</div>}

//                 {playlist.items?.length > 0 ? (
//                     <div className="songs-column">
//                         {playlist.items.map((item) => (
//                             item?.itemRef && (
//                             <div
//                                 key={item._id}
//                                 className="song-card full-line"
//                                 onClick={() => {
//                                     setSelectedSong({ ...item.itemRef, songList: playableList });
//                                     setIsPlaying(true);
//                                     setIsMinimized(false);
//                                 }}
//                             >
//                                 <img
//                                     src={item.itemRef.thumbnail || item.itemRef.thumbnailUrl || 'https://placehold.co/50x50'}
//                                     alt={item.itemRef.title}
//                                     className="song-thumbnail"
//                                     loading="lazy"
//                                 />
//                                 <div className="song-details">
//                                     <h4>{item.itemRef.title}</h4>
//                                     <p>{item.itemRef.singer || item.itemRef.movieName || item.itemType}</p>
//                                 </div>
//                                 <button
//                                     className="remove-song-button"
//                                     onClick={(e) => { e.stopPropagation(); handleRemoveItem(item._id); }}
//                                 >
//                                     <FontAwesomeIcon icon="fa-minus" />
//                                 </button>
//                             </div>
//                             )
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="search-message">This playlist is empty.</div>
//                 )}
//             </div>
//             <MusicPlayer />
//         </div>
//     );
// }


// function CategorySongsScreen({ categoryType, openRequestModal }) {
//     const { name } = useParams();
//     const { user } = useAuth();
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [songs, setSongs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [itemToAdd, setItemToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [randomMessage, setRandomMessage] = useState('');
//     const [error, setError] = useState(null);
//     const [showTitle, setShowTitle] = useState(false);
    
//     // NEW: Language filter states
//     const [selectedLanguage, setSelectedLanguage] = useState('all');
//     const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
//     const languageWrapperRef = useRef(null); // <-- ref for outside click
     
//     const token = localStorage.getItem('token');
    
//     const languages = [
//         { value: 'all', label: 'All' },
//         { value: 'hindi', label: 'Hindi' },
//         { value: 'english', label: 'English' },
//         { value: 'punjabi', label: 'Punjabi' },
//         { value: 'telugu', label: 'Telugu' },
//         { value: 'kannada', label: 'Kannada' },
//         { value: 'tamil', label: 'Tamil' }
//     ];

//     const messagesConfig = useMemo(() => ({
//         love: ["Hey ${username}, let your heart sing louder than words.", "${username}, fall in love with every note."],
//         travel: ["Adventure awaits, ${username} — let the music guide you.", "Wanderlust in every beat, just for you ${username}."],
//         happy: ["Smile wide, ${username} — these songs are your sunshine.", "Turn up the joy, ${username}, and dance like no one's watching."],
//         sad: ["It's okay to feel, ${username} — let these songs hold you.", "Lean on these melodies, ${username}, when words aren't enough."],
//         motivational: ["Rise and conquer, ${username} — let the music push you.", "Fuel your fire, ${username}, one beat at a time."],
//         nostalgic: ["A trip down memory lane for you, ${username}.", "Relive the golden days with these songs, ${username}."],
//         heartbreak: ["Some songs understand you better than words, ${username}.", "Let it all out, ${username} — these tracks feel your pain."],
//         spiritual: ["Find your center, ${username}, in every chord.", "Breathe deeply with these mindful tunes, ${username}."],
//         calm: ["Slow down, ${username} — breathe with these soothing sounds.", "Ease your mind, ${username}, with gentle melodies."],
//         rap: ["Spit fire, ${username}, let the beats talk.", "Get in the zone with these bars, ${username}."],
//         party: ["Let's turn it up, ${username} — the party starts here.", "${username}, dance like nobody's watching."],
//         classical: ["Timeless beauty in every note for you, ${username}.", "Close your eyes and let it flow, ${username}."],
//         'lo-fi': ["Chill out, ${username}, with these mellow beats.", "Your perfect study companion, ${username}."]
//     }), []);

//     // UPDATED: Fetch songs with language filter
//     useEffect(() => {
//         setLoading(true);
//         setError(null);
        
//         let apiUrl = `https://music-backend-akb5.onrender.com/api/songs?${categoryType}=${encodeURIComponent(name)}`;
        
//         // ADD LANGUAGE FILTER TO API CALL
//         if (selectedLanguage !== 'all') {
//             apiUrl += `&language=${encodeURIComponent(selectedLanguage)}`;
//         }
        
//         axios.get(apiUrl, { headers: { Authorization: `Bearer ${token}` } })
//         .then(res => setSongs(Array.isArray(res.data) ? res.data : []))
//         .catch(err => setError(`Failed to fetch songs: ${err.message || 'Server error'}`))
//         .finally(() => setLoading(false));
//     }, [name, categoryType, token, selectedLanguage]); // Added selectedLanguage dependency

//     // Close language dropdown when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (e) => {
//             if (showLanguageDropdown && languageWrapperRef.current && !languageWrapperRef.current.contains(e.target)) {
//                 setShowLanguageDropdown(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, [showLanguageDropdown]);

//     useEffect(() => {
//         const firstName = user?.fullName?.split(' ')[0] || 'friend';
//         const messages = messagesConfig[name] || [];
//         if (songs.length > 0 && messages.length > 0) {
//             const personalized = messages[Math.floor(Math.random() * messages.length)].replace(/\${username}/g, firstName);
//             setRandomMessage(personalized);
//             setShowTitle(false);
//             const timeout = setTimeout(() => {
//                 setRandomMessage('');
//                 setShowTitle(true);
//             }, 6500);
//             return () => clearTimeout(timeout);
//         }
//     }, [name, songs, user, messagesConfig]);

//     const handleAddToPlaylist = (itemId, itemType) => {
//         setItemToAdd({ id: itemId, type: itemType });
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     }; 

//     const handleSelectPlaylist = async (playlistId) => {
//         if (!itemToAdd) return;
//         const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
//         setAddMessage(result.message);
//         if (result.success) {
//             setTimeout(() => { setShowPlaylistModal(false); setItemToAdd(null); }, 1000);
//         }
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             await createPlaylist(playlistName.trim());
//         }
//     };

//     // NEW: Handle language selection
//     const handleLanguageSelect = (language) => {
//         setSelectedLanguage(language);
//         setShowLanguageDropdown(false);
//     };

//     if (!user) return <div className="content-area"><p>Please log in.</p></div>;

//     return (
//         <div className="mood-songs-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 {randomMessage && <div className="random-message animate-fade-in-out">{randomMessage}</div>}
//                 {showTitle && <h2 className="category-title fade-in">{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>}
                
//                 {/* NEW: Language Filter Dropdown - ADD THIS IN MOOD SECTION */}
//                 <div className="language-filter-container" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
//                     <div className="language-dropdown-wrapper" style={{ position: 'relative', display: 'inline-block' }} ref={languageWrapperRef}>
//                         <button 
//                             className="language-filter-btn" 
//                             onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
//                             style={{
//                                 background: '#333',
//                                 color: 'white',
//                                 border: '1px solid #555',
//                                 padding: '8px 16px',
//                                 borderRadius: '8px',
//                                 cursor: 'pointer',
//                                 fontSize: '14px',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: '8px'
//                             }}
//                         >
//                             <FontAwesomeIcon icon="fa-globe" />
//                             {languages.find(lang => lang.value === selectedLanguage)?.label || 'All'}
//                             <FontAwesomeIcon icon={showLanguageDropdown ? "fa-chevron-up" : "fa-chevron-down"} />
//                         </button>
                        
//                         {showLanguageDropdown && (
//                             <div className="language-dropdown" 
//                                 style={{
//                                     position: 'absolute',
//                                     top: '100%',
//                                     right: 0,
//                                     background: '#222',
//                                     border: '1px solid #444',
//                                     borderRadius: '8px',
//                                     boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
//                                     zIndex: 1000,
//                                     minWidth: '140px'
//                                 }}
//                             >
//                                 {languages.map((language) => (
//                                     <div
//                                         key={language.value}
//                                         className="language-option"
//                                         onClick={() => handleLanguageSelect(language.value)}
//                                         style={{
//                                             padding: '12px 16px',
//                                             cursor: 'pointer',
//                                             color: 'white',
//                                             fontSize: '14px',
//                                             borderBottom: language.value === languages[languages.length - 1].value ? 'none' : '1px solid #444'
//                                         }}
//                                         onMouseEnter={(e) => e.target.style.background = '#444'}
//                                         onMouseLeave={(e) => e.target.style.background = 'transparent'}
//                                     >
//                                         {language.label}
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {loading ? <div className="loading"><div></div></div> : 
//                  error ? <div className="search-message">{error}</div> : 
//                  songs.length > 0 ? (
//                     <SongList 
//                         songs={songs} 
//                         onSongClick={(song) => { 
//                             setSelectedSong({ ...song, songList: songs }); 
//                             setIsPlaying(true); 
//                             setIsMinimized(false); 
//                         }} 
//                         onAddToPlaylist={handleAddToPlaylist} 
//                         playlistItemIds={playlistItemIds}
//                     />
//                 ) : (
//                     <div className="search-message">No songs found for this category.</div>
//                 )}
//             </div>
//             <PlaylistSelectionModal 
//                 isOpen={showPlaylistModal} 
//                 onClose={() => setShowPlaylistModal(false)} 
//                 onSelectPlaylist={handleSelectPlaylist} 
//                 playlists={playlists} 
//                 loading={loadingPlaylists} 
//                 message={addMessage} 
//                 onCreatePlaylist={handleCreatePlaylist}
//             />
//             <MusicPlayer />
//         </div>
//     );
// }


// function SingerSongsScreen({ openRequestModal }) {
//     const { name } = useParams();
//     const { user } = useAuth();
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [songs, setSongs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [itemToAdd, setItemToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [error, setError] = useState(null);
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         setLoading(true);
//         setError(null);
//         axios.get(`https://music-backend-akb5.onrender.com/api/songs?singer=${encodeURIComponent(name)}`, { headers: { Authorization: `Bearer ${token}` } })
//         .then(res => setSongs(Array.isArray(res.data) ? res.data : []))
//         .catch(err => setError(`Failed to fetch songs: ${err.message || 'Server error'}`))
//         .finally(() => setLoading(false));
//     }, [name, token]);

//     const handleAddToPlaylist = (itemId, itemType) => {
//         setItemToAdd({ id: itemId, type: itemType });
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         if (!itemToAdd) return;
//         const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
//         setAddMessage(result.message);
//         if (result.success) {
//             setTimeout(() => { setShowPlaylistModal(false); setItemToAdd(null); }, 1000);
//         }
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             await createPlaylist(playlistName.trim());
//         }
//     };

//     if (!user) return <div className="content-area"><p>Please log in.</p></div>;

//     return (
//         <div className="singer-songs-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 <h2>{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>
//                 {loading ? <div className="loading"><div></div></div> : 
//                  error ? <div className="search-message">{error}</div> : 
//                  songs.length > 0 ? (
//                     <SongList songs={songs} onSongClick={(song) => { setSelectedSong({ ...song, songList: songs }); setIsPlaying(true); setIsMinimized(false);}} onAddToPlaylist={handleAddToPlaylist} playlistItemIds={playlistItemIds}/>
//                 ) : (
//                     <div className="search-message">No songs found for this singer.</div>
//                 )}
//             </div>
//             <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} onCreatePlaylist={handleCreatePlaylist}/>
//             <MusicPlayer />
//         </div>
//     );
// }

// function Account({ openRequestModal }) {
//     const { user, updateUser, loading } = useAuth();
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [editProfileOpen, setEditProfileOpen] = useState(false);
//     const [isSaving, setIsSaving] = useState(false);
//     const [newFullName, setNewFullName] = useState('');

//     useEffect(() => {
//         if (user?.fullName) setNewFullName(user.fullName);
//     }, [user]);

//     const handleEditProfile = () => {
//         if (user?.fullName) {
//             setNewFullName(user.fullName);
//             setEditProfileOpen(true);
//         }
//     };

//     const saveProfile = async () => {
//         if (!newFullName.trim()) {
//             setMessage("Full name cannot be empty.");
//             return;
//         }
//         setIsSaving(true);
//         const result = await updateUser({ fullName: newFullName.trim() });
//         setMessage(result.message);
//         setIsSaving(false);
//         if (result.success) setEditProfileOpen(false);
//         setTimeout(() => setMessage(""), 3000);
//     };

//     const formatJoinDate = (joinDate) => {
//         return joinDate ? new Date(joinDate).toLocaleDateString() : "N/A";
//     };

//     return (
//         <div className="account-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 <h2>Account Details{' '}
//                     <button className="edit-profile-button" onClick={handleEditProfile}><FontAwesomeIcon icon="fa-pencil" /></button>
//                 </h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {editProfileOpen && (
//                     <div className="modal-overlay">
//                         <div className="modal-content">
//                             <h3>Edit Profile</h3>
//                             <input type="text" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} placeholder="Full name" disabled={isSaving} />
//                             <button onClick={saveProfile} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button>
//                             <button onClick={() => setEditProfileOpen(false)} disabled={isSaving}>Cancel</button>
//                         </div>
//                     </div>
//                 )}
//                 {loading ? <div className="loading"><div></div></div> : 
//                  user ? (
//                     <>
//                         <p><strong>Full Name:</strong> {user.fullName}</p>
//                         <p><strong>Email:</strong> {user.email}</p>
//                         <p><strong>Phone:</strong> {user.phone}</p>
//                         <p><strong>Join Date:</strong> {formatJoinDate(user.joinDate)}</p>
//                     </>
//                 ) : (
//                     <p>User data not available.</p>
//                 )}
//             </div>
//             <MusicPlayer />
//         </div>
//     );
// }

// function App() {
//     const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

//     return (
//         <Router>
//             <AuthProvider>
//                 <MusicPlayerProvider>
//                     <PlaylistProvider>
//                         <RequestSongModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
//                         <Routes>
//                             <Route path="/" element={<SplashScreen />} />
//                             <Route path="/login" element={<PublicRoute><AuthScreen /></PublicRoute>} />
//                             <Route path="/main" element={<ProtectedRoute><MainScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/search" element={<ProtectedRoute><SearchScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/account" element={<ProtectedRoute><Account openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/moods" element={<ProtectedRoute><MoodsScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/lifelessons" element={<ProtectedRoute><LifeLessonsScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/ots" element={<ProtectedRoute><OTSScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/moods/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="mood" openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/genres/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="genre" openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/singers/:name" element={<ProtectedRoute><SingerSongsScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetailScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="*" element={<ProtectedRoute><Navigate to="/main" replace /></ProtectedRoute>} />
//                         </Routes>
//                     </PlaylistProvider>
//                 </MusicPlayerProvider>
//             </AuthProvider>
//         </Router>
//     );
// }

// export default App;


// import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { fas } from '@fortawesome/free-solid-svg-icons';
// import { library } from '@fortawesome/fontawesome-svg-core';
// import './index.css';

// library.add(fas);

// // --- Music Player Context ---
// const MusicPlayerContext = createContext();

// function MusicPlayerProvider({ children }) {
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [volume, setVolume] = useState(0.5);
//     const [isMinimized, setIsMinimized] = useState(true);
//     const [currentSongIndex, setCurrentSongIndex] = useState(0);
//     const audioRef = useRef(null);
//     const location = useLocation();
//     const lastMinimizedRef = useRef(true);

//     // stable refs for handlers to read latest state
//     const selectedSongRef = useRef(selectedSong);
//     useEffect(() => { selectedSongRef.current = selectedSong; }, [selectedSong]);
//     const isPlayingRef = useRef(isPlaying);
//     useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

//     useEffect(() => {
//         if (selectedSong && !isMinimized && lastMinimizedRef.current) {
//             window.history.pushState({ musicPlayer: 'open' }, '');
//         }
//         lastMinimizedRef.current = isMinimized;
//     }, [selectedSong, isMinimized]);

//     useEffect(() => {
//         const onPopState = () => {
//             if (selectedSong && !isMinimized) setIsMinimized(true);
//         };
//         window.addEventListener('popstate', onPopState);
//         return () => window.removeEventListener('popstate', onPopState);
//     }, [selectedSong, isMinimized]);

//     // next / prev logic (stable)
//     const nextTrack = useCallback(() => {
//         const current = selectedSongRef.current;
//         const list = Array.isArray(current?.songList) ? current.songList : [];
//         if (!list.length) { setIsPlaying(false); return; }
//         const currentId = current?._id || current?.id;
//         const idx = list.findIndex(s => (s._id || s.id) === currentId);
//         const nextIndex = (idx === -1 ? 0 : (idx + 1) % list.length);
//         const next = list[nextIndex];
//         if (next) { setSelectedSong({ ...next, songList: list }); setIsPlaying(true); }
//     }, []);

//     const prevTrack = useCallback(() => {
//         const current = selectedSongRef.current;
//         const list = Array.isArray(current?.songList) ? current.songList : [];
//         if (!list.length) { setIsPlaying(false); return; }
//         const currentId = current?._id || current?.id;
//         const idx = list.findIndex(s => (s._id || s.id) === currentId);
//         const prevIndex = (idx === -1 ? 0 : (idx - 1 + list.length) % list.length);
//         const prev = list[prevIndex];
//         if (prev) { setSelectedSong({ ...prev, songList: list }); setIsPlaying(true); }
//     }, []);

//     // Media Session integration
//     useEffect(() => {
//         const ms = navigator.mediaSession;
//         if (!ms) return;

//         try {
//             ms.setActionHandler('nexttrack', nextTrack);
//             ms.setActionHandler('previoustrack', prevTrack);
//             ms.setActionHandler('play', () => setIsPlaying(true));
//             ms.setActionHandler('pause', () => setIsPlaying(false));
//             ms.setActionHandler('stop', () => setIsPlaying(false));
//             ms.setActionHandler('seekto', (details) => {
//                 const audio = audioRef.current;
//                 if (!audio || typeof details.seekTime !== 'number') return;
//                 try {
//                     if (details.fastSeek && typeof audio.fastSeek === 'function') audio.fastSeek(details.seekTime);
//                     else audio.currentTime = details.seekTime;
//                 } catch (err) {
//                     audio.currentTime = details.seekTime;
//                 }
//             });
//         } catch (err) {
//             console.warn('MediaSession handler setup failed', err);
//         }

//         return () => {
//             try {
//                 ms.setActionHandler('nexttrack', null);
//                 ms.setActionHandler('previoustrack', null);
//                 ms.setActionHandler('play', null);
//                 ms.setActionHandler('pause', null);
//                 ms.setActionHandler('stop', null);
//                 ms.setActionHandler('seekto', null);
//             } catch {}
//         };
//     }, [nextTrack, prevTrack]);

//     useEffect(() => {
//         const audioSrc = selectedSong?.audioUrl || selectedSong?.audio;

//         const cleanupAudioListeners = () => {
//             if (!audioRef.current) return;
//             audioRef.current.pause();
//             audioRef.current.onended = null;
//             audioRef.current.ontimeupdate = null;
//             audioRef.current.onerror = null;
//         };

//         if (!audioSrc) {
//             cleanupAudioListeners();
//             if (audioRef.current) audioRef.current.src = '';
//             if (navigator.mediaSession) navigator.mediaSession.metadata = null;
//             if (navigator.mediaSession) navigator.mediaSession.playbackState = 'none';
//             setCurrentTime(0);
//             return;
//         }

//         if (!audioRef.current || audioRef.current.src !== audioSrc) {
//             cleanupAudioListeners();
//             audioRef.current = new Audio(audioSrc);
//             audioRef.current.preload = 'auto';
//             audioRef.current.crossOrigin = 'anonymous';
//             audioRef.current.onerror = () => console.error('Audio load error for:', audioSrc);

//             audioRef.current.ontimeupdate = () => {
//                 if (!audioRef.current) return;
//                 setCurrentTime(audioRef.current.currentTime);
//                 try {
//                     const ms = navigator.mediaSession;
//                     if (ms && typeof ms.setPositionState === 'function' && audioRef.current.duration && isFinite(audioRef.current.duration)) {
//                         ms.setPositionState({
//                             duration: Math.max(0, audioRef.current.duration),
//                             position: audioRef.current.currentTime,
//                             playbackRate: audioRef.current.playbackRate || 1
//                         });
//                     }
//                 } catch (err) {}
//             };

//             audioRef.current.onended = () => {
//                 const current = selectedSongRef.current;
//                 const list = Array.isArray(current?.songList) ? current.songList : [];
//                 if (!list.length) { setIsPlaying(false); return; }
//                 const currentId = current?._id || current?.id;
//                 const idx = list.findIndex(s => (s._id || s.id) === currentId);
//                 const nextIndex = (idx === -1 ? 0 : (idx + 1) % list.length);
//                 const next = list[nextIndex];
//                 if (next) { setSelectedSong({ ...next, songList: list }); setIsPlaying(true); }
//                 else setIsPlaying(false);
//             };
//         }

//         try {
//             const ms = navigator.mediaSession;
//             if (ms) {
//                 ms.metadata = new window.MediaMetadata({
//                     title: selectedSong?.title || '',
//                     artist: selectedSong?.singer || '',
//                     album: selectedSong?.movie || selectedSong?.genre || '',
//                     artwork: [
//                         { src: selectedSong?.thumbnailUrl || selectedSong?.thumbnail || '', sizes: '300x300', type: 'image/png' }
//                     ]
//                 });
//                 ms.playbackState = isPlaying ? 'playing' : 'paused';
//             }
//         } catch (err) {}

//         if (audioRef.current) {
//             audioRef.current.volume = typeof volume === 'number' ? volume : 0.5;
//             if (isPlaying) {
//                 const p = audioRef.current.play();
//                 if (p && typeof p.catch === 'function') {
//                     p.catch(err => {
//                         if (err?.name !== 'NotAllowedError') console.error('Audio play error:', err);
//                     });
//                 }
//             } else {
//                 audioRef.current.pause();
//             }
//         }

//         if (selectedSong?.songList) {
//             const idx = selectedSong.songList.findIndex(s => (s._id || s.id) === (selectedSong._id || selectedSong.id));
//             setCurrentSongIndex(idx !== -1 ? idx : 0);
//         }

//         try { if (navigator.mediaSession) navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'; } catch {}

//         return () => {
//             if (audioRef.current) {
//                 audioRef.current.ontimeupdate = null;
//                 audioRef.current.onended = null;
//                 audioRef.current.onerror = null;
//             }
//         };
//     }, [selectedSong, isPlaying, volume]);

//     useEffect(() => {
//         try { if (navigator.mediaSession) navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'; } catch {}
//     }, [isPlaying]);

//     const contextValue = {
//         selectedSong, setSelectedSong, isPlaying, setIsPlaying,
//         currentTime, setCurrentTime, volume, setVolume,
//         isMinimized, setIsMinimized, currentSongIndex, setCurrentSongIndex, audioRef,
//         nextTrack, prevTrack
//     };

//     return (
//         <MusicPlayerContext.Provider value={contextValue}>
//             {children}
//         </MusicPlayerContext.Provider>
//     );
// }

// function useMusicPlayer() {
//     return useContext(MusicPlayerContext);
// }

// // --- Auth Context ---
// const AuthContext = createContext();

// function AuthProvider({ children }) {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const processUserData = (userData) => {
//         if (userData && typeof userData.joinDate === 'string') {
//             return { ...userData, joinDate: new Date(userData.joinDate) };
//         }
//         return userData;
//     };

//     const fetchUserProfile = useCallback(async () => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/user/profile');
//                 setUser(processUserData(res.data));
//             } catch {
//                 setUser(null);
//                 localStorage.removeItem('token');
//                 delete axios.defaults.headers.common['Authorization'];
//             }
//         } else {
//             setUser(null);
//         }
//         setLoading(false);
//     }, []);

//     useEffect(() => {
//         fetchUserProfile();
//     }, [fetchUserProfile]);

//     const login = (token, userData, navigate) => {
//         localStorage.setItem('token', token);
//         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//         setUser(processUserData(userData));
//         sessionStorage.setItem('showWelcome', 'true');
//         navigate('/main');
//     };

//     const logout = (navigate) => {
//         localStorage.removeItem('token');
//         delete axios.defaults.headers.common['Authorization'];
//         setUser(null);
//         sessionStorage.removeItem('showWelcome');
//         navigate('/login');
//     };

//     const updateUser = async (userData) => {
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) return { success: false, message: 'No authentication token found.' };
//             await axios.put('https://music-backend-akb5.onrender.com/api/user/profile', userData, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             await fetchUserProfile();
//             return { success: true, message: 'Profile updated successfully!' };
//         } catch (error) {
//             return {
//                 success: false,
//                 message: error.response?.data?.message || 'Server error. Please try again later.',
//             };
//         }
//     };

//     return (
//         <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }

// function useAuth() {
//     return useContext(AuthContext);
// }

// // --- Playlist Context ---
// const PlaylistContext = createContext();

// function PlaylistProvider({ children }) {
//     const [playlists, setPlaylists] = useState([]);
//     const [playlistItemIds, setPlaylistItemIds] = useState(new Set());
//     const [loadingPlaylists, setLoadingPlaylists] = useState(false);
//     const { user } = useAuth();
//     const token = localStorage.getItem('token');

//     const fetchPlaylists = useCallback(async () => {
//         if (!user || !token) {
//             setPlaylists([]);
//             setPlaylistItemIds(new Set());
//             return;
//         }
//         setLoadingPlaylists(true);
//         try {
//             const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             const fetchedPlaylists = res.data || [];
//             setPlaylists(fetchedPlaylists);
//             const itemIds = new Set(
//                 fetchedPlaylists.flatMap(p => p.items?.map(item => item.itemRef?._id) || [])
//             );
//             setPlaylistItemIds(itemIds);
//         } catch (error) {
//             console.error('Failed to fetch playlists:', error);
//             setPlaylists([]);
//         } finally {
//             setLoadingPlaylists(false);
//         }
//     }, [user, token]);

//     useEffect(() => {
//         fetchPlaylists();
//     }, [fetchPlaylists]);

//     const addToPlaylist = async (itemId, playlistId, itemType) => {
//         try {
//             const playlist = playlists.find(p => p._id === playlistId);
//             if (playlist?.items?.some(item => item.itemRef?._id === itemId)) {
//                 return { success: false, message: 'Item already in playlist' };
//             }
//             await axios.post(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}/addItem`, 
//                 { itemType: itemType, itemRef: itemId },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             await fetchPlaylists();
//             return { success: true, message: 'Item added to playlist!' };
//         } catch (err) {
//             console.error('Failed to add item:', err);
//             return { success: false, message: 'Failed to add item.' };
//         }
//     };
    
//     const createPlaylist = async (name) => {
//         try {
//             await axios.post('https://music-backend-akb5.onrender.com/api/playlists', { name: name }, { headers: { Authorization: `Bearer ${token}` } });
//             await fetchPlaylists();
//             return { success: true, message: 'Playlist created!' };
//         } catch (error) {
//             console.error('Failed to create playlist:', error);
//             return { success: false, message: 'Failed to create playlist.' };
//         }
//     };

//     const removeItemFromPlaylist = async (playlistId, itemId) => {
//         try {
//             await axios.delete(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}/items/${itemId}`, 
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             await fetchPlaylists();
//             return { success: true, message: 'Item removed successfully!' };
//         } catch (error) {
//             console.error('Failed to remove item:', error);
//             return { success: false, message: 'Failed to remove item.' };
//         }
//     };

//     const updatePlaylistName = async (playlistId, newName) => {
//         try {
//             await axios.put(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, 
//                 { name: newName },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             await fetchPlaylists();
//             return { success: true, message: 'Playlist renamed successfully!' };
//         } catch (error) {
//             console.error('Failed to rename playlist:', error);
//             return { success: false, message: 'Failed to rename playlist.' };
//         }
//     };

//     const deletePlaylist = async (playlistId) => {
//         try {
//             await axios.delete(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             await fetchPlaylists();
//             return { success: true, message: 'Playlist deleted successfully!' };
//         } catch (error) {
//             console.error('Failed to delete playlist:', error);
//             return { success: false, message: 'Failed to delete playlist.' };
//         }
//     };

//     const value = { 
//         playlists, 
//         playlistItemIds, 
//         loadingPlaylists, 
//         addToPlaylist, 
//         createPlaylist, 
//         removeItemFromPlaylist,
//         updatePlaylistName,
//         deletePlaylist
//     };

//     return (
//         <PlaylistContext.Provider value={value}>
//             {children}
//         </PlaylistContext.Provider>
//     );
// }

// function usePlaylist() {
//     return useContext(PlaylistContext);
// }

// // --- Route Components ---
// function ProtectedRoute({ children }) {
//     const { user, loading } = useAuth();
//     if (loading) return <div className="loading"><div></div></div>;
//     if (!user) return <Navigate to="/login" replace />;
//     return children;
// }

// function PublicRoute({ children }) {
//     const { user, loading } = useAuth();
//     if (loading) return <div className="loading"><div></div></div>;
//     if (user) return <Navigate to="/main" replace />;
//     return children;
// }

// // --- UI Components ---
// function SplashScreen() {
//     const navigate = useNavigate();
//     const { user, loading } = useAuth();

//     useEffect(() => {
//         if (loading) return;
//         const timer = setTimeout(() => {
//             if (user) navigate('/main');
//             else navigate('/login');
//         }, 2000);
//         return () => clearTimeout(timer);
//     }, [navigate, user, loading]);
//     return (
//         <div className="splash-screen">
//             <h1>SunDhun</h1>
//         </div>
//     );
// }

// function AuthScreen() {
//     const [isLogin, setIsLogin] = useState(true);
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [fullName, setFullName] = useState('');
//     const [phone, setPhone] = useState('');
//     const [loading, setLoading] = useState(false);
//     const { login, user } = useAuth();
//     const navigate = useNavigate();
//     const [message, setMessage] = useState('');

//     useEffect(() => {
//         if (user) {
//             navigate('/main', { replace: true });
//         }
//     }, [user, navigate]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage('');
//         try {
//             const endpoint = isLogin ? 'https://music-backend-akb5.onrender.com/api/auth/login' : 'https://music-backend-akb5.onrender.com/api/auth/register';
//             const data = isLogin ? { email, password } : { fullName, email, password, phone };
//             const res = await axios.post(endpoint, data);
//             if (res.data.token && res.data.user) {
//                 login(res.data.token, res.data.user, navigate);
//             }
//         } catch (error) {
//             setMessage(error.response?.data?.message || 'An unknown error occurred');
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     return (
//         <div className="auth-screen">
//             <form onSubmit={handleSubmit} className="auth-form">
//                 <h2>{isLogin ? 'Login' : 'Signup'}</h2>
//                 {!isLogin && (
//                     <>
//                         <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required />
//                         <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" required />
//                     </>
//                 )}
//                 <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
//                 <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
//                 <button type="submit" disabled={loading}>{loading ? 'Processing...' : (isLogin ? 'Login' : 'Signup')}</button>
//                 <p className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Need an account? Signup' : 'Already have an account? Login'}</p>
//                 {message && <div className="error-message">{message}</div>}
//             </form>
//         </div>
//     );
// }

// function Navbar({ toggleSidebar }) {
//     const navigate = useNavigate();

//     return (
//         <div className="navbar">
//             <div className="navbar-logo" onClick={() => navigate('/main')}>SunDhun</div>
//             <div className="navbar-right">
//                 <div className="search-box" onClick={() => navigate('/search')}>
//                     <FontAwesomeIcon icon="fa-search" />
//                 </div>
//                 <div className="sidebar-toggle" onClick={toggleSidebar}>☰</div>
//             </div>
//         </div>
//     );
// }

// function Sidebar({ isOpen, onClose, onRequestSongOpen }) {
//     const navigate = useNavigate();
//     const { user, logout } = useAuth();
//     const { setSelectedSong, setIsPlaying, audioRef } = useMusicPlayer();
//     const { playlists, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
//     const [showModeDropdown, setShowModeDropdown] = useState(false);
//     const [mode, setMode] = useState(localStorage.getItem('mode') || 'dark');
//     const sidebarRef = useRef(null);

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (
//                 isOpen &&
//                 sidebarRef.current &&
//                 !sidebarRef.current.contains(event.target) &&
//                 !event.target.closest('.sidebar-toggle')
//             ) {
//                 onClose();
//                 setShowModeDropdown(false);
//                 setShowPlaylistDropdown(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [isOpen, onClose]);

//     useEffect(() => {
//         document.body.dataset.mode = mode;
//         localStorage.setItem('mode', mode);
//     }, [mode]);

//     const handleLogout = () => {
//         if (audioRef.current) {
//             audioRef.current.pause();
//             audioRef.current.src = '';
//         }
//         setIsPlaying(false);
//         setSelectedSong(null);
//         logout(navigate);
//         onClose();
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             const result = await createPlaylist(playlistName.trim());
//             if (result.success) {
//                 setShowPlaylistDropdown(true);
//             }
//         }
//     };
//     return (
//         <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
//             <a href="/account" onClick={(e) => { e.preventDefault(); navigate('/account'); onClose(); }}>Account</a>
//             <div className="sidebar-item-with-dropdown">
//                 <a href="#" onClick={(e) => { e.preventDefault(); setShowModeDropdown((prev) => !prev); }}>Mode</a>
//                 {showModeDropdown && (
//                     <div className="mode-dropdown">
//                         <span onClick={() => { setMode('dark'); setShowModeDropdown(false); }}>Dark</span>
//                         <span onClick={() => { setMode('light'); setShowModeDropdown(false); }}>Light</span>
//                         <span onClick={() => { setMode('neon'); setShowModeDropdown(false); }}>Neon</span>
//                     </div>
//                 )}
//             </div>
//             <a href="#" onClick={(e) => { e.preventDefault(); setShowPlaylistDropdown(!showPlaylistDropdown); }}>Playlist</a>
//             {showPlaylistDropdown && (
//                 <div className="playlist-dropdown">
//                     {loadingPlaylists ? <span>Loading...</span> : (
//                         <>
//                             {playlists.map(playlist => (
//                                 <span key={playlist._id} onClick={() => { navigate(`/playlist/${playlist._id}`); onClose(); }}>
//                                     {playlist.name}
//                                 </span>
//                             ))}
//                             <span onClick={handleCreatePlaylist} className="create-playlist">
//                                 <FontAwesomeIcon icon="fa-plus" /> Create New
//                             </span>
//                         </>
//                     )}
//                 </div>
//             )}
            
//           <a href="#" onClick={(e) => { e.preventDefault(); onRequestSongOpen(); onClose(); }}>Request a Song</a>
//             {user && (
//                 <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
//             )}
//         </div>
//     );
// }

// function MusicPlayer() {
//     const {
//         selectedSong,
//         setSelectedSong,
//         isPlaying,
//         setIsPlaying,
//         currentTime,
//         setCurrentTime,
//         volume,
//         setVolume,
//         isMinimized,
//         setIsMinimized,
//         currentSongIndex,
//         audioRef
//     } = useMusicPlayer();

//     const location = useLocation();
//     const excludedPaths = ['/login', '/'];
//     const showPlayer = !excludedPaths.includes(location.pathname);

//     useEffect(() => {
//         document.body.classList.toggle('no-scroll', !isMinimized);
//     }, [isMinimized]);

//     if (!selectedSong || !showPlayer) return null;

//     const togglePlay = () => setIsPlaying(!isPlaying);

//     const changeSong = (offset) => {
//         if (!selectedSong?.songList?.length) return;
//         const newIndex = (currentSongIndex + offset + selectedSong.songList.length) % selectedSong.songList.length;
//         setSelectedSong({ ...selectedSong.songList[newIndex], songList: selectedSong.songList });
//         setIsPlaying(true);
//     };

//     const handleTimeDrag = (e) => {
//         if (audioRef.current?.duration) {
//             const newTime = (e.target.value / 100) * audioRef.current.duration;
//             audioRef.current.currentTime = newTime;
//             setCurrentTime(newTime);
//         }
//     };

//     const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
//     const duration = audioRef.current?.duration || 0;
    
//     const thumbnailUrl = selectedSong.thumbnailUrl || selectedSong.thumbnail || 'https://placehold.co/100x100';
//     const primaryText = selectedSong.title || 'Unknown Title';
//     const secondaryText = selectedSong.singer || selectedSong.category || '';
//     const albumText = selectedSong.movie || selectedSong.movieName || selectedSong.genre || 'Audio';

//     return (
//         <div className={`music-player ${isMinimized ? 'minimized' : 'full-screen'}`}>
//             {isMinimized ? (
//                 <div className="player-minimized-content" onClick={() => setIsMinimized(false)}>
//                     <img src={thumbnailUrl} alt={primaryText} className="player-minimized-thumbnail" loading="lazy" />
//                     <div className="player-minimized-info">
//                         <h4>{primaryText}</h4>
//                         <p>{secondaryText}</p>
//                     </div>
//                     <div className="player-minimized-buttons">
//                         <button
//                             className="minimize-player-button"
//                             onClick={(e) => { e.stopPropagation(); changeSong(1); }}
//                             aria-label="Next track"
//                         >
//                             <FontAwesomeIcon icon="fa-step-forward" />
//                         </button>
//                         <button className="close-player-button" onClick={(e) => { e.stopPropagation(); setSelectedSong(null); audioRef.current.pause(); audioRef.current.src = ''; }}>
//                             <FontAwesomeIcon icon="fa-times" />
//                         </button>
//                     </div>
//                 </div>
//             ) : (
//                 <>
//                     <button className="minimize-player-button" onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}>
//                         <FontAwesomeIcon icon="fa-chevron-down" />
//                     </button>
//                     <button className="close-player-button" onClick={(e) => { e.stopPropagation(); setSelectedSong(null); audioRef.current.pause(); audioRef.current.src = ''; }}>
//                         <FontAwesomeIcon icon="fa-times" />
//                     </button>
//                     <div className="player-content" onClick={(e) => e.stopPropagation()}>
//                         <div className="player-background-blur" style={{ backgroundImage: `url(${thumbnailUrl})` }}></div>
//                         <div className="player-foreground-content">
//                             <img src={thumbnailUrl} alt={primaryText} className="player-main-thumbnail" loading="lazy" />
//                             <div className="song-info">
//                                 <h2>{primaryText}</h2>
//                                 <h3>{secondaryText}</h3>
//                                 <p className="song-album">{albumText}</p>
//                             </div>
//                             <div className="controls">
//                                 <div className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</div>
//                                 <input type="range" min="0" max="100" value={duration ? (currentTime / duration) * 100 : 0} onChange={handleTimeDrag} className="progress-bar" style={{ '--progress': duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
//                                 <div className="player-buttons">
//                                     <button onClick={() => changeSong(-1)}><FontAwesomeIcon icon="fa-step-backward" /></button>
//                                     <button onClick={togglePlay}><FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} /></button>
//                                     <button onClick={() => changeSong(1)}><FontAwesomeIcon icon="fa-step-forward" /></button>
//                                 </div>
//                                 <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="volume-slider" />
//                             </div>
//                         </div>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }
// function SongList({ songs, onSongClick, onAddToPlaylist, playlistItemIds }) {
//     return (
//         <div className="songs-row">
//             {songs.map((song) => (
//                 <div
//                     key={song._id}
//                     className="song-tile"
//                     onClick={() => onSongClick(song)}
//                 >
//                     <img
//                         src={song.thumbnailUrl || 'https://placehold.co/120x120/333/FFF?text=♪'}
//                         alt={song.title}
//                         className="song-tile-thumbnail"
//                         loading="lazy"
//                     />
//                     <div className="song-tile-details">
//                         <div className="song-tile-title">{song.title}</div>
//                         <div className="song-tile-singer">{song.singer}</div>
//                         <div className="song-tile-label">{song.movie ? song.movie : 'Album'}</div>
//                     </div>
//                     {!playlistItemIds.has(song._id) && (
//                         <button
//                             className="add-song-button"
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 onAddToPlaylist(song._id, 'Song');
//                             }}
//                             title="Add to Playlist"
//                         >
//                             <FontAwesomeIcon icon="fa-plus" />
//                         </button>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// }

// function LifeLessonList({ items, onItemClick, onAddToPlaylist, playlistItemIds }) {
//     return (
//         <div className="songs-row">
//             {items.map((item) => (
//                 <div
//                     key={item._id}
//                     className="song-tile"
//                     onClick={() => onItemClick(item)}
//                 >
//                     <img
//                         src={item.thumbnail || 'https://placehold.co/120x120/333/FFF?text=♪'}
//                         alt={item.title}
//                         className="song-tile-thumbnail"
//                         loading="lazy"
//                     />
//                     <div className="song-tile-details">
//                         <div className="song-tile-title">{item.title}</div>
//                     </div>
//                     {!playlistItemIds.has(item._id) && (
//                         <button
//                             className="add-song-button"
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 onAddToPlaylist(item._id, 'LifeLesson');
//                             }}
//                             title="Add to Playlist"
//                         >
//                             <FontAwesomeIcon icon="fa-plus" />
//                         </button>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// }

// function OTSList({ items, onItemClick, onAddToPlaylist, playlistItemIds }) {
//     return (
//         <div className="songs-row">
//             {items.map((item) => (
//                 <div
//                     key={item._id}
//                     className="song-tile"
//                     onClick={() => onItemClick(item)}
//                 >
//                     <img
//                         src={item.thumbnail || 'https://placehold.co/120x120/333/FFF?text=♪'}
//                         alt={item.title}
//                         className="song-tile-thumbnail"
//                         loading="lazy"
//                     />
//                     <div className="song-tile-details">
//                         <div className="song-tile-title">{item.title}</div>
//                         <div className="song-tile-label">{item.movieName || 'OTS'}</div>
//                     </div>
//                     {!playlistItemIds.has(item._id) && (
//                         <button
//                             className="add-song-button"
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 onAddToPlaylist(item._id, 'OTS');
//                             }}
//                             title="Add to Playlist"
//                         >
//                             <FontAwesomeIcon icon="fa-plus" />
//                         </button>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// }

// function PlaylistSelectionModal({ isOpen, onClose, onSelectPlaylist, playlists, loading, message, onCreatePlaylist }) {
//     if (!isOpen) return null;
//     return (
//         <div className="playlist-modal-overlay" onClick={onClose}>
//             <div className="playlist-modal" onClick={(e) => e.stopPropagation()}>
//                 <h4>Select Playlist</h4>
//                 {loading ? (
//                     <div className="loading-bar">
//                         <div className="loading-bar-progress"></div>
//                     </div>
//                 ) : playlists.length > 0 ? (
//                     <ul>
//                         {playlists.map((pl) => (
//                             <li key={pl._id}>
//                                 <button className="playlist-modal-btn" onClick={() => onSelectPlaylist(pl._id)}>
//                                     {pl.name}
//                                 </button>
//                             </li>
//                         ))}
//                     </ul>
//                 ) : (
//                     <div className="no-playlist-container">
//                         <p>No playlists found.</p>
//                         <button className="create-playlist-btn" onClick={onCreatePlaylist}>
//                             Create Playlist
//                         </button>
//                     </div>
//                 )}
//                 {message && <div className="playlist-modal-message">{message}</div>}
//                 <button className="playlist-modal-cancel" onClick={onClose}>Cancel</button>
//             </div>
//         </div>
//     );
// }

// function RequestSongModal({ isOpen, onClose }) {
//     const [requests, setRequests] = useState([{ title: '', movie: '' }]);
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState('');
//     const [isSuccess, setIsSuccess] = useState(false);
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         if (isOpen) {
//             setRequests([{ title: '', movie: '' }]);
//             setMessage('');
//             setLoading(false);
//             setIsSuccess(false);
//         }
//     }, [isOpen]);

//     const handleRequestChange = (index, field, value) => {
//         const newRequests = [...requests];
//         newRequests[index][field] = value;
//         setRequests(newRequests);
//     };

//     const handleAddRequest = () => {
//         if (requests.length < 5) {
//             setRequests([...requests, { title: '', movie: '' }]);
//         }
//     };
//     const handleRemoveRequest = (index) => {
//         if (requests.length > 1) {
//             const newRequests = requests.filter((_, i) => i !== index);
//             setRequests(newRequests);
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setMessage('');

//         const validRequests = requests.filter(req => req.title.trim() && req.movie.trim());

//         if (validRequests.length === 0) {
//             setMessage('Please fill out at least one complete song request.');
//             return;
//         }

//         if (validRequests.length !== requests.filter(r => r.title.trim() || r.movie.trim()).length) {
//             setMessage('Please fill out both song title and movie/album for each request line.');
//             return;
//         }

//         setLoading(true);
//         try {
//             await axios.post('https://music-backend-akb5.onrender.com/api/song-requests', validRequests, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setLoading(false);
//             setIsSuccess(true);
//             setMessage('Your requests have been submitted successfully!');
            
//             setTimeout(() => {
//                 onClose();
//             }, 1000);
//         } catch (error) {
//             setLoading(false);
//             setMessage(error.response?.data?.message || 'Failed to submit requests. Please try again.');
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="request-song-modal-overlay" onClick={onClose}>
//             <div className="request-song-modal" onClick={(e) => e.stopPropagation()}>
//                 {isSuccess ? (
//                     <div className="request-success-view">
//                         <FontAwesomeIcon icon="fa-check-circle" style={{fontSize: '3rem', color: '#4caf50', marginBottom: '1rem'}}/>
//                         <h3>Success!</h3>
//                         <p>{message}</p>
//                     </div>
//                 ) : (
//                     <>
//                         <h3 className="request-song-modal-header">Request a Song</h3>
//                         <p className="request-song-modal-subheader">You can request up to 5 songs.</p>
//                         <form onSubmit={handleSubmit}>
//                             <div className="request-list">
//                                 {requests.map((req, index) => (
//                                     <div key={index} className="request-item">
//                                         <input
//                                             type="text"
//                                             placeholder="Song Title"
//                                             value={req.title}
//                                             onChange={(e) => handleRequestChange(index, 'title', e.target.value)}
//                                             className="request-input"
//                                             required
//                                         />
//                                         <input
//                                             type="text"
//                                             placeholder="Movie / Album"
//                                             value={req.movie}
//                                             onChange={(e) => handleRequestChange(index, 'movie', e.target.value)}
//                                             className="request-input"
//                                             required
//                                         />
//                                         <button
//                                             type="button"
//                                             onClick={() => handleRemoveRequest(index)}
//                                             className="remove-request-btn"
//                                             disabled={requests.length <= 1 || loading}
//                                             title="Remove request"
//                                         >
//                                             <FontAwesomeIcon icon="fa-times" />
//                                         </button>
//                                     </div>
//                                 ))}
//                             </div>
//                             <div className="request-song-actions">
//                                 <button
//                                     type="button"
//                                     onClick={handleAddRequest}
//                                     className="add-request-btn"
//                                     disabled={requests.length >= 5 || loading}
//                                 >
//                                     <FontAwesomeIcon icon="fa-plus" /> Add another
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="submit-requests-btn"
//                                     disabled={loading}
//                                 >
//                                     {loading ? 'Submitting...' : 'Submit Requests'}
//                                 </button>
//                             </div>
//                             <div className="request-song-modal-footer">
//                                 {message && <div className="request-modal-message">{message}</div>}
//                                 <button type="button" className="request-modal-cancel" onClick={onClose} disabled={loading}>
//                                     Cancel
//                                 </button>
//                             </div>
//                         </form>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }

// function MoodsScreen({ openRequestModal }) {
//   const navigate = useNavigate();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const moodCategories = [
//     { name: 'happy', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513535/hap_oihkap.jpg' },
//     { name: 'sad', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/sad_lbqcin.jpg' },
//     { name: 'workout', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752961155/gym_ivap8k.png' },
//      { name: 'love', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752515509/love_bnjlgc.jpg' },
//       { name: 'travel', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/travel_xwu6mq.jpg' },
//     { name: 'heartbreak', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513535/heartb_deh8ds.png' },
//     { name: 'spiritual', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513536/spi_o1tzp7.png' },
//      { name: 'mashup', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1764700849/mash2_scprij.jpg' },
//     { name: 'motivational', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/motiva_bvntm6.jpg' },
//     { name: 'nostalgic', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/nos_tv6k55.jpg' },
    
//   ];

//   return (
//     <div className="moods-page-screen">
//       <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//       <Sidebar
//         isOpen={isSidebarOpen}
//         onClose={() => setIsSidebarOpen(false)}
//         onRequestSongOpen={openRequestModal}
//       />
//       <div className="moods-screen content-area">
//         <h2>Choose Your Mood</h2>
//         <div className="mood-cards">
//           {moodCategories.map((mood) => (
//             <div
//               key={mood.name}
//               className="mood-card"
//               onClick={() => navigate(`/moods/${mood.name}`)}
//             >
//               <img src={mood.image} alt={mood.name} />
//             </div>
//           ))}
//         </div>
//       </div>
//       <MusicPlayer />
//     </div>
//   );
// }

// function LifeLessonsScreen({ openRequestModal }) {
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [lifeLessons, setLifeLessons] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [itemToAdd, setItemToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         const fetchLifeLessons = async () => {
//             if (!token) return;
//             setLoading(true);
//             setError(null);
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/lifelessons/all', {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setLifeLessons(Array.isArray(res.data) ? res.data : []);
//             } catch (err) {
//                 console.error('Failed to fetch life lessons:', err);
//                 setError('Failed to fetch life lessons. Please try again later.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchLifeLessons();
//     }, [token]);

//     const handleAddToPlaylist = (itemId, itemType) => {
//         setItemToAdd({ id: itemId, type: itemType });
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         if (!itemToAdd) return;
//         const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
//         setAddMessage(result.message);
//         if (result.success) {
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setItemToAdd(null);
//             }, 1000);
//         }
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             await createPlaylist(playlistName.trim());
//         }
//     };

//     return (
//         <div className="lifelessons-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 <h2>Life Lessons</h2>
//                 {loading ? (
//                     <div className="loading"><div></div></div>
//                 ) : error ? (
//                     <div className="search-message">{error}</div>
//                 ) : lifeLessons.length > 0 ? (
//                     <LifeLessonList
//                         items={lifeLessons}
//                         onItemClick={(item) => {
//                             setSelectedSong({ ...item, songList: lifeLessons });
//                             setIsPlaying(true);
//                             setIsMinimized(false);
//                         }}
//                         onAddToPlaylist={handleAddToPlaylist}
//                         playlistItemIds={playlistItemIds}
//                     />
//                 ) : (
//                     <div className="search-message">No life lessons found.</div>
//                 )}
//             </div>
//             <PlaylistSelectionModal
//                 isOpen={showPlaylistModal}
//                 onClose={() => setShowPlaylistModal(false)}
//                 onSelectPlaylist={handleSelectPlaylist}
//                 playlists={playlists}
//                 loading={loadingPlaylists}
//                 message={addMessage}
//                 onCreatePlaylist={handleCreatePlaylist}
//             />
//             <MusicPlayer />
//         </div>
//     );
// }

// function OTSScreen({ openRequestModal }) {
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [otsItems, setOtsItems] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [itemToAdd, setItemToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         const fetchOtsItems = async () => {
//             if (!token) return;
//             setLoading(true);
//             setError(null);
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/ots/all', {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setOtsItems(Array.isArray(res.data) ? res.data : []);
//             } catch (err) {
//                 console.error('Failed to fetch OTS items:', err);
//                 setError('Failed to fetch OTS items. Please try again later.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchOtsItems();
//     }, [token]);

//     const handleAddToPlaylist = (itemId, itemType) => {
//         setItemToAdd({ id: itemId, type: itemType });
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         if (!itemToAdd) return;
//         const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
//         setAddMessage(result.message);
//         if (result.success) {
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setItemToAdd(null);
//             }, 1000);
//         }
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             await createPlaylist(playlistName.trim());
//         }
//     };

//     return (
//         <div className="ots-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 <h2>OTS</h2>
//                 {loading ? (
//                     <div className="loading"><div></div></div>
//                 ) : error ? (
//                     <div className="search-message">{error}</div>
//                 ) : otsItems.length > 0 ? (
//                     <OTSList
//                         items={otsItems}
//                         onItemClick={(item) => {
//                             setSelectedSong({ ...item, songList: otsItems });
//                             setIsPlaying(true);
//                             setIsMinimized(false);
//                         }}
//                         onAddToPlaylist={handleAddToPlaylist}
//                         playlistItemIds={playlistItemIds}
//                     />
//                 ) : (
//                     <div className="search-message">No OTS items found.</div>
//                 )}
//             </div>
//             <PlaylistSelectionModal
//                 isOpen={showPlaylistModal}
//                 onClose={() => setShowPlaylistModal(false)}
//                 onSelectPlaylist={handleSelectPlaylist}
//                 playlists={playlists}
//                 loading={loadingPlaylists}
//                 message={addMessage}
//                 onCreatePlaylist={handleCreatePlaylist}
//             />
//             <MusicPlayer />
//         </div>
//     );
// }

// function MainScreen({ openRequestModal }) {
//   const { user } = useAuth();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(false);
//   const navigate = useNavigate();

//   const singersContainerRef = useRef(null);
//   const [showPrev, setShowPrev] = useState(false);
//   const [showNext, setShowNext] = useState(true);

//   useEffect(() => {
//     if (sessionStorage.getItem('showWelcome')) {
//       setShowWelcome(true);
//       const timer = setTimeout(() => {
//         setShowWelcome(false);
//         sessionStorage.removeItem('showWelcome');
//       }, 2500);
//       return () => clearTimeout(timer);
//     }
//   }, [user]);

//   useEffect(() => {
//     const container = singersContainerRef.current;
//     if (!container) return;
//     const handleScroll = () => {
//       const { scrollLeft, scrollWidth, clientWidth } = container;
//       setShowPrev(scrollLeft > 0);
//       setShowNext(scrollLeft < scrollWidth - clientWidth - 1);
//     };
//     handleScroll();
//     container.addEventListener('scroll', handleScroll);
//     return () => container.removeEventListener('scroll', handleScroll);
//   }, []);

//   const singers = [
//     { name: '', id: 'sonu nigam', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/sonu_ztsynp.webp' },
//     { name: '', id: 'lata mangeshkar', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/lata_ezfr2n.webp' },
//     { name: '', id: 'kk', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/kk_py1off.webp' },
//     { name: '', id: 'mohd rafi', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/rafi_n9wslm.webp' },
//     { name: '', id: 'kailash kher', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751878756/kail_ufykhi.jpg' },
//     { name: '', id: 'neha kakkar', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/neha_lzh67j.webp' },
//     { name: '', id: 'kishore kumar', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/kishor_smr0v8.webp' },
//     { name: '', id: 'anirudh', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/ani_wbajfs.webp' },
//     { name: '', id: 'rahat fateh ali khan', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751787551/raha_hinul7.png' },
//     { name: '', id: 'udit narayan', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751878759/udit_idlojx.png' },
//     { name: '', id: 'diljit dosanjh', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/diljit_ftpuid.webp' },
//     { name: '', id: 'jubin nautiyal', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/jubin_am3rn2.webp' },
//     { name: '', id: 'shreya ghoshal', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/sherya_qkynbl.webp' },
//     { name: '', id: 'arijit singh', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/arjit_g4zpgt.webp' },
//     { name: '', id: 'shaan', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751878758/shaan_ayuxds.png' },
//     { name: '', id: 'monali thakur', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751878760/monali_qdoefu.png' },
//   ];
//   const genres = [
//     { name: '', id: 'rap', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751730905/rap_g0sheq.jpg ' },
//     { name: '', id: 'classical', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751730906/class_kh980u.png ' },
//     { name: '', id: 'party', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751730905/party_lm1glx.jpg ' },
//     { name: '', id: 'lo-fi', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751730905/lofi_mpmwqv.jpg ' },
//   ];

//   const scrollSingers = (direction) => {
//     if (singersContainerRef.current) {
//       const scrollAmount = direction === 'right' ? 400 : -400;
//       singersContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
//     }
//   };

//   const handleSingerClick = (singerId) => {
//     navigate(`/singers/${encodeURIComponent(singerId)}`);
//   };

//   const handleGenreClick = (genreId) => {
//     navigate(`/genres/${encodeURIComponent(genreId)}`);
//   };

//   return (
//     <div className="main-screen">
//       {showWelcome && user && (
//         <div className="welcome-overlay fade-in-out">
//           Welcome, {user.fullName.split(' ')[0]}!
//         </div>
//       )}

//       <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//       <Sidebar
//         isOpen={isSidebarOpen}
//         onClose={() => setIsSidebarOpen(false)}
//         onRequestSongOpen={openRequestModal}
//       />

//       <div className="content-area">
//         <section className="singers-section">
//           <h2>Artist Spotlight</h2>
//           <div className="singers-container">
//             <div className="singers-scroll" ref={singersContainerRef}>
//               {singers.map((singer) => (
//                 <div
//                   key={singer.id}
//                   className="singer-card"
//                   onClick={() => handleSingerClick(singer.id)}
//                 >
//                   <img src={singer.imageFileName} alt={singer.name} className="singer-card-image fade-in" loading="lazy" />
//                   <h3>{singer.name}</h3>
//                 </div>
//               ))}
//             </div>
//             {showPrev && ( <button className="singers-scroll-btn left" onClick={() => scrollSingers('left')}><FontAwesomeIcon icon="fa-chevron-left" /></button> )}
//             {showNext && ( <button className="singers-scroll-btn right" onClick={() => scrollSingers('right')}><FontAwesomeIcon icon="fa-chevron-right" /></button> )}
//           </div>
//         </section>

//        <section className="mood-section">
//   <h2>Explore</h2>
//   <div className="mood-cards">
//     <div
//       className="explore-card"
//       onClick={() => navigate('/moods')}
//     >
//       <img
//         src="https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/mood_b1af7g.jpg"
//         alt="Moods"
//       />
//     </div>

//     <div
//       className="explore-card"
//       onClick={() => navigate('/ots')}
//     >
//       <img
//         src="https://res.cloudinary.com/dt2nr7rjg/image/upload/v1764221872/ost_ulo8a3.png"
//         alt="OTS"
//       />
//     </div>

//      <div
//       className="explore-card"
//       onClick={() => navigate('/lifelessons')}
//     >
//       <img
//         src="https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752523470/WhatsApp_Image_2025-07-15_at_01.34.03_bba81101_rybrke.jpg"
//         alt="Life Lessons"
//       />
//     </div>
//   </div>
// </section>

//         <section className="genre-section">
//           <h2>Genres</h2>
//           <div className="genres-cards">
//             {genres.map((genre) => (
//               <div key={genre.id} className="genre-card" onClick={() => handleGenreClick(genre.id)}>
//                 <img src={genre.imageFileName} alt={genre.name} className="genre-card-image fade-in" loading="lazy" />
//                 <h3>{genre.name}</h3>
//               </div>
//             ))}
//           </div>
//         </section>
//       </div>
//       <MusicPlayer />
//     </div>
//   );
// }

// function SearchScreen({ openRequestModal }) {
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [loadingSearch, setLoadingSearch] = useState(false);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [itemToAdd, setItemToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [isListening, setIsListening] = useState(false);
//     const [voiceError, setVoiceError] = useState('');
//     const recognitionRef = useRef(null);
//     const token = localStorage.getItem('token');

//     const debouncedSearch = useMemo(() => {
//         let timeoutId;
//         return (query) => {
//             clearTimeout(timeoutId);
//             if (!query.trim()) {
//                 setSearchResults([]);
//                 setLoadingSearch(false);
//                 return;
//             }
//             timeoutId = setTimeout(async () => {
//                 setLoadingSearch(true);
//                 try {
//                     const url = `https://music-backend-akb5.onrender.com/api/songs?search=${encodeURIComponent(query.trim())}`;
//                     const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
//                     setSearchResults(Array.isArray(res.data) ? res.data : []);
//                 } catch (error) {
//                     console.error('Search error:', error);
//                     setSearchResults([]);
//                 } finally {
//                     setLoadingSearch(false);
//                 }
//             }, 300);
//         };
//     }, [token]);

//     useEffect(() => {
//         debouncedSearch(searchQuery);
//     }, [searchQuery, debouncedSearch]);

//     const handleAddToPlaylist = (itemId, itemType) => {
//         setItemToAdd({ id: itemId, type: itemType });
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         if (!itemToAdd) return;
//         const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
//         setAddMessage(result.message);
//         if (result.success) {
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setItemToAdd(null);
//             }, 1000);
//         }
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             await createPlaylist(playlistName.trim());
//         }
//     };

//     const checkMicrophonePermission = useCallback(async () => {
//         try {
//             const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
//             if (permissionStatus.state === 'denied') {
//                 setVoiceError('Microphone access denied.');
//                 return false;
//             }
//             return true;
//         } catch (err) {
//             setVoiceError('Error checking mic permissions.');
//             return false;
//         }
//     }, []);

//     const startVoiceSearch = useCallback(async () => {
//         const hasPermission = await checkMicrophonePermission();
//         if (!hasPermission) return;

//         const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//         if (!SpeechRecognition) {
//             setVoiceError('Voice search not supported.');
//             return;
//         }

//         recognitionRef.current = new SpeechRecognition();
//         recognitionRef.current.lang = 'en-US';
//         recognitionRef.current.interimResults = true;
//         recognitionRef.current.onstart = () => setIsListening(true);
//         recognitionRef.current.onresult = (event) => setSearchQuery(event.results[0][0].transcript);
//         recognitionRef.current.onerror = (event) => {
//             setIsListening(false);
//             setVoiceError('Voice recognition error: ' + event.error);
//         };
//         recognitionRef.current.onend = () => setIsListening(false);
//         recognitionRef.current.start();
//     }, [checkMicrophonePermission]);

//     const toggleVoiceSearch = useCallback(() => {
//         if (isListening) {
//             recognitionRef.current?.stop();
//         } else {
//             startVoiceSearch();
//         }
//     }, [isListening, startVoiceSearch]);

//     useEffect(() => {
//         return () => recognitionRef.current?.stop();
//     }, []);

//     return (
//         <div className="search-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 <h2>Search Songs</h2>
//                 <div className="search-input-container">
//                     <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input-field" placeholder="Search..." autoFocus/>
//                     <button className={`mic-button ${isListening ? 'listening' : ''}`} onClick={toggleVoiceSearch} title="Voice Search">
//                         <FontAwesomeIcon icon={isListening ? 'fa-microphone-slash' : 'fa-microphone'} />
//                     </button>
//                 </div>
//                 {voiceError && <div className="error-message">{voiceError}</div>}
//                 <div className="search-results-section">
//                     {loadingSearch ? <div className="search-message">Searching...</div> :
//                      searchQuery.trim() && searchResults.length > 0 ? (
//                         <SongList
//                             songs={searchResults}
//                             onSongClick={(song) => {
//                                 setSelectedSong({ ...song, songList: searchResults });
//                                 setIsPlaying(true);
//                                 setIsMinimized(false);
//                             }}
//                             onAddToPlaylist={handleAddToPlaylist}
//                             playlistItemIds={playlistItemIds}
//                         />
//                     ) : searchQuery.trim() && !loadingSearch ? (
//                         <div className="search-message">No songs found.</div>
//                     ) : null}
//                 </div>
//             </div>
//             <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} onCreatePlaylist={handleCreatePlaylist}/>
//             <MusicPlayer />
//         </div>
//     );
// }

// function PlaylistDetailScreen({ openRequestModal }) {
//     const { playlistId } = useParams();
//     const navigate = useNavigate(); 
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     // UPDATED: Removed updatePlaylistName
//     const { playlists, removeItemFromPlaylist, loadingPlaylists, deletePlaylist } = usePlaylist();
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
//     const playlist = useMemo(() => playlists.find((p) => p._id === playlistId), [playlists, playlistId]);

//     // UPDATED: Handle Delete Playlist
//     const handleDeletePlaylist = async () => {
//         if (window.confirm(`Are you sure you want to delete "${playlist.name}"? This cannot be undone.`)) {
//             const result = await deletePlaylist(playlistId);
//             if (result.success) {
//                 navigate('/main'); 
//             } else {
//                 setMessage(result.message);
//                 setTimeout(() => setMessage(''), 2000);
//             }
//         }
//     };

//     const handleRemoveItem = async (itemId) => {
//         if (!window.confirm('Remove song from playlist?')) return;
//         const result = await removeItemFromPlaylist(playlistId, itemId);
//         setMessage(result.message);
//         setTimeout(() => setMessage(''), 2000);
//     };

//     if (loadingPlaylists) return <div className="content-area loading"><div></div></div>;
//     if (!playlist) return <div className="content-area"><p>Playlist not found.</p></div>;

//     const playableList = playlist.items?.map(item => ({...(item.itemRef), _id: item.itemRef?._id || item._id})) || [];

//     return (
//         <div className="playlist-detail-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 {/* UPDATED HEADER: Pencil icon removed */}
//                 <div className="playlist-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
//                     <h2 style={{ margin: 0 }}>{playlist.name}</h2>
//                     <div className="playlist-actions">
//                         <button 
//                             onClick={handleDeletePlaylist} 
//                             title="Delete Playlist"
//                             style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.2rem' }}
//                         >
//                             <FontAwesomeIcon icon="fa-trash" />
//                         </button>
//                     </div>
//                 </div>

//                 {message && <div className="info-message">{message}</div>}

//                 {playlist.items?.length > 0 ? (
//                     <div className="songs-column">
//                         {playlist.items.map((item) => (
//                             item?.itemRef && (
//                             <div
//                                 key={item._id}
//                                 className="song-card full-line"
//                                 onClick={() => {
//                                     setSelectedSong({ ...item.itemRef, songList: playableList });
//                                     setIsPlaying(true);
//                                     setIsMinimized(false);
//                                 }}
//                             >
//                                 <img
//                                     src={item.itemRef.thumbnail || item.itemRef.thumbnailUrl || 'https://placehold.co/50x50'}
//                                     alt={item.itemRef.title}
//                                     className="song-thumbnail"
//                                     loading="lazy"
//                                 />
//                                 <div className="song-details">
//                                     <h4>{item.itemRef.title}</h4>
//                                     <p>{item.itemRef.singer || item.itemRef.movieName || item.itemType}</p>
//                                 </div>
//                                 <button
//                                     className="remove-song-button"
//                                     onClick={(e) => { e.stopPropagation(); handleRemoveItem(item._id); }}
//                                 >
//                                     <FontAwesomeIcon icon="fa-minus" />
//                                 </button>
//                             </div>
//                             )
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="search-message">This playlist is empty.</div>
//                 )}
//             </div>
//             <MusicPlayer />
//         </div>
//     );
// }

// function CategorySongsScreen({ categoryType, openRequestModal }) {
//     const { name } = useParams();
//     const { user } = useAuth();
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [songs, setSongs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [itemToAdd, setItemToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [randomMessage, setRandomMessage] = useState('');
//     const [error, setError] = useState(null);
//     const [showTitle, setShowTitle] = useState(false);
    
//     const [selectedLanguage, setSelectedLanguage] = useState('all');
//     const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
//     const languageWrapperRef = useRef(null); 
     
//     const token = localStorage.getItem('token');
    
//     const languages = [
//         { value: 'all', label: 'All' },
//         { value: 'hindi', label: 'Hindi' },
//         { value: 'english', label: 'English' },
//         { value: 'punjabi', label: 'Punjabi' },
//         { value: 'telugu', label: 'Telugu' },
//         { value: 'kannada', label: 'Kannada' },
//         { value: 'tamil', label: 'Tamil' }
//     ];

//     const messagesConfig = useMemo(() => ({
//         love: ["Hey ${username}, let your heart sing louder than words.", "${username}, fall in love with every note."],
//         travel: ["Adventure awaits, ${username} — let the music guide you.", "Wanderlust in every beat, just for you ${username}."],
//         happy: ["Smile wide, ${username} — these songs are your sunshine.", "Turn up the joy, ${username}, and dance like no one's watching."],
//         sad: ["It's okay to feel, ${username} — let these songs hold you.", "Lean on these melodies, ${username}, when words aren't enough."],
//         motivational: ["Rise and conquer, ${username} — let the music push you.", "Fuel your fire, ${username}, one beat at a time."],
//         nostalgic: ["A trip down memory lane for you, ${username}.", "Relive the golden days with these songs, ${username}."],
//         heartbreak: ["Some songs understand you better than words, ${username}.", "Let it all out, ${username} — these tracks feel your pain."],
//         spiritual: ["Find your center, ${username}, in every chord.", "Breathe deeply with these mindful tunes, ${username}."],
//         calm: ["Slow down, ${username} — breathe with these soothing sounds.", "Ease your mind, ${username}, with gentle melodies."],
//         rap: ["Spit fire, ${username}, let the beats talk.", "Get in the zone with these bars, ${username}."],
//         party: ["Let's turn it up, ${username} — the party starts here.", "${username}, dance like nobody's watching."],
//         classical: ["Timeless beauty in every note for you, ${username}.", "Close your eyes and let it flow, ${username}."],
//         'lo-fi': ["Chill out, ${username}, with these mellow beats.", "Your perfect study companion, ${username}."]
//     }), []);

//     useEffect(() => {
//         setLoading(true);
//         setError(null);
        
//         let apiUrl = `https://music-backend-akb5.onrender.com/api/songs?${categoryType}=${encodeURIComponent(name)}`;
        
//         if (selectedLanguage !== 'all') {
//             apiUrl += `&language=${encodeURIComponent(selectedLanguage)}`;
//         }
        
//         axios.get(apiUrl, { headers: { Authorization: `Bearer ${token}` } })
//         .then(res => setSongs(Array.isArray(res.data) ? res.data : []))
//         .catch(err => setError(`Failed to fetch songs: ${err.message || 'Server error'}`))
//         .finally(() => setLoading(false));
//     }, [name, categoryType, token, selectedLanguage]);

//     useEffect(() => {
//         const handleClickOutside = (e) => {
//             if (showLanguageDropdown && languageWrapperRef.current && !languageWrapperRef.current.contains(e.target)) {
//                 setShowLanguageDropdown(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, [showLanguageDropdown]);

//     useEffect(() => {
//         const firstName = user?.fullName?.split(' ')[0] || 'friend';
//         const messages = messagesConfig[name] || [];
//         if (songs.length > 0 && messages.length > 0) {
//             const personalized = messages[Math.floor(Math.random() * messages.length)].replace(/\${username}/g, firstName);
//             setRandomMessage(personalized);
//             setShowTitle(false);
//             const timeout = setTimeout(() => {
//                 setRandomMessage('');
//                 setShowTitle(true);
//             }, 6500);
//             return () => clearTimeout(timeout);
//         }
//     }, [name, songs, user, messagesConfig]);

//     const handleAddToPlaylist = (itemId, itemType) => {
//         setItemToAdd({ id: itemId, type: itemType });
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     }; 

//     const handleSelectPlaylist = async (playlistId) => {
//         if (!itemToAdd) return;
//         const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
//         setAddMessage(result.message);
//         if (result.success) {
//             setTimeout(() => { setShowPlaylistModal(false); setItemToAdd(null); }, 1000);
//         }
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             await createPlaylist(playlistName.trim());
//         }
//     };

//     const handleLanguageSelect = (language) => {
//         setSelectedLanguage(language);
//         setShowLanguageDropdown(false);
//     };

//     if (!user) return <div className="content-area"><p>Please log in.</p></div>;

//     return (
//         <div className="mood-songs-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 {randomMessage && <div className="random-message animate-fade-in-out">{randomMessage}</div>}
//                 {showTitle && <h2 className="category-title fade-in">{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>}
                
//                 <div className="language-filter-container" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
//                     <div className="language-dropdown-wrapper" style={{ position: 'relative', display: 'inline-block' }} ref={languageWrapperRef}>
//                         <button 
//                             className="language-filter-btn" 
//                             onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
//                             style={{
//                                 background: '#333',
//                                 color: 'white',
//                                 border: '1px solid #555',
//                                 padding: '8px 16px',
//                                 borderRadius: '8px',
//                                 cursor: 'pointer',
//                                 fontSize: '14px',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: '8px'
//                             }}
//                         >
//                             <FontAwesomeIcon icon="fa-globe" />
//                             {languages.find(lang => lang.value === selectedLanguage)?.label || 'All'}
//                             <FontAwesomeIcon icon={showLanguageDropdown ? "fa-chevron-up" : "fa-chevron-down"} />
//                         </button>
                        
//                         {showLanguageDropdown && (
//                             <div className="language-dropdown" 
//                                 style={{
//                                     position: 'absolute',
//                                     top: '100%',
//                                     right: 0,
//                                     background: '#222',
//                                     border: '1px solid #444',
//                                     borderRadius: '8px',
//                                     boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
//                                     zIndex: 1000,
//                                     minWidth: '140px'
//                                 }}
//                             >
//                                 {languages.map((language) => (
//                                     <div
//                                         key={language.value}
//                                         className="language-option"
//                                         onClick={() => handleLanguageSelect(language.value)}
//                                         style={{
//                                             padding: '12px 16px',
//                                             cursor: 'pointer',
//                                             color: 'white',
//                                             fontSize: '14px',
//                                             borderBottom: language.value === languages[languages.length - 1].value ? 'none' : '1px solid #444'
//                                         }}
//                                         onMouseEnter={(e) => e.target.style.background = '#444'}
//                                         onMouseLeave={(e) => e.target.style.background = 'transparent'}
//                                     >
//                                         {language.label}
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {loading ? <div className="loading"><div></div></div> : 
//                  error ? <div className="search-message">{error}</div> : 
//                  songs.length > 0 ? (
//                     <SongList 
//                         songs={songs} 
//                         onSongClick={(song) => { 
//                             setSelectedSong({ ...song, songList: songs }); 
//                             setIsPlaying(true); 
//                             setIsMinimized(false); 
//                         }} 
//                         onAddToPlaylist={handleAddToPlaylist} 
//                         playlistItemIds={playlistItemIds}
//                     />
//                 ) : (
//                     <div className="search-message">No songs found for this category.</div>
//                 )}
//             </div>
//             <PlaylistSelectionModal 
//                 isOpen={showPlaylistModal} 
//                 onClose={() => setShowPlaylistModal(false)} 
//                 onSelectPlaylist={handleSelectPlaylist} 
//                 playlists={playlists} 
//                 loading={loadingPlaylists} 
//                 message={addMessage} 
//                 onCreatePlaylist={handleCreatePlaylist}
//             />
//             <MusicPlayer />
//         </div>
//     );
// }

// function SingerSongsScreen({ openRequestModal }) {
//     const { name } = useParams();
//     const { user } = useAuth();
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [songs, setSongs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [itemToAdd, setItemToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [error, setError] = useState(null);
//     const token = localStorage.getItem('token');

    
//     useEffect(() => {
//         setLoading(true);
//         setError(null);
//         axios.get(`https://music-backend-akb5.onrender.com/api/songs?singer=${encodeURIComponent(name)}`, { headers: { Authorization: `Bearer ${token}` } })
//         .then(res => setSongs(Array.isArray(res.data) ? res.data : []))
//         .catch(err => setError(`Failed to fetch songs: ${err.message || 'Server error'}`))
//         .finally(() => setLoading(false));
//     }, [name, token]);

//     const handleAddToPlaylist = (itemId, itemType) => {
//         setItemToAdd({ id: itemId, type: itemType });
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         if (!itemToAdd) return;
//         const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
//         setAddMessage(result.message);
//         if (result.success) {
//             setTimeout(() => { setShowPlaylistModal(false); setItemToAdd(null); }, 1000);
//         }
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             await createPlaylist(playlistName.trim());
//         }
//     };

//     if (!user) return <div className="content-area"><p>Please log in.</p></div>;

//     return (
//         <div className="singer-songs-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 <h2>{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>
//                 {loading ? <div className="loading"><div></div></div> : 
//                  error ? <div className="search-message">{error}</div> : 
//                  songs.length > 0 ? (
//                     <SongList songs={songs} onSongClick={(song) => { setSelectedSong({ ...song, songList: songs }); setIsPlaying(true); setIsMinimized(false);}} onAddToPlaylist={handleAddToPlaylist} playlistItemIds={playlistItemIds}/>
//                 ) : (
//                     <div className="search-message">No songs found for this singer.</div>
//                 )}
//             </div>
//             <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} onCreatePlaylist={handleCreatePlaylist}/>
//             <MusicPlayer />
//         </div>
//     );
// }

// function Account({ openRequestModal }) {
//     const { user, updateUser, loading } = useAuth();
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [editProfileOpen, setEditProfileOpen] = useState(false);
//     const [isSaving, setIsSaving] = useState(false);
//     const [newFullName, setNewFullName] = useState('');

//     useEffect(() => {
//         if (user?.fullName) setNewFullName(user.fullName);
//     }, [user]);

//     const handleEditProfile = () => {
//         if (user?.fullName) {
//             setNewFullName(user.fullName);
//             setEditProfileOpen(true);
//         }
//     };

//     const saveProfile = async () => {
//         if (!newFullName.trim()) {
//             setMessage("Full name cannot be empty.");
//             return;
//         }
//         setIsSaving(true);
//         const result = await updateUser({ fullName: newFullName.trim() });
//         setMessage(result.message);
//         setIsSaving(false);
//         if (result.success) setEditProfileOpen(false);
//         setTimeout(() => setMessage(""), 3000);
//     };

//     const formatJoinDate = (joinDate) => {
//         return joinDate ? new Date(joinDate).toLocaleDateString() : "N/A";
//     };

//     return (
//         <div className="account-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 <h2>Account Details{' '}
//                     <button className="edit-profile-button" onClick={handleEditProfile}><FontAwesomeIcon icon="fa-pencil" /></button>
//                 </h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {editProfileOpen && (
//                     <div className="modal-overlay">
//                         <div className="modal-content">
//                             <h3>Edit Profile</h3>
//                             <input type="text" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} placeholder="Full name" disabled={isSaving} />
//                             <button onClick={saveProfile} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button>
//                             <button onClick={() => setEditProfileOpen(false)} disabled={isSaving}>Cancel</button>
//                         </div>
//                     </div>
//                 )}
//                 {loading ? <div className="loading"><div></div></div> : 
//                  user ? (
//                     <>
//                         <p><strong>Full Name:</strong> {user.fullName}</p>
//                         <p><strong>Email:</strong> {user.email}</p>
//                         <p><strong>Phone:</strong> {user.phone}</p>
//                         <p><strong>Join Date:</strong> {formatJoinDate(user.joinDate)}</p>
//                     </>
//                 ) : (
//                     <p>User data not available.</p>
//                 )}
//             </div>
//             <MusicPlayer />
//         </div>
//     );
// }

// function App() {
//     const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

//     return (
//         <Router>
//             <AuthProvider>
//                 <MusicPlayerProvider>
//                     <PlaylistProvider>
//                         <RequestSongModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
//                         <Routes>
//                             <Route path="/" element={<SplashScreen />} />
//                             <Route path="/login" element={<PublicRoute><AuthScreen /></PublicRoute>} />
//                             <Route path="/main" element={<ProtectedRoute><MainScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/search" element={<ProtectedRoute><SearchScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/account" element={<ProtectedRoute><Account openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/moods" element={<ProtectedRoute><MoodsScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/lifelessons" element={<ProtectedRoute><LifeLessonsScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/ots" element={<ProtectedRoute><OTSScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/moods/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="mood" openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/genres/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="genre" openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/singers/:name" element={<ProtectedRoute><SingerSongsScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetailScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="*" element={<ProtectedRoute><Navigate to="/main" replace /></ProtectedRoute>} />
//                         </Routes>
//                     </PlaylistProvider>
//                 </MusicPlayerProvider>
//             </AuthProvider>
//         </Router>
//     );
// }

// export default App;


// import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { fas } from '@fortawesome/free-solid-svg-icons';
// import { library } from '@fortawesome/fontawesome-svg-core';
// import './index.css';

// library.add(fas);

// // --- Music Player Context ---
// const MusicPlayerContext = createContext();

// function MusicPlayerProvider({ children }) {
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [volume, setVolume] = useState(0.5);
//     const [isMinimized, setIsMinimized] = useState(true);
//     const [currentSongIndex, setCurrentSongIndex] = useState(0);
//     const audioRef = useRef(null);
//     const location = useLocation();
//     const lastMinimizedRef = useRef(true);

//     // stable refs for handlers to read latest state
//     const selectedSongRef = useRef(selectedSong);
//     useEffect(() => { selectedSongRef.current = selectedSong; }, [selectedSong]);
//     const isPlayingRef = useRef(isPlaying);
//     useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

//     useEffect(() => {
//         if (selectedSong && !isMinimized && lastMinimizedRef.current) {
//             window.history.pushState({ musicPlayer: 'open' }, '');
//         }
//         lastMinimizedRef.current = isMinimized;
//     }, [selectedSong, isMinimized]);

//     useEffect(() => {
//         const onPopState = () => {
//             if (selectedSong && !isMinimized) setIsMinimized(true);
//         };
//         window.addEventListener('popstate', onPopState);
//         return () => window.removeEventListener('popstate', onPopState);
//     }, [selectedSong, isMinimized]);

//     // next / prev logic (stable)
//     const nextTrack = useCallback(() => {
//         const current = selectedSongRef.current;
//         const list = Array.isArray(current?.songList) ? current.songList : [];
//         if (!list.length) { setIsPlaying(false); return; }
//         const currentId = current?._id || current?.id;
//         const idx = list.findIndex(s => (s._id || s.id) === currentId);
//         const nextIndex = (idx === -1 ? 0 : (idx + 1) % list.length);
//         const next = list[nextIndex];
//         if (next) { setSelectedSong({ ...next, songList: list }); setIsPlaying(true); }
//     }, []);

//     const prevTrack = useCallback(() => {
//         const current = selectedSongRef.current;
//         const list = Array.isArray(current?.songList) ? current.songList : [];
//         if (!list.length) { setIsPlaying(false); return; }
//         const currentId = current?._id || current?.id;
//         const idx = list.findIndex(s => (s._id || s.id) === currentId);
//         const prevIndex = (idx === -1 ? 0 : (idx - 1 + list.length) % list.length);
//         const prev = list[prevIndex];
//         if (prev) { setSelectedSong({ ...prev, songList: list }); setIsPlaying(true); }
//     }, []);

//     // Media Session integration
//     useEffect(() => {
//         const ms = navigator.mediaSession;
//         if (!ms) return;

//         try {
//             ms.setActionHandler('nexttrack', nextTrack);
//             ms.setActionHandler('previoustrack', prevTrack);
//             ms.setActionHandler('play', () => setIsPlaying(true));
//             ms.setActionHandler('pause', () => setIsPlaying(false));
//             ms.setActionHandler('stop', () => setIsPlaying(false));
//             ms.setActionHandler('seekto', (details) => {
//                 const audio = audioRef.current;
//                 if (!audio || typeof details.seekTime !== 'number') return;
//                 try {
//                     if (details.fastSeek && typeof audio.fastSeek === 'function') audio.fastSeek(details.seekTime);
//                     else audio.currentTime = details.seekTime;
//                 } catch (err) {
//                     audio.currentTime = details.seekTime;
//                 }
//             });
//         } catch (err) {
//             console.warn('MediaSession handler setup failed', err);
//         }

//         return () => {
//             try {
//                 ms.setActionHandler('nexttrack', null);
//                 ms.setActionHandler('previoustrack', null);
//                 ms.setActionHandler('play', null);
//                 ms.setActionHandler('pause', null);
//                 ms.setActionHandler('stop', null);
//                 ms.setActionHandler('seekto', null);
//             } catch {}
//         };
//     }, [nextTrack, prevTrack]);

//     useEffect(() => {
//         const audioSrc = selectedSong?.audioUrl || selectedSong?.audio;

//         const cleanupAudioListeners = () => {
//             if (!audioRef.current) return;
//             audioRef.current.pause();
//             audioRef.current.onended = null;
//             audioRef.current.ontimeupdate = null;
//             audioRef.current.onerror = null;
//         };

//         if (!audioSrc) {
//             cleanupAudioListeners();
//             if (audioRef.current) audioRef.current.src = '';
//             if (navigator.mediaSession) navigator.mediaSession.metadata = null;
//             if (navigator.mediaSession) navigator.mediaSession.playbackState = 'none';
//             setCurrentTime(0);
//             return;
//         }

//         if (!audioRef.current || audioRef.current.src !== audioSrc) {
//             cleanupAudioListeners();
//             audioRef.current = new Audio(audioSrc);
//             audioRef.current.preload = 'auto';
//             audioRef.current.crossOrigin = 'anonymous';
//             audioRef.current.onerror = () => console.error('Audio load error for:', audioSrc);

//             audioRef.current.ontimeupdate = () => {
//                 if (!audioRef.current) return;
//                 setCurrentTime(audioRef.current.currentTime);
//                 try {
//                     const ms = navigator.mediaSession;
//                     if (ms && typeof ms.setPositionState === 'function' && audioRef.current.duration && isFinite(audioRef.current.duration)) {
//                         ms.setPositionState({
//                             duration: Math.max(0, audioRef.current.duration),
//                             position: audioRef.current.currentTime,
//                             playbackRate: audioRef.current.playbackRate || 1
//                         });
//                     }
//                 } catch (err) {}
//             };

//             audioRef.current.onended = () => {
//                 const current = selectedSongRef.current;
//                 const list = Array.isArray(current?.songList) ? current.songList : [];
//                 if (!list.length) { setIsPlaying(false); return; }
//                 const currentId = current?._id || current?.id;
//                 const idx = list.findIndex(s => (s._id || s.id) === currentId);
//                 const nextIndex = (idx === -1 ? 0 : (idx + 1) % list.length);
//                 const next = list[nextIndex];
//                 if (next) { setSelectedSong({ ...next, songList: list }); setIsPlaying(true); }
//                 else setIsPlaying(false);
//             };
//         }

//         try {
//             const ms = navigator.mediaSession;
//             if (ms) {
//                 ms.metadata = new window.MediaMetadata({
//                     title: selectedSong?.title || '',
//                     artist: selectedSong?.singer || '',
//                     album: selectedSong?.movie || selectedSong?.genre || '',
//                     artwork: [
//                         { src: selectedSong?.thumbnailUrl || selectedSong?.thumbnail || '', sizes: '300x300', type: 'image/png' }
//                     ]
//                 });
//                 ms.playbackState = isPlaying ? 'playing' : 'paused';
//             }
//         } catch (err) {}

//         if (audioRef.current) {
//             audioRef.current.volume = typeof volume === 'number' ? volume : 0.5;
//             if (isPlaying) {
//                 const p = audioRef.current.play();
//                 if (p && typeof p.catch === 'function') {
//                     p.catch(err => {
//                         if (err?.name !== 'NotAllowedError') console.error('Audio play error:', err);
//                     });
//                 }
//             } else {
//                 audioRef.current.pause();
//             }
//         }

//         if (selectedSong?.songList) {
//             const idx = selectedSong.songList.findIndex(s => (s._id || s.id) === (selectedSong._id || selectedSong.id));
//             setCurrentSongIndex(idx !== -1 ? idx : 0);
//         }

//         try { if (navigator.mediaSession) navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'; } catch {}

//         return () => {
//             if (audioRef.current) {
//                 audioRef.current.ontimeupdate = null;
//                 audioRef.current.onended = null;
//                 audioRef.current.onerror = null;
//             }
//         };
//     }, [selectedSong, isPlaying, volume]);

//     useEffect(() => {
//         try { if (navigator.mediaSession) navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'; } catch {}
//     }, [isPlaying]);

//     const contextValue = {
//         selectedSong, setSelectedSong, isPlaying, setIsPlaying,
//         currentTime, setCurrentTime, volume, setVolume,
//         isMinimized, setIsMinimized, currentSongIndex, setCurrentSongIndex, audioRef,
//         nextTrack, prevTrack
//     };

//     return (
//         <MusicPlayerContext.Provider value={contextValue}>
//             {children}
//         </MusicPlayerContext.Provider>
//     );
// }

// function useMusicPlayer() {
//     return useContext(MusicPlayerContext);
// }

// // --- Auth Context ---
// const AuthContext = createContext();

// function AuthProvider({ children }) {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const processUserData = (userData) => {
//         if (userData && typeof userData.joinDate === 'string') {
//             return { ...userData, joinDate: new Date(userData.joinDate) };
//         }
//         return userData;
//     };

//     const fetchUserProfile = useCallback(async () => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/user/profile');
//                 setUser(processUserData(res.data));
//             } catch {
//                 setUser(null);
//                 localStorage.removeItem('token');
//                 delete axios.defaults.headers.common['Authorization'];
//             }
//         } else {
//             setUser(null);
//         }
//         setLoading(false);
//     }, []);

//     useEffect(() => {
//         fetchUserProfile();
//     }, [fetchUserProfile]);

//     const login = (token, userData, navigate) => {
//         localStorage.setItem('token', token);
//         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//         setUser(processUserData(userData));
//         sessionStorage.setItem('showWelcome', 'true');
//         navigate('/main');
//     };

//     const logout = (navigate) => {
//         localStorage.removeItem('token');
//         delete axios.defaults.headers.common['Authorization'];
//         setUser(null);
//         sessionStorage.removeItem('showWelcome');
//         navigate('/login');
//     };

//     const updateUser = async (userData) => {
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) return { success: false, message: 'No authentication token found.' };
//             await axios.put('https://music-backend-akb5.onrender.com/api/user/profile', userData, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             await fetchUserProfile();
//             return { success: true, message: 'Profile updated successfully!' };
//         } catch (error) {
//             return {
//                 success: false,
//                 message: error.response?.data?.message || 'Server error. Please try again later.',
//             };
//         }
//     };

//     return (
//         <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }

// function useAuth() {
//     return useContext(AuthContext);
// }

// // --- Playlist Context ---
// const PlaylistContext = createContext();

// function PlaylistProvider({ children }) {
//     const [playlists, setPlaylists] = useState([]);
//     const [playlistItemIds, setPlaylistItemIds] = useState(new Set());
//     const [loadingPlaylists, setLoadingPlaylists] = useState(false);
//     const { user } = useAuth();
//     const token = localStorage.getItem('token');

//     const fetchPlaylists = useCallback(async () => {
//         if (!user || !token) {
//             setPlaylists([]);
//             setPlaylistItemIds(new Set());
//             return;
//         }
//         setLoadingPlaylists(true);
//         try {
//             const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             const fetchedPlaylists = res.data || [];
//             setPlaylists(fetchedPlaylists);
//             const itemIds = new Set(
//                 fetchedPlaylists.flatMap(p => p.items?.map(item => item.itemRef?._id) || [])
//             );
//             setPlaylistItemIds(itemIds);
//         } catch (error) {
//             console.error('Failed to fetch playlists:', error);
//             setPlaylists([]);
//         } finally {
//             setLoadingPlaylists(false);
//         }
//     }, [user, token]);

//     useEffect(() => {
//         fetchPlaylists();
//     }, [fetchPlaylists]);

//     const addToPlaylist = async (itemId, playlistId, itemType) => {
//         try {
//             const playlist = playlists.find(p => p._id === playlistId);
//             if (playlist?.items?.some(item => item.itemRef?._id === itemId)) {
//                 return { success: false, message: 'Item already in playlist' };
//             }
//             await axios.post(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}/addItem`, 
//                 { itemType: itemType, itemRef: itemId },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             await fetchPlaylists();
//             return { success: true, message: 'Item added to playlist!' };
//         } catch (err) {
//             console.error('Failed to add item:', err);
//             return { success: false, message: 'Failed to add item.' };
//         }
//     };
    
//     const createPlaylist = async (name) => {
//         try {
//             await axios.post('https://music-backend-akb5.onrender.com/api/playlists', { name: name }, { headers: { Authorization: `Bearer ${token}` } });
//             await fetchPlaylists();
//             return { success: true, message: 'Playlist created!' };
//         } catch (error) {
//             console.error('Failed to create playlist:', error);
//             return { success: false, message: 'Failed to create playlist.' };
//         }
//     };

//     const removeItemFromPlaylist = async (playlistId, itemId) => {
//         try {
//             await axios.delete(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}/items/${itemId}`, 
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             await fetchPlaylists();
//             return { success: true, message: 'Item removed successfully!' };
//         } catch (error) {
//             console.error('Failed to remove item:', error);
//             return { success: false, message: 'Failed to remove item.' };
//         }
//     };

//     const updatePlaylistName = async (playlistId, newName) => {
//         try {
//             await axios.put(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, 
//                 { name: newName },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             await fetchPlaylists();
//             return { success: true, message: 'Playlist renamed successfully!' };
//         } catch (error) {
//             console.error('Failed to rename playlist:', error);
//             return { success: false, message: 'Failed to rename playlist.' };
//         }
//     };

//     const deletePlaylist = async (playlistId) => {
//         try {
//             await axios.delete(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             await fetchPlaylists();
//             return { success: true, message: 'Playlist deleted successfully!' };
//         } catch (error) {
//             console.error('Failed to delete playlist:', error);
//             return { success: false, message: 'Failed to delete playlist.' };
//         }
//     };

//     const value = { 
//         playlists, 
//         playlistItemIds, 
//         loadingPlaylists, 
//         addToPlaylist, 
//         createPlaylist, 
//         removeItemFromPlaylist,
//         updatePlaylistName,
//         deletePlaylist
//     };

//     return (
//         <PlaylistContext.Provider value={value}>
//             {children}
//         </PlaylistContext.Provider>
//     );
// }

// function usePlaylist() {
//     return useContext(PlaylistContext);
// }

// // --- Route Components ---
// function ProtectedRoute({ children }) {
//     const { user, loading } = useAuth();
//     if (loading) return <div className="loading"><div></div></div>;
//     if (!user) return <Navigate to="/login" replace />;
//     return children;
// }

// function PublicRoute({ children }) {
//     const { user, loading } = useAuth();
//     if (loading) return <div className="loading"><div></div></div>;
//     if (user) return <Navigate to="/main" replace />;
//     return children;
// }

// // --- UI Components ---
// function SplashScreen() {
//     const navigate = useNavigate();
//     const { user, loading } = useAuth();

//     useEffect(() => {
//         if (loading) return;
//         const timer = setTimeout(() => {
//             if (user) navigate('/main');
//             else navigate('/login');
//         }, 2000);
//         return () => clearTimeout(timer);
//     }, [navigate, user, loading]);
//     return (
//         <div className="splash-screen">
//             <h1>SunDhun</h1>
//         </div>
//     );
// }

// function AuthScreen() {
//     const [isLogin, setIsLogin] = useState(true);
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [fullName, setFullName] = useState('');
//     const [phone, setPhone] = useState('');
//     const [loading, setLoading] = useState(false);
//     const { login, user } = useAuth();
//     const navigate = useNavigate();
//     const [message, setMessage] = useState('');

//     useEffect(() => {
//         if (user) {
//             navigate('/main', { replace: true });
//         }
//     }, [user, navigate]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage('');
//         try {
//             const endpoint = isLogin ? 'https://music-backend-akb5.onrender.com/api/auth/login' : 'https://music-backend-akb5.onrender.com/api/auth/register';
//             const data = isLogin ? { email, password } : { fullName, email, password, phone };
//             const res = await axios.post(endpoint, data);
//             if (res.data.token && res.data.user) {
//                 login(res.data.token, res.data.user, navigate);
//             }
//         } catch (error) {
//             setMessage(error.response?.data?.message || 'An unknown error occurred');
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     return (
//         <div className="auth-screen">
//             <form onSubmit={handleSubmit} className="auth-form">
//                 <h2>{isLogin ? 'Login' : 'Signup'}</h2>
//                 {!isLogin && (
//                     <>
//                         <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required />
//                         <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" required />
//                     </>
//                 )}
//                 <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
//                 <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
//                 <button type="submit" disabled={loading}>{loading ? 'Processing...' : (isLogin ? 'Login' : 'Signup')}</button>
//                 <p className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Need an account? Signup' : 'Already have an account? Login'}</p>
//                 {message && <div className="error-message">{message}</div>}
//             </form>
//         </div>
//     );
// }

// function Navbar({ toggleSidebar }) {
//     const navigate = useNavigate();

//     return (
//         <div className="navbar">
//             <div className="navbar-logo" onClick={() => navigate('/main')}>SunDhun</div>
//             <div className="navbar-right">
//                 <div className="search-box" onClick={() => navigate('/search')}>
//                     <FontAwesomeIcon icon="fa-search" />
//                 </div>
//                 <div className="sidebar-toggle" onClick={toggleSidebar}>☰</div>
//             </div>
//         </div>
//     );
// }

// function Sidebar({ isOpen, onClose, onRequestSongOpen }) {
//     const navigate = useNavigate();
//     const { user, logout } = useAuth();
//     const { setSelectedSong, setIsPlaying, audioRef } = useMusicPlayer();
//     const { playlists, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
//     const [showModeDropdown, setShowModeDropdown] = useState(false);
//     const [mode, setMode] = useState(localStorage.getItem('mode') || 'dark');
//     const sidebarRef = useRef(null);

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (
//                 isOpen &&
//                 sidebarRef.current &&
//                 !sidebarRef.current.contains(event.target) &&
//                 !event.target.closest('.sidebar-toggle')
//             ) {
//                 onClose();
//                 setShowModeDropdown(false);
//                 setShowPlaylistDropdown(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [isOpen, onClose]);

//     useEffect(() => {
//         document.body.dataset.mode = mode;
//         localStorage.setItem('mode', mode);
//     }, [mode]);

//     const handleLogout = () => {
//         if (audioRef.current) {
//             audioRef.current.pause();
//             audioRef.current.src = '';
//         }
//         setIsPlaying(false);
//         setSelectedSong(null);
//         logout(navigate);
//         onClose();
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             const result = await createPlaylist(playlistName.trim());
//             if (result.success) {
//                 setShowPlaylistDropdown(true);
//             }
//         }
//     };
//     return (
//         <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
//             <a href="/account" onClick={(e) => { e.preventDefault(); navigate('/account'); onClose(); }}>Account</a>
//             <div className="sidebar-item-with-dropdown">
//                 <a href="#" onClick={(e) => { e.preventDefault(); setShowModeDropdown((prev) => !prev); }}>Mode</a>
//                 {showModeDropdown && (
//                     <div className="mode-dropdown">
//                         <span onClick={() => { setMode('dark'); setShowModeDropdown(false); }}>Dark</span>
//                         <span onClick={() => { setMode('light'); setShowModeDropdown(false); }}>Light</span>
//                         <span onClick={() => { setMode('neon'); setShowModeDropdown(false); }}>Neon</span>
//                     </div>
//                 )}
//             </div>
//             <a href="#" onClick={(e) => { e.preventDefault(); setShowPlaylistDropdown(!showPlaylistDropdown); }}>Playlist</a>
//             {showPlaylistDropdown && (
//                 <div className="playlist-dropdown">
//                     {loadingPlaylists ? <span>Loading...</span> : (
//                         <>
//                             {playlists.map(playlist => (
//                                 <span key={playlist._id} onClick={() => { navigate(`/playlist/${playlist._id}`); onClose(); }}>
//                                     {playlist.name}
//                                 </span>
//                             ))}
//                             <span onClick={handleCreatePlaylist} className="create-playlist">
//                                 <FontAwesomeIcon icon="fa-plus" /> Create New
//                             </span>
//                         </>
//                     )}
//                 </div>
//             )}
            
//           <a href="#" onClick={(e) => { e.preventDefault(); onRequestSongOpen(); onClose(); }}>Request a Song</a>
//             {user && (
//                 <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
//             )}
//         </div>
//     );
// }

// function MusicPlayer() {
//     const {
//         selectedSong,
//         setSelectedSong,
//         isPlaying,
//         setIsPlaying,
//         currentTime,
//         setCurrentTime,
//         volume,
//         setVolume,
//         isMinimized,
//         setIsMinimized,
//         currentSongIndex,
//         audioRef
//     } = useMusicPlayer();

//     const location = useLocation();
//     const excludedPaths = ['/login', '/'];
//     const showPlayer = !excludedPaths.includes(location.pathname);

//     useEffect(() => {
//         document.body.classList.toggle('no-scroll', !isMinimized);
//     }, [isMinimized]);

//     if (!selectedSong || !showPlayer) return null;

//     const togglePlay = () => setIsPlaying(!isPlaying);

//     const changeSong = (offset) => {
//         if (!selectedSong?.songList?.length) return;
//         const newIndex = (currentSongIndex + offset + selectedSong.songList.length) % selectedSong.songList.length;
//         setSelectedSong({ ...selectedSong.songList[newIndex], songList: selectedSong.songList });
//         setIsPlaying(true);
//     };

//     const handleTimeDrag = (e) => {
//         if (audioRef.current?.duration) {
//             const newTime = (e.target.value / 100) * audioRef.current.duration;
//             audioRef.current.currentTime = newTime;
//             setCurrentTime(newTime);
//         }
//     };

//     const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
//     const duration = audioRef.current?.duration || 0;
    
//     const thumbnailUrl = selectedSong.thumbnailUrl || selectedSong.thumbnail || 'https://placehold.co/100x100';
//     const primaryText = selectedSong.title || 'Unknown Title';
//     const secondaryText = selectedSong.singer || selectedSong.category || '';
//     const albumText = selectedSong.movie || selectedSong.movieName || selectedSong.genre || 'Audio';

//     return (
//         <div className={`music-player ${isMinimized ? 'minimized' : 'full-screen'}`}>
//             {isMinimized ? (
//                 <div className="player-minimized-content" onClick={() => setIsMinimized(false)}>
//                     <img src={thumbnailUrl} alt={primaryText} className="player-minimized-thumbnail" loading="lazy" />
//                     <div className="player-minimized-info">
//                         <h4>{primaryText}</h4>
//                         <p>{secondaryText}</p>
//                     </div>
//                     <div className="player-minimized-buttons">
//                         <button
//                             className="minimize-player-button"
//                             onClick={(e) => { e.stopPropagation(); changeSong(1); }}
//                             aria-label="Next track"
//                         >
//                             <FontAwesomeIcon icon="fa-step-forward" />
//                         </button>
//                         <button className="close-player-button" onClick={(e) => { e.stopPropagation(); setSelectedSong(null); audioRef.current.pause(); audioRef.current.src = ''; }}>
//                             <FontAwesomeIcon icon="fa-times" />
//                         </button>
//                     </div>
//                 </div>
//             ) : (
//                 <>
//                     <button className="minimize-player-button" onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}>
//                         <FontAwesomeIcon icon="fa-chevron-down" />
//                     </button>
//                     <button className="close-player-button" onClick={(e) => { e.stopPropagation(); setSelectedSong(null); audioRef.current.pause(); audioRef.current.src = ''; }}>
//                         <FontAwesomeIcon icon="fa-times" />
//                     </button>
//                     <div className="player-content" onClick={(e) => e.stopPropagation()}>
//                         <div className="player-background-blur" style={{ backgroundImage: `url(${thumbnailUrl})` }}></div>
//                         <div className="player-foreground-content">
//                             <img src={thumbnailUrl} alt={primaryText} className="player-main-thumbnail" loading="lazy" />
//                             <div className="song-info">
//                                 <h2>{primaryText}</h2>
//                                 <h3>{secondaryText}</h3>
//                                 <p className="song-album">{albumText}</p>
//                             </div>
//                             <div className="controls">
//                                 <div className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</div>
//                                 <input type="range" min="0" max="100" value={duration ? (currentTime / duration) * 100 : 0} onChange={handleTimeDrag} className="progress-bar" style={{ '--progress': duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
//                                 <div className="player-buttons">
//                                     <button onClick={() => changeSong(-1)}><FontAwesomeIcon icon="fa-step-backward" /></button>
//                                     <button onClick={togglePlay}><FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} /></button>
//                                     <button onClick={() => changeSong(1)}><FontAwesomeIcon icon="fa-step-forward" /></button>
//                                 </div>
//                                 <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="volume-slider" />
//                             </div>
//                         </div>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }
// function SongList({ songs, onSongClick, onAddToPlaylist, playlistItemIds }) {
//     return (
//         <div className="songs-row">
//             {songs.map((song) => (
//                 <div
//                     key={song._id}
//                     className="song-tile"
//                     onClick={() => onSongClick(song)}
//                 >
//                     <img
//                         src={song.thumbnailUrl || 'https://placehold.co/120x120/333/FFF?text=♪'}
//                         alt={song.title}
//                         className="song-tile-thumbnail"
//                         loading="lazy"
//                     />
//                     <div className="song-tile-details">
//                         <div className="song-tile-title">{song.title}</div>
//                         <div className="song-tile-singer">{song.singer}</div>
//                         <div className="song-tile-label">{song.movie ? song.movie : 'Album'}</div>
//                     </div>
//                     {!playlistItemIds.has(song._id) && (
//                         <button
//                             className="add-song-button"
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 onAddToPlaylist(song._id, 'Song');
//                             }}
//                             title="Add to Playlist"
//                         >
//                             <FontAwesomeIcon icon="fa-plus" />
//                         </button>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// }

// function LifeLessonList({ items, onItemClick, onAddToPlaylist, playlistItemIds }) {
//     return (
//         <div className="songs-row">
//             {items.map((item) => (
//                 <div
//                     key={item._id}
//                     className="song-tile"
//                     onClick={() => onItemClick(item)}
//                 >
//                     <img
//                         src={item.thumbnail || 'https://placehold.co/120x120/333/FFF?text=♪'}
//                         alt={item.title}
//                         className="song-tile-thumbnail"
//                         loading="lazy"
//                     />
//                     <div className="song-tile-details">
//                         <div className="song-tile-title">{item.title}</div>
//                     </div>
//                     {!playlistItemIds.has(item._id) && (
//                         <button
//                             className="add-song-button"
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 onAddToPlaylist(item._id, 'LifeLesson');
//                             }}
//                             title="Add to Playlist"
//                         >
//                             <FontAwesomeIcon icon="fa-plus" />
//                         </button>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// }

// function OTSList({ items, onItemClick, onAddToPlaylist, playlistItemIds }) {
//     return (
//         <div className="songs-row">
//             {items.map((item) => (
//                 <div
//                     key={item._id}
//                     className="song-tile"
//                     onClick={() => onItemClick(item)}
//                 >
//                     <img
//                         src={item.thumbnail || 'https://placehold.co/120x120/333/FFF?text=♪'}
//                         alt={item.title}
//                         className="song-tile-thumbnail"
//                         loading="lazy"
//                     />
//                     <div className="song-tile-details">
//                         <div className="song-tile-title">{item.title}</div>
//                         <div className="song-tile-label">{item.movieName || 'OTS'}</div>
//                     </div>
//                     {!playlistItemIds.has(item._id) && (
//                         <button
//                             className="add-song-button"
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 onAddToPlaylist(item._id, 'OTS');
//                             }}
//                             title="Add to Playlist"
//                         >
//                             <FontAwesomeIcon icon="fa-plus" />
//                         </button>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// }

// function PlaylistSelectionModal({ isOpen, onClose, onSelectPlaylist, playlists, loading, message, onCreatePlaylist }) {
//     if (!isOpen) return null;
//     return (
//         <div className="playlist-modal-overlay" onClick={onClose}>
//             <div className="playlist-modal" onClick={(e) => e.stopPropagation()}>
//                 <h4>Select Playlist</h4>
//                 {loading ? (
//                     <div className="loading-bar">
//                         <div className="loading-bar-progress"></div>
//                     </div>
//                 ) : playlists.length > 0 ? (
//                     <ul>
//                         {playlists.map((pl) => (
//                             <li key={pl._id}>
//                                 <button className="playlist-modal-btn" onClick={() => onSelectPlaylist(pl._id)}>
//                                     {pl.name}
//                                 </button>
//                             </li>
//                         ))}
//                     </ul>
//                 ) : (
//                     <div className="no-playlist-container">
//                         <p>No playlists found.</p>
//                         <button className="create-playlist-btn" onClick={onCreatePlaylist}>
//                             Create Playlist
//                         </button>
//                     </div>
//                 )}
//                 {message && <div className="playlist-modal-message">{message}</div>}
//                 <button className="playlist-modal-cancel" onClick={onClose}>Cancel</button>
//             </div>
//         </div>
//     );
// }

// function RequestSongModal({ isOpen, onClose }) {
//     const [requests, setRequests] = useState([{ title: '', movie: '' }]);
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState('');
//     const [isSuccess, setIsSuccess] = useState(false);
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         if (isOpen) {
//             setRequests([{ title: '', movie: '' }]);
//             setMessage('');
//             setLoading(false);
//             setIsSuccess(false);
//         }
//     }, [isOpen]);

//     const handleRequestChange = (index, field, value) => {
//         const newRequests = [...requests];
//         newRequests[index][field] = value;
//         setRequests(newRequests);
//     };

//     const handleAddRequest = () => {
//         if (requests.length < 5) {
//             setRequests([...requests, { title: '', movie: '' }]);
//         }
//     };
//     const handleRemoveRequest = (index) => {
//         if (requests.length > 1) {
//             const newRequests = requests.filter((_, i) => i !== index);
//             setRequests(newRequests);
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setMessage('');

//         const validRequests = requests.filter(req => req.title.trim() && req.movie.trim());

//         if (validRequests.length === 0) {
//             setMessage('Please fill out at least one complete song request.');
//             return;
//         }

//         if (validRequests.length !== requests.filter(r => r.title.trim() || r.movie.trim()).length) {
//             setMessage('Please fill out both song title and movie/album for each request line.');
//             return;
//         }

//         setLoading(true);
//         try {
//             await axios.post('https://music-backend-akb5.onrender.com/api/song-requests', validRequests, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setLoading(false);
//             setIsSuccess(true);
//             setMessage('Your requests have been submitted successfully!');
            
//             setTimeout(() => {
//                 onClose();
//             }, 1000);
//         } catch (error) {
//             setLoading(false);
//             setMessage(error.response?.data?.message || 'Failed to submit requests. Please try again.');
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="request-song-modal-overlay" onClick={onClose}>
//             <div className="request-song-modal" onClick={(e) => e.stopPropagation()}>
//                 {isSuccess ? (
//                     <div className="request-success-view">
//                         <FontAwesomeIcon icon="fa-check-circle" style={{fontSize: '3rem', color: '#4caf50', marginBottom: '1rem'}}/>
//                         <h3>Success!</h3>
//                         <p>{message}</p>
//                     </div>
//                 ) : (
//                     <>
//                         <h3 className="request-song-modal-header">Request a Song</h3>
//                         <p className="request-song-modal-subheader">You can request up to 5 songs.</p>
//                         <form onSubmit={handleSubmit}>
//                             <div className="request-list">
//                                 {requests.map((req, index) => (
//                                     <div key={index} className="request-item">
//                                         <input
//                                             type="text"
//                                             placeholder="Song Title"
//                                             value={req.title}
//                                             onChange={(e) => handleRequestChange(index, 'title', e.target.value)}
//                                             className="request-input"
//                                             required
//                                         />
//                                         <input
//                                             type="text"
//                                             placeholder="Movie / Album"
//                                             value={req.movie}
//                                             onChange={(e) => handleRequestChange(index, 'movie', e.target.value)}
//                                             className="request-input"
//                                             required
//                                         />
//                                         <button
//                                             type="button"
//                                             onClick={() => handleRemoveRequest(index)}
//                                             className="remove-request-btn"
//                                             disabled={requests.length <= 1 || loading}
//                                             title="Remove request"
//                                         >
//                                             <FontAwesomeIcon icon="fa-times" />
//                                         </button>
//                                     </div>
//                                 ))}
//                             </div>
//                             <div className="request-song-actions">
//                                 <button
//                                     type="button"
//                                     onClick={handleAddRequest}
//                                     className="add-request-btn"
//                                     disabled={requests.length >= 5 || loading}
//                                 >
//                                     <FontAwesomeIcon icon="fa-plus" /> Add another
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="submit-requests-btn"
//                                     disabled={loading}
//                                 >
//                                     {loading ? 'Submitting...' : 'Submit Requests'}
//                                 </button>
//                             </div>
//                             <div className="request-song-modal-footer">
//                                 {message && <div className="request-modal-message">{message}</div>}
//                                 <button type="button" className="request-modal-cancel" onClick={onClose} disabled={loading}>
//                                     Cancel
//                                 </button>
//                             </div>
//                         </form>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }

// function MoodsScreen({ openRequestModal }) {
//   const navigate = useNavigate();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const moodCategories = [
//     { name: 'happy', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513535/hap_oihkap.jpg' },
//     { name: 'sad', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/sad_lbqcin.jpg' },
//     { name: 'workout', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752961155/gym_ivap8k.png' },
//      { name: 'love', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752515509/love_bnjlgc.jpg' },
//       { name: 'travel', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/travel_xwu6mq.jpg' },
//     { name: 'heartbreak', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513535/heartb_deh8ds.png' },
//     { name: 'spiritual', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513536/spi_o1tzp7.png' },
//      { name: 'mashup', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1764700849/mash2_scprij.jpg' },
//     { name: 'motivational', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/motiva_bvntm6.jpg' },
//     { name: 'nostalgic', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/nos_tv6k55.jpg' },
    
//   ];

//   return (
//     <div className="moods-page-screen">
//       <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//       <Sidebar
//         isOpen={isSidebarOpen}
//         onClose={() => setIsSidebarOpen(false)}
//         onRequestSongOpen={openRequestModal}
//       />
//       <div className="moods-screen content-area">
//         <h2>Choose Your Mood</h2>
//         <div className="mood-cards">
//           {moodCategories.map((mood) => (
//             <div
//               key={mood.name}
//               className="mood-card"
//               onClick={() => navigate(`/moods/${mood.name}`)}
//             >
//               <img src={mood.image} alt={mood.name} />
//             </div>
//           ))}
//         </div>
//       </div>
//       <MusicPlayer />
//     </div>
//   );
// }

// function LifeLessonsScreen({ openRequestModal }) {
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [lifeLessons, setLifeLessons] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [itemToAdd, setItemToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         const fetchLifeLessons = async () => {
//             if (!token) return;
//             setLoading(true);
//             setError(null);
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/lifelessons/all', {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setLifeLessons(Array.isArray(res.data) ? res.data : []);
//             } catch (err) {
//                 console.error('Failed to fetch life lessons:', err);
//                 setError('Failed to fetch life lessons. Please try again later.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchLifeLessons();
//     }, [token]);

//     const handleAddToPlaylist = (itemId, itemType) => {
//         setItemToAdd({ id: itemId, type: itemType });
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         if (!itemToAdd) return;
//         const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
//         setAddMessage(result.message);
//         if (result.success) {
//             // MODIFIED: Removed setTimeout for instant closing
//             setShowPlaylistModal(false);
//             setItemToAdd(null);
//         }
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             await createPlaylist(playlistName.trim());
//         }
//     };

//     return (
//         <div className="lifelessons-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 <h2>Life Lessons</h2>
//                 {loading ? (
//                     <div className="loading"><div></div></div>
//                 ) : error ? (
//                     <div className="search-message">{error}</div>
//                 ) : lifeLessons.length > 0 ? (
//                     <LifeLessonList
//                         items={lifeLessons}
//                         onItemClick={(item) => {
//                             setSelectedSong({ ...item, songList: lifeLessons });
//                             setIsPlaying(true);
//                             setIsMinimized(false);
//                         }}
//                         onAddToPlaylist={handleAddToPlaylist}
//                         playlistItemIds={playlistItemIds}
//                     />
//                 ) : (
//                     <div className="search-message">No life lessons found.</div>
//                 )}
//             </div>
//             <PlaylistSelectionModal
//                 isOpen={showPlaylistModal}
//                 onClose={() => setShowPlaylistModal(false)}
//                 onSelectPlaylist={handleSelectPlaylist}
//                 playlists={playlists}
//                 loading={loadingPlaylists}
//                 message={addMessage}
//                 onCreatePlaylist={handleCreatePlaylist}
//             />
//             <MusicPlayer />
//         </div>
//     );
// }

// function OTSScreen({ openRequestModal }) {
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [otsItems, setOtsItems] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [itemToAdd, setItemToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         const fetchOtsItems = async () => {
//             if (!token) return;
//             setLoading(true);
//             setError(null);
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/ots/all', {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setOtsItems(Array.isArray(res.data) ? res.data : []);
//             } catch (err) {
//                 console.error('Failed to fetch OTS items:', err);
//                 setError('Failed to fetch OTS items. Please try again later.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchOtsItems();
//     }, [token]);

//     const handleAddToPlaylist = (itemId, itemType) => {
//         setItemToAdd({ id: itemId, type: itemType });
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         if (!itemToAdd) return;
//         const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
//         setAddMessage(result.message);
//         if (result.success) {
//             // MODIFIED: Removed setTimeout for instant closing
//             setShowPlaylistModal(false);
//             setItemToAdd(null);
//         }
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             await createPlaylist(playlistName.trim());
//         }
//     };

//     return (
//         <div className="ots-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 <h2>OTS</h2>
//                 {loading ? (
//                     <div className="loading"><div></div></div>
//                 ) : error ? (
//                     <div className="search-message">{error}</div>
//                 ) : otsItems.length > 0 ? (
//                     <OTSList
//                         items={otsItems}
//                         onItemClick={(item) => {
//                             setSelectedSong({ ...item, songList: otsItems });
//                             setIsPlaying(true);
//                             setIsMinimized(false);
//                         }}
//                         onAddToPlaylist={handleAddToPlaylist}
//                         playlistItemIds={playlistItemIds}
//                     />
//                 ) : (
//                     <div className="search-message">No OTS items found.</div>
//                 )}
//             </div>
//             <PlaylistSelectionModal
//                 isOpen={showPlaylistModal}
//                 onClose={() => setShowPlaylistModal(false)}
//                 onSelectPlaylist={handleSelectPlaylist}
//                 playlists={playlists}
//                 loading={loadingPlaylists}
//                 message={addMessage}
//                 onCreatePlaylist={handleCreatePlaylist}
//             />
//             <MusicPlayer />
//         </div>
//     );
// }

// function MainScreen({ openRequestModal }) {
//   const { user } = useAuth();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(false);
//   const navigate = useNavigate();

//   const singersContainerRef = useRef(null);
//   const [showPrev, setShowPrev] = useState(false);
//   const [showNext, setShowNext] = useState(true);

//   useEffect(() => {
//     if (sessionStorage.getItem('showWelcome')) {
//       setShowWelcome(true);
//       const timer = setTimeout(() => {
//         setShowWelcome(false);
//         sessionStorage.removeItem('showWelcome');
//       }, 2500);
//       return () => clearTimeout(timer);
//     }
//   }, [user]);

//   useEffect(() => {
//     const container = singersContainerRef.current;
//     if (!container) return;
//     const handleScroll = () => {
//       const { scrollLeft, scrollWidth, clientWidth } = container;
//       setShowPrev(scrollLeft > 0);
//       setShowNext(scrollLeft < scrollWidth - clientWidth - 1);
//     };
//     handleScroll();
//     container.addEventListener('scroll', handleScroll);
//     return () => container.removeEventListener('scroll', handleScroll);
//   }, []);

//   const singers = [
//     { name: '', id: 'sonu nigam', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/sonu_ztsynp.webp' },
//     { name: '', id: 'lata mangeshkar', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/lata_ezfr2n.webp' },
//     { name: '', id: 'kk', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/kk_py1off.webp' },
//     { name: '', id: 'mohd rafi', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/rafi_n9wslm.webp' },
//     { name: '', id: 'kailash kher', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751878756/kail_ufykhi.jpg' },
//     { name: '', id: 'neha kakkar', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/neha_lzh67j.webp' },
//     { name: '', id: 'kishore kumar', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/kishor_smr0v8.webp' },
//     { name: '', id: 'anirudh', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/ani_wbajfs.webp' },
//     { name: '', id: 'rahat fateh ali khan', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751787551/raha_hinul7.png' },
//     { name: '', id: 'udit narayan', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751878759/udit_idlojx.png' },
//     { name: '', id: 'diljit dosanjh', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/diljit_ftpuid.webp' },
//     { name: '', id: 'jubin nautiyal', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/jubin_am3rn2.webp' },
//     { name: '', id: 'shreya ghoshal', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/sherya_qkynbl.webp' },
//     { name: '', id: 'arijit singh', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/arjit_g4zpgt.webp' },
//     { name: '', id: 'shaan', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751878758/shaan_ayuxds.png' },
//     { name: '', id: 'monali thakur', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751878760/monali_qdoefu.png' },
//   ];
//   const genres = [
//     { name: '', id: 'rap', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751730905/rap_g0sheq.jpg ' },
//     { name: '', id: 'classical', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751730906/class_kh980u.png ' },
//     { name: '', id: 'party', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751730905/party_lm1glx.jpg ' },
//     { name: '', id: 'lo-fi', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751730905/lofi_mpmwqv.jpg ' },
//   ];

//   const scrollSingers = (direction) => {
//     if (singersContainerRef.current) {
//       const scrollAmount = direction === 'right' ? 400 : -400;
//       singersContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
//     }
//   };

//   const handleSingerClick = (singerId) => {
//     navigate(`/singers/${encodeURIComponent(singerId)}`);
//   };

//   const handleGenreClick = (genreId) => {
//     navigate(`/genres/${encodeURIComponent(genreId)}`);
//   };

//   return (
//     <div className="main-screen">
//       {showWelcome && user && (
//         <div className="welcome-overlay fade-in-out">
//           Welcome, {user.fullName.split(' ')[0]}!
//         </div>
//       )}

//       <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//       <Sidebar
//         isOpen={isSidebarOpen}
//         onClose={() => setIsSidebarOpen(false)}
//         onRequestSongOpen={openRequestModal}
//       />

//       <div className="content-area">
//         <section className="singers-section">
//           <h2>Artist Spotlight</h2>
//           <div className="singers-container">
//             <div className="singers-scroll" ref={singersContainerRef}>
//               {singers.map((singer) => (
//                 <div
//                   key={singer.id}
//                   className="singer-card"
//                   onClick={() => handleSingerClick(singer.id)}
//                 >
//                   <img src={singer.imageFileName} alt={singer.name} className="singer-card-image fade-in" loading="lazy" />
//                   <h3>{singer.name}</h3>
//                 </div>
//               ))}
//             </div>
//             {showPrev && ( <button className="singers-scroll-btn left" onClick={() => scrollSingers('left')}><FontAwesomeIcon icon="fa-chevron-left" /></button> )}
//             {showNext && ( <button className="singers-scroll-btn right" onClick={() => scrollSingers('right')}><FontAwesomeIcon icon="fa-chevron-right" /></button> )}
//           </div>
//         </section>

//        <section className="mood-section">
//   <h2>Explore</h2>
//   <div className="mood-cards">
//     <div
//       className="explore-card"
//       onClick={() => navigate('/moods')}
//     >
//       <img
//         src="https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/mood_b1af7g.jpg"
//         alt="Moods"
//       />
//     </div>

//     <div
//       className="explore-card"
//       onClick={() => navigate('/ots')}
//     >
//       <img
//         src="https://res.cloudinary.com/dt2nr7rjg/image/upload/v1764221872/ost_ulo8a3.png"
//         alt="OTS"
//       />
//     </div>

//      <div
//       className="explore-card"
//       onClick={() => navigate('/lifelessons')}
//     >
//       <img
//         src="https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752523470/WhatsApp_Image_2025-07-15_at_01.34.03_bba81101_rybrke.jpg"
//         alt="Life Lessons"
//       />
//     </div>
//   </div>
// </section>

//         <section className="genre-section">
//           <h2>Genres</h2>
//           <div className="genres-cards">
//             {genres.map((genre) => (
//               <div key={genre.id} className="genre-card" onClick={() => handleGenreClick(genre.id)}>
//                 <img src={genre.imageFileName} alt={genre.name} className="genre-card-image fade-in" loading="lazy" />
//                 <h3>{genre.name}</h3>
//               </div>
//             ))}
//           </div>
//         </section>
//       </div>
//       <MusicPlayer />
//     </div>
//   );
// }

// function SearchScreen({ openRequestModal }) {
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [loadingSearch, setLoadingSearch] = useState(false);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [itemToAdd, setItemToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [isListening, setIsListening] = useState(false);
//     const [voiceError, setVoiceError] = useState('');
//     const recognitionRef = useRef(null);
//     const token = localStorage.getItem('token');

//     const debouncedSearch = useMemo(() => {
//         let timeoutId;
//         return (query) => {
//             clearTimeout(timeoutId);
//             if (!query.trim()) {
//                 setSearchResults([]);
//                 setLoadingSearch(false);
//                 return;
//             }
//             timeoutId = setTimeout(async () => {
//                 setLoadingSearch(true);
//                 try {
//                     const url = `https://music-backend-akb5.onrender.com/api/songs?search=${encodeURIComponent(query.trim())}`;
//                     const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
//                     setSearchResults(Array.isArray(res.data) ? res.data : []);
//                 } catch (error) {
//                     console.error('Search error:', error);
//                     setSearchResults([]);
//                 } finally {
//                     setLoadingSearch(false);
//                 }
//             }, 300);
//         };
//     }, [token]);

//     useEffect(() => {
//         debouncedSearch(searchQuery);
//     }, [searchQuery, debouncedSearch]);

//     const handleAddToPlaylist = (itemId, itemType) => {
//         setItemToAdd({ id: itemId, type: itemType });
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         if (!itemToAdd) return;
//         const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
//         setAddMessage(result.message);
//         if (result.success) {
//             // MODIFIED: Removed setTimeout for instant closing
//             setShowPlaylistModal(false);
//             setItemToAdd(null);
//         }
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             await createPlaylist(playlistName.trim());
//         }
//     };

//     const checkMicrophonePermission = useCallback(async () => {
//         try {
//             const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
//             if (permissionStatus.state === 'denied') {
//                 setVoiceError('Microphone access denied.');
//                 return false;
//             }
//             return true;
//         } catch (err) {
//             setVoiceError('Error checking mic permissions.');
//             return false;
//         }
//     }, []);

//     const startVoiceSearch = useCallback(async () => {
//         const hasPermission = await checkMicrophonePermission();
//         if (!hasPermission) return;

//         const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//         if (!SpeechRecognition) {
//             setVoiceError('Voice search not supported.');
//             return;
//         }

//         recognitionRef.current = new SpeechRecognition();
//         recognitionRef.current.lang = 'en-US';
//         recognitionRef.current.interimResults = true;
//         recognitionRef.current.onstart = () => setIsListening(true);
//         recognitionRef.current.onresult = (event) => setSearchQuery(event.results[0][0].transcript);
//         recognitionRef.current.onerror = (event) => {
//             setIsListening(false);
//             setVoiceError('Voice recognition error: ' + event.error);
//         };
//         recognitionRef.current.onend = () => setIsListening(false);
//         recognitionRef.current.start();
//     }, [checkMicrophonePermission]);

//     const toggleVoiceSearch = useCallback(() => {
//         if (isListening) {
//             recognitionRef.current?.stop();
//         } else {
//             startVoiceSearch();
//         }
//     }, [isListening, startVoiceSearch]);

//     useEffect(() => {
//         return () => recognitionRef.current?.stop();
//     }, []);

//     return (
//         <div className="search-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 <h2>Search Songs</h2>
//                 <div className="search-input-container">
//                     <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input-field" placeholder="Search..." autoFocus/>
//                     <button className={`mic-button ${isListening ? 'listening' : ''}`} onClick={toggleVoiceSearch} title="Voice Search">
//                         <FontAwesomeIcon icon={isListening ? 'fa-microphone-slash' : 'fa-microphone'} />
//                     </button>
//                 </div>
//                 {voiceError && <div className="error-message">{voiceError}</div>}
//                 <div className="search-results-section">
//                     {loadingSearch ? <div className="search-message">Searching...</div> :
//                      searchQuery.trim() && searchResults.length > 0 ? (
//                         <SongList
//                             songs={searchResults}
//                             onSongClick={(song) => {
//                                 setSelectedSong({ ...song, songList: searchResults });
//                                 setIsPlaying(true);
//                                 setIsMinimized(false);
//                             }}
//                             onAddToPlaylist={handleAddToPlaylist}
//                             playlistItemIds={playlistItemIds}
//                         />
//                     ) : searchQuery.trim() && !loadingSearch ? (
//                         <div className="search-message">No songs found.</div>
//                     ) : null}
//                 </div>
//             </div>
//             <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} onCreatePlaylist={handleCreatePlaylist}/>
//             <MusicPlayer />
//         </div>
//     );
// }

// function PlaylistDetailScreen({ openRequestModal }) {
//     const { playlistId } = useParams();
//     const navigate = useNavigate(); 
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     // UPDATED: Removed updatePlaylistName
//     const { playlists, removeItemFromPlaylist, loadingPlaylists, deletePlaylist } = usePlaylist();
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
//     const playlist = useMemo(() => playlists.find((p) => p._id === playlistId), [playlists, playlistId]);

//     // UPDATED: Handle Delete Playlist
//     const handleDeletePlaylist = async () => {
//         if (window.confirm(`Are you sure you want to delete "${playlist.name}"? This cannot be undone.`)) {
//             const result = await deletePlaylist(playlistId);
//             if (result.success) {
//                 navigate('/main'); 
//             } else {
//                 setMessage(result.message);
//                 setTimeout(() => setMessage(''), 2000);
//             }
//         }
//     };

//     const handleRemoveItem = async (itemId) => {
//         // MODIFIED: Removed window.confirm check
//         const result = await removeItemFromPlaylist(playlistId, itemId);
//         setMessage(result.message);
//         setTimeout(() => setMessage(''), 2000);
//     };

//     if (loadingPlaylists) return <div className="content-area loading"><div></div></div>;
//     if (!playlist) return <div className="content-area"><p>Playlist not found.</p></div>;

//     const playableList = playlist.items?.map(item => ({...(item.itemRef), _id: item.itemRef?._id || item._id})) || [];

//     return (
//         <div className="playlist-detail-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 {/* UPDATED HEADER: Pencil icon removed */}
//                 <div className="playlist-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
//                     <h2 style={{ margin: 0 }}>{playlist.name}</h2>
//                     <div className="playlist-actions">
//                         <button 
//                             onClick={handleDeletePlaylist} 
//                             title="Delete Playlist"
//                             style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.2rem' }}
//                         >
//                             <FontAwesomeIcon icon="fa-trash" />
//                         </button>
//                     </div>
//                 </div>

//                 {message && <div className="info-message">{message}</div>}

//                 {playlist.items?.length > 0 ? (
//                     <div className="songs-column">
//                         {playlist.items.map((item) => (
//                             item?.itemRef && (
//                             <div
//                                 key={item._id}
//                                 className="song-card full-line"
//                                 onClick={() => {
//                                     setSelectedSong({ ...item.itemRef, songList: playableList });
//                                     setIsPlaying(true);
//                                     setIsMinimized(false);
//                                 }}
//                             >
//                                 <img
//                                     src={item.itemRef.thumbnail || item.itemRef.thumbnailUrl || 'https://placehold.co/50x50'}
//                                     alt={item.itemRef.title}
//                                     className="song-thumbnail"
//                                     loading="lazy"
//                                 />
//                                 <div className="song-details">
//                                     <h4>{item.itemRef.title}</h4>
//                                     <p>{item.itemRef.singer || item.itemRef.movieName || item.itemType}</p>
//                                 </div>
//                                 <button
//                                     className="remove-song-button"
//                                     onClick={(e) => { e.stopPropagation(); handleRemoveItem(item._id); }}
//                                 >
//                                     <FontAwesomeIcon icon="fa-minus" />
//                                 </button>
//                             </div>
//                             )
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="search-message">This playlist is empty.</div>
//                 )}
//             </div>
//             <MusicPlayer />
//         </div>
//     );
// }

// function CategorySongsScreen({ categoryType, openRequestModal }) {
//     const { name } = useParams();
//     const { user } = useAuth();
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [songs, setSongs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [itemToAdd, setItemToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [randomMessage, setRandomMessage] = useState('');
//     const [error, setError] = useState(null);
//     const [showTitle, setShowTitle] = useState(false);
    
//     const [selectedLanguage, setSelectedLanguage] = useState('all');
//     const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
//     const languageWrapperRef = useRef(null); 
     
//     const token = localStorage.getItem('token');
    
//     const languages = [
//         { value: 'all', label: 'All' },
//         { value: 'hindi', label: 'Hindi' },
//         { value: 'english', label: 'English' },
//         { value: 'punjabi', label: 'Punjabi' },
//         { value: 'telugu', label: 'Telugu' },
//         { value: 'kannada', label: 'Kannada' },
//         { value: 'tamil', label: 'Tamil' }
//     ];

//     const messagesConfig = useMemo(() => ({
//         love: ["Hey ${username}, let your heart sing louder than words.", "${username}, fall in love with every note."],
//         travel: ["Adventure awaits, ${username} — let the music guide you.", "Wanderlust in every beat, just for you ${username}."],
//         happy: ["Smile wide, ${username} — these songs are your sunshine.", "Turn up the joy, ${username}, and dance like no one's watching."],
//         sad: ["It's okay to feel, ${username} — let these songs hold you.", "Lean on these melodies, ${username}, when words aren't enough."],
//         motivational: ["Rise and conquer, ${username} — let the music push you.", "Fuel your fire, ${username}, one beat at a time."],
//         nostalgic: ["A trip down memory lane for you, ${username}.", "Relive the golden days with these songs, ${username}."],
//         heartbreak: ["Some songs understand you better than words, ${username}.", "Let it all out, ${username} — these tracks feel your pain."],
//         spiritual: ["Find your center, ${username}, in every chord.", "Breathe deeply with these mindful tunes, ${username}."],
//         calm: ["Slow down, ${username} — breathe with these soothing sounds.", "Ease your mind, ${username}, with gentle melodies."],
//         rap: ["Spit fire, ${username}, let the beats talk.", "Get in the zone with these bars, ${username}."],
//         party: ["Let's turn it up, ${username} — the party starts here.", "${username}, dance like nobody's watching."],
//         classical: ["Timeless beauty in every note for you, ${username}.", "Close your eyes and let it flow, ${username}."],
//         'lo-fi': ["Chill out, ${username}, with these mellow beats.", "Your perfect study companion, ${username}."]
//     }), []);

//     useEffect(() => {
//         setLoading(true);
//         setError(null);
        
//         let apiUrl = `https://music-backend-akb5.onrender.com/api/songs?${categoryType}=${encodeURIComponent(name)}`;
        
//         if (selectedLanguage !== 'all') {
//             apiUrl += `&language=${encodeURIComponent(selectedLanguage)}`;
//         }
        
//         axios.get(apiUrl, { headers: { Authorization: `Bearer ${token}` } })
//         .then(res => setSongs(Array.isArray(res.data) ? res.data : []))
//         .catch(err => setError(`Failed to fetch songs: ${err.message || 'Server error'}`))
//         .finally(() => setLoading(false));
//     }, [name, categoryType, token, selectedLanguage]);

//     useEffect(() => {
//         const handleClickOutside = (e) => {
//             if (showLanguageDropdown && languageWrapperRef.current && !languageWrapperRef.current.contains(e.target)) {
//                 setShowLanguageDropdown(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, [showLanguageDropdown]);

//     useEffect(() => {
//         const firstName = user?.fullName?.split(' ')[0] || 'friend';
//         const messages = messagesConfig[name] || [];
//         if (songs.length > 0 && messages.length > 0) {
//             const personalized = messages[Math.floor(Math.random() * messages.length)].replace(/\${username}/g, firstName);
//             setRandomMessage(personalized);
//             setShowTitle(false);
//             const timeout = setTimeout(() => {
//                 setRandomMessage('');
//                 setShowTitle(true);
//             }, 6500);
//             return () => clearTimeout(timeout);
//         }
//     }, [name, songs, user, messagesConfig]);

//     const handleAddToPlaylist = (itemId, itemType) => {
//         setItemToAdd({ id: itemId, type: itemType });
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     }; 

//     const handleSelectPlaylist = async (playlistId) => {
//         if (!itemToAdd) return;
//         const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
//         setAddMessage(result.message);
//         if (result.success) {
//             // MODIFIED: Removed setTimeout for instant closing
//             setShowPlaylistModal(false);
//             setItemToAdd(null);
//         }
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             await createPlaylist(playlistName.trim());
//         }
//     };

//     const handleLanguageSelect = (language) => {
//         setSelectedLanguage(language);
//         setShowLanguageDropdown(false);
//     };

//     if (!user) return <div className="content-area"><p>Please log in.</p></div>;

//     return (
//         <div className="mood-songs-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 {randomMessage && <div className="random-message animate-fade-in-out">{randomMessage}</div>}
//                 {showTitle && <h2 className="category-title fade-in">{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>}
                
//                 <div className="language-filter-container" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
//                     <div className="language-dropdown-wrapper" style={{ position: 'relative', display: 'inline-block' }} ref={languageWrapperRef}>
//                         <button 
//                             className="language-filter-btn" 
//                             onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
//                             style={{
//                                 background: '#333',
//                                 color: 'white',
//                                 border: '1px solid #555',
//                                 padding: '8px 16px',
//                                 borderRadius: '8px',
//                                 cursor: 'pointer',
//                                 fontSize: '14px',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: '8px'
//                             }}
//                         >
//                             <FontAwesomeIcon icon="fa-globe" />
//                             {languages.find(lang => lang.value === selectedLanguage)?.label || 'All'}
//                             <FontAwesomeIcon icon={showLanguageDropdown ? "fa-chevron-up" : "fa-chevron-down"} />
//                         </button>
                        
//                         {showLanguageDropdown && (
//                             <div className="language-dropdown" 
//                                 style={{
//                                     position: 'absolute',
//                                     top: '100%',
//                                     right: 0,
//                                     background: '#222',
//                                     border: '1px solid #444',
//                                     borderRadius: '8px',
//                                     boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
//                                     zIndex: 1000,
//                                     minWidth: '140px'
//                                 }}
//                             >
//                                 {languages.map((language) => (
//                                     <div
//                                         key={language.value}
//                                         className="language-option"
//                                         onClick={() => handleLanguageSelect(language.value)}
//                                         style={{
//                                             padding: '12px 16px',
//                                             cursor: 'pointer',
//                                             color: 'white',
//                                             fontSize: '14px',
//                                             borderBottom: language.value === languages[languages.length - 1].value ? 'none' : '1px solid #444'
//                                         }}
//                                         onMouseEnter={(e) => e.target.style.background = '#444'}
//                                         onMouseLeave={(e) => e.target.style.background = 'transparent'}
//                                     >
//                                         {language.label}
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {loading ? <div className="loading"><div></div></div> : 
//                  error ? <div className="search-message">{error}</div> : 
//                  songs.length > 0 ? (
//                     <SongList 
//                         songs={songs} 
//                         onSongClick={(song) => { 
//                             setSelectedSong({ ...song, songList: songs }); 
//                             setIsPlaying(true); 
//                             setIsMinimized(false); 
//                         }} 
//                         onAddToPlaylist={handleAddToPlaylist} 
//                         playlistItemIds={playlistItemIds}
//                     />
//                 ) : (
//                     <div className="search-message">No songs found for this category.</div>
//                 )}
//             </div>
//             <PlaylistSelectionModal 
//                 isOpen={showPlaylistModal} 
//                 onClose={() => setShowPlaylistModal(false)} 
//                 onSelectPlaylist={handleSelectPlaylist} 
//                 playlists={playlists} 
//                 loading={loadingPlaylists} 
//                 message={addMessage} 
//                 onCreatePlaylist={handleCreatePlaylist}
//             />
//             <MusicPlayer />
//         </div>
//     );
// }

// function SingerSongsScreen({ openRequestModal }) {
//     const { name } = useParams();
//     const { user } = useAuth();
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
//     const [songs, setSongs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [itemToAdd, setItemToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [error, setError] = useState(null);
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         setLoading(true);
//         setError(null);
//         axios.get(`https://music-backend-akb5.onrender.com/api/songs?singer=${encodeURIComponent(name)}`, { headers: { Authorization: `Bearer ${token}` } })
//         .then(res => setSongs(Array.isArray(res.data) ? res.data : []))
//         .catch(err => setError(`Failed to fetch songs: ${err.message || 'Server error'}`))
//         .finally(() => setLoading(false));
//     }, [name, token]);

//     const handleAddToPlaylist = (itemId, itemType) => {
//         setItemToAdd({ id: itemId, type: itemType });
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         if (!itemToAdd) return;
//         const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
//         setAddMessage(result.message);
//         if (result.success) {
//             // MODIFIED: Removed setTimeout for instant closing
//             setShowPlaylistModal(false);
//             setItemToAdd(null);
//         }
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) {
//             await createPlaylist(playlistName.trim());
//         }
//     };

//     if (!user) return <div className="content-area"><p>Please log in.</p></div>;

//     return (
//         <div className="singer-songs-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 <h2>{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>
//                 {loading ? <div className="loading"><div></div></div> : 
//                  error ? <div className="search-message">{error}</div> : 
//                  songs.length > 0 ? (
//                     <SongList songs={songs} onSongClick={(song) => { setSelectedSong({ ...song, songList: songs }); setIsPlaying(true); setIsMinimized(false);}} onAddToPlaylist={handleAddToPlaylist} playlistItemIds={playlistItemIds}/>
//                 ) : (
//                     <div className="search-message">No songs found for this singer.</div>
//                 )}
//             </div>
//             <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} onCreatePlaylist={handleCreatePlaylist}/>
//             <MusicPlayer />
//         </div>
//     );
// }

// function Account({ openRequestModal }) {
//     const { user, updateUser, loading } = useAuth();
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [editProfileOpen, setEditProfileOpen] = useState(false);
//     const [isSaving, setIsSaving] = useState(false);
//     const [newFullName, setNewFullName] = useState('');

//     useEffect(() => {
//         if (user?.fullName) setNewFullName(user.fullName);
//     }, [user]);

//     const handleEditProfile = () => {
//         if (user?.fullName) {
//             setNewFullName(user.fullName);
//             setEditProfileOpen(true);
//         }
//     };

//     const saveProfile = async () => {
//         if (!newFullName.trim()) {
//             setMessage("Full name cannot be empty.");
//             return;
//         }
//         setIsSaving(true);
//         const result = await updateUser({ fullName: newFullName.trim() });
//         setMessage(result.message);
//         setIsSaving(false);
//         if (result.success) setEditProfileOpen(false);
//         setTimeout(() => setMessage(""), 3000);
//     };

//     const formatJoinDate = (joinDate) => {
//         return joinDate ? new Date(joinDate).toLocaleDateString() : "N/A";
//     };

//     return (
//         <div className="account-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
//             <div className="content-area">
//                 <h2>Account Details{' '}
//                     <button className="edit-profile-button" onClick={handleEditProfile}><FontAwesomeIcon icon="fa-pencil" /></button>
//                 </h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {editProfileOpen && (
//                     <div className="modal-overlay">
//                         <div className="modal-content">
//                             <h3>Edit Profile</h3>
//                             <input type="text" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} placeholder="Full name" disabled={isSaving} />
//                             <button onClick={saveProfile} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button>
//                             <button onClick={() => setEditProfileOpen(false)} disabled={isSaving}>Cancel</button>
//                         </div>
//                     </div>
//                 )}
//                 {loading ? <div className="loading"><div></div></div> : 
//                  user ? (
//                     <>
//                         <p><strong>Full Name:</strong> {user.fullName}</p>
//                         <p><strong>Email:</strong> {user.email}</p>
//                         <p><strong>Phone:</strong> {user.phone}</p>
//                         <p><strong>Join Date:</strong> {formatJoinDate(user.joinDate)}</p>
//                     </>
//                 ) : (
//                     <p>User data not available.</p>
//                 )}
//             </div>
//             <MusicPlayer />
//         </div>
//     );
// }

// function App() {
//     const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

//     return (
//         <Router>
//             <AuthProvider>
//                 <MusicPlayerProvider>
//                     <PlaylistProvider>
//                         <RequestSongModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
//                         <Routes>
//                             <Route path="/" element={<SplashScreen />} />
//                             <Route path="/login" element={<PublicRoute><AuthScreen /></PublicRoute>} />
//                             <Route path="/main" element={<ProtectedRoute><MainScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/search" element={<ProtectedRoute><SearchScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/account" element={<ProtectedRoute><Account openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/moods" element={<ProtectedRoute><MoodsScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/lifelessons" element={<ProtectedRoute><LifeLessonsScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/ots" element={<ProtectedRoute><OTSScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/moods/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="mood" openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/genres/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="genre" openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/singers/:name" element={<ProtectedRoute><SingerSongsScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetailScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
//                             <Route path="*" element={<ProtectedRoute><Navigate to="/main" replace /></ProtectedRoute>} />
//                         </Routes>
//                     </PlaylistProvider>
//                 </MusicPlayerProvider>
//             </AuthProvider>
//         </Router>
//     );
// }

// export default App;

import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import './index.css';

library.add(fas);

// --- Music Player Context ---
const MusicPlayerContext = createContext();

function MusicPlayerProvider({ children }) {
    const [currentSong, setCurrentSong] = useState(null);
    const [queue, setQueue] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isMinimized, setIsMinimized] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const audioRef = useRef(new Audio()); 
    
    // Initialize audio settings once
    useEffect(() => {
        audioRef.current.preload = 'auto';
        audioRef.current.crossOrigin = 'anonymous';
    }, []);

    // Browser History / Back Button Logic
    useEffect(() => {
        const handlePopState = (event) => {
            // If player is open (not minimized) and back button is pressed
            if (!isMinimized) {
                // Minimize the player
                setIsMinimized(true);
                // We consume the event so it doesn't navigate back in router if possible
                // (React Router will still see the pop, but since we pushed state, 
                // popping it just returns us to the same URL effectively)
            }
        };

        if (currentSong && !isMinimized) {
            // Push a new entry to history so Back button has something to "pop"
            // only if we aren't already in that state
            if (!window.history.state || window.history.state.musicPlayer !== 'open') {
                window.history.pushState({ musicPlayer: 'open' }, '');
            }
            window.addEventListener('popstate', handlePopState);
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [currentSong, isMinimized]);

    const playTrack = useCallback((song, newQueue = []) => {
        if (newQueue.length > 0) {
            setQueue(newQueue);
            const idx = newQueue.findIndex(s => (s._id || s.id) === (song._id || song.id));
            setCurrentIndex(idx !== -1 ? idx : 0);
        } else {
            const idx = queue.findIndex(s => (s._id || s.id) === (song._id || song.id));
            if (idx !== -1) setCurrentIndex(idx);
            else {
                setQueue([song]);
                setCurrentIndex(0);
            }
        }
        setCurrentSong(song);
        setIsPlaying(true);
        setIsMinimized(false);
    }, [queue]);

    const nextTrack = useCallback(() => {
        if (queue.length === 0) { setIsPlaying(false); return; }
        const nextIdx = (currentIndex + 1) % queue.length;
        setCurrentIndex(nextIdx);
        setCurrentSong(queue[nextIdx]);
        setIsPlaying(true);
    }, [queue, currentIndex]);

    const prevTrack = useCallback(() => {
        if (queue.length === 0) return;
        if (audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }
        const prevIdx = (currentIndex - 1 + queue.length) % queue.length;
        setCurrentIndex(prevIdx);
        setCurrentSong(queue[prevIdx]);
        setIsPlaying(true);
    }, [queue, currentIndex]);

    // Handle Audio Source & Play/Pause
    useEffect(() => {
        const audio = audioRef.current;
        const audioSrc = currentSong?.audioUrl || currentSong?.audio;

        if (!currentSong) {
            audio.pause();
            audio.src = '';
            setIsPlaying(false);
            setCurrentTime(0);
            return;
        }

        if (audioSrc && audio.src !== audioSrc) {
            audio.src = audioSrc;
            audio.load();
            if (isPlaying) {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => console.error("Playback error:", error));
                }
            }
        } else if (audioSrc) {
            if (isPlaying) {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => console.error("Playback error:", error));
                }
            } else {
                audio.pause();
            }
        }

        const updateTime = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => nextTrack();

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentSong, isPlaying, nextTrack]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
            navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
            navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
            navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
        }
        return () => {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
                navigator.mediaSession.setActionHandler('previoustrack', null);
                navigator.mediaSession.setActionHandler('nexttrack', null);
            }
        };
    }, [nextTrack, prevTrack]);

    const closePlayer = useCallback(() => {
        setIsPlaying(false);
        setCurrentSong(null);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = ''; 
        }
    }, []);

    const value = {
        currentSong, queue, isPlaying, setIsPlaying,
        currentTime, setCurrentTime, volume, setVolume,
        isMinimized, setIsMinimized, currentIndex,
        playTrack, nextTrack, prevTrack,
        audioRef, closePlayer
    };

    return (
        <MusicPlayerContext.Provider value={value}>
            {children}
        </MusicPlayerContext.Provider>
    );
}

function useMusicPlayer() {
    return useContext(MusicPlayerContext);
}

// --- Auth Context ---
const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const processUserData = (userData) => {
        if (userData && typeof userData.joinDate === 'string') {
            return { ...userData, joinDate: new Date(userData.joinDate) };
        }
        return userData;
    };

    const fetchUserProfile = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const res = await axios.get('https://music-backend-akb5.onrender.com/api/user/profile');
                setUser(processUserData(res.data));
            } catch {
                setUser(null);
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const login = (token, userData, navigate) => {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(processUserData(userData));
        sessionStorage.setItem('showWelcome', 'true');
        navigate('/main');
    };

    const logout = (navigate) => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        sessionStorage.removeItem('showWelcome');
        navigate('/login');
    };

    const updateUser = async (userData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return { success: false, message: 'No authentication token found.' };
            await axios.put('https://music-backend-akb5.onrender.com/api/user/profile', userData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchUserProfile();
            return { success: true, message: 'Profile updated successfully!' };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Server error. Please try again later.',
            };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    return useContext(AuthContext);
}

// --- Playlist Context ---
const PlaylistContext = createContext();

function PlaylistProvider({ children }) {
    const [playlists, setPlaylists] = useState([]);
    const [playlistItemIds, setPlaylistItemIds] = useState(new Set());
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const { user } = useAuth();
    const token = localStorage.getItem('token');

    const fetchPlaylists = useCallback(async () => {
        if (!user || !token) {
            setPlaylists([]);
            setPlaylistItemIds(new Set());
            return;
        }
        setLoadingPlaylists(true);
        try {
            const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const fetchedPlaylists = res.data || [];
            setPlaylists(fetchedPlaylists);
            const itemIds = new Set(
                fetchedPlaylists.flatMap(p => p.items?.map(item => item.itemRef?._id) || [])
            );
            setPlaylistItemIds(itemIds);
        } catch (error) {
            console.error('Failed to fetch playlists:', error);
            setPlaylists([]);
        } finally {
            setLoadingPlaylists(false);
        }
    }, [user, token]);

    useEffect(() => {
        fetchPlaylists();
    }, [fetchPlaylists]);

    const addToPlaylist = async (itemId, playlistId, itemType) => {
        try {
            const playlist = playlists.find(p => p._id === playlistId);
            if (playlist?.items?.some(item => item.itemRef?._id === itemId)) {
                return { success: false, message: 'Item already in playlist' };
            }
            await axios.post(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}/addItem`, 
                { itemType: itemType, itemRef: itemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchPlaylists();
            return { success: true, message: 'Item added to playlist!' };
        } catch (err) {
            console.error('Failed to add item:', err);
            return { success: false, message: 'Failed to add item.' };
        }
    };
    
    const createPlaylist = async (name) => {
        try {
            await axios.post('https://music-backend-akb5.onrender.com/api/playlists', { name: name }, { headers: { Authorization: `Bearer ${token}` } });
            await fetchPlaylists();
            return { success: true, message: 'Playlist created!' };
        } catch (error) {
            console.error('Failed to create playlist:', error);
            return { success: false, message: 'Failed to create playlist.' };
        }
    };

    const removeItemFromPlaylist = async (playlistId, itemId) => {
        try {
            await axios.delete(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}/items/${itemId}`, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchPlaylists();
            return { success: true, message: 'Item removed successfully!' };
        } catch (error) {
            console.error('Failed to remove item:', error);
            return { success: false, message: 'Failed to remove item.' };
        }
    };

    const reorderPlaylistLocally = (playlistId, newItems) => {
        setPlaylists(prev => prev.map(p => {
            if (p._id === playlistId) {
                return { ...p, items: newItems };
            }
            return p;
        }));
    };

    const deletePlaylist = async (playlistId) => {
        try {
            await axios.delete(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchPlaylists();
            return { success: true, message: 'Playlist deleted successfully!' };
        } catch (error) {
            console.error('Failed to delete playlist:', error);
            return { success: false, message: 'Failed to delete playlist.' };
        }
    };

    const value = { 
        playlists, 
        playlistItemIds, 
        loadingPlaylists, 
        addToPlaylist, 
        createPlaylist, 
        removeItemFromPlaylist,
        deletePlaylist,
        reorderPlaylistLocally
    };

    return (
        <PlaylistContext.Provider value={value}>
            {children}
        </PlaylistContext.Provider>
    );
}

function usePlaylist() {
    return useContext(PlaylistContext);
}

// --- Route Components ---
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading"><div></div></div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading"><div></div></div>;
    if (user) return <Navigate to="/main" replace />;
    return children;
}

// --- UI Components ---
function SplashScreen() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return;
        const timer = setTimeout(() => {
            if (user) navigate('/main');
            else navigate('/login');
        }, 2000);
        return () => clearTimeout(timer);
    }, [navigate, user, loading]);
    return (
        <div className="splash-screen">
            <h1>SunDhun</h1>
        </div>
    );
}

function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/main', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const endpoint = isLogin ? 'https://music-backend-akb5.onrender.com/api/auth/login' : 'https://music-backend-akb5.onrender.com/api/auth/register';
            const data = isLogin ? { email, password } : { fullName, email, password, phone };
            const res = await axios.post(endpoint, data);
            if (res.data.token && res.data.user) {
                login(res.data.token, res.data.user, navigate);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="auth-screen">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>{isLogin ? 'Login' : 'Signup'}</h2>
                {!isLogin && (
                    <>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required />
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" required />
                    </>
                )}
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                <button type="submit" disabled={loading}>{loading ? 'Processing...' : (isLogin ? 'Login' : 'Signup')}</button>
                <p className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Need an account? Signup' : 'Already have an account? Login'}</p>
                {message && <div className="error-message">{message}</div>}
            </form>
        </div>
    );
}

function Navbar({ toggleSidebar }) {
    const navigate = useNavigate();

    return (
        <div className="navbar">
            <div className="navbar-logo" onClick={() => navigate('/main')}>SunDhun</div>
            <div className="navbar-right">
                <div className="search-box" onClick={() => navigate('/search')}>
                    <FontAwesomeIcon icon="fa-search" />
                </div>
                <div className="sidebar-toggle" onClick={toggleSidebar}>☰</div>
            </div>
        </div>
    );
}

function Sidebar({ isOpen, onClose, onRequestSongOpen }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { setIsPlaying, audioRef, closePlayer } = useMusicPlayer();
    const { playlists, loadingPlaylists, createPlaylist } = usePlaylist();
    const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
    const [showModeDropdown, setShowModeDropdown] = useState(false);
    const [mode, setMode] = useState(localStorage.getItem('mode') || 'dark');
    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest('.sidebar-toggle')) {
                onClose();
                setShowModeDropdown(false);
                setShowPlaylistDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    useEffect(() => {
        document.body.dataset.mode = mode;
        localStorage.setItem('mode', mode);
    }, [mode]);

    const handleLogout = () => {
        closePlayer(); // Stop music on logout
        logout(navigate);
        onClose();
    };

    const handleCreatePlaylist = async () => {
        const playlistName = prompt('Enter playlist name:');
        if (playlistName?.trim()) {
            const result = await createPlaylist(playlistName.trim());
            if (result.success) {
                setShowPlaylistDropdown(true);
            }
        }
    };
    return (
        <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
            <a href="/account" onClick={(e) => { e.preventDefault(); navigate('/account'); onClose(); }}>Account</a>
            <div className="sidebar-item-with-dropdown">
                <a href="#" onClick={(e) => { e.preventDefault(); setShowModeDropdown((prev) => !prev); }}>Mode</a>
                {showModeDropdown && (
                    <div className="mode-dropdown">
                        <span onClick={() => { setMode('dark'); setShowModeDropdown(false); }}>Dark</span>
                        <span onClick={() => { setMode('light'); setShowModeDropdown(false); }}>Light</span>
                        <span onClick={() => { setMode('neon'); setShowModeDropdown(false); }}>Neon</span>
                    </div>
                )}
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowPlaylistDropdown(!showPlaylistDropdown); }}>Playlist</a>
            {showPlaylistDropdown && (
                <div className="playlist-dropdown">
                    {loadingPlaylists ? <span>Loading...</span> : (
                        <>
                            {playlists.map(playlist => (
                                <span key={playlist._id} onClick={() => { navigate(`/playlist/${playlist._id}`); onClose(); }}>
                                    {playlist.name}
                                </span>
                            ))}
                            <span onClick={handleCreatePlaylist} className="create-playlist">
                                <FontAwesomeIcon icon="fa-plus" /> Create New
                            </span>
                        </>
                    )}
                </div>
            )}
            
          <a href="#" onClick={(e) => { e.preventDefault(); onRequestSongOpen(); onClose(); }}>Request a Song</a>
            {user && (
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
            )}
        </div>
    );
}

function MusicPlayer() {
    const {
        currentSong,
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime,
        volume,
        setVolume,
        isMinimized,
        setIsMinimized,
        audioRef,
        nextTrack,
        prevTrack,
        closePlayer
    } = useMusicPlayer();

    const location = useLocation();
    const excludedPaths = ['/login', '/'];
    const showPlayer = !excludedPaths.includes(location.pathname);

    useEffect(() => {
        document.body.classList.toggle('no-scroll', !isMinimized);
    }, [isMinimized]);

    if (!currentSong || !showPlayer) return null;

    const togglePlay = () => setIsPlaying(!isPlaying);

    const handleTimeDrag = (e) => {
        if (audioRef.current?.duration) {
            const newTime = (e.target.value / 100) * audioRef.current.duration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
    const duration = audioRef.current?.duration || 0;
    
    const thumbnailUrl = currentSong.thumbnailUrl || currentSong.thumbnail || 'https://placehold.co/100x100';
    const primaryText = currentSong.title || 'Unknown Title';
    const secondaryText = currentSong.singer || currentSong.category || '';
    const albumText = currentSong.movie || currentSong.movieName || currentSong.genre || 'Audio';

    return (
        <div className={`music-player ${isMinimized ? 'minimized' : 'full-screen'}`}>
            {isMinimized ? (
                <div className="player-minimized-content" onClick={() => setIsMinimized(false)}>
                    <img src={thumbnailUrl} alt={primaryText} className="player-minimized-thumbnail" loading="lazy" />
                    <div className="player-minimized-info">
                        <h4>{primaryText}</h4>
                        <p>{secondaryText}</p>
                    </div>
                    <div className="player-minimized-buttons">
                        <button className="minimize-player-button" onClick={(e) => { e.stopPropagation(); nextTrack(); }} aria-label="Next track">
                            <FontAwesomeIcon icon="fa-step-forward" />
                        </button>
                        <button className="close-player-button" onClick={(e) => { e.stopPropagation(); closePlayer(); }}>
                            <FontAwesomeIcon icon="fa-times" />
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <button className="minimize-player-button" onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}>
                        <FontAwesomeIcon icon="fa-chevron-down" />
                    </button>
                    <button className="close-player-button" onClick={(e) => { e.stopPropagation(); closePlayer(); }}>
                        <FontAwesomeIcon icon="fa-times" />
                    </button>
                    <div className="player-content" onClick={(e) => e.stopPropagation()}>
                        <div className="player-background-blur" style={{ backgroundImage: `url(${thumbnailUrl})` }}></div>
                        <div className="player-foreground-content">
                            <img src={thumbnailUrl} alt={primaryText} className="player-main-thumbnail" loading="lazy" />
                            <div className="song-info">
                                <h2>{primaryText}</h2>
                                <h3>{secondaryText}</h3>
                                <p className="song-album">{albumText}</p>
                            </div>
                            <div className="controls">
                                <div className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</div>
                                <input type="range" min="0" max="100" value={duration ? (currentTime / duration) * 100 : 0} onChange={handleTimeDrag} className="progress-bar" style={{ '--progress': duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
                                <div className="player-buttons">
                                    <button onClick={prevTrack}><FontAwesomeIcon icon="fa-step-backward" /></button>
                                    <button onClick={togglePlay} className="play-btn-large">
                                        <FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} />
                                    </button>
                                    <button onClick={nextTrack}><FontAwesomeIcon icon="fa-step-forward" /></button>
                                </div>
                                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="volume-slider" />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function SongList({ songs, onSongClick, onAddToPlaylist, playlistItemIds }) {
    const { currentSong, isPlaying } = useMusicPlayer();

    return (
        <div className="songs-row">
            {songs.map((song) => {
                const isActive = currentSong && (currentSong._id === song._id || currentSong.id === song._id);
                return (
                <div
                    key={song._id}
                    className={`song-tile ${isActive ? 'active-song' : ''}`}
                    onClick={() => onSongClick(song)}
                >
                    <img
                        src={song.thumbnailUrl || 'https://placehold.co/120x120/333/FFF?text=♪'}
                        alt={song.title}
                        className="song-tile-thumbnail"
                        loading="lazy"
                    />
                    <div className="song-tile-details">
                        <div className="song-tile-title" style={{ color: isActive ? '#1db954' : 'inherit' }}>
                            {song.title} {isActive && isPlaying && <FontAwesomeIcon icon="fa-volume-up" size="xs"/>}
                        </div>
                        <div className="song-tile-singer">{song.singer}</div>
                        <div className="song-tile-label">{song.movie ? song.movie : 'Album'}</div>
                    </div>
                    {!playlistItemIds.has(song._id) && (
                        <button
                            className="add-song-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToPlaylist(song._id, 'Song');
                            }}
                            title="Add to Playlist"
                        >
                            <FontAwesomeIcon icon="fa-plus" />
                        </button>
                    )}
                </div>
            )})}
        </div>
    );
}

function LifeLessonList({ items, onItemClick, onAddToPlaylist, playlistItemIds }) {
    const { currentSong } = useMusicPlayer();
    return (
        <div className="songs-row">
            {items.map((item) => (
                <div
                    key={item._id}
                    className={`song-tile ${currentSong && currentSong._id === item._id ? 'active-song' : ''}`}
                    onClick={() => onItemClick(item)}
                >
                    <img src={item.thumbnail || 'https://placehold.co/120x120'} alt={item.title} className="song-tile-thumbnail" loading="lazy"/>
                    <div className="song-tile-details">
                        <div className="song-tile-title">{item.title}</div>
                    </div>
                    {!playlistItemIds.has(item._id) && (
                        <button className="add-song-button" onClick={(e) => { e.stopPropagation(); onAddToPlaylist(item._id, 'LifeLesson'); }}>
                            <FontAwesomeIcon icon="fa-plus" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

function OTSList({ items, onItemClick, onAddToPlaylist, playlistItemIds }) {
    const { currentSong } = useMusicPlayer();
    return (
        <div className="songs-row">
            {items.map((item) => (
                <div
                    key={item._id}
                    className={`song-tile ${currentSong && currentSong._id === item._id ? 'active-song' : ''}`}
                    onClick={() => onItemClick(item)}
                >
                    <img src={item.thumbnail || 'https://placehold.co/120x120'} alt={item.title} className="song-tile-thumbnail" loading="lazy"/>
                    <div className="song-tile-details">
                        <div className="song-tile-title">{item.title}</div>
                        <div className="song-tile-label">{item.movieName || 'OTS'}</div>
                    </div>
                    {!playlistItemIds.has(item._id) && (
                        <button className="add-song-button" onClick={(e) => { e.stopPropagation(); onAddToPlaylist(item._id, 'OTS'); }}>
                            <FontAwesomeIcon icon="fa-plus" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

function PlaylistSelectionModal({ isOpen, onClose, onSelectPlaylist, playlists, loading, message, onCreatePlaylist }) {
    if (!isOpen) return null;
    return (
        <div className="playlist-modal-overlay" onClick={onClose}>
            <div className="playlist-modal" onClick={(e) => e.stopPropagation()}>
                <h4>Select Playlist</h4>
                {loading ? (
                    <div className="loading-bar"><div className="loading-bar-progress"></div></div>
                ) : playlists.length > 0 ? (
                    <ul>
                        {playlists.map((pl) => (
                            <li key={pl._id}>
                                <button className="playlist-modal-btn" onClick={() => onSelectPlaylist(pl._id)}>
                                    {pl.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="no-playlist-container">
                        <p>No playlists found.</p>
                        <button className="create-playlist-btn" onClick={onCreatePlaylist}>Create Playlist</button>
                    </div>
                )}
                {message && <div className="playlist-modal-message">{message}</div>}
                <button className="playlist-modal-cancel" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

function RequestSongModal({ isOpen, onClose }) {
    const [requests, setRequests] = useState([{ title: '', movie: '' }]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (isOpen) {
            setRequests([{ title: '', movie: '' }]);
            setMessage('');
            setLoading(false);
            setIsSuccess(false);
        }
    }, [isOpen]);

    const handleRequestChange = (index, field, value) => {
        const newRequests = [...requests];
        newRequests[index][field] = value;
        setRequests(newRequests);
    };

    const handleAddRequest = () => {
        if (requests.length < 5) setRequests([...requests, { title: '', movie: '' }]);
    };
    const handleRemoveRequest = (index) => {
        if (requests.length > 1) setRequests(requests.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const validRequests = requests.filter(req => req.title.trim() && req.movie.trim());
        if (validRequests.length === 0) { setMessage('Please fill out at least one request.'); return; }
        setLoading(true);
        try {
            await axios.post('https://music-backend-akb5.onrender.com/api/song-requests', validRequests, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLoading(false);
            setIsSuccess(true);
            setMessage('Your requests have been submitted successfully!');
            setTimeout(() => onClose(), 1000);
        } catch (error) {
            setLoading(false);
            setMessage(error.response?.data?.message || 'Failed to submit requests.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="request-song-modal-overlay" onClick={onClose}>
            <div className="request-song-modal" onClick={(e) => e.stopPropagation()}>
                {isSuccess ? (
                    <div className="request-success-view">
                        <FontAwesomeIcon icon="fa-check-circle" style={{fontSize: '3rem', color: '#4caf50', marginBottom: '1rem'}}/>
                        <h3>Success!</h3>
                        <p>{message}</p>
                    </div>
                ) : (
                    <>
                        <h3 className="request-song-modal-header">Request a Song</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="request-list">
                                {requests.map((req, index) => (
                                    <div key={index} className="request-item">
                                        <input type="text" placeholder="Song Title" value={req.title} onChange={(e) => handleRequestChange(index, 'title', e.target.value)} className="request-input" required />
                                        <input type="text" placeholder="Movie / Album" value={req.movie} onChange={(e) => handleRequestChange(index, 'movie', e.target.value)} className="request-input" required />
                                        <button type="button" onClick={() => handleRemoveRequest(index)} className="remove-request-btn" disabled={requests.length <= 1}><FontAwesomeIcon icon="fa-times" /></button>
                                    </div>
                                ))}
                            </div>
                            <div className="request-song-actions">
                                <button type="button" onClick={handleAddRequest} className="add-request-btn" disabled={requests.length >= 5}><FontAwesomeIcon icon="fa-plus" /> Add another</button>
                                <button type="submit" className="submit-requests-btn" disabled={loading}>{loading ? 'Submitting...' : 'Submit Requests'}</button>
                            </div>
                            <div className="request-song-modal-footer">
                                {message && <div className="request-modal-message">{message}</div>}
                                <button type="button" className="request-modal-cancel" onClick={onClose}>Cancel</button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

function MoodsScreen({ openRequestModal }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const moodCategories = [
    { name: 'happy', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513535/hap_oihkap.jpg' },
    { name: 'sad', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/sad_lbqcin.jpg' },
    { name: 'workout', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752961155/gym_ivap8k.png' },
     { name: 'love', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752515509/love_bnjlgc.jpg' },
      { name: 'travel', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/travel_xwu6mq.jpg' },
    { name: 'heartbreak', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513535/heartb_deh8ds.png' },
    { name: 'spiritual', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513536/spi_o1tzp7.png' },
     { name: 'mashup', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1764702741/mash3_or7v6g.jpg' },
    { name: 'motivational', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/motiva_bvntm6.jpg' },
    { name: 'nostalgic', image: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/nos_tv6k55.jpg' },
  ];

  return (
    <div className="moods-page-screen">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
      <div className="moods-screen content-area">
        <h2>Choose Your Mood</h2>
        <div className="mood-cards">
          {moodCategories.map((mood) => (
            <div key={mood.name} className="mood-card" onClick={() => navigate(`/moods/${mood.name}`)}>
              <img src={mood.image} alt={mood.name} />
            </div>
          ))}
        </div>
      </div>
      <MusicPlayer />
    </div>
  );
}

function LifeLessonsScreen({ openRequestModal }) {
    const { playTrack } = useMusicPlayer();
    const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
    const [lifeLessons, setLifeLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [itemToAdd, setItemToAdd] = useState(null);
    const [addMessage, setAddMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchLifeLessons = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const res = await axios.get('https://music-backend-akb5.onrender.com/api/lifelessons/all', { headers: { Authorization: `Bearer ${token}` } });
                setLifeLessons(Array.isArray(res.data) ? res.data : []);
            } catch (err) { setError('Failed to fetch life lessons.'); } finally { setLoading(false); }
        };
        fetchLifeLessons();
    }, [token]);

    const handleAddToPlaylist = (itemId, itemType) => {
        setItemToAdd({ id: itemId, type: itemType });
        setShowPlaylistModal(true);
        setAddMessage('');
    };

    const handleSelectPlaylist = async (playlistId) => {
        if (!itemToAdd) return;
        const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
        setAddMessage(result.message);
        if (result.success) { setShowPlaylistModal(false); setItemToAdd(null); }
    };

    const handleCreatePlaylist = async () => {
        const playlistName = prompt('Enter playlist name:');
        if (playlistName?.trim()) await createPlaylist(playlistName.trim());
    };

    return (
        <div className="lifelessons-screen">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
            <div className="content-area">
                <h2>Life Lessons</h2>
                {loading ? <div className="loading"><div></div></div> : error ? <div className="search-message">{error}</div> : (
                    <LifeLessonList
                        items={lifeLessons}
                        onItemClick={(item) => playTrack(item, lifeLessons)}
                        onAddToPlaylist={handleAddToPlaylist}
                        playlistItemIds={playlistItemIds}
                    />
                )}
            </div>
            <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} onCreatePlaylist={handleCreatePlaylist}/>
            <MusicPlayer />
        </div>
    );
}

function OTSScreen({ openRequestModal }) {
    const { playTrack } = useMusicPlayer();
    const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
    const [otsItems, setOtsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [itemToAdd, setItemToAdd] = useState(null);
    const [addMessage, setAddMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchOtsItems = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const res = await axios.get('https://music-backend-akb5.onrender.com/api/ots/all', { headers: { Authorization: `Bearer ${token}` } });
                setOtsItems(Array.isArray(res.data) ? res.data : []);
            } catch (err) { setError('Failed to fetch OTS items.'); } finally { setLoading(false); }
        };
        fetchOtsItems();
    }, [token]);

    const handleAddToPlaylist = (itemId, itemType) => {
        setItemToAdd({ id: itemId, type: itemType });
        setShowPlaylistModal(true);
        setAddMessage('');
    };

    const handleSelectPlaylist = async (playlistId) => {
        if (!itemToAdd) return;
        const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
        setAddMessage(result.message);
        if (result.success) { setShowPlaylistModal(false); setItemToAdd(null); }
    };

    const handleCreatePlaylist = async () => {
        const playlistName = prompt('Enter playlist name:');
        if (playlistName?.trim()) await createPlaylist(playlistName.trim());
    };

    return (
        <div className="ots-screen">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
            <div className="content-area">
                <h2>OTS</h2>
                {loading ? <div className="loading"><div></div></div> : error ? <div className="search-message">{error}</div> : (
                    <OTSList
                        items={otsItems}
                        onItemClick={(item) => playTrack(item, otsItems)}
                        onAddToPlaylist={handleAddToPlaylist}
                        playlistItemIds={playlistItemIds}
                    />
                )}
            </div>
            <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} onCreatePlaylist={handleCreatePlaylist}/>
            <MusicPlayer />
        </div>
    );
}

function MainScreen({ openRequestModal }) {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();
  const singersContainerRef = useRef(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem('showWelcome')) {
      setShowWelcome(true);
      setTimeout(() => { setShowWelcome(false); sessionStorage.removeItem('showWelcome'); }, 2500);
    }
  }, [user]);

  useEffect(() => {
    const container = singersContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowPrev(scrollLeft > 0);
      setShowNext(scrollLeft < scrollWidth - clientWidth - 1);
    };
    handleScroll();
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const singers = [
    { name: '', id: 'sonu nigam', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/sonu_ztsynp.webp' },
    { name: '', id: 'lata mangeshkar', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/lata_ezfr2n.webp' },
    { name: '', id: 'kk', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/kk_py1off.webp' },
    { name: '', id: 'mohd rafi', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/rafi_n9wslm.webp' },
    { name: '', id: 'kailash kher', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751878756/kail_ufykhi.jpg' },
    { name: '', id: 'neha kakkar', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/neha_lzh67j.webp' },
    { name: '', id: 'kishore kumar', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/kishor_smr0v8.webp' },
    { name: '', id: 'anirudh', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/ani_wbajfs.webp' },
    { name: '', id: 'rahat fateh ali khan', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751787551/raha_hinul7.png' },
    { name: '', id: 'udit narayan', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751878759/udit_idlojx.png' },
    { name: '', id: 'diljit dosanjh', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/diljit_ftpuid.webp' },
    { name: '', id: 'jubin nautiyal', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/jubin_am3rn2.webp' },
    { name: '', id: 'shreya ghoshal', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733128/sherya_qkynbl.webp' },
    { name: '', id: 'arijit singh', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751733129/arjit_g4zpgt.webp' },
    { name: '', id: 'shaan', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751878758/shaan_ayuxds.png' },
    { name: '', id: 'monali thakur', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751878760/monali_qdoefu.png' },
  ];
  const genres = [
    { name: '', id: 'rap', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751730905/rap_g0sheq.jpg ' },
    { name: '', id: 'classical', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751730906/class_kh980u.png ' },
    { name: '', id: 'party', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751730905/party_lm1glx.jpg ' },
    { name: '', id: 'lo-fi', imageFileName: 'https://res.cloudinary.com/dt2nr7rjg/image/upload/v1751730905/lofi_mpmwqv.jpg ' },
  ];

  const scrollSingers = (direction) => {
    if (singersContainerRef.current) {
      const scrollAmount = direction === 'right' ? 400 : -400;
      singersContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="main-screen">
      {showWelcome && user && <div className="welcome-overlay fade-in-out">Welcome, {user.fullName.split(' ')[0]}!</div>}
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
      <div className="content-area">
        <section className="singers-section">
          <h2>Artist Spotlight</h2>
          <div className="singers-container">
            <div className="singers-scroll" ref={singersContainerRef}>
              {singers.map((singer) => (
                <div key={singer.id} className="singer-card" onClick={() => navigate(`/singers/${encodeURIComponent(singer.id)}`)}>
                  <img src={singer.imageFileName} alt={singer.name} className="singer-card-image fade-in" loading="lazy" />
                  <h3>{singer.name}</h3>
                </div>
              ))}
            </div>
            {showPrev && <button className="singers-scroll-btn left" onClick={() => scrollSingers('left')}><FontAwesomeIcon icon="fa-chevron-left" /></button>}
            {showNext && <button className="singers-scroll-btn right" onClick={() => scrollSingers('right')}><FontAwesomeIcon icon="fa-chevron-right" /></button>}
          </div>
        </section>
       <section className="mood-section">
          <h2>Explore</h2>
          <div className="mood-cards">
            <div className="explore-card" onClick={() => navigate('/moods')}>
              <img src="https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752513534/mood_b1af7g.jpg" alt="Moods" />
            </div>
            <div className="explore-card" onClick={() => navigate('/ots')}>
              <img src="https://res.cloudinary.com/dt2nr7rjg/image/upload/v1764221872/ost_ulo8a3.png" alt="OTS" />
            </div>
             <div className="explore-card" onClick={() => navigate('/lifelessons')}>
              <img src="https://res.cloudinary.com/dt2nr7rjg/image/upload/v1752523470/WhatsApp_Image_2025-07-15_at_01.34.03_bba81101_rybrke.jpg" alt="Life Lessons" />
            </div>
          </div>
        </section>
        <section className="genre-section">
          <h2>Genres</h2>
          <div className="genres-cards">
            {genres.map((genre) => (
              <div key={genre.id} className="genre-card" onClick={() => navigate(`/genres/${encodeURIComponent(genre.id)}`)}>
                <img src={genre.imageFileName} alt={genre.name} className="genre-card-image fade-in" loading="lazy" />
                <h3>{genre.name}</h3>
              </div>
            ))}
          </div>
        </section>
      </div>
      <MusicPlayer />
    </div>
  );
}

function SearchScreen({ openRequestModal }) {
    const { playTrack } = useMusicPlayer();
    const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [itemToAdd, setItemToAdd] = useState(null);
    const [addMessage, setAddMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceError, setVoiceError] = useState('');
    const recognitionRef = useRef(null);
    const token = localStorage.getItem('token');

    const debouncedSearch = useMemo(() => {
        let timeoutId;
        return (query) => {
            clearTimeout(timeoutId);
            if (!query.trim()) { setSearchResults([]); setLoadingSearch(false); return; }
            timeoutId = setTimeout(async () => {
                setLoadingSearch(true);
                try {
                    const url = `https://music-backend-akb5.onrender.com/api/songs?search=${encodeURIComponent(query.trim())}`;
                    const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
                    setSearchResults(Array.isArray(res.data) ? res.data : []);
                } catch (error) { setSearchResults([]); } finally { setLoadingSearch(false); }
            }, 300);
        };
    }, [token]);

    useEffect(() => { debouncedSearch(searchQuery); }, [searchQuery, debouncedSearch]);

    const handleAddToPlaylist = (itemId, itemType) => {
        setItemToAdd({ id: itemId, type: itemType });
        setShowPlaylistModal(true);
        setAddMessage('');
    };

    const handleSelectPlaylist = async (playlistId) => {
        if (!itemToAdd) return;
        const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
        setAddMessage(result.message);
        if (result.success) { setShowPlaylistModal(false); setItemToAdd(null); }
    };

    const handleCreatePlaylist = async () => {
        const playlistName = prompt('Enter playlist name:');
        if (playlistName?.trim()) await createPlaylist(playlistName.trim());
    };

    const toggleVoiceSearch = useCallback(() => {
        if (isListening) { recognitionRef.current?.stop(); return; }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { setVoiceError('Voice search not supported.'); return; }
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onresult = (e) => setSearchQuery(e.results[0][0].transcript);
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.start();
    }, [isListening]);

    return (
        <div className="search-screen">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
            <div className="content-area">
                <h2>Search Songs</h2>
                <div className="search-input-container">
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input-field" placeholder="Search..." autoFocus/>
                    <button className={`mic-button ${isListening ? 'listening' : ''}`} onClick={toggleVoiceSearch}><FontAwesomeIcon icon={isListening ? 'fa-microphone-slash' : 'fa-microphone'} /></button>
                </div>
                {voiceError && <div className="error-message">{voiceError}</div>}
                <div className="search-results-section">
                    {loadingSearch ? <div className="search-message">Searching...</div> :
                     searchQuery.trim() && searchResults.length > 0 ? (
                        <SongList
                            songs={searchResults}
                            onSongClick={(song) => playTrack(song, searchResults)}
                            onAddToPlaylist={handleAddToPlaylist}
                            playlistItemIds={playlistItemIds}
                        />
                    ) : searchQuery.trim() && !loadingSearch ? <div className="search-message">No songs found.</div> : null}
                </div>
            </div>
            <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} onCreatePlaylist={handleCreatePlaylist}/>
            <MusicPlayer />
        </div>
    );
}

function PlaylistDetailScreen({ openRequestModal }) {
    const { playlistId } = useParams();
    const navigate = useNavigate(); 
    const { currentSong, playTrack } = useMusicPlayer();
    const { playlists, removeItemFromPlaylist, loadingPlaylists, deletePlaylist, reorderPlaylistLocally } = usePlaylist();
    const [message, setMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const dragItem = useRef();
    const dragOverItem = useRef();

    const playlist = useMemo(() => playlists.find((p) => p._id === playlistId), [playlists, playlistId]);

    const handleDeletePlaylist = async () => {
        if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
            const result = await deletePlaylist(playlistId);
            if (result.success) navigate('/main'); else { setMessage(result.message); setTimeout(() => setMessage(''), 2000); }
        }
    };

    const handleRemoveItem = async (itemId) => {
        const result = await removeItemFromPlaylist(playlistId, itemId);
        setMessage(result.message);
        setTimeout(() => setMessage(''), 2000);
    };

    const handleDragStart = (e, position) => {
        dragItem.current = position;
        e.target.style.opacity = '0.5';
    };

    const handleDragEnter = (e, position) => {
        dragOverItem.current = position;
        e.preventDefault();
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        if (!playlist || !playlist.items) return;

        const copyListItems = [...playlist.items];
        const dragItemContent = copyListItems[dragItem.current];
        
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);

        dragItem.current = null;
        dragOverItem.current = null;
        
        reorderPlaylistLocally(playlistId, copyListItems);
    };

    if (loadingPlaylists) return <div className="content-area loading"><div></div></div>;
    if (!playlist) return <div className="content-area"><p>Playlist not found.</p></div>;

    const playableList = playlist.items?.map(item => ({...(item.itemRef), _id: item.itemRef?._id || item._id})) || [];

    return (
        <div className="playlist-detail-screen">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
            <div className="content-area">
                <div className="playlist-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{playlist.name}</h2>
                    <div className="playlist-actions">
                        <button onClick={handleDeletePlaylist} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.2rem' }}>
                            <FontAwesomeIcon icon="fa-trash" />
                        </button>
                    </div>
                </div>
                {message && <div className="info-message">{message}</div>}

                {playlist.items?.length > 0 ? (
                    <div className="songs-column">
                        {playlist.items.map((item, index) => (
                            item?.itemRef && (
                            <div
                                key={item._id || index}
                                className={`song-card full-line ${currentSong && currentSong._id === item.itemRef._id ? 'active-song' : ''}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => playTrack(item.itemRef, playableList)}
                                style={{ cursor: 'grab', transition: 'transform 0.2s' }}
                            >
                                <img src={item.itemRef.thumbnail || item.itemRef.thumbnailUrl || 'https://placehold.co/50x50'} alt={item.itemRef.title} className="song-thumbnail" loading="lazy"/>
                                <div className="song-details">
                                    <h4 style={{ color: currentSong && currentSong._id === item.itemRef._id ? '#1db954' : 'inherit' }}>
                                        {item.itemRef.title}
                                    </h4>
                                    <p>{item.itemRef.singer || item.itemRef.movieName || item.itemType}</p>
                                </div>
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <FontAwesomeIcon icon="fa-bars" style={{ color: '#666', cursor: 'grab' }} />
                                    <button className="remove-song-button" onClick={(e) => { e.stopPropagation(); handleRemoveItem(item._id); }}>
                                        <FontAwesomeIcon icon="fa-minus" />
                                    </button>
                                </div>
                            </div>
                            )
                        ))}
                    </div>
                ) : (
                    <div className="search-message">This playlist is empty.</div>
                )}
            </div>
            <MusicPlayer />
        </div>
    );
}

function CategorySongsScreen({ categoryType, openRequestModal }) {
    const { name } = useParams();
    const { user } = useAuth();
    const { playTrack } = useMusicPlayer();
    const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [itemToAdd, setItemToAdd] = useState(null);
    const [addMessage, setAddMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [randomMessage, setRandomMessage] = useState('');
    const [error, setError] = useState(null);
    const [showTitle, setShowTitle] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('all');
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const languageWrapperRef = useRef(null); 
    const token = localStorage.getItem('token');
    
    const languages = [ { value: 'all', label: 'All' }, { value: 'hindi', label: 'Hindi' }, { value: 'english', label: 'English' }, { value: 'punjabi', label: 'Punjabi' }, { value: 'telugu', label: 'Telugu' }, { value: 'kannada', label: 'Kannada' }, { value: 'tamil', label: 'Tamil' } ];
    const messagesConfig = useMemo(() => ({
        love: ["Hey ${username}, let your heart sing.", "${username}, fall in love with every note."],
        happy: ["Smile wide, ${username}!"],
    }), []);

    useEffect(() => {
        setLoading(true);
        let apiUrl = `https://music-backend-akb5.onrender.com/api/songs?${categoryType}=${encodeURIComponent(name)}`;
        if (selectedLanguage !== 'all') apiUrl += `&language=${encodeURIComponent(selectedLanguage)}`;
        axios.get(apiUrl, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setSongs(Array.isArray(res.data) ? res.data : []))
        .catch(err => setError('Failed to fetch songs.'))
        .finally(() => setLoading(false));
    }, [name, categoryType, token, selectedLanguage]);

    useEffect(() => {
        const handleClickOutside = (e) => { if (showLanguageDropdown && languageWrapperRef.current && !languageWrapperRef.current.contains(e.target)) setShowLanguageDropdown(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showLanguageDropdown]);

    useEffect(() => {
        const firstName = user?.fullName?.split(' ')[0] || 'friend';
        const messages = messagesConfig[name] || [];
        if (songs.length > 0 && messages.length > 0) {
            setRandomMessage(messages[Math.floor(Math.random() * messages.length)].replace(/\${username}/g, firstName));
            setShowTitle(false);
            const timeout = setTimeout(() => { setRandomMessage(''); setShowTitle(true); }, 6500);
            return () => clearTimeout(timeout);
        } else { setShowTitle(true); }
    }, [name, songs, user, messagesConfig]);

    const handleAddToPlaylist = (itemId, itemType) => { setItemToAdd({ id: itemId, type: itemType }); setShowPlaylistModal(true); setAddMessage(''); }; 
    const handleSelectPlaylist = async (playlistId) => {
        if (!itemToAdd) return;
        const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
        setAddMessage(result.message);
        if (result.success) { setShowPlaylistModal(false); setItemToAdd(null); }
    };
    const handleCreatePlaylist = async () => { const playlistName = prompt('Enter playlist name:'); if (playlistName?.trim()) await createPlaylist(playlistName.trim()); };

    if (!user) return <div className="content-area"><p>Please log in.</p></div>;

    return (
        <div className="mood-songs-screen">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
            <div className="content-area">
                {randomMessage && <div className="random-message animate-fade-in-out">{randomMessage}</div>}
                {showTitle && <h2 className="category-title fade-in">{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>}
                
                <div className="language-filter-container" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <div className="language-dropdown-wrapper" style={{ position: 'relative', display: 'inline-block' }} ref={languageWrapperRef}>
                        <button className="language-filter-btn" onClick={() => setShowLanguageDropdown(!showLanguageDropdown)} style={{ background: '#333', color: 'white', border: '1px solid #555', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FontAwesomeIcon icon="fa-globe" /> {languages.find(lang => lang.value === selectedLanguage)?.label || 'All'} <FontAwesomeIcon icon={showLanguageDropdown ? "fa-chevron-up" : "fa-chevron-down"} />
                        </button>
                        {showLanguageDropdown && (
                            <div className="language-dropdown" style={{ position: 'absolute', top: '100%', right: 0, background: '#222', border: '1px solid #444', borderRadius: '8px', zIndex: 1000, minWidth: '140px' }}>
                                {languages.map((language) => (
                                    <div key={language.value} className="language-option" onClick={() => { setSelectedLanguage(language.value); setShowLanguageDropdown(false); }} style={{ padding: '12px 16px', cursor: 'pointer', color: 'white' }}>{language.label}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {loading ? <div className="loading"><div></div></div> : error ? <div className="search-message">{error}</div> : 
                 songs.length > 0 ? (
                    <SongList 
                        songs={songs} 
                        onSongClick={(song) => playTrack(song, songs)}
                        onAddToPlaylist={handleAddToPlaylist} 
                        playlistItemIds={playlistItemIds}
                    />
                ) : <div className="search-message">No songs found.</div>}
            </div>
            <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} onCreatePlaylist={handleCreatePlaylist}/>
            <MusicPlayer />
        </div>
    );
}

function SingerSongsScreen({ openRequestModal }) {
    const { name } = useParams();
    const { user } = useAuth();
    const { playTrack } = useMusicPlayer();
    const { playlists, addToPlaylist, playlistItemIds, loadingPlaylists, createPlaylist } = usePlaylist();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [itemToAdd, setItemToAdd] = useState(null);
    const [addMessage, setAddMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        setLoading(true);
        axios.get(`https://music-backend-akb5.onrender.com/api/songs?singer=${encodeURIComponent(name)}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setSongs(Array.isArray(res.data) ? res.data : []))
        .catch(err => setError('Failed to fetch songs.'))
        .finally(() => setLoading(false));
    }, [name, token]);

    const handleAddToPlaylist = (itemId, itemType) => { setItemToAdd({ id: itemId, type: itemType }); setShowPlaylistModal(true); setAddMessage(''); };
    const handleSelectPlaylist = async (playlistId) => {
        if (!itemToAdd) return;
        const result = await addToPlaylist(itemToAdd.id, playlistId, itemToAdd.type);
        setAddMessage(result.message);
        if (result.success) { setShowPlaylistModal(false); setItemToAdd(null); }
    };
    const handleCreatePlaylist = async () => { const playlistName = prompt('Enter playlist name:'); if (playlistName?.trim()) await createPlaylist(playlistName.trim()); };

    if (!user) return <div className="content-area"><p>Please log in.</p></div>;

    return (
        <div className="singer-songs-screen">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
            <div className="content-area">
                <h2>{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>
                {loading ? <div className="loading"><div></div></div> : error ? <div className="search-message">{error}</div> : 
                 songs.length > 0 ? (
                    <SongList songs={songs} onSongClick={(song) => playTrack(song, songs)} onAddToPlaylist={handleAddToPlaylist} playlistItemIds={playlistItemIds}/>
                ) : <div className="search-message">No songs found.</div>}
            </div>
            <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} onCreatePlaylist={handleCreatePlaylist}/>
            <MusicPlayer />
        </div>
    );
}

function Account({ openRequestModal }) {
    const { user, updateUser, loading } = useAuth();
    const [message, setMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newFullName, setNewFullName] = useState('');

    useEffect(() => { if (user?.fullName) setNewFullName(user.fullName); }, [user]);

    const saveProfile = async () => {
        if (!newFullName.trim()) { setMessage("Full name cannot be empty."); return; }
        setIsSaving(true);
        const result = await updateUser({ fullName: newFullName.trim() });
        setMessage(result.message);
        setIsSaving(false);
        if (result.success) setEditProfileOpen(false);
        setTimeout(() => setMessage(""), 3000);
    };

    return (
        <div className="account-screen">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
            <div className="content-area">
                <h2>Account Details <button className="edit-profile-button" onClick={() => setEditProfileOpen(true)}><FontAwesomeIcon icon="fa-pencil" /></button></h2>
                {message && <div className="info-message">{message}</div>}
                {editProfileOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Edit Profile</h3>
                            <input type="text" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} placeholder="Full name" disabled={isSaving} />
                            <button onClick={saveProfile} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button>
                            <button onClick={() => setEditProfileOpen(false)} disabled={isSaving}>Cancel</button>
                        </div>
                    </div>
                )}
                {loading ? <div className="loading"><div></div></div> : user ? (
                    <>
                        <p><strong>Full Name:</strong> {user.fullName}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Phone:</strong> {user.phone}</p>
                        <p><strong>Join Date:</strong> {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : "N/A"}</p>
                    </>
                ) : <p>User data not available.</p>}
            </div>
            <MusicPlayer />
        </div>
    );
}

function App() {
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    return (
        <Router>
            <AuthProvider>
                <MusicPlayerProvider>
                    <PlaylistProvider>
                        <RequestSongModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
                        <Routes>
                            <Route path="/" element={<SplashScreen />} />
                            <Route path="/login" element={<PublicRoute><AuthScreen /></PublicRoute>} />
                            <Route path="/main" element={<ProtectedRoute><MainScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
                            <Route path="/search" element={<ProtectedRoute><SearchScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
                            <Route path="/account" element={<ProtectedRoute><Account openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
                            <Route path="/moods" element={<ProtectedRoute><MoodsScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
                            <Route path="/lifelessons" element={<ProtectedRoute><LifeLessonsScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
                            <Route path="/ots" element={<ProtectedRoute><OTSScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
                            <Route path="/moods/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="mood" openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
                            <Route path="/genres/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="genre" openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
                            <Route path="/singers/:name" element={<ProtectedRoute><SingerSongsScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
                            <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetailScreen openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
                            <Route path="*" element={<ProtectedRoute><Navigate to="/main" replace /></ProtectedRoute>} />
                        </Routes>
                    </PlaylistProvider>
                </MusicPlayerProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
