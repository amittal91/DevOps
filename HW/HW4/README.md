# Homework 4 - Advanced Docker

### Task 1
1) **File IO**: You want to create a container for a legacy application. You succeed, but you need access to a file that the legacy app creates.

* Create a container that runs a command that outputs to a file.
* Use socat to map file access to read file container and expose over port 9001 (hint can use SYSTEM + cat).
* Use a linked container that access that file over network. The linked container can just use a command such as curl to access data from other container.

**Steps**
* Create a digital ocean droplet with Ubuntu.
* Install docker using `curl -sSL https://get.docker.com/ | sh`
* Create the following directory structure
```
  /FileIO
    |__Container1
    |       |______Dockerfile
    |
    |__Container2
            |______Dockerfile
```
* Inside Container1 run the following commands:
```
sudo docker build -t container1 .
sudo docker run -d --name container1 container1
```
This exposes the port 9001 with socat to display content of a text file.

* Inside Container2 run the following commands:
```
sudo docker build -t container2 .
sudo docker run --link container1:container1 --rm -it --name container2 container2 curl container1:9001
```
Creates and runs a linked container which accesses the container 1 over network

### Task 2

2) **Ambassador pattern**: Implement the remote ambassador pattern to encapsulate access to a redis container by a container on a different host.

* Use Docker Compose to configure containers.
* Use two different VMs to isolate the docker hosts. VMs can be from vagrant, DO, etc.
* The client should just be performing a simple "set/get" request.
* In total, there should be 4 containers.

**Steps**
* Create 2 digital ocean droplets with ubuntu.
* Install docker using `curl -sSL https://get.docker.com/ | sh` in both of them
* Install docker compose using :
```
curl -L https://github.com/docker/compose/releases/download/1.5.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose

chmod +x /usr/local/bin/docker-compose
```
* In 1st droplet create the following directory structure.
```
  /Server
    |__docker-compose.yml
```
* Run the following command.
```
docker-compose up
```
This would create a redis server linked with an ambassador container.

* In the 2nd droplet create the following directory structure.
```
 /Client
    |__docker-compose.yml
```
* Run the following command.
```
docker-compose run redis_client
```
where redis_client is the name of the container. It would be linked to an ambassador container which will be linked the ambassador container on the other host through public ip.

* This link would be created
```
Redis-server(Host 1) <------> Ambassador(Host 1) <------> Ambassador(Host 2)<------> Redis-cli(Host 2) u
```
* From the redis cli on the second host, run 
```
redis 172.17.0.2:6379>ping
PONG
redis 172.17.0.2:6379>SET mykey "hello"
OK
redis 172.17.0.2:6379>GET mykey
"hello"
```
### Task 3

3) **Docker Deploy**: Extend the deployment workshop to run a docker deployment process.

* A commit will build a new docker image.
* Push to local registery.
* Deploy the dockerized [simple node.js App](https://github.com/CSC-DevOps/App) to blue or green slice.
* Add appropriate hook commands to pull from registery, stop, and restart containers.

**Steps**
* Create a digital ocean droplet with ubuntu.
* Install git using `sudo apt-get install git`
* Install nodejs using `sudo apt-get install nodejs`
* Create a symling to use nodejs as node using `ln -s /usr/bin/nodejs /usr/bin/node`
* Update npm using `sudo npm install npm -g`
* Clone the [simple node.js App](https://github.com/CSC-DevOps/App) in /App directory
* Follow the [Deployment Workshop](https://github.com/CSC-DevOps/Deployment) to set up a blue-green deployment structure
* Add a [post-commit](https://github.com/amittal91/DevOps/blob/master/HW/HW4/BlueGreen/App/post-commit) hook in /App/.git/hooks/
* Change the executable permissions by using `chmod +x /App/.git/hooks/post-commit`
* Go to the /deploy/blue.git/hooks directory and add this [post-receive](https://github.com/amittal91/DevOps/blob/master/HW/HW4/BlueGreen/blue.git/post-receive) hook
* Go to the /deploy/green.git/hooks directory and add this [post-receive](https://github.com/amittal91/DevOps/blob/master/HW/HW4/BlueGreen/green.git/post-receive) hook
* Change the executable permissions by using 
```
chmod +x /deploy/blue.git/hooks/post-receive
chmod +x /deploy/green.git/hooks/post-receive
```
* Create a local registry to push docker images through the following command `docker run -d -p 5000:5000 --restart=always --name registry registry:2`
* Go to /App , make changes in main.js and commit them.
* A docker container would be built and pushed into local registry.
* Do a git push in either the green slice or the blue sliece using :

```
git push green master 
git push blue master
```
* The post-receive hook would be invoked and the container would be pulled and deployed.
* Check the result by going to the http://PUBLIC_IP_OF_DROPLET:9000 or http://PUBLIC_IP_OF_DROPLET:9001 depending where you have git pushed.
* Changing the app main.js again and commiting it and pushing it to a different slice would deploy the app on the port referred by that slice.

###Screencast

[Link to video](https://youtu.be/POmZ-JjMhDM)

