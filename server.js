
//setup Dependencies
var connect = require('connect')
    , express = require('express')
  //  , io = require('socket.io')
    ,redis = require('redis')
    , port = (process.env.PORT || 8081)
    ,nohm = require('nohm').Nohm
    ,path           = require('path')
    ,templatesDir   = path.resolve(__dirname, '.', 'mail_templates')
    ,emailTemplates = require('email-templates')
    ,nodemailer = require("nodemailer");

//////////////////Setup Emails
// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "love.thewell@gmail.com",
        pass: "mohafada"
    }
});
// setup e-mail data with unicode symbols
var mailOptions = {
    from: "Love TheWell <love.thewell@gmail.com>", // sender address
    to: "mcguy2008@gmail.com, kudelik@gmail.com", // list of receivers
    subject: "Test TheWell", // Subject line
    text: "Test Body no HTML", // plaintext body
    html: "Test Body  <b>with HTML</b>" // html body
}



////////////////////Setup Express
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
 /* var gift = new GiftModel();
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
  });*/
  
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
        // gv is [contact,telMail,message,dateCreation,dateLivraison];
      give: function (gv) { 
        console.log("Giving",gv);
        if(gv){
            this.p('givers').list.push(gv);        
        }
        console.log("Givers",this.p('givers').list);
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
/*var io = io.listen(server);
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
*/

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

function serveGift(req,res,vw){
    GiftModel.find(function(err,ids){
      if(err){
         console.log("Error getting gifts",err);     
         return res.render(vw, {
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
          return res.render(vw, {
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
                  console.log("Error getting gifts",err);    
                  return res.render(vw, {
                    locals : { 
                      title : 'Mariage Djark & Lydie'
                     ,description: 'Mariage Djark & Lydie'
                     ,author: 'Yawo Guillaume Kpotufe'
                     ,analyticssiteid: 'UA-32864937-1'             
                    },gifts:[]
                });
            }
            //gift.remove();
            props.id=gift.id
            gifts.push(props);
            if (++count === len) {
             return res.render(vw, {
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
}

function deleteAll(){
    GiftModel.find(function(err,ids){
      if(err){
         console.log("Error getting gifts",err);     
      }else{        
        var len = ids.length;
        var count = 0;
        if (len === 0) {
        }
        ids.forEach(function (id) {
          var gift = new GiftModel();
          gift.load(id, function (err, props) {
            if (err) {
              console.log(err);
            }
            gift.remove(function(err){
                console.log("Removing",id,"Err:",err);    
            });
            
          });
        });            
    }      
  });
}


server.get('/djarkkrajd', function(req,res){
  return serveGift(req,res,'admin.jade');
});


server.get('/helio', function(req,res){
  res.send("<center class='ui-widget ui-widget-header ui-corner-all label label-info'><h3>Pardon Helio, FO MANGER SEULEMENT !</h3><center>");
});


server.get('/', function(req,res){
  return serveGift(req,res,'index.jade');
});

function updateGift(gift,thumbnail,name,description,contact,online){
    gift.p('thumbnail',thumbnail);
    gift.p('name',name);
    gift.p('description',description);
    gift.p('contact',contact);
    gift.p('online',online);
    gift.save(function (err) {
        if (err === 'invalid') {
          console.log('properties were invalid: ', gift.errors);
        } else if (err) {
          console.log(err); // database or unknown error
        } else {
          console.log('saved gift! :-)',name);
          
        }  
    });
}

server.post('/updateGift',function(req,res){
    var id=req.body.id,thumbnail=req.body.thumbnail,name=req.body.name,description=req.body.description,
           contact=req.body.contact,online=(req.body.online=='checked');
    var gift=new GiftModel();
    console.log("Adding gift...",id);
    gift.load(id, function (err,props) {
        if(err==='not found'){            
            updateGift(gift,thumbnail,name,description,contact,online);
            res.send('SUCCESS');
        }else if(err){
            console.log("updateGift Error",id,err);
            res.send('FAILURE');
        }else{
            updateGift(gift,thumbnail,name,description,contact,online);
            res.send('SUCCESS');
        }
    });
});


server.post('/addGiftGiver',function(req,res){ 
    var now = new Date();
    var id=req.body.id,contact=req.body.contact,telMail=req.body.tel,message=req.body.message,dateCreation = now.toLocaleDateString();
    var gift=new GiftModel();
    gift.load(id, function (erro,props) {
        if(erro){
            console.log("addGiftGiver Error",id,erro);
            res.send('FAILURE');
        }else{
            var gvs = gift.p('givers');
            var data = [contact,telMail,message,dateCreation];
            gvs.list.push(data);
            gift.p('givers',gvs)            
            gift.save(function (err) {
                if (err === 'invalid') {
                  console.log('addGiftGiver:properties were invalid: ', gift.errors);
                  res.send('FAILURE');
                } else if (err) {
                  console.log('addGiftGiver:Database err',err); // database or unknown error
                  res.send('FAILURE');
                } else {
                  console.log('addGiftGiver:saved gift! :-)',gift);                  
                  res.send('SUCCESS');
                }
            });
        }
    });
});

server.post('/deleteGift',function(req,res){
     var id;
     var gift = new GiftModel();
     gift.id=id;
     gift.remove({},function(err){
         if(err) {
             console.log("deleteGift Error",id,err);
             res.send('FAILURE');
         }else{
            console.log("deleteGift Error",id,err);
            res.send('FAILURE');
         }
     });
     
});

server.get('/fairepart',function(req,res){
    res.download('./static/image/fairepart.jpeg');
});

server.get('/mail',function(req,res){
    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            res.send("Error:"+error);
        }else{
            var mess = "Message sent: " + response.message;
            console.log(mess);
            res.send(mess);
        }

    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
    });

});



server.get('/djarkkrajd/deleteAll',function(req,res){
    deleteAll();
    res.send("Done<br/> <a href='/'>Home</a>");
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
