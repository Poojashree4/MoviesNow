



const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const Joi = require("joi");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
// const { connect } = require("http");

const app = express();
const server = http.createServer(app);



app.use(cors());
app.use(express.json());


const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "Moviebooking";
const SECRET = process.env.JWT_SECRET;
const colltname = "movies"; 

let bookingsCollection;


async function connectDB() {
  await client.connect();
  db = client.db(dbName);
  usersname = db.collection("user");
//   bookingsCollection = db.collection('movies');
  console.log("✅ Connected to MongoDB");
}
connectDB();

let db, usersname;

// Update your socket.io initialization and event handlers
const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ['polling', 'websocket']
  });
  
  // Socket.IO connection
  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);
  
    // Join a specific movie room
    socket.on("joinMovieRoom", async (movieId) => {
      try {
        socket.join(movieId);
        console.log(`📽️ Socket ${socket.id} joined room ${movieId}`);
  
        // Fetch and emit already booked seats
        const bookings = await db.collection('bookings').find({ movieId }).toArray();
        const bookedSeats = bookings.flatMap(booking => booking.seats);
        
        socket.emit("existingBookedSeats", {
          movieId,
          seats: bookedSeats
        });
      } catch (err) {
        console.error("Error joining movie room:", err);
      }
    });
  
    // // Handle seat booking
    // socket.on("bookSeats", async (data) => {
    //   try {
    //     const { movieId, seats, userId } = data;
        
    //     // Save to database
    //     await db.collection('bookings').insertOne({
    //       movieId,
        
    //       seats,
    //       userId,
    //       bookedAt: new Date()
    //     });
  
    //     // Notify all clients in this movie room
    //     io.to(movieId).emit("seatBooked", {
    //       seats,
    //       userId
    //     });
    //   } catch (err) {
    //     console.error("Booking error:", err);
    //   }
    // });

    // Update the bookSeats socket handler
socket.on("bookSeats", async (data, callback) => { // Add callback parameter
    try {
      const { movieId, seats, userId } = data;
      
      // Generate a booking ID
      const bookingId = new ObjectId().toString();
    // const bookingId = new ObjectId().toString().slice(-8);

      // Save to database
      await db.collection('bookings').insertOne({
        movieId,
        seats,
        userId,
        bookingId, // Include bookingId in the document
        bookedAt: new Date()
      });
  
      // Notify all clients in this movie room
      io.to(movieId).emit("seatBooked", {
        seats,
        userId
      });
  
      // Send success response back to client
      callback({
        success: true,
        bookingId,
        message: "Booking successful"
      });
    } catch (err) {
      console.error("Booking error:", err);
      callback({
        success: false,
        message: "Booking failed"
      });
    }
  });

    socket.on('selectSeats', ({ movieId, seats, userId }) => {
        socket.to(movieId).emit('seatSelected', { seats, userId });
      });
      
  
    socket.on("disconnect", () => {
      console.log("🔌 Client disconnected:", socket.id);
    });
  });
     
      
      //  Fetch already booked seats for a movieId
      async function getBookedSeats(movieId) {
        const client = await connectDB();
        const bookingCol = client.db("Moviebooking").collection("bookings");
      
        const booking = await bookingCol.findOne({ movieId });
      
        return booking?.seats || [];
      }
      


// Make io accessible in your routes
app.set("io", io);

server.listen(5000, () => {
    console.log('Server running on http://192.168.67.229:5000');
  });

// Schema validation using Joi
const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// 🔐 Register Route😊
app.post("/register", async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { name, email, password } = req.body;

  const userExists = await usersname.findOne({ email });
  if (userExists) return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    name,
    email,
    password: hashedPassword,
    createdAt: new Date(),
  };

  await usersname.insertOne(newUser);
  res.status(201).json({ message: "User registered successfully🥂" });
});

  
  app.post("/login", async (req, res) => {
    try {
      const { error } = loginSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });
  
      const { email, password } = req.body;
  
      const existingUser = await usersname.findOne({ email }); // using the collection correctly
      if (!existingUser)
        return res.status(400).json({ error: "Invalid email or password" });
  
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch)
        return res.status(400).json({ error: "Invalid email or password" });
  
      const token = jwt.sign(
        { userId: existingUser._id, email: existingUser.email },
        SECRET,
        { expiresIn: "50h" }
      );
  
      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          userId: existingUser.userId,
        }
      });
    } catch (err) {
      console.error("Server Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
// poster fetch
  app.post("/api/posters", async (req, res) => {
    const client = new MongoClient(uri);
    
    try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(colltname);
  
      // Project only the poster field
      const posters = await collection.find({}, { projection: { _id: 0, poster: 1,title: 1,genre:1, rating:1,language:1, status:1, screenTimings:1, votes:1, movieId:1 } }).toArray();
  
      res.status(200).json({ posters });
    } catch (error) {
      console.error("Error fetching posters:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      await client.close();
    }
  });


//   app.post("/book-ticket", async (req, res) => {
//     const { userId, movieId, seatNo } = req.body;
//     const io = req.app.get("io");
  
//     try {
//       await client.connect();
//       const db = client.db(dbName);
//       const movieShows = db.collection("movies");
  
//       const show = await movieShows.findOne({ movieId });
  
//       // Check how many seats the user already booked
//       const userBookedSeats = show.seats.filter(
//         s => s.userId === userId
//       );
  
//       if (userBookedSeats.length >= 2) {
//         return res.status(400).json({ message: "User already booked 2 seats." });
//       }
  
//       // Find if seat is available
//       const seatToBook = show.seats.find(s => s.seatNo === seatNo);
  
//       if (!seatToBook || seatToBook.isBooked) {
//         return res.status(400).json({ message: "Seat already booked or not found." });
//       }
  
//       // Book the seat
//       await movieShows.updateOne(
//         { movieId, "seats.seatNo": seatNo },
//         {
//           $set: {
//             "seats.$.isBooked": true,
//             "seats.$.userId": userId
//           }
//         }
//       );
   
// io.to(movieId).emit("seatBooked", {
//     movieId,
//     seatNo,
//     userId,
//   });
  
//       res.json({ message: `Seat ${seatNo} booked successfully.` });
  
//     } catch (err) { 
//       console.error(err);
//       res.status(500).json({ message: "Booking failed." });
//     } finally {
//       await client.close();
//     }
//   });
  
  
 
        
     

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});



  

