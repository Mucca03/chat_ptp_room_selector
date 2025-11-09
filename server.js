var os = require("os");
var express = require("express");
var app = express();
var http = require("http");
var socketIO = require("socket.io");
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("index.ejs");
});

var server = http.createServer(app);
//server.listen(process.env.PORT || 3000);
var io = socketIO(server);


io.sockets.on("connection", function (socket) {


  function log() {
    var array = ["Message from server:"];
    array.push.apply(array, arguments);
    socket.emit("log", array);
  }

  //Conexión de sockets
  socket.on("message", function (message, room) {
    log("El cliente dijo: ", message);
    socket.in(room).emit("message", message, room);
  });

  //Comprueba la cantidad de usuarios en la sala
  socket.on("create or join", function (room, clientName) {
    var clientsInRoom = io.sockets.adapter.rooms.get(room);
    var numClients = clientsInRoom ? clientsInRoom.size : 0;
    //Se crea la sala:
    if (numClients === 0) {
      socket.join(room);
      log("Cliente ID " + socket.id + " created room " + room);
      socket.emit("created", room, socket.id);
    //llega el segundo usuario:
    } else if (numClients === 1) {
      io.sockets.in(room).emit("join", room, clientName); //Clientname, nombre del segundo cliente
      socket.join(room);
      //Lo que recibe el nuevo cliente
      socket.emit("joined", room, socket.id);
      io.sockets.in(room).emit("ready");
    }else {
      // mas de dos clientes
      socket.emit("full", room);
    }
  });


  //creador de la sala
  socket.on("creatorname", (room,client) => {
    socket.to(room).emit("mynameis",client);
  });

  socket.on("ipaddr", function () {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function (details) {
        if (details.family === "IPv4" && details.address !== "127.0.0.1") {
          socket.emit("ipaddr", details.address);
        }
      });
    }
  });

  socket.on("bye", function () {
    console.log("adios");
  });

});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});