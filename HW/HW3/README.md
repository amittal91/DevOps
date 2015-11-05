#HomeWork 3 - Proxies, Queues, Cache Fluency#

###Tasks###
####1. set/get####

When /set is visited, a new key is set with the value:"this message will self-destruct in 10 seconds".
When /get is visited, that key is fetched, and value is sent back to the client.

####2. recent####

/recent will display the 5 most recently visited sites.

####3. upload/meow####

Upload the image through curl command and view it in the browser by visiting /meow

####4. Additional service instance running####

An additional service layer listening at port 3001 is run using express

####5. Demonstrate proxy####

An HTTP proxy server was setup at port 80. 


> **NOTE:** Run "sudo node main.js" to bind to port 80 since you have to run the program with CAP_NET_BIND_SERVICE > capabilities in order to bind to ports less than 1024 on Linux systems. "root" privilege will contain this.
> <br>SOURCE -http://stackoverflow.com/questions/9526500/node-js-how-can-i-remove-the-port-from-the-url


###Screencast###

[Link](https://youtu.be/HUSYqnXejdE)


> We could have used redirect of express module to redirect our requests through proxy server but it has a 
> limitaion of sending requests as GET. A status code of 307 could help us mitigate that issue but it needs some
> deeper understanding of the protocol.



