import { Request, Response } from 'express';
const express = require('express');
const cors = require('cors')
require('dotenv').config()
import { sendSetupEmail } from "./utils/email"
import superadminRoutes from './Routes/superAdminRouter';
import adminRoutes from './Routes/adminRouter';
import userRoutes from './Routes/userRouter';
import sequelize from './config/db';
import { SuperAdmin } from './models/SuperAdmin';
import { Admin } from './models/Admin';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const port = 3000;

const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:4200', // your Angular app's address
    credentials: false // if you're sending cookies or using authentication
  }));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')))
app.get('/admin/initialize/:token', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '/public/setup.html'));
});

app.get('/initialize', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '/public/initialize.html'))
})

app.use('/superadmin', superadminRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

app.get('/', (req: Request, res: Response) => {
    // res.send('Hello World!');
    res.sendFile(path.join(__dirname, '/public/home.html'));
})


io.on("connection", (socket) => {
    console.log("Client connected", socket.id)

    socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id)
    })
})

sequelize.sync().then(async () => {
    server.listen(port, () => {
        console.log('Server is running on port: ', port);
        
    });
}).catch((err: Error) => console.log(err));