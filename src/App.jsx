

// export default App;
// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { fas } from '@fortawesome/free-solid-svg-icons';
// import { library } from '@fortawesome/fontawesome-svg-core';
// library.add(fas);

// // --- Music Player Context ---
// const MusicPlayerContext = React.createContext();

// function MusicPlayerProvider({ children }) {
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [volume, setVolume] = useState(0.5);
//     const [isMinimized, setIsMinimized] = useState(false);
//     const [currentSongIndex, setCurrentSongIndex] = useState(0);
//     const audioRef = useRef(null);

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
//     }, [selectedSong?._id, selectedSong?.audioUrl, isPlaying, volume]);

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
//     return React.useContext(MusicPlayerContext);
// }

// // --- Auth Context ---
// const AuthContext = React.createContext();

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
//             } catch (error) {
//                 console.error('Auth error:', error);
//                 localStorage.removeItem('token');
//                 delete axios.defaults.headers.common['Authorization'];
//                 setUser(null);
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
//             const res = await axios.put('https://music-backend-akb5.onrender.com/api/user/profile', userData, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             setUser(processUserData(res.data));
//             return { success: true, message: 'Profile updated successfully!' };
//         } catch (error) {
//             console.error('Failed to update profile:', error);
//             return { success: false, message: error.response?.data?.message || 'Failed to update profile.' };
//         }
//     };

//     return (
//         <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }

// function useAuth() {
//     return React.useContext(AuthContext);
// }

// // --- Playlist Context ---
// const PlaylistContext = React.createContext();

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
//     return React.useContext(PlaylistContext);
// }

// function ProtectedRoute({ children }) {
//     const { user, loading } = useAuth();
//     if (loading) return <div className="loading"><div></div></div>;
//     if (!user) return <Navigate to="/login" replace />;
//     return children;
// }

// // --- Components ---

// function SplashScreen() {
//     const navigate = useNavigate();
//     useEffect(() => {
//         const timer = setTimeout(() => navigate('/login'), 3000);
//         return () => clearTimeout(timer);
//     }, [navigate]);
//     return (
//         <div className="splash-screen">
//             <FontAwesomeIcon icon="fa-music" size="3x" className="animate-spin" /><h1>Gawana</h1><p>Loading...</p>
//         </div>
//     );
// }

// function AuthScreen() {
//     const [isLogin, setIsLogin] = useState(true);
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [fullName, setFullName] = useState('');
//     const [loading, setLoading] = useState(false);
//     const { login } = useAuth();
//     const navigate = useNavigate();
//     const [message, setMessage] = useState('');

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage('');
//         try {
//             const endpoint = isLogin ? 'https://music-backend-akb5.onrender.com/api/auth/login' : 'https://music-backend-akb5.onrender.com/api/auth/register';
//             const data = isLogin ? { email, password } : { fullName, email, password };
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
//                 {!isLogin && <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required />}
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
//     const [showModeDropdown, setShowModeDropdown] = useState(false); // <-- add this
//     const [mode, setMode] = useState(localStorage.getItem('mode') || 'dark');
//     const sidebarRef = useRef(null);

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//                 onClose();
//                 setShowModeDropdown(false); // <-- close dropdown on outside click
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
//             <a href="/" onClick={(e) => { e.preventDefault(); navigate('/account'); onClose(); }}>Account</a>
//             <div className="sidebar-item-with-dropdown">
//                 <a href="/" onClick={(e) => { e.preventDefault(); setShowModeDropdown((prev) => !prev); }}>Mode</a>
//                 {showModeDropdown && (
//                     <div className="mode-dropdown">
//                         <span onClick={() => { setMode('dark'); setShowModeDropdown(false); }}>Dark</span>
//                         <span onClick={() => { setMode('light'); setShowModeDropdown(false); }}>Light</span>
//                         <span onClick={() => { setMode('neon'); setShowModeDropdown(false); }}>Neon</span>
//                     </div>
//                 )}
//             </div>
//             <a href="/" onClick={(e) => { e.preventDefault(); setShowPlaylistDropdown(!showPlaylistDropdown); }}>Playlist</a>
//             {showPlaylistDropdown && (
//                 <div className="playlist-dropdown">
//                     {loadingPlaylists ? <span>Loading...</span> : <>
//                         {playlists.map(playlist => <span key={playlist._id} onClick={() => { navigate(`/playlist/${playlist._id}`); onClose(); }}>{playlist.name}</span>)}
//                         <span onClick={handleCreatePlaylist} className="create-playlist"><FontAwesomeIcon icon="fa-plus" /> Create New</span>
//                     </>}
//                 </div>
//             )}
//             {user && <a href="/" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>}
//         </div>
//     );
// }

// function MusicPlayer() {
//     const { selectedSong, setSelectedSong, isPlaying, setIsPlaying, currentTime, setCurrentTime, volume, setVolume, isMinimized, setIsMinimized, currentSongIndex, audioRef } = useMusicPlayer();
//     if (!selectedSong) return null;

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

//     return (
//         <div className={`music-player ${isMinimized ? 'minimized' : ''}`}>
//             <button className="close-player-button" onClick={() => setSelectedSong(null)}>✖</button>
//             <div className="player-content">
//                 <img
//                     src={selectedSong.thumbnailUrl || 'https://placehold.co/100x100'}
//                     alt={selectedSong.title}
//                     className="player-thumbnail"
//                     loading="lazy"
//                 />
//                 <div className="song-info">
//                     <h4 title={selectedSong.title}>{selectedSong.title}</h4>
//                     <p title={selectedSong.singer}>{selectedSong.singer}</p>
//                 </div>
//                 {!isMinimized && (
//                     <div className="controls">
//                         <div className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</div>
//                         <input
//                             type="range"
//                             min="0"
//                             max="100"
//                             value={duration ? (currentTime / duration) * 100 : 0}
//                             onChange={handleTimeDrag}
//                             className="progress-bar"
//                         />
//                         <div className="player-buttons">
//                             <button onClick={() => changeSong(-1)}><FontAwesomeIcon icon="fa-step-backward" /></button>
//                             <button onClick={togglePlay}><FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} /></button>
//                             <button onClick={() => changeSong(1)}><FontAwesomeIcon icon="fa-step-forward" /></button>
//                             <input
//                                 type="range"
//                                 min="0"
//                                 max="1"
//                                 step="0.1"
//                                 value={volume}
//                                 onChange={(e) => setVolume(parseFloat(e.target.value))}
//                                 className="volume-slider"
//                             />
//                         </div>
//                     </div>
//                 )}
//             </div>
//             <button className="minimize-player-button" onClick={() => setIsMinimized(!isMinimized)}>
//                 <FontAwesomeIcon icon={isMinimized ? 'fa-chevron-up' : 'fa-chevron-down'} />
//             </button>
//         </div>
//     );
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
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [showWelcome, setShowWelcome] = useState(false);

//     useEffect(() => {
//         if (sessionStorage.getItem('showWelcome')) {
//             setShowWelcome(true);
//             const timer = setTimeout(() => {
//                 setShowWelcome(false);
//                 sessionStorage.removeItem('showWelcome');
//             }, 3000);
//             return () => clearTimeout(timer);
//         }
//     }, [user]);

