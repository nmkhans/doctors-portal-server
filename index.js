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
const uri = "mongodb+srv://MoinKhan:<password>@doctors-portal.ax38y.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//? listening to port

app.get('/', (req, res) => {
    res.send("Server is running")
})

app.listen(port, () => {
    console.log("port is listening to", port);
})