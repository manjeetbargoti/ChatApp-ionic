var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')().listen(server);

io.on("connection", function(socket){
	console.log("A new client has connected with id" + socket.id + "!");

	socket.on("disconnect", function(){
		console.log("A client has disconnected!");
	});

	socket.on("Message", function(data){
		console.log(data.message);
	
		io.emit("Message", data)
	});

	socket.on('typing', function(data){
		io.emit('typing', data);
	});

	socket.on('stop typing', function(data){
		io.emit('stop typing', data);
	});
})

server.listen(9090, function(){
    console.log("Listen on PORT 9090");
})