//     const navigate = useNavigate();
//     const moodCategories = ['happy', 'sad', 'love', 'calm', 'motivational', 'nostalgic', 'heartbreak', 'spiritual'];
//     const genreCategories = ['rap', 'pop', 'classical', 'lo-fi'];

//     return (
//         <div className="main-screen">
//             {showWelcome && user && <div className="welcome-overlay">Welcome, {user.fullName.split(' ')[0]}!</div>}
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
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
//     const { setSelectedSong, setIsPlaying } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistSongIds, loadingPlaylists } = usePlaylist();
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [loadingSearch, setLoadingSearch] = useState(false);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const token = localStorage.getItem('token');

//     const debouncedSearch = useMemo(() => {
//         let timeoutId;
//         return (query) => {
//             clearTimeout(timeoutId);
//             timeoutId = setTimeout(async () => {
//                 setLoadingSearch(true);
//                 try {
//                     let url = 'https://music-backend-akb5.onrender.com/api/songs';
//                     if (query.trim()) {
//                         url += `?search=${encodeURIComponent(query.trim())}`;
//                     }
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

//     const handleAddToPlaylist = (songId) => {
//         setSongToAdd(songId);
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         const result = await addToPlaylist(songToAdd, playlistId);
//         setAddMessage(result.message);
//         if (result.success) {
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setSongToAdd(null);
//             }, 1000);
//         }
//     };

//     return (
//         <div className="search-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//                 <h2>Search Songs</h2>
//                 <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="search-input-field"
//                     placeholder="Search by title, singer, mood, genre, movie..."
//                     autoFocus
//                 />
//                 <div className="search-results-section">
//                     {loadingSearch ? (
//                         <div className="search-message">Searching...</div>
//                     ) : searchResults.length > 0 ? (
//                         <SongList
//                             songs={searchResults}
//                             onSongClick={(song) => {
//                                 setSelectedSong({ ...song, songList: searchResults });
//                                 setIsPlaying(true);
//                             }}
//                             onAddToPlaylist={handleAddToPlaylist}
//                             playlistSongIds={playlistSongIds}
//                         />
//                     ) : searchQuery.trim() ? (
//                         <div className="search-message animate-fade-in-out">No songs found.</div>
//                     ) : null}
//                 </div>
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

// function PlaylistDetailScreen() {
//     const { playlistId } = useParams();
//     const { setSelectedSong, setIsPlaying } = useMusicPlayer();
//     const { playlists, removeSongFromPlaylist, updatePlaylistName, loadingPlaylists } = usePlaylist();
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const playlist = useMemo(() => playlists.find((p) => p._id === playlistId), [playlists, playlistId]);

//     const handleRemoveSong = async (songId) => {
//         if (!window.confirm('Are you sure?')) return;
//         const result = await removeSongFromPlaylist(songId, playlistId);
//         setMessage(result.message);
//         setTimeout(() => setMessage(''), 2000);
//     };

//     const handleEditPlaylist = async () => {
//         const newName = prompt('Enter new playlist name:', playlist.name);
//         if (newName?.trim() && newName !== playlist.name) {
//             const result = await updatePlaylistName(playlistId, newName.trim());
//             setMessage(result.message);
//             setTimeout(() => setMessage(''), 2000);
//         }
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
//                 {playlist.songs?.length > 0 ? (
//                     <div className="songs-column">
//                         {playlist.songs.map((song) => (
//                             <div
//                                 key={song._id}
//                                 className="song-card full-line"
//                                 onClick={() => {
//                                     setSelectedSong({ ...song, songList: playlist.songs });
//                                     setIsPlaying(true);
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
//     const { setSelectedSong, setIsPlaying } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistSongIds, loadingPlaylists } = usePlaylist();
//     const [songs, setSongs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const token = localStorage.getItem('token');
//     const [randomMessage, setRandomMessage] = useState('');

//     const loveMessages = [
//         "Every note carries a heartbeat — feel the love.",
//         "From crushes to soulmates, let love sing its story.",
//         "In love? Then you're in the perfect rhythm.",
//         "Let the melodies say what words can’t."
//     ];
//     const happyMessages = [
//         "Turn up the joy — today feels just right.",
//         "Let your smile be the rhythm, and your day the dance.",
//         "Sunshine in your soul deserves a soundtrack.",
//         "Catchy beats for brighter moods — happiness starts here!"
//     ];
//     const sadMessages = [
//         "It’s okay to feel — let the music hold you gently.",
//         "Even rainy hearts find comfort in a song.",
//         "Every tear writes a verse — let it play out.",
//         "Healing begins when you listen with your soul."
//     ];
//     const motivationalMessages = [
//         "Fuel your fire. Let every beat push you further.",
//         "Hustle harder, with the sound of strength.",
//         "When you feel like quitting, play one more track.",
//         "Rise. Grind. Repeat. With power in every note."
//     ];
//     const nostalgicMessages = [
//         "A melody can take you back in time.",
//         "Old songs, golden memories.",
//         "Feelings you forgot, brought back in a beat.",
//         "Rewind the vibes — relive the magic."
//     ];
//     const heartbreakMessages = [
//         "Some songs just understand — let them.",
//         "Pieces may fall, but the music still flows.",
//         "It hurts — and that’s okay. Let each beat mend you.",
//         "Even broken hearts have beautiful soundtracks."
//     ];
//     const spiritualMessages = [
//         "Find peace in every chord.",
//         "Let the music guide your soul to serenity.",
//         "Harmony that lifts your spirit.",
//         "Transcend with every note."
//     ];
//     const calmMessages = [
//         "Breathe easy with soothing tunes.",
//         "Let tranquility flow through the melody.",
//         "Peaceful rhythms for a quiet mind.",
//         "Relax into the gentle beat."
//     ];

//     useEffect(() => {
//         const messageMap = {
//             love: loveMessages,
//             happy: happyMessages,
//             sad: sadMessages,
//             motivational: motivationalMessages,
//             nostalgic: nostalgicMessages,
//             heartbreak: heartbreakMessages,
//             spiritual: spiritualMessages,
//             calm: calmMessages,
//         };
//         const messages = messageMap[name] || [];
//         if (messages.length > 0 && songs.length > 0) {
//             const randomIndex = Math.floor(Math.random() * messages.length);
//             setRandomMessage(messages[randomIndex]);
//             const fadeOutTimer = setTimeout(() => setRandomMessage(''), 4000);
//             return () => clearTimeout(fadeOutTimer);
//         }
//     }, [name, songs]);

//     useEffect(() => {
//         setLoading(true);
//         axios
//             .get(`https://music-backend-akb5.onrender.com/api/songs?${categoryType}=${name}`, { headers: { Authorization: `Bearer ${token}` } })
//             .then((res) => setSongs(res.data))
//             .catch((err) => console.error(err))
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
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setSongToAdd(null);
//             }, 1000);
//         }
//     };

