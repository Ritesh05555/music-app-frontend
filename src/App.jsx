
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
//                 .get('http://localhost:5000/api/user/profile')
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
//             const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
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
//             const res = await axios.get('http://localhost:5000/api/playlists', {
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
//                 await axios.post('http://localhost:5000/api/playlists', { name: playlistName }, {
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
//                 const res = await axios.get(`http://localhost:5000/api/playlists`, {
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
//                 const res = await axios.get('http://localhost:5000/api/songs', {
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
//                 const res = await axios.get(`http://localhost:5000/api/songs?search=${encodeURIComponent(query)}`, { timeout: 5000 });
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
//             const res = await axios.get('http://localhost:5000/api/playlists', {
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
//                 `http://localhost:5000/api/playlists/${playlistId}`,
//                 { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//             );
//             const currentSongs = (playlistRes.data.songs || []).map(s => s._id);
//             const updatedSongs = currentSongs.includes(songToAdd) ? currentSongs : [...currentSongs, songToAdd];
//             await axios.put(
//                 `http://localhost:5000/api/playlists/${playlistId}`,
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
//                 const res = await axios.get('http://localhost:5000/api/songs', {
//                     timeout: 5000,
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 const songs = Array.isArray(res.data) ? res.data : [];
//                 setAllSongs(songs);
//                 setMoodSongs(songs.filter(song => song.mood && song.mood.toLowerCase().includes(moodName.toLowerCase())));
//                 const playlistRes = await axios.get('http://localhost:5000/api/playlists', { headers: { Authorization: `Bearer ${token}` } });
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
//             const res = await axios.get('http://localhost:5000/api/playlists', {
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
//                 `http://localhost:5000/api/playlists/${playlistId}`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             const currentSongs = (playlistRes.data.songs || []).map(s => s._id);
//             const updatedSongs = currentSongs.includes(songToAdd) ? currentSongs : [...currentSongs, songToAdd];
//             await axios.put(
//                 `http://localhost:5000/api/playlists/${playlistId}`,
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
//                 const res = await axios.get('http://localhost:5000/api/songs', {
//                     timeout: 5000,
//                     headers: { Authorization: `Bearer ${token}` }
//                 });
//                 const songs = Array.isArray(res.data) ? res.data : [];
//                 setAllSongs(songs);
//                 setGenreSongs(songs.filter(song => song.genre && song.genre.toLowerCase().includes(genreName.toLowerCase())));
//                 const playlistRes = await axios.get('http://localhost:5000/api/playlists', { headers: { Authorization: `Bearer ${token}` } });
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
//             const res = await axios.get('http://localhost:5000/api/playlists', {
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
//                 `http://localhost:5000/api/playlists/${playlistId}`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             const currentSongs = (playlistRes.data.songs || []).map(s => s._id);
//             const updatedSongs = currentSongs.includes(songToAdd) ? currentSongs : [...currentSongs, songToAdd];
//             await axios.put(
//                 `http://localhost:5000/api/playlists/${playlistId}`,
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
//                 const res = await axios.get('http://localhost:5000/api/user/profile');
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
//                 const res = await axios.put('http://localhost:5000/api/user/profile', { fullName: newFullName }, {
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
//                 const res = await axios.get(`http://localhost:5000/api/playlists/${playlistId}`, {
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

//             await axios.put(`http://localhost:5000/api/playlists/${playlistId}`, {
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
//                 await axios.put(`http://localhost:5000/api/playlists/${playlistId}`, {
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

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';

// FontAwesome Icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
library.add(fas);

// --- Auth Context ---
const AuthContext = React.createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.Authorization = `Bearer ${token}`;
            axios
                .get('http://localhost:5000/api/user/profile')
                .then((res) => {
                    setUser(res.data);
                })
                .catch((error) => {
                    console.error('Auth error:', error);
                    localStorage.removeItem('token');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (token, userData, navigate) => {
        localStorage.setItem('token', token);
        axios.defaults.headers.Authorization = `Bearer ${token}`;
        setUser(userData);
        sessionStorage.setItem('showWelcome', 'true');
        navigate('/main');
    };

    const logout = (navigate) => {
        localStorage.removeItem('token');
        axios.defaults.headers.Authorization = null;
        setUser(null);
        sessionStorage.removeItem('showWelcome');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    return React.useContext(AuthContext);
}

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="loading">
                <div></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

// --- Splash Screen ---
function SplashScreen() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => navigate('/login'), 3000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="splash-screen">
            <FontAwesomeIcon icon="fa-music" size="3x" className="animate-spin" />
            <h1>Gawana</h1>
            <p>Loading...</p>
        </div>
    );
}

