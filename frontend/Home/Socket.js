// import {io} from  "socket.io-client";

// export const Socket =io("http://192.168.67.229:5000",{
//     transports: ["websocket"],
//     timeout:10000,
// });

// Socket.on("connect", ()=>{
//     console.log("Connected to server");
// });

// Socket.on("connect_error", (err)=>{
//     console.error("Connection error: ", err.message);
// });

import { io } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.1.26:5000';

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  forceNew: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
});

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected to socket server');
  console.log('⚡ Socket client initialized');

});

socket.on('connect_error', (err) => {
  console.error('❌ Connection error:', err.message);
});

export const joinMovieRoom = (movieId) => {
  socket.emit('joinMovieRoom', movieId);
};
export default socket;



// Socket.js
// import { io } from 'socket.io-client';

// const SOCKET_URL = 'http://192.168.1.17:5000';
// let socket = null;

// export const initializeSocket = () => {
//   if (!socket) {
//     socket = io(SOCKET_URL, {
//       transports: ['websocket']
//     });
//   }
//   return socket;
// };

// export const joinMovieRoom = (movieId) => {
//   if (!socket) initializeSocket();
//   socket.emit('joinMovieRoom', movieId);
// };

// export const getSocket = () => {
//   if (!socket) initializeSocket();
//   return socket;
// };