//     return (
//         <div className="mood-songs-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//                 <h2>{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>
//                 {randomMessage && <div className="random-message animate-fade-in-out">{randomMessage}</div>}
//                 {loading ? (
//                     <div className="loading"><div></div></div>
//                 ) : songs.length > 0 ? (
//                     <SongList
//                         songs={songs}
//                         onSongClick={(song) => {
//                             setSelectedSong({ ...song, songList: songs });
//                             setIsPlaying(true);
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
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//     const handleEditProfile = async () => {
//         const newFullName = prompt('Enter your new full name:', user.fullName);
//         if (newFullName?.trim() && newFullName !== user.fullName) {
//             const result = await updateUser({ fullName: newFullName.trim() });
//             setMessage(result.message);
//             setTimeout(() => setMessage(''), 3000);
//         }
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
//                 {loading ? (
//                     <p>Loading profile...</p>
//                 ) : user ? (
//                     <>
//                         <p><strong>Full Name:</strong> {user.fullName}</p>
//                         <p><strong>Email:</strong> {user.email}</p>
//                         <p><strong>Join Date:</strong> {user.joinDate instanceof Date ? user.joinDate.toLocaleDateString() : 'N/A'}</p>
//                     </>
//                 ) : (
//                     <p>User data not available.</p>
//                 )}
//             </div>
//             <MusicPlayer />
//         </div>
//     );
// }

// // --- Main App Component ---

// function App() {
//     return (
//         <Router>
//             <AuthProvider>
//                 <MusicPlayerProvider>
//                     <PlaylistProvider>
//                         <Routes>
//                             <Route path="/" element={<SplashScreen />} />
//                             <Route path="/login" element={<AuthScreen />} />
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

// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { fas } from '@fortawesome/free-solid-svg-icons';
// import { library } from '@fortawesome/fontawesome-svg-core';
// library.add(fas);

// // --- Music Player Context ---
// const MusicPlayerContext = React.createContext();

// function MusicPlayerProvider({ children }) {
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [volume, setVolume] = useState(0.5);
//     const [isMinimized, setIsMinimized] = useState(false);
//     const [currentSongIndex, setCurrentSongIndex] = useState(0);
//     const audioRef = useRef(null);

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
//     }, [selectedSong?._id, selectedSong?.audioUrl, isPlaying, volume]);

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
//     return React.useContext(MusicPlayerContext);
// }

// // --- Auth Context ---
// const AuthContext = React.createContext();

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
//             } catch (error) {
//                 console.error('Auth error:', error);
//                 localStorage.removeItem('token');
//                 delete axios.defaults.headers.common['Authorization'];
//                 setUser(null);
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
//             const res = await axios.put('https://music-backend-akb5.onrender.com/api/user/profile', userData, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             setUser(processUserData(res.data));
//             return { success: true, message: 'Profile updated successfully!' };
//         } catch (error) {
//             console.error('Failed to update profile:', error);
//             return { success: false, message: error.response?.data?.message || 'Failed to update profile.' };
//         }
//     };

//     return (
//         <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }

// function useAuth() {
//     return React.useContext(AuthContext);
// }

// // --- Playlist Context ---
// const PlaylistContext = React.createContext();

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
//     return React.useContext(PlaylistContext);
// }

// function ProtectedRoute({ children }) {
//     const { user, loading } = useAuth();
//     if (loading) return <div className="loading"><div></div></div>;
//     if (!user) return <Navigate to="/login" replace />;
//     return children;
// }

// // --- Components ---

// function SplashScreen() {
//     const navigate = useNavigate();
//     useEffect(() => {
//         const timer = setTimeout(() => navigate('/login'), 3000);
//         return () => clearTimeout(timer);
//     }, [navigate]);
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
//     const [loading, setLoading] = useState(false);
//     const { login } = useAuth();
//     const navigate = useNavigate();
//     const [message, setMessage] = useState('');

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage('');
//         try {
//             const endpoint = isLogin ? 'https://music-backend-akb5.onrender.com/api/auth/login' : 'https://music-backend-akb5.onrender.com/api/auth/register';
//             const data = isLogin ? { email, password } : { fullName, email, password };
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
//                 {!isLogin && <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required />}
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
//             <a href="/" onClick={(e) => { e.preventDefault(); navigate('/account'); onClose(); }}>Account</a>
//             <div className="sidebar-item-with-dropdown">
//                 <a href="/" onClick={(e) => { e.preventDefault(); setShowModeDropdown((prev) => !prev); }}>Mode</a>
//                 {showModeDropdown && (
//                     <div className="mode-dropdown">
//                         <span onClick={() => { setMode('dark'); setShowModeDropdown(false); }}>Dark</span>
//                         <span onClick={() => { setMode('light'); setShowModeDropdown(false); }}>Light</span>
//                         <span onClick={() => { setMode('neon'); setShowModeDropdown(false); }}>Neon</span>
//                     </div>
//                 )}
//             </div>
//             <a href="/" onClick={(e) => { e.preventDefault(); setShowPlaylistDropdown(!showPlaylistDropdown); }}>Playlist</a>
//             {showPlaylistDropdown && (
//                 <div className="playlist-dropdown">
//                     {loadingPlaylists ? <span>Loading...</span> : <>
//                         {playlists.map(playlist => <span key={playlist._id} onClick={() => { navigate(`/playlist/${playlist._id}`); onClose(); }}>{playlist.name}</span>)}
//                         <span onClick={handleCreatePlaylist} className="create-playlist"><FontAwesomeIcon icon="fa-plus" /> Create New</span>
//                     </>}
//                 </div>
//             )}
//             {user && <a href="/" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>}
//         </div>
//     );
// }

// function MusicPlayer() {
//     const { selectedSong, setSelectedSong, isPlaying, setIsPlaying, currentTime, setCurrentTime, volume, setVolume, isMinimized, setIsMinimized, currentSongIndex, audioRef } = useMusicPlayer();
//     if (!selectedSong) return null;

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

//     return (
//         <div className={`music-player ${isMinimized ? 'minimized' : ''}`}>
//             <button className="close-player-button" onClick={() => setSelectedSong(null)}>✖</button>
//             <div className="player-content">
//                 <img
//                     src={selectedSong.thumbnailUrl || 'https://placehold.co/100x100'}
//                     alt={selectedSong.title}
//                     className="player-thumbnail"
//                     loading="lazy"
//                 />
//                 <div className="song-info">
//                     <h4 title={selectedSong.title}>{selectedSong.title}</h4>
//                     <p title={selectedSong.singer}>{selectedSong.singer}</p>
//                 </div>
//                 {!isMinimized && (
//                     <div className="controls">
//                         <div className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</div>
//                         <input
//                             type="range"
//                             min="0"
//                             max="100"
//                             value={duration ? (currentTime / duration) * 100 : 0}
//                             onChange={handleTimeDrag}
//                             className="progress-bar"
//                         />
//                         <div className="player-buttons">
//                             <button onClick={() => changeSong(-1)}><FontAwesomeIcon icon="fa-step-backward" /></button>
//                             <button onClick={togglePlay}><FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} /></button>
//                             <button onClick={() => changeSong(1)}><FontAwesomeIcon icon="fa-step-forward" /></button>
//                             <input
//                                 type="range"
//                                 min="0"
//                                 max="1"
//                                 step="0.1"
//                                 value={volume}
//                                 onChange={(e) => setVolume(parseFloat(e.target.value))}
//                                 className="volume-slider"
//                             />
//                         </div>
//                     </div>
//                 )}
//             </div>
//             <button className="minimize-player-button" onClick={() => setIsMinimized(!isMinimized)}>
//                 <FontAwesomeIcon icon={isMinimized ? 'fa-chevron-up' : 'fa-chevron-down'} />
//             </button>
//         </div>
//     );
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
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [showWelcome, setShowWelcome] = useState(false);

