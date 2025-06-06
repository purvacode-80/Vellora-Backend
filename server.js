const express = require('express');
const app = express();
console.log("Welcome to Express")
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB

mongoose.connect('mongodb+srv://dhanashreemore314:MlajhyMm5IfPwZWW@vellora-cluster.aruoylu.mongodb.net/Vellora', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
    console.log("Connected to MongoDB");
})
.catch(err => console.log("Error connecting to MongoDB:", err.message))

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

const contact_route = require('./Routes/contact_routes')
app.use('/contact', contact_route)

const lead_route = require('./Routes/lead_routes')
app.use('/lead', lead_route)

const task_route = require('./Routes/task_routes')
app.use('/task', task_route)

const event_route = require('./Routes/event_routes')
app.use('/event', event_route)

const analytics_route = require('./Analytics/analytics_routes')
app.use('/analytics', analytics_route)

// Generating email responses using Gemini and sending emails
const gemini_route = require('./Gemini/email_routes')
app.use('/gemini', gemini_route)

//Saving email logs
const emailLog_route = require('./Routes/email_routes')
app.use('/email', emailLog_route)

// Chatbot routes
const chat_route = require('./Gemini/chat_routes')
app.use('/chat', chat_route)

const port = 8000
app.listen(port, ()=> {
    console.log(`Server running on port ${port}`);
})
