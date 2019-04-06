var http = require('http').Server();
var io = require('socket.io')(http);
var port = process.argv[2]

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});