//     useEffect(() => {
//         if (sessionStorage.getItem('showWelcome')) {
//             setShowWelcome(true);
//             const timer = setTimeout(() => {
//                 setShowWelcome(false);
//                 sessionStorage.removeItem('showWelcome');
//             }, 3000);
//             return () => clearTimeout(timer);
//         }
//     }, [user]);

//     const navigate = useNavigate();
//     const moodCategories = ['happy', 'sad', 'love', 'calm', 'motivational', 'nostalgic', 'heartbreak', 'spiritual', 'travel'];
//     const genreCategories = ['rap', 'pop', 'classical', 'lo-fi'];

//     return (
//         <div className="main-screen">
//             {showWelcome && user && <div className="welcome-overlay">Welcome, {user.fullName.split(' ')[0]}!</div>}
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
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
//     const { setSelectedSong, setIsPlaying } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistSongIds, loadingPlaylists } = usePlaylist();
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [loadingSearch, setLoadingSearch] = useState(false);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const token = localStorage.getItem('token');

//     const debouncedSearch = useMemo(() => {
//         let timeoutId;
//         return (query) => {
//             clearTimeout(timeoutId);
//             timeoutId = setTimeout(async () => {
//                 setLoadingSearch(true);
//                 try {
//                     let url = 'https://music-backend-akb5.onrender.com/api/songs';
//                     if (query.trim()) {
//                         url += `?search=${encodeURIComponent(query.trim())}`;
//                     }
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

//     const handleAddToPlaylist = (songId) => {
//         setSongToAdd(songId);
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         const result = await addToPlaylist(songToAdd, playlistId);
//         setAddMessage(result.message);
//         if (result.success) {
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setSongToAdd(null);
//             }, 1000);
//         }
//     };

//     return (
//         <div className="search-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//                 <h2>Search Songs</h2>
//                 <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="search-input-field"
//                     placeholder="Search by title, singer, mood, genre, movie..."
//                     autoFocus
//                 />
//                 <div className="search-results-section">
//                     {loadingSearch ? (
//                         <div className="search-message">Searching...</div>
//                     ) : searchResults.length > 0 ? (
//                         <SongList
//                             songs={searchResults}
//                             onSongClick={(song) => {
//                                 setSelectedSong({ ...song, songList: searchResults });
//                                 setIsPlaying(true);
//                             }}
//                             onAddToPlaylist={handleAddToPlaylist}
//                             playlistSongIds={playlistSongIds}
//                         />
//                     ) : searchQuery.trim() ? (
//                         <div className="search-message animate-fade-in-out">No songs found.</div>
//                     ) : null}
//                 </div>
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

// function PlaylistDetailScreen() {
//     const { playlistId } = useParams();
//     const { setSelectedSong, setIsPlaying } = useMusicPlayer();
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
//     const { setSelectedSong, setIsPlaying } = useMusicPlayer();
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

//     const loveMessages = [
//         "Every note carries a heartbeat — feel the love.",
//         "From crushes to soulmates, let love sing its story.",
//         "In love? Then you're in the perfect rhythm.",
//         "Let the melodies say what words can’t."
//     ];
//     const travelMessages = [
//         "Hit the road with the perfect travel tunes.",
//         "Let music guide your journey across the world.",
//         "Wanderlust vibes in every beat.",
//         "Songs to fuel your next adventure!"
//     ];
//     const happyMessages = [
//         "Turn up the joy — today feels just right.",
//         "Let your smile be the rhythm, and your day the dance.",
//         "Sunshine in your soul deserves a soundtrack.",
//         "Catchy beats for brighter moods — happiness starts here!"
//     ];
//     const sadMessages = [
//         "It’s okay to feel — let the music hold you gently.",
//         "Even rainy hearts find comfort in a song.",
//         "Every tear writes a verse — let it play out.",
//         "Healing begins when you listen with your soul."
//     ];
//     const motivationalMessages = [
//         "Fuel your fire. Let every beat push you further.",
//         "Hustle harder, with the sound of strength.",
//         "When you feel like quitting, play one more track.",
//         "Rise. Grind. Repeat. With power in every note."
//     ];
//     const nostalgicMessages = [
//         "A melody can take you back in time.",
//         "Old songs, golden memories.",
//         "Feelings you forgot, brought back in a beat.",
//         "Rewind the vibes — relive the magic."
//     ];
//     const heartbreakMessages = [
//         "Some songs just understand — let them.",
//         "Pieces may fall, but the music still flows.",
//         "It hurts — and that’s okay. Let each beat mend you.",
//         "Even broken hearts have beautiful soundtracks."
//     ];
//     const spiritualMessages = [
//         "Find peace in every chord.",
//         "Let the music guide your soul to serenity.",
//         "Harmony that lifts your spirit.",
//         "Transcend with every note."
//     ];
//     const calmMessages = [
//         "Breathe easy with soothing tunes.",
//         "Let tranquility flow through the melody.",
//         "Peaceful rhythms for a quiet mind.",
//         "Relax into the gentle beat."
//     ];

//     useEffect(() => {
//         console.log(`Fetching songs for ${categoryType}: ${name}, Token: ${token}`);
//         const messageMap = {
//             love: loveMessages,
//             travel: travelMessages,
//             happy: happyMessages,
//             sad: sadMessages,
//             motivational: motivationalMessages,
//             nostalgic: nostalgicMessages,
//             heartbreak: heartbreakMessages,
//             spiritual: spiritualMessages,
//             calm: calmMessages,
//         };
//         const messages = messageMap[name] || [];
//         if (messages.length > 0 && songs.length > 0) {
//             const randomIndex = Math.floor(Math.random() * messages.length);
//             setRandomMessage(messages[randomIndex]);
//             const fadeOutTimer = setTimeout(() => setRandomMessage(''), 4000);
//             return () => clearTimeout(fadeOutTimer);
//         }
//     }, [name, songs]);

//     useEffect(() => {
//         setLoading(true);
//         setError(null);
//         let url = `https://music-backend-akb5.onrender.com/api/songs?${categoryType}=${encodeURIComponent(name)}`;
//         console.log(`API Call URL: ${url}`);
//         axios
//             .get(url, {
//                 headers: { Authorization: `Bearer ${token}` },
//             })
//             .then((res) => {
//                 console.log(`API Response:`, res.data);
//                 if (Array.isArray(res.data)) {
//                     setSongs(res.data);
//                 } else {
//                     setSongs([]);
//                     setError('Invalid data format from server');
//                 }
//             })
//             .catch((err) => {
//                 console.error(`API Error:`, err.response ? err.response.data : err.message);
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
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setSongToAdd(null);
//             }, 1000);
//         }
//     };

