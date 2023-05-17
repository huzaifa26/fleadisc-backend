import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import http from "http"
import mongoose from "mongoose"
import cron from 'node-cron'
import { Server } from 'socket.io'
// import { corsOptions } from './config/corsOptions.js'
import { checkDiscTime } from './controllers/discController.js'
import { errorHandler } from './middlewares/errorHandler.js'
import chatRoutes from './routes/chatRoutes.js'
import deliveryRoutes from './routes/deliveryRoutes.js'
import discRoutes from './routes/discRoutes.js'
import token from './routes/tokenRoutes.js'
import userRoutes from './routes/userRoutes.js'

import functions from "firebase-functions"

const allowedOrigins = ['http://localhost:5173', 'https://fleadisc.netlify.app', 'https://fleadisc.com'];

const app = express()
const server = http.createServer(app);
export const io = new Server(server, { cors: { origin: ['http://localhost:5173', 'https://fleadisc.netlify.app', 'https://fleadisc.com'] } });

export let onlineUsers = []

const addNewUser = (userId, socketId) => {
    !onlineUsers.some(user => user.userId === userId) && onlineUsers.push({ userId, socketId })
}

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socketId)
}

export const getUsers = (userId) => {
    return onlineUsers.find(user => user.userId === userId)
}

io.on('connection', (socket) => {
    //new user
    socket.on('newUser', (userId) => {
        addNewUser(userId, socket.id)
    })

    //remove user
    socket.on('removeUser', (userId) => {
        removeUser(socket.id)
    })

    //disconnect function
    socket.on("disconnect", () => {
        removeUser(socket.id)
    })
});

dotenv.config({ path: "./.env" })
mongoose.set('strictQuery', true);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(cookieParser())

// app.use(cors(corsOptions))
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            let msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }

        // Set the Access-Control-Allow-Origin header to the origin value
        return callback(null, { origin: true });
    },
    exposedHeaders: ['Access-Control-Allow-Origin'] // Add this line to expose the header
}));


app.use('/user', userRoutes)
app.use('/token', token)
app.use('/disc', discRoutes)
app.use('/chat', chatRoutes)
app.use('/delivery', deliveryRoutes)

cron.schedule('*/30 * * * * *', () => {
    checkDiscTime()
});

// const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGODB_URL2, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Database Connected');
        // app.listen(PORT, () => { console.log(`Server started on port ${PORT}`); })
    })
    .catch((e) => {
        console.log(e.code, '=>', e.message);
    })

// server.listen(5001, () => {
//     console.log(`Server listening on port ${5001}`);
// });

app.set('port', process.env.PORT || 5000);

server.listen(app.get('port'), function () {
    var port = server.address().port;
    console.log('Running on : ', port);
});

app.use(errorHandler)

app.get('/test', (req, res) => {
    res.send("wokring");
})

export const api = functions.https.onRequest(app)
