
// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
// import axios from 'axios';

// // FontAwesome Icons
// import { library } from '@fortawesome/fontawesome-svg-core';
// import { fas } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// library.add(fas);

// // --- Auth Context ---
// const AuthContext = React.createContext();

// function AuthProvider({ children }) {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             axios.defaults.headers.Authorization = `Bearer ${token}`;
//             axios
//                 .get('https://music-backend-akb5.onrender.com/api/user/profile')
//                 .then((res) => {
//                     setUser(res.data);
//                 })
//                 .catch((error) => {
//                     console.error('Auth error:', error);
//                     localStorage.removeItem('token');
//                     setUser(null);
//                 })
//                 .finally(() => setLoading(false));
//         } else {
//             setLoading(false);
//         }
//     }, []);

//     const login = (token, userData, navigate) => {
//         localStorage.setItem('token', token);
//         axios.defaults.headers.Authorization = `Bearer ${token}`;
//         setUser(userData);
//         sessionStorage.setItem('showWelcome', 'true');
//         navigate('/main');
//     };

//     const logout = (navigate) => {
//         localStorage.removeItem('token');
//         axios.defaults.headers.Authorization = null;
//         setUser(null);
//         sessionStorage.removeItem('showWelcome');
//         navigate('/login');
//     };

//     return (
//         <AuthContext.Provider value={{ user, login, logout, loading }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }

// function useAuth() {
//     return React.useContext(AuthContext);
// }

// function ProtectedRoute({ children }) {
//     const { user, loading } = useAuth();
//     const location = useLocation();

//     if (loading) {
//         return (
//             <div className="loading">
//                 <div></div>
//             </div>
//         );
//     }

//     if (!user) {
//         return <Navigate to="/login" state={{ from: location }} replace />;
//     }

//     return children;
// }

// // --- Splash Screen ---
// function SplashScreen() {
//     const navigate = useNavigate();

//     useEffect(() => {
//         const timer = setTimeout(() => navigate('/login'), 3000);
//         return () => clearTimeout(timer);
//     }, [navigate]);

//     return (
//         <div className="splash-screen">
//             <FontAwesomeIcon icon="fa-music" size="3x" className="animate-spin" />
//             <h1>Gawana</h1>
//             <p>Loading...</p>
//         </div>
//     );
// }

// // --- Auth Screen ---
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
//             login(res.data.token, res.data.user, navigate);
//         } catch (error) {
//             console.error('Auth error:', error);
//             setMessage(isLogin ? 'Login failed: ' + (error.response?.data?.message || 'Unknown error') : 'Signup failed: ' + (error.response?.data?.message || 'Unknown error'));
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) return (
//         <div className="loading">
//             <div></div>
//         </div>
//     );

//     return (
//         <div className="auth-screen">
//             <form onSubmit={handleSubmit} className="auth-form">
//                 <h2>{isLogin ? 'Login' : 'Signup'}</h2>
//                 {!isLogin && (
//                     <input
//                         type="text"
//                         value={fullName}
//                         onChange={(e) => setFullName(e.target.value)}
//                         placeholder="Full Name"
//                         required
//                     />
//                 )}
//                 <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Email"
//                     required
//                 />
//                 <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Password"
//                     required
//                 />
//                 <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
//                 <p className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
//                     {isLogin ? 'Need an account? Signup' : 'Already have an account? Login'}
//                 </p>
//                 {message && <div className="error-message">{message}</div>}
//             </form>
//         </div>
//     );
// }

// // --- Navbar Component ---
// function Navbar({ onSearch, searchQuery, setSearchQuery, toggleSidebar }) {
//     const navigate = useNavigate();

//     return (
//         <div className="navbar">
//             <div className="navbar-logo" onClick={() => navigate('/main')}>Gawana</div>
//             <div className="navbar-right">
//                 <div
//                     className="search-box"
//                     onClick={() => {
//                         setSearchQuery(prev => (prev ? '' : 'search'));
//                         setTimeout(() => document.querySelector('.search-input')?.focus(), 0);
//                     }}
//                 >
//                     <FontAwesomeIcon icon="fa-search" />
//                 </div>
//                 <div className="sidebar-toggle" onClick={toggleSidebar}>
//                     ☰
//                 </div>
//             </div>
//         </div>
//     );
// }

// // --- Sidebar Component ---
// function Sidebar({ isOpen, onClose }) {
//     const navigate = useNavigate();
//     const { user, logout } = useAuth();
//     const sidebarRef = useRef(null);
//     const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
//     const [playlists, setPlaylists] = useState([]);
//     const [loadingPlaylists, setLoadingPlaylists] = useState(false);
//     const [showModeDropdown, setShowModeDropdown] = useState(false);
//     const [mode, setMode] = useState(localStorage.getItem('mode') || 'dark');

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//                 onClose();
//             }
//         };
//         if (isOpen) {
//             document.addEventListener('mousedown', handleClickOutside);
//         } else {
//             document.removeEventListener('mousedown', handleClickOutside);
//             setShowPlaylistDropdown(false);
//             setShowModeDropdown(false);
//         }
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [isOpen, onClose]);

//     useEffect(() => {
//         localStorage.setItem('mode', mode);
//         document.body.dataset.mode = mode;
//     }, [mode]);

//     const fetchPlaylists = useCallback(async () => {
//         setLoadingPlaylists(true);
//         try {
//             const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//             });
//             setPlaylists(res.data);
//         } catch (error) {
//             console.error('Failed to fetch playlists:', error);
//             setPlaylists([]);
//         } finally {
//             setLoadingPlaylists(false);
//         }
//     }, []);

//     const handlePlaylistClick = () => {
//         if (!showPlaylistDropdown) {
//             fetchPlaylists();
//         }
//         setShowPlaylistDropdown(!showPlaylistDropdown);
//     };

//     const handleLogout = () => {
//         logout(navigate);
//         onClose();
//     };

//     const handleAccountClick = () => {
//         navigate('/account');
//         onClose();
//     };

//     const handleModeHover = (isHovering) => {
//         setShowModeDropdown(isHovering);
//     };

//     const handleModeSelect = (mode) => {
//         setMode(mode.toLowerCase());
//         onClose();
//     };