//     return (
//         <div className="mood-songs-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//                 <h2>{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>
//                 {randomMessage && <div className="random-message animate-fade-in-out">{randomMessage}</div>}
//                 {loading ? (
//                     <div className="loading"><div></div></div>
//                 ) : error ? (
//                     <div className="search-message animate-fade-in-out">{error}</div>
//                 ) : songs.length > 0 ? (
//                     <SongList
//                         songs={songs}
//                         onSongClick={(song) => {
//                             setSelectedSong({ ...song, songList: songs });
//                             setIsPlaying(true);
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
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [editProfileOpen, setEditProfileOpen] = useState(false);
//     const [newFullName, setNewFullName] = useState('');

//     const handleEditProfile = async () => {
//         setEditProfileOpen(true);
//         setNewFullName(user.fullName);
//     };

//     const saveProfile = async () => {
//         if (newFullName.trim() && newFullName !== user.fullName) {
//             const result = await updateUser({ fullName: newFullName.trim() });
//             setMessage(result.message);
//             setTimeout(() => setMessage(''), 3000);
//         }
//         setEditProfileOpen(false);
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
//                             />
//                             <button onClick={saveProfile}>Save</button>
//                             <button onClick={() => setEditProfileOpen(false)}>Cancel</button>
//                         </div>
//                     </div>
//                 )}
//                 {loading ? (
//                     <p>Loading profile...</p>
//                 ) : user ? (
//                     <>
//                         <p><strong>Full Name:</strong> {user.fullName}</p>
//                         <p><strong>Email:</strong> {user.email}</p>
//                         <p><strong>Join Date:</strong> {user.joinDate instanceof Date ? user.joinDate.toLocaleDateString() : 'N/A'}</p>
//                     </>
//                 ) : (
//                     <p>User data not available.</p>
//                 )}
//             </div>
//             <MusicPlayer />
//         </div>
//     );
// }

// // --- Main App Component ---

// function App() {
//     return (
//         <Router>
//             <AuthProvider>
//                 <MusicPlayerProvider>
//                     <PlaylistProvider>
//                         <Routes>
//                             <Route path="/" element={<SplashScreen />} />
//                             <Route path="/login" element={<AuthScreen />} />
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


// import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { fas } from '@fortawesome/free-solid-svg-icons';
// import { library } from '@fortawesome/fontawesome-svg-core';
// library.add(fas);

// // --- Music Player Context ---
// const MusicPlayerContext = createContext();

// function MusicPlayerProvider({ children }) {
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [volume, setVolume] = useState(0.5);
//     const [isMinimized, setIsMinimized] = useState(false);
//     const [currentSongIndex, setCurrentSongIndex] = useState(0);
//     const audioRef = useRef(null);

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
//     }, [selectedSong?._id, selectedSong?.audioUrl, isPlaying, volume]);

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
//             // Create a new Date object to ensure React detects the state change properly
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
//             } catch (error) {
//                 console.error('Auth error:', error);
//                 localStorage.removeItem('token');
//                 delete axios.defaults.headers.common['Authorization'];
//                 setUser(null);
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
//         sessionStorage.setItem('showhttps://music-backend-akb5.onrender.com', 'true');
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
//             const res = await axios.put('https://music-backend-akb5.onrender.com/api/user/profile', userData, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             setUser(processUserData(res.data)); // Update user state after successful update
//             return { success: true, message: 'Profile updated successfully!' };
//         } catch (error) {
//             console.error('Failed to update profile:', error);
//             return { success: false, message: error.response?.data?.message || 'Failed to update profile.' };
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

// function ProtectedRoute({ children }) {
//     const { user, loading } = useAuth();
//     if (loading) return <div className="loading"><div></div></div>;
//     if (!user) return <Navigate to="/login" replace />;
//     return children;
// }

// // --- Components ---

// function SplashScreen() {
//     const navigate = useNavigate();
//     useEffect(() => {
//         const timer = setTimeout(() => navigate('/login'), 3000);
//         return () => clearTimeout(timer);
//     }, [navigate]);
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
//     const [loading, setLoading] = useState(false);
//     const { login } = useAuth();
//     const navigate = useNavigate();
//     const [message, setMessage] = useState('');

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage('');
//         try {
//             const endpoint = isLogin ? 'https://music-backend-akb5.onrender.com/api/auth/login' : 'https://music-backend-akb5.onrender.com/api/auth/register';
//             const data = isLogin ? { email, password } : { fullName, email, password };
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
//                 {!isLogin && <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required />}
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
//     const { selectedSong, setSelectedSong, isPlaying, setIsPlaying, currentTime, setCurrentTime, volume, setVolume, isMinimized, setIsMinimized, currentSongIndex, audioRef } = useMusicPlayer();
//     if (!selectedSong) return null;

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

//     return (
//         <div className={`music-player ${isMinimized ? 'minimized' : ''}`}>
//             <button className="close-player-button" onClick={() => setSelectedSong(null)}>✖</button>
//             <div className="player-content">
//                 <img
//                     src={selectedSong.thumbnailUrl || 'https://placehold.co/100x100'}
//                     alt={selectedSong.title}
//                     className="player-thumbnail"
//                     loading="lazy"
//                 />
//                 <div className="song-info">
//                     <h4 title={selectedSong.title}>{selectedSong.title}</h4>
//                     <p title={selectedSong.singer}>{selectedSong.singer}</p>
//                 </div>
//                 {!isMinimized && (
//                     <div className="controls">
//                         <div className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</div>
//                         <input
//                             type="range"
//                             min="0"
//                             max="100"
//                             value={duration ? (currentTime / duration) * 100 : 0}
//                             onChange={handleTimeDrag}
//                             className="progress-bar"
//                         />
//                         <div className="player-buttons">
//                             <button onClick={() => changeSong(-1)}><FontAwesomeIcon icon="fa-step-backward" /></button>
// <button onClick={togglePlay}><FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} /></button>
//                             <button onClick={() => changeSong(1)}><FontAwesomeIcon icon="fa-step-forward" /></button>
                            
//                             <input
//                                 type="range"
//                                 min="0"
//                                 max="1"
//                                 step="0.1"
//                                 value={volume}
//                                 onChange={(e) => setVolume(parseFloat(e.target.value))}
//                                 className="volume-slider"
//                             />
//                         </div>
//                     </div>
//                 )}
//             </div>
//             <button className="minimize-player-button" onClick={() => setIsMinimized(!isMinimized)}>
//                 <FontAwesomeIcon icon={isMinimized ? 'fa-chevron-up' : 'fa-chevron-down'} />
//             </button>
//         </div>
//     );
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
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [showWelcome, setShowWelcome] = useState(false);
    
//     useEffect(() => {
//         if (sessionStorage.getItem('showWelcome')) {
//             setShowWelcome(true);
//             const timer = setTimeout(() => {
//                 setShowWelcome(false);
//                 sessionStorage.removeItem('showWelcome');
//             }, 3000);
//             return () => clearTimeout(timer);
//         }
//     }, [user]);

