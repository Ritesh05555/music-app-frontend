// import React, { useState, useEffect, useRef, useCallback } from 'react';
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

//     const login = (token, userData) => {
//         localStorage.setItem('token', token);
//         axios.defaults.headers.Authorization = `Bearer ${token}`;
//         setUser(userData);
//         sessionStorage.setItem('showWelcome', 'true');
//     };

//     const logout = () => {
//         localStorage.removeItem('token');
//         axios.defaults.headers.Authorization = null;
//         setUser(null);
//         sessionStorage.removeItem('showWelcome');
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

// function ProtectedRoute({ children, isAdmin }) {
//     const { user, loading } = useAuth();
//     const location = useLocation();

//     if (loading) {
//         return <Loading />;
//     }

//     if (!user) {
//         return <Navigate to="/login" state={{ from: location }} replace />;
//     }

//     if (isAdmin && user.role !== 'admin') {
//         return <Navigate to="/login" state={{ from: location }} replace />;
//     }

//     return children;
// }

// // --- Loading Component ---
// function Loading() {
//     return (
//         <div className="loading">
//             <div></div>
//         </div>
//     );
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
//             login(res.data.token, res.data.user);
//             navigate('/main');
//         } catch (error) {
//             console.error('Auth error:', error);
//             setMessage(isLogin ? 'Login failed: ' + (error.response?.data?.message || 'Unknown error') : 'Signup failed: ' + (error.response?.data?.message || 'Unknown error'));
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) return <Loading />;

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
//         logout();
//         onClose();
//         navigate('/login');
//     };

//     const handleAccountClick = () => {
//         navigate('/account');
//         onClose();
//     };

//     const handleModeHover = (isHovering) => {
//         setShowModeDropdown(isHovering);
//     };

//     const handleModeSelect = (mode) => {
//         console.log(`Mode selected: ${mode}`);
//         onClose();
//     };

//     const handlePlaylistNameClick = (playlistId) => {
//         navigate(`/playlist/${playlistId}`);
//         onClose();
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
//                         playlists.map(playlist => (
//                             <span key={playlist._id} onClick={() => handlePlaylistNameClick(playlist._id)}>
//                                 {playlist.name}
//                             </span>
//                         ))
//                     ) : (
//                         <span>No playlists found.</span>
//                     )}
//                 </div>
//             )}
//             {user && <a href="#" onClick={handleLogout}>Logout</a>}
//         </div>
//     );
// }

// // --- Main Screen ---
// function MainScreen() {
//     const { user } = useAuth();
//     const [songs, setSongs] = useState({});
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//     const moods = ['love', 'sad', 'motivation', 'travel', 'party', 'pop', 'rap'];

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
//         const fetchSongs = async () => {
//             setLoading(true);
//             try {
//                 const responses = await Promise.all(moods.map(mood =>
//                     axios.get(`http://localhost:5000/api/songs?mood=${mood}`, { timeout: 5000 })
//                         .then(res => {
//                             console.log(`Fetched ${mood} songs:`, res.data);
//                             return { mood, data: Array.isArray(res.data) ? res.data : [] };
//                         })
//                         .catch(error => {
//                             console.error(`Failed to fetch ${mood}:`, error.message, error.response?.data || error.response?.statusText || 'No response data');
//                             return { mood, data: [] };
//                         })
//                 ));
//                 const songsData = responses.reduce((acc, { mood, data }) => {
//                     acc[mood] = data;
//                     return acc;
//                 }, {});
//                 setSongs(songsData);
//             } catch (error) {
//                 console.error('Overall fetch error:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchSongs();
//     }, []);

//     const handleSearch = async () => {
//         if (!searchQuery.trim()) {
//             setSearchResults([]);
//             return;
//         }
//         setLoading(true);
//         try {
//             const res = await axios.get(`http://localhost:5000/api/songs?search=${searchQuery}`, { timeout: 5000 });
//             setSearchResults(Array.isArray(res.data) ? res.data : []);
//         } catch (error) {
//             console.error('Search error:', error.message, error.response?.data);
//             setSearchResults([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const toggleSidebar = () => {
//         setIsSidebarOpen(!isSidebarOpen);
//     };

