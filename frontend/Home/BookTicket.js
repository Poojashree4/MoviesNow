


import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import Modal from 'react-native-modal';

const BookTicket = ({ route, navigation }) => {
  const { movie } = route.params;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [user, setUser] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [otherSelectedSeats, setOtherSelectedSeats] = useState([]);
  const [temporarilyReservedSeats, setTemporarilyReservedSeats] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);

  const socketRef = useRef(null);
  const seatPrice = 100;


 

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }

        socketRef.current = io('http://192.168.1.26:5000', {
          transports: ['websocket']
        });

        socketRef.current.on('connect', () => {
          console.log('Connected to socket server');
          if (movie?.movieId) {
            socketRef.current.emit('joinMovieRoom', movie.movieId);
          }
        });

        socketRef.current.on('existingBookedSeats', (data) => {
          console.log('Existing booked seats:', data.seats);
          setBookedSeats(data.seats);
        });

        socketRef.current.on('seatBooked', (data) => {
          console.log('Seats booked by another user:', data.seats);
          setBookedSeats(prev => [...new Set([...prev, ...data.seats])]);
          setOtherSelectedSeats(prev => prev.filter(seat => !data.seats.includes(seat)));
        });
        
        socketRef.current.on('seatSelected', (data) => {
          console.log('Seats selected by other user:', data);
          if (data.userId !== user?.userId) {
            setOtherSelectedSeats(prev => [...new Set([...prev, ...data.seats])]);
            const newReservations = {};
            data.seats.forEach(seat => {
              newReservations[seat] = Date.now();
            });
            setTemporarilyReservedSeats(prev => ({...prev, ...newReservations}));
          }
        });

        socketRef.current.on('seatDeselected', (data) => {
          console.log('Seats deselected by other user:', data);
          if (data.userId !== user?.userId) {
            setOtherSelectedSeats(prev => prev.filter(seat => !data.seats.includes(seat)));
            setTemporarilyReservedSeats(prev => {
              const updatedReservations = { ...prev };
              data.seats.forEach(seat => {
                delete updatedReservations[seat];
              });
              return updatedReservations;
            });
          }
        });

        return () => {
          if (socketRef.current) {
            socketRef.current.disconnect();
          }
        };
      } catch (error) {
        console.error('Socket initialization error:', error);
      }
    };

    initializeSocket();

    const reservationCheckInterval = setInterval(() => {
      const now = Date.now();
      setTemporarilyReservedSeats(prev => {
        const updated = {};
        Object.entries(prev).forEach(([seat, timestamp]) => {
          if (now - timestamp < 30000) {
            updated[seat] = timestamp;
          }
        });
        return updated;
      });
    }, 5000);

    return () => clearInterval(reservationCheckInterval);
  }, [movie?.movieId, user?.userId]);

//   useEffect(() => {
//     const fetchBookedSeats = async () => {
//       try {
//         const response = await fetch(`http://192.168.1.26:5000/api/movies/${movie.movieId}/seats`);
//         const data = await response.json();
//         setBookedSeats(data.bookedSeats || []);
//       } catch (error) {
//         console.error('Failed to fetch booked seats:', error);
//       }
//     };