//     const navigate = useNavigate();
//     const moodCategories = ['happy', 'sad', 'love', 'motivational', 'nostalgic', 'heartbreak', 'spiritual', 'travel'];
//     const genreCategories = ['rap', 'party', 'classical', 'lo-fi'];

//     return (
//         <div className="main-screen">
//             {showWelcome && user && <div className="welcome-overlay">Welcome, {user.fullName.split(' ')[0]}!</div>}
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
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
//     const { setSelectedSong, setIsPlaying } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistSongIds, loadingPlaylists } = usePlaylist();
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [loadingSearch, setLoadingSearch] = useState(false);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const token = localStorage.getItem('token');

//     const debouncedSearch = useMemo(() => {
//         let timeoutId;
//         return (query) => {
//             clearTimeout(timeoutId);
//             timeoutId = setTimeout(async () => {
//                 setLoadingSearch(true);
//                 try {
//                     let url = 'https://music-backend-akb5.onrender.com/api/songs';
//                     if (query.trim()) {
//                         url += `?search=${encodeURIComponent(query.trim())}`;
//                     }
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

//     const handleAddToPlaylist = (songId) => {
//         setSongToAdd(songId);
//         setShowPlaylistModal(true);
//         setAddMessage('');
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         const result = await addToPlaylist(songToAdd, playlistId);
//         setAddMessage(result.message);
//         if (result.success) {
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setSongToAdd(null);
//             }, 1000);
//         }
//     };

//     return (
//         <div className="search-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//                 <h2>Search Songs</h2>
//                 <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="search-input-field"
//                     placeholder="Search by title, singer, mood, genre, movie..."
//                     autoFocus
//                 />
//                 <div className="search-results-section">
//                     {loadingSearch ? (
//                         <div className="search-message">Searching...</div>
//                     ) : searchResults.length > 0 ? (
//                         <SongList
//                             songs={searchResults}
//                             onSongClick={(song) => {
//                                 setSelectedSong({ ...song, songList: searchResults });
//                                 setIsPlaying(true);
//                             }}
//                             onAddToPlaylist={handleAddToPlaylist}
//                             playlistSongIds={playlistSongIds}
//                         />
//                     ) : searchQuery.trim() ? (
//                         <div className="search-message animate-fade-in-out">No songs found.</div>
//                     ) : null}
//                 </div>
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

// function PlaylistDetailScreen() {
//     const { playlistId } = useParams();
//     const { setSelectedSong, setIsPlaying } = useMusicPlayer();
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
//     const { setSelectedSong, setIsPlaying } = useMusicPlayer();
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

//     const loveMessages = [
//         "Every note carries a heartbeat — feel the love.",
//         "From crushes to soulmates, let love sing its story.",
//         "In love? Then you're in the perfect rhythm.",
//         "Let the melodies say what words can’t."
//     ];
//     const travelMessages = [
//         "Hit the road with the perfect travel tunes.",
//         "Let music guide your journey across the world.",
//         "Wanderlust vibes in every beat.",
//         "Songs to fuel your next adventure!"
//     ];
//     const happyMessages = [
//         "Turn up the joy — today feels just right.",
//         "Let your smile be the rhythm, and your day the dance.",
//         "Sunshine in your soul deserves a soundtrack.",
//         "Catchy beats for brighter moods — happiness starts here!"
//     ];
//     const sadMessages = [
//         "It’s okay to feel — let the music hold you gently.",
//         "Even rainy hearts find comfort in a song.",
//         "Every tear writes a verse — let it play out.",
//         "Healing begins when you listen with your soul."
//     ];
//     const motivationalMessages = [
//         "Fuel your fire. Let every beat push you further.",
//         "Hustle harder, with the sound of strength.",
//         "When you feel like quitting, play one more track.",
//         "Rise. Grind. Repeat. With power in every note."
//     ];
//     const nostalgicMessages = [
//         "A melody can take you back in time.",
//         "Old songs, golden memories.",
//         "Feelings you forgot, brought back in a beat.",
//         "Rewind the vibes — relive the magic."
//     ];
//     const heartbreakMessages = [
//         "Some songs just understand — let them.",
//         "Pieces may fall, but the music still flows.",
//         "It hurts — and that’s okay. Let each beat mend you.",
//         "Even broken hearts have beautiful soundtracks."
//     ];
//     const spiritualMessages = [
//         "Find peace in every chord.",
//         "Let the music guide your soul to serenity.",
//         "Harmony that lifts your spirit.",
//         "Transcend with every note."
//     ];
//     const calmMessages = [
//         "Breathe easy with soothing tunes.",
//         "Let tranquility flow through the melody.",
//         "Peaceful rhythms for a quiet mind.",
//         "Relax into the gentle beat."
//     ];

//     useEffect(() => {
//         console.log(`Fetching songs for ${categoryType}: ${name}, Token: ${token}`);
//         const messageMap = {
//             love: loveMessages,
//             travel: travelMessages,
//             happy: happyMessages,
//             sad: sadMessages,
//             motivational: motivationalMessages,
//             nostalgic: nostalgicMessages,
//             heartbreak: heartbreakMessages,
//             spiritual: spiritualMessages,
//             calm: calmMessages,
//         };
//         const messages = messageMap[name] || [];
//         if (messages.length > 0 && songs.length > 0) {
//             const randomIndex = Math.floor(Math.random() * messages.length);
//             setRandomMessage(messages[randomIndex]);
//             const fadeOutTimer = setTimeout(() => setRandomMessage(''), 4000);
//             return () => clearTimeout(fadeOutTimer);
//         }
//     }, [name, songs]);

//     useEffect(() => {
//         setLoading(true);
//         setError(null);
//         let url = `https://music-backend-akb5.onrender.com/api/songs?${categoryType}=${encodeURIComponent(name)}`;
//         console.log(`API Call URL: ${url}`);
//         axios
//             .get(url, {
//                 headers: { Authorization: `Bearer ${token}` },
//             })
//             .then((res) => {
//                 console.log(`API Response:`, res.data);
//                 if (Array.isArray(res.data)) {
//                     setSongs(res.data);
//                 } else {
//                     setSongs([]);
//                     setError('Invalid data format from server');
//                 }
//             })
//             .catch((err) => {
//                 console.error(`API Error:`, err.response ? err.response.data : err.message);
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
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setSongToAdd(null);
//             }, 1000);
//         }
//     };

//     return (
//         <div className="mood-songs-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//                 <h2>{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>
//                 {randomMessage && <div className="random-message animate-fade-in-out">{randomMessage}</div>}
//                 {loading ? (
//                     <div className="loading"><div></div></div>
//                 ) : error ? (
//                     <div className="search-message animate-fade-in-out">{error}</div>
//                 ) : songs.length > 0 ? (
//                     <SongList
//                         songs={songs}
//                         onSongClick={(song) => {
//                             setSelectedSong({ ...song, songList: songs });
//                             setIsPlaying(true);
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
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [editProfileOpen, setEditProfileOpen] = useState(false);
//     const [newFullName, setNewFullName] = useState('');

