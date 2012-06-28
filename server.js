
//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    ,redis = require('nohm/node_modules/redis')
    , port = (process.env.PORT || 8081)
    ,nohm = require('nohm').Nohm;

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
redisClient.on('connect',function(){
    var gift = new GiftModel();
  gift.p({
    name: 'Moulinex3'+Math.random(),
    description: 'mark@example.com',
    
  });
  gift.save(function (err) {
    if (err === 'invalid') {
      console.log('properties were invalid: ', gift.errors);
    } else if (err) {
      console.log(err); // database or unknown error
    } else {
      console.log('saved gift! :-)',gift);
      
    }  
  });
  
});
nohm.setClient(redisClient);
var GiftModel = nohm.model('Gift', {
    properties: {
      name: {
        type: 'string',
        unique: true,
        validations: [
          'notEmpty'
        ]
      },
      description: {
        type: 'string',        
        validations: [
          'notEmpty'
        ]
      },
      contact: {
        type: 'string',
        defaultValue: 'Djark, 06 00 00 00 00, x@x.com',
        validations: [
          'notEmpty'
        ]
      },
      thumbnail: {
        type: 'string',
        defaultValue: '/img/gift-thumnail.jpg',
        validations: [
          'notEmpty'
        ]
      },      
      online:{
        type: 'boolean',
        defaultValue: true,
        index: true
      },
      givers:{
        type: 'json',
        defaultValue: {list:[]}        
      }
      
    },
    methods: {
        // gv is {gname,gcontact,gmessage,gdate}
      give: function (gv) {  
          if(gv)
            this.p('givers').list.push=gv;        
          return gv
      }
    },
    idGenerator: 'increment'    
  });
  
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
  GiftModel.find(function(err,ids){
      if(err){
         console.log("Error getting gifts",err);     
         res.render('index.jade', {
            locals : { 
              title : 'Mariage Djark & Lydie'
             ,description: 'Mariage Djark & Lydie'
             ,author: 'Yawo Guillaume Kpotufe'
             ,analyticssiteid: 'UA-32864937-1'             
            },gifts:[]
         });
      }else{
        var gifts = [];
        var len = ids.length;
        var count = 0;
        if (len === 0) {
          res.render('index.jade', {
            locals : { 
              title : 'Mariage Djark & Lydie'
             ,description: 'Mariage Djark & Lydie'
             ,author: 'Yawo Guillaume Kpotufe'
             ,analyticssiteid: 'UA-32864937-1'             
            },gifts:[]
         });
        }
        ids.forEach(function (id) {
          var gift = new GiftModel();
          gift.load(id, function (err, props) {
            if (err) {
              return next(err);
            }
            //gift.remove();
            gifts.push(props);
            if (++count === len) {
              res.render('index.jade', {
                locals : { 
                  title : 'Mariage Djark & Lydie'
                 ,description: 'Mariage Djark & Lydie'
                 ,author: 'Yawo Guillaume Kpotufe'
                 ,analyticssiteid: 'UA-32864937-1'             
                },gifts:gifts
              });
            }
          });
        });
            
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
