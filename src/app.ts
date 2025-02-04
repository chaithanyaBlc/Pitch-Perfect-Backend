import { Request, Response } from 'express';
const express = require('express');
const cors = require('cors')
import superadminRoutes from './Routes/superAdminRouter';
import adminRoutes from './Routes/adminRouter';
import sequelize from './config/db';
import { SuperAdmin } from './models/SuperAdmin';
import { Admin } from './models/Admin';
import path from 'path';
require('dotenv').config()


const app = express();
const port = 3000;

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

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
})


sequelize.sync({ force: true }).then(async () => {
    app.listen(port, () => {
        console.log('Server is running on port: ', port);
    });
}).catch((err: Error) => console.log(err));