var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
var proxy_app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})
var localhost = "http://localhost:"

///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next) 
{
    
    client.lpush('queue',req.url)

    // Trimming the queue to hold only the most recent 5 entries.
    client.ltrim('queue',0,4)
    
    next(); // Passing the request to the next handler in the stack.
});


// Proxy server setup
proxy_app.use(function(req, res, next)
{
    client.rpoplpush('proxyQueue','proxyQueue', function(err,value) {
        console.log("Redirected to:" + value )
        res.redirect(value+req.url)
    })
})


app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   
   if( req.files.image )
   {
    fs.readFile( req.files.image.path, function (err, data) {
         if (err) throw err;
         var img = new Buffer(data).toString('base64');
         
         // Store the image in a redis queue
         client.lpush('imageQueue',img)
    });
 }

   res.status(204).end()
}]);



app.get('/meow', function(req, res) {
     
     res.writeHead(200, {'content-type':'text/html'});

     // Pop the image from the redis queue
     client.lpop('imageQueue',function(err,value){ 
        
        if (!value) {
            res.write("The image Queue is empty....!")
            res.end()
        }
        else {
            res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+value+"'/>");
            res.end();
        }
    })
})

//HTTP SERVER
var server1 = app.listen(3000, function () {

    var host1 = server1.address().address
    var port1 = server1.address().port

    console.log('Example app listening at http://%s:%s', host1, port1)
})

// Additional service instance
var server2 = app.listen(3001, function () {

    var host2 = server2.address().address
    var port2 = server2.address().port

    console.log('Example app listening at http://%s:%s', host2, port2)
    createProxyQueue()
})

// Proxy server listening at port 80.
// ******NOTE******** Run "sudo node main.js" to bind to port 80 since you have to
// run the program with CAP_NET_BIND_SERVICE capabilities in order to bind to ports
// less than 1024 on Linux systems. "root" privilege will contain this. - 
// SOURCE -http://stackoverflow.com/questions/9526500/node-js-how-can-i-remove-the-port-from-the-url

var proxy_server = proxy_app.listen(80, function () {

    var proxy_host = proxy_server.address().address
    var proxy_port = proxy_server.address().port

    console.log('Proxy server listening at http://%s:%s', proxy_host, proxy_port)
})



app.get('/', function(req, res) {
    res.send('hello world')
})

app.get('/set', function(req, res) {

    client.set("newKey", "this message will self-destruct in 10 seconds");
    client.expire("newKey",10)
    res.send('Key setting successful')
})

app.get('/get', function(req, res) {
    client.get("newKey", function(err,value){ res.send(value)});
})

app.get('/recent', function(req, res) {
    client.lrange('queue',0,4,function(err,value){ res.send("The 5 most recent visited sites are: " + value)} )
})

// Deleting the proxyQueue in redis cache

function createProxyQueue() {
    client.del('proxyQueue', function() {
        client.lpush('proxyQueue',localhost+"3000",function(){
            client.lpush('proxyQueue',localhost+"3001")
        })
    })
    
}