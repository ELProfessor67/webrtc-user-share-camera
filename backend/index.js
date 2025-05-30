import "dotenv/config";
import express from 'express';
import cors from 'cors';
import http from 'http';
import { SocketService } from "./services/socketService.js";
import { v4 as uuidv4 } from 'uuid';
import sendMessage from "./services/twilloService.js";
import { sendMail } from "./services/mailService.js";
import { connectDB } from "./utils/database.js";
import ErrorMiddleware from "./middlewares/error.js";
import router from "./route.js";
import cookieParser from "cookie-parser"


connectDB();
const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const socketService = new SocketService(server);
socketService.setupSocketListeners();

app.get('/', (req, res) => {
    res.send('Server is running');
});


app.get('/send-token', async (req, res) => {
    const {number,email} = req.query;
    const token = uuidv4();
    console.log(email);
    const url = `https://webrtc-share.vercel.app/room/${token}`;
    const message = `Please click on the link below to connect with your landlord ${url}`;
    if(number){
        await sendMessage(number,message);
    }
    if(email){
        await sendMail(email,"Landlord",message);
    }
    res.json({token});
});

app.use("/api/v1",router)
app.use(ErrorMiddleware);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});