//     if (loading) return <Loading />;

//     return (
//         <div className="main-screen">
//             <Navbar
//                 onSearch={handleSearch}
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
//                             onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//                             className="search-input"
//                             placeholder="Search songs..."
//                             autoFocus
//                         />
//                         <div className="search-results">
//                             {searchResults.length > 0 ? (
//                                 searchResults.map(song => (
//                                     <div key={song._id} onClick={() => setSelectedSong(song)} className="song-list-item">
//                                         <div className="song-details">
//                                             <h4>{song.title}</h4>
//                                             <p>{song.singer}</p>
//                                         </div>
//                                         <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
//                                     </div>
//                                 ))
//                             ) : (
//                                 <div className="card empty">No songs found</div>
//                             )}
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
//                         <div className="songs-list">
//                             {moods.map(mood => (
//                                 <div key={mood} className="mood-section">
//                                     <h3>{mood.charAt(0).toUpperCase() + mood.slice(1)}</h3>
//                                     {songs[mood]?.length > 0 ? (
//                                         songs[mood].map(song => (
//                                             <div key={song._id} onClick={() => setSelectedSong(song)} className="song-list-item">
//                                                 <div className="song-details">
//                                                     <h4>{song.title}</h4>
//                                                     <p>{song.singer}</p>
//                                                 </div>
//                                                 <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
//                                             </div>
//                                         ))
//                                     ) : (
//                                         <div className="card empty">No songs for this mood</div>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     </>
//                 )}
//             </div>
//             {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} />}
//         </div>
//     );
// }

// // --- Mood Songs Screen ---
// function MoodSongsScreen() {
//     const { moodName } = useParams();
//     const [moodSongs, setMoodSongs] = useState([]);
//     const [loadingMoodSongs, setLoadingMoodSongs] = useState(true);
//     const [selectedSong, setSelectedSong] = useState(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchMoodSongs = async () => {
//             setLoadingMoodSongs(true);
//             try {
//                 const res = await axios.get(`http://localhost:5000/api/songs?mood=${moodName.toLowerCase()}`, { timeout: 5000 });
//                 setMoodSongs(Array.isArray(res.data) ? res.data : []);
//             } catch (error) {
//                 console.error(`Failed to fetch songs for ${moodName}:`, error.message, error.response?.data);
//                 setMoodSongs([]);
//             } finally {
//                 setLoadingMoodSongs(false);
//             }
//         };
//         fetchMoodSongs();
//     }, [moodName]);

//     const displayName = moodName.charAt(0).toUpperCase() + moodName.slice(1);

//     return (
//         <div className="mood-songs-screen">
//             <Navbar
//                 onSearch={() => {}}
//                 searchQuery=""
//                 setSearchQuery={() => {}}
//                 toggleSidebar={() => {}}
//             />
//             <div className="content-area">
//                 <h2>{displayName} Mood Songs</h2>
//                 {loadingMoodSongs ? (
//                     <p className="loading-message">Fetching songs of {displayName} mood...</p>
//                 ) : moodSongs.length > 0 ? (
//                     <div className="songs-list">
//                         {moodSongs.map(song => (
//                             <div key={song._id} className="song-list-item" onClick={() => setSelectedSong(song)}>
//                                 <div className="song-details">
//                                     <h4>{song.title}</h4>
//                                     <p>{song.singer}</p>
//                                 </div>
//                                 <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <p className="no-songs-message">No songs available for this section.</p>
//                 )}
//             </div>
//             {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} />}
//         </div>
//     );
// }

// // --- Account Screen ---
// function Account() {
//     const { user } = useAuth();
//     const [profile, setProfile] = useState(null);
//     const [loadingProfile, setLoadingProfile] = useState(true);
//     const [message, setMessage] = useState('');

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

//     if (loadingProfile) return <Loading />;

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
//                         <p><strong>Join Date:</strong> {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</p>
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
//     const [loadingPlaylist, setLoadingPlaylist] = useState(true);
//     const [selectedSong, setSelectedSong] = useState(null);
//     const [message, setMessage] = useState('');

