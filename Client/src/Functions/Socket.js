// import { io } from 'socket.io-client';

// let socket;

// const WebSocket = () => {
//   if (!socket) {
//     const token = localStorage.getItem('token'); // Or however you store your JWT

//     socket = io('wss://ws.finnhub.io?token=0fl0hpr01qr6dbso5ugd0fl0hpr01qr6dbso5v0', {
//       auth: {
//         token
//       },
//       transports: ['websocket']
//     });

//     socket.on('connect', () => {
//       console.log('🟢 Connected to socket:', socket.id);
//     });

//     socket.on('connect_error', (err) => {
//       console.error('❌ Socket connection error:', err.message);
//     });

//     socket.on('disconnect', () => {
//       console.log('🔴 Disconnected from socket');
//     });
//   }

//   return socket;
// };

// export default WebSocket;
