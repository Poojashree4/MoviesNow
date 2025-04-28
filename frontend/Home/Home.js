




import React, { useEffect, useState,useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import io from 'socket.io-client';
// import { socket, joinMovieRoom } from './Socket';
import socket, { joinMovieRoom } from './Socket';

const { width } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const [user, setUser] = useState('');
  const [token, setToken] = useState('');
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);

  const socket = useRef(null);

  useEffect(() => {
    const loadUserData = async () => {
        console.log("user ID=",user)
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');
const storedUserId=await AsyncStorage.getItem('userId');
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      }
    };

    loadUserData();
    fetchPosters();
  }, []);
//socket
  useEffect(() => {
    socket.current = io('http://192.168.1.26:5000', {
      transports: ['websocket']
    });
  
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  const fetchPosters = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://192.168.1.26:5000/api/posters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPosters(data.posters || []);
    } catch (error) {
      console.error('Error fetching posters:', error);
      Alert.alert('Error', 'Failed to fetch movie posters');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      console.log("Logged out");
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };
console.log("userid:",user.userId)

  const handlePosterPress = (movie) => {
    // socket.current.emit("joinMovieRoom", movie.movieId);
    joinMovieRoom(movie.movieId); 
    navigation.navigate('MovieDetails', { movie });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading movies...</Text>
      </View>
    );
  }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.heading}>🎬 MoviesNow</Text>
//         {user && (
//           <View style={styles.userInfo}>
//             <Text style={styles.subText}>Welcome back, {user.name}</Text>
//             <Text style={styles.emailText}>{user.email}</Text>
//             <Text style={styles.subText}>User Id:{user.userId}</Text>
//           </View>
//         )}
//       </View>

//       <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//         <Text style={styles.logoutText}>Logout</Text>
//       </TouchableOpacity>

//       <Text style={styles.sectionTitle}>Now Showing</Text>
      
//       <View style={styles.postersContainer}>
//         {posters.length > 0 ? (
//           posters.map((movie, index) => (
           
//             <TouchableOpacity 
//   key={index} 
//   style={styles.posterCard}
//   onPress={() => handlePosterPress(movie)}
//   activeOpacity={0.8}
// >
//   <Image
//     source={{ uri: movie.poster }}
//     style={styles.posterImage}
//     resizeMode="cover"
//   />
//   <View style={styles.posterDetails}>
//     <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
//     <Text style={styles.movieInfo}>{movie.genre} • {movie.duration || '2h 30m'}</Text>
//     <Text style={styles.movieRating}>⭐ {movie.rating}/10</Text>

//     {/* Book Ticket Button */}
//     <TouchableOpacity
//       style={styles.bookButton}
//       onPress={() => navigation.navigate('bookticket', { movie })}
//     >
//       <Text style={styles.bookButtonText}>Book Ticket</Text>
//     </TouchableOpacity>
//   </View>
// </TouchableOpacity>

//           ))
//         ) : (
//           <Text style={styles.noMoviesText}>No movies available at the moment</Text>
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 20,
//     backgroundColor: '#f8f9fa',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//   },
//   loadingText: {
//     fontSize: 18,
//     color: '#6c757d',
//   },
//   header: {
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   heading: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#212529',
//     marginBottom: 5,
//   },
//   userInfo: {
//     alignItems: 'center',
//   },
//   subText: {
//     fontSize: 16,
//     color: '#495057',
//   },
//   emailText: {
//     fontSize: 14,
//     color: '#6c757d',
//   },
//   logoutButton: {
//     backgroundColor: '#dc3545',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 25,
//     alignSelf: 'center',
//     width: '40%',
//     alignItems: 'center',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//   },
//   logoutText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#212529',
//     marginBottom: 15,
//     paddingLeft: 10,
//   },
//   postersContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   posterCard: {
//     width: width * 0.45,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginBottom: 20,
//     overflow: 'hidden',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//   },
//   posterImage: {
//     width: '100%',
//     height: 250,
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//   },
//   posterDetails: {
//     padding: 12,
//   },
//   movieTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#212529',
//     marginBottom: 5,
//   },
//   movieInfo: {
//     fontSize: 14,
//     color: '#6c757d',
//     marginBottom: 5,
//   },
//   movieRating: {
//     fontSize: 14,
//     color: '#ffc107',
//     fontWeight: 'bold',
//   },
//   noMoviesText: {
//     fontSize: 16,
//     color: '#6c757d',
//     textAlign: 'center',
//     width: '100%',
//     marginTop: 50,
//   },
//   bookButton: {
//     backgroundColor: '#28a745',
//     marginTop: 10,
//     paddingVertical: 8,
//     borderRadius: 6,
//     alignItems: 'center',
//   },
//   bookButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
  
// });

// export default Home;

return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>🎬 MoviesNow</Text>
        
        <View style={styles.userContainer}>
          {user && (
            <View style={styles.userInfo}>
              <Text style={styles.subText}>Welcome back, {user.name}</Text>
              <Text style={styles.emailText}>{user.email}</Text>
              <Text style={styles.subText}>User Id: {user.userId}</Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Now Showing</Text>
      
      <View style={styles.postersContainer}>
        {posters.length > 0 ? (
          posters.map((movie, index) => (
            <View key={index} style={styles.posterWrapper}>
              <TouchableOpacity 
                style={styles.posterCard}
                onPress={() => handlePosterPress(movie)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: movie.poster }}
                  style={styles.posterImage}
                  resizeMode="cover"
                />
                <View style={styles.posterDetails}>
                  <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
                  <Text style={styles.movieInfo}>{movie.genre} • {movie.duration || '2h 30m'}</Text>
                  <Text style={styles.movieRating}>⭐ {movie.rating}/10</Text>

                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => navigation.navigate('bookticket', { movie })}
                  >
                    <Text style={styles.bookButtonText}>Book Ticket</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noMoviesText}>No movies available at the moment</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    color: '#6c757d',
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
    textAlign: 'center',
  },
  userContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  userInfo: {
    marginBottom: 15,
  },
  subText: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 3,
  },
  emailText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
    paddingLeft: 5,
  },
  postersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  posterWrapper: {
    width: width * 0.85,
    marginBottom: 25,
    alignItems: 'center',
  },
  posterCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  posterImage: {
    width: '100%',
    height: 300,
  },
  posterDetails: {
    padding: 15,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  movieInfo: {
    fontSize: 15,
    color: '#6c757d',
    marginBottom: 8,
  },
  movieRating: {
    fontSize: 15,
    color: '#ffc107',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noMoviesText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    width: '100%',
    marginTop: 50,
  },
  bookButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 5,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Home;


// C:\Users\hariv\Reactnative\MovieBooking\backend