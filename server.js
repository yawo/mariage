
//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    ,redis = require('socket.io/node_modules/redis')
    , port = (process.env.PORT || 8081);

//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));    
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
    server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
//Redis. we use the io redis.
//redis://guillaume:9ffd430d2e0d3a45b44ae987d2bb7ede@koi.redistogo.com:9337/
//pass=9ffd430d2e0d3a45b44ae987d2bb7ede
var redisClient = redis.createClient('9337','koi.redistogo.com');
redisClient.auth('9ffd430d2e0d3a45b44ae987d2bb7ede',redis.print);

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found'
                 ,description: ''
                 ,author: 'Yawo Guillaume Kpotufe'
                 ,analyticssiteid: 'UA-32864937-1' 
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: ''
                 ,author: 'Yawo Guillaume Kpotufe'
                 ,analyticssiteid: 'UA-32864937-1'
                 ,error: err 
                },status: 500 });
    }
});
server.listen( port);

//Setup Socket.IO
var io = io.listen(server);
io.sockets.on('connection', function(socket){
  console.log('Client Connected');
  socket.on('message', function(data){
    socket.broadcast.emit('server_message',data);
    socket.emit('server_message',data);
  });
  socket.on('disconnect', function(){
    console.log('Client Disconnected.');
  });
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
  res.render('index.jade', {
    locals : { 
              title : 'Mariage Djark & Lydie'
             ,description: 'Mariage Djark & Lydie'
             ,author: 'Yawo Guillaume Kpotufe'
             ,analyticssiteid: 'UA-32864937-1' 
            }
  });
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
