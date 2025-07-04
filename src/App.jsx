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

//     useEffect(() => {
//         if (selectedSong && !isMinimized) {
//             window.history.pushState({ musicPlayer: 'open' }, '');
//         }
//     }, [selectedSong, isMinimized, location.key]);

//     useEffect(() => {
//         const onPopState = (e) => {
//             if (selectedSong && !isMinimized) {
//                 setIsMinimized(true);
//                 return;
//             }
//         };
//         window.addEventListener('popstate', onPopState);
//         return () => window.removeEventListener('popstate', onPopState);
//     }, [selectedSong, isMinimized]);

//     useEffect(() => {
//         if (!selectedSong?.audioUrl) {
//             if (audioRef.current) {
//                 audioRef.current.pause();
//                 audioRef.current.src = '';
//             }
//             return;
//         }

//         if (!audioRef.current || audioRef.current.src !== selectedSong.audioUrl) {
//             if (audioRef.current) audioRef.current.pause();
//             audioRef.current = new Audio(selectedSong.audioUrl);
//             audioRef.current.preload = 'auto';
//             audioRef.current.onerror = () => console.error('Audio load error for:', selectedSong.audioUrl);

//             audioRef.current.addEventListener('timeupdate', () => {
//                 if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
//             });
//             audioRef.current.addEventListener('ended', () => {
//                 if (selectedSong.songList && selectedSong.songList.length > 0) {
//                     const nextIndex = (currentSongIndex + 1) % selectedSong.songList.length;
//                     setSelectedSong({ ...selectedSong.songList[nextIndex], songList: selectedSong.songList });
//                     setIsPlaying(true);
//                 } else {
//                     setIsPlaying(false);
//                 }
//             });
//         }

//         audioRef.current.volume = volume;
//         if (isPlaying) audioRef.current.play().catch(err => console.error('Audio play error:', err));
//         else audioRef.current.pause();

//         if (selectedSong.songList) {
//             const index = selectedSong.songList.findIndex(s => s._id === selectedSong._id);
//             setCurrentSongIndex(index !== -1 ? index : 0);
//         }

//         return () => {
//             if (audioRef.current) {
//                 audioRef.current.pause();
//                 audioRef.current.removeEventListener('timeupdate', () => {});
//                 audioRef.current.removeEventListener('ended', () => {});
//             }
//         };
//     }, [selectedSong, isPlaying, volume, currentSongIndex]);

//     const contextValue = {
//         selectedSong, setSelectedSong, isPlaying, setIsPlaying,
//         currentTime, setCurrentTime, volume, setVolume,
//         isMinimized, setIsMinimized, currentSongIndex, setCurrentSongIndex, audioRef
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
//     const [playlistSongIds, setPlaylistSongIds] = useState(new Set());
//     const [loadingPlaylists, setLoadingPlaylists] = useState(false);
//     const { user } = useAuth();
//     const token = localStorage.getItem('token');

//     const fetchPlaylists = useCallback(async () => {
//         if (!user || !token) {
//             setPlaylists([]);
//             setPlaylistSongIds(new Set());
//             return;
//         }
//         setLoadingPlaylists(true);
//         try {
//             const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             const fetchedPlaylists = res.data || [];
//             setPlaylists(fetchedPlaylists);
//             const songIds = new Set(fetchedPlaylists.flatMap(p => p.songs.map(s => s._id)));
//             setPlaylistSongIds(songIds);
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

//     const addToPlaylist = async (songId, playlistId) => {
//         try {
//             const playlist = playlists.find(p => p._id === playlistId);
//             if (playlist?.songs.some(s => s._id === songId)) {
//                 return { success: false, message: 'Song already in playlist' };
//             }
//             const updatedSongs = [...(playlist.songs.map(s => s._id)), songId];
//             await axios.put(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, { songs: updatedSongs }, { headers: { Authorization: `Bearer ${token}` } });
//             await fetchPlaylists();
//             return { success: true, message: 'Song added to playlist!' };
//         } catch (err) {
//             console.error('Failed to add song:', err);
//             return { success: false, message: 'Failed to add song.' };
//         }
//     };

//     const createPlaylist = async (name) => {
//         try {
//             await axios.post('https://music-backend-akb5.onrender.com/api/playlists', { name }, { headers: { Authorization: `Bearer ${token}` } });
//             await fetchPlaylists();
//         } catch (error) {
//             console.error('Failed to create playlist:', error);
//         }
//     };

//     const removeSongFromPlaylist = async (songId, playlistId) => {
//         try {
//             const playlist = playlists.find(p => p._id === playlistId);
//             const updatedSongs = playlist.songs.filter(s => s._id !== songId).map(s => s._id);
//             await axios.put(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, { songs: updatedSongs }, { headers: { Authorization: `Bearer ${token}` } });
//             await fetchPlaylists();
//             return { success: true, message: 'Song removed successfully!' };
//         } catch (error) {
//             console.error('Failed to remove song:', error);
//             return { success: false, message: 'Failed to remove song.' };
//         }
//     };

//     const updatePlaylistName = async (playlistId, newName) => {
//         try {
//             await axios.put(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, { name: newName }, { headers: { Authorization: `Bearer ${token}` } });
//             await fetchPlaylists();
//             return { success: true, message: 'Playlist updated!' };
//         } catch (error) {
//             console.error('Failed to update playlist name:', error);
//             return { success: false, message: 'Failed to update name.' };
//         }
//     };

//     const value = { playlists, playlistSongIds, loadingPlaylists, addToPlaylist, createPlaylist, removeSongFromPlaylist, updatePlaylistName };
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

// function Sidebar({ isOpen, onClose }) {
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
//             if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//                 onClose();
//                 setShowModeDropdown(false);
//             }
//         };
//         if (isOpen) document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
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

//     const handleCreatePlaylist = () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) createPlaylist(playlistName.trim());
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
//                     {loadingPlaylists ? <span>Loading...</span> : <>
//                         {playlists.map(playlist => <span key={playlist._id} onClick={() => { navigate(`/playlist/${playlist._id}`); onClose(); }}>{playlist.name}</span>)}
//                         <span onClick={handleCreatePlaylist} className="create-playlist"><FontAwesomeIcon icon="fa-plus" /> Create New</span>
//                     </>}
//                 </div>
//             )}
//             {user && <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>}
//         </div>
//     );
// }
// function MusicPlayer() {
//   const {
//     selectedSong,
//     setSelectedSong,
//     isPlaying,
//     setIsPlaying,
//     currentTime,
//     setCurrentTime,
//     volume,
//     setVolume,
//     isMinimized,
//     setIsMinimized,
//     currentSongIndex,
//     audioRef
//   } = useMusicPlayer();

//   const location = useLocation();
//   const excludedPaths = ['/login', '/'];
//   const showPlayer = !excludedPaths.includes(location.pathname);

//   useEffect(() => {
//     document.body.classList.toggle('no-scroll', !isMinimized);
//   }, [isMinimized]);

//   if (!selectedSong || !showPlayer) return null;

//   const togglePlay = () => setIsPlaying(!isPlaying);

//   const changeSong = (offset) => {
//     if (!selectedSong?.songList?.length) return;
//     const newIndex = (currentSongIndex + offset + selectedSong.songList.length) % selectedSong.songList.length;
//     setSelectedSong({ ...selectedSong.songList[newIndex], songList: selectedSong.songList });
//     setIsPlaying(true);
//   };

//   const handleTimeDrag = (e) => {
//     if (audioRef.current?.duration) {
//       const newTime = (e.target.value / 100) * audioRef.current.duration;
//       audioRef.current.currentTime = newTime;
//       setCurrentTime(newTime);
//     }
//   };

//   const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
//   const duration = audioRef.current?.duration || 0;