//     useEffect(() => {
//         const fetchPlaylist = async () => {
//             setLoadingPlaylist(true);
//             setMessage('');
//             try {
//                 const res = await axios.get(`http://localhost:5000/api/playlists/${playlistId}`, {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//                 });
//                 setPlaylist(res.data);
//             } catch (error) {
//                 console.error('Failed to fetch playlist:', error);
//                 setMessage('Failed to load playlist.');
//                 setPlaylist(null);
//             } finally {
//                 setLoadingPlaylist(false);
//             }
//         };
//         if (playlistId) {
//             fetchPlaylist();
//         }
//     }, [playlistId]);

//     const handleRemoveSong = async (songIdToRemove) => {
//         if (!confirm('Are you sure you want to remove this song?')) {
//             return;
//         }
//         setLoadingPlaylist(true);
//         setMessage('');
//         try {
//             const updatedSongs = playlist.songs.filter(s => s._id !== songIdToRemove).map(s => s._id);
//             await axios.put(`http://localhost:5000/api/playlists/${playlistId}`, {
//                 name: playlist.name,
//                 songs: updatedSongs,
//             }, {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//             });
//             setPlaylist(prev => ({
//                 ...prev,
//                 songs: prev.songs.filter(s => s._id !== songIdToRemove)
//             }));
//             setMessage('Song removed successfully!');
//         } catch (error) {
//             console.error('Failed to remove song:', error);
//             setMessage('Failed to remove song.');
//         } finally {
//             setLoadingPlaylist(false);
//         }
//     };

//     if (loadingPlaylist) return <Loading />;
//     if (!playlist) return <div className="playlist-detail-screen content-area"><p>{message || 'Playlist not found.'}</p></div>;

//     return (
//         <div className="playlist-detail-screen">
//             <Navbar
//                 onSearch={() => {}}
//                 searchQuery=""
//                 setSearchQuery={() => {}}
//                 toggleSidebar={() => {}}
//             />
//             <div className="content-area">
//                 <h2>{playlist.name}</h2>
//                 {message && <div className="info-message">{message}</div>}
//                 {playlist.songs && playlist.songs.length > 0 ? (
//                     <div className="songs-list">
//                         {playlist.songs.map(song => (
//                             <div key={song._id} className="song-list-item" onClick={() => setSelectedSong(song)}>
//                                 <div className="song-details">
//                                     <h4>{song.title}</h4>
//                                     <p>{song.singer}</p>
//                                 </div>
//                                 <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
//                                 <button className="remove-song-button" onClick={() => handleRemoveSong(song._id)}>
//                                     <FontAwesomeIcon icon="fa-minus" />
//                                 </button>
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <p>No songs in this playlist.</p>
//                 )}
//             </div>
//             {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} />}
//         </div>
//     );
// }

