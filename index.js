const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.PORT || 5000;
const app = express();

//? middle were
app.use(cors());
app.use(express.json());

//? database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@doctors-portal.ax38y.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//? server stablish
const server = async () => {
    try {
        client.connect();
        const database = client.db('doctors-portal');
        const bookingCollection = database.collection('bookings');
        console.log('database connected')
    }

    finally {
        client.close();
    }
}

server().catch(console.dir)

//? listening to port
app.get('/', (req, res) => {
    res.send("Server is running")
})

app.listen(port, () => {
    console.log("port is listening to", port);
})