//   return (
//     <div className={`music-player ${isMinimized ? 'minimized' : 'full-screen'}`}>      
//       {isMinimized ? (
//         <div className="player-minimized-content" onClick={() => setIsMinimized(false)}>
//           <img src={selectedSong.thumbnailUrl || 'https://placehold.co/100x100'} alt={selectedSong.title} className="player-minimized-thumbnail" loading="lazy" />
//           <div className="player-minimized-info">
//             <h4>{selectedSong.title}</h4>
//             <p>{selectedSong.singer}</p>
//           </div>
//           <div className="player-minimized-buttons">
//             <button className="minimize-player-button" onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}>
//               <FontAwesomeIcon icon="fa-chevron-up" />
//             </button>
//             <button className="close-player-button" onClick={(e) => { e.stopPropagation(); setSelectedSong(null); audioRef.current.pause(); audioRef.current.src = ''; }}>
//               <FontAwesomeIcon icon="fa-times" />
//             </button>
//           </div>
//         </div>
//       ) : (
//         <>
//           <button className="minimize-player-button" onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}>
//             <FontAwesomeIcon icon="fa-chevron-down" />
//           </button>
//           <button className="close-player-button" onClick={(e) => { e.stopPropagation(); setSelectedSong(null); audioRef.current.pause(); audioRef.current.src = ''; }}>
//             <FontAwesomeIcon icon="fa-times" />
//           </button>
//           <div className="player-content" onClick={(e) => e.stopPropagation()}>
//             <div className="player-background-blur" style={{ backgroundImage: `url(${selectedSong.thumbnailUrl || 'https://placehold.co/800x800'})` }}></div>
//             <div className="player-foreground-content">
//               <img src={selectedSong.thumbnailUrl || 'https://placehold.co/300x300'} alt={selectedSong.title} className="player-main-thumbnail" loading="lazy" />
//               <div className="song-info">
//                 <h2>{selectedSong.title}</h2>
//                 <h3>{selectedSong.singer}</h3>
//                 <p className="song-album">{selectedSong.movie || selectedSong.genre || 'Unknown Album'}</p>
//               </div>
//               <div className="controls">
//                 <div className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</div>
//                 <input type="range" min="0" max="100" value={duration ? (currentTime / duration) * 100 : 0} onChange={handleTimeDrag} className="progress-bar" style={{ '--progress': duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
//                 <div className="player-buttons">
//                   <button onClick={() => changeSong(-1)}><FontAwesomeIcon icon="fa-step-backward" /></button>
//                   <button onClick={togglePlay}><FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} /></button>
//                   <button onClick={() => changeSong(1)}><FontAwesomeIcon icon="fa-step-forward" /></button>
//                 </div>
//                 <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="volume-slider" />
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }


// function SongList({ songs, onSongClick, onAddToPlaylist, playlistSongIds }) {
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
//                     {!playlistSongIds.has(song._id) && (
//                         <button
//                             className="add-song-button"
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 onAddToPlaylist(song._id);
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

// function PlaylistSelectionModal({ isOpen, onClose, onSelectPlaylist, playlists, loading, message }) {
//     if (!isOpen) return null;
//     return (
//         <div className="playlist-modal-overlay" onClick={onClose}>
//             <div className="playlist-modal" onClick={(e) => e.stopPropagation()}>
//                 <h4>Select Playlist</h4>
//                 {loading ? (
//                     <div>Loading...</div>
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
//                     <div>No playlists found. Create one first!</div>
//                 )}
//                 {message && <div className="playlist-modal-message">{message}</div>}
//                 <button className="playlist-modal-cancel" onClick={onClose}>Cancel</button>
//             </div>
//         </div>
//     );
// }


// function MainScreen() {
//     const { user } = useAuth();
//     const { setIsMinimized } = useMusicPlayer();
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [showWelcome, setShowWelcome] = useState(false);
//     const navigate = useNavigate();

//     useEffect(() => {
//         if (sessionStorage.getItem('showWelcome')) {
//             setShowWelcome(true);
//             const timer = setTimeout(() => {
//                 setShowWelcome(false);
//                 sessionStorage.removeItem('showWelcome');
//             }, 2500);
//             return () => clearTimeout(timer);
//         }
//     }, [user]);

//     const moodCategories = ['happy', 'sad', 'love', 'motivational', 'nostalgic', 'heartbreak', 'spiritual', 'travel'];
//     const genreCategories = ['rap', 'party', 'classical', 'lo-fi'];

//     return (
//         <div className="main-screen">
//             {showWelcome && user && <div className="welcome-overlay">Welcome, {user.fullName.split(' ')[0]}!</div>}
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(true)}

// />
//             <div className="content-area">
//                 <section className="mood-section">
//                     <h2>Moods</h2>
//                     <div className="mood-cards">
//                         {moodCategories.map((m) => (
//                             <div key={m} className={`mood-card ${m}`} onClick={() => navigate(`/moods/${m}`)}>
//                                 <h3>{m}</h3>
//                             </div>
//                         ))}
//                     </div>
//                 </section>
//                 <section className="genre-section">
//                     <h2>Genres</h2>
//                     <div className="mood-cards">
//                         {genreCategories.map((g) => (
//                             <div key={g} className={`mood-card ${g}`} onClick={() => navigate(`/genres/${g}`)}>
//                                 <h3>{g}</h3>
//                             </div>
//                         ))}
//                     </div>
//                 </section>
//             </div>
//             <MusicPlayer />
//         </div>
//     );
// }

// function SearchScreen() {
//   const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//   const { playlists, addToPlaylist, playlistSongIds, loadingPlaylists } = usePlaylist();

//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [loadingSearch, setLoadingSearch] = useState(false);
//   const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//   const [songToAdd, setSongToAdd] = useState(null);
//   const [addMessage, setAddMessage] = useState('');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const token = localStorage.getItem('token');

//   const debouncedSearch = useMemo(() => {
//     let timeoutId;

//     return (query) => {
//       clearTimeout(timeoutId);

//       // ✅ If query is empty, do nothing
//       if (!query.trim()) {
//         setSearchResults([]);
//         setLoadingSearch(false);
//         return;
//       }

//       timeoutId = setTimeout(async () => {
//         setLoadingSearch(true);
//         try {
//           const url = `https://music-backend-akb5.onrender.com/api/songs?search=${encodeURIComponent(query.trim())}`;
//           const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
//           setSearchResults(Array.isArray(res.data) ? res.data : []);
//         } catch (error) {
//           console.error('Search error:', error);
//           setSearchResults([]);
//         } finally {
//           setLoadingSearch(false);
//         }
//       }, 300);
//     };
//   }, [token]);

//   useEffect(() => {
//     debouncedSearch(searchQuery);
//   }, [searchQuery, debouncedSearch]);

//   const handleAddToPlaylist = (songId) => {
//     setSongToAdd(songId);
//     setShowPlaylistModal(true);
//     setAddMessage('');
//   };

//   const handleSelectPlaylist = async (playlistId) => {
//     const result = await addToPlaylist(songToAdd, playlistId);
//     setAddMessage(result.message);
//     if (result.success) {
//       setTimeout(() => {
//         setShowPlaylistModal(false);
//         setSongToAdd(null);
//       }, 1000);
//     }
//   };

//   return (
//     <div className="search-screen">
//       <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//       <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//       <div className="content-area">
//         <h2>Search Songs</h2>
//         <input
//           type="text"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="search-input-field"
//           placeholder="Search by title, singer, mood, genre, movie..."
//           autoFocus
//         />
//         <div className="search-results-section">
//           {loadingSearch ? (
//             <div className="search-message">Searching...</div>
//           ) : searchQuery.trim() && searchResults.length > 0 ? (
//             <SongList
//               songs={searchResults}
//               onSongClick={(song) => {
//                 setSelectedSong({ ...song, songList: searchResults });
//                 setIsPlaying(true);
//                 setIsMinimized(false);
//               }}
//               onAddToPlaylist={handleAddToPlaylist}
//               playlistSongIds={playlistSongIds}
//             />
//           ) : searchQuery.trim() && searchResults.length === 0 ? (
//             <div className="search-message animate-fade-in-out">No songs found.</div>
//           ) : null}
//         </div>
//       </div>