//     fetchBookedSeats();
//   }, [movie.movieId]);

  useEffect(() => {
    setTotalPrice(selectedSeats.length * seatPrice);
  }, [selectedSeats]);

  const handleSeatSelection = (seatNo) => {
    if (bookedSeats.includes(seatNo)) return;
    if (Object.keys(temporarilyReservedSeats).includes(seatNo.toString())) return;
  
    setSelectedSeats(prev => {
      let updatedSeats;
      if (prev.includes(seatNo)) {
        updatedSeats = prev.filter(seat => seat !== seatNo);
        socketRef.current.emit('deselectSeats', {
          movieId: movie.movieId,
          seats: [seatNo],
          userId: user.userId
        });
      } else {
        updatedSeats = [...prev, seatNo];
        socketRef.current.emit('selectSeats', {
          movieId: movie.movieId,
          seats: [seatNo],
          userId: user.userId
        });
      }
      return updatedSeats;
    });
  };
  
  const getSeatStatus = (seatNo) => {
    if (bookedSeats.includes(seatNo)) return 'booked';
    if (selectedSeats.includes(seatNo)) return 'selected';
    if (otherSelectedSeats.includes(seatNo)) return 'selectedByOthers';
    return 'available';
  };

  const handleBookSeats = async () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Error', 'Please select at least one seat');
      return;
    }
  
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }
  
    setIsBooking(true);
  
    socketRef.current.emit('bookSeats', {
      movieId: movie.movieId,
      seats: selectedSeats,
      userId: user.userId
    }, (response) => {
        console.log('Booking response:', response);
      setIsBooking(false);
  
//       if (response.success) {
//         const bookingInfo = {
//           movieTitle: movie.title,
//           seats: selectedSeats,
//           totalPrice: selectedSeats.length * seatPrice,
//           bookingDate: new Date().toLocaleString(),
//          // bookingId: response.bookingId || Math.floor(Math.random() * 100000),
//           theater: "PVR Cinemas",
//           showTime: "6:30 PM",
//         };
//         Alert.alert('Debugging', `Booking Info: ${JSON.stringify(bookingInfo)}`);

//         console.log('Booking Info:', bookingInfo);

//         setBookingDetails( bookingInfo );
//         setBookingConfirmed(true);
//         setSelectedSeats([]);
//         console.log('Modal Visibility:', isModalVisible);
//         setIsModalVisible(true); 
//        // setShowTicketModal(true); // This is the key change - show modal immediately after booking
//       } else {
//         Alert.alert('Error', response.message);
//       }
//     });
//   };

if (response && response.success) {
    const bookingInfo = {
      movieTitle: movie.title,
      seats: selectedSeats,
      totalPrice: selectedSeats.length * seatPrice,
      bookingDate: new Date().toLocaleString(),
      bookingId: response.bookingId,
      theater: "PVR Cinemas",
      showTime: "6:30 PM",
    };

    console.log('Booking successful:', bookingInfo);
    setBookingDetails(bookingInfo);
    setIsModalVisible(true);
    setSelectedSeats([]);
  } else {
    const errorMessage = response?.message || 'Booking failed';
    console.error('Booking error:', errorMessage);
    Alert.alert('Error', errorMessage);
  }
});
};
  const renderSeatGrid = () => {
    const seats = [];
    const rows = 9;
    const cols = 6;

    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      for (let col = 1; col <= cols; col++) {
        const seatNumber = (row - 1) * cols + col;
        const status = getSeatStatus(seatNumber);
        
        rowSeats.push(
          <TouchableOpacity
            key={seatNumber}
            style={[
              styles.seat,
              status === 'booked' && styles.bookedSeat,
              status === 'selected' && styles.selectedSeat,
              status === 'selectedByOthers' && styles.selectedByOthersSeat,
            ]}
            onPress={() => handleSeatSelection(seatNumber)}
            disabled={status === 'booked' || status === 'selectedByOthers'}
          >
            <Text style={styles.seatText}>{seatNumber}</Text>
          </TouchableOpacity>
        );
      }
      seats.push(
        <View key={`row-${row}`} style={styles.seatRow}>
          {rowSeats}
        </View>
      );
    }

    return seats;
  };

  return (
    <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.movieHeader}>
          <Image source={{ uri: movie?.poster }} style={styles.poster} />
          <View style={styles.movieInfo}>
            <Text style={styles.title}>{movie?.title}</Text>
            <View style={styles.movieMeta}>
              <Text style={styles.metaText}>{movie?.genre}</Text>
              <Text style={styles.metaText}>•</Text>
              <Text style={styles.metaText}>{movie?.language}</Text>
            </View>
            <Text style={styles.rating}>⭐ {movie?.rating} ({movie?.votes})</Text>
            <Text style={styles.moviePrice}>{movie?.status}</Text>
          </View>
        </View>

        <View style={styles.bookingDetails}>
          <Text style={styles.sectionTitle}>Pick a movie:</Text>
          <Text style={styles.moviePrice}>{movie?.title} (Rs.{seatPrice})</Text>

          <Text style={styles.sectionTitle}>Select Seats</Text>
          {renderSeatGrid()}

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, styles.availableIndicator]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, styles.selectedIndicator]} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, styles.bookedIndicator]} />
              <Text style={styles.legendText}>Occupied</Text>
            </View>
          </View>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              You have selected {selectedSeats.length} seat(s) for a total of Rs.{totalPrice}
            </Text>
          </View>

          {/* {!bookingConfirmed && ( */}
            {/* <TouchableOpacity
              style={[styles.bookButton, selectedSeats.length === 0 && styles.disabledButton]}
              onPress={handleBookSeats}
              disabled={selectedSeats.length === 0 || isBooking}
            >
              <Text style={styles.bookButtonText}>
                {isBooking ? 'Booked' : 'Proceed to Buy'}
              </Text>
            </TouchableOpacity> */}
          {/* )} */}
        </View>
        <TouchableOpacity
          style={[styles.bookButton, selectedSeats.length === 0 && styles.disabledButton]}
          onPress={handleBookSeats}
          disabled={selectedSeats.length === 0 || isBooking}
        >
          <Text style={styles.bookButtonText} onPress={()=>setIsModalVisible(true)}>
            {isBooking ? 'Booked' : 'Proceed to Buy'}
          </Text>
        </TouchableOpacity>

       

      </ScrollView>
      