//     useEffect(() => {
//         if (user) {
//             setNewFullName(user.fullName);
//         }
//     }, [user]);
    

//     const handleEditProfile = () => {
//         setEditProfileOpen(true);
//     };

//     const saveProfile = async () => {
//         if (newFullName.trim() && newFullName !== user.fullName) {
//             const result = await updateUser({ fullName: newFullName.trim() });
//             setMessage(result.message);
//             setTimeout(() => setMessage(''), 3000);
//         } else {
//             setMessage('Full name cannot be empty or the same as current name.');
//             setTimeout(() => setMessage(''), 3000);
//         }
//         setEditProfileOpen(false);
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
//                             />
//                             <button onClick={saveProfile}>Save</button>
//                             <button onClick={() => setEditProfileOpen(false)}>Cancel</button>
//                         </div>
//                     </div>
//                 )}
//                 {loading ? (
//                     <p>Loading profile...</p>
//                 ) : user ? (
//                     <>
//                         <p><strong>Full Name:</strong> {user.fullName}</p>
//                         <p><strong>Email:</strong> {user.email}</p>
//                         {/* <p>
//                             <strong>Join Date:</strong>{' '}
//                             {user.joinDate instanceof Date && !isNaN(user.joinDate)
//                                 ? user.joinDate.toLocaleDateString()
//                                 : 'N/A'}
//                         </p> */}
//                     </>
//                 ) : (
//                     <p>User data not available.</p>
//                 )}
//             </div>
//             <MusicPlayer />
//         </div>
//     );
// }

// // --- Main App Component ---

// function App() {
//     return (
//         <Router>
//             <AuthProvider>
//                 <MusicPlayerProvider>
//                     <PlaylistProvider>
//                         <Routes>
//                             <Route path="/" element={<SplashScreen />} />
//                             <Route path="/login" element={<AuthScreen />} />
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
library.add(fas);

// --- Music Player Context ---
const MusicPlayerContext = createContext();

function MusicPlayerProvider({ children }) {
    const [selectedSong, setSelectedSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isMinimized, setIsMinimized] = useState(true); // Start minimized
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const audioRef = useRef(null);

    // Effect to handle maximizing the player when a new song is selected
    useEffect(() => {
        if (selectedSong) {
            setIsMinimized(false);
        }
    }, [selectedSong?._id]);

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
    }, [selectedSong?._id, selectedSong?.audioUrl, isPlaying, volume]);

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
            } catch (error) {
                console.error('Auth error:', error);
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
                setUser(null);
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
            const res = await axios.put('https://music-backend-akb5.onrender.com/api/user/profile', userData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(processUserData(res.data));
            return { success: true, message: 'Profile updated successfully!' };
        } catch (error) {
            console.error('Failed to update profile:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to update profile.' };
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
            await axios.post('https://music-backend-akb5.onrender.com/api/playlists', { name }, { headers: { Authorization: `Bearer ${token}` } });
            await fetchPlaylists();
        } catch (error) {
            console.error('Failed to create playlist:', error);
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

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading"><div></div></div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

// --- Components ---

function SplashScreen() {
    const navigate = useNavigate();
    useEffect(() => {
        const timer = setTimeout(() => navigate('/login'), 3000);
        return () => clearTimeout(timer);
    }, [navigate]);
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
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const endpoint = isLogin ? 'https://music-backend-akb5.onrender.com/api/auth/login' : 'https://music-backend-akb5.onrender.com/api/auth/register';
            const data = isLogin ? { email, password } : { fullName, email, password };
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
                {!isLogin && <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required />}
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

function Sidebar({ isOpen, onClose }) {
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
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                onClose();
                setShowModeDropdown(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

    const handleCreatePlaylist = () => {
        const playlistName = prompt('Enter playlist name:');
        if (playlistName?.trim()) createPlaylist(playlistName.trim());
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
                    {loadingPlaylists ? <span>Loading...</span> : <>
                        {playlists.map(playlist => <span key={playlist._id} onClick={() => { navigate(`/playlist/${playlist._id}`); onClose(); }}>{playlist.name}</span>)}
                        <span onClick={handleCreatePlaylist} className="create-playlist"><FontAwesomeIcon icon="fa-plus" /> Create New</span>
                    </>}
                </div>
            )}
            {user && <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>}
        </div>
    );
}

function MusicPlayer() {
    const { selectedSong, setSelectedSong, isPlaying, setIsPlaying, currentTime, setCurrentTime, volume, setVolume, isMinimized, setIsMinimized, currentSongIndex, audioRef } = useMusicPlayer();
    if (!selectedSong) return null;

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
        <div
            className={`music-player ${isMinimized ? 'minimized' : ''}`}
            onClick={() => setIsMinimized(!isMinimized)}
        >
            <button
                className="close-player-button"
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSong(null);
                }}
            >
                ✖
            </button>
            <div
                className="player-content"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={selectedSong.thumbnailUrl || 'https://placehold.co/100x100'}
                    alt={selectedSong.title}
                    className="player-thumbnail"
                    loading="lazy"
                />
                <div className="song-info">
                    <h4 title={selectedSong.title}>{selectedSong.title}</h4>
                    <p title={selectedSong.singer}>{selectedSong.singer}</p>
                </div>
                {!isMinimized && (
                    <div className="controls">
                        <div className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={duration ? (currentTime / duration) * 100 : 0}
                            onChange={handleTimeDrag}
                            className="progress-bar"
                        />
                        <div className="player-buttons">
                            <button onClick={() => changeSong(-1)}><FontAwesomeIcon icon="fa-step-backward" /></button>
                            <button onClick={togglePlay}><FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} /></button>
                            <button onClick={() => changeSong(1)}><FontAwesomeIcon icon="fa-step-forward" /></button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="volume-slider"
                            />
                        </div>
                    </div>
                )}
            </div>
            <button
                className="minimize-player-button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                }}
            >
                <FontAwesomeIcon icon={isMinimized ? 'fa-chevron-up' : 'fa-chevron-down'} />
            </button>
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