//       <PlaylistSelectionModal
//         isOpen={showPlaylistModal}
//         onClose={() => setShowPlaylistModal(false)}
//         onSelectPlaylist={handleSelectPlaylist}
//         playlists={playlists}
//         loading={loadingPlaylists}
//         message={addMessage}
//       />
//       <MusicPlayer />
//     </div>
//   );
// }

// function PlaylistDetailScreen() {
//     const { playlistId } = useParams();
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, removeSongFromPlaylist, updatePlaylistName, loadingPlaylists } = usePlaylist();
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [editPlaylistOpen, setEditPlaylistOpen] = useState(false);
//     const [newPlaylistName, setNewPlaylistName] = useState('');
//     const playlist = useMemo(() => playlists.find((p) => p._id === playlistId), [playlists, playlistId]);

//     const handleRemoveSong = async (songId) => {
//         if (!window.confirm('Are you sure?')) return;
//         const result = await removeSongFromPlaylist(songId, playlistId);
//         setMessage(result.message);
//         setTimeout(() => setMessage(''), 2000);
//     };

//     const handleEditPlaylist = async () => {
//         setEditPlaylistOpen(true);
//         setNewPlaylistName(playlist.name);
//     };

//     const savePlaylistName = async () => {
//         if (newPlaylistName.trim() && newPlaylistName !== playlist.name) {
//             const result = await updatePlaylistName(playlistId, newPlaylistName.trim());
//             setMessage(result.message);
//             setTimeout(() => setMessage(''), 2000);
//         }
//         setEditPlaylistOpen(false);
//     };

//     if (loadingPlaylists) return <div className="content-area loading"><div></div></div>;
//     if (!playlist) return <div className="content-area"><p>Playlist not found.</p></div>;

//     return (
//         <div className="playlist-detail-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//                 <h2>
//                     {playlist.name}{' '}
//                     <button className="edit-playlist-button" onClick={handleEditPlaylist}>
//                         <FontAwesomeIcon icon="fa-pencil" />
//                     </button>
//                 </h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {editPlaylistOpen && (
//                     <div className="modal-overlay">
//                         <div className="modal-content">
//                             <h3>Edit Playlist Name</h3>
//                             <input
//                                 type="text"
//                                 value={newPlaylistName}
//                                 onChange={(e) => setNewPlaylistName(e.target.value)}
//                                 placeholder="Enter new playlist name"
//                             />
//                             <button onClick={savePlaylistName}>Save</button>
//                             <button onClick={() => setEditPlaylistOpen(false)}>Cancel</button>
//                         </div>
//                     </div>
//                 )}
//                 {playlist.songs?.length > 0 ? (
//                     <div className="songs-column">
//                         {playlist.songs.map((song) => (
//                             <div
//                                 key={song._id}
//                                 className="song-card full-line"
//                                 onClick={() => {
//                                     setSelectedSong({ ...song, songList: playlist.songs });
//                                     setIsPlaying(true);
//                                     setIsMinimized(false);
//                                 }}
//                             >
//                                 <img
//                                     src={song.thumbnailUrl || 'https://placehold.co/50x50'}
//                                     alt={song.title}
//                                     className="song-thumbnail"
//                                     loading="lazy"
//                                 />
//                                 <div className="song-details">
//                                     <h4>{song.title}</h4>
//                                     <p>{song.singer}</p>
//                                 </div>
//                                 <button
//                                     className="remove-song-button"
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         handleRemoveSong(song._id);
//                                     }}
//                                 >
//                                     <FontAwesomeIcon icon="fa-minus" />
//                                 </button>
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="search-message animate-fade-in-out">This playlist is empty. Add some songs!</div>
//                 )}
//             </div>
//             <MusicPlayer />
//         </div>
//     );
// }

// function CategorySongsScreen({ categoryType }) {
//     const { name } = useParams();
//     const { user } = useAuth();
//     const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistSongIds, loadingPlaylists } = usePlaylist();
//     const [songs, setSongs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const token = localStorage.getItem('token');
//     const [randomMessage, setRandomMessage] = useState('');
//     const [error, setError] = useState(null);

//     const messagesConfig = useMemo(() => ({
//         love: ["Hey ${username}, let your heart sing louder than words.", "${username}, fall in love with every note.", "Music for the moments when your heart races, ${username}.", "Wrap yourself in melodies of love, ${username}.", "${username}, let these tunes be your love letter."],
//         travel: ["Adventure awaits, ${username} — let the music guide you.", "Wanderlust in every beat, just for you ${username}.", "Hit the open road with these tunes, ${username}.", "${username}, let every song be a new destination.", "Pack your dreams and play these tracks, ${username}."],
//         happy: ["Smile wide, ${username} — these songs are your sunshine.", "Turn up the joy, ${username}, and dance like no one's watching.", "${username}, happiness is just a beat away.", "Celebrate today with these tunes, ${username}.", "Life's better with music and you in it, ${username}."],
//         sad: ["It's okay to feel, ${username} — let these songs hold you.", "Lean on these melodies, ${username}, when words aren't enough.", "${username}, find gentle comfort in every note.", "Let your tears fall freely with these tracks, ${username}.", "Soft songs for heavy hearts, just for you ${username}."],
//         motivational: ["Rise and conquer, ${username} — let the music push you.", "Fuel your fire, ${username}, one beat at a time.", "${username}, chase your dreams with these power tunes.", "No limits for you, ${username} — feel the energy.", "Crush every goal with these tracks, ${username}."],
//         nostalgic: ["A trip down memory lane for you, ${username}.", "Relive the golden days with these songs, ${username}.", "${username}, let these melodies take you back.", "Old memories, new feelings — enjoy them, ${username}.", "Time travel through music, just for you ${username}."],
//         heartbreak: ["Some songs understand you better than words, ${username}.", "Let it all out, ${username} — these tracks feel your pain.", "${username}, heal one verse at a time.", "Mend your heart with these honest melodies, ${username}.", "It's okay to break, ${username} — music will hold you."],
//         spiritual: ["Find your center, ${username}, in every chord.", "Breathe deeply with these mindful tunes, ${username}.", "${username}, let the music elevate your spirit.", "Harmony for the soul — just for you, ${username}.", "Feel peace wash over you, ${username}, with every note."],
//         calm: ["Slow down, ${username} — breathe with these soothing sounds.", "Ease your mind, ${username}, with gentle melodies.", "Quiet moments made perfect for you, ${username}.", "${username}, relax — let the calm in.", "Soft notes for softer days, just for you ${username}."],
//         rap: ["Spit fire, ${username}, let the beats talk.", "Get in the zone with these bars, ${username}.", "Powerful words for a powerful ${username}.", "Vibe with raw energy, ${username}.", "${username}, own the mic with these tracks."],
//         party: ["Let's turn it up, ${username} — the party starts here.", "${username}, dance like nobody's watching.", "Good vibes and wild nights just for you, ${username}.", "Hit the floor with these beats, ${username}.", "Bring the energy, ${username}, let’s go!"],
//         classical: ["Timeless beauty in every note for you, ${username}.", "Close your eyes and let it flow, ${username}.", "Elegance and grace in sound, just for you ${username}.", "${username}, feel every movement and melody.", "For the refined listener — you, ${username}."],
//         'lo-fi': ["Chill out, ${username}, with these mellow beats.", "Your perfect study companion, ${username}.", "Lo-fi vibes to calm your mind, ${username}.", "Soft beats for deep thoughts, just for you ${username}.", "${username}, relax — let the loops take over."]
//     }), []);