// --- Auth Screen ---
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
            const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
            const data = isLogin ? { email, password } : { fullName, email, password };
            const res = await axios.post(endpoint, data);
            login(res.data.token, res.data.user, navigate);
        } catch (error) {
            console.error('Auth error:', error);
            setMessage(isLogin ? 'Login failed: ' + (error.response?.data?.message || 'Unknown error') : 'Signup failed: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="loading">
            <div></div>
        </div>
    );

    return (
        <div className="auth-screen">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>{isLogin ? 'Login' : 'Signup'}</h2>
                {!isLogin && (
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full Name"
                        required
                    />
                )}
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
                <p className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Need an account? Signup' : 'Already have an account? Login'}
                </p>
                {message && <div className="error-message">{message}</div>}
            </form>
        </div>
    );
}

// --- Navbar Component ---
function Navbar({ onSearch, searchQuery, setSearchQuery, toggleSidebar }) {
    const navigate = useNavigate();

    return (
        <div className="navbar">
            <div className="navbar-logo" onClick={() => navigate('/main')}>Gawana</div>
            <div className="navbar-right">
                <div
                    className="search-box"
                    onClick={() => {
                        setSearchQuery(prev => (prev ? '' : 'search'));
                        setTimeout(() => document.querySelector('.search-input')?.focus(), 0);
                    }}
                >
                    <FontAwesomeIcon icon="fa-search" />
                </div>
                <div className="sidebar-toggle" onClick={toggleSidebar}>
                    ☰
                </div>
            </div>
        </div>
    );
}

// --- Sidebar Component ---
function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const sidebarRef = useRef(null);
    const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const [showModeDropdown, setShowModeDropdown] = useState(false);
    const [mode, setMode] = useState(localStorage.getItem('mode') || 'dark');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
            setShowPlaylistDropdown(false);
            setShowModeDropdown(false);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        localStorage.setItem('mode', mode);
        document.body.dataset.mode = mode;
    }, [mode]);

    const fetchPlaylists = useCallback(async () => {
        setLoadingPlaylists(true);
        try {
            const res = await axios.get('http://localhost:5000/api/playlists', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setPlaylists(res.data);
        } catch (error) {
            console.error('Failed to fetch playlists:', error);
            setPlaylists([]);
        } finally {
            setLoadingPlaylists(false);
        }
    }, []);

    const handlePlaylistClick = () => {
        if (!showPlaylistDropdown) {
            fetchPlaylists();
        }
        setShowPlaylistDropdown(!showPlaylistDropdown);
    };

    const handleLogout = () => {
        logout(navigate);
        onClose();
    };

    const handleAccountClick = () => {
        navigate('/account');
        onClose();
    };

    const handleModeHover = (isHovering) => {
        setShowModeDropdown(isHovering);
    };

    const handleModeSelect = (mode) => {
        setMode(mode.toLowerCase());
        onClose();
    };

    const handlePlaylistNameClick = (playlistId) => {
        navigate(`/playlist/${playlistId}`);
        onClose();
    };

    const handleCreatePlaylist = async () => {
        const playlistName = prompt('Enter playlist name:');
        if (playlistName) {
            try {
                await axios.post('http://localhost:5000/api/playlists', { name: playlistName }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                fetchPlaylists();
            } catch (error) {
                console.error('Failed to create playlist:', error);
            }
        }
    };

    return (
        <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
            <a href="#" onClick={handleAccountClick}>Account</a>
            <div
                className="sidebar-item-with-dropdown"
                onMouseEnter={() => handleModeHover(true)}
                onMouseLeave={() => handleModeHover(false)}
            >
                <a href="#" onClick={(e) => e.preventDefault()}>Mode</a>
                {showModeDropdown && (
                    <div className="mode-dropdown">
                        <span onClick={() => handleModeSelect('Dark')}>Dark</span>
                        <span onClick={() => handleModeSelect('Light')}>Light</span>
                        <span onClick={() => handleModeSelect('Neon')}>Neon</span>
                    </div>
                )}
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); handlePlaylistClick(); }}>Playlist</a>
            {showPlaylistDropdown && (
                <div className="playlist-dropdown">
                    {loadingPlaylists ? (
                        <span>Loading playlists...</span>
                    ) : playlists.length > 0 ? (
                        <>
                            {playlists.map(playlist => (
                                <span key={playlist._id} onClick={() => handlePlaylistNameClick(playlist._id)}>
                                    {playlist.name}
                                </span>
                            ))}
                            <span onClick={handleCreatePlaylist} className="create-playlist">
                                <FontAwesomeIcon icon="fa-plus" /> Create New Playlist
                            </span>
                        </>
                    ) : (
                        <>
                            <span>No playlists found. Create one</span>
                            <span onClick={handleCreatePlaylist} className="create-playlist">
                                <FontAwesomeIcon icon="fa-plus" /> Create New Playlist
                            </span>
                        </>
                    )}
                </div>
            )}
            {user && <a href="#" onClick={handleLogout}>Logout</a>}
        </div>
    );
}