function PlaylistSelectionModal({ isOpen, onClose, onSelectPlaylist, playlists, loading, message }) {
    if (!isOpen) return null;
    return (
        <div className="playlist-modal-overlay" onClick={onClose}>
            <div className="playlist-modal" onClick={(e) => e.stopPropagation()}>
                <h4>Select Playlist</h4>
                {loading ? (
                    <div>Loading...</div>
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
                    <div>No playlists found. Create one first!</div>
                )}
                {message && <div className="playlist-modal-message">{message}</div>}
                <button className="playlist-modal-cancel" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

function MainScreen() {
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
        <div className="main-screen" onClick={(e) => {
            if (!e.target.closest('.music-player')) {
                setIsMinimized(true);
            }
        }}>
            {showWelcome && user && <div className="welcome-overlay">Welcome, {user.fullName.split(' ')[0]}!</div>}
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
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

function SearchScreen() {
    const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
    const { playlists, addToPlaylist, playlistSongIds, loadingPlaylists } = usePlaylist();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [songToAdd, setSongToAdd] = useState(null);
    const [addMessage, setAddMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const token = localStorage.getItem('token');

    const debouncedSearch = useMemo(() => {
        let timeoutId;
        return (query) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(async () => {
                setLoadingSearch(true);
                try {
                    let url = 'https://music-backend-akb5.onrender.com/api/songs';
                    if (query.trim()) {
                        url += `?search=${encodeURIComponent(query.trim())}`;
                    }
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
    
    return (
        <div className="search-screen" onClick={(e) => {
            if (!e.target.closest('.music-player')) {
                setIsMinimized(true);
            }
        }}>
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="content-area">
                <h2>Search Songs</h2>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input-field"
                    placeholder="Search by title, singer, mood, genre, movie..."
                    autoFocus
                />
                <div className="search-results-section">
                    {loadingSearch ? (
                        <div className="search-message">Searching...</div>
                    ) : searchResults.length > 0 ? (
                        <SongList
                            songs={searchResults}
                            onSongClick={(song) => {
                                setSelectedSong({ ...song, songList: searchResults });
                                setIsPlaying(true);
                            }}
                            onAddToPlaylist={handleAddToPlaylist}
                            playlistSongIds={playlistSongIds}
                        />
                    ) : searchQuery.trim() ? (
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
            />
            <MusicPlayer />
        </div>
    );
}

function PlaylistDetailScreen() {
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
        <div className="playlist-detail-screen" onClick={(e) => {
            if (!e.target.closest('.music-player')) {
                setIsMinimized(true);
            }
        }}>
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
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

function CategorySongsScreen({ categoryType }) {
    const { name } = useParams();
    const { setSelectedSong, setIsPlaying, setIsMinimized } = useMusicPlayer();
    const { playlists, addToPlaylist, playlistSongIds, loadingPlaylists } = usePlaylist();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [songToAdd, setSongToAdd] = useState(null);
    const [addMessage, setAddMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const token = localStorage.getItem('token');
    const [randomMessage, setRandomMessage] = useState('');
    const [error, setError] = useState(null);

    const loveMessages = ["Every note carries a heartbeat — feel the love."];
    const travelMessages = ["Hit the road with the perfect travel tunes."];
    const happyMessages = ["Turn up the joy — today feels just right."];
    const sadMessages = ["It’s okay to feel — let the music hold you gently."];
    const motivationalMessages = ["Fuel your fire. Let every beat push you further."];
    const nostalgicMessages = ["A melody can take you back in time."];
    const heartbreakMessages = ["Some songs just understand — let them."];
    const spiritualMessages = ["Find peace in every chord."];
    const calmMessages = ["Breathe easy with soothing tunes."];
    
    useEffect(() => {
        const messageMap = {
            love: loveMessages, travel: travelMessages, happy: happyMessages, sad: sadMessages,
            motivational: motivationalMessages, nostalgic: nostalgicMessages,
            heartbreak: heartbreakMessages, spiritual: spiritualMessages, calm: calmMessages,
        };
        const messages = messageMap[name] || [];
        if (messages.length > 0 && songs.length > 0) {
            setRandomMessage(messages[Math.floor(Math.random() * messages.length)]);
            const timer = setTimeout(() => setRandomMessage(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [name, songs]);

    useEffect(() => {
        setLoading(true);
        setError(null);
        axios.get(`https://music-backend-akb5.onrender.com/api/songs?${categoryType}=${encodeURIComponent(name)}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (Array.isArray(res.data)) setSongs(res.data);
                else { setSongs([]); setError('Invalid data format'); }
            })
            .catch((err) => {
                setError(`Failed to fetch: ${err.message}`);
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

    return (
        <div className="mood-songs-screen" onClick={(e) => {
            if (!e.target.closest('.music-player')) {
                setIsMinimized(true);
            }
        }}>
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="content-area">
                <h2>{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>
                {randomMessage && <div className="random-message animate-fade-in-out">{randomMessage}</div>}
                {loading ? ( <div className="loading"><div></div></div> ) 
                : error ? ( <div className="search-message animate-fade-in-out">{error}</div> ) 
                : songs.length > 0 ? (
                    <SongList
                        songs={songs}
                        onSongClick={(song) => {
                            setSelectedSong({ ...song, songList: songs });
                            setIsPlaying(true);
                        }}
                        onAddToPlaylist={handleAddToPlaylist}
                        playlistSongIds={playlistSongIds}
                    />
                ) : (
                    <div className="search-message animate-fade-in-out">No songs found for this category.</div>
                )}
            </div>
            <PlaylistSelectionModal
                isOpen={showPlaylistModal}
                onClose={() => setShowPlaylistModal(false)}
                onSelectPlaylist={handleSelectPlaylist}
                playlists={playlists}
                loading={loadingPlaylists}
                message={addMessage}
            />
            <MusicPlayer />
        </div>
    );
}

function Account() {
    const { user, updateUser, loading } = useAuth();
    const { setIsMinimized } = useMusicPlayer();
    const [message, setMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [newFullName, setNewFullName] = useState('');

    useEffect(() => {
        if (user) { setNewFullName(user.fullName); }
    }, [user]);
    
    const handleEditProfile = () => { setEditProfileOpen(true); };

    const saveProfile = async () => {
        if (newFullName.trim() && newFullName !== user.fullName) {
            const result = await updateUser({ fullName: newFullName.trim() });
            setMessage(result.message);
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage('Full name cannot be empty or the same.');
            setTimeout(() => setMessage(''), 3000);
        }
        setEditProfileOpen(false);
    };
    
    return (
        <div className="account-screen" onClick={(e) => {
            if (!e.target.closest('.music-player')) {
                setIsMinimized(true);
            }
        }}>
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
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
                            />
                            <button onClick={saveProfile}>Save</button>
                            <button onClick={() => setEditProfileOpen(false)}>Cancel</button>
                        </div>
                    </div>
                )}
                {loading ? ( <p>Loading profile...</p> ) 
                : user ? (
                    <>
                        <p><strong>Full Name:</strong> {user.fullName}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                    </>
                ) : (
                    <p>User data not available.</p>
                )}
            </div>
            <MusicPlayer />
        </div>
    );
}

// --- Main App Component ---

function App() {
    return (
        <Router>
            <AuthProvider>
                <MusicPlayerProvider>
                    <PlaylistProvider>
                        <Routes>
                            <Route path="/" element={<SplashScreen />} />
                            <Route path="/login" element={<AuthScreen />} />
                            <Route path="/main" element={<ProtectedRoute><MainScreen /></ProtectedRoute>} />
                            <Route path="/search" element={<ProtectedRoute><SearchScreen /></ProtectedRoute>} />
                            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                            <Route path="/moods/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="mood" /></ProtectedRoute>} />
                            <Route path="/genres/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="genre" /></ProtectedRoute>} />
                            <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetailScreen /></ProtectedRoute>} />
                            <Route path="*" element={<ProtectedRoute><Navigate to="/main" replace /></ProtectedRoute>} />
                        </Routes>
                    </PlaylistProvider>
                </MusicPlayerProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