//     useEffect(() => {
//         const firstName = user?.fullName?.split(' ')[0] || 'friend';
//         const messages = messagesConfig[name] || [];
//         if (messages.length > 0 && songs.length > 0) {
//             const randomTemplate = messages[Math.floor(Math.random() * messages.length)];
//             const personalizedMessage = randomTemplate.replace(/\$\{username\}/g, firstName);
//             setRandomMessage(personalizedMessage);
//             const timer = setTimeout(() => setRandomMessage(''), 4000);
//             return () => clearTimeout(timer);
//         }
//     }, [name, songs, user, messagesConfig]);

//     useEffect(() => {
//         setLoading(true);
//         setError(null);
//         axios.get(`https://music-backend-akb5.onrender.com/api/songs?${categoryType}=${encodeURIComponent(name)}`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             })
//             .then((res) => {
//                 if (Array.isArray(res.data)) setSongs(res.data);
//                 else { setSongs([]); setError('Invalid data format'); }
//             })
//             .catch((err) => {
//                 setError(`Failed to fetch: ${err.message}`);
//                 setSongs([]);
//             })
//             .finally(() => setLoading(false));
//     }, [name, categoryType, token]);

//     const handleAddToPlaylist = (songId) => {
//         setSongToAdd(songId);
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         const result = await addToPlaylist(songToAdd, playlistId);
//         setAddMessage(result.message);
//         if (result.success) {
//             setTimeout(() => { setShowPlaylistModal(false); setSongToAdd(null); }, 1000);
//         }
//     };

//     return (
//         <div className="mood-songs-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//                 <h2>{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>
//                 {randomMessage && <div className="random-message animate-fade-in-out">{randomMessage}</div>}
//                 {loading ? ( <div className="loading"><div></div></div> )
//                 : error ? ( <div className="search-message animate-fade-in-out">{error}</div> )
//                 : songs.length > 0 ? (
//                     <SongList
//                         songs={songs}
//                         onSongClick={(song) => {
//                             setSelectedSong({ ...song, songList: songs });
//                             setIsPlaying(true);
//                             setIsMinimized(false);
//                         }}
//                         onAddToPlaylist={handleAddToPlaylist}
//                         playlistSongIds={playlistSongIds}
//                     />
//                 ) : (
//                     <div className="search-message animate-fade-in-out">No songs found for this category.</div>
//                 )}
//             </div>
//             <PlaylistSelectionModal
//                 isOpen={showPlaylistModal}
//                 onClose={() => setShowPlaylistModal(false)}
//                 onSelectPlaylist={handleSelectPlaylist}
//                 playlists={playlists}
//                 loading={loadingPlaylists}
//                 message={addMessage}
//             />
//             <MusicPlayer />
//         </div>
//     );
// }

// function Account() {
//     const { user, updateUser, loading } = useAuth();
//     const { setIsMinimized } = useMusicPlayer();
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
//             setTimeout(() => setMessage(""), 3000);
//             return;
//         }
//         if (newFullName.trim() === user.fullName) {
//             setMessage("The new name is the same as the old one.");
//             setTimeout(() => setMessage(""), 3000);
//             setEditProfileOpen(false);
//             return;
//         }
//         setIsSaving(true);
//         setMessage("");
//         try {
//             const result = await updateUser({ fullName: newFullName.trim() });
//             setMessage(result.message);
//             if (result.success) setEditProfileOpen(false);
//         } catch {
//             setMessage("An unexpected error occurred.");
//         } finally {
//             setIsSaving(false);
//             setTimeout(() => setMessage(""), 3000);
//         }
//     };

//     const formatJoinDate = (joinDate) => {
//         if (!joinDate) return "N/A";
//         if (typeof joinDate === "string" || typeof joinDate === "number") {
//             return new Date(joinDate).toLocaleDateString();
//         }
//         if (joinDate instanceof Date) {
//             return joinDate.toLocaleDateString();
//         }
//         return "N/A";
//     };