//     const handlePlaylistNameClick = (playlistId) => {
//         navigate(`/playlist/${playlistId}`);
//         onClose();
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName) {
//             try {
//                 await axios.post('https://music-backend-akb5.onrender.com/api/playlists', { name: playlistName }, {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//                 });
//                 fetchPlaylists();
//             } catch (error) {
//                 console.error('Failed to create playlist:', error);
//             }
//         }
//     };

//     return (
//         <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
//             <a href="#" onClick={handleAccountClick}>Account</a>
//             <div
//                 className="sidebar-item-with-dropdown"
//                 onMouseEnter={() => handleModeHover(true)}
//                 onMouseLeave={() => handleModeHover(false)}
//             >
//                 <a href="#" onClick={(e) => e.preventDefault()}>Mode</a>
//                 {showModeDropdown && (
//                     <div className="mode-dropdown">
//                         <span onClick={() => handleModeSelect('Dark')}>Dark</span>
//                         <span onClick={() => handleModeSelect('Light')}>Light</span>
//                         <span onClick={() => handleModeSelect('Neon')}>Neon</span>
//                     </div>
//                 )}
//             </div>
//             <a href="#" onClick={(e) => { e.preventDefault(); handlePlaylistClick(); }}>Playlist</a>
//             {showPlaylistDropdown && (
//                 <div className="playlist-dropdown">
//                     {loadingPlaylists ? (
//                         <span>Loading playlists...</span>
//                     ) : playlists.length > 0 ? (
//                         <>
//                             {playlists.map(playlist => (
//                                 <span key={playlist._id} onClick={() => handlePlaylistNameClick(playlist._id)}>
//                                     {playlist.name}
//                                 </span>
//                             ))}
//                             <span onClick={handleCreatePlaylist} className="create-playlist">
//                                 <FontAwesomeIcon icon="fa-plus" /> Create New Playlist
//                             </span>
//                         </>
//                     ) : (
//                         <>
//                             <span>No playlists found. Create one</span>
//                             <span onClick={handleCreatePlaylist} className="create-playlist">
//                                 <FontAwesomeIcon icon="fa-plus" /> Create New Playlist
//                             </span>
//                         </>
//                     )}
//                 </div>
//             )}
//             {user && <a href="#" onClick={handleLogout}>Logout</a>}
//         </div>
//     );
// }

// function MainScreen() {
//     const { user } = useAuth();
//     const [songs, setSongs] = useState({ moods: {}, genres: {} });
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [playlistSongIds, setPlaylistSongIds] = useState([]);
//     const navigate = useNavigate();

//     const moodCategories = ['happy', 'sad', 'love', 'calm'];
//     const genreCategories = ['travel', 'party', 'rap', 'motivational', 'pop'];

//     useEffect(() => {
//         if (sessionStorage.getItem('showWelcome') === 'true' && user) {
//             setShowWelcomeMessage(true);
//             sessionStorage.removeItem('showWelcome');
//             const timer = setTimeout(() => {
//                 setShowWelcomeMessage(false);
//             }, 3000);
//             return () => clearTimeout(timer);
//         }
//     }, [user]);

//     useEffect(() => {
//         const fetchPlaylistSongs = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 const res = await axios.get(`https://music-backend-akb5.onrender.com/api/playlists`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 const allSongIds = res.data.flatMap(p => p.songs.map(s => s._id));
//                 setPlaylistSongIds(allSongIds);
//             } catch (err) {
//                 console.error('Failed to fetch playlist songs:', err);
//             }
//         };
//         fetchPlaylistSongs();
//     }, []);

//     useEffect(() => {
//         const fetchSongs = async () => {
//             setLoading(true);
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/songs', {
//                     timeout: 5000,
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//                 });
//                 const categorizedSongs = { moods: {}, genres: {} };
//                 res.data.forEach(song => {
//                     if (song.mood && moodCategories.includes(song.mood.toLowerCase())) {
//                         categorizedSongs.moods[song.mood.toLowerCase()] = categorizedSongs.moods[song.mood.toLowerCase()] || [];
//                         categorizedSongs.moods[song.mood.toLowerCase()].push(song);
//                     }
//                     if (song.genre && genreCategories.includes(song.genre.toLowerCase())) {
//                         categorizedSongs.genres[song.genre.toLowerCase()] = categorizedSongs.genres[song.genre.toLowerCase()] || [];
//                         categorizedSongs.genres[song.genre.toLowerCase()].push(song);
//                     }
//                 });
//                 setSongs(categorizedSongs);
//             } catch (error) {
//                 console.error('Fetch error:', error);
//                 setSongs({ moods: {}, genres: {} });
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchSongs();
//     }, []);

//     const debouncedSearch = useMemo(() => {
//         const debounce = (func, delay) => {
//             let timeoutId;
//             return (...args) => {
//                 clearTimeout(timeoutId);
//                 timeoutId = setTimeout(() => func(...args), delay);
//             };
//         };
//         const performSearch = async (query) => {
//             if (!query.trim()) {
//                 setSearchResults([]);
//                 return;
//             }
//             setLoading(true);
//             try {
//                 const res = await axios.get(`https://music-backend-akb5.onrender.com/api/songs?search=${encodeURIComponent(query)}`, { timeout: 5000 });
//                 setSearchResults(Array.isArray(res.data) ? res.data : []);
//             } catch (error) {
//                 console.error('Search error:', error);
//                 setSearchResults([]);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         return debounce(performSearch, 300);
//     }, []);

//     useEffect(() => {
//         debouncedSearch(searchQuery);
//     }, [searchQuery, debouncedSearch]);

//     const toggleSidebar = () => {
//         setIsSidebarOpen(!isSidebarOpen);
//     };

//     const handleSongChange = (newSong) => {
//         setSelectedSong(newSong);
//     };

//     const handleAddToPlaylist = async (songId) => {
//         setShowPlaylistModal(true);
//         setSongToAdd(songId);
//         setAddMessage('');
//         setLoadingPlaylists(true);
//         try {
//             const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//             });
//             setUserPlaylists(res.data || []);
//         } catch (err) {
//             setUserPlaylists([]);
//         } finally {
//             setLoadingPlaylists(false);
//         }
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         setAddMessage('');
//         try {
//             const playlistRes = await axios.get(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//             );
//             const currentSongs = (playlistRes.data.songs || []).map(s => s._id);
//             const updatedSongs = currentSongs.includes(songToAdd) ? currentSongs : [...currentSongs, songToAdd];
//             await axios.put(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { name: playlistRes.data.name, songs: updatedSongs },
//                 { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//             );
//             setAddMessage('Song added to playlist!');
//             setPlaylistSongIds(prev => [...prev, songToAdd]);
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setSongToAdd(null);
//                 setAddMessage('');
//             }, 1000);
//         } catch (err) {
//             setAddMessage('Failed to add song.');
//         }
//     };

//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [userPlaylists, setUserPlaylists] = useState([]);
//     const [loadingPlaylists, setLoadingPlaylists] = useState(false);
//     const [addMessage, setAddMessage] = useState('');

//     if (loading && !searchQuery) return (
//         <div className="loading">
//             <div></div>
//         </div>
//     );

//     return (
//         <div className="main-screen">
//             <Navbar
//                 onSearch={() => {}}
//                 searchQuery={searchQuery}
//                 setSearchQuery={setSearchQuery}
//                 toggleSidebar={toggleSidebar}
//             />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

//             <div className="content-area">
//                 {searchQuery && (
//                     <div className="search-overlay">
//                         <input
//                             type="text"
//                             value={searchQuery === 'search' ? '' : searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                             className="search-input"
//                             placeholder="Search songs (e.g., hum nava mere, Arijit, love, party)..."
//                             autoFocus
//                         />
//                         <div className="search-results">
//                             {searchQuery.trim() ? (
//                                 loading ? (
//                                     <div className="card empty">Searching...</div>
//                                 ) : searchResults.length > 0 ? (
//                                     <div className="songs-column">
//                                         {searchResults.map(song => (
//                                             <div key={song._id} className="song-card full-line" onClick={() => setSelectedSong({ ...song, songList: searchResults })}>
//                                                 <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
//                                                 <div className="song-details">
//                                                     <h4>{song.title}</h4>
//                                                     <p>{song.singer}</p>
//                                                     <p style={{ fontSize: '0.85rem', color: '#a78bfa', margin: 0 }}>
//                                                         {song.mood ? `Mood: ${song.mood}` : ''} {song.genre ? `| Genre: ${song.genre}` : ''} {song.movie ? `| Movie: ${song.movie}` : ''}
//                                                     </p>
//                                                 </div>
//                                                 {!playlistSongIds.includes(song._id) && (
//                                                     <button className="add-song-button" onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(song._id); }}>
//                                                         <FontAwesomeIcon icon="fa-plus" />
//                                                     </button>
//                                                 )}
//                                             </div>
//                                         ))}
//                                     </div>
//                                 ) : (
//                                     <div className="card empty">No songs found for "{searchQuery}"</div>
//                                 )
//                             ) : null}
//                         </div>
//                     </div>
//                 )}

//                 {!searchQuery && (
//                     <>
//                         {showWelcomeMessage && user && (
//                             <div className="welcome-message animate-fade-in-out">
//                                 Welcome, {user.fullName.split(' ')[0]}!
//                             </div>
//                         )}
//                         <div className="main-content">
//                             <section className="mood-section">
//                                 <h2>Moods</h2>
//                                 <div className="mood-cards">
//                                     {moodCategories.map((mood) => (
//                                         <div key={mood} className={`mood-card ${mood}`} onClick={() => navigate(`/moods/${mood}`)}>
//                                             <h3>{mood.charAt(0).toUpperCase() + mood.slice(1)}</h3>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </section>
//                             <section className="genre-section">
//                                 <h2>Genres</h2>
//                                 <div className="mood-cards">
//                                     {genreCategories.map((genre) => (
//                                         <div key={genre} className={`mood-card ${genre}`} onClick={() => navigate(`/genres/${genre}`)}>
//                                             <h3>{genre.charAt(0).toUpperCase() + genre.slice(1)}</h3>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </section>
//                         </div>
//                     </>
//                 )}
//             </div>
//             {showPlaylistModal && (
//                 <div className="playlist-modal-overlay" onClick={() => setShowPlaylistModal(false)}>
//                     <div className="playlist-modal" onClick={e => e.stopPropagation()}>
//                         <h4>Select Playlist</h4>
//                         {loadingPlaylists ? (
//                             <div>Loading...</div>
//                         ) : userPlaylists.length > 0 ? (
//                             <ul>
//                                 {userPlaylists.map(pl => (
//                                     <li key={pl._id}>
//                                         <button className="playlist-modal-btn" onClick={() => handleSelectPlaylist(pl._id)}>
//                                             {pl.name}
//                                         </button>
//                                     </li>
//                                 ))}
//                             </ul>
//                         ) : (
//                             <div>No playlists found.</div>
//                         )}
//                         {addMessage && <div className="playlist-modal-message">{addMessage}</div>}
//                         <button className="playlist-modal-cancel" onClick={() => setShowPlaylistModal(false)}>Cancel</button>
//                     </div>
//                 </div>
//             )}
//             {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} onSongChange={handleSongChange} />}
//         </div>
//     );
// }

// // --- Mood Songs Screen ---
// function MoodSongsScreen() {
//     const { moodName } = useParams();
//     const [allSongs, setAllSongs] = useState([]);
//     const [moodSongs, setMoodSongs] = useState([]);
//     const [playlistSongIds, setPlaylistSongIds] = useState([]);
//     const [loadingMoodSongs, setLoadingMoodSongs] = useState(true);
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [error, setError] = useState('');
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [userPlaylists, setUserPlaylists] = useState([]);
//     const [loadingPlaylists, setLoadingPlaylists] = useState(false);
//     const [addMessage, setAddMessage] = useState('');
//     const navigate = useNavigate();
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoadingMoodSongs(true);
//             setError('');
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/songs', {
//                     timeout: 5000,
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 const songs = Array.isArray(res.data) ? res.data : [];
//                 setAllSongs(songs);
//                 setMoodSongs(songs.filter(song => song.mood && song.mood.toLowerCase().includes(moodName.toLowerCase())));
//                 const playlistRes = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', { headers: { Authorization: `Bearer ${token}` } });
//                 const allSongIds = (playlistRes.data || []).flatMap(pl => (pl.songs || []).map(s => s._id));
//                 setPlaylistSongIds(allSongIds);
//             } catch (err) {
//                 setError('Failed to load songs or playlists.');
//                 setMoodSongs([]);
//             } finally {
//                 setLoadingMoodSongs(false);
//             }
//         };
//         fetchData();
//     }, [moodName, token]);

//     const handleAddToPlaylist = async (songId) => {
//         setSongToAdd(songId);
//         setShowPlaylistModal(true);
//         setAddMessage('');
//         setLoadingPlaylists(true);
//         try {
//             const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setUserPlaylists(res.data || []);
//         } catch (err) {
//             setUserPlaylists([]);
//         } finally {
//             setLoadingPlaylists(false);
//         }
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         setAddMessage('');
//         try {
//             const playlistRes = await axios.get(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             const currentSongs = (playlistRes.data.songs || []).map(s => s._id);
//             const updatedSongs = currentSongs.includes(songToAdd) ? currentSongs : [...currentSongs, songToAdd];
//             await axios.put(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { name: playlistRes.data.name, songs: updatedSongs },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             setAddMessage('Song added to playlist!');
//             setPlaylistSongIds(prev => [...prev, songToAdd]);
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setSongToAdd(null);
//                 setAddMessage('');
//             }, 1000);
//         } catch (err) {
//             setAddMessage('Failed to add song.');
//         }
//     };

//     const handleSongChange = (newSong) => {
//         setSelectedSong(newSong);
//     };

//     const displayName = moodName.charAt(0).toUpperCase() + moodName.slice(1);

//     return (
//         <div className="mood-songs-screen">
//             <Navbar onSearch={() => {}} searchQuery="" setSearchQuery={() => {}} toggleSidebar={() => {}} />
//             <div className="content-area">
//                 <h2>{displayName} Songs</h2>
//                 {loadingMoodSongs ? (
//                     <p className="loading-message">Fetching songs of {displayName}...</p>
//                 ) : error ? (
//                     <p className="error-message">{error}</p>
//                 ) : moodSongs.length > 0 ? (
//                     <div className="songs-column">
//                         {moodSongs.map(song => (
//                             <div key={song._id} className="song-card full-line" onClick={() => setSelectedSong({ ...song, songList: moodSongs })}>
//                                 <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
//                                 <div className="song-details">
//                                     <h4>{song.title}</h4>
//                                     <p>{song.singer}</p>
//                                     <p style={{ fontSize: '0.85rem', color: '#a78bfa', margin: 0 }}>
//                                         {song.genre ? `Genre: ${song.genre}` : ''}
//                                     </p>
//                                 </div>
//                                 {!playlistSongIds.includes(song._id) && (
//                                     <button className="add-song-button" onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(song._id); }}>
//                                         <FontAwesomeIcon icon="fa-plus" />
//                                     </button>
//                                 )}
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <p className="no-songs-message">No songs available for {displayName}.</p>
//                 )}
//             </div>

//             {showPlaylistModal && (
//                 <div className="playlist-modal-overlay" onClick={() => setShowPlaylistModal(false)}>
//                     <div className="playlist-modal" onClick={e => e.stopPropagation()}>
//                         <h4>Select Playlist</h4>
//                         {loadingPlaylists ? (
//                             <div>Loading...</div>
//                         ) : userPlaylists.length > 0 ? (
//                             <ul>
//                                 {userPlaylists.map(pl => (
//                                     <li key={pl._id}>
//                                         <button className="playlist-modal-btn" onClick={() => handleSelectPlaylist(pl._id)}>
//                                             {pl.name}
//                                         </button>
//                                     </li>
//                                 ))}
//                             </ul>
//                         ) : (
//                             <div>No playlists found.</div>
//                         )}
//                         {addMessage && <div className="playlist-modal-message">{addMessage}</div>}
//                         <button className="playlist-modal-cancel" onClick={() => setShowPlaylistModal(false)}>Cancel</button>
//                     </div>
//                 </div>
//             )}

//             {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} onSongChange={handleSongChange} />}
//         </div>
//     );
// }

// // --- Genre Songs Screen ---
// function GenreSongsScreen() {
//     const { genreName } = useParams();
//     const [allSongs, setAllSongs] = useState([]);
//     const [genreSongs, setGenreSongs] = useState([]);
//     const [playlistSongIds, setPlaylistSongIds] = useState([]);
//     const [loadingGenreSongs, setLoadingGenreSongs] = useState(true);
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [error, setError] = useState('');
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [userPlaylists, setUserPlaylists] = useState([]);
//     const [loadingPlaylists, setLoadingPlaylists] = useState(false);
//     const [addMessage, setAddMessage] = useState('');
//     const navigate = useNavigate();
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoadingGenreSongs(true);
//             setError('');
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/songs', {
//                     timeout: 5000,
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 const songs = Array.isArray(res.data) ? res.data : [];
//                 setAllSongs(songs);
//                 setGenreSongs(songs.filter(song => song.genre && song.genre.toLowerCase().includes(genreName.toLowerCase())));
//                 const playlistRes = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', { headers: { Authorization: `Bearer ${token}` } });
//                 const allSongIds = (playlistRes.data || []).flatMap(pl => (pl.songs || []).map(s => s._id));
//                 setPlaylistSongIds(allSongIds);
//             } catch (err) {
//                 setError('Failed to load songs or playlists.');
//                 setGenreSongs([]);
//             } finally {
//                 setLoadingGenreSongs(false);
//             }
//         };
//         fetchData();
//     }, [genreName, token]);

//     const handleAddToPlaylist = async (songId) => {
//         setSongToAdd(songId);
//         setShowPlaylistModal(true);
//         setAddMessage('');
//         setLoadingPlaylists(true);
//         try {
//             const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setUserPlaylists(res.data || []);
//         } catch (err) {
//             setUserPlaylists([]);
//         } finally {
//             setLoadingPlaylists(false);
//         }
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         setAddMessage('');
//         try {
//             const playlistRes = await axios.get(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             const currentSongs = (playlistRes.data.songs || []).map(s => s._id);
//             const updatedSongs = currentSongs.includes(songToAdd) ? currentSongs : [...currentSongs, songToAdd];
//             await axios.put(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { name: playlistRes.data.name, songs: updatedSongs },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             setAddMessage('Song added to playlist!');
//             setPlaylistSongIds(prev => [...prev, songToAdd]);
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setSongToAdd(null);
//                 setAddMessage('');
//             }, 1000);
//         } catch (err) {
//             setAddMessage('Failed to add song.');
//         }
//     };

//     const handleSongChange = (newSong) => {
//         setSelectedSong(newSong);
//     };

//     const displayName = genreName.charAt(0).toUpperCase() + genreName.slice(1);

//     return (
//         <div className="mood-songs-screen">
//             <Navbar onSearch={() => {}} searchQuery="" setSearchQuery={() => {}} toggleSidebar={() => {}} />
//             <div className="content-area">
//                 <h2>{displayName} Songs</h2>
//                 {loadingGenreSongs ? (
//                     <p className="loading-message">Fetching songs of {displayName}...</p>
//                 ) : error ? (
//                     <p className="error-message">{error}</p>
//                 ) : genreSongs.length > 0 ? (
//                     <div className="songs-column">
//                         {genreSongs.map(song => (
//                             <div key={song._id} className="song-card full-line" onClick={() => setSelectedSong({ ...song, songList: genreSongs })}>
//                                 <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
//                                 <div className="song-details">
//                                     <h4>{song.title}</h4>
//                                     <p>{song.singer}</p>
//                                     <p style={{ fontSize: '0.85rem', color: '#a78bfa', margin: 0 }}>
//                                         {song.mood ? `Mood: ${song.mood}` : ''}
//                                     </p>
//                                 </div>
//                                 {!playlistSongIds.includes(song._id) && (
//                                     <button className="add-song-button" onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(song._id); }}>
//                                         <FontAwesomeIcon icon="fa-plus" />
//                                     </button>
//                                 )}
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <p className="no-songs-message">No songs available for {displayName}.</p>
//                 )}
//             </div>

//             {showPlaylistModal && (
//                 <div className="playlist-modal-overlay" onClick={() => setShowPlaylistModal(false)}>
//                     <div className="playlist-modal" onClick={e => e.stopPropagation()}>
//                         <h4>Select Playlist</h4>
//                         {loadingPlaylists ? (
//                             <div>Loading...</div>
//                         ) : userPlaylists.length > 0 ? (
//                             <ul>
//                                 {userPlaylists.map(pl => (
//                                     <li key={pl._id}>
//                                         <button className="playlist-modal-btn" onClick={() => handleSelectPlaylist(pl._id)}>
//                                             {pl.name}
//                                         </button>
//                                     </li>
//                                 ))}
//                             </ul>
//                         ) : (
//                             <div>No playlists found.</div>
//                         )}
//                         {addMessage && <div className="playlist-modal-message">{addMessage}</div>}
//                         <button className="playlist-modal-cancel" onClick={() => setShowPlaylistModal(false)}>Cancel</button>
//                     </div>
//                 </div>
//             )}

//             {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} onSongChange={handleSongChange} />}
//         </div>
//     );
// }

// // --- Account Screen ---
// function Account() {
//     const { user } = useAuth();
//     const [profile, setProfile] = useState(null);
//     const [loadingProfile, setLoadingProfile] = useState(true);
//     const [message, setMessage] = useState('');
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchProfile = async () => {
//             setLoadingProfile(true);
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/user/profile');
//                 setProfile(res.data);
//             } catch (error) {
//                 console.error('Failed to fetch profile:', error);
//                 setMessage('Failed to load profile details.');
//             } finally {
//                 setLoadingProfile(false);
//             }
//         };
//         fetchProfile();
//     }, []);

//     const handleUpdateProfile = async () => {
//         const newFullName = prompt("Enter new full name:", profile?.fullName);
//         if (newFullName && newFullName !== profile.fullName) {
//             try {
//                 const res = await axios.put('https://music-backend-akb5.onrender.com/api/user/profile', { fullName: newFullName }, {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//                 });
//                 setProfile(res.data);
//                 setMessage('Profile updated successfully!');
//             } catch (error) {
//                 console.error('Failed to update profile:', error);
//                 setMessage('Failed to update profile: ' + (error.response?.data?.message || 'Unknown error'));
//             }
//         }
//     };

//     if (loadingProfile) return (
//         <div className="loading">
//             <div></div>
//         </div>
//     );

//     return (
//         <div className="account-screen">
//             <Navbar
//                 onSearch={() => {}}
//                 searchQuery=""
//                 setSearchQuery={() => {}}
//                 toggleSidebar={() => {}}
//             />
//             <div className="content-area">
//                 <h2>Account Details</h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {profile ? (
//                     <>
//                         <p><strong>Full Name:</strong> {profile.fullName}</p>
//                         <p><strong>Email:</strong> {profile.email}</p>
//                         <p><strong>Join Date:</strong> {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('en-GB', {
//                             day: '2-digit',
//                             month: 'long',
//                             year: 'numeric'
//                         }) : 'N/A'}</p>
//                         <button className="edit-profile-button" onClick={handleUpdateProfile}>Edit Profile</button>
//                     </>
//                 ) : (
//                     <p>No profile data available.</p>
//                 )}
//             </div>
//         </div>
//     );
// }

// // --- Playlist Detail Screen ---
// function PlaylistDetailScreen() {
//     const { playlistId } = useParams();
//     const [playlist, setPlaylist] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [message, setMessage] = useState('');
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchPlaylist = async () => {
//             const token = localStorage.getItem('token');
//             setLoading(true);
//             setMessage('');

//             if (!token) {
//                 setMessage('No authentication token found. Please log in.');
//                 setLoading(false);
//                 return;
//             }

//             try {
//                 const res = await axios.get(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                     timeout: 10000,
//                 });
//                 setPlaylist(res.data);
//             } catch (error) {
//                 const errMsg = error.response
//                     ? `Status: ${error.response.status}, Message: ${error.response.data?.message || 'Unknown error'}`
//                     : error.message;
//                 console.error('Fetch error:', errMsg);
//                 setMessage(`Failed to load playlist. ${errMsg}`);
//                 setPlaylist(null);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (playlistId) fetchPlaylist();
//     }, [playlistId]);

//     const handleRemoveSong = async (songIdToRemove) => {
//         if (!window.confirm('Are you sure you want to remove this song?')) return;

//         setLoading(true);
//         setMessage('');

//         try {
//             const token = localStorage.getItem('token');
//             const updatedSongs = playlist.songs.filter(s => s._id !== songIdToRemove).map(s => s._id);

//             await axios.put(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, {
//                 name: playlist.name,
//                 songs: updatedSongs,
//             }, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             setPlaylist(prev => ({
//                 ...prev,
//                 songs: prev.songs.filter(s => s._id !== songIdToRemove)
//             }));
//             setMessage('Song removed successfully!');
//         } catch (error) {
//             console.error('Remove song error:', error.message);
//             setMessage('Failed to remove song.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleEditPlaylist = async () => {
//         const newName = prompt('Enter new playlist name:', playlist.name);
//         if (newName && newName !== playlist.name) {
//             try {
//                 await axios.put(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, {
//                     name: newName,
//                     songs: playlist.songs.map(s => s._id),
//                 }, {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//                 });
//                 setPlaylist(prev => ({ ...prev, name: newName }));
//                 setMessage('Playlist name updated successfully!');
//             } catch (error) {
//                 console.error('Failed to update playlist name:', error);
//                 setMessage('Failed to update playlist name.');
//             }
//         }
//     };

//     const handleSongChange = (newSong) => {
//         setSelectedSong(newSong);
//     };

//     if (loading) {
//         return (
//             <div className="content-area">
//                 <p>Loading...</p>
//             </div>
//         );
//     }

//     if (!playlist) {
//         return (
//             <div className="playlist-detail-screen content-area">
//                 <p>{message || 'Playlist not found.'}</p>
//             </div>
//         );
//     }

//     return (
//         <div className="playlist-detail-screen">
//             <Navbar
//                 onSearch={() => {}}
//                 searchQuery=""
//                 setSearchQuery={() => {}}
//                 toggleSidebar={() => {}}
//             />
//             <div className="content-area">
//                 <h2>
//                     {playlist.name}
//                     <button className="edit-playlist-button" onClick={handleEditPlaylist}>
//                         <FontAwesomeIcon icon="fa-pencil" />
//                     </button>
//                 </h2>
//                 {message && <div className="info-message">{message}</div>}

//                 {playlist.songs && playlist.songs.length > 0 ? (
//                     <div className="songs-column">
//                         {playlist.songs.map(song => (
//                             <div
//                                 key={song._id}
//                                 className="song-card full-line"
//                                 onClick={() => setSelectedSong({ ...song, songList: playlist.songs })}
//                             >
//                                 <img
//                                     src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'}
//                                     alt={song.title}
//                                     className="song-thumbnail"
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
//                     <p>Your playlist is empty. Add songs to enjoy your music!</p>
//                 )}
//             </div>

//             {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} onSongChange={handleSongChange} />}
//         </div>
//     );
// }

// // --- Music Player Component ---
// function MusicPlayer({ song, onClose, onSongChange }) {
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [volume, setVolume] = useState(0.5);
//     const audioRef = useRef(null);
//     const [isAnimating, setIsAnimating] = useState(false);
//     const [isMinimized, setIsMinimized] = useState(false);
//     const [currentSongIndex, setCurrentSongIndex] = useState(0);

//     useEffect(() => {
//         if (!song.audioUrl) return;

//         if (audioRef.current) {
//             audioRef.current.pause();
//             audioRef.current.src = '';
//         }

//         const audio = new Audio(song.audioUrl);
//         audio.volume = volume;
//         audio.preload = 'auto';
//         audio.onerror = () => console.error('Audio load error for:', song.audioUrl);

//         const updateTime = () => setCurrentTime(audio.currentTime);
//         const handleEnded = () => {
//             handleNextSong();
//         };

//         audio.addEventListener('timeupdate', updateTime);
//         audio.addEventListener('ended', handleEnded);

//         audioRef.current = audio;
//         setCurrentTime(0);
//         if (isPlaying && song.audioUrl) {
//             audio.play().catch(err => console.error('Audio play error:', err));
//         }

//         if (song.songList) {
//             const index = song.songList.findIndex(s => s._id === song._id);
//             setCurrentSongIndex(index !== -1 ? index : 0);
//         }

//         return () => {
//             audio.removeEventListener('timeupdate', updateTime);
//             audio.removeEventListener('ended', handleEnded);
//             audio.pause();
//         };
//     }, [song.audioUrl, song._id, song.songList, isPlaying, volume]);

//     useEffect(() => {
//         const audio = audioRef.current;
//         if (!audio) return;
//         if (isPlaying) {
//             audio.play().catch(err => console.error('Audio play error:', err));
//         } else {
//             audio.pause();
//         }
//     }, [isPlaying]);

//     useEffect(() => {
//         if (audioRef.current) {
//             audioRef.current.volume = volume;
//         }
//     }, [volume]);

//     useEffect(() => {
//         const handleInactivity = () => {
//             if (document.hidden && isPlaying) setIsAnimating(true);
//             else setIsAnimating(false);
//         };
//         document.addEventListener('visibilitychange', handleInactivity);
//         return () => {
//             document.removeEventListener('visibilitychange', handleInactivity);
//         };
//     }, [isPlaying]);

//     const togglePlay = () => {
//         if (audioRef.current && song.audioUrl) {
//             setIsPlaying((prev) => !prev);
//         }
//     };

//     const handleNextSong = () => {
//         if (!song.songList || song.songList.length === 0) return;
//         const nextIndex = (currentSongIndex + 1) % song.songList.length;
//         const newSong = { ...song.songList[nextIndex], songList: song.songList };
//         setCurrentSongIndex(nextIndex);
//         if (onSongChange) onSongChange(newSong);
//     };

//     const handlePreviousSong = () => {
//         if (!song.songList || song.songList.length === 0) return;
//         const prevIndex = (currentSongIndex - 1 + song.songList.length) % song.songList.length;
//         const newSong = { ...song.songList[prevIndex], songList: song.songList };
//         setCurrentSongIndex(prevIndex);
//         if (onSongChange) onSongChange(newSong);
//     };

//     const handleTimeDrag = (e) => {
//         if (audioRef.current && audioRef.current.duration) {
//             const time = (e.target.value / 100) * audioRef.current.duration;
//             audioRef.current.currentTime = time;
//             setCurrentTime(time);
//         }
//     };

//     const handleVolumeChange = (e) => {
//         const newVolume = parseFloat(e.target.value);
//         setVolume(newVolume);
//     };

//     const handleMinimize = (e) => {
//         e.stopPropagation();
//         setIsMinimized(!isMinimized);
//     };

//     const formatTime = (seconds) => {
//         const minutes = Math.floor(seconds / 60);
//         const secs = Math.floor(seconds % 60);
//         return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
//     };

//     const duration = audioRef.current ? audioRef.current.duration || 0 : 0;

//     return (
//         <div className={`music-player ${isMinimized ? 'minimized' : ''}`}>
//             {isAnimating && <div className="animate-gradient" />}
//             <button className="close-player-button" onClick={onClose}>✖</button>
//             <div className="player-content">
//                 <img src={song.thumbnailUrl || 'https://placehold.co/100x100/333/FFF?text=♪'} alt={song.title} />
//                 <div className="song-info">
//                     <h4>{song.title}</h4>
//                     <p>{song.singer}</p>
//                 </div>
//                 {!isMinimized && (
//                     <div className="controls">
//                         <div className="time-display">
//                             <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
//                         </div>
//                         <input
//                             type="range"
//                             min="0"
//                             max="100"
//                             value={duration ? (currentTime / duration) * 100 : 0}
//                             onChange={handleTimeDrag}
//                             className="progress-bar"
//                         />
//                         <div className="player-buttons">
//                             <button onClick={handlePreviousSong}><FontAwesomeIcon icon="fa-step-backward" /></button>
//                             <button onClick={togglePlay}>
//                                 <FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} />
//                             </button>
//                             <button onClick={handleNextSong}><FontAwesomeIcon icon="fa-step-forward" /></button>
//                             <input
//                                 type="range"
//                                 min="0"
//                                 max="1"
//                                 step="0.1"
//                                 value={volume}
//                                 onChange={handleVolumeChange}
//                                 className="volume-slider"
//                             />
//                         </div>
//                     </div>
//                 )}
//             </div>
//             <button className="minimize-player-button" onClick={handleMinimize}>
//                 <FontAwesomeIcon icon={isMinimized ? 'fa-chevron-up' : 'fa-chevron-down'} />
//             </button>
//         </div>
//     );
// }

// // --- Main App Component ---
// function App() {
//     return (
//         <Router>
//             <AuthProvider>
//                 <Routes>
//                     <Route path="/" element={<SplashScreen />} />
//                     <Route path="/login" element={<AuthScreen />} />
//                     <Route path="/main" element={<ProtectedRoute><MainScreen /></ProtectedRoute>} />
//                     <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
//                     <Route path="/moods/:moodName" element={<ProtectedRoute><MoodSongsScreen /></ProtectedRoute>} />
//                     <Route path="/genres/:genreName" element={<ProtectedRoute><GenreSongsScreen /></ProtectedRoute>} />
//                     <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetailScreen /></ProtectedRoute>} />
//                 </Routes>
//             </AuthProvider>
//         </Router>
//     );
// }

// export default App;

// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
// import axios from 'axios';

// // FontAwesome Icons
// import { library } from '@fortawesome/fontawesome-svg-core';
// import { fas } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// library.add(fas);

// // --- Auth Context ---
// const AuthContext = React.createContext();

// function AuthProvider({ children }) {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             axios.defaults.headers.Authorization = `Bearer ${token}`;
//             axios
//                 .get('https://music-backend-akb5.onrender.com/api/user/profile')
//                 .then((res) => {
//                     setUser(res.data);
//                 })
//                 .catch((error) => {
//                     console.error('Auth error:', error);
//                     localStorage.removeItem('token');
//                     setUser(null);
//                 })
//                 .finally(() => setLoading(false));
//         } else {
//             setLoading(false);
//         }
//     }, []);

//     const login = (token, userData, navigate) => {
//         localStorage.setItem('token', token);
//         axios.defaults.headers.Authorization = `Bearer ${token}`;
//         setUser(userData);
//         sessionStorage.setItem('showWelcome', 'true');
//         navigate('/main');
//     };

//     const logout = (navigate) => {
//         localStorage.removeItem('token');
//         axios.defaults.headers.Authorization = null;
//         setUser(null);
//         sessionStorage.removeItem('showWelcome');
//         navigate('/login');
//     };

//     return (
//         <AuthContext.Provider value={{ user, login, logout, loading }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }

// function useAuth() {
//     return React.useContext(AuthContext);
// }

// function ProtectedRoute({ children }) {
//     const { user, loading } = useAuth();
//     const location = useLocation();

//     if (loading) {
//         return (
//             <div className="loading">
//                 <div></div>
//             </div>
//         );
//     }

//     if (!user) {
//         return <Navigate to="/login" state={{ from: location }} replace />;
//     }

//     return children;
// }

// // --- Splash Screen ---
// function SplashScreen() {
//     const navigate = useNavigate();

//     useEffect(() => {
//         const timer = setTimeout(() => navigate('/login'), 3000);
//         return () => clearTimeout(timer);
//     }, [navigate]);

//     return (
//         <div className="splash-screen">
//             <FontAwesomeIcon icon="fa-music" size="3x" className="animate-spin" />
//             <h1>Gawana</h1>
//             <p>Loading...</p>
//         </div>
//     );
// }

// // --- Auth Screen ---
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
//             login(res.data.token, res.data.user, navigate);
//         } catch (error) {
//             console.error('Auth error:', error);
//             setMessage(isLogin ? 'Login failed: ' + (error.response?.data?.message || 'Unknown error') : 'Signup failed: ' + (error.response?.data?.message || 'Unknown error'));
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) return (
//         <div className="loading">
//             <div></div>
//         </div>
//     );

//     return (
//         <div className="auth-screen">
//             <form onSubmit={handleSubmit} className="auth-form">
//                 <h2>{isLogin ? 'Login' : 'Signup'}</h2>
//                 {!isLogin && (
//                     <input
//                         type="text"
//                         value={fullName}
//                         onChange={(e) => setFullName(e.target.value)}
//                         placeholder="Full Name"
//                         required
//                     />
//                 )}
//                 <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Email"
//                     required
//                 />
//                 <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Password"
//                     required
//                 />
//                 <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
//                 <p className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
//                     {isLogin ? 'Need an account? Signup' : 'Already have an account? Login'}
//                 </p>
//                 {message && <div className="error-message">{message}</div>}
//             </form>
//         </div>
//     );
// }

// // --- Navbar Component ---
// function Navbar({ onSearch, searchQuery, setSearchQuery, toggleSidebar }) {
//     const navigate = useNavigate();

//     return (
//         <div className="navbar">
//             <div className="navbar-logo" onClick={() => navigate('/main')}>Gawana</div>
//             <div className="navbar-right">
//                 <div
//                     className="search-box"
//                     onClick={() => {
//                         setSearchQuery(prev => (prev ? '' : 'search'));
//                         setTimeout(() => document.querySelector('.search-input')?.focus(), 0);
//                     }}
//                 >
//                     <FontAwesomeIcon icon="fa-search" />
//                 </div>
//                 <div className="sidebar-toggle" onClick={toggleSidebar}>
//                     ☰
//                 </div>
//             </div>
//         </div>
//     );
// }

// // --- Sidebar Component ---
// function Sidebar({ isOpen, onClose }) {
//     const navigate = useNavigate();
//     const { user, logout } = useAuth();
//     const sidebarRef = useRef(null);
//     const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
//     const [playlists, setPlaylists] = useState([]);
//     const [loadingPlaylists, setLoadingPlaylists] = useState(false);
//     const [showModeDropdown, setShowModeDropdown] = useState(false);
//     const [mode, setMode] = useState(localStorage.getItem('mode') || 'dark');

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//                 onClose();
//             }
//         };
//         if (isOpen) {
//             document.addEventListener('mousedown', handleClickOutside);
//         } else {
//             document.removeEventListener('mousedown', handleClickOutside);
//             setShowPlaylistDropdown(false);
//             setShowModeDropdown(false);
//         }
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [isOpen, onClose]);

//     useEffect(() => {
//         localStorage.setItem('mode', mode);
//         document.body.dataset.mode = mode;
//     }, [mode]);

//     const fetchPlaylists = useCallback(async () => {
//         setLoadingPlaylists(true);
//         try {
//             const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//             });
//             setPlaylists(res.data);
//         } catch (error) {
//             console.error('Failed to fetch playlists:', error);
//             setPlaylists([]);
//         } finally {
//             setLoadingPlaylists(false);
//         }
//     }, []);

//     const handlePlaylistClick = () => {
//         if (!showPlaylistDropdown) {
//             fetchPlaylists();
//         }
//         setShowPlaylistDropdown(!showPlaylistDropdown);
//     };

//     const handleLogout = () => {
//         logout(navigate);
//         onClose();
//     };

//     const handleAccountClick = () => {
//         navigate('/account');
//         onClose();
//     };

//     const handleModeHover = (isHovering) => {
//         setShowModeDropdown(isHovering);
//     };

//     const handleModeSelect = (mode) => {
//         setMode(mode.toLowerCase());
//         onClose();
//     };

//     const handlePlaylistNameClick = (playlistId) => {
//         navigate(`/playlist/${playlistId}`);
//         onClose();
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName) {
//             try {
//                 await axios.post('https://music-backend-akb5.onrender.com/api/playlists', { name: playlistName }, {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//                 });
//                 fetchPlaylists();
//             } catch (error) {
//                 console.error('Failed to create playlist:', error);
//             }
//         }
//     };

//     return (
//         <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
//             <a href="#" onClick={handleAccountClick}>Account</a>
//             <div
//                 className="sidebar-item-with-dropdown"
//                 onMouseEnter={() => handleModeHover(true)}
//                 onMouseLeave={() => handleModeHover(false)}
//             >
//                 <a href="#" onClick={(e) => e.preventDefault()}>Mode</a>
//                 {showModeDropdown && (
//                     <div className="mode-dropdown">
//                         <span onClick={() => handleModeSelect('Dark')}>Dark</span>
//                         <span onClick={() => handleModeSelect('Light')}>Light</span>
//                         <span onClick={() => handleModeSelect('Neon')}>Neon</span>
//                     </div>
//                 )}
//             </div>
//             <a href="#" onClick={(e) => { e.preventDefault(); handlePlaylistClick(); }}>Playlist</a>
//             {showPlaylistDropdown && (
//                 <div className="playlist-dropdown">
//                     {loadingPlaylists ? (
//                         <span>Loading playlists...</span>
//                     ) : playlists.length > 0 ? (
//                         <>
//                             {playlists.map(playlist => (
//                                 <span key={playlist._id} onClick={() => handlePlaylistNameClick(playlist._id)}>
//                                     {playlist.name}
//                                 </span>
//                             ))}
//                             <span onClick={handleCreatePlaylist} className="create-playlist">
//                                 <FontAwesomeIcon icon="fa-plus" /> Create New Playlist
//                             </span>
//                         </>
//                     ) : (
//                         <>
//                             <span>No playlists found. Create one</span>
//                             <span onClick={handleCreatePlaylist} className="create-playlist">
//                                 <FontAwesomeIcon icon="fa-plus" /> Create New Playlist
//                             </span>
//                         </>
//                     )}
//                 </div>
//             )}
//             {user && <a href="#" onClick={handleLogout}>Logout</a>}
//         </div>
//     );
// }

// function MainScreen() {
//     const { user } = useAuth();
//     const [songs, setSongs] = useState({ moods: {}, genres: {} });
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [playlistSongIds, setPlaylistSongIds] = useState([]);
//     const navigate = useNavigate();

//     const moodCategories = ['happy', 'sad', 'love', 'calm'];
//     const genreCategories = ['travel', 'party', 'rap', 'motivational', 'pop'];

//     useEffect(() => {
//         if (sessionStorage.getItem('showWelcome') === 'true' && user) {
//             setShowWelcomeMessage(true);
//             sessionStorage.removeItem('showWelcome');
//             const timer = setTimeout(() => {
//                 setShowWelcomeMessage(false);
//             }, 3000);
//             return () => clearTimeout(timer);
//         }
//     }, [user]);

//     useEffect(() => {
//         const fetchPlaylistSongs = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 const res = await axios.get(`https://music-backend-akb5.onrender.com/api/playlists`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 const allSongIds = res.data.flatMap(p => p.songs.map(s => s._id));
//                 setPlaylistSongIds(allSongIds);
//             } catch (err) {
//                 console.error('Failed to fetch playlist songs:', err);
//             }
//         };
//         fetchPlaylistSongs();
//     }, []);

//     useEffect(() => {
//         const fetchSongs = async () => {
//             setLoading(true);
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/songs', {
//                     timeout: 5000,
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//                 });
//                 const categorizedSongs = { moods: {}, genres: {} };
//                 res.data.forEach(song => {
//                     if (song.mood && moodCategories.includes(song.mood.toLowerCase())) {
//                         categorizedSongs.moods[song.mood.toLowerCase()] = categorizedSongs.moods[song.mood.toLowerCase()] || [];
//                         categorizedSongs.moods[song.mood.toLowerCase()].push(song);
//                     }
//                     if (song.genre && genreCategories.includes(song.genre.toLowerCase())) {
//                         categorizedSongs.genres[song.genre.toLowerCase()] = categorizedSongs.genres[song.genre.toLowerCase()] || [];
//                         categorizedSongs.genres[song.genre.toLowerCase()].push(song);
//                     }
//                 });
//                 setSongs(categorizedSongs);
//             } catch (error) {
//                 console.error('Fetch error:', error);
//                 setSongs({ moods: {}, genres: {} });
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchSongs();
//     }, []);

//     const debouncedSearch = useMemo(() => {
//         const debounce = (func, delay) => {
//             let timeoutId;
//             return (...args) => {
//                 clearTimeout(timeoutId);
//                 timeoutId = setTimeout(() => func(...args), delay);
//             };
//         };
//         const performSearch = async (query) => {
//             if (!query.trim()) {
//                 setSearchResults([]);
//                 return;
//             }
//             setLoading(true);
//             try {
//                 const res = await axios.get(`https://music-backend-akb5.onrender.com/api/songs?search=${encodeURIComponent(query)}`, { timeout: 5000 });
//                 setSearchResults(Array.isArray(res.data) ? res.data : []);
//             } catch (error) {
//                 console.error('Search error:', error);
//                 setSearchResults([]);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         return debounce(performSearch, 300);
//     }, []);

//     useEffect(() => {
//         debouncedSearch(searchQuery);
//     }, [searchQuery, debouncedSearch]);

//     const toggleSidebar = () => {
//         setIsSidebarOpen(!isSidebarOpen);
//     };

//     const handleSongChange = (newSong) => {
//         setSelectedSong(newSong);
//     };

//     const handleAddToPlaylist = async (songId) => {
//         setShowPlaylistModal(true);
//         setSongToAdd(songId);
//         setAddMessage('');
//         setLoadingPlaylists(true);
//         try {
//             const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//             });
//             setUserPlaylists(res.data || []);
//         } catch (err) {
//             setUserPlaylists([]);
//         } finally {
//             setLoadingPlaylists(false);
//         }
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         setAddMessage('');
//         try {
//             const playlistRes = await axios.get(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//             );
//             const currentSongs = (playlistRes.data.songs || []).map(s => s._id);
//             const updatedSongs = currentSongs.includes(songToAdd) ? currentSongs : [...currentSongs, songToAdd];
//             await axios.put(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { name: playlistRes.data.name, songs: updatedSongs },
//                 { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//             );
//             setAddMessage('Song added to playlist!');
//             setPlaylistSongIds(prev => [...prev, songToAdd]);
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setSongToAdd(null);
//                 setAddMessage('');
//             }, 1000);
//         } catch (err) {
//             setAddMessage('Failed to add song.');
//         }
//     };

//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [userPlaylists, setUserPlaylists] = useState([]);
//     const [loadingPlaylists, setLoadingPlaylists] = useState(false);
//     const [addMessage, setAddMessage] = useState('');

//     if (loading && !searchQuery) return (
//         <div className="loading">
//             <div></div>
//         </div>
//     );

//     return (
//         <div className="main-screen">
//             <Navbar
//                 onSearch={() => {}}
//                 searchQuery={searchQuery}
//                 setSearchQuery={setSearchQuery}
//                 toggleSidebar={toggleSidebar}
//             />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

     
// <div className="content-area">
//     {searchQuery && (
//         <div className="search-overlay">
//             <input
//                 type="text"
//                 value={searchQuery === 'search' ? '' : searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="search-input"
//                 placeholder="Search songs (e.g., hum nava mere, Arijit, love, party)..."
//                 autoFocus
//             />
//             <div className="search-results">
//                 {searchQuery.trim() && searchQuery !== 'search' ? (
//                     loading ? (
//                         <div className="card empty">Searching...</div>
//                     ) : searchResults.length > 0 ? (
//                         <div className="songs-column">
//                             {searchResults.map(song => (
//                                 <div key={song._id} className="song-card full-line" onClick={() => setSelectedSong({ ...song, songList: searchResults })}>
//                                     <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
//                                     <div className="song-details">
//                                         <h4>{song.title}</h4>
//                                         <p>{song.singer}</p>
//                                         <p style={{ fontSize: '0.85rem', color: '#a78bfa', margin: 0 }}>
//                                             {song.mood ? `Mood: ${song.mood}` : ''} {song.genre ? `| Genre: ${song.genre}` : ''} {song.movie ? `| Movie: ${song.movie}` : ''}
//                                         </p>
//                                     </div>
//                                     {!playlistSongIds.includes(song._id) && (
//                                         <button className="add-song-button" onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(song._id); }}>
//                                             <FontAwesomeIcon icon="fa-plus" />
//                                         </button>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     ) : (
//                         <div className="card empty">No songs found for "{searchQuery}"</div>
//                     )
//                 ) : null}
//             </div>
//         </div>
//     )}


//                 {!searchQuery && (
//                     <>
//                         {showWelcomeMessage && user && (
//                             <div className="welcome-message animate-fade-in-out">
//                                 Welcome, {user.fullName.split(' ')[0]}!
//                             </div>
//                         )}
//                         <div className="main-content">
//                             <section className="mood-section">
//                                 <h2>Moods</h2>
//                                 <div className="mood-cards">
//                                     {moodCategories.map((mood) => (
//                                         <div key={mood} className={`mood-card ${mood}`} onClick={() => navigate(`/moods/${mood}`)}>
//                                             <h3>{mood.charAt(0).toUpperCase() + mood.slice(1)}</h3>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </section>
//                             <section className="genre-section">
//                                 <h2>Genres</h2>
//                                 <div className="mood-cards">
//                                     {genreCategories.map((genre) => (
//                                         <div key={genre} className={`mood-card ${genre}`} onClick={() => navigate(`/genres/${genre}`)}>
//                                             <h3>{genre.charAt(0).toUpperCase() + genre.slice(1)}</h3>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </section>
//                         </div>
//                     </>
//                 )}
//             </div>
//             {showPlaylistModal && (
//                 <div className="playlist-modal-overlay" onClick={() => setShowPlaylistModal(false)}>
//                     <div className="playlist-modal" onClick={e => e.stopPropagation()}>
//                         <h4>Select Playlist</h4>
//                         {loadingPlaylists ? (
//                             <div>Loading...</div>
//                         ) : userPlaylists.length > 0 ? (
//                             <ul>
//                                 {userPlaylists.map(pl => (
//                                     <li key={pl._id}>
//                                         <button className="playlist-modal-btn" onClick={() => handleSelectPlaylist(pl._id)}>
//                                             {pl.name}
//                                         </button>
//                                     </li>
//                                 ))}
//                             </ul>
//                         ) : (
//                             <div>No playlists found.</div>
//                         )}
//                         {addMessage && <div className="playlist-modal-message">{addMessage}</div>}
//                         <button className="playlist-modal-cancel" onClick={() => setShowPlaylistModal(false)}>Cancel</button>
//                     </div>
//                 </div>
//             )}
//             {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} onSongChange={handleSongChange} />}
//         </div>
//     );
// }

// // --- Mood Songs Screen ---
// function MoodSongsScreen() {
//     const { moodName } = useParams();
//     const [allSongs, setAllSongs] = useState([]);
//     const [moodSongs, setMoodSongs] = useState([]);
//     const [playlistSongIds, setPlaylistSongIds] = useState([]);
//     const [loadingMoodSongs, setLoadingMoodSongs] = useState(true);
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [error, setError] = useState('');
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [userPlaylists, setUserPlaylists] = useState([]);
//     const [loadingPlaylists, setLoadingPlaylists] = useState(false);
//     const [addMessage, setAddMessage] = useState('');
//     const navigate = useNavigate();
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoadingMoodSongs(true);
//             setError('');
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/songs', {
//                     timeout: 5000,
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 const songs = Array.isArray(res.data) ? res.data : [];
//                 setAllSongs(songs);
//                 setMoodSongs(songs.filter(song => song.mood && song.mood.toLowerCase().includes(moodName.toLowerCase())));
//                 const playlistRes = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', { headers: { Authorization: `Bearer ${token}` } });
//                 const allSongIds = (playlistRes.data || []).flatMap(pl => (pl.songs || []).map(s => s._id));
//                 setPlaylistSongIds(allSongIds);
//             } catch (err) {
//                 setError('Failed to load songs or playlists.');
//                 setMoodSongs([]);
//             } finally {
//                 setLoadingMoodSongs(false);
//             }
//         };
//         fetchData();
//     }, [moodName, token]);

//     const handleAddToPlaylist = async (songId) => {
//         setSongToAdd(songId);
//         setShowPlaylistModal(true);
//         setAddMessage('');
//         setLoadingPlaylists(true);
//         try {
//             const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setUserPlaylists(res.data || []);
//         } catch (err) {
//             setUserPlaylists([]);
//         } finally {
//             setLoadingPlaylists(false);
//         }
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         setAddMessage('');
//         try {
//             const playlistRes = await axios.get(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             const currentSongs = (playlistRes.data.songs || []).map(s => s._id);
//             const updatedSongs = currentSongs.includes(songToAdd) ? currentSongs : [...currentSongs, songToAdd];
//             await axios.put(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { name: playlistRes.data.name, songs: updatedSongs },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             setAddMessage('Song added to playlist!');
//             setPlaylistSongIds(prev => [...prev, songToAdd]);
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setSongToAdd(null);
//                 setAddMessage('');
//             }, 1000);
//         } catch (err) {
//             setAddMessage('Failed to add song.');
//         }
//     };

//     const handleSongChange = (newSong) => {
//         setSelectedSong(newSong);
//     };

//     const displayName = moodName.charAt(0).toUpperCase() + moodName.slice(1);

//     return (
//         <div className="mood-songs-screen">
//             <Navbar onSearch={() => {}} searchQuery="" setSearchQuery={() => {}} toggleSidebar={() => {}} />
//             <div className="content-area">
//                 <h2>{displayName} Songs</h2>
//                 {loadingMoodSongs ? (
//                     <p className="loading-message">Fetching songs of {displayName}...</p>
//                 ) : error ? (
//                     <p className="error-message">{error}</p>
//                 ) : moodSongs.length > 0 ? (
//                     <div className="songs-column">
//                         {moodSongs.map(song => (
//                             <div key={song._id} className="song-card full-line" onClick={() => setSelectedSong({ ...song, songList: moodSongs })}>
//                                 <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
//                                 <div className="song-details">
//                                     <h4>{song.title}</h4>
//                                     <p>{song.singer}</p>
//                                     <p style={{ fontSize: '0.85rem', color: '#a78bfa', margin: 0 }}>
//                                         {song.genre ? `Genre: ${song.genre}` : ''}
//                                     </p>
//                                 </div>
//                                 {!playlistSongIds.includes(song._id) && (
//                                     <button className="add-song-button" onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(song._id); }}>
//                                         <FontAwesomeIcon icon="fa-plus" />
//                                     </button>
//                                 )}
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <p className="no-songs-message">No songs available for {displayName}.</p>
//                 )}
//             </div>

//             {showPlaylistModal && (
//                 <div className="playlist-modal-overlay" onClick={() => setShowPlaylistModal(false)}>
//                     <div className="playlist-modal" onClick={e => e.stopPropagation()}>
//                         <h4>Select Playlist</h4>
//                         {loadingPlaylists ? (
//                             <div>Loading...</div>
//                         ) : userPlaylists.length > 0 ? (
//                             <ul>
//                                 {userPlaylists.map(pl => (
//                                     <li key={pl._id}>
//                                         <button className="playlist-modal-btn" onClick={() => handleSelectPlaylist(pl._id)}>
//                                             {pl.name}
//                                         </button>
//                                     </li>
//                                 ))}
//                             </ul>
//                         ) : (
//                             <div>No playlists found.</div>
//                         )}
//                         {addMessage && <div className="playlist-modal-message">{addMessage}</div>}
//                         <button className="playlist-modal-cancel" onClick={() => setShowPlaylistModal(false)}>Cancel</button>
//                     </div>
//                 </div>
//             )}

//             {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} onSongChange={handleSongChange} />}
//         </div>
//     );
// }

// // --- Genre Songs Screen ---
// function GenreSongsScreen() {
//     const { genreName } = useParams();
//     const [allSongs, setAllSongs] = useState([]);
//     const [genreSongs, setGenreSongs] = useState([]);
//     const [playlistSongIds, setPlaylistSongIds] = useState([]);
//     const [loadingGenreSongs, setLoadingGenreSongs] = useState(true);
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [error, setError] = useState('');
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [userPlaylists, setUserPlaylists] = useState([]);
//     const [loadingPlaylists, setLoadingPlaylists] = useState(false);
//     const [addMessage, setAddMessage] = useState('');
//     const navigate = useNavigate();
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoadingGenreSongs(true);
//             setError('');
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/songs', {
//                     timeout: 5000,
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 const songs = Array.isArray(res.data) ? res.data : [];
//                 setAllSongs(songs);
//                 setGenreSongs(songs.filter(song => song.genre && song.genre.toLowerCase().includes(genreName.toLowerCase())));
//                 const playlistRes = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', { headers: { Authorization: `Bearer ${token}` } });
//                 const allSongIds = (playlistRes.data || []).flatMap(pl => (pl.songs || []).map(s => s._id));
//                 setPlaylistSongIds(allSongIds);
//             } catch (err) {
//                 setError('Failed to load songs or playlists.');
//                 setGenreSongs([]);
//             } finally {
//                 setLoadingGenreSongs(false);
//             }
//         };
//         fetchData();
//     }, [genreName, token]);

//     const handleAddToPlaylist = async (songId) => {
//         setSongToAdd(songId);
//         setShowPlaylistModal(true);
//         setAddMessage('');
//         setLoadingPlaylists(true);
//         try {
//             const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setUserPlaylists(res.data || []);
//         } catch (err) {
//             setUserPlaylists([]);
//         } finally {
//             setLoadingPlaylists(false);
//         }
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         setAddMessage('');
//         try {
//             const playlistRes = await axios.get(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             const currentSongs = (playlistRes.data.songs || []).map(s => s._id);
//             const updatedSongs = currentSongs.includes(songToAdd) ? currentSongs : [...currentSongs, songToAdd];
//             await axios.put(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { name: playlistRes.data.name, songs: updatedSongs },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             setAddMessage('Song added to playlist!');
//             setPlaylistSongIds(prev => [...prev, songToAdd]);
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setSongToAdd(null);
//                 setAddMessage('');
//             }, 1000);
//         } catch (err) {
//             setAddMessage('Failed to add song.');
//         }
//     };

//     const handleSongChange = (newSong) => {
//         setSelectedSong(newSong);
//     };

//     const displayName = genreName.charAt(0).toUpperCase() + genreName.slice(1);

//     return (
//         <div className="mood-songs-screen">
//             <Navbar onSearch={() => {}} searchQuery="" setSearchQuery={() => {}} toggleSidebar={() => {}} />
//             <div className="content-area">
//                 <h2>{displayName} Songs</h2>
//                 {loadingGenreSongs ? (
//                     <p className="loading-message">Fetching songs of {displayName}...</p>
//                 ) : error ? (
//                     <p className="error-message">{error}</p>
//                 ) : genreSongs.length > 0 ? (
//                     <div className="songs-column">
//                         {genreSongs.map(song => (
//                             <div key={song._id} className="song-card full-line" onClick={() => setSelectedSong({ ...song, songList: genreSongs })}>
//                                 <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
//                                 <div className="song-details">
//                                     <h4>{song.title}</h4>
//                                     <p>{song.singer}</p>
//                                     <p style={{ fontSize: '0.85rem', color: '#a78bfa', margin: 0 }}>
//                                         {song.mood ? `Mood: ${song.mood}` : ''}
//                                     </p>
//                                 </div>
//                                 {!playlistSongIds.includes(song._id) && (
//                                     <button className="add-song-button" onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(song._id); }}>
//                                         <FontAwesomeIcon icon="fa-plus" />
//                                     </button>
//                                 )}
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <p className="no-songs-message">No songs available for {displayName}.</p>
//                 )}
//             </div>

//             {showPlaylistModal && (
//                 <div className="playlist-modal-overlay" onClick={() => setShowPlaylistModal(false)}>
//                     <div className="playlist-modal" onClick={e => e.stopPropagation()}>
//                         <h4>Select Playlist</h4>
//                         {loadingPlaylists ? (
//                             <div>Loading...</div>
//                         ) : userPlaylists.length > 0 ? (
//                             <ul>
//                                 {userPlaylists.map(pl => (
//                                     <li key={pl._id}>
//                                         <button className="playlist-modal-btn" onClick={() => handleSelectPlaylist(pl._id)}>
//                                             {pl.name}
//                                         </button>
//                                     </li>
//                                 ))}
//                             </ul>
//                         ) : (
//                             <div>No playlists found.</div>
//                         )}
//                         {addMessage && <div className="playlist-modal-message">{addMessage}</div>}
//                         <button className="playlist-modal-cancel" onClick={() => setShowPlaylistModal(false)}>Cancel</button>
//                     </div>
//                 </div>
//             )}

//             {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} onSongChange={handleSongChange} />}
//         </div>
//     );
// }

// // --- Account Screen ---
// function Account() {
//     const { user } = useAuth();
//     const [profile, setProfile] = useState(null);
//     const [loadingProfile, setLoadingProfile] = useState(true);
//     const [message, setMessage] = useState('');
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchProfile = async () => {
//             setLoadingProfile(true);
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/user/profile');
//                 setProfile(res.data);
//             } catch (error) {
//                 console.error('Failed to fetch profile:', error);
//                 setMessage('Failed to load profile details.');
//             } finally {
//                 setLoadingProfile(false);
//             }
//         };
//         fetchProfile();
//     }, []);

//     const handleUpdateProfile = async () => {
//         const newFullName = prompt("Enter new full name:", profile?.fullName);
//         if (newFullName && newFullName !== profile.fullName) {
//             try {
//                 const res = await axios.put('https://music-backend-akb5.onrender.com/api/user/profile', { fullName: newFullName }, {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//                 });
//                 setProfile(res.data);
//                 setMessage('Profile updated successfully!');
//             } catch (error) {
//                 console.error('Failed to update profile:', error);
//                 setMessage('Failed to update profile: ' + (error.response?.data?.message || 'Unknown error'));
//             }
//         }
//     };

//     if (loadingProfile) return (
//         <div className="loading">
//             <div></div>
//         </div>
//     );

//     return (
//         <div className="account-screen">
//             <Navbar
//                 onSearch={() => {}}
//                 searchQuery=""
//                 setSearchQuery={() => {}}
//                 toggleSidebar={() => {}}
//             />
//             <div className="content-area">
//                 <h2>Account Details</h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {profile ? (
//                     <>
//                         <p><strong>Full Name:</strong> {profile.fullName}</p>
//                         <p><strong>Email:</strong> {profile.email}</p>
//                         <p><strong>Join Date:</strong> {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('en-GB', {
//                             day: '2-digit',
//                             month: 'long',
//                             year: 'numeric'
//                         }) : 'N/A'}</p>
//                         <button className="edit-profile-button" onClick={handleUpdateProfile}>Edit Profile</button>
//                     </>
//                 ) : (
//                     <p>No profile data available.</p>
//                 )}
//             </div>
//         </div>
//     );
// }

// // --- Playlist Detail Screen ---
// function PlaylistDetailScreen() {
//     const { playlistId } = useParams();
//     const [playlist, setPlaylist] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [message, setMessage] = useState('');
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchPlaylist = async () => {
//             const token = localStorage.getItem('token');
//             setLoading(true);
//             setMessage('');

//             if (!token) {
//                 setMessage('No authentication token found. Please log in.');
//                 setLoading(false);
//                 return;
//             }

//             try {
//                 const res = await axios.get(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                     timeout: 10000,
//                 });
//                 setPlaylist(res.data);
//             } catch (error) {
//                 const errMsg = error.response
//                     ? `Status: ${error.response.status}, Message: ${error.response.data?.message || 'Unknown error'}`
//                     : error.message;
//                 console.error('Fetch error:', errMsg);
//                 setMessage(`Failed to load playlist. ${errMsg}`);
//                 setPlaylist(null);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (playlistId) fetchPlaylist();
//     }, [playlistId]);

//     const handleRemoveSong = async (songIdToRemove) => {
//         if (!window.confirm('Are you sure you want to remove this song?')) return;

//         setLoading(true);
//         setMessage('');

//         try {
//             const token = localStorage.getItem('token');
//             const updatedSongs = playlist.songs.filter(s => s._id !== songIdToRemove).map(s => s._id);

//             await axios.put(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, {
//                 name: playlist.name,
//                 songs: updatedSongs,
//             }, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             setPlaylist(prev => ({
//                 ...prev,
//                 songs: prev.songs.filter(s => s._id !== songIdToRemove)
//             }));
//             setMessage('Song removed successfully!');
//         } catch (error) {
//             console.error('Remove song error:', error.message);
//             setMessage('Failed to remove song.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleEditPlaylist = async () => {
//         const newName = prompt('Enter new playlist name:', playlist.name);
//         if (newName && newName !== playlist.name) {
//             try {
//                 await axios.put(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, {
//                     name: newName,
//                     songs: playlist.songs.map(s => s._id),
//                 }, {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//                 });
//                 setPlaylist(prev => ({ ...prev, name: newName }));
//                 setMessage('Playlist name updated successfully!');
//             } catch (error) {
//                 console.error('Failed to update playlist name:', error);
//                 setMessage('Failed to update playlist name.');
//             }
//         }
//     };

//     const handleSongChange = (newSong) => {
//         setSelectedSong(newSong);
//     };

//     if (loading) {
//         return (
//             <div className="content-area">
//                 <p>Loading...</p>
//             </div>
//         );
//     }

//     if (!playlist) {
//         return (
//             <div className="playlist-detail-screen content-area">
//                 <p>{message || 'Playlist not found.'}</p>
//             </div>
//         );
//     }

//     return (
//         <div className="playlist-detail-screen">
//             <Navbar
//                 onSearch={() => {}}
//                 searchQuery=""
//                 setSearchQuery={() => {}}
//                 toggleSidebar={() => {}}
//             />
//             <div className="content-area">
//                 <h2>
//                     {playlist.name}
//                     <button className="edit-playlist-button" onClick={handleEditPlaylist}>
//                         <FontAwesomeIcon icon="fa-pencil" />
//                     </button>
//                 </h2>
//                 {message && <div className="info-message">{message}</div>}

//                 {playlist.songs && playlist.songs.length > 0 ? (
//                     <div className="songs-column">
//                         {playlist.songs.map(song => (
//                             <div
//                                 key={song._id}
//                                 className="song-card full-line"
//                                 onClick={() => setSelectedSong({ ...song, songList: playlist.songs })}
//                             >
//                                 <img
//                                     src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'}
//                                     alt={song.title}
//                                     className="song-thumbnail"
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
//                     <p>Your playlist is empty. Add songs to enjoy your music!</p>
//                 )}
//             </div>

//             {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} onSongChange={handleSongChange} />}
//         </div>
//     );
// }

// // --- Music Player Component ---
// // ...existing code...

// function MusicPlayer({ song, onClose, onSongChange }) {
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [volume, setVolume] = useState(0.5);
//     const audioRef = useRef(null);
//     const [isAnimating, setIsAnimating] = useState(false);
//     const [isMinimized, setIsMinimized] = useState(false);
//     const [currentSongIndex, setCurrentSongIndex] = useState(0);

//     // Only create a new audio element when the song changes
//     useEffect(() => {
//         if (!song.audioUrl) return;

//         // Clean up previous audio
//         if (audioRef.current) {
//             audioRef.current.pause();
//             audioRef.current.src = '';
//         }

//         const audio = new Audio(song.audioUrl);
//         audio.volume = volume;
//         audio.preload = 'auto';
//         audio.onerror = () => console.error('Audio load error for:', song.audioUrl);

//         const updateTime = () => setCurrentTime(audio.currentTime);
//         const handleEnded = () => {
//             handleNextSong();
//         };

//         audio.addEventListener('timeupdate', updateTime);
//         audio.addEventListener('ended', handleEnded);

//         audioRef.current = audio;
//         setCurrentTime(0);

//         // Only play if isPlaying is true
//         if (isPlaying) {
//             audio.play().catch(err => console.error('Audio play error:', err));
//         }

//         if (song.songList) {
//             const index = song.songList.findIndex(s => s._id === song._id);
//             setCurrentSongIndex(index !== -1 ? index : 0);
//         }

//         return () => {
//             audio.removeEventListener('timeupdate', updateTime);
//             audio.removeEventListener('ended', handleEnded);
//             audio.pause();
//         };
//         // Only depend on song/audioUrl and songList
//     }, [song.audioUrl, song._id, song.songList]);

//     // Play/pause logic: only control playback, don't recreate audio
//     useEffect(() => {
//         const audio = audioRef.current;
//         if (!audio) return;
//         if (isPlaying) {
//             audio.play().catch(err => console.error('Audio play error:', err));
//         } else {
//             audio.pause();
//         }
//     }, [isPlaying]);

//     // Volume logic: only update volume, don't recreate audio
//     useEffect(() => {
//         if (audioRef.current) {
//             audioRef.current.volume = volume;
//         }
//     }, [volume]);

//     useEffect(() => {
//         const handleInactivity = () => {
//             if (document.hidden && isPlaying) setIsAnimating(true);
//             else setIsAnimating(false);
//         };
//         document.addEventListener('visibilitychange', handleInactivity);
//         return () => {
//             document.removeEventListener('visibilitychange', handleInactivity);
//         };
//     }, [isPlaying]);

//     const togglePlay = () => {
//         if (audioRef.current && song.audioUrl) {
//             setIsPlaying((prev) => !prev);
//         }
//     };

//     const handleNextSong = () => {
//         if (!song.songList || song.songList.length === 0) return;
//         const nextIndex = (currentSongIndex + 1) % song.songList.length;
//         const newSong = { ...song.songList[nextIndex], songList: song.songList };
//         setCurrentSongIndex(nextIndex);
//         if (onSongChange) onSongChange(newSong);
//     };

//     const handlePreviousSong = () => {
//         if (!song.songList || song.songList.length === 0) return;
//         const prevIndex = (currentSongIndex - 1 + song.songList.length) % song.songList.length;
//         const newSong = { ...song.songList[prevIndex], songList: song.songList };
//         setCurrentSongIndex(prevIndex);
//         if (onSongChange) onSongChange(newSong);
//     };

//     const handleTimeDrag = (e) => {
//         if (audioRef.current && audioRef.current.duration) {
//             const time = (e.target.value / 100) * audioRef.current.duration;
//             audioRef.current.currentTime = time;
//             setCurrentTime(time);
//         }
//     };

//     const handleVolumeChange = (e) => {
//         const newVolume = parseFloat(e.target.value);
//         setVolume(newVolume);
//     };

//     const handleMinimize = (e) => {
//         e.stopPropagation();
//         setIsMinimized(!isMinimized);
//     };

//     const formatTime = (seconds) => {
//         const minutes = Math.floor(seconds / 60);
//         const secs = Math.floor(seconds % 60);
//         return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
//     };

//     const duration = audioRef.current ? audioRef.current.duration || 0 : 0;

//     return (
//         <div className={`music-player ${isMinimized ? 'minimized' : ''}`}>
//             {isAnimating && <div className="animate-gradient" />}
//             <button className="close-player-button" onClick={onClose}>✖</button>
//             <div className="player-content">
//                 <img src={song.thumbnailUrl || 'https://placehold.co/100x100/333/FFF?text=♪'} alt={song.title} />
//                 <div className="song-info">
//                     <h4>{song.title}</h4>
//                     <p>{song.singer}</p>
//                 </div>
//                 {!isMinimized && (
//                     <div className="controls">
//                         <div className="time-display">
//                             <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
//                         </div>
//                         <input
//                             type="range"
//                             min="0"
//                             max="100"
//                             value={duration ? (currentTime / duration) * 100 : 0}
//                             onChange={handleTimeDrag}
//                             className="progress-bar"
//                         />
//                         <div className="player-buttons">
//                             <button onClick={handlePreviousSong}><FontAwesomeIcon icon="fa-step-backward" /></button>
//                             <button onClick={togglePlay}>
//                                 <FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} />
//                             </button>
//                             <button onClick={handleNextSong}><FontAwesomeIcon icon="fa-step-forward" /></button>
//                             <input
//                                 type="range"
//                                 min="0"
//                                 max="1"
//                                 step="0.1"
//                                 value={volume}
//                                 onChange={handleVolumeChange}
//                                 className="volume-slider"
//                             />
//                         </div>
//                     </div>
//                 )}
//             </div>
//             <button className="minimize-player-button" onClick={handleMinimize}>
//                 <FontAwesomeIcon icon={isMinimized ? 'fa-chevron-up' : 'fa-chevron-down'} />
//             </button>
//         </div>
//     );
// }

// // ...existing code...

// // --- Main App Component ---
// function App() {
//     return (
//         <Router>
//             <AuthProvider>
//                 <Routes>
//                     <Route path="/" element={<SplashScreen />} />
//                     <Route path="/login" element={<AuthScreen />} />
//                     <Route path="/main" element={<ProtectedRoute><MainScreen /></ProtectedRoute>} />
//                     <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
//                     <Route path="/moods/:moodName" element={<ProtectedRoute><MoodSongsScreen /></ProtectedRoute>} />
//                     <Route path="/genres/:genreName" element={<ProtectedRoute><GenreSongsScreen /></ProtectedRoute>} />
//                     <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetailScreen /></ProtectedRoute>} />
//                 </Routes>
//             </AuthProvider>
//         </Router>
//     );
// }

// export default App;


// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
// import axios from 'axios';

// // FontAwesome Icons
// import { library } from '@fortawesome/fontawesome-svg-core';
// import { fas } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// library.add(fas);

// // --- Auth Context ---
// const AuthContext = React.createContext();

// function AuthProvider({ children }) {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             axios.defaults.headers.Authorization = `Bearer ${token}`;
//             axios
//                 .get('https://music-backend-akb5.onrender.com/api/user/profile')
//                 .then((res) => {
//                     setUser(res.data);
//                 })
//                 .catch((error) => {
//                     console.error('Auth error:', error);
//                     localStorage.removeItem('token');
//                     setUser(null);
//                 })
//                 .finally(() => setLoading(false));
//         } else {
//             setLoading(false);
//         }
//     }, []);

//     const login = (token, userData, navigate) => {
//         localStorage.setItem('token', token);
//         axios.defaults.headers.Authorization = `Bearer ${token}`;
//         setUser(userData);
//         sessionStorage.setItem('showWelcome', 'true');
//         navigate('/main');
//     };

//     const logout = (navigate) => {
//         localStorage.removeItem('token');
//         axios.defaults.headers.Authorization = null;
//         setUser(null);
//         sessionStorage.removeItem('showWelcome');
//         navigate('/login');
//     };

//     return (
//         <AuthContext.Provider value={{ user, login, logout, loading }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }

// function useAuth() {
//     return React.useContext(AuthContext);
// }

// function ProtectedRoute({ children }) {
//     const { user, loading } = useAuth();
//     const location = useLocation();

//     if (loading) {
//         return (
//             <div className="loading">
//                 <div></div>
//             </div>
//         );
//     }

//     if (!user) {
//         return <Navigate to="/login" state={{ from: location }} replace />;
//     }

//     return children;
// }

// // --- Splash Screen ---
// function SplashScreen() {
//     const navigate = useNavigate();

//     useEffect(() => {
//         const timer = setTimeout(() => navigate('/login'), 3000);
//         return () => clearTimeout(timer);
//     }, [navigate]);

//     return (
//         <div className="splash-screen">
//             <FontAwesomeIcon icon="fa-music" size="3x" className="animate-spin" />
//             <h1>Gawana</h1>
//             <p>Loading...</p>
//         </div>
//     );
// }

// // --- Auth Screen ---
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
//             login(res.data.token, res.data.user, navigate);
//         } catch (error) {
//             console.error('Auth error:', error);
//             setMessage(isLogin ? 'Login failed: ' + (error.response?.data?.message || 'Unknown error') : 'Signup failed: ' + (error.response?.data?.message || 'Unknown error'));
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) return (
//         <div className="loading">
//             <div></div>
//         </div>
//     );

//     return (
//         <div className="auth-screen">
//             <form onSubmit={handleSubmit} className="auth-form">
//                 <h2>{isLogin ? 'Login' : 'Signup'}</h2>
//                 {!isLogin && (
//                     <input
//                         type="text"
//                         value={fullName}
//                         onChange={(e) => setFullName(e.target.value)}
//                         placeholder="Full Name"
//                         required
//                     />
//                 )}
//                 <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Email"
//                     required
//                 />
//                 <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Password"
//                     required
//                 />
//                 <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
//                 <p className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
//                     {isLogin ? 'Need an account? Signup' : 'Already have an account? Login'}
//                 </p>
//                 {message && <div className="error-message">{message}</div>}
//             </form>
//         </div>
//     );
// }

// // --- Navbar Component ---
// function Navbar({ onSearch, searchQuery, setSearchQuery, toggleSidebar }) {
//     const navigate = useNavigate();

//     return (
//         <div className="navbar">
//             <div className="navbar-logo" onClick={() => navigate('/main')}>Gawana</div>
//             <div className="navbar-right">
//                 <div
//                     className="search-box"
//                     onClick={() => {
//                         setSearchQuery(prev => (prev ? '' : 'search'));
//                         setTimeout(() => document.querySelector('.search-input')?.focus(), 0);
//                     }}
//                 >
//                     <FontAwesomeIcon icon="fa-search" />
//                 </div>
//                 <div className="sidebar-toggle" onClick={toggleSidebar}>
//                     ☰
//                 </div>
//             </div>
//         </div>
//     );
// }

// // --- Sidebar Component ---
// function Sidebar({ isOpen, onClose }) {
//     const navigate = useNavigate();
//     const { user, logout } = useAuth();
//     const sidebarRef = useRef(null);
//     const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
//     const [playlists, setPlaylists] = useState([]);
//     const [loadingPlaylists, setLoadingPlaylists] = useState(false);
//     const [showModeDropdown, setShowModeDropdown] = useState(false);
//     const [mode, setMode] = useState(localStorage.getItem('mode') || 'dark');

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//                 onClose();
//             }
//         };
//         if (isOpen) {
//             document.addEventListener('mousedown', handleClickOutside);
//         } else {
//             document.removeEventListener('mousedown', handleClickOutside);
//             setShowPlaylistDropdown(false);
//             setShowModeDropdown(false);
//         }
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [isOpen, onClose]);

//     useEffect(() => {
//         localStorage.setItem('mode', mode);
//         document.body.dataset.mode = mode;
//     }, [mode]);

//     const fetchPlaylists = useCallback(async () => {
//         setLoadingPlaylists(true);
//         try {
//             const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//             });
//             setPlaylists(res.data);
//         } catch (error) {
//             console.error('Failed to fetch playlists:', error);
//             setPlaylists([]);
//         } finally {
//             setLoadingPlaylists(false);
//         }
//     }, []);

//     const handlePlaylistClick = () => {
//         if (!showPlaylistDropdown) {
//             fetchPlaylists();
//         }
//         setShowPlaylistDropdown(!showPlaylistDropdown);
//     };

//     const handleLogout = () => {
//         logout(navigate);
//         onClose();
//     };

//     const handleAccountClick = () => {
//         navigate('/account');
//         onClose();
//     };

//     const handleModeHover = (isHovering) => {
//         setShowModeDropdown(isHovering);
//     };

//     const handleModeSelect = (mode) => {
//         setMode(mode.toLowerCase());
//         onClose();
//     };

//     const handlePlaylistNameClick = (playlistId) => {
//         navigate(`/playlist/${playlistId}`);
//         onClose();
//     };

//     const handleCreatePlaylist = async () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName) {
//             try {
//                 await axios.post('https://music-backend-akb5.onrender.com/api/playlists', { name: playlistName }, {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//                 });
//                 fetchPlaylists();
//             } catch (error) {
//                 console.error('Failed to create playlist:', error);
//             }
//         }
//     };

//     return (
//         <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
//             <a href="#" onClick={handleAccountClick}>Account</a>
//             <div
//                 className="sidebar-item-with-dropdown"
//                 onMouseEnter={() => handleModeHover(true)}
//                 onMouseLeave={() => handleModeHover(false)}
//             >
//                 <a href="#" onClick={(e) => e.preventDefault()}>Mode</a>
//                 {showModeDropdown && (
//                     <div className="mode-dropdown">
//                         <span onClick={() => handleModeSelect('Dark')}>Dark</span>
//                         <span onClick={() => handleModeSelect('Light')}>Light</span>
//                         <span onClick={() => handleModeSelect('Neon')}>Neon</span>
//                     </div>
//                 )}
//             </div>
//             <a href="#" onClick={(e) => { e.preventDefault(); handlePlaylistClick(); }}>Playlist</a>
//             {showPlaylistDropdown && (
//                 <div className="playlist-dropdown">
//                     {loadingPlaylists ? (
//                         <span>Loading playlists...</span>
//                     ) : playlists.length > 0 ? (
//                         <>
//                             {playlists.map(playlist => (
//                                 <span key={playlist._id} onClick={() => handlePlaylistNameClick(playlist._id)}>
//                                     {playlist.name}
//                                 </span>
//                             ))}
//                             <span onClick={handleCreatePlaylist} className="create-playlist">
//                                 <FontAwesomeIcon icon="fa-plus" /> Create New Playlist
//                             </span>
//                         </>
//                     ) : (
//                         <>
//                             <span>No playlists found. Create one</span>
//                             <span onClick={handleCreatePlaylist} className="create-playlist">
//                                 <FontAwesomeIcon icon="fa-plus" /> Create New Playlist
//                             </span>
//                         </>
//                     )}
//                 </div>
//             )}
//             {user && <a href="#" onClick={handleLogout}>Logout</a>}
//         </div>
//     );
// }

// function MainScreen({ selectedSong, setSelectedSong }) {
//     const { user } = useAuth();
//     const [songs, setSongs] = useState({ moods: {}, genres: {} });
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [playlistSongIds, setPlaylistSongIds] = useState([]);
//     const navigate = useNavigate();

//     const moodCategories = ['happy', 'sad', 'love', 'calm'];
//     const genreCategories = ['travel', 'party', 'rap', 'motivational', 'pop'];

//     useEffect(() => {
//         if (sessionStorage.getItem('showWelcome') === 'true' && user) {
//             setShowWelcomeMessage(true);
//             sessionStorage.removeItem('showWelcome');
//             const timer = setTimeout(() => {
//                 setShowWelcomeMessage(false);
//             }, 3000);
//             return () => clearTimeout(timer);
//         }
//     }, [user]);

//     useEffect(() => {
//         const fetchPlaylistSongs = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 const res = await axios.get(`https://music-backend-akb5.onrender.com/api/playlists`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 const allSongIds = res.data.flatMap(p => p.songs.map(s => s._id));
//                 setPlaylistSongIds(allSongIds);
//             } catch (err) {
//                 console.error('Failed to fetch playlist songs:', err);
//             }
//         };
//         fetchPlaylistSongs();
//     }, []);

//     useEffect(() => {
//         const fetchSongs = async () => {
//             setLoading(true);
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/songs', {
//                     timeout: 5000,
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//                 });
//                 const categorizedSongs = { moods: {}, genres: {} };
//                 res.data.forEach(song => {
//                     if (song.mood && moodCategories.includes(song.mood.toLowerCase())) {
//                         categorizedSongs.moods[song.mood.toLowerCase()] = categorizedSongs.moods[song.mood.toLowerCase()] || [];
//                         categorizedSongs.moods[song.mood.toLowerCase()].push(song);
//                     }
//                     if (song.genre && genreCategories.includes(song.genre.toLowerCase())) {
//                         categorizedSongs.genres[song.genre.toLowerCase()] = categorizedSongs.genres[song.genre.toLowerCase()] || [];
//                         categorizedSongs.genres[song.genre.toLowerCase()].push(song);
//                     }
//                 });
//                 setSongs(categorizedSongs);
//             } catch (error) {
//                 console.error('Fetch error:', error);
//                 setSongs({ moods: {}, genres: {} });
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchSongs();
//     }, []);

//     const debouncedSearch = useMemo(() => {
//         const debounce = (func, delay) => {
//             let timeoutId;
//             return (...args) => {
//                 clearTimeout(timeoutId);
//                 timeoutId = setTimeout(() => func(...args), delay);
//             };
//         };
//         const performSearch = async (query) => {
//             if (!query.trim()) {
//                 setSearchResults([]);
//                 return;
//             }
//             setLoading(true);
//             try {
//                 const res = await axios.get(`https://music-backend-akb5.onrender.com/api/songs?search=${encodeURIComponent(query)}`, { timeout: 5000 });
//                 setSearchResults(Array.isArray(res.data) ? res.data : []);
//             } catch (error) {
//                 console.error('Search error:', error);
//                 setSearchResults([]);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         return debounce(performSearch, 300);
//     }, []);

//     useEffect(() => {
//         debouncedSearch(searchQuery);
//     }, [searchQuery, debouncedSearch]);

//     const toggleSidebar = () => {
//         setIsSidebarOpen(!isSidebarOpen);
//     };

//     const handleSongChange = (newSong) => {
//         setSelectedSong(newSong);
//     };

//     const handleAddToPlaylist = async (songId) => {
//         setShowPlaylistModal(true);
//         setSongToAdd(songId);
//         setAddMessage('');
//         setLoadingPlaylists(true);
//         try {
//             const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//             });
//             setUserPlaylists(res.data || []);
//         } catch (err) {
//             setUserPlaylists([]);
//         } finally {
//             setLoadingPlaylists(false);
//         }
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         setAddMessage('');
//         try {
//             const playlistRes = await axios.get(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//             );
//             const currentSongs = (playlistRes.data.songs || []).map(s => s._id);
//             const updatedSongs = currentSongs.includes(songToAdd) ? currentSongs : [...currentSongs, songToAdd];
//             await axios.put(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { name: playlistRes.data.name, songs: updatedSongs },
//                 { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//             );
//             setAddMessage('Song added to playlist!');
//             setPlaylistSongIds(prev => [...prev, songToAdd]);
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setSongToAdd(null);
//                 setAddMessage('');
//             }, 1000);
//         } catch (err) {
//             setAddMessage('Failed to add song.');
//         }
//     };

//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [userPlaylists, setUserPlaylists] = useState([]);
//     const [loadingPlaylists, setLoadingPlaylists] = useState(false);
//     const [addMessage, setAddMessage] = useState('');

//     if (loading && !searchQuery) return (
//         <div className="loading">
//             <div></div>
//         </div>
//     );

//     return (
//         <div className="main-screen">
//             <Navbar
//                 onSearch={() => {}}
//                 searchQuery={searchQuery}
//                 setSearchQuery={setSearchQuery}
//                 toggleSidebar={toggleSidebar}
//             />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

//             <div className="content-area">
//                 {searchQuery && (
//                     <div className="search-overlay">
//                         <input
//                             type="text"
//                             value={searchQuery === 'search' ? '' : searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                             className="search-input"
//                             placeholder="Search songs (e.g., hum nava mere, Arijit, love, party)..."
//                             autoFocus
//                         />
//                         <div className="search-results">
//                             {searchQuery.trim() && searchQuery !== 'search' ? (
//                                 loading ? (
//                                     <div className="card empty">Searching...</div>
//                                 ) : searchResults.length > 0 ? (
//                                     <div className="songs-column">
//                                         {searchResults.map(song => (
//                                             <div key={song._id} className="song-card full-line" onClick={() => setSelectedSong({ ...song, songList: searchResults })}>
//                                                 <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
//                                                 <div className="song-details">
//                                                     <h4>{song.title}</h4>
//                                                     <p>{song.singer}</p>
//                                                     <p style={{ fontSize: '0.85rem', color: '#a78bfa', margin: 0 }}>
//                                                         {song.mood ? `Mood: ${song.mood}` : ''} {song.genre ? `| Genre: ${song.genre}` : ''} {song.movie ? `| Movie: ${song.movie}` : ''}
//                                                     </p>
//                                                 </div>
//                                                 {!playlistSongIds.includes(song._id) && (
//                                                     <button className="add-song-button" onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(song._id); }}>
//                                                         <FontAwesomeIcon icon="fa-plus" />
//                                                     </button>
//                                                 )}
//                                             </div>
//                                         ))}
//                                     </div>
//                                 ) : (
//                                     <div className="card empty">No songs found for "{searchQuery}"</div>
//                                 )
//                             ) : null}
//                         </div>
//                     </div>
//                 )}

//                 {!searchQuery && (
//                     <>
//                         {showWelcomeMessage && user && (
//                             <div className="welcome-message animate-fade-in-out">
//                                 Welcome, {user.fullName.split(' ')[0]}!
//                             </div>
//                         )}
//                         <div className="main-content">
//                             <section className="mood-section">
//                                 <h2>Moods</h2>
//                                 <div className="mood-cards">
//                                     {moodCategories.map((mood) => (
//                                         <div key={mood} className={`mood-card ${mood}`} onClick={() => navigate(`/moods/${mood}`)}>
//                                             <h3>{mood.charAt(0).toUpperCase() + mood.slice(1)}</h3>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </section>
//                             <section className="genre-section">
//                                 <h2>Genres</h2>
//                                 <div className="mood-cards">
//                                     {genreCategories.map((genre) => (
//                                         <div key={genre} className={`mood-card ${genre}`} onClick={() => navigate(`/genres/${genre}`)}>
//                                             <h3>{genre.charAt(0).toUpperCase() + genre.slice(1)}</h3>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </section>
//                         </div>
//                     </>
//                 )}
//             </div>
//             {showPlaylistModal && (
//                 <div className="playlist-modal-overlay" onClick={() => setShowPlaylistModal(false)}>
//                     <div className="playlist-modal" onClick={e => e.stopPropagation()}>
//                         <h4>Select Playlist</h4>
//                         {loadingPlaylists ? (
//                             <div>Loading...</div>
//                         ) : userPlaylists.length > 0 ? (
//                             <ul>
//                                 {userPlaylists.map(pl => (
//                                     <li key={pl._id}>
//                                         <button className="playlist-modal-btn" onClick={() => handleSelectPlaylist(pl._id)}>
//                                             {pl.name}
//                                         </button>
//                                     </li>
//                                 ))}
//                             </ul>
//                         ) : (
//                             <div>No playlists found.</div>
//                         )}
//                         {addMessage && <div className="playlist-modal-message">{addMessage}</div>}
//                         <button className="playlist-modal-cancel" onClick={() => setShowPlaylistModal(false)}>Cancel</button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// // --- Mood Songs Screen ---
// function MoodSongsScreen({ selectedSong, setSelectedSong }) {
//     const { moodName } = useParams();
//     const [allSongs, setAllSongs] = useState([]);
//     const [moodSongs, setMoodSongs] = useState([]);
//     const [playlistSongIds, setPlaylistSongIds] = useState([]);
//     const [loadingMoodSongs, setLoadingMoodSongs] = useState(true);
//     const [error, setError] = useState('');
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [userPlaylists, setUserPlaylists] = useState([]);
//     const [loadingPlaylists, setLoadingPlaylists] = useState(false);
//     const [addMessage, setAddMessage] = useState('');
//     const navigate = useNavigate();
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoadingMoodSongs(true);
//             setError('');
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/songs', {
//                     timeout: 5000,
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 const songs = Array.isArray(res.data) ? res.data : [];
//                 setAllSongs(songs);
//                 setMoodSongs(songs.filter(song => song.mood && song.mood.toLowerCase().includes(moodName.toLowerCase())));
//                 const playlistRes = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', { headers: { Authorization: `Bearer ${token}` } });
//                 const allSongIds = (playlistRes.data || []).flatMap(pl => (pl.songs || []).map(s => s._id));
//                 setPlaylistSongIds(allSongIds);
//             } catch (err) {
//                 setError('Failed to load songs or playlists.');
//                 setMoodSongs([]);
//             } finally {
//                 setLoadingMoodSongs(false);
//             }
//         };
//         fetchData();
//     }, [moodName, token]);

//     const handleAddToPlaylist = async (songId) => {
//         setSongToAdd(songId);
//         setShowPlaylistModal(true);
//         setAddMessage('');
//         setLoadingPlaylists(true);
//         try {
//             const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setUserPlaylists(res.data || []);
//         } catch (err) {
//             setUserPlaylists([]);
//         } finally {
//             setLoadingPlaylists(false);
//         }
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         setAddMessage('');
//         try {
//             const playlistRes = await axios.get(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             const currentSongs = (playlistRes.data.songs || []).map(s => s._id);
//             const updatedSongs = currentSongs.includes(songToAdd) ? currentSongs : [...currentSongs, songToAdd];
//             await axios.put(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { name: playlistRes.data.name, songs: updatedSongs },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             setAddMessage('Song added to playlist!');
//             setPlaylistSongIds(prev => [...prev, songToAdd]);
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setSongToAdd(null);
//                 setAddMessage('');
//             }, 1000);
//         } catch (err) {
//             setAddMessage('Failed to add song.');
//         }
//     };

//     const handleSongChange = (newSong) => {
//         setSelectedSong(newSong);
//     };

//     const displayName = moodName.charAt(0).toUpperCase() + moodName.slice(1);

//     return (
//         <div className="mood-songs-screen">
//             <Navbar onSearch={() => {}} searchQuery="" setSearchQuery={() => {}} toggleSidebar={() => {}} />
//             <div className="content-area">
//                 <h2>{displayName} Songs</h2>
//                 {loadingMoodSongs ? (
//                     <p className="loading-message">Fetching songs of {displayName}...</p>
//                 ) : error ? (
//                     <p className="error-message">{error}</p>
//                 ) : moodSongs.length > 0 ? (
//                     <div className="songs-column">
//                         {moodSongs.map(song => (
//                             <div key={song._id} className="song-card full-line" onClick={() => setSelectedSong({ ...song, songList: moodSongs })}>
//                                 <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
//                                 <div className="song-details">
//                                     <h4>{song.title}</h4>
//                                     <p>{song.singer}</p>
//                                     <p style={{ fontSize: '0.85rem', color: '#a78bfa', margin: 0 }}>
//                                         {song.genre ? `Genre: ${song.genre}` : ''}
//                                     </p>
//                                 </div>
//                                 {!playlistSongIds.includes(song._id) && (
//                                     <button className="add-song-button" onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(song._id); }}>
//                                         <FontAwesomeIcon icon="fa-plus" />
//                                     </button>
//                                 )}
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <p className="no-songs-message">No songs available for {displayName}.</p>
//                 )}
//             </div>

//             {showPlaylistModal && (
//                 <div className="playlist-modal-overlay" onClick={() => setShowPlaylistModal(false)}>
//                     <div className="playlist-modal" onClick={e => e.stopPropagation()}>
//                         <h4>Select Playlist</h4>
//                         {loadingPlaylists ? (
//                             <div>Loading...</div>
//                         ) : userPlaylists.length > 0 ? (
//                             <ul>
//                                 {userPlaylists.map(pl => (
//                                     <li key={pl._id}>
//                                         <button className="playlist-modal-btn" onClick={() => handleSelectPlaylist(pl._id)}>
//                                             {pl.name}
//                                         </button>
//                                     </li>
//                                 ))}
//                             </ul>
//                         ) : (
//                             <div>No playlists found.</div>
//                         )}
//                         {addMessage && <div className="playlist-modal-message">{addMessage}</div>}
//                         <button className="playlist-modal-cancel" onClick={() => setShowPlaylistModal(false)}>Cancel</button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// // --- Genre Songs Screen ---
// function GenreSongsScreen({ selectedSong, setSelectedSong }) {
//     const { genreName } = useParams();
//     const [allSongs, setAllSongs] = useState([]);
//     const [genreSongs, setGenreSongs] = useState([]);
//     const [playlistSongIds, setPlaylistSongIds] = useState([]);
//     const [loadingGenreSongs, setLoadingGenreSongs] = useState(true);
//     const [error, setError] = useState('');
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [userPlaylists, setUserPlaylists] = useState([]);
//     const [loadingPlaylists, setLoadingPlaylists] = useState(false);
//     const [addMessage, setAddMessage] = useState('');
//     const navigate = useNavigate();
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoadingGenreSongs(true);
//             setError('');
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/songs', {
//                     timeout: 5000,
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 const songs = Array.isArray(res.data) ? res.data : [];
//                 setAllSongs(songs);
//                 setGenreSongs(songs.filter(song => song.genre && song.genre.toLowerCase().includes(genreName.toLowerCase())));
//                 const playlistRes = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', { headers: { Authorization: `Bearer ${token}` } });
//                 const allSongIds = (playlistRes.data || []).flatMap(pl => (pl.songs || []).map(s => s._id));
//                 setPlaylistSongIds(allSongIds);
//             } catch (err) {
//                 setError('Failed to load songs or playlists.');
//                 setGenreSongs([]);
//             } finally {
//                 setLoadingGenreSongs(false);
//             }
//         };
//         fetchData();
//     }, [genreName, token]);

//     const handleAddToPlaylist = async (songId) => {
//         setSongToAdd(songId);
//         setShowPlaylistModal(true);
//         setAddMessage('');
//         setLoadingPlaylists(true);
//         try {
//             const res = await axios.get('https://music-backend-akb5.onrender.com/api/playlists', {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setUserPlaylists(res.data || []);
//         } catch (err) {
//             setUserPlaylists([]);
//         } finally {
//             setLoadingPlaylists(false);
//         }
//     };

//     const handleSelectPlaylist = async (playlistId) => {
//         setAddMessage('');
//         try {
//             const playlistRes = await axios.get(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             const currentSongs = (playlistRes.data.songs || []).map(s => s._id);
//             const updatedSongs = currentSongs.includes(songToAdd) ? currentSongs : [...currentSongs, songToAdd];
//             await axios.put(
//                 `https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`,
//                 { name: playlistRes.data.name, songs: updatedSongs },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             setAddMessage('Song added to playlist!');
//             setPlaylistSongIds(prev => [...prev, songToAdd]);
//             setTimeout(() => {
//                 setShowPlaylistModal(false);
//                 setSongToAdd(null);
//                 setAddMessage('');
//             }, 1000);
//         } catch (err) {
//             setAddMessage('Failed to add song.');
//         }
//     };

//     const handleSongChange = (newSong) => {
//         setSelectedSong(newSong);
//     };

//     const displayName = genreName.charAt(0).toUpperCase() + genreName.slice(1);

//     return (
//         <div className="mood-songs-screen">
//             <Navbar onSearch={() => {}} searchQuery="" setSearchQuery={() => {}} toggleSidebar={() => {}} />
//             <div className="content-area">
//                 <h2>{displayName} Songs</h2>
//                 {loadingGenreSongs ? (
//                     <p className="loading-message">Fetching songs of {displayName}...</p>
//                 ) : error ? (
//                     <p className="error-message">{error}</p>
//                 ) : genreSongs.length > 0 ? (
//                     <div className="songs-column">
//                         {genreSongs.map(song => (
//                             <div key={song._id} className="song-card full-line" onClick={() => setSelectedSong({ ...song, songList: genreSongs })}>
//                                 <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
//                                 <div className="song-details">
//                                     <h4>{song.title}</h4>
//                                     <p>{song.singer}</p>
//                                     <p style={{ fontSize: '0.85rem', color: '#a78bfa', margin: 0 }}>
//                                         {song.mood ? `Mood: ${song.mood}` : ''}
//                                     </p>
//                                 </div>
//                                 {!playlistSongIds.includes(song._id) && (
//                                     <button className="add-song-button" onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(song._id); }}>
//                                         <FontAwesomeIcon icon="fa-plus" />
//                                     </button>
//                                 )}
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <p className="no-songs-message">No songs available for {displayName}.</p>
//                 )}
//             </div>

//             {showPlaylistModal && (
//                 <div className="playlist-modal-overlay" onClick={() => setShowPlaylistModal(false)}>
//                     <div className="playlist-modal" onClick={e => e.stopPropagation()}>
//                         <h4>Select Playlist</h4>
//                         {loadingPlaylists ? (
//                             <div>Loading...</div>
//                         ) : userPlaylists.length > 0 ? (
//                             <ul>
//                                 {userPlaylists.map(pl => (
//                                     <li key={pl._id}>
//                                         <button className="playlist-modal-btn" onClick={() => handleSelectPlaylist(pl._id)}>
//                                             {pl.name}
//                                         </button>
//                                     </li>
//                                 ))}
//                             </ul>
//                         ) : (
//                             <div>No playlists found.</div>
//                         )}
//                         {addMessage && <div className="playlist-modal-message">{addMessage}</div>}
//                         <button className="playlist-modal-cancel" onClick={() => setShowPlaylistModal(false)}>Cancel</button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// // --- Account Screen ---
// function Account({ selectedSong, setSelectedSong }) {
//     const { user } = useAuth();
//     const [profile, setProfile] = useState(null);
//     const [loadingProfile, setLoadingProfile] = useState(true);
//     const [message, setMessage] = useState('');
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchProfile = async () => {
//             setLoadingProfile(true);
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/user/profile');
//                 setProfile(res.data);
//             } catch (error) {
//                 console.error('Failed to fetch profile:', error);
//                 setMessage('Failed to load profile details.');
//             } finally {
//                 setLoadingProfile(false);
//             }
//         };
//         fetchProfile();
//     }, []);

//     const handleUpdateProfile = async () => {
//         const newFullName = prompt("Enter new full name:", profile?.fullName);
//         if (newFullName && newFullName !== profile.fullName) {
//             try {
//                 const res = await axios.put('https://music-backend-akb5.onrender.com/api/user/profile', { fullName: newFullName }, {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//                 });
//                 setProfile(res.data);
//                 setMessage('Profile updated successfully!');
//             } catch (error) {
//                 console.error('Failed to update profile:', error);
//                 setMessage('Failed to update profile: ' + (error.response?.data?.message || 'Unknown error'));
//             }
//         }
//     };

//     if (loadingProfile) return (
//         <div className="loading">
//             <div></div>
//         </div>
//     );

//     return (
//         <div className="account-screen">
//             <Navbar
//                 onSearch={() => {}}
//                 searchQuery=""
//                 setSearchQuery={() => {}}
//                 toggleSidebar={() => {}}
//             />
//             <div className="content-area">
//                 <h2>Account Details</h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {profile ? (
//                     <>
//                         <p><strong>Full Name:</strong> {profile.fullName}</p>
//                         <p><strong>Email:</strong> {profile.email}</p>
//                         <p><strong>Join Date:</strong> {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('en-GB', {
//                             day: '2-digit',
//                             month: 'long',
//                             year: 'numeric'
//                         }) : 'N/A'}</p>
//                         <button className="edit-profile-button" onClick={handleUpdateProfile}>Edit Profile</button>
//                     </>
//                 ) : (
//                     <p>No profile data available.</p>
//                 )}
//             </div>
//         </div>
//     );
// }

// // --- Playlist Detail Screen ---
// function PlaylistDetailScreen({ selectedSong, setSelectedSong }) {
//     const { playlistId } = useParams();
//     const [playlist, setPlaylist] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [message, setMessage] = useState('');
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchPlaylist = async () => {
//             const token = localStorage.getItem('token');
//             setLoading(true);
//             setMessage('');

//             if (!token) {
//                 setMessage('No authentication token found. Please log in.');
//                 setLoading(false);
//                 return;
//             }

//             try {
//                 const res = await axios.get(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                     timeout: 10000,
//                 });
//                 setPlaylist(res.data);
//             } catch (error) {
//                 const errMsg = error.response
//                     ? `Status: ${error.response.status}, Message: ${error.response.data?.message || 'Unknown error'}`
//                     : error.message;
//                 console.error('Fetch error:', errMsg);
//                 setMessage(`Failed to load playlist. ${errMsg}`);
//                 setPlaylist(null);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (playlistId) fetchPlaylist();
//     }, [playlistId]);

//     const handleRemoveSong = async (songIdToRemove) => {
//         if (!window.confirm('Are you sure you want to remove this song?')) return;

//         setLoading(true);
//         setMessage('');

//         try {
//             const token = localStorage.getItem('token');
//             const updatedSongs = playlist.songs.filter(s => s._id !== songIdToRemove).map(s => s._id);

//             await axios.put(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, {
//                 name: playlist.name,
//                 songs: updatedSongs,
//             }, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             setPlaylist(prev => ({
//                 ...prev,
//                 songs: prev.songs.filter(s => s._id !== songIdToRemove)
//             }));
//             setMessage('Song removed successfully!');
//         } catch (error) {
//             console.error('Remove song error:', error.message);
//             setMessage('Failed to remove song.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleEditPlaylist = async () => {
//         const newName = prompt('Enter new playlist name:', playlist.name);
//         if (newName && newName !== playlist.name) {
//             try {
//                 await axios.put(`https://music-backend-akb5.onrender.com/api/playlists/${playlistId}`, {
//                     name: newName,
//                     songs: playlist.songs.map(s => s._id),
//                 }, {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//                 });
//                 setPlaylist(prev => ({ ...prev, name: newName }));
//                 setMessage('Playlist name updated successfully!');
//             } catch (error) {
//                 console.error('Failed to update playlist name:', error);
//                 setMessage('Failed to update playlist name.');
//             }
//         }
//     };

//     const handleSongChange = (newSong) => {
//         setSelectedSong(newSong);
//     };

//     if (loading) {
//         return (
//             <div className="content-area">
//                 <p>Loading...</p>
//             </div>
//         );
//     }

//     if (!playlist) {
//         return (
//             <div className="playlist-detail-screen content-area">
//                 <p>{message || 'Playlist not found.'}</p>
//             </div>
//         );
//     }

//     return (
//         <div className="playlist-detail-screen">
//             <Navbar
//                 onSearch={() => {}}
//                 searchQuery=""
//                 setSearchQuery={() => {}}
//                 toggleSidebar={() => {}}
//             />
//             <div className="content-area">
//                 <h2>
//                     {playlist.name}
//                     <button className="edit-playlist-button" onClick={handleEditPlaylist}>
//                         <FontAwesomeIcon icon="fa-pencil" />
//                     </button>
//                 </h2>
//                 {message && <div className="info-message">{message}</div>}

//                 {playlist.songs && playlist.songs.length > 0 ? (
//                     <div className="songs-column">
//                         {playlist.songs.map(song => (
//                             <div
//                                 key={song._id}
//                                 className="song-card full-line"
//                                 onClick={() => setSelectedSong({ ...song, songList: playlist.songs })}
//                             >
//                                 <img
//                                     src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'}
//                                     alt={song.title}
//                                     className="song-thumbnail"
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
//                     <p>Your playlist is empty. Add songs to enjoy your music!</p>
//                 )}
//             </div>
//         </div>
//     );
// }

// // --- Music Player Component ---
// function MusicPlayer({ song, onClose, onSongChange }) {
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [volume, setVolume] = useState(0.5);
//     const audioRef = useRef(null);
//     const [isAnimating, setIsAnimating] = useState(false);
//     const [isMinimized, setIsMinimized] = useState(false);
//     const [currentSongIndex, setCurrentSongIndex] = useState(0);

//     // Manage single audio instance
//     useEffect(() => {
//         if (!song?.audioUrl) {
//             if (audioRef.current) {
//                 audioRef.current.pause();
//                 audioRef.current.src = '';
//             }
//             return;
//         }

//         // Clean up previous audio and stop any existing playback
//         if (audioRef.current) {
//             audioRef.current.pause();
//             audioRef.current.src = '';
//         }

//         const audio = new Audio(song.audioUrl);
//         audio.volume = volume;
//         audio.preload = 'auto';
//         audio.onerror = () => console.error('Audio load error for:', song.audioUrl);

//         const updateTime = () => setCurrentTime(audio.currentTime);
//         const handleEnded = () => {
//             handleNextSong();
//         };

//         audio.addEventListener('timeupdate', updateTime);
//         audio.addEventListener('ended', handleEnded);

//         audioRef.current = audio;
//         setCurrentTime(0);

//         // Play only if isPlaying is true
//         if (isPlaying) {
//             audio.play().catch(err => console.error('Audio play error:', err));
//         }

//         if (song.songList) {
//             const index = song.songList.findIndex(s => s._id === song._id);
//             setCurrentSongIndex(index !== -1 ? index : 0);
//         }

//         return () => {
//             audio.removeEventListener('timeupdate', updateTime);
//             audio.removeEventListener('ended', handleEnded);
//             // Do not pause here to allow continuous playback
//         };
//     }, [song?.audioUrl, song?._id, song?.songList]);

//     useEffect(() => {
//         const audio = audioRef.current;
//         if (!audio) return;
//         if (isPlaying) {
//             audio.play().catch(err => console.error('Audio play error:', err));
//         } else {
//             audio.pause();
//         }
//     }, [isPlaying]);

//     useEffect(() => {
//         if (audioRef.current) {
//             audioRef.current.volume = volume;
//         }
//     }, [volume]);

//     useEffect(() => {
//         const handleInactivity = () => {
//             if (document.hidden && isPlaying) setIsAnimating(true);
//             else setIsAnimating(false);
//         };
//         document.addEventListener('visibilitychange', handleInactivity);
//         return () => {
//             document.removeEventListener('visibilitychange', handleInactivity);
//         };
//     }, [isPlaying]);

//     const togglePlay = () => {
//         if (audioRef.current && song?.audioUrl) {
//             setIsPlaying((prev) => !prev);
//         }
//     };

//     const handleNextSong = () => {
//         if (!song?.songList || song.songList.length === 0) return;
//         const nextIndex = (currentSongIndex + 1) % song.songList.length;
//         const newSong = { ...song.songList[nextIndex], songList: song.songList };
//         setCurrentSongIndex(nextIndex);
//         if (onSongChange) onSongChange(newSong);
//     };

//     const handlePreviousSong = () => {
//         if (!song?.songList || song.songList.length === 0) return;
//         const prevIndex = (currentSongIndex - 1 + song.songList.length) % song.songList.length;
//         const newSong = { ...song.songList[prevIndex], songList: song.songList };
//         setCurrentSongIndex(prevIndex);
//         if (onSongChange) onSongChange(newSong);
//     };

//     const handleTimeDrag = (e) => {
//         if (audioRef.current && audioRef.current.duration) {
//             const time = (e.target.value / 100) * audioRef.current.duration;
//             audioRef.current.currentTime = time;
//             setCurrentTime(time);
//         }
//     };

//     const handleVolumeChange = (e) => {
//         const newVolume = parseFloat(e.target.value);
//         setVolume(newVolume);
//     };

//     const handleMinimize = (e) => {
//         e.stopPropagation();
//         setIsMinimized(!isMinimized);
//     };

//     const formatTime = (seconds) => {
//         const minutes = Math.floor(seconds / 60);
//         const secs = Math.floor(seconds % 60);
//         return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
//     };

//     const duration = audioRef.current ? audioRef.current.duration || 0 : 0;

//     return (
//         <div className={`music-player ${isMinimized ? 'minimized' : ''}`}>
//             {isAnimating && <div className="animate-gradient" />}
//             <button className="close-player-button" onClick={onClose}>✖</button>
//             <div className="player-content">
//                 <img src={song?.thumbnailUrl || 'https://placehold.co/100x100/333/FFF?text=♪'} alt={song?.title} />
//                 <div className="song-info">
//                     <h4>{song?.title}</h4>
//                     <p>{song?.singer}</p>
//                 </div>
//                 {!isMinimized && (
//                     <div className="controls">
//                         <div className="time-display">
//                             <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
//                         </div>
//                         <input
//                             type="range"
//                             min="0"
//                             max="100"
//                             value={duration ? (currentTime / duration) * 100 : 0}
//                             onChange={handleTimeDrag}
//                             className="progress-bar"
//                         />
//                         <div className="player-buttons">
//                             <button onClick={handlePreviousSong}><FontAwesomeIcon icon="fa-step-backward" /></button>
//                             <button onClick={togglePlay}>
//                                 <FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} />
//                             </button>
//                             <button onClick={handleNextSong}><FontAwesomeIcon icon="fa-step-forward" /></button>
//                             <input
//                                 type="range"
//                                 min="0"
//                                 max="1"
//                                 step="0.1"
//                                 value={volume}
//                                 onChange={handleVolumeChange}
//                                 className="volume-slider"
//                             />
//                         </div>
//                     </div>
//                 )}
//             </div>
//             <button className="minimize-player-button" onClick={handleMinimize}>
//                 <FontAwesomeIcon icon={isMinimized ? 'fa-chevron-up' : 'fa-chevron-down'} />
//             </button>
//         </div>
//     );
// }

// // --- Main App Component ---
// function App() {
//     const [selectedSong, setSelectedSong] = useState(null);

//     return (
//         <Router>
//             <AuthProvider>
//                 <Routes>
//                     <Route path="/" element={<SplashScreen />} />
//                     <Route path="/login" element={<AuthScreen />} />
//                     <Route path="/main" element={<ProtectedRoute><MainScreen selectedSong={selectedSong} setSelectedSong={setSelectedSong} /></ProtectedRoute>} />
//                     <Route path="/account" element={<ProtectedRoute><Account selectedSong={selectedSong} setSelectedSong={setSelectedSong} /></ProtectedRoute>} />
//                     <Route path="/moods/:moodName" element={<ProtectedRoute><MoodSongsScreen selectedSong={selectedSong} setSelectedSong={setSelectedSong} /></ProtectedRoute>} />
//                     <Route path="/genres/:genreName" element={<ProtectedRoute><GenreSongsScreen selectedSong={selectedSong} setSelectedSong={setSelectedSong} /></ProtectedRoute>} />
//                     <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetailScreen selectedSong={selectedSong} setSelectedSong={setSelectedSong} /></ProtectedRoute>} />
//                 </Routes>
//                 {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} onSongChange={setSelectedSong} />}
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
//             if(audioRef.current) {
//                 audioRef.current.pause();
//                 audioRef.current.src = '';
//             }
//             return;
//         }

//         if (audioRef.current) {
//             audioRef.current.pause();
//         }

//         const audio = new Audio(selectedSong.audioUrl);
//         audio.volume = volume;
//         audio.preload = 'auto';
//         audio.onerror = () => console.error('Audio load error for:', selectedSong.audioUrl);

//         const updateTime = () => setCurrentTime(audio.currentTime);
//         const handleEnded = () => {
//             if (selectedSong.songList && selectedSong.songList.length > 0) {
//                 const nextIndex = (currentSongIndex + 1) % selectedSong.songList.length;
//                 setSelectedSong({ ...selectedSong.songList[nextIndex], songList: selectedSong.songList });
//             }
//         };

//         audio.addEventListener('timeupdate', updateTime);
//         audio.addEventListener('ended', handleEnded);
//         audioRef.current = audio;

//         if (isPlaying) {
//             audio.play().catch(err => console.error('Audio play error:', err));
//         }

//         if (selectedSong.songList) {
//             const index = selectedSong.songList.findIndex(s => s._id === selectedSong._id);
//             setCurrentSongIndex(index !== -1 ? index : 0);
//         }

//         return () => {
//             audio.removeEventListener('timeupdate', updateTime);
//             audio.removeEventListener('ended', handleEnded);
//             audio.pause();
//         };
//     }, [selectedSong?.audioUrl, selectedSong?._id]);

//     useEffect(() => {
//         if (audioRef.current) {
//             audioRef.current.volume = volume;
//         }
//     }, [volume]);

//     useEffect(() => {
//         const audio = audioRef.current;
//         if (!audio) return;
//         if (isPlaying && selectedSong?.audioUrl) {
//             audio.play().catch(err => console.error('Audio play error:', err));
//         } else {
//             audio.pause();
//         }
//     }, [isPlaying, selectedSong?.audioUrl]);

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

//     const fetchUserProfile = useCallback(async () => {
//          const token = localStorage.getItem('token');
//         if (token) {
//             axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/user/profile');
//                 setUser(res.data);
//             } catch (error) {
//                  console.error('Auth error:', error);
//                  localStorage.removeItem('token');
//                  delete axios.defaults.headers.common['Authorization'];
//                  setUser(null);
//             } finally {
//                 setLoading(false);
//             }
//         } else {
//              setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchUserProfile();
//     }, [fetchUserProfile]);

//     const login = (token, userData, navigate) => {
//         localStorage.setItem('token', token);
//         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//         setUser(userData);
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
    
//     // NEW: Function to update user profile
//     const updateUser = async (userData) => {
//         try {
//             const token = localStorage.getItem('token');
//             const res = await axios.put('https://music-backend-akb5.onrender.com/api/user/profile', userData, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             // Update user state with new data from response
//             setUser(prevUser => ({ ...prevUser, ...res.data })); 
//             return { success: true, message: 'Profile updated successfully!' };
//         } catch (error) {
//             console.error('Failed to update profile:', error);
//             const errorMessage = error.response?.data?.message || 'Failed to update profile.';
//             return { success: false, message: errorMessage };
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
//         };
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
//                  return { success: false, message: 'Song already in playlist' };
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
//         } catch (error) { console.error('Failed to create playlist:', error); }
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
//          try {
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
//         e.preventDefault(); setLoading(true); setMessage('');
//         try {
//             const endpoint = isLogin ? 'https://music-backend-akb5.onrender.com/api/auth/login' : 'https://music-backend-akb5.onrender.com/api/auth/register';
//             const data = isLogin ? { email, password } : { fullName, email, password };
//             const res = await axios.post(endpoint, data);
//             if(res.data.token && res.data.user) login(res.data.token, res.data.user, navigate);
//         } catch (error) {
//             setMessage((error.response?.data?.message || 'An unknown error occurred'));
//         } finally { setLoading(false); }
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
//             <div className="navbar-logo" onClick={() => navigate('/main')}>Gawana</div>
//             <div className="navbar-right">
//                 <div className="search-box" onClick={() => navigate('/main', { state: { focusSearch: true } })}>
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
//     const [mode, setMode] = useState(localStorage.getItem('mode') || 'dark');
//     const sidebarRef = useRef(null);

//     useEffect(() => {
//         const handleClickOutside = (event) => { if (sidebarRef.current && !sidebarRef.current.contains(event.target)) onClose(); };
//         if (isOpen) document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, [isOpen, onClose]);

//     useEffect(() => { document.body.dataset.mode = mode; localStorage.setItem('mode', mode); }, [mode]);

//     const handleLogout = () => {
//         if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
//         setIsPlaying(false); setSelectedSong(null);
//         logout(navigate); onClose();
//     };

//     const handleCreatePlaylist = () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) createPlaylist(playlistName.trim());
//     };
    
//     return (
//         <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
//             {/* Changed href="#" to href="/" for proper routing */}
//             <a href="/" onClick={(e) => { e.preventDefault(); navigate('/account'); onClose(); }}>Account</a>
//             <div className="sidebar-item-with-dropdown">
//                 <a href="/" onClick={(e) => e.preventDefault()}>Mode</a>
//                 <div className="mode-dropdown">
//                     <span onClick={() => { setMode('dark'); onClose(); }}>Dark</span>
//                     <span onClick={() => { setMode('light'); onClose(); }}>Light</span>
//                     <span onClick={() => { setMode('neon'); onClose(); }}>Neon</span>
//                 </div>
//             </div>
//             {/* Changed href="#" to href="/" for proper routing */}
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
//     const togglePlay = () => setIsPlaying(p => !p);
//     const changeSong = (offset) => {
//         if (!selectedSong?.songList?.length) return;
//         const newIndex = (currentSongIndex + offset + selectedSong.songList.length) % selectedSong.songList.length;
//         setSelectedSong({ ...selectedSong.songList[newIndex], songList: selectedSong.songList });
//     };
//     const handleTimeDrag = (e) => { if (audioRef.current?.duration) { audioRef.current.currentTime = (e.target.value / 100) * audioRef.current.duration; setCurrentTime(audioRef.current.currentTime); } };
//     const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
//     const duration = audioRef.current?.duration || 0;

//     return (
//         <div className={`music-player ${isMinimized ? 'minimized' : ''}`}>
//             <button className="close-player-button" onClick={() => setSelectedSong(null)}>✖</button>
//             <div className="player-content">
//                 <img src={selectedSong.thumbnailUrl || 'https://placehold.co/100x100'} alt={selectedSong.title} />
//                 <div className="song-info"><h4>{selectedSong.title}</h4><p>{selectedSong.singer}</p></div>
//                 {!isMinimized && (
//                     <div className="controls">
//                         <div className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</div>
//                         <input type="range" min="0" max="100" value={duration ? (currentTime / duration) * 100 : 0} onChange={handleTimeDrag} className="progress-bar" />
//                         <div className="player-buttons">
//                             <button onClick={() => changeSong(-1)}><FontAwesomeIcon icon="fa-step-backward" /></button>
//                             <button onClick={togglePlay}><FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} /></button>
//                             <button onClick={() => changeSong(1)}><FontAwesomeIcon icon="fa-step-forward" /></button>
//                             <input type="range" min="0" max="1" step="0.1" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="volume-slider" />
//                         </div>
//                     </div>
//                 )}
//             </div>
//             <button className="minimize-player-button" onClick={() => setIsMinimized(!isMinimized)}><FontAwesomeIcon icon={isMinimized ? 'fa-chevron-up' : 'fa-chevron-down'} /></button>
//         </div>
//     );
// }

// function SongList({ songs, onSongClick, onAddToPlaylist, playlistSongIds }) {
//     return (
//         <div className="songs-column">
//             {songs.map(song => (
//                 <div key={song._id} className="song-card full-line" onClick={() => onSongClick(song)}>
//                     <img src={song.thumbnailUrl || 'https://placehold.co/50x50'} alt={song.title} className="song-thumbnail" />
//                     <div className="song-details"><h4>{song.title}</h4><p>{song.singer}</p></div>
//                     {!playlistSongIds.has(song._id) && (
//                         <button className="add-song-button" onClick={(e) => { e.stopPropagation(); onAddToPlaylist(song._id); }}><FontAwesomeIcon icon="fa-plus" /></button>
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
//             <div className="playlist-modal" onClick={e => e.stopPropagation()}>
//                 <h4>Select Playlist</h4>
//                 {loading ? <div>Loading...</div> : playlists.length > 0 ? (
//                     <ul>{playlists.map(pl => <li key={pl._id}><button className="playlist-modal-btn" onClick={() => onSelectPlaylist(pl._id)}>{pl.name}</button></li>)}</ul>
//                 ) : <div>No playlists found. Create one from the sidebar.</div>}
//                 {message && <div className="playlist-modal-message">{message}</div>}
//                 <button className="playlist-modal-cancel" onClick={onClose}>Cancel</button>
//             </div>
//         </div>
//     );
// }

// function MainScreen() {
//     const { setSelectedSong } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistSongIds, loadingPlaylists } = usePlaylist();
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [loadingSearch, setLoadingSearch] = useState(false);
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const navigate = useNavigate();
//     const location = useLocation();
//     const searchInputRef = useRef(null);
//     const moodCategories = ['happy', 'sad', 'love', 'calm'];
//     const genreCategories = ['travel', 'party', 'rap', 'motivational', 'pop'];
    
//     // This effect ensures search input is focused if navigated with state
//     useEffect(() => {
//         if(location.state?.focusSearch) {
//             setSearchQuery(' '); // A space to trigger search mode without a query
//             setTimeout(() => searchInputRef.current?.focus(), 0);
//             navigate(location.pathname, { replace: true, state: {} }); // Clear state to prevent re-focus on subsequent visits
//         }
//     }, [location.state, location.pathname, navigate]);


//     const debouncedSearch = useMemo(() => {
//         let timeoutId;
//         return (query) => {
//             clearTimeout(timeoutId);
//             timeoutId = setTimeout(async () => {
//                 if (!query.trim()) { setSearchResults([]); return; }
//                 setLoadingSearch(true);
//                 try {
//                     const res = await axios.get(`https://music-backend-akb5.onrender.com/api/songs?search=${encodeURIComponent(query)}`);
//                     setSearchResults(Array.isArray(res.data) ? res.data : []);
//                 } catch (error) { console.error('Search error:', error); } finally { setLoadingSearch(false); }
//             }, 300);
//         };
//     }, []);

//     useEffect(() => { debouncedSearch(searchQuery); }, [searchQuery, debouncedSearch]);
    
//     const handleAddToPlaylist = (songId) => { setSongToAdd(songId); setShowPlaylistModal(true); setAddMessage(''); };
//     const handleSelectPlaylist = async (playlistId) => {
//         const result = await addToPlaylist(songToAdd, playlistId);
//         setAddMessage(result.message);
//         if (result.success) setTimeout(() => setShowPlaylistModal(false), 1000);
//     };
    
//     return (
//         <div className="main-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//                 {searchQuery ? (
//                     <div className="search-overlay">
//                         <input type="text" ref={searchInputRef} value={searchQuery.trim()} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" placeholder="Search for songs, artists..." autoFocus />
//                         <div className="search-results">
//                             {loadingSearch ? <div className="card empty">Searching...</div> : searchResults.length > 0 ? (
//                                 <SongList songs={searchResults} onSongClick={(song) => setSelectedSong({ ...song, songList: searchResults })} onAddToPlaylist={handleAddToPlaylist} playlistSongIds={playlistSongIds}/>
//                             ) : (searchQuery.trim() && <div className="card empty">No songs found.</div>)}
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="main-content">
//                         <section><h2>Moods</h2><div className="mood-cards">{moodCategories.map((m) => <div key={m} className={`mood-card ${m}`} onClick={() => navigate(`/moods/${m}`)}><h3>{m}</h3></div>)}</div></section>
//                         <section><h2>Genres</h2><div className="mood-cards">{genreCategories.map((g) => <div key={g} className={`mood-card ${g}`} onClick={() => navigate(`/genres/${g}`)}><h3>{g}</h3></div>)}</div></section>
//                     </div>
//                 )}
//             </div>
//             <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} />
//             <MusicPlayer />
//         </div>
//     );
// }

// function PlaylistDetailScreen() {
//     const { playlistId } = useParams();
//     const { setSelectedSong } = useMusicPlayer();
//     const { playlists, removeSongFromPlaylist, updatePlaylistName, loadingPlaylists } = usePlaylist();
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const playlist = useMemo(() => playlists.find(p => p._id === playlistId), [playlists, playlistId]);

//     const handleRemoveSong = async (songId) => {
//         if (!window.confirm('Are you sure?')) return;
//         const result = await removeSongFromPlaylist(songId, playlistId);
//         setMessage(result.message); setTimeout(() => setMessage(''), 2000);
//     };

//     const handleEditPlaylist = async () => {
//         const newName = prompt('Enter new playlist name:', playlist.name);
//         if (newName?.trim() && newName !== playlist.name) {
//             const result = await updatePlaylistName(playlistId, newName.trim());
//             setMessage(result.message); setTimeout(() => setMessage(''), 2000);
//         }
//     };

//     if (loadingPlaylists) return <div className="content-area loading"><div></div></div>;
//     if (!playlist) return <div className="content-area"><p>Playlist not found.</p></div>;

//     return (
//         <div className="playlist-detail-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//                 <h2>{playlist.name} <button className="edit-playlist-button" onClick={handleEditPlaylist}><FontAwesomeIcon icon="fa-pencil" /></button></h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {playlist.songs?.length > 0 ? (
//                     <div className="songs-column">
//                         {playlist.songs.map(song => (
//                             <div key={song._id} className="song-card full-line" onClick={() => setSelectedSong({ ...song, songList: playlist.songs })}>
//                                 <img src={song.thumbnailUrl || 'https://placehold.co/50x50'} alt={song.title} className="song-thumbnail" />
//                                 <div className="song-details"><h4>{song.title}</h4><p>{song.singer}</p></div>
//                                 <button className="remove-song-button" onClick={(e) => { e.stopPropagation(); handleRemoveSong(song._id); }}><FontAwesomeIcon icon="fa-minus" /></button>
//                             </div>
//                         ))}
//                     </div>
//                 ) : <p>This playlist is empty. Add some songs!</p>}
//             </div>
//             <MusicPlayer />
//         </div>
//     );
// }

// function CategorySongsScreen({ categoryType }) {
//     const { name } = useParams();
//     const { setSelectedSong } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistSongIds, loadingPlaylists } = usePlaylist();
//     const [songs, setSongs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         setLoading(true);
//         axios.get(`https://music-backend-akb5.onrender.com/api/songs?${categoryType}=${name}`, { headers: { Authorization: `Bearer ${token}` } })
//             .then(res => setSongs(res.data)).catch(err => console.error(err)).finally(() => setLoading(false));
//     }, [name, categoryType, token]);

//     const handleAddToPlaylist = (songId) => { setSongToAdd(songId); setShowPlaylistModal(true); setAddMessage(''); };
//     const handleSelectPlaylist = async (playlistId) => {
//         const result = await addToPlaylist(songToAdd, playlistId);
//         setAddMessage(result.message);
//         if (result.success) setTimeout(() => setShowPlaylistModal(false), 1000);
//     };
    
//     return (
//         <div className="mood-songs-screen">
//              <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//              <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//              <div className="content-area">
//                 <h2>{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>
//                 {loading ? <div className="loading"><div></div></div> : songs.length > 0 ? (
//                     <SongList songs={songs} onSongClick={(song) => setSelectedSong({ ...song, songList: songs })} onAddToPlaylist={handleAddToPlaylist} playlistSongIds={playlistSongIds}/>
//                 ) : <p>No songs found for this category.</p>}
//              </div>
//              <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} />
//              <MusicPlayer />
//         </div>
//     );
// }

// function Account() {
//     const { user, updateUser } = useAuth();
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//     const handleEditProfile = async () => {
//         const newFullName = prompt("Enter your new full name:", user.fullName);
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
//                 <h2>Account Details <button className="edit-profile-button" onClick={handleEditProfile}><FontAwesomeIcon icon="fa-pencil" /></button></h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {user ? (
//                     <>
//                         <p><strong>Full Name:</strong> {user.fullName}</p>
//                         <p><strong>Email:</strong> {user.email}</p>
//                         <p><strong>Join Date:</strong> {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}</p>
//                     </>
//                 ) : <p>Loading profile...</p>}
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
//                             <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
//                             <Route path="/moods/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="mood" /></ProtectedRoute>} />
//                             <Route path="/genres/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="genre" /></ProtectedRoute>} />
//                             <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetailScreen /></ProtectedRoute>} />
//                             <Route path="*" element={<Navigate to="/main" />} />
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
//             if(audioRef.current) {
//                 audioRef.current.pause();
//                 audioRef.current.src = '';
//             }
//             return;
//         }

//         if (audioRef.current) {
//             audioRef.current.pause();
//         }

//         const audio = new Audio(selectedSong.audioUrl);
//         audio.volume = volume;
//         audio.preload = 'auto';
//         audio.onerror = () => console.error('Audio load error for:', selectedSong.audioUrl);

//         const updateTime = () => setCurrentTime(audio.currentTime);
//         const handleEnded = () => {
//             if (selectedSong.songList && selectedSong.songList.length > 0) {
//                 const nextIndex = (currentSongIndex + 1) % selectedSong.songList.length;
//                 setSelectedSong({ ...selectedSong.songList[nextIndex], songList: selectedSong.songList });
//             }
//         };

//         audio.addEventListener('timeupdate', updateTime);
//         audio.addEventListener('ended', handleEnded);
//         audioRef.current = audio;

//         if (isPlaying) {
//             audio.play().catch(err => console.error('Audio play error:', err));
//         }

//         if (selectedSong.songList) {
//             const index = selectedSong.songList.findIndex(s => s._id === selectedSong._id);
//             setCurrentSongIndex(index !== -1 ? index : 0);
//         }

//         return () => {
//             audio.removeEventListener('timeupdate', updateTime);
//             audio.removeEventListener('ended', handleEnded);
//             audio.pause();
//         };
//     }, [selectedSong?.audioUrl, selectedSong?._id]);

//     useEffect(() => {
//         if (audioRef.current) {
//             audioRef.current.volume = volume;
//         }
//     }, [volume]);

//     useEffect(() => {
//         const audio = audioRef.current;
//         if (!audio) return;
//         if (isPlaying && selectedSong?.audioUrl) {
//             audio.play().catch(err => console.error('Audio play error:', err));
//         } else {
//             audio.pause();
//         }
//     }, [isPlaying, selectedSong?.audioUrl]);

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

//     const fetchUserProfile = useCallback(async () => {
//          const token = localStorage.getItem('token');
//         if (token) {
//             axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/user/profile');
//                 setUser(res.data);
//             } catch (error) {
//                  console.error('Auth error:', error);
//                  localStorage.removeItem('token');
//                  delete axios.defaults.headers.common['Authorization'];
//                  setUser(null);
//             } finally {
//                 setLoading(false);
//             }
//         } else {
//              setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchUserProfile();
//     }, [fetchUserProfile]);

//     const login = (token, userData, navigate) => {
//         localStorage.setItem('token', token);
//         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//         setUser(userData);
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
    
//     // NEW: Function to update user profile
//     const updateUser = async (userData) => {
//         try {
//             const token = localStorage.getItem('token');
//             const res = await axios.put('https://music-backend-akb5.onrender.com/api/user/profile', userData, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             // Update user state with new data from response
//             setUser(prevUser => ({ ...prevUser, ...res.data })); 
//             return { success: true, message: 'Profile updated successfully!' };
//         } catch (error) {
//             console.error('Failed to update profile:', error);
//             const errorMessage = error.response?.data?.message || 'Failed to update profile.';
//             return { success: false, message: errorMessage };
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
//         };
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
//                  return { success: false, message: 'Song already in playlist' };
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
//         } catch (error) { console.error('Failed to create playlist:', error); }
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
//          try {
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
//         e.preventDefault(); setLoading(true); setMessage('');
//         try {
//             const endpoint = isLogin ? 'https://music-backend-akb5.onrender.com/api/auth/login' : 'https://music-backend-akb5.onrender.com/api/auth/register';
//             const data = isLogin ? { email, password } : { fullName, email, password };
//             const res = await axios.post(endpoint, data);
//             if(res.data.token && res.data.user) login(res.data.token, res.data.user, navigate);
//         } catch (error) {
//             setMessage((error.response?.data?.message || 'An unknown error occurred'));
//         } finally { setLoading(false); }
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
//             <div className="navbar-logo" onClick={() => navigate('/main')}>Gawana</div>
//             <div className="navbar-right">
//                 <div className="search-box" onClick={() => navigate('/main', { state: { focusSearch: true } })}>
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
//     const [mode, setMode] = useState(localStorage.getItem('mode') || 'dark');
//     const sidebarRef = useRef(null);

//     useEffect(() => {
//         const handleClickOutside = (event) => { if (sidebarRef.current && !sidebarRef.current.contains(event.target)) onClose(); };
//         if (isOpen) document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, [isOpen, onClose]);

//     useEffect(() => { document.body.dataset.mode = mode; localStorage.setItem('mode', mode); }, [mode]);

//     const handleLogout = () => {
//         if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
//         setIsPlaying(false); setSelectedSong(null);
//         logout(navigate); onClose();
//     };

//     const handleCreatePlaylist = () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) createPlaylist(playlistName.trim());
//     };
    
//     return (
//         <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
//             {/* Changed href="#" to href="/" for proper routing */}
//             <a href="/" onClick={(e) => { e.preventDefault(); navigate('/account'); onClose(); }}>Account</a>
//             <div className="sidebar-item-with-dropdown">
//                 <a href="/" onClick={(e) => e.preventDefault()}>Mode</a>
//                 <div className="mode-dropdown">
//                     <span onClick={() => { setMode('dark'); onClose(); }}>Dark</span>
//                     <span onClick={() => { setMode('light'); onClose(); }}>Light</span>
//                     <span onClick={() => { setMode('neon'); onClose(); }}>Neon</span>
//                 </div>
//             </div>
//             {/* Changed href="#" to href="/" for proper routing */}
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
//     const togglePlay = () => setIsPlaying(p => !p);
//     const changeSong = (offset) => {
//         if (!selectedSong?.songList?.length) return;
//         const newIndex = (currentSongIndex + offset + selectedSong.songList.length) % selectedSong.songList.length;
//         setSelectedSong({ ...selectedSong.songList[newIndex], songList: selectedSong.songList });
//     };
//     const handleTimeDrag = (e) => { if (audioRef.current?.duration) { audioRef.current.currentTime = (e.target.value / 100) * audioRef.current.duration; setCurrentTime(audioRef.current.currentTime); } };
//     const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
//     const duration = audioRef.current?.duration || 0;

//     return (
//         <div className={`music-player ${isMinimized ? 'minimized' : ''}`}>
//             <button className="close-player-button" onClick={() => setSelectedSong(null)}>✖</button>
//             <div className="player-content">
//                 <img src={selectedSong.thumbnailUrl || 'https://placehold.co/100x100'} alt={selectedSong.title} />
//                 <div className="song-info"><h4>{selectedSong.title}</h4><p>{selectedSong.singer}</p></div>
//                 {!isMinimized && (
//                     <div className="controls">
//                         <div className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</div>
//                         <input type="range" min="0" max="100" value={duration ? (currentTime / duration) * 100 : 0} onChange={handleTimeDrag} className="progress-bar" />
//                         <div className="player-buttons">
//                             <button onClick={() => changeSong(-1)}><FontAwesomeIcon icon="fa-step-backward" /></button>
//                             <button onClick={togglePlay}><FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} /></button>
//                             <button onClick={() => changeSong(1)}><FontAwesomeIcon icon="fa-step-forward" /></button>
//                             <input type="range" min="0" max="1" step="0.1" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="volume-slider" />
//                         </div>
//                     </div>
//                 )}
//             </div>
//             <button className="minimize-player-button" onClick={() => setIsMinimized(!isMinimized)}><FontAwesomeIcon icon={isMinimized ? 'fa-chevron-up' : 'fa-chevron-down'} /></button>
//         </div>
//     );
// }

// function SongList({ songs, onSongClick, onAddToPlaylist, playlistSongIds }) {
//     return (
//         // ...inside CategorySongsScreen's return...
// <div className="songs-row">
//     {songs.map(song => (
//         <div
//       key={song._id}
//       className="song-tile"
//       onClick={() => onSongClick(song)}
//     >
//             <img
//                 src={song.thumbnailUrl || 'https://placehold.co/120x120/333/FFF?text=♪'}
//                 alt={song.title}
//                 className="song-tile-thumbnail"
//             />
//             <div className="song-tile-details">
//                 <div className="song-tile-title">{song.title}</div>
//                 <div className="song-tile-singer">{song.singer}</div>
//                 <div className="song-tile-label">
//                     {song.movie ? song.movie : 'Album'}
//                 </div>
//             </div>
//            {!playlistSongIds.has(song._id) && (
//   <button
//     className="add-song-button"
//     onClick={e => {
//       e.stopPropagation();
//       onAddToPlaylist(song._id);
//     }}
//     title="Add to Playlist"
//   >
//     <FontAwesomeIcon icon="fa-plus" />
//   </button>
// )}
//         </div>
//     ))}
// </div>
// // ...existing code...
//     );
// }

// function PlaylistSelectionModal({ isOpen, onClose, onSelectPlaylist, playlists, loading, message }) {
//     if (!isOpen) return null;
//     return (
//         <div className="playlist-modal-overlay" onClick={onClose}>
//             <div className="playlist-modal" onClick={e => e.stopPropagation()}>
//                 <h4>Select Playlist</h4>
//                 {loading ? <div>Loading...</div> : playlists.length > 0 ? (
//                     <ul>{playlists.map(pl => <li key={pl._id}><button className="playlist-modal-btn" onClick={() => onSelectPlaylist(pl._id)}>{pl.name}</button></li>)}</ul>
//                 ) : <div>No playlists found. Create one from the sidebar.</div>}
//                 {message && <div className="playlist-modal-message">{message}</div>}
//                 <button className="playlist-modal-cancel" onClick={onClose}>Cancel</button>
//             </div>
//         </div>
//     );
// }

// function MainScreen() {
//     const { setSelectedSong } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistSongIds, loadingPlaylists } = usePlaylist();
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [loadingSearch, setLoadingSearch] = useState(false);
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const navigate = useNavigate();
//     const location = useLocation();
//     const searchInputRef = useRef(null);
//     const moodCategories = ['happy', 'sad', 'love', 'calm'];
//     const genreCategories = ['travel', 'party', 'rap', 'motivational', 'pop'];
    
//     // This effect ensures search input is focused if navigated with state
//     useEffect(() => {
//         if(location.state?.focusSearch) {
//             setSearchQuery(' '); // A space to trigger search mode without a query
//             setTimeout(() => searchInputRef.current?.focus(), 0);
//             navigate(location.pathname, { replace: true, state: {} }); // Clear state to prevent re-focus on subsequent visits
//         }
//     }, [location.state, location.pathname, navigate]);


//     const debouncedSearch = useMemo(() => {
//         let timeoutId;
//         return (query) => {
//             clearTimeout(timeoutId);
//             timeoutId = setTimeout(async () => {
//                 if (!query.trim()) { setSearchResults([]); return; }
//                 setLoadingSearch(true);
//                 try {
//                     const res = await axios.get(`https://music-backend-akb5.onrender.com/api/songs?search=${encodeURIComponent(query)}`);
//                     setSearchResults(Array.isArray(res.data) ? res.data : []);
//                 } catch (error) { console.error('Search error:', error); } finally { setLoadingSearch(false); }
//             }, 300);
//         };
//     }, []);

//     useEffect(() => { debouncedSearch(searchQuery); }, [searchQuery, debouncedSearch]);
    
//     const handleAddToPlaylist = (songId) => { setSongToAdd(songId); setShowPlaylistModal(true); setAddMessage(''); };
//     const handleSelectPlaylist = async (playlistId) => {
//         const result = await addToPlaylist(songToAdd, playlistId);
//         setAddMessage(result.message);
//         if (result.success) setTimeout(() => setShowPlaylistModal(false), 1000);
//     };
    
//     return (
//         <div className="main-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//                 {searchQuery ? (
//                     <div className="search-overlay">
//                         <input type="text" ref={searchInputRef} value={searchQuery.trim()} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" placeholder="Search for songs, artists..." autoFocus />
//                         <div className="search-results">
//                             {loadingSearch ? <div className="card empty">Searching...</div> : searchResults.length > 0 ? (
//                                 <SongList songs={searchResults} onSongClick={(song) => setSelectedSong({ ...song, songList: searchResults })} onAddToPlaylist={handleAddToPlaylist} playlistSongIds={playlistSongIds}/>
//                             ) : (searchQuery.trim() && <div className="card empty">No songs found.</div>)}
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="main-content">
//                         <section><h2>Moods</h2><div className="mood-cards">{moodCategories.map((m) => <div key={m} className={`mood-card ${m}`} onClick={() => navigate(`/moods/${m}`)}><h3>{m}</h3></div>)}</div></section>
//                         <section><h2>Genres</h2><div className="mood-cards">{genreCategories.map((g) => <div key={g} className={`mood-card ${g}`} onClick={() => navigate(`/genres/${g}`)}><h3>{g}</h3></div>)}</div></section>
//                     </div>
//                 )}
//             </div>
//             <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} />
//             <MusicPlayer />
//         </div>
//     );
// }

// function PlaylistDetailScreen() {
//     const { playlistId } = useParams();
//     const { setSelectedSong } = useMusicPlayer();
//     const { playlists, removeSongFromPlaylist, updatePlaylistName, loadingPlaylists } = usePlaylist();
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const playlist = useMemo(() => playlists.find(p => p._id === playlistId), [playlists, playlistId]);

//     const handleRemoveSong = async (songId) => {
//         if (!window.confirm('Are you sure?')) return;
//         const result = await removeSongFromPlaylist(songId, playlistId);
//         setMessage(result.message); setTimeout(() => setMessage(''), 2000);
//     };

//     const handleEditPlaylist = async () => {
//         const newName = prompt('Enter new playlist name:', playlist.name);
//         if (newName?.trim() && newName !== playlist.name) {
//             const result = await updatePlaylistName(playlistId, newName.trim());
//             setMessage(result.message); setTimeout(() => setMessage(''), 2000);
//         }
//     };

//     if (loadingPlaylists) return <div className="content-area loading"><div></div></div>;
//     if (!playlist) return <div className="content-area"><p>Playlist not found.</p></div>;

//     return (
//         <div className="playlist-detail-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//                 <h2>{playlist.name} <button className="edit-playlist-button" onClick={handleEditPlaylist}><FontAwesomeIcon icon="fa-pencil" /></button></h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {playlist.songs?.length > 0 ? (
//                     <div className="songs-column">
//                         {playlist.songs.map(song => (
//                             <div key={song._id} className="song-card full-line" onClick={() => setSelectedSong({ ...song, songList: playlist.songs })}>
//                                 <img src={song.thumbnailUrl || 'https://placehold.co/50x50'} alt={song.title} className="song-thumbnail" />
//                                 <div className="song-details"><h4>{song.title}</h4><p>{song.singer}</p></div>
//                                 <button className="remove-song-button" onClick={(e) => { e.stopPropagation(); handleRemoveSong(song._id); }}><FontAwesomeIcon icon="fa-minus" /></button>
//                             </div>
//                         ))}
//                     </div>
//                 ) : <p>This playlist is empty. Add some songs!</p>}
//             </div>
//             <MusicPlayer />
//         </div>
//     );
// }

// function CategorySongsScreen({ categoryType }) {
//     const { name } = useParams();
//     const { setSelectedSong } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistSongIds, loadingPlaylists } = usePlaylist();
//     const [songs, setSongs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const token = localStorage.getItem('token');

//     useEffect(() => {
//         setLoading(true);
//         axios.get(`https://music-backend-akb5.onrender.com/api/songs?${categoryType}=${name}`, { headers: { Authorization: `Bearer ${token}` } })
//             .then(res => setSongs(res.data)).catch(err => console.error(err)).finally(() => setLoading(false));
//     }, [name, categoryType, token]);

//     const handleAddToPlaylist = (songId) => { setSongToAdd(songId); setShowPlaylistModal(true); setAddMessage(''); };
//     const handleSelectPlaylist = async (playlistId) => {
//         const result = await addToPlaylist(songToAdd, playlistId);
//         setAddMessage(result.message);
//         if (result.success) setTimeout(() => setShowPlaylistModal(false), 1000);
//     };
    
//     return (
//         <div className="mood-songs-screen">
//              <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//              <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//              <div className="content-area">
//                 <h2>{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>
//                 {loading ? <div className="loading"><div></div></div> : songs.length > 0 ? (
//                     <SongList songs={songs} onSongClick={(song) => setSelectedSong({ ...song, songList: songs })} onAddToPlaylist={handleAddToPlaylist} playlistSongIds={playlistSongIds}/>
//                 ) : <p>No songs found for this category.</p>}
//              </div>
//              <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} />
//              <MusicPlayer />
//         </div>
//     );
// }

// function Account() {
//     const { user, updateUser } = useAuth();
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//     const handleEditProfile = async () => {
//         const newFullName = prompt("Enter your new full name:", user.fullName);
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
//                 <h2>Account Details <button className="edit-profile-button" onClick={handleEditProfile}><FontAwesomeIcon icon="fa-pencil" /></button></h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {user ? (
//                     <>
//                         <p><strong>Full Name:</strong> {user.fullName}</p>
//                         <p><strong>Email:</strong> {user.email}</p>
//                         <p><strong>Join Date:</strong> {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}</p>
//                     </>
//                 ) : <p>Loading profile...</p>}
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
//                             <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
//                             <Route path="/moods/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="mood" /></ProtectedRoute>} />
//                             <Route path="/genres/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="genre" /></ProtectedRoute>} />
//                             <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetailScreen /></ProtectedRoute>} />
//                             <Route path="*" element={<Navigate to="/main" />} />
//                         </Routes>
//                     </PlaylistProvider>
//                 </MusicPlayerProvider>
//             </AuthProvider>
//         </Router>
//     );
// }

// export default App;

/////////////////
///////////
// working and search
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
//             if(audioRef.current) {
//                 audioRef.current.pause();
//                 audioRef.current.src = '';
//             }
//             return;
//         }

//         if (audioRef.current) {
//             audioRef.current.pause();
//         }

//         const audio = new Audio(selectedSong.audioUrl);
//         audio.volume = volume;
//         audio.preload = 'auto';
//         audio.onerror = () => console.error('Audio load error for:', selectedSong.audioUrl);

//         const updateTime = () => setCurrentTime(audio.currentTime);
//         const handleEnded = () => {
//             if (selectedSong.songList && selectedSong.songList.length > 0) {
//                 const nextIndex = (currentSongIndex + 1) % selectedSong.songList.length;
//                 setSelectedSong({ ...selectedSong.songList[nextIndex], songList: selectedSong.songList });
//             }
//         };

//         audio.addEventListener('timeupdate', updateTime);
//         audio.addEventListener('ended', handleEnded);
//         audioRef.current = audio;

//         if (isPlaying) {
//             audio.play().catch(err => console.error('Audio play error:', err));
//         }

//         if (selectedSong.songList) {
//             const index = selectedSong.songList.findIndex(s => s._id === selectedSong._id);
//             setCurrentSongIndex(index !== -1 ? index : 0);
//         }

//         return () => {
//             audio.removeEventListener('timeupdate', updateTime);
//             audio.removeEventListener('ended', handleEnded);
//             audio.pause();
//         };
//     }, [selectedSong?.audioUrl, selectedSong?._id]);

//     useEffect(() => {
//         if (audioRef.current) {
//             audioRef.current.volume = volume;
//         }
//     }, [volume]);

//     useEffect(() => {
//         const audio = audioRef.current;
//         if (!audio) return;
//         if (isPlaying && selectedSong?.audioUrl) {
//             audio.play().catch(err => console.error('Audio play error:', err));
//         } else {
//             audio.pause();
//         }
//     }, [isPlaying, selectedSong?.audioUrl]);

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

//     const fetchUserProfile = useCallback(async () => {
//          const token = localStorage.getItem('token');
//         if (token) {
//             axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/user/profile');
//                 setUser(res.data);
//             } catch (error) {
//                  console.error('Auth error:', error);
//                  localStorage.removeItem('token');
//                  delete axios.defaults.headers.common['Authorization'];
//                  setUser(null);
//             } finally {
//                 setLoading(false);
//             }
//         } else {
//              setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchUserProfile();
//     }, [fetchUserProfile]);

//     const login = (token, userData, navigate) => {
//         localStorage.setItem('token', token);
//         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//         setUser(userData);
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
    
//     // NEW: Function to update user profile
//     const updateUser = async (userData) => {
//         try {
//             const token = localStorage.getItem('token');
//             const res = await axios.put('https://music-backend-akb5.onrender.com/api/user/profile', userData, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             // Update user state with new data from response
//             setUser(prevUser => ({ ...prevUser, ...res.data })); 
//             return { success: true, message: 'Profile updated successfully!' };
//         } catch (error) {
//             console.error('Failed to update profile:', error);
//             const errorMessage = error.response?.data?.message || 'Failed to update profile.';
//             return { success: false, message: errorMessage };
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
//         };
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
//                  return { success: false, message: 'Song already in playlist' };
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
//         } catch (error) { console.error('Failed to create playlist:', error); }
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
//          try {
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
//         e.preventDefault(); setLoading(true); setMessage('');
//         try {
//             const endpoint = isLogin ? 'https://music-backend-akb5.onrender.com/api/auth/login' : 'https://music-backend-akb5.onrender.com/api/auth/register';
//             const data = isLogin ? { email, password } : { fullName, email, password };
//             const res = await axios.post(endpoint, data);
//             if(res.data.token && res.data.user) login(res.data.token, res.data.user, navigate);
//         } catch (error) {
//             setMessage((error.response?.data?.message || 'An unknown error occurred'));
//         } finally { setLoading(false); }
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
//             <div className="navbar-logo" onClick={() => navigate('/main')}>Gawana</div>
//             <div className="navbar-right">
//                 <div className="search-box" onClick={() => navigate('/main', { state: { focusSearch: true } })}>
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
//     const [mode, setMode] = useState(localStorage.getItem('mode') || 'dark');
//     const sidebarRef = useRef(null);

//     useEffect(() => {
//         const handleClickOutside = (event) => { if (sidebarRef.current && !sidebarRef.current.contains(event.target)) onClose(); };
//         if (isOpen) document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, [isOpen, onClose]);

//     useEffect(() => { document.body.dataset.mode = mode; localStorage.setItem('mode', mode); }, [mode]);

//     const handleLogout = () => {
//         if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
//         setIsPlaying(false); setSelectedSong(null);
//         logout(navigate); onClose();
//     };

//     const handleCreatePlaylist = () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) createPlaylist(playlistName.trim());
//     };
    
//     return (
//         <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
//             <a href="/" onClick={(e) => { e.preventDefault(); navigate('/account'); onClose(); }}>Account</a>
//             <div className="sidebar-item-with-dropdown">
//                 <a href="/" onClick={(e) => e.preventDefault()}>Mode</a>
//                 <div className="mode-dropdown">
//                     <span onClick={() => { setMode('dark'); onClose(); }}>Dark</span>
//                     <span onClick={() => { setMode('light'); onClose(); }}>Light</span>
//                     <span onClick={() => { setMode('neon'); onClose(); }}>Neon</span>
//                 </div>
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
//     const togglePlay = () => setIsPlaying(p => !p);
//     const changeSong = (offset) => {
//         if (!selectedSong?.songList?.length) return;
//         const newIndex = (currentSongIndex + offset + selectedSong.songList.length) % selectedSong.songList.length;
//         setSelectedSong({ ...selectedSong.songList[newIndex], songList: selectedSong.songList });
//         setIsPlaying(true); // Added here to auto play next song
//     };
//     const handleTimeDrag = (e) => { if (audioRef.current?.duration) { audioRef.current.currentTime = (e.target.value / 100) * audioRef.current.duration; setCurrentTime(audioRef.current.currentTime); } };
//     const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
//     const duration = audioRef.current?.duration || 0;

//     return (
//         <div className={`music-player ${isMinimized ? 'minimized' : ''}`}>
//             <button className="close-player-button" onClick={() => setSelectedSong(null)}>✖</button>
//             <div className="player-content">
//                 <img src={selectedSong.thumbnailUrl || 'https://placehold.co/100x100'} alt={selectedSong.title} />
//                 <div className="song-info"><h4>{selectedSong.title}</h4><p>{selectedSong.singer}</p></div>
//                 {!isMinimized && (
//                     <div className="controls">
//                         <div className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</div>
//                         <input type="range" min="0" max="100" value={duration ? (currentTime / duration) * 100 : 0} onChange={handleTimeDrag} className="progress-bar" />
//                         <div className="player-buttons">
//                             <button onClick={() => changeSong(-1)}><FontAwesomeIcon icon="fa-step-backward" /></button>
//                             <button onClick={togglePlay}><FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} /></button>
//                             <button onClick={() => changeSong(1)}><FontAwesomeIcon icon="fa-step-forward" /></button>
//                             <input type="range" min="0" max="1" step="0.1" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="volume-slider" />
//                         </div>
//                     </div>
//                 )}
//             </div>
//             <button className="minimize-player-button" onClick={() => setIsMinimized(!isMinimized)}><FontAwesomeIcon icon={isMinimized ? 'fa-chevron-up' : 'fa-chevron-down'} /></button>
//         </div>
//     );
// }

// function SongList({ songs, onSongClick, onAddToPlaylist, playlistSongIds }) {
//     return (
//         <div className="songs-row">
//             {songs.map(song => (
//                 <div
//                     key={song._id}
//                     className="song-tile"
//                     onClick={() => {
//                         onSongClick(song);
//                         // Auto play on click:
//                         // We expect onSongClick to call setSelectedSong, so also setIsPlaying(true) here if needed
//                     }}
//                 >
//                     <img
//                         src={song.thumbnailUrl || 'https://placehold.co/120x120/333/FFF?text=♪'}
//                         alt={song.title}
//                         className="song-tile-thumbnail"
//                     />
//                     <div className="song-tile-details">
//                         <div className="song-tile-title">{song.title}</div>
//                         <div className="song-tile-singer">{song.singer}</div>
//                         <div className="song-tile-label">
//                             {song.movie ? song.movie : 'Album'}
//                         </div>
//                     </div>
//                     {!playlistSongIds.has(song._id) && (
//                         <button
//                             className="add-song-button"
//                             onClick={e => {
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
//             <div className="playlist-modal" onClick={e => e.stopPropagation()}>
//                 <h4>Select Playlist</h4>
//                 {loading ? <div>Loading...</div> : playlists.length > 0 ? (
//                     <ul>{playlists.map(pl => <li key={pl._id}><button className="playlist-modal-btn" onClick={() => onSelectPlaylist(pl._id)}>{pl.name}</button></li>)}</ul>
//                 ) : <div>No playlists found. Create one from the sidebar.</div>}
//                 {message && <div className="playlist-modal-message">{message}</div>}
//                 <button className="playlist-modal-cancel" onClick={onClose}>Cancel</button>
//             </div>
//         </div>
//     );
// }

// function MainScreen() {
//     const { setSelectedSong, setIsPlaying } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistSongIds, loadingPlaylists } = usePlaylist();
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [loadingSearch, setLoadingSearch] = useState(false);
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const navigate = useNavigate();
//     const location = useLocation();
//     const searchInputRef = useRef(null);
//     const moodCategories = ['happy', 'sad', 'love', 'calm'];
//     const genreCategories = ['travel', 'party', 'rap', 'motivational', 'pop'];
    
//     useEffect(() => {
//         if(location.state?.focusSearch) {
//             setSearchQuery(' '); // A space to trigger search mode without a query
//             setTimeout(() => searchInputRef.current?.focus(), 0);
//             navigate(location.pathname, { replace: true, state: {} }); // Clear state to prevent re-focus on subsequent visits
//         }
//     }, [location.state, location.pathname, navigate]);

//     const debouncedSearch = useMemo(() => {
//         let timeoutId;
//         return (query) => {
//             clearTimeout(timeoutId);
//             timeoutId = setTimeout(async () => {
//                 if (!query.trim()) { setSearchResults([]); return; }
//                 setLoadingSearch(true);
//                 try {
//                     const res = await axios.get(`https://music-backend-akb5.onrender.com/api/songs?search=${encodeURIComponent(query)}`);
//                     setSearchResults(Array.isArray(res.data) ? res.data : []);
//                 } catch (error) { console.error('Search error:', error); } finally { setLoadingSearch(false); }
//             }, 300);
//         };
//     }, []);

//     useEffect(() => { debouncedSearch(searchQuery); }, [searchQuery, debouncedSearch]);
    
//     const handleAddToPlaylist = (songId) => { setSongToAdd(songId); setShowPlaylistModal(true); setAddMessage(''); };
//     const handleSelectPlaylist = async (playlistId) => {
//         const result = await addToPlaylist(songToAdd, playlistId);
//         setAddMessage(result.message);
//         if (result.success) setTimeout(() => setShowPlaylistModal(false), 1000);
//     };
    
//     return (
//         <div className="main-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//                 {searchQuery ? (
//                     <div className="search-overlay">
//                         <input type="text" ref={searchInputRef} value={searchQuery.trim()} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" placeholder="Search for songs, artists..." autoFocus />
//                         <div className="search-results">
//                             {loadingSearch ? <div className="card empty">Searching...</div> : searchResults.length > 0 ? (
//                                 <SongList 
//                                     songs={searchResults} 
//                                     onSongClick={(song) => {
//                                         setSelectedSong({ ...song, songList: searchResults });
//                                         setIsPlaying(true); // Auto play on click
//                                     }} 
//                                     onAddToPlaylist={handleAddToPlaylist} 
//                                     playlistSongIds={playlistSongIds}
//                                 />
//                             ) : (searchQuery.trim() && <div className="card empty">No songs found.</div>)}
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="main-content">
//                         <section><h2>Moods</h2><div className="mood-cards">{moodCategories.map((m) => <div key={m} className={`mood-card ${m}`} onClick={() => navigate(`/moods/${m}`)}><h3>{m}</h3></div>)}</div></section>
//                         <section><h2>Genres</h2><div className="mood-cards">{genreCategories.map((g) => <div key={g} className={`mood-card ${g}`} onClick={() => navigate(`/genres/${g}`)}><h3>{g}</h3></div>)}</div></section>
//                     </div>
//                 )}
//             </div>
//             <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} />
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
//     const playlist = useMemo(() => playlists.find(p => p._id === playlistId), [playlists, playlistId]);

//     const handleRemoveSong = async (songId) => {
//         if (!window.confirm('Are you sure?')) return;
//         const result = await removeSongFromPlaylist(songId, playlistId);
//         setMessage(result.message); setTimeout(() => setMessage(''), 2000);
//     };

//     const handleEditPlaylist = async () => {
//         const newName = prompt('Enter new playlist name:', playlist.name);
//         if (newName?.trim() && newName !== playlist.name) {
//             const result = await updatePlaylistName(playlistId, newName.trim());
//             setMessage(result.message); setTimeout(() => setMessage(''), 2000);
//         }
//     };

//     if (loadingPlaylists) return <div className="content-area loading"><div></div></div>;
//     if (!playlist) return <div className="content-area"><p>Playlist not found.</p></div>;

//     return (
//         <div className="playlist-detail-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//                 <h2>{playlist.name} <button className="edit-playlist-button" onClick={handleEditPlaylist}><FontAwesomeIcon icon="fa-pencil" /></button></h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {playlist.songs?.length > 0 ? (
//                     <div className="songs-column">
//                         {playlist.songs.map(song => (
//                             <div 
//                                 key={song._id} 
//                                 className="song-card full-line" 
//                                 onClick={() => {
//                                     setSelectedSong({ ...song, songList: playlist.songs });
//                                     setIsPlaying(true); // Auto play on click
//                                 }}
//                             >
//                                 <img src={song.thumbnailUrl || 'https://placehold.co/50x50'} alt={song.title} className="song-thumbnail" />
//                                 <div className="song-details"><h4>{song.title}</h4><p>{song.singer}</p></div>
//                                 <button className="remove-song-button" onClick={(e) => { e.stopPropagation(); handleRemoveSong(song._id); }}><FontAwesomeIcon icon="fa-minus" /></button>
//                             </div>
//                         ))}
//                     </div>
//                 ) : <p>This playlist is empty. Add some songs!</p>}
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

//     useEffect(() => {
//         setLoading(true);
//         axios.get(`https://music-backend-akb5.onrender.com/api/songs?${categoryType}=${name}`, { headers: { Authorization: `Bearer ${token}` } })
//             .then(res => setSongs(res.data)).catch(err => console.error(err)).finally(() => setLoading(false));
//     }, [name, categoryType, token]);

//     const handleAddToPlaylist = (songId) => { setSongToAdd(songId); setShowPlaylistModal(true); setAddMessage(''); };
//     const handleSelectPlaylist = async (playlistId) => {
//         const result = await addToPlaylist(songToAdd, playlistId);
//         setAddMessage(result.message);
//         if (result.success) setTimeout(() => setShowPlaylistModal(false), 1000);
//     };
    
//     return (
//         <div className="mood-songs-screen">
//              <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//              <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//              <div className="content-area">
//                 <h2>{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>
//                 {loading ? <div className="loading"><div></div></div> : songs.length > 0 ? (
//                     <SongList 
//                         songs={songs} 
//                         onSongClick={(song) => {
//                             setSelectedSong({ ...song, songList: songs });
//                             setIsPlaying(true); // Auto play on click
//                         }} 
//                         onAddToPlaylist={handleAddToPlaylist} 
//                         playlistSongIds={playlistSongIds}
//                     />
//                 ) : <p>No songs found for this category.</p>}
//              </div>
//              <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} />
//              <MusicPlayer />
//         </div>
//     );
// }

// function Account() {
//     const { user, updateUser } = useAuth();
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//     const handleEditProfile = async () => {
//         const newFullName = prompt("Enter your new full name:", user.fullName);
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
//                 <h2>Account Details <button className="edit-profile-button" onClick={handleEditProfile}><FontAwesomeIcon icon="fa-pencil" /></button></h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {user ? (
//                     <>
//                         <p><strong>Full Name:</strong> {user.fullName}</p>
//                         <p><strong>Email:</strong> {user.email}</p>
//                         <p><strong>Join Date:</strong> {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}</p>
//                     </>
//                 ) : <p>Loading profile...</p>}
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
//                             <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
//                             <Route path="/moods/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="mood" /></ProtectedRoute>} />
//                             <Route path="/genres/:name" element={<ProtectedRoute><CategorySongsScreen categoryType="genre" /></ProtectedRoute>} />
//                             <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetailScreen /></ProtectedRoute>} />
//                             <Route path="*" element={<Navigate to="/main" />} />
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
//             if(audioRef.current) {
//                 audioRef.current.pause();
//                 audioRef.current.src = '';
//             }
//             return;
//         }

//         // Initialize audioRef if it's null or if the song URL changes
//         if (!audioRef.current || audioRef.current.src !== selectedSong.audioUrl) {
//             if (audioRef.current) {
//                 audioRef.current.pause(); // Pause old song before changing src
//             }
//             audioRef.current = new Audio(selectedSong.audioUrl);
//             audioRef.current.preload = 'auto';
//             audioRef.current.onerror = () => console.error('Audio load error for:', selectedSong.audioUrl);
            
//             // Add event listeners only once to the new audio object
//             audioRef.current.addEventListener('timeupdate', () => setCurrentTime(audioRef.current.currentTime));
//             audioRef.current.addEventListener('ended', () => {
//                 if (selectedSong.songList && selectedSong.songList.length > 0) {
//                     const nextIndex = (currentSongIndex + 1) % selectedSong.songList.length;
//                     setSelectedSong({ ...selectedSong.songList[nextIndex], songList: selectedSong.songList });
//                     setIsPlaying(true); // Auto-play next song
//                 } else {
//                     setIsPlaying(false); // Stop playing if no more songs in list
//                 }
//             });
//         }

//         // Set volume and play/pause based on state
//         audioRef.current.volume = volume;
//         if (isPlaying) {
//             audioRef.current.play().catch(err => console.error('Audio play error:', err));
//         } else {
//             audioRef.current.pause();
//         }

//         if (selectedSong.songList) {
//             const index = selectedSong.songList.findIndex(s => s._id === selectedSong._id);
//             setCurrentSongIndex(index !== -1 ? index : 0);
//         }

//         // Cleanup: remove listeners and pause audio on component unmount
//         return () => {
//             if (audioRef.current) {
//                 audioRef.current.pause();
//                 // Not removing listeners here as the audio object is recreated on song change
//                 // The current approach ensures listeners are attached to the correct audio instance
//             }
//         };
//     }, [selectedSong?._id, selectedSong?.audioUrl]); // Only re-run if song ID or URL changes

//     useEffect(() => {
//         // This useEffect is for toggling play/pause explicitly
//         if (audioRef.current) {
//             if (isPlaying && selectedSong?.audioUrl) {
//                 audioRef.current.play().catch(err => console.error('Audio play error:', err));
//             } else {
//                 audioRef.current.pause();
//             }
//         }
//     }, [isPlaying, selectedSong?.audioUrl]); // Only re-run if isPlaying or current song URL changes


//     useEffect(() => {
//         // This useEffect is solely for volume changes
//         if (audioRef.current) {
//             audioRef.current.volume = volume;
//         }
//     }, [volume]);


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
//          const token = localStorage.getItem('token');
//         if (token) {
//             axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//             try {
//                 const res = await axios.get('https://music-backend-akb5.onrender.com/api/user/profile');
//                 setUser(processUserData(res.data));
//             } catch (error) {
//                  console.error('Auth error:', error);
//                  localStorage.removeItem('token');
//                  delete axios.defaults.headers.common['Authorization'];
//                  setUser(null); // Clear user on auth error
//             } finally {
//                 setLoading(false);
//             }
//         } else {
//              setUser(null); // Explicitly set user to null if no token
//              setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchUserProfile();
//     }, [fetchUserProfile]);

//     const login = (token, userData, navigate) => {
//         localStorage.setItem('token', token);
//         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//         setUser(processUserData(userData)); // Process data on login
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
//             setUser(processUserData(res.data)); // Process updated data
//             return { success: true, message: 'Profile updated successfully!' };
//         } catch (error) {
//             console.error('Failed to update profile:', error);
//             const errorMessage = error.response?.data?.message || 'Failed to update profile.';
//             return { success: false, message: errorMessage };
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
//         };
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
//                  return { success: false, message: 'Song already in playlist' };
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
//         } catch (error) { console.error('Failed to create playlist:', error); }
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
//          try {
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
//     // Only navigate to login if not loading AND user is null
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
//         e.preventDefault(); setLoading(true); setMessage('');
//         try {
//             const endpoint = isLogin ? 'https://music-backend-akb5.onrender.com/api/auth/login' : 'https://music-backend-akb5.onrender.com/api/auth/register';
//             const data = isLogin ? { email, password } : { fullName, email, password };
//             const res = await axios.post(endpoint, data);
//             if(res.data.token && res.data.user){
//                 // Corrected login flow, userData is now processed in AuthProvider
//                 login(res.data.token, res.data.user, navigate);
//             }
//         } catch (error) {
//             setMessage((error.response?.data?.message || 'An unknown error occurred'));
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

// // UPDATED Navbar Component
// function Navbar({ toggleSidebar }) {
//     const navigate = useNavigate();

//     return (
//         <div className="navbar">
//             <div className="navbar-logo" onClick={() => navigate('/main')}>SunDhun</div>
//             <div className="navbar-right">
//                 {/* Search icon navigates to the dedicated search page */}
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
//     const [mode, setMode] = useState(localStorage.getItem('mode') || 'dark');
//     const sidebarRef = useRef(null);

//     useEffect(() => {
//         const handleClickOutside = (event) => { if (sidebarRef.current && !sidebarRef.current.contains(event.target)) onClose(); };
//         if (isOpen) document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, [isOpen, onClose]);

//     useEffect(() => { document.body.dataset.mode = mode; localStorage.setItem('mode', mode); }, [mode]);

//     const handleLogout = () => {
//         if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
//         setIsPlaying(false); setSelectedSong(null);
//         logout(navigate); onClose();
//     };

//     const handleCreatePlaylist = () => {
//         const playlistName = prompt('Enter playlist name:');
//         if (playlistName?.trim()) createPlaylist(playlistName.trim());
//     };
    
//     return (
//         <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
//             <a href="/" onClick={(e) => { e.preventDefault(); navigate('/account'); onClose(); }}>Account</a>
//             <div className="sidebar-item-with-dropdown">
//                 <a href="/" onClick={(e) => e.preventDefault()}>Mode</a>
//                 <div className="mode-dropdown">
//                     <span onClick={() => { setMode('dark'); onClose(); }}>Dark</span>
//                     <span onClick={() => { setMode('light'); onClose(); }}>Light</span>
//                     <span onClick={() => { setMode('neon'); onClose(); }}>Neon</span>
//                 </div>
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
//     const togglePlay = () => setIsPlaying(p => !p);
//     const changeSong = (offset) => {
//         if (!selectedSong?.songList?.length) return;
//         const newIndex = (currentSongIndex + offset + selectedSong.songList.length) % selectedSong.songList.length;
//         setSelectedSong({ ...selectedSong.songList[newIndex], songList: selectedSong.songList });
//         setIsPlaying(true);
//     };
//     const handleTimeDrag = (e) => { if (audioRef.current?.duration) { audioRef.current.currentTime = (e.target.value / 100) * audioRef.current.duration; setCurrentTime(audioRef.current.currentTime); } };
//     const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
//     const duration = audioRef.current?.duration || 0;

//     return (
//         <div className={`music-player ${isMinimized ? 'minimized' : ''}`}>
//             <button className="close-player-button" onClick={() => setSelectedSong(null)}>✖</button>
//             <div className="player-content">
//                 <img src={selectedSong.thumbnailUrl || 'https://placehold.co/100x100'} alt={selectedSong.title} />
//                 <div className="song-info"><h4>{selectedSong.title}</h4><p>{selectedSong.singer}</p></div>
//                 {!isMinimized && (
//                     <div className="controls">
//                         <div className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</div>
//                         <input type="range" min="0" max="100" value={duration ? (currentTime / duration) * 100 : 0} onChange={handleTimeDrag} className="progress-bar" />
//                         <div className="player-buttons">
//                             <button onClick={() => changeSong(-1)}><FontAwesomeIcon icon="fa-step-backward" /></button>
//                             <button onClick={togglePlay}><FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} /></button>
//                             <button onClick={() => changeSong(1)}><FontAwesomeIcon icon="fa-step-forward" /></button>
//                             <input type="range" min="0" max="1" step="0.1" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="volume-slider" />
//                         </div>
//                     </div>
//                 )}
//             </div>
//             <button className="minimize-player-button" onClick={() => setIsMinimized(!isMinimized)}><FontAwesomeIcon icon={isMinimized ? 'fa-chevron-up' : 'fa-chevron-down'} /></button>
//         </div>
//     );
// }

// function SongList({ songs, onSongClick, onAddToPlaylist, playlistSongIds }) {
//     return (
//         <div className="songs-row">
//             {songs.map(song => (
//                 <div
//                     key={song._id}
//                     className="song-tile"
//                     onClick={() => onSongClick(song)}
//                 >
//                     <img
//                         src={song.thumbnailUrl || 'https://placehold.co/120x120/333/FFF?text=♪'}
//                         alt={song.title}
//                         className="song-tile-thumbnail"
//                     />
//                     <div className="song-tile-details">
//                         <div className="song-tile-title">{song.title}</div>
//                         <div className="song-tile-singer">{song.singer}</div>
//                         <div className="song-tile-label">
//                             {song.movie ? song.movie : 'Album'}
//                         </div>
//                     </div>
//                     {!playlistSongIds.has(song._id) && (
//                         <button
//                             className="add-song-button"
//                             onClick={e => {
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
//             <div className="playlist-modal" onClick={e => e.stopPropagation()}>
//                 <h4>Select Playlist</h4>
//                 {loading ? <div>Loading...</div> : playlists.length > 0 ? (
//                     <ul>{playlists.map(pl => <li key={pl._id}><button className="playlist-modal-btn" onClick={() => onSelectPlaylist(pl._id)}>{pl.name}</button></li>)}</ul>
//                 ) : <div>No playlists found. Create one </div>}
//                 {message && <div className="playlist-modal-message">{message}</div>}
//                 <button className="playlist-modal-cancel" onClick={onClose}>Cancel</button>
//             </div>
//         </div>
//     );
// }

// // MainScreen - back to its original role, no search logic here
// function MainScreen() {
//     const { user } = useAuth(); // Assuming you might use user for welcome message etc.
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//     // Welcome message effect (if needed, simplified for this example)
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
//     const moodCategories = ['happy', 'sad', 'love', 'calm'];
//     const genreCategories = ['travel', 'party', 'rap', 'motivational', 'pop'];

//     return (
//         <div className="main-screen">
//              {showWelcome && user && <div className="welcome-overlay">Welcome, {user.fullName.split(' ')[0]}!</div>}
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//               <section className="mood-section">
//   <h2>Moods</h2>
//   <div className="mood-cards">
//     {moodCategories.map((m) => (
//       <div key={m} className={`mood-card ${m}`} onClick={() => navigate(`/moods/${m}`)}>
//         <h3>{m}</h3>
//       </div>
//     ))}
//   </div>
// </section>

// <section className="genre-section">
//   <h2>Genres</h2>
//   <div className="mood-cards">
//     {genreCategories.map((g) => (
//       <div key={g} className={`mood-card ${g}`} onClick={() => navigate(`/genres/${g}`)}>
//         <h3>{g}</h3>
//       </div>
//     ))}
//   </div>
// </section>

//             </div>
//             <MusicPlayer />
//         </div>
//     );
// }

// // NEW SearchScreen Componen
// function SearchScreen() {
//     const { setSelectedSong, setIsPlaying } = useMusicPlayer();
//     const { playlists, addToPlaylist, playlistSongIds, loadingPlaylists } = usePlaylist();
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [loadingSearch, setLoadingSearch] = useState(false);
//     const [showPlaylistModal, setShowPlaylistModal] = useState(false);
//     const [songToAdd, setSongToAdd] = useState(null);
//     const [addMessage, setAddMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For Navbar integration
//     const token = localStorage.getItem('token'); // Assuming token is always available for authenticated users

//     const debouncedSearch = useMemo(() => {
//         let timeoutId;
//         return (query) => {
//             clearTimeout(timeoutId);
//             timeoutId = setTimeout(async () => {
//                 setLoadingSearch(true);
//                 try {
//                     let url = 'https://music-backend-akb5.onrender.com/api/songs';
//                     if (query.trim()) {
//                         // Example: searching across multiple fields. Adjust backend for optimal search.
//                         // For simplicity, this example assumes backend can handle a single 'search' param
//                         // that looks across title, singer, mood, genre, movie.
//                         // If your backend expects specific params like ?title=X&singer=Y, you'd build the query here.
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
//                     className="search-input-field" // Added a class for styling
//                     placeholder="Search by title, singer, mood, genre, movie..."
//                     autoFocus
//                 />
//               <div className="search-results-section"> 
//   {loadingSearch ? (
//     <div className="search-message">Searching...</div>
//   ) : searchResults.length > 0 ? (
//     <SongList
//       songs={searchResults}
//       onSongClick={(song) => {
//         setSelectedSong({ ...song, songList: searchResults });
//         setIsPlaying(true);
//       }}
//       onAddToPlaylist={handleAddToPlaylist}
//       playlistSongIds={playlistSongIds}
//     />
//   ) : (
//     searchQuery.trim() && <div className="search-message">No songs found.</div>
//   )}
// </div>

//             </div>
//             <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} />
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
//     const playlist = useMemo(() => playlists.find(p => p._id === playlistId), [playlists, playlistId]);

//     const handleRemoveSong = async (songId) => {
//         if (!window.confirm('Are you sure?')) return;
//         const result = await removeSongFromPlaylist(songId, playlistId);
//         setMessage(result.message); setTimeout(() => setMessage(''), 2000);
//     };

//     const handleEditPlaylist = async () => {
//         const newName = prompt('Enter new playlist name:', playlist.name);
//         if (newName?.trim() && newName !== playlist.name) {
//             const result = await updatePlaylistName(playlistId, newName.trim());
//             setMessage(result.message); setTimeout(() => setMessage(''), 2000);
//         }
//     };

//     if (loadingPlaylists) return <div className="content-area loading"><div></div></div>;
//     if (!playlist) return <div className="content-area"><p>Playlist not found.</p></div>;

//     return (
//         <div className="playlist-detail-screen">
//             <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//             <div className="content-area">
//                 <h2>{playlist.name} <button className="edit-playlist-button" onClick={handleEditPlaylist}><FontAwesomeIcon icon="fa-pencil" /></button></h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {playlist.songs?.length > 0 ? (
//                     <div className="songs-column">
//                         {playlist.songs.map(song => (
//                             <div 
//                                 key={song._id} 
//                                 className="song-card full-line" 
//                                 onClick={() => {
//                                     setSelectedSong({ ...song, songList: playlist.songs });
//                                     setIsPlaying(true);
//                                 }}
//                             >
//                                 <img src={song.thumbnailUrl || 'https://placehold.co/50x50'} alt={song.title} className="song-thumbnail" />
//                                 <div className="song-details"><h4>{song.title}</h4><p>{song.singer}</p></div>
//                                 <button className="remove-song-button" onClick={(e) => { e.stopPropagation(); handleRemoveSong(song._id); }}><FontAwesomeIcon icon="fa-minus" /></button>
//                             </div>
//                         ))}
//                     </div>
//                 ) : <p>This playlist is empty. Add some songs!</p>}
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

//     useEffect(() => {
//         setLoading(true);
//         axios.get(`https://music-backend-akb5.onrender.com/api/songs?${categoryType}=${name}`, { headers: { Authorization: `Bearer ${token}` } })
//             .then(res => setSongs(res.data)).catch(err => console.error(err)).finally(() => setLoading(false));
//     }, [name, categoryType, token]);

//     const handleAddToPlaylist = (songId) => { setSongToAdd(songId); setShowPlaylistModal(true); setAddMessage(''); };
//     const handleSelectPlaylist = async (playlistId) => {
//         const result = await addToPlaylist(songToAdd, playlistId);
//         setAddMessage(result.message);
//         if (result.success) setTimeout(() => setShowPlaylistModal(false), 1000);
//     };
    
//     return (
//         <div className="mood-songs-screen">
//              <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//              <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//              <div className="content-area">
//                 <h2>{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>
//                 {loading ? <div className="loading"><div></div></div> : songs.length > 0 ? (
//                     <SongList 
//                         songs={songs} 
//                         onSongClick={(song) => {
//                             setSelectedSong({ ...song, songList: songs });
//                             setIsPlaying(true);
//                         }} 
//                         onAddToPlaylist={handleAddToPlaylist} 
//                         playlistSongIds={playlistSongIds}
//                     />
//                 ) : <p>No songs found for this category.</p>}
//              </div>
//              <PlaylistSelectionModal isOpen={showPlaylistModal} onClose={() => setShowPlaylistModal(false)} onSelectPlaylist={handleSelectPlaylist} playlists={playlists} loading={loadingPlaylists} message={addMessage} />
//              <MusicPlayer />
//         </div>
//     );
// }

// function Account() {
//     const { user, updateUser, loading } = useAuth();
//     const [message, setMessage] = useState('');
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//     const handleEditProfile = async () => {
//         const newFullName = prompt("Enter your new full name:", user.fullName);
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
//                 <h2>Account Details <button className="edit-profile-button" onClick={handleEditProfile}><FontAwesomeIcon icon="fa-pencil" /></button></h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {loading ? ( // Display loading state for user data
//                     <p>Loading profile...</p>
//                 ) : user ? (
//                     <>
//                         <p><strong>Full Name:</strong> {user.fullName}</p>
//                         <p><strong>Email:</strong> {user.email}</p>
//                         {/* Display joinDate only if it's a valid Date object */}
//                         <p><strong>Join Date:</strong> {user.joinDate instanceof Date ? user.joinDate.toLocaleDateString() : 'N/A'}</p>
//                     </>
//                 ) : ( // Fallback if user is null after loading
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
//                             <Route path="/search" element={<ProtectedRoute><SearchScreen /></ProtectedRoute>} /> {/* <-- Add this line */}
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
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

// --- Music Player Context ---
const MusicPlayerContext = React.createContext();

function MusicPlayerProvider({ children }) {
    const [selectedSong, setSelectedSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isMinimized, setIsMinimized] = useState(false);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const audioRef = useRef(null);

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
    return React.useContext(MusicPlayerContext);
}

// --- Auth Context ---
const AuthContext = React.createContext();

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
    return React.useContext(AuthContext);
}

// --- Playlist Context ---
const PlaylistContext = React.createContext();

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
    return React.useContext(PlaylistContext);
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
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/account'); onClose(); }}>Account</a>
            <div className="sidebar-item-with-dropdown">
                <a href="/" onClick={(e) => { e.preventDefault(); setShowModeDropdown((prev) => !prev); }}>Mode</a>
                {showModeDropdown && (
                    <div className="mode-dropdown">
                        <span onClick={() => { setMode('dark'); setShowModeDropdown(false); }}>Dark</span>
                        <span onClick={() => { setMode('light'); setShowModeDropdown(false); }}>Light</span>
                        <span onClick={() => { setMode('neon'); setShowModeDropdown(false); }}>Neon</span>
                    </div>
                )}
            </div>
            <a href="/" onClick={(e) => { e.preventDefault(); setShowPlaylistDropdown(!showPlaylistDropdown); }}>Playlist</a>
            {showPlaylistDropdown && (
                <div className="playlist-dropdown">
                    {loadingPlaylists ? <span>Loading...</span> : <>
                        {playlists.map(playlist => <span key={playlist._id} onClick={() => { navigate(`/playlist/${playlist._id}`); onClose(); }}>{playlist.name}</span>)}
                        <span onClick={handleCreatePlaylist} className="create-playlist"><FontAwesomeIcon icon="fa-plus" /> Create New</span>
                    </>}
                </div>
            )}
            {user && <a href="/" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>}
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
        <div className={`music-player ${isMinimized ? 'minimized' : ''}`}>
            <button className="close-player-button" onClick={() => setSelectedSong(null)}>✖</button>
            <div className="player-content">
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
            <button className="minimize-player-button" onClick={() => setIsMinimized(!isMinimized)}>
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('showWelcome')) {
            setShowWelcome(true);
            const timer = setTimeout(() => {
                setShowWelcome(false);
                sessionStorage.removeItem('showWelcome');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const navigate = useNavigate();
    const moodCategories = ['happy', 'sad', 'love', 'calm', 'motivational', 'nostalgic', 'heartbreak', 'spiritual', 'travel'];
    const genreCategories = ['rap', 'pop', 'classical', 'lo-fi'];

    return (
        <div className="main-screen">
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
    const { setSelectedSong, setIsPlaying } = useMusicPlayer();
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
        <div className="search-screen">
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
    const { setSelectedSong, setIsPlaying } = useMusicPlayer();
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
    const { setSelectedSong, setIsPlaying } = useMusicPlayer();
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

    const loveMessages = [
        "Every note carries a heartbeat — feel the love.",
        "From crushes to soulmates, let love sing its story.",
        "In love? Then you're in the perfect rhythm.",
        "Let the melodies say what words can’t."
    ];
    const travelMessages = [
        "Hit the road with the perfect travel tunes.",
        "Let music guide your journey across the world.",
        "Wanderlust vibes in every beat.",
        "Songs to fuel your next adventure!"
    ];
    const happyMessages = [
        "Turn up the joy — today feels just right.",
        "Let your smile be the rhythm, and your day the dance.",
        "Sunshine in your soul deserves a soundtrack.",
        "Catchy beats for brighter moods — happiness starts here!"
    ];
    const sadMessages = [
        "It’s okay to feel — let the music hold you gently.",
        "Even rainy hearts find comfort in a song.",
        "Every tear writes a verse — let it play out.",
        "Healing begins when you listen with your soul."
    ];
    const motivationalMessages = [
        "Fuel your fire. Let every beat push you further.",
        "Hustle harder, with the sound of strength.",
        "When you feel like quitting, play one more track.",
        "Rise. Grind. Repeat. With power in every note."
    ];
    const nostalgicMessages = [
        "A melody can take you back in time.",
        "Old songs, golden memories.",
        "Feelings you forgot, brought back in a beat.",
        "Rewind the vibes — relive the magic."
    ];
    const heartbreakMessages = [
        "Some songs just understand — let them.",
        "Pieces may fall, but the music still flows.",
        "It hurts — and that’s okay. Let each beat mend you.",
        "Even broken hearts have beautiful soundtracks."
    ];
    const spiritualMessages = [
        "Find peace in every chord.",
        "Let the music guide your soul to serenity.",
        "Harmony that lifts your spirit.",
        "Transcend with every note."
    ];
    const calmMessages = [
        "Breathe easy with soothing tunes.",
        "Let tranquility flow through the melody.",
        "Peaceful rhythms for a quiet mind.",
        "Relax into the gentle beat."
    ];

    useEffect(() => {
        console.log(`Fetching songs for ${categoryType}: ${name}, Token: ${token}`);
        const messageMap = {
            love: loveMessages,
            travel: travelMessages,
            happy: happyMessages,
            sad: sadMessages,
            motivational: motivationalMessages,
            nostalgic: nostalgicMessages,
            heartbreak: heartbreakMessages,
            spiritual: spiritualMessages,
            calm: calmMessages,
        };
        const messages = messageMap[name] || [];
        if (messages.length > 0 && songs.length > 0) {
            const randomIndex = Math.floor(Math.random() * messages.length);
            setRandomMessage(messages[randomIndex]);
            const fadeOutTimer = setTimeout(() => setRandomMessage(''), 4000);
            return () => clearTimeout(fadeOutTimer);
        }
    }, [name, songs]);

    useEffect(() => {
        setLoading(true);
        setError(null);
        let url = `https://music-backend-akb5.onrender.com/api/songs?${categoryType}=${encodeURIComponent(name)}`;
        console.log(`API Call URL: ${url}`);
        axios
            .get(url, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                console.log(`API Response:`, res.data);
                if (Array.isArray(res.data)) {
                    setSongs(res.data);
                } else {
                    setSongs([]);
                    setError('Invalid data format from server');
                }
            })
            .catch((err) => {
                console.error(`API Error:`, err.response ? err.response.data : err.message);
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
            setTimeout(() => {
                setShowPlaylistModal(false);
                setSongToAdd(null);
            }, 1000);
        }
    };

    return (
        <div className="mood-songs-screen">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="content-area">
                <h2>{name.charAt(0).toUpperCase() + name.slice(1)} Songs</h2>
                {randomMessage && <div className="random-message animate-fade-in-out">{randomMessage}</div>}
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
    const [message, setMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [newFullName, setNewFullName] = useState('');

    const handleEditProfile = async () => {
        setEditProfileOpen(true);
        setNewFullName(user.fullName);
    };

    const saveProfile = async () => {
        if (newFullName.trim() && newFullName !== user.fullName) {
            const result = await updateUser({ fullName: newFullName.trim() });
            setMessage(result.message);
            setTimeout(() => setMessage(''), 3000);
        }
        setEditProfileOpen(false);
    };

    return (
        <div className="account-screen">
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
                {loading ? (
                    <p>Loading profile...</p>
                ) : user ? (
                    <>
                        <p><strong>Full Name:</strong> {user.fullName}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Join Date:</strong> {user.joinDate instanceof Date ? user.joinDate.toLocaleDateString() : 'N/A'}</p>
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