// // --- Admin Dashboard ---
// function AdminDashboard() {
//     const [stats, setStats] = useState({});
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchStats = async () => {
//             setLoading(true);
//             try {
//                 const [users, songs, playlists] = await Promise.all([
//                     axios.get('http://localhost:5000/api/users'),
//                     axios.get('http://localhost:5000/api/songs'),
//                     axios.get('http://localhost:5000/api/playlists'),
//                 ]);
//                 setStats({
//                     totalUsers: users.data.length,
//                     totalSongs: songs.data.length,
//                     recentSongs: songs.data.slice(0, 5),
//                     activePlaylists: playlists.data.slice(0, 5),
//                 });
//             } catch (error) {
//                 console.error(error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchStats();
//     }, []);

//     if (loading) return <Loading />;

//     return (
//         <div className="admin-panel">
//             <Navbar
//                 onSearch={() => {}}
//                 searchQuery=""
//                 setSearchQuery={() => {}}
//                 toggleSidebar={() => {}}
//             />
//             <div className="content-area">
//                 <h2>Admin Dashboard</h2>
//                 <p>Total Users: {stats.totalUsers}</p>
//                 <p>Total Songs: {stats.totalSongs}</p>
//                 <h3>Recent Songs</h3>
//                 {stats.recentSongs.map(song => <div key={song._id}>{song.title}</div>)}
//                 <h3>Active Playlists</h3>
//                 {stats.activePlaylists.map(playlist => <div key={playlist._id}>{playlist.name}</div>)}
//             </div>
//         </div>
//     );
// }

// // --- Music Player Component ---
// function MusicPlayer({ song, onClose }) {
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [volume, setVolume] = useState(0.5);
//     const audioRef = useRef(null);
//     const [isAnimating, setIsAnimating] = useState(false);
//     const [isMinimized, setIsMinimized] = useState(false);

//     useEffect(() => {
//         if (!audioRef.current) {
//             audioRef.current = new Audio(song.audioUrl);
//             audioRef.current.volume = volume;

//             const updateTime = () => setCurrentTime(audioRef.current.currentTime);
//             const handleEnded = () => {
//                 setIsPlaying(false);
//                 setCurrentTime(0);
//             };

//             audioRef.current.addEventListener('timeupdate', updateTime);
//             audioRef.current.addEventListener('ended', handleEnded);

//             return () => {
//                 audioRef.current.removeEventListener('timeupdate', updateTime);
//                 audioRef.current.removeEventListener('ended', handleEnded);
//                 audioRef.current.pause();
//                 audioRef.current = null;
//             };
//         } else {
//             audioRef.current.src = song.audioUrl;
//             audioRef.current.load();
//             if (isPlaying) {
//                 audioRef.current.play();
//             }
//         }
//     }, [song.audioUrl, isPlaying, volume]);

//     useEffect(() => {
//         const audio = audioRef.current;
//         if (audio) audio.volume = volume;

//         const handleInactivity = () => {
//             if (document.hidden && isPlaying) setIsAnimating(true);
//             else setIsAnimating(false);
//         };

//         document.addEventListener('visibilitychange', handleInactivity);
//         return () => {
//             document.removeEventListener('visibilitychange', handleInactivity);
//         };
//     }, [isPlaying, volume]);

//     const togglePlay = () => {
//         if (audioRef.current) {
//             if (isPlaying) {
//                 audioRef.current.pause();
//             } else {
//                 audioRef.current.play().catch(e => console.error("Error playing audio:", e));
//             }
//             setIsPlaying(!isPlaying);
//         }
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
//         if (audioRef.current) {
//             audioRef.current.volume = newVolume;
//         }
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

//     const duration = audioRef.current ? audioRef.current.duration : 0;

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
//                             value={(currentTime / duration) * 100 || 0}
//                             onChange={handleTimeDrag}
//                             className="progress-bar"
//                         />
//                         <div className="player-buttons">
//                             <button><FontAwesomeIcon icon="fa-step-backward" /></button>
//                             <button onClick={togglePlay}>
//                                 <FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} />
//                             </button>
//                             <button><FontAwesomeIcon icon="fa-step-forward" /></button>
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
//         <AuthProvider>
//             <Router>
//                 <Routes>
//                     <Route path="/" element={<SplashScreen />} />
//                     <Route path="/login" element={<AuthScreen />} />
//                     <Route path="/main" element={<ProtectedRoute><MainScreen /></ProtectedRoute>} />
//                     <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
//                     <Route path="/moods/:moodName" element={<ProtectedRoute><MoodSongsScreen /></ProtectedRoute>} />
//                     <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetailScreen /></ProtectedRoute>} />
//                     <Route path="/admin" element={<ProtectedRoute isAdmin><AdminDashboard /></ProtectedRoute>} />
//                 </Routes>
//             </Router>
//         </AuthProvider>
//     );
// }

// export default App;

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
// console.log('Token:', localStorage.getItem('token'));
    const login = (token, userData) => {
        localStorage.setItem('token', token);
        axios.defaults.headers.Authorization = `Bearer ${token}`;
        setUser(userData);
        sessionStorage.setItem('showWelcome', 'true');
    };

    const logout = () => {
        localStorage.removeItem('token');
        axios.defaults.headers.Authorization = null;
        setUser(null);
        sessionStorage.removeItem('showWelcome');
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

function ProtectedRoute({ children, isAdmin }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (isAdmin && user.role !== 'admin') {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

// --- Loading Component ---
function Loading() {
    return (
        <div className="loading">
            <div></div>
        </div>
    );
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
            login(res.data.token, res.data.user);
            navigate('/main');
        } catch (error) {
            console.error('Auth error:', error);
            setMessage(isLogin ? 'Login failed: ' + (error.response?.data?.message || 'Unknown error') : 'Signup failed: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

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
        logout();
        onClose();
        navigate('/login');
    };

    const handleAccountClick = () => {
        navigate('/account');
        onClose();
    };

    const handleModeHover = (isHovering) => {
        setShowModeDropdown(isHovering);
    };

    const handleModeSelect = (mode) => {
        console.log(`Mode selected: ${mode}`);
        onClose();
    };

    const handlePlaylistNameClick = (playlistId) => {
        navigate(`/playlist/${playlistId}`);
        onClose();
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
                        playlists.map(playlist => (
                            <span key={playlist._id} onClick={() => handlePlaylistNameClick(playlist._id)}>
                                {playlist.name}
                            </span>
                        ))
                    ) : (
                        <span>No playlists found.</span>
                    )}
                </div>
            )}
            {user && <a href="#" onClick={handleLogout}>Logout</a>}
        </div>
    );
}