//     return (
//         <div className="account-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//                 <h2>
//                     Account Details{' '}
//                     <button className="edit-profile-button" onClick={handleEditProfile}>
//                         <FontAwesomeIcon icon="fa-pencil" />
//                     </button>
//                 </h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {editProfileOpen && (
//                     <div className="modal-overlay">
//                         <div className="modal-content">
//                             <h3>Edit Profile</h3>
//                             <input
//                                 type="text"
//                                 value={newFullName}
//                                 onChange={(e) => setNewFullName(e.target.value)}
//                                 placeholder="Enter new full name"
//                                 disabled={isSaving}
//                             />
//                             <button onClick={saveProfile} disabled={isSaving}>
//                                 {isSaving ? "Saving..." : "Save"}
//                             </button>
//                             <button onClick={() => setEditProfileOpen(false)} disabled={isSaving}>
//                                 Cancel
//                             </button>
//                         </div>
//                     </div>
//                 )}
//                 {loading ? (
//                     <div className="loading"><div></div></div>
//                 ) : user ? (
//                     <>
//                         <p><strong>Full Name:</strong> {user.fullName || "Not provided"}</p>
//                         <p><strong>Email:</strong> {user.email || "Not provided"}</p>
//                         <p><strong>Phone Number:</strong> {user.phone || "Not provided"}</p>
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
//     return (
//         <Router>
//             <AuthProvider>
//                 <MusicPlayerProvider>
//                     <PlaylistProvider>
//                         <Routes>
//                             <Route path="/" element={<SplashScreen />} />
//                             <Route path="/login" element={<PublicRoute><AuthScreen /></PublicRoute>} />
//                             <Route path="/main" element={<ProtectedRoute><MainScreen /></ProtectedRoute>} />
//                             <Route path="/search" element={<ProtectedRoute><SearchScreen /></ProtectedRoute>} />
//                             <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
//                             <Route path="/moods/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="mood" /></ProtectedRoute>} />
//                             <Route path="/genres/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="genre" /></ProtectedRoute>} />
//                             <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetailScreen /></ProtectedRoute>} />
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
    const [selectedSong, setSelectedSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isMinimized, setIsMinimized] = useState(true);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const audioRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        if (selectedSong && !isMinimized) {
            window.history.pushState({ musicPlayer: 'open' }, '');
        }
    }, [selectedSong, isMinimized, location.key]);

    useEffect(() => {
        const onPopState = (e) => {
            if (selectedSong && !isMinimized) {
                setIsMinimized(true);
                return;
            }
        };
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, [selectedSong, isMinimized]);

    useEffect(() => {
        if (!selectedSong?.audioUrl) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
            return;
        }

        if (!audioRef.current || audioRef.current.src !== selectedSong.audioUrl) {
            if (audioRef.current) audioRef.current.pause();
            audioRef.current = new Audio(selectedSong.audioUrl);
            audioRef.current.preload = 'auto';
            audioRef.current.onerror = () => console.error('Audio load error for:', selectedSong.audioUrl);
            audioRef.current.addEventListener('timeupdate', () => {
                if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
            });
            audioRef.current.addEventListener('ended', () => {
                if (selectedSong.songList && selectedSong.songList.length > 0) {
                    const nextIndex = (currentSongIndex + 1) % selectedSong.songList.length;
                    setSelectedSong({ ...selectedSong.songList[nextIndex], songList: selectedSong.songList });
                    setIsPlaying(true);
                } else {
                    setIsPlaying(false);
                }
            });
        }

        audioRef.current.volume = volume;
        if (isPlaying) audioRef.current.play().catch(err => console.error('Audio play error:', err));
        else audioRef.current.pause();

        if (selectedSong.songList) {
            const index = selectedSong.songList.findIndex(s => s._id === selectedSong._id);
            setCurrentSongIndex(index !== -1 ? index : 0);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeEventListener('timeupdate', () => {});
                audioRef.current.removeEventListener('ended', () => {});
            }
        };
    }, [selectedSong, isPlaying, volume, currentSongIndex]);

    const contextValue = {
        selectedSong, setSelectedSong, isPlaying, setIsPlaying,
        currentTime, setCurrentTime, volume, setVolume,
        isMinimized, setIsMinimized, currentSongIndex, setCurrentSongIndex, audioRef
    };

    return (
        <MusicPlayerContext.Provider value={contextValue}>
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
    const [playlistSongIds, setPlaylistSongIds] = useState(new Set());
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const { user } = useAuth();
    const token = localStorage.getItem('token');

    const fetchPlaylists = useCallback(async () => {
        if (!user || !token) {
            setPlaylists([]);
            setPlaylistSongIds(new Set());
            return;
        }
        setLoadingPlaylists(true);
        try {
            const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const fetchedPlaylists = res.data || [];
            setPlaylists(fetchedPlaylists);
            const songIds = new Set(fetchedPlaylists.flatMap(p => p.songs.map(s => s._id)));
            setPlaylistSongIds(songIds);
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

    const addToPlaylist = async (songId, playlistId) => {
        try {
            const playlist = playlists.find(p => p._id === playlistId);
            if (playlist?.songs.some(s => s._id === songId)) {
                return { success: false, message: 'Song already in playlist' };
            }
            const updatedSongs = [...(playlist.songs.map(s => s._id)), songId];
            await axios.put(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, { songs: updatedSongs }, { headers: { Authorization: `Bearer ${token}` } });
            await fetchPlaylists();
            return { success: true, message: 'Song added to playlist!' };
        } catch (err) {
            console.error('Failed to add song:', err);
            return { success: false, message: 'Failed to add song.' };
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

    const removeSongFromPlaylist = async (songId, playlistId) => {
        try {
            const playlist = playlists.find(p => p._id === playlistId);
            const updatedSongs = playlist.songs.filter(s => s._id !== songId).map(s => s._id);
            await axios.put(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, { songs: updatedSongs }, { headers: { Authorization: `Bearer ${token}` } });
            await fetchPlaylists();
            return { success: true, message: 'Song removed successfully!' };
        } catch (error) {
            console.error('Failed to remove song:', error);
            return { success: false, message: 'Failed to remove song.' };
        }
    };

    const updatePlaylistName = async (playlistId, newName) => {
        try {
            await axios.put(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, { name: newName }, { headers: { Authorization: `Bearer ${token}` } });
            await fetchPlaylists();
            return { success: true, message: 'Playlist updated!' };
        } catch (error) {
            console.error('Failed to update playlist name:', error);
            return { success: false, message: 'Failed to update name.' };
        }
    };

    const value = { playlists, playlistSongIds, loadingPlaylists, addToPlaylist, createPlaylist, removeSongFromPlaylist, updatePlaylistName };
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
            const endpoint = isLogin ? 'https://music-backend-akb5.onrender.com/api/auth/login' : 'https://music-backend-akb5.onrender.com /api/auth/register';
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
    const { setSelectedSong, setIsPlaying, audioRef } = useMusicPlayer();
    const { playlists, loadingPlaylists, createPlaylist } = usePlaylist();
    const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
    const [showModeDropdown, setShowModeDropdown] = useState(false);
    const [mode, setMode] = useState(localStorage.getItem('mode') || 'dark');
    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isOpen &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target) &&
                !event.target.closest('.sidebar-toggle') // Exclude ☰ toggle button
            ) {
                onClose();
                setShowModeDropdown(false);
                setShowPlaylistDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        document.body.dataset.mode = mode;
        localStorage.setItem('mode', mode);
    }, [mode]);

    const handleLogout = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        setIsPlaying(false);
        setSelectedSong(null);
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
        selectedSong,
        setSelectedSong,
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime,
        volume,
        setVolume,
        isMinimized,
        setIsMinimized,
        currentSongIndex,
        audioRef
    } = useMusicPlayer();

    const location = useLocation();
    const excludedPaths = ['/login', '/'];
    const showPlayer = !excludedPaths.includes(location.pathname);

    useEffect(() => {
        document.body.classList.toggle('no-scroll', !isMinimized);
    }, [isMinimized]);

    if (!selectedSong || !showPlayer) return null;

    const togglePlay = () => setIsPlaying(!isPlaying);

    const changeSong = (offset) => {
        if (!selectedSong?.songList?.length) return;
        const newIndex = (currentSongIndex + offset + selectedSong.songList.length) % selectedSong.songList.length;
        setSelectedSong({ ...selectedSong.songList[newIndex], songList: selectedSong.songList });
        setIsPlaying(true);
    };

    const handleTimeDrag = (e) => {
        if (audioRef.current?.duration) {
            const newTime = (e.target.value / 100) * audioRef.current.duration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
    const duration = audioRef.current?.duration || 0;

    return (
        <div className={`music-player ${isMinimized ? 'minimized' : 'full-screen'}`}>
            {isMinimized ? (
                <div className="player-minimized-content" onClick={() => setIsMinimized(false)}>
                    <img src={selectedSong.thumbnailUrl || 'https://placehold.co/100x100'} alt={selectedSong.title} className="player-minimized-thumbnail" loading="lazy" />
                    <div className="player-minimized-info">
                        <h4>{selectedSong.title}</h4>
                        <p>{selectedSong.singer}</p>
                    </div>
                    <div className="player-minimized-buttons">
                        <button className="minimize-player-button" onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}>
                            <FontAwesomeIcon icon="fa-chevron-up" />
                        </button>
                        <button className="close-player-button" onClick={(e) => { e.stopPropagation(); setSelectedSong(null); audioRef.current.pause(); audioRef.current.src = ''; }}>
                            <FontAwesomeIcon icon="fa-times" />
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <button className="minimize-player-button" onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}>
                        <FontAwesomeIcon icon="fa-chevron-down" />
                    </button>
                    <button className="close-player-button" onClick={(e) => { e.stopPropagation(); setSelectedSong(null); audioRef.current.pause(); audioRef.current.src = ''; }}>
                        <FontAwesomeIcon icon="fa-times" />
                    </button>
                    <div className="player-content" onClick={(e) => e.stopPropagation()}>
                        <div className="player-background-blur" style={{ backgroundImage: `url(${selectedSong.thumbnailUrl || 'https://placehold.co/800x800'})` }}></div>
                        <div className="player-foreground-content">
                            <img src={selectedSong.thumbnailUrl || 'https://placehold.co/300x300'} alt={selectedSong.title} className="player-main-thumbnail" loading="lazy" />
                            <div className="song-info">
                                <h2>{selectedSong.title}</h2>
                                <h3>{selectedSong.singer}</h3>
                                <p className="song-album">{selectedSong.movie || selectedSong.genre || 'Unknown Album'}</p>
                            </div>
                            <div className="controls">
                                <div className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</div>
                                <input type="range" min="0" max="100" value={duration ? (currentTime / duration) * 100 : 0} onChange={handleTimeDrag} className="progress-bar" style={{ '--progress': duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
                                <div className="player-buttons">
                                    <button onClick={() => changeSong(-1)}><FontAwesomeIcon icon="fa-step-backward" /></button>
                                    <button onClick={togglePlay}><FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} /></button>
                                    <button onClick={() => changeSong(1)}><FontAwesomeIcon icon="fa-step-forward" /></button>
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

function SongList({ songs, onSongClick, onAddToPlaylist, playlistSongIds }) {
    return (
        <div className="songs-row">
            {songs.map((song) => (
                <div
                    key={song._id}
                    className="song-tile"
                    onClick={() => onSongClick(song)}
                >
                    <img
                        src={song.thumbnailUrl || 'https://placehold.co/120x120/333/FFF?text=♪'}
                        alt={song.title}
                        className="song-tile-thumbnail"
                        loading="lazy"
                    />
                    <div className="song-tile-details">
                        <div className="song-tile-title">{song.title}</div>
                        <div className="song-tile-singer">{song.singer}</div>
                        <div className="song-tile-label">{song.movie ? song.movie : 'Album'}</div>
                    </div>
                    {!playlistSongIds.has(song._id) && (
                        <button
                            className="add-song-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToPlaylist(song._id);
                            }}
                            title="Add to Playlist"
                        >
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
                    <div className="loading-bar">
                        <div className="loading-bar-progress"></div>
                    </div>
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
                        <button className="create-playlist-btn" onClick={onCreatePlaylist}>
                            Create Playlist
                        </button>
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
  const [isSuccess, setIsSuccess] = useState(false); // New state for success
  const token = localStorage.getItem('token');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRequests([{ title: '', movie: '' }]);
      setMessage('');
      setLoading(false);
      setIsSuccess(false); // Reset success state
    }
  }, [isOpen]);

  const handleRequestChange = (index, field, value) => {
    const newRequests = [...requests];
    newRequests[index][field] = value;
    setRequests(newRequests);
  };

  const handleAddRequest = () => {
    if (requests.length < 5) {
      setRequests([...requests, { title: '', movie: '' }]);
    }
  };

  const handleRemoveRequest = (index) => {
    if (requests.length > 1) {
      const newRequests = requests.filter((_, i) => i !== index);
      setRequests(newRequests);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const validRequests = requests.filter(req => req.title.trim() && req.movie.trim());

    if (validRequests.length === 0) {
      setMessage('Please fill out at least one complete song request.');
      return;
    }

    if (validRequests.length !== requests.filter(r => r.title.trim() || r.movie.trim()).length) {
        setMessage('Please fill out both song title and movie/album for each request line.');
        return;
    }

    setLoading(true);
    try {
      await axios.post('https://music-backend-akb5.onrender.com/api/song-requests', validRequests, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // On success, update state to show success message and start timer to close
      setLoading(false);
      setIsSuccess(true);
      setMessage('Your requests have been submitted successfully!');
      
      // Close the modal after 1 second
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      // On error, just show the error message and stop loading
      setLoading(false);
      setMessage(error.response?.data?.message || 'Failed to submit requests. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="request-song-modal-overlay" onClick={onClose}>
      <div className="request-song-modal" onClick={(e) => e.stopPropagation()}>
        {isSuccess ? (
          // Success View
          <div className="request-success-view">
              <FontAwesomeIcon icon="fa-check-circle" style={{fontSize: '3rem', color: '#4caf50', marginBottom: '1rem'}}/>
              <h3>Success!</h3>
              <p>{message}</p>
          </div>
        ) : (
          // Form View
          <>
            <h3 className="request-song-modal-header">Request a Song</h3>
            <p className="request-song-modal-subheader">You can request up to 5 songs.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="request-list">
                {requests.map((req, index) => (
                  <div key={index} className="request-item">
                    <input
                      type="text"
                      placeholder="Song Title"
                      value={req.title}
                      onChange={(e) => handleRequestChange(index, 'title', e.target.value)}
                      className="request-input"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Movie / Album"
                      value={req.movie}
                      onChange={(e) => handleRequestChange(index, 'movie', e.target.value)}
                      className="request-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRequest(index)}
                      className="remove-request-btn"
                      disabled={requests.length <= 1 || loading}
                      title="Remove request"
                    >
                      <FontAwesomeIcon icon="fa-times" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="request-song-actions">
                <button
                  type="button"
                  onClick={handleAddRequest}
                  className="add-request-btn"
                  disabled={requests.length >= 5 || loading}
                >
                  <FontAwesomeIcon icon="fa-plus" /> Add another
                </button>
                
                <button
                  type="submit"
                  className="submit-requests-btn"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Requests'}
                </button>
              </div>

              <div className="request-song-modal-footer">
                {message && <div className="request-modal-message">{message}</div>}
                <button type="button" className="request-modal-cancel" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}


function MainScreen({ openRequestModal }) {
    const { user } = useAuth();
    const { setIsMinimized } = useMusicPlayer();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (sessionStorage.getItem('showWelcome')) {
            setShowWelcome(true);
            const timer = setTimeout(() => {
                setShowWelcome(false);
                sessionStorage.removeItem('showWelcome');
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const moodCategories = ['happy', 'sad', 'love', 'motivational', 'nostalgic', 'heartbreak', 'spiritual', 'travel'];
    const genreCategories = ['rap', 'party', 'classical', 'lo-fi'];

    return (
        <div className="main-screen">
            {showWelcome && user && <div className="welcome-overlay">Welcome, {user.fullName.split(' ')[0]}!</div>}
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
            <div className="content-area">
                <section className="mood-section">
                    <h2>Moods</h2>
                    <div className="mood-cards">
                        {moodCategories.map((m) => (
                            <div key={m} className={`mood-card ${m}`} onClick={() => navigate(`/moods/${m}`)}>
                                <h3>{m}</h3>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="genre-section">
                    <h2>Genres</h2>
                    <div className="mood-cards">
                        {genreCategories.map((g) => (
                            <div key={g} className={`mood-card ${g}`} onClick={() => navigate(`/genres/${g}`)}>
                                <h3>{g}</h3>
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
    const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
    const { playlists, addToPlaylist, playlistSongIds, loadingPlaylists, createPlaylist } = usePlaylist();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [songToAdd, setSongToAdd] = useState(null);
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

            if (!query.trim()) {
                setSearchResults([]);
                setLoadingSearch(false);
                return;
            }

            timeoutId = setTimeout(async () => {
                setLoadingSearch(true);
                try {
                    const url = `https://music-backend-akb5.onrender.com/api/songs?search=${encodeURIComponent(query.trim())}`;
                    const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
                    setSearchResults(Array.isArray(res.data) ? res.data : []);
                } catch (error) {
                    console.error('Search error:', error);
                    setSearchResults([]);
                } finally {
                    setLoadingSearch(false);
                }
            }, 300);
        };
    }, [token]);

    useEffect(() => {
        debouncedSearch(searchQuery);
    }, [searchQuery, debouncedSearch]);

    const handleAddToPlaylist = (songId) => {
        setSongToAdd(songId);
        setShowPlaylistModal(true);
        setAddMessage('');
    };

    const handleSelectPlaylist = async (playlistId) => {
        const result = await addToPlaylist(songToAdd, playlistId);
        setAddMessage(result.message);
        if (result.success) {
            setTimeout(() => {
                setShowPlaylistModal(false);
                setSongToAdd(null);
            }, 1000);
        }
    };

    const handleCreatePlaylist = async () => {
        const playlistName = prompt('Enter playlist name:');
        if (playlistName?.trim()) {
            const result = await createPlaylist(playlistName.trim());
            setAddMessage(result.message);
            if (result.success && songToAdd) {
                const newPlaylist = playlists.find(p => p.name === playlistName.trim());
                if (newPlaylist) {
                    await handleSelectPlaylist(newPlaylist._id);
                }
            }
        }
    };

    const checkMicrophonePermission = useCallback(async () => {
        try {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
            if (permissionStatus.state === 'denied') {
                setVoiceError('Microphone access denied. Please enable microphone permissions in your browser settings.');
                return false;
            }
            return true;
        } catch (err) {
            setVoiceError('Error checking microphone permissions: ' + err.message);
            return false;
        }
    }, []);

    const startVoiceSearch = useCallback(async () => {
        const hasPermission = await checkMicrophonePermission();
        if (!hasPermission) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setVoiceError('Voice search is not supported in this browser.');
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.interimResults = true;
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            setVoiceError('');
        };

        recognitionRef.current.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
        };
        recognitionRef.current.onerror = (event) => {
            setIsListening(false);
            if (event.error === 'not-allowed') {
                setVoiceError('Microphone access denied. Please allow microphone permissions in your browser settings.');
            } else if (event.error === 'network') {
                setVoiceError('Network error. Please check your internet connection.');
            } else {
                setVoiceError('Voice recognition error: ' + event.error);
            }
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        try {
            recognitionRef.current.start();
        } catch (err) {
            setIsListening(false);
            setVoiceError('Failed to start voice recognition: ' + err.message);
        }
    }, [checkMicrophonePermission]);

    const stopVoiceSearch = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const toggleVoiceSearch = useCallback(() => {
        if (isListening) {
            stopVoiceSearch();
        } else {
            startVoiceSearch();
        }
    }, [isListening, startVoiceSearch, stopVoiceSearch]);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    return (
        <div className="search-screen">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
            <div className="content-area">
                <h2>Search Songs</h2>
                <div className="search-input-container relative flex items-center">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input-field w-full p-2 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search by title, singer, mood, genre, movie..."
                        autoFocus
                    />
                    <button
                        className={`mic-button absolute right-2 p-2 rounded-full ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-gray-300 focus:outline-none`}
                        onClick={toggleVoiceSearch}
                        title={isListening ? 'Stop Voice Search' : 'Start Voice Search'}
                        disabled={!window.SpeechRecognition && !window.webkitSpeechRecognition}
                    >
                        <FontAwesomeIcon icon={isListening ? 'fa-microphone-slash' : 'fa-microphone'} />
                    </button>
                </div>
                {voiceError && <div className="error-message text-red-500 mt-2">{voiceError}</div>}
                <div className="search-results-section">
                    {loadingSearch ? (
                        <div className="search-message">Searching...</div>
                    ) : searchQuery.trim() && searchResults.length > 0 ? (
                        <SongList
                            songs={searchResults}
                            onSongClick={(song) => {
                                setSelectedSong({ ...song, songList: searchResults });
                                setIsPlaying(true);
                                setIsMinimized(false);
                            }}
                            onAddToPlaylist={handleAddToPlaylist}
                            playlistSongIds={playlistSongIds}
                        />
                    ) : searchQuery.trim() && searchResults.length === 0 ? (
                        <div className="search-message animate-fade-in-out">No songs found.</div>
                    ) : null}
                </div>
            </div>
            <PlaylistSelectionModal
                isOpen={showPlaylistModal}
                onClose={() => setShowPlaylistModal(false)}
                onSelectPlaylist={handleSelectPlaylist}
                playlists={playlists}
                loading={loadingPlaylists}
                message={addMessage}
                onCreatePlaylist={handleCreatePlaylist}
            />
            <MusicPlayer />
        </div>
    );
}

function PlaylistDetailScreen({ openRequestModal }) {
    const { playlistId } = useParams();
    const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
    const { playlists, removeSongFromPlaylist, updatePlaylistName, loadingPlaylists } = usePlaylist();
    const [message, setMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editPlaylistOpen, setEditPlaylistOpen] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const playlist = useMemo(() => playlists.find((p) => p._id === playlistId), [playlists, playlistId]);

    const handleRemoveSong = async (songId) => {
        if (!window.confirm('Are you sure?')) return;
        const result = await removeSongFromPlaylist(songId, playlistId);
        setMessage(result.message);
        setTimeout(() => setMessage(''), 2000);
    };
    const handleEditPlaylist = async () => {
        setEditPlaylistOpen(true);
        setNewPlaylistName(playlist.name);
    };

    const savePlaylistName = async () => {
        if (newPlaylistName.trim() && newPlaylistName !== playlist.name) {
            const result = await updatePlaylistName(playlistId, newPlaylistName.trim());
            setMessage(result.message);
            setTimeout(() => setMessage(''), 2000);
        }
        setEditPlaylistOpen(false);
    };

    if (loadingPlaylists) return <div className="content-area loading"><div></div></div>;
    if (!playlist) return <div className="content-area"><p>Playlist not found.</p></div>;

    return (
        <div className="playlist-detail-screen">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
            <div className="content-area">
                <h2>
                    {playlist.name}{' '}
                    <button className="edit-playlist-button" onClick={handleEditPlaylist}>
                        <FontAwesomeIcon icon="fa-pencil" />
                    </button>
                </h2>
                {message && <div className="info-message">{message}</div>}
                {editPlaylistOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Edit Playlist Name</h3>
                            <input
                                type="text"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                placeholder="Enter new playlist name"
                            />
                            <button onClick={savePlaylistName}>Save</button>
                            <button onClick={() => setEditPlaylistOpen(false)}>Cancel</button>
                        </div>
                    </div>
                )}
                {playlist.songs?.length > 0 ? (
                    <div className="songs-column">
                        {playlist.songs.map((song) => (
                            <div
                                key={song._id}
                                className="song-card full-line"
                                onClick={() => {
                                    setSelectedSong({ ...song, songList: playlist.songs });
                                    setIsPlaying(true);
                                    setIsMinimized(false);
                                }}
                            >
                                <img
                                    src={song.thumbnailUrl || 'https://placehold.co/50x50'}
                                    alt={song.title}
                                    className="song-thumbnail"
                                    loading="lazy"
                                />
                                <div className="song-details">
                                    <h4>{song.title}</h4>
                                    <p>{song.singer}</p>
                                </div>
                                <button
                                    className="remove-song-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveSong(song._id);
                                    }}
                                >
                                    <FontAwesomeIcon icon="fa-minus" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="search-message animate-fade-in-out">This playlist is empty. Add some songs!</div>
                )}
            </div>
            <MusicPlayer />
        </div>
    );
}

function CategorySongsScreen({ categoryType, openRequestModal }) {
    const { name } = useParams();
    const { user } = useAuth();
    const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
    const { playlists, addToPlaylist, playlistSongIds, loadingPlaylists, createPlaylist } = usePlaylist();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [songToAdd, setSongToAdd] = useState(null);
    const [addMessage, setAddMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [randomMessage, setRandomMessage] = useState('');
    const [error, setError] = useState(null);
    const [showTitle, setShowTitle] = useState(false);
    const token = localStorage.getItem('token');

    const messagesConfig = useMemo(() => ({
        love: ["Hey ${username}, let your heart sing louder than words.", "${username}, fall in love with every note.", "Music for the moments when your heart races, ${username}.", "Wrap yourself in melodies of love, ${username}.", "${username}, let these tunes be your love letter."],
        travel: ["Adventure awaits, ${username} — let the music guide you.", "Wanderlust in every beat, just for you ${username}.", "Hit the open road with these tunes, ${username}.", "${username}, let every song be a new destination.", "Pack your dreams and play these tracks, ${username}."],
        happy: ["Smile wide, ${username} — these songs are your sunshine.", "Turn up the joy, ${username}, and dance like no one's watching.", "${username}, happiness is just a beat away.", "Celebrate today with these tunes, ${username}.", "Life's better with music and you in it, ${username}."],
        sad: ["It's okay to feel, ${username} — let these songs hold you.", "Lean on these melodies, ${username}, when words aren't enough.", "${username}, find gentle comfort in every note.", "Let your tears fall freely with these tracks, ${username}.", "Soft songs for heavy hearts, just for you ${username}."],
        motivational: ["Rise and conquer, ${username} — let the music push you.", "Fuel your fire, ${username}, one beat at a time.", "${username}, chase your dreams with these power tunes.", "No limits for you, ${username} — feel the energy.", "Crush every goal with these tracks, ${username}."],
        nostalgic: ["A trip down memory lane for you, ${username}.", "Relive the golden days with these songs, ${username}.", "${username}, let these melodies take you back.", "Old memories, new feelings — enjoy them, ${username}.", "Time travel through music, just for you ${username}."],
        heartbreak: ["Some songs understand you better than words, ${username}.", "Let it all out, ${username} — these tracks feel your pain.", "${username}, heal one verse at a time.", "Mend your heart with these honest melodies, ${username}.", "It's okay to break, ${username} — music will hold you."],
        spiritual: ["Find your center, ${username}, in every chord.", "Breathe deeply with these mindful tunes, ${username}.", "${username}, let the music elevate your spirit.", "Harmony for the soul — just for you, ${username}.", "Feel peace wash over you, ${username}, with every note."],
        calm: ["Slow down, ${username} — breathe with these soothing sounds.", "Ease your mind, ${username}, with gentle melodies.", "Quiet moments made perfect for you, ${username}.", "${username}, relax — let the calm in.", "Soft notes for softer days, just for you ${username}."],
        rap: ["Spit fire, ${username}, let the beats talk.", "Get in the zone with these bars, ${username}.", "Powerful words for a powerful ${username}.", "Vibe with raw energy, ${username}.", "${username}, own the mic with these tracks."],
        party: ["Let's turn it up, ${username} — the party starts here.", "${username}, dance like nobody's watching.", "Good vibes and wild nights just for you, ${username}.", "Hit the floor with these beats, ${username}.", "Bring the energy, ${username}, let’s go!"],
        classical: ["Timeless beauty in every note for you, ${username}.", "Close your eyes and let it flow, ${username}.", "Elegance and grace in sound, just for you ${username}.", "${username}, feel every movement and melody.", "For the refined listener — you, ${username}."],
        'lo-fi': ["Chill out, ${username}, with these mellow beats.", "Your perfect study companion, ${username}.", "Lo-fi vibes to calm your mind, ${username}.", "Soft beats for deep thoughts, just for you ${username}.", "${username}, relax — let the loops take over."]
    }), []);

useEffect(() => {
  const firstName = user?.fullName?.split(' ')[0] || 'friend';
  const messages = messagesConfig[name] || [];

  if (songs.length > 0 && messages.length > 0) {
    const randomTemplate = messages[Math.floor(Math.random() * messages.length)];
    const personalized = randomTemplate.replace(/\$\{username\}/g, firstName);
    setRandomMessage(personalized);
    setShowTitle(false);

    const timeout = setTimeout(() => {
      setRandomMessage('');
      setShowTitle(true);
    }, 6500);

    return () => clearTimeout(timeout);
  }
}, [name, songs, user, messagesConfig]);
useEffect(() => {
        setLoading(true);
        setError(null);
        if (!name || !categoryType || !token) {
            setError('Invalid category or authentication issue.');
            setLoading(false);
            return;
        }
        axios.get(`https://music-backend-akb5.onrender.com/api/songs?${categoryType}=${encodeURIComponent(name)}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
            if (Array.isArray(res.data)) {
                setSongs(res.data);
            } else {
                setSongs([]);
                setError('Invalid data format received from server.');
            }
        })
        .catch((err) => {
            console.error(`Failed to fetch ${categoryType} songs for ${name}:`, err);
            setError(`Failed to fetch ${categoryType} songs: ${err.message || 'Server error'}`);
            setSongs([]);
        })
        .finally(() => setLoading(false));
    }, [name, categoryType, token]);

    const handleAddToPlaylist = (songId) => {
        setSongToAdd(songId);
        setShowPlaylistModal(true);
        setAddMessage('');
    };

    const handleSelectPlaylist = async (playlistId) => {
        const result = await addToPlaylist(songToAdd, playlistId);
        setAddMessage(result.message);
        if (result.success) {
            setTimeout(() => { setShowPlaylistModal(false); setSongToAdd(null); }, 1000);
        }
    };

    const handleCreatePlaylist = async () => {
        const playlistName = prompt('Enter playlist name:');
        if (playlistName?.trim()) {
            const result = await createPlaylist(playlistName.trim());
            setAddMessage(result.message);
            if (result.success && songToAdd) {
                const newPlaylist = playlists.find(p => p.name === playlistName.trim());
                if (newPlaylist) {
                    await handleSelectPlaylist(newPlaylist._id);
                }
            }
        }
    };

    if (!user) {
        return <div className="content-area"><p>Please log in to view this page.</p></div>;
    }

   return (
  <div className="mood-songs-screen">
    <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
    
    <div className="content-area">
      {randomMessage && (
        <div className="random-message animate-fade-in-out">
          {randomMessage}
        </div>
      )}

      {showTitle && (
        <h2 className="category-title fade-in">
          {name.charAt(0).toUpperCase() + name.slice(1)} Songs
        </h2>
      )}

      {loading ? (
        <div className="loading"><div></div></div>
      ) : error ? (
        <div className="search-message animate-fade-in-out">{error}</div>
      ) : songs.length > 0 ? (
        <SongList
          songs={songs}
          onSongClick={(song) => {
            setSelectedSong({ ...song, songList: songs });
            setIsPlaying(true);
            setIsMinimized(false);
          }}
          onAddToPlaylist={handleAddToPlaylist}
          playlistSongIds={playlistSongIds}
        />
      ) : (
        <div className="search-message animate-fade-in-out">
          No songs found for this category.
        </div>
      )}
    </div>

    <PlaylistSelectionModal
      isOpen={showPlaylistModal}
      onClose={() => setShowPlaylistModal(false)}
      onSelectPlaylist={handleSelectPlaylist}
      playlists={playlists}
      loading={loadingPlaylists}
      message={addMessage}
      onCreatePlaylist={handleCreatePlaylist}
    />
    <MusicPlayer />
  </div>
);
}


function Account({ openRequestModal }) {
    const { user, updateUser, loading } = useAuth();
    const { setIsMinimized } = useMusicPlayer();
    const [message, setMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newFullName, setNewFullName] = useState('');

    useEffect(() => {
        if (user?.fullName) setNewFullName(user.fullName);
    }, [user]);

    const handleEditProfile = () => {
        if (user?.fullName) {
            setNewFullName(user.fullName);
            setEditProfileOpen(true);
        }
    };

    const saveProfile = async () => {
        if (!newFullName.trim()) {
            setMessage("Full name cannot be empty.");
            setTimeout(() => setMessage(""), 3000);
            return;
        }
        if (newFullName.trim() === user.fullName) {
            setMessage("The new name is the same as the old one.");
            setTimeout(() => setMessage(""), 3000);
            setEditProfileOpen(false);
            return;
        }
        setIsSaving(true);
        setMessage("");
        try {
            const result = await updateUser({ fullName: newFullName.trim() });
            setMessage(result.message);
            if (result.success) setEditProfileOpen(false);
        } catch {
            setMessage("An unexpected error occurred.");
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    const formatJoinDate = (joinDate) => {
        if (!joinDate) return "N/A";
        if (typeof joinDate === "string" || typeof joinDate === "number") {
            return new Date(joinDate).toLocaleDateString();
        }
        if (joinDate instanceof Date) {
            return joinDate.toLocaleDateString();
        }
        return "N/A";
    };

    return (
        <div className="account-screen">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onRequestSongOpen={openRequestModal} />
            <div className="content-area">
                <h2>
                    Account Details{' '}
                    <button className="edit-profile-button" onClick={handleEditProfile}>
                        <FontAwesomeIcon icon="fa-pencil" />
                    </button>
                </h2>
                {message && <div className="info-message">{message}</div>}
                {editProfileOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Edit Profile</h3>
                            <input
                                type="text"
                                value={newFullName}
                                onChange={(e) => setNewFullName(e.target.value)}
                                placeholder="Enter new full name"
                                disabled={isSaving}
                            />
                            <button onClick={saveProfile} disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                            <button onClick={() => setEditProfileOpen(false)} disabled={isSaving}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                {loading ? (
                    <div className="loading"><div></div></div>
                ) : user ? (
                    <>
                        <p><strong>Full Name:</strong> {user.fullName || "Not provided"}</p>
                        <p><strong>Email:</strong> {user.email || "Not provided"}</p>
                        <p><strong>Phone Number:</strong> {user.phone || "Not provided"}</p>
                        <p><strong>Join Date:</strong> {formatJoinDate(user.joinDate)}</p>
                    </>
                ) : (
                    <p>User data not available.</p>
                )}
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
                            <Route path="/moods/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="mood" openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
                            <Route path="/genres/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="genre" openRequestModal={() => setIsRequestModalOpen(true)} /></ProtectedRoute>} />
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