function MainScreen() {
    const { user } = useAuth();
    const [songs, setSongs] = useState({ moods: {}, genres: {} });
    const [selectedSong, setSelectedSong] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [playlistSongIds, setPlaylistSongIds] = useState([]);
    const navigate = useNavigate();

    const moodCategories = ['happy', 'sad', 'love', 'calm'];
    const genreCategories = ['travel', 'party', 'rap', 'motivational', 'pop'];

    useEffect(() => {
        if (sessionStorage.getItem('showWelcome') === 'true' && user) {
            setShowWelcomeMessage(true);
            sessionStorage.removeItem('showWelcome');
            const timer = setTimeout(() => {
                setShowWelcomeMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    useEffect(() => {
        const fetchPlaylistSongs = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/playlists`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const allSongIds = res.data.flatMap(p => p.songs.map(s => s._id));
                setPlaylistSongIds(allSongIds);
            } catch (err) {
                console.error('Failed to fetch playlist songs:', err);
            }
        };
        fetchPlaylistSongs();
    }, []);

    useEffect(() => {
        const fetchSongs = async () => {
            setLoading(true);
            try {
                const res = await axios.get('http://localhost:5000/api/songs', {
                    timeout: 5000,
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const categorizedSongs = { moods: {}, genres: {} };
                res.data.forEach(song => {
                    if (song.mood && moodCategories.includes(song.mood.toLowerCase())) {
                        categorizedSongs.moods[song.mood.toLowerCase()] = categorizedSongs.moods[song.mood.toLowerCase()] || [];
                        categorizedSongs.moods[song.mood.toLowerCase()].push(song);
                    }
                    if (song.genre && genreCategories.includes(song.genre.toLowerCase())) {
                        categorizedSongs.genres[song.genre.toLowerCase()] = categorizedSongs.genres[song.genre.toLowerCase()] || [];
                        categorizedSongs.genres[song.genre.toLowerCase()].push(song);
                    }
                });
                setSongs(categorizedSongs);
            } catch (error) {
                console.error('Fetch error:', error);
                setSongs({ moods: {}, genres: {} });
            } finally {
                setLoading(false);
            }
        };
        fetchSongs();
    }, []);

    const debouncedSearch = useMemo(() => {
        const debounce = (func, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func(...args), delay);
            };
        };
        const performSearch = async (query) => {
            if (!query.trim()) {
                setSearchResults([]);
                return;
            }
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/songs?search=${encodeURIComponent(query)}`, { timeout: 5000 });
                setSearchResults(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        };
        return debounce(performSearch, 300);
    }, []);

    useEffect(() => {
        debouncedSearch(searchQuery);
    }, [searchQuery, debouncedSearch]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleSongChange = (newSong) => {
        setSelectedSong(newSong);
    };

    const handleAddToPlaylist = async (songId) => {
        setShowPlaylistModal(true);
        setSongToAdd(songId);
        setAddMessage('');
        setLoadingPlaylists(true);
        try {
            const res = await axios.get('http://localhost:5000/api/playlists', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUserPlaylists(res.data || []);
        } catch (err) {
            setUserPlaylists([]);
        } finally {
            setLoadingPlaylists(false);
        }
    };

    const handleSelectPlaylist = async (playlistId) => {
        setAddMessage('');
        try {
            const playlistRes = await axios.get(
                `http://localhost:5000/api/playlists/${playlistId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            const currentSongs = (playlistRes.data.songs || []).map(s => s._id);
            const updatedSongs = currentSongs.includes(songToAdd) ? currentSongs : [...currentSongs, songToAdd];
            await axios.put(
                `http://localhost:5000/api/playlists/${playlistId}`,
                { name: playlistRes.data.name, songs: updatedSongs },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setAddMessage('Song added to playlist!');
            setPlaylistSongIds(prev => [...prev, songToAdd]);
            setTimeout(() => {
                setShowPlaylistModal(false);
                setSongToAdd(null);
                setAddMessage('');
            }, 1000);
        } catch (err) {
            setAddMessage('Failed to add song.');
        }
    };

    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [songToAdd, setSongToAdd] = useState(null);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const [addMessage, setAddMessage] = useState('');

    if (loading && !searchQuery) return (
        <div className="loading">
            <div></div>
        </div>
    );

    return (
        <div className="main-screen">
            <Navbar
                onSearch={() => {}}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                toggleSidebar={toggleSidebar}
            />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

     
<div className="content-area">
    {searchQuery && (
        <div className="search-overlay">
            <input
                type="text"
                value={searchQuery === 'search' ? '' : searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                placeholder="Search songs (e.g., hum nava mere, Arijit, love, party)..."
                autoFocus
            />
      
<div className="search-results">
    {searchQuery.trim() && searchQuery !== 'search' ? (
        loading ? (
            <div className="card empty">Searching...</div>
        ) : searchResults.length > 0 ? (
            <div className="songs-column">
                {searchResults.map(song => (
                    <div key={song._id} className="song-card full-line" onClick={() => setSelectedSong({ ...song, songList: searchResults })}>
                        <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
                        <div className="song-details">
                            <h4>{song.title}</h4>
                            <p>{song.singer}</p>
                            <p style={{ fontSize: '0.85rem', color: '#a78bfa', margin: 0 }}>
                                {song.mood ? `Mood: ${song.mood}` : ''} {song.genre ? `| Genre: ${song.genre}` : ''} {song.movie ? `| Movie: ${song.movie}` : ''}
                            </p>
                        </div>
                        {!playlistSongIds.includes(song._id) && (
                            <button className="add-song-button" onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(song._id); }}>
                                <FontAwesomeIcon icon="fa-plus" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        ) : (
            // Only show "No songs found" if NOT loading and searchResults is empty
            !loading && (
                <div className="card empty">No songs found for "{searchQuery}"</div>
            )
        )
    ) : null}
</div>

        </div>
    )}


                {!searchQuery && (
                    <>
                        {showWelcomeMessage && user && (
                            <div className="welcome-message animate-fade-in-out">
                                Welcome, {user.fullName.split(' ')[0]}!
                            </div>
                        )}
                        <div className="main-content">
                            <section className="mood-section">
                                <h2>Moods</h2>
                                <div className="mood-cards">
                                    {moodCategories.map((mood) => (
                                        <div key={mood} className={`mood-card ${mood}`} onClick={() => navigate(`/moods/${mood}`)}>
                                            <h3>{mood.charAt(0).toUpperCase() + mood.slice(1)}</h3>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            <section className="genre-section">
                                <h2>Genres</h2>
                                <div className="mood-cards">
                                    {genreCategories.map((genre) => (
                                        <div key={genre} className={`mood-card ${genre}`} onClick={() => navigate(`/genres/${genre}`)}>
                                            <h3>{genre.charAt(0).toUpperCase() + genre.slice(1)}</h3>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </div>
            {showPlaylistModal && (
                <div className="playlist-modal-overlay" onClick={() => setShowPlaylistModal(false)}>
                    <div className="playlist-modal" onClick={e => e.stopPropagation()}>
                        <h4>Select Playlist</h4>
                        {loadingPlaylists ? (
                            <div>Loading...</div>
                        ) : userPlaylists.length > 0 ? (
                            <ul>
                                {userPlaylists.map(pl => (
                                    <li key={pl._id}>
                                        <button className="playlist-modal-btn" onClick={() => handleSelectPlaylist(pl._id)}>
                                            {pl.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div>No playlists found.</div>
                        )}
                        {addMessage && <div className="playlist-modal-message">{addMessage}</div>}
                        <button className="playlist-modal-cancel" onClick={() => setShowPlaylistModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
            {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} onSongChange={handleSongChange} />}
        </div>
    );
}

// --- Mood Songs Screen ---
function MoodSongsScreen() {
    const { moodName } = useParams();
    const [allSongs, setAllSongs] = useState([]);
    const [moodSongs, setMoodSongs] = useState([]);
    const [playlistSongIds, setPlaylistSongIds] = useState([]);
    const [loadingMoodSongs, setLoadingMoodSongs] = useState(true);
    const [selectedSong, setSelectedSong] = useState(null);
    const [error, setError] = useState('');
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [songToAdd, setSongToAdd] = useState(null);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const [addMessage, setAddMessage] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            setLoadingMoodSongs(true);
            setError('');
            try {
                const res = await axios.get('http://localhost:5000/api/songs', {
                    timeout: 5000,
                    headers: { Authorization: `Bearer ${token}` }
                });
                const songs = Array.isArray(res.data) ? res.data : [];
                setAllSongs(songs);
                setMoodSongs(songs.filter(song => song.mood && song.mood.toLowerCase().includes(moodName.toLowerCase())));
                const playlistRes = await axios.get('http://localhost:5000/api/playlists', { headers: { Authorization: `Bearer ${token}` } });
                const allSongIds = (playlistRes.data || []).flatMap(pl => (pl.songs || []).map(s => s._id));
                setPlaylistSongIds(allSongIds);
            } catch (err) {
                setError('Failed to load songs or playlists.');
                setMoodSongs([]);
            } finally {
                setLoadingMoodSongs(false);
            }
        };
        fetchData();
    }, [moodName, token]);

    const handleAddToPlaylist = async (songId) => {
        setSongToAdd(songId);
        setShowPlaylistModal(true);
        setAddMessage('');
        setLoadingPlaylists(true);
        try {
            const res = await axios.get('http://localhost:5000/api/playlists', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserPlaylists(res.data || []);
        } catch (err) {
            setUserPlaylists([]);
        } finally {
            setLoadingPlaylists(false);
        }
    };

    const handleSelectPlaylist = async (playlistId) => {
        setAddMessage('');
        try {
            const playlistRes = await axios.get(
                `http://localhost:5000/api/playlists/${playlistId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const currentSongs = (playlistRes.data.songs || []).map(s => s._id);
            const updatedSongs = currentSongs.includes(songToAdd) ? currentSongs : [...currentSongs, songToAdd];
            await axios.put(
                `http://localhost:5000/api/playlists/${playlistId}`,
                { name: playlistRes.data.name, songs: updatedSongs },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAddMessage('Song added to playlist!');
            setPlaylistSongIds(prev => [...prev, songToAdd]);
            setTimeout(() => {
                setShowPlaylistModal(false);
                setSongToAdd(null);
                setAddMessage('');
            }, 1000);
        } catch (err) {
            setAddMessage('Failed to add song.');
        }
    };

    const handleSongChange = (newSong) => {
        setSelectedSong(newSong);
    };

    const displayName = moodName.charAt(0).toUpperCase() + moodName.slice(1);

    return (
        <div className="mood-songs-screen">
            <Navbar onSearch={() => {}} searchQuery="" setSearchQuery={() => {}} toggleSidebar={() => {}} />
            <div className="content-area">
                <h2>{displayName} Songs</h2>
                {loadingMoodSongs ? (
                    <p className="loading-message">Fetching songs of {displayName}...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : moodSongs.length > 0 ? (
                    <div className="songs-column">
                        {moodSongs.map(song => (
                            <div key={song._id} className="song-card full-line" onClick={() => setSelectedSong({ ...song, songList: moodSongs })}>
                                <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
                                <div className="song-details">
                                    <h4>{song.title}</h4>
                                    <p>{song.singer}</p>
                                    <p style={{ fontSize: '0.85rem', color: '#a78bfa', margin: 0 }}>
                                        {song.genre ? `Genre: ${song.genre}` : ''}
                                    </p>
                                </div>
                                {!playlistSongIds.includes(song._id) && (
                                    <button className="add-song-button" onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(song._id); }}>
                                        <FontAwesomeIcon icon="fa-plus" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-songs-message">No songs available for {displayName}.</p>
                )}
            </div>

            {showPlaylistModal && (
                <div className="playlist-modal-overlay" onClick={() => setShowPlaylistModal(false)}>
                    <div className="playlist-modal" onClick={e => e.stopPropagation()}>
                        <h4>Select Playlist</h4>
                        {loadingPlaylists ? (
                            <div>Loading...</div>
                        ) : userPlaylists.length > 0 ? (
                            <ul>
                                {userPlaylists.map(pl => (
                                    <li key={pl._id}>
                                        <button className="playlist-modal-btn" onClick={() => handleSelectPlaylist(pl._id)}>
                                            {pl.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div>No playlists found.</div>
                        )}
                        {addMessage && <div className="playlist-modal-message">{addMessage}</div>}
                        <button className="playlist-modal-cancel" onClick={() => setShowPlaylistModal(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} onSongChange={handleSongChange} />}
        </div>
    );
}

// --- Genre Songs Screen ---
function GenreSongsScreen() {
    const { genreName } = useParams();
    const [allSongs, setAllSongs] = useState([]);
    const [genreSongs, setGenreSongs] = useState([]);
    const [playlistSongIds, setPlaylistSongIds] = useState([]);
    const [loadingGenreSongs, setLoadingGenreSongs] = useState(true);
    const [selectedSong, setSelectedSong] = useState(null);
    const [error, setError] = useState('');
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [songToAdd, setSongToAdd] = useState(null);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const [addMessage, setAddMessage] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            setLoadingGenreSongs(true);
            setError('');
            try {
                const res = await axios.get('http://localhost:5000/api/songs', {
                    timeout: 5000,
                    headers: { Authorization: `Bearer ${token}` }
                });
                const songs = Array.isArray(res.data) ? res.data : [];
                setAllSongs(songs);
                setGenreSongs(songs.filter(song => song.genre && song.genre.toLowerCase().includes(genreName.toLowerCase())));
                const playlistRes = await axios.get('http://localhost:5000/api/playlists', { headers: { Authorization: `Bearer ${token}` } });
                const allSongIds = (playlistRes.data || []).flatMap(pl => (pl.songs || []).map(s => s._id));
                setPlaylistSongIds(allSongIds);
            } catch (err) {
                setError('Failed to load songs or playlists.');
                setGenreSongs([]);
            } finally {
                setLoadingGenreSongs(false);
            }
        };
        fetchData();
    }, [genreName, token]);

    const handleAddToPlaylist = async (songId) => {
        setSongToAdd(songId);
        setShowPlaylistModal(true);
        setAddMessage('');
        setLoadingPlaylists(true);
        try {
            const res = await axios.get('http://localhost:5000/api/playlists', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserPlaylists(res.data || []);
        } catch (err) {
            setUserPlaylists([]);
        } finally {
            setLoadingPlaylists(false);
        }
    };

    const handleSelectPlaylist = async (playlistId) => {
        setAddMessage('');
        try {
            const playlistRes = await axios.get(
                `http://localhost:5000/api/playlists/${playlistId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const currentSongs = (playlistRes.data.songs || []).map(s => s._id);
            const updatedSongs = currentSongs.includes(songToAdd) ? currentSongs : [...currentSongs, songToAdd];
            await axios.put(
                `http://localhost:5000/api/playlists/${playlistId}`,
                { name: playlistRes.data.name, songs: updatedSongs },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAddMessage('Song added to playlist!');
            setPlaylistSongIds(prev => [...prev, songToAdd]);
            setTimeout(() => {
                setShowPlaylistModal(false);
                setSongToAdd(null);
                setAddMessage('');
            }, 1000);
        } catch (err) {
            setAddMessage('Failed to add song.');
        }
    };

    const handleSongChange = (newSong) => {
        setSelectedSong(newSong);
    };

    const displayName = genreName.charAt(0).toUpperCase() + genreName.slice(1);

    return (
        <div className="mood-songs-screen">
            <Navbar onSearch={() => {}} searchQuery="" setSearchQuery={() => {}} toggleSidebar={() => {}} />
            <div className="content-area">
                <h2>{displayName} Songs</h2>
                {loadingGenreSongs ? (
                    <p className="loading-message">Fetching songs of {displayName}...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : genreSongs.length > 0 ? (
                    <div className="songs-column">
                        {genreSongs.map(song => (
                            <div key={song._id} className="song-card full-line" onClick={() => setSelectedSong({ ...song, songList: genreSongs })}>
                                <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
                                <div className="song-details">
                                    <h4>{song.title}</h4>
                                    <p>{song.singer}</p>
                                    <p style={{ fontSize: '0.85rem', color: '#a78bfa', margin: 0 }}>
                                        {song.mood ? `Mood: ${song.mood}` : ''}
                                    </p>
                                </div>
                                {!playlistSongIds.includes(song._id) && (
                                    <button className="add-song-button" onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(song._id); }}>
                                        <FontAwesomeIcon icon="fa-plus" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-songs-message">No songs available for {displayName}.</p>
                )}
            </div>

            {showPlaylistModal && (
                <div className="playlist-modal-overlay" onClick={() => setShowPlaylistModal(false)}>
                    <div className="playlist-modal" onClick={e => e.stopPropagation()}>
                        <h4>Select Playlist</h4>
                        {loadingPlaylists ? (
                            <div>Loading...</div>
                        ) : userPlaylists.length > 0 ? (
                            <ul>
                                {userPlaylists.map(pl => (
                                    <li key={pl._id}>
                                        <button className="playlist-modal-btn" onClick={() => handleSelectPlaylist(pl._id)}>
                                            {pl.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div>No playlists found.</div>
                        )}
                        {addMessage && <div className="playlist-modal-message">{addMessage}</div>}
                        <button className="playlist-modal-cancel" onClick={() => setShowPlaylistModal(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} onSongChange={handleSongChange} />}
        </div>
    );
}

// --- Account Screen ---
function Account() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            setLoadingProfile(true);
            try {
                const res = await axios.get('http://localhost:5000/api/user/profile');
                setProfile(res.data);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                setMessage('Failed to load profile details.');
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdateProfile = async () => {
        const newFullName = prompt("Enter new full name:", profile?.fullName);
        if (newFullName && newFullName !== profile.fullName) {
            try {
                const res = await axios.put('http://localhost:5000/api/user/profile', { fullName: newFullName }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setProfile(res.data);
                setMessage('Profile updated successfully!');
            } catch (error) {
                console.error('Failed to update profile:', error);
                setMessage('Failed to update profile: ' + (error.response?.data?.message || 'Unknown error'));
            }
        }
    };

    if (loadingProfile) return (
        <div className="loading">
            <div></div>
        </div>
    );

    return (
        <div className="account-screen">
            <Navbar
                onSearch={() => {}}
                searchQuery=""
                setSearchQuery={() => {}}
                toggleSidebar={() => {}}
            />
            <div className="content-area">
                <h2>Account Details</h2>
                {message && <div className="info-message">{message}</div>}
                {profile ? (
                    <>
                        <p><strong>Full Name:</strong> {profile.fullName}</p>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Join Date:</strong> {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                        }) : 'N/A'}</p>
                        <button className="edit-profile-button" onClick={handleUpdateProfile}>Edit Profile</button>
                    </>
                ) : (
                    <p>No profile data available.</p>
                )}
            </div>
        </div>
    );
}

// --- Playlist Detail Screen ---
function PlaylistDetailScreen() {
    const { playlistId } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSong, setSelectedSong] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlaylist = async () => {
            const token = localStorage.getItem('token');
            setLoading(true);
            setMessage('');

            if (!token) {
                setMessage('No authentication token found. Please log in.');
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get(`http://localhost:5000/api/playlists/${playlistId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000,
                });
                setPlaylist(res.data);
            } catch (error) {
                const errMsg = error.response
                    ? `Status: ${error.response.status}, Message: ${error.response.data?.message || 'Unknown error'}`
                    : error.message;
                console.error('Fetch error:', errMsg);
                setMessage(`Failed to load playlist. ${errMsg}`);
                setPlaylist(null);
            } finally {
                setLoading(false);
            }
        };

        if (playlistId) fetchPlaylist();
    }, [playlistId]);

    const handleRemoveSong = async (songIdToRemove) => {
        if (!window.confirm('Are you sure you want to remove this song?')) return;

        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const updatedSongs = playlist.songs.filter(s => s._id !== songIdToRemove).map(s => s._id);

            await axios.put(`http://localhost:5000/api/playlists/${playlistId}`, {
                name: playlist.name,
                songs: updatedSongs,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setPlaylist(prev => ({
                ...prev,
                songs: prev.songs.filter(s => s._id !== songIdToRemove)
            }));
            setMessage('Song removed successfully!');
        } catch (error) {
            console.error('Remove song error:', error.message);
            setMessage('Failed to remove song.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditPlaylist = async () => {
        const newName = prompt('Enter new playlist name:', playlist.name);
        if (newName && newName !== playlist.name) {
            try {
                await axios.put(`http://localhost:5000/api/playlists/${playlistId}`, {
                    name: newName,
                    songs: playlist.songs.map(s => s._id),
                }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setPlaylist(prev => ({ ...prev, name: newName }));
                setMessage('Playlist name updated successfully!');
            } catch (error) {
                console.error('Failed to update playlist name:', error);
                setMessage('Failed to update playlist name.');
            }
        }
    };

    const handleSongChange = (newSong) => {
        setSelectedSong(newSong);
    };

    if (loading) {
        return (
            <div className="content-area">
                <p>Loading...</p>
            </div>
        );
    }

    if (!playlist) {
        return (
            <div className="playlist-detail-screen content-area">
                <p>{message || 'Playlist not found.'}</p>
            </div>
        );
    }

    return (
        <div className="playlist-detail-screen">
            <Navbar
                onSearch={() => {}}
                searchQuery=""
                setSearchQuery={() => {}}
                toggleSidebar={() => {}}
            />
            <div className="content-area">
                <h2>
                    {playlist.name}
                    <button className="edit-playlist-button" onClick={handleEditPlaylist}>
                        <FontAwesomeIcon icon="fa-pencil" />
                    </button>
                </h2>
                {message && <div className="info-message">{message}</div>}

                {playlist.songs && playlist.songs.length > 0 ? (
                    <div className="songs-column">
                        {playlist.songs.map(song => (
                            <div
                                key={song._id}
                                className="song-card full-line"
                                onClick={() => setSelectedSong({ ...song, songList: playlist.songs })}
                            >
                                <img
                                    src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'}
                                    alt={song.title}
                                    className="song-thumbnail"
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
                    <p>Your playlist is empty. Add songs to enjoy your music!</p>
                )}
            </div>

            {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} onSongChange={handleSongChange} />}
        </div>
    );
}

// --- Music Player Component ---
// ...existing code...

function MusicPlayer({ song, onClose, onSongChange }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const audioRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);

    // Only create a new audio element when the song changes
    useEffect(() => {
        if (!song.audioUrl) return;

        // Clean up previous audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }

        const audio = new Audio(song.audioUrl);
        audio.volume = volume;
        audio.preload = 'auto';
        audio.onerror = () => console.error('Audio load error for:', song.audioUrl);

        const updateTime = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => {
            handleNextSong();
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('ended', handleEnded);

        audioRef.current = audio;
        setCurrentTime(0);

        // Only play if isPlaying is true
        if (isPlaying) {
            audio.play().catch(err => console.error('Audio play error:', err));
        }

        if (song.songList) {
            const index = song.songList.findIndex(s => s._id === song._id);
            setCurrentSongIndex(index !== -1 ? index : 0);
        }

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
        };
        // Only depend on song/audioUrl and songList
    }, [song.audioUrl, song._id, song.songList]);

    // Play/pause logic: only control playback, don't recreate audio
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.play().catch(err => console.error('Audio play error:', err));
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    // Volume logic: only update volume, don't recreate audio
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        const handleInactivity = () => {
            if (document.hidden && isPlaying) setIsAnimating(true);
            else setIsAnimating(false);
        };
        document.addEventListener('visibilitychange', handleInactivity);
        return () => {
            document.removeEventListener('visibilitychange', handleInactivity);
        };
    }, [isPlaying]);

    const togglePlay = () => {
        if (audioRef.current && song.audioUrl) {
            setIsPlaying((prev) => !prev);
        }
    };

    const handleNextSong = () => {
        if (!song.songList || song.songList.length === 0) return;
        const nextIndex = (currentSongIndex + 1) % song.songList.length;
        const newSong = { ...song.songList[nextIndex], songList: song.songList };
        setCurrentSongIndex(nextIndex);
        if (onSongChange) onSongChange(newSong);
    };

    const handlePreviousSong = () => {
        if (!song.songList || song.songList.length === 0) return;
        const prevIndex = (currentSongIndex - 1 + song.songList.length) % song.songList.length;
        const newSong = { ...song.songList[prevIndex], songList: song.songList };
        setCurrentSongIndex(prevIndex);
        if (onSongChange) onSongChange(newSong);
    };

    const handleTimeDrag = (e) => {
        if (audioRef.current && audioRef.current.duration) {
            const time = (e.target.value / 100) * audioRef.current.duration;
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    };

    const handleMinimize = (e) => {
        e.stopPropagation();
        setIsMinimized(!isMinimized);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const duration = audioRef.current ? audioRef.current.duration || 0 : 0;

    return (
        <div className={`music-player ${isMinimized ? 'minimized' : ''}`}>
            {isAnimating && <div className="animate-gradient" />}
            <button className="close-player-button" onClick={onClose}>✖</button>
            <div className="player-content">
                <img src={song.thumbnailUrl || 'https://placehold.co/100x100/333/FFF?text=♪'} alt={song.title} />
                <div className="song-info">
                    <h4>{song.title}</h4>
                    <p>{song.singer}</p>
                </div>
                {!isMinimized && (
                    <div className="controls">
                        <div className="time-display">
                            <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={duration ? (currentTime / duration) * 100 : 0}
                            onChange={handleTimeDrag}
                            className="progress-bar"
                        />
                        <div className="player-buttons">
                            <button onClick={handlePreviousSong}><FontAwesomeIcon icon="fa-step-backward" /></button>
                            <button onClick={togglePlay}>
                                <FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} />
                            </button>
                            <button onClick={handleNextSong}><FontAwesomeIcon icon="fa-step-forward" /></button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="volume-slider"
                            />
                        </div>
                    </div>
                )}
            </div>
            <button className="minimize-player-button" onClick={handleMinimize}>
                <FontAwesomeIcon icon={isMinimized ? 'fa-chevron-up' : 'fa-chevron-down'} />
            </button>
        </div>
    );
}

// ...existing code...

// --- Main App Component ---
function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<SplashScreen />} />
                    <Route path="/login" element={<AuthScreen />} />
                    <Route path="/main" element={<ProtectedRoute><MainScreen /></ProtectedRoute>} />
                    <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                    <Route path="/moods/:moodName" element={<ProtectedRoute><MoodSongsScreen /></ProtectedRoute>} />
                    <Route path="/genres/:genreName" element={<ProtectedRoute><GenreSongsScreen /></ProtectedRoute>} />
                    <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetailScreen /></ProtectedRoute>} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;