<Modal
        isVisible={isModalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.7}
        onBackdropPress={() => {
          setIsModalVisible(false);
          navigation.goBack();
        }}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>🎟️ Booking Confirmed!</Text>
          
          {bookingDetails && (
            <>
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketLabel}>Movie:</Text>
                <Text style={styles.ticketValue}>{bookingDetails.movieTitle}</Text>
              </View>
              
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketLabel}>Seats:</Text>
                <Text style={styles.ticketValue}>{bookingDetails.seats.join(', ')}</Text>
              </View>
              
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketLabel}>Total:</Text>
                <Text style={styles.ticketValue}>Rs. {bookingDetails.totalPrice}</Text>
              </View>
              
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketLabel}>Booking ID:</Text>
                <Text style={styles.ticketValue}>{bookingDetails.bookingId}</Text>
              </View>
              
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketLabel}>Theater:</Text>
                <Text style={styles.ticketValue}>{bookingDetails.theater}</Text>
              </View>
              
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketLabel}>Show Time:</Text>
                <Text style={styles.ticketValue}>{bookingDetails.showTime}</Text>
              </View>
            </>
          )}

          <TouchableOpacity 
            style={styles.closeModalButton}
            onPress={() => {
              setIsModalVisible(false);
              navigation.goBack();
            }}
          >
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>  
    </View>
  );
};

// ... (keep your existing styles the same)
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  movieHeader: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  poster: {
    width: 120,
    height: 180,
  },
  movieInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  movieMeta: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  metaText: {
    fontSize: 14,
    color: '#6c757d',
    marginRight: 5,
  },
  rating: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
  },
  moviePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  bookingDetails: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  seatRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 5,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIndicator: {
    width: 20,
    height: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  availableIndicator: {
    backgroundColor: '#C5C6D0',
  },
  selectedIndicator: {
    backgroundColor: '#ffc107',
  },
  bookedIndicator: {
    backgroundColor: '#dc3545',
  },
  legendText: {
    fontSize: 14,
    color: '#6c757d',
  },
  summaryContainer: {
    marginVertical: 20,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 5,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmationBox: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#28a745',
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmationTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  confirmationText: {
    fontSize: 16,
    color: '#fff',
  },
  bookButton: {
    paddingVertical: 15,
    backgroundColor: '#28a745',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  bookButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  seat: {
    width: 40,
    height: 40,
    borderRadius: 5,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C5C6D0',
  },
  bookedSeat: {
    backgroundColor: '#dc3545',
  },
  selectedSeat: {
    backgroundColor: '#ffc107',
  },
  selectedByOthersSeat: {
    backgroundColor: '#dc3545',
  },
  seatText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalFullscreen: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    elevation: 10,
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    textAlign: 'center',
    marginBottom: 20,
  },
  ticketInfo: {
    marginVertical: 8,
  },
  ticketLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  ticketValue: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  closeModalButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modal: {
    justifyContent: 'center',
    margin: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    elevation: 10,
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    textAlign: 'center',
    marginBottom: 20,
  },
  ticketInfo: {
    marginVertical: 8,
  },
  ticketLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  ticketValue: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  closeModalButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

});

export default BookTicket;


