var siCanalListo = false;
var siIniciador = false;
var siInicio = false;
var pc;
var datachannel;
var nombreCliente = "usuario" + Math.floor(Math.random() * 1000 + 1);
var clienteRemoto;

document.getElementById("yourname").innerHTML="Su ID: "+nombreCliente

//Inicializa el servidor
var pcConfig = turnConfig;
//nombresala
var room = document.getElementById("nombresala");
if (room) {
  room.addEventListener("input", (event) => {
    console.log(event.target.value);
    room = event.target.value;
  });
}


//var room = "sala";
var socket = io.connect();

//El primer usuario se unió a la sala
socket.on("created", function (room) {
  siIniciador = true;
});

//Si la sala está llena (más de dos personas)
socket.on("full", function (room) {
  console.log("Sala " + room + " está llena");
  document.getElementById("connectbutton").innerHTML= "Sala llena"
});

//Cuando ambos se conentan agrega al usuario remoto
//Y activa la sala
socket.on("join", function (room, client) {
  sendmessagebutton.disabled = false;
  nombreusser.disabled=false;
  messagearea.disabled=false;
  siCanalListo = true;
  clienteRemoto = client;
  document.getElementById("remotename").innerHTML=client
  socket.emit("creatorname", room, nombreCliente);
});

//Cuando ambos se conentan agrega al usuario creador
socket.on("mynameis", (client) => {
  clienteRemoto = client;
  document.getElementById("remotename").innerHTML= "la ID del otro lado: " + client;
});

//Activa el botón para mandar mensaje y enciende la comunicación
socket.on("joined", function (room) {
  siCanalListo = true;
  sendmessagebutton.disabled = false;
  nombreusser.disabled=false;
  messagearea.disabled=false;
});


//Establece la comunicación usando WebRTC
socket.on("message", function (message, room) {
  //Si se envía un mensaje exitosamente
  if (message === "exito") {
    //Inicia la conexión lado a lado
    creaConexion();
    //Si recibe respuesta
  } else if (message.type === "offer") {
    if (!siIniciador && !siInicio) {
      //La conexión lado a lado continua
      creaConexion();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();

  } else if (message.type === "answer" && siInicio) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === "candidate" && siInicio) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate,
    });
    pc.addIceCandidate(candidate);

    //Cuando uno de los dos cierra la pestaña
  } else if (message === "bye" && siInicio) {
    handleRemoteHangup();
  }
});

//Manda mensajes a la sala
function sendMessage(message, room) {
  console.log("Client mandando mensaje: ", message, room);
  socket.emit("message", message, room);
}

//Si el que creo sala consigue una conexión:
function creaConexion() {
  console.log(">>>>>> inicio: ", siInicio, siCanalListo);
  if (!siInicio && siCanalListo) {
    console.log(">>>>>> creando conexión");
    createPeerConnection();
    siInicio = true;
    console.log("Iniciador: ", siIniciador);
    if (siIniciador) {
      doCall();
    }
  }
}

//Manda bye si uno de los clientes cierra la pestaña
window.onbeforeunload = function () {
  sendMessage("bye", room);
};



//Crea la conexión entre lados
function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(pcConfig);
    pc.onicecandidate = handleIceCandidate;
    console.log("Creada la conexión RTCPeerConnnection");

    datachannel = pc.createDataChannel("filetransfer");
    datachannel.onopen = (event) => {
    };

    datachannel.onmessage = (event) => {
      console.log("The oferrer received a message" + event.data);
    };
    
    //Si se envía respuesta
    pc.ondatachannel = function (event) {
      var channel = event.channel;
      channel.onopen = function (event) {
        channel.send("ANSWEREROPEN");
      };
      channel.onmessage = async (event) => {
        try {
          var themessage = event.data;
          console.log(themessage, event);
          viewmsgtoelement(document.getElementById("messagesent"), themessage);
        } catch (err) {
          console.log(err);
        }
      };
    };
  } catch (e) {
    console.log("Error al crear conexión lado a lado : " + e.message);
    alert("No se pudo crear el objeto RTCPeerConnection.");
    return;
  }
}

//Ayudan con los ICE candidates que genera el buscador
function handleIceCandidate(event) {
  console.log("icecandidate event: ", event);
  if (event.candidate) {
    sendMessage(
      {
        type: "candidate",
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
      },
      room
    );
  } else {
    console.log("Fin candidatos.");
  }
}

function handleCreateOfferError(event) {
  console.log("error: ", event);
}

//Función para generar comunicaión
function doCall() {
  console.log("Enviando oferta al otro lado");
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

//Recibe respuesta de la oferta enviada
function doAnswer() {
  console.log("Enviando respuesta al otro.");
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}


function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log("setLocalAndSendMessage sending message", sessionDescription);
  sendMessage(sessionDescription, room);
}

//Detecta errores
function onCreateSessionDescriptionError(error) {
  trace(error.toString());
}

//Cierra server
function hangup() {
  stop();
  sendMessage("bye", room);
}

//Se va el lado server
function handleRemoteHangup() {
  stop();
  siIniciador = false;
}

//Detener la sesión
function stop() {
  siInicio = false;
  pc.close();
  pc = null;
}

//Cuando se conecta
var connectbutton = document.getElementById("connectbutton");
if (connectbutton) {
  connectbutton.addEventListener("click", () => {
    if (connectbutton.innerHTML !== "Conectado") {
      socket.emit("create or join", room, nombreCliente);
      sendMessage("exito", room);
      console.log(room);
      if (siIniciador) {
        creaConexion();
      }
    }
    connectbutton.innerHTML = "Conectado";

  });
}

let messagetexted = "";
//Elementos DOM


//Enviar
var mensajeUsuario = document.getElementById("messagearea");
var nombreUsuario = document.getElementById("nombreusser");

if (mensajeUsuario) {
  mensajeUsuario.addEventListener("input", (event) => {
    console.log(event.target.value);
    messagetexted = event.target.value;
  });
  if (nombreUsuario) {
    nombreUsuario.addEventListener("input", (event) => {
      console.log(event.target.value);
      nombreUsuario = event.target.value;
    });
  }
}

var sendmessagebutton = document.getElementById("sendmessage");

if (sendmessagebutton) {
  sendmessagebutton.disabled = true;
  nombreusser.disabled=true;
  messagearea.disabled=true;
  sendmessagebutton.addEventListener("click", () => {
    var themessage = "<p>" +nombreUsuario  + ":" + messagetexted + "</p>";
    viewmsgtoelement(document.getElementById("messagesent"), themessage);
    datachannel.send(themessage);
    mensajeUsuario.value = "";
    messagetexted = "";
  });
}

function viewmsgtoelement(element, message) {
  element.innerHTML += "\n" + message;
}
