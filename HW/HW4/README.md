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
###Screencast

[Link to video](https://youtu.be/POmZ-JjMhDM)