// --- Main Screen ---
function MainScreen() {
    const { user } = useAuth();
    const [songs, setSongs] = useState({});
    const [selectedSong, setSelectedSong] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navigate = useNavigate(); // <-- Add this line

    const moods = ['happy', 'sad', 'love', 'calm'];
    const genres = ['travel', 'party', 'rap', 'motivational', 'pop'];

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

  // ...existing code...
useEffect(() => {
    const fetchSongs = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/songs', {
                timeout: 5000,
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const songsData = res.data.reduce((acc, song) => {
                const category = song.mood.toLowerCase();
                acc[category] = acc[category] || [];
                acc[category].push(song);
                return acc;
            }, {});
            setSongs(songsData);
        } catch (error) {
            console.error('Fetch error:', error);
            setSongs({});
        } finally {
            setLoading(false);
        }
    };
    fetchSongs();
}, []);
// ...existing code...

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/songs?search=${encodeURIComponent(searchQuery)}`, { timeout: 5000 });
            setSearchResults(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    if (loading) return <Loading />;

    return (
        <div className="main-screen">
            <Navbar
                onSearch={handleSearch}
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
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="search-input"
                            placeholder="Search songs (e.g., hum nava mere)..."
                            autoFocus
                        />
                        <div className="search-results">
                            {searchResults.length > 0 ? (
                                searchResults.map(song => (
                                    <div key={song._id} onClick={() => setSelectedSong(song)} className="song-list-item">
                                        <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
                                        <div className="song-details">
                                            <h4>{song.title}</h4>
                                            <p>{song.singer}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="card empty">No songs found for "{searchQuery}"</div>
                            )}
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
                                    {moods.map((mood) => (
                                        <div key={mood} className={`mood-card ${mood}`} onClick={() => navigate(`/moods/${mood}`)}>
                                            <h3>{mood.charAt(0).toUpperCase() + mood.slice(1)}</h3>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            <section className="genre-section">
                                <h2>Genres</h2>
                                <div className="mood-cards">
                                    {genres.map((genre) => (
                                        <div key={genre} className={`mood-card ${genre}`} onClick={() => navigate(`/moods/${genre}`)}>
                                            <h3>{genre.charAt(0).toUpperCase() + genre.slice(1)}</h3>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </div>
            {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} />}
        </div>
    );
}

// --- Mood Songs Screen ---
function MoodSongsScreen() {
    const { moodName } = useParams();
    const [moodSongs, setMoodSongs] = useState([]);
    const [loadingMoodSongs, setLoadingMoodSongs] = useState(true);
    const [selectedSong, setSelectedSong] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMoodSongs = async () => {
            setLoadingMoodSongs(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/songs?mood=${moodName.toLowerCase()}`, { timeout: 5000 });
                setMoodSongs(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error(`Failed to fetch songs for ${moodName}:`, error);
                setMoodSongs([]);
            } finally {
                setLoadingMoodSongs(false);
            }
        };
        fetchMoodSongs();
    }, [moodName]);

    const displayName = moodName.charAt(0).toUpperCase() + moodName.slice(1);

    return (
        <div className="mood-songs-screen">
            <Navbar
                onSearch={() => {}}
                searchQuery=""
                setSearchQuery={() => {}}
                toggleSidebar={() => {}}
            />
            <div className="content-area">
                <h2>{displayName} Songs</h2>
                {loadingMoodSongs ? (
                    <p className="loading-message">Fetching songs of {displayName}...</p>
                ) : moodSongs.length > 0 ? (
                    <div className="songs-grid">
                        {moodSongs.map(song => (
                            <div key={song._id} className="song-card" onClick={() => setSelectedSong(song)}>
                                <img src={song.thumbnailUrl || 'https://placehold.co/50x50/333/FFF?text=♪'} alt={song.title} className="song-thumbnail" />
                                <div className="song-details">
                                    <h4>{song.title}</h4>
                                    <p>{song.singer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-songs-message">No songs available for {displayName}.</p>
                )}
            </div>
            {selectedSong && <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} />}
        </div>
    );
}

// --- Account Screen ---
function Account() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [message, setMessage] = useState('');

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

    if (loadingProfile) return <Loading />;

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
                <h2>{playlist.name}</h2>
                {message && <div className="info-message">{message}</div>}

                {playlist.songs && playlist.songs.length > 0 ? (
                    <div className="songs-grid">
                        {playlist.songs.map(song => (
                            <div
                                key={song._id}
                                className="song-card"
                                onClick={() => setSelectedSong(song)}
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

            {selectedSong && (
                <MusicPlayer song={selectedSong} onClose={() => setSelectedSong(null)} />
            )}
        </div>
    );
}


// --- Admin Dashboard ---
function AdminDashboard() {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const [users, songs, playlists] = await Promise.all([
                    axios.get('http://localhost:5000/api/users'),
                    axios.get('http://localhost:5000/api/songs'),
                    axios.get('http://localhost:5000/api/playlists'),
                ]);
                setStats({
                    totalUsers: users.data.length,
                    totalSongs: songs.data.length,
                    recentSongs: songs.data.slice(0, 5),
                    activePlaylists: playlists.data.slice(0, 5),
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="admin-panel">
            <Navbar
                onSearch={() => {}}
                searchQuery=""
                setSearchQuery={() => {}}
                toggleSidebar={() => {}}
            />
            <div className="content-area">
                <h2>Admin Dashboard</h2>
                <p>Total Users: {stats.totalUsers}</p>
                <p>Total Songs: {stats.totalSongs}</p>
                <h3>Recent Songs</h3>
                {stats.recentSongs.map(song => <div key={song._id}>{song.title}</div>)}
                <h3>Active Playlists</h3>
                {stats.activePlaylists.map(playlist => <div key={playlist._id}>{playlist.name}</div>)}
            </div>
        </div>
    );
}

// --- Music Player Component ---
// ...existing code...

function MusicPlayer({ song, onClose }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const audioRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // Handle audio element and playback
    useEffect(() => {
        if (!song.audioUrl) return;

        // Clean up previous audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }

        // Create new audio
        const audio = new Audio(song.audioUrl);
        audio.volume = volume;
        audio.preload = 'auto';
        audio.onerror = () => console.error('Audio load error for:', song.audioUrl);

        const updateTime = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('ended', handleEnded);

        audioRef.current = audio;
        setCurrentTime(0);
        setIsPlaying(false);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
        };
    }, [song.audioUrl]);

    // Play/pause effect
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.play().catch(err => console.error('Audio play error:', err));
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    // Volume effect
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Animation on tab inactive
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
                            <button><FontAwesomeIcon icon="fa-step-backward" /></button>
                            <button onClick={togglePlay}>
                                <FontAwesomeIcon icon={isPlaying ? 'fa-pause' : 'fa-play'} />
                            </button>
                            <button><FontAwesomeIcon icon="fa-step-forward" /></button>
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

// ...rest of your code...

// --- Main App Component ---
function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<SplashScreen />} />
                    <Route path="/login" element={<AuthScreen />} />
                    <Route path="/main" element={<ProtectedRoute><MainScreen /></ProtectedRoute>} />
                    <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                    <Route path="/moods/:moodName" element={<ProtectedRoute><MoodSongsScreen /></ProtectedRoute>} />
                    <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetailScreen /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute isAdmin><AdminDashboard /></ProtectedRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;