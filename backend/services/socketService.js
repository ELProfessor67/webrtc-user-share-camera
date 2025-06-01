import { Server } from 'socket.io';


export class SocketService {
    peerRooms = {}
    constructor(server) {
        this.io = new Server(server,{
            cors: {
                origin: "*"
            }
        });
    }

    setupSocketListeners() {
        this.io.on('connection', (socket) => {
            console.log('New client connected');
            socket.on('join-room', (roomId) => {
                socket.join(roomId);
                socket.emit('room-joined', roomId);
                this.peerRooms[socket.id] = roomId;
                console.log(`Client ${socket.id} joined room ${roomId}`);
            });

         
            socket.on('offer', (offer, roomId) => {
                socket.to(roomId).emit('offer', offer);
            });

            socket.on('answer', (answer, roomId) => {
                socket.to(roomId).emit('answer', answer);
            });

            socket.on('ice-candidate', (candidate, roomId) => {
                socket.to(roomId).emit('ice-candidate', candidate);
            });

            socket.on('user-disconnected', (roomId) => {
                socket.to(roomId).emit('user-disconnected', roomId);
            });


            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }
}