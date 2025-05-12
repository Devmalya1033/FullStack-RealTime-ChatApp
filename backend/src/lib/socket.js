import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  },
});


const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  

  if (userId && userId !== "undefined") {
    console.log(`User ${userId} connected with socket ${socket.id}`);
    userSocketMap[userId] = socket.id;

  
    socket.emit("getOnlineUsers", Object.keys(userSocketMap));


    socket.broadcast.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    
  
    const disconnectedUserId = Object.keys(userSocketMap).find(
      key => userSocketMap[key] === socket.id
    );

    if (disconnectedUserId) {
      delete userSocketMap[disconnectedUserId];
      

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });

 
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });
});

export { io, app, server };