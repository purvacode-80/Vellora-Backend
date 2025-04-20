const express = require('express');
const app = express();
console.log("Welcome to Express")
const mongoose = require('mongoose');

// Connect to MongoDB

mongoose.connect('mongodb+srv://purva_db_39:JjKd42aDdEhPKw7K@vellora-cluster.aruoylu.mongodb.net/Vellora', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
    console.log("Connected to MongoDB");
})
.catch(err => console.log("Error connecting to MongoDB"))

//Use cors
const cors = require('cors');
app.use(cors());

app.use(express.json());
app.get('/', (req,res) => { 
    res.send("Welcome to the Express server");
})

//Routes
const user_route = require('./Routes/user_routes')
app.use('/users', user_route)

const port = 8000
app.listen(port, ()=> {
    console.log(`Server running on port ${port}`);
})
