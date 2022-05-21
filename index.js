const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.PORT || 5000;
const app = express();

//? middle were
app.use(cors());
app.use(express.json());
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access!' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
        if (error) {
            return res.status(403).send({ message: "Access Forbidden!" })
        }
        req.decoded = decoded;
        next();
    })
}

//? database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@doctors-portal.ax38y.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//? server stablish
const server = async () => {
    try {
        client.connect();
        const database = client.db('doctors_portal');
        const appointmentCollection = database.collection('appointments');
        const bookingCollection = database.collection('bookings');
        const userCollection = database.collection('users');

        //? register users
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const option = { upsert: true };
            const updateDoc = {
                $set: user,
            }
            const result = await userCollection.updateOne(filter, updateDoc, option);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: "1h" });
            res.send({ result, token: token });
        })

        //? get all users 
        app.get('/users', async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const result = cursor.toArray();
            res.send(result)
        })

        //? get all appointment
        app.get('/appointment', async (req, res) => {
            const query = {};
            const cursor = appointmentCollection.find(query);
            const appointments = await cursor.toArray();
            res.send(appointments);
        })

        //? book an appointment
        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const query = { treatment: booking.treatment, date: booking.date, patientEmail: booking.patientEmail };
            const exist = await bookingCollection.findOne(query);
            if (exist) {
                return res.send({ success: false, booking: exist })
            }
            const result = await bookingCollection.insertOne(booking);
            res.send({ success: true, booking: result });
        })

        //? get available slots
        app.get('/available-slots', async (req, res) => {
            const date = req.query.date;

            //? get all appointments
            const appointments = await appointmentCollection.find().toArray();

            //? get appointment by date
            const query = { date: date };
            const booking = await bookingCollection.find(query).toArray();

            //? for each appointment find the booking
            appointments.forEach(appoint => {
                const appointmentBookings = booking.filter(book => book.treatment === appoint.name);
                const booked = appointmentBookings.map(book => book.slot);
                const available = appoint.slots.filter(slot => !booked.includes(slot));
                appoint.slots = available;
            })

            res.send(appointments)
        })

        //? get booked appointment for users
        app.get('/booking', verifyToken, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (decodedEmail === email) {
                const query = { patientEmail: email };
                const cursor = bookingCollection.find(query);
                const booked = await cursor.toArray();
                return res.send(booked);
            } else {
                return res.status(403).send({message: "Fodbidden Access!"});
            }
        })
    }

    finally {
        //// client.close();
    }
}

server().catch(console.dir)

//? listening to port
app.get('/', (req, res) => {
    res.send("Server is running")
})

app.listen(port, () => {
    console.log("listening to port", port);
})