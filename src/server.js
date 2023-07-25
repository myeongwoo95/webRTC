/** Web Server */
import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";
//import path from "path";

const port = 3000;
const app = express();

// app.set("view engine", "pug");
// app.set("views", path.join(__dirname, "views"));
// app.use("/public", express.static(path.join(__dirname, "public")));

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/*", (req, res) => {
  res.redirect("/");
});

/** Socket Server */
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin/socket.io"],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
});

io.on("connection", (socket) => {
  /** 1. 모든 이벤트를 감지 */
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  /** 2. disconnecting */
  socket.on("disconnecting", () => {
    console.log("disconnecting");
  });

  /** 3. disconnect */
  socket.on("disconnect", () => {
    console.log("disconnect");
  });

  // 방 입장
  socket.on("join_room", (data, done) => {
    socket.join(data.roomName);
    done();
    socket.to(data.roomName).emit("welcome");
  });

  socket.on("offer", (data) => {
    socket.to(data.roomName).emit("offer", {
      offer: data.offer,
    });
  });
});

httpServer.listen(port, () => {
  console.log(`listening ${port}`);
});
