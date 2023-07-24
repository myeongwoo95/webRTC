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

  // auth: {
  //   type: "basic",
  //   username: "admin",
  //   password: "encrypted hash...",
  // },
});

httpServer.listen(port, () => {
  console.log(`listening ${port}`);
});
