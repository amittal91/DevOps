# Homework 4 - Advanced Docker

### Task 1
1) **File IO**: You want to create a container for a legacy application. You succeed, but you need access to a file that the legacy app creates.

* Create a container that runs a command that outputs to a file.
* Use socat to map file access to read file container and expose over port 9001 (hint can use SYSTEM + cat).
* Use a linked container that access that file over network. The linked container can just use a command such as curl to access data from other container.

**Steps**
* Create a digital ocean droplet with Ubuntu image
* Install docker using `curl -sSL https://get.docker.com/ | sh`
* Create the following directory structure
```
  /FileIO/
    |__Container1
    |       |______Dockerfile
    |
    |__Container2
            |______Dockerfile
```
###Screencast

[Link to video](https://youtu.be/POmZ-JjMhDM)



curl -sSL https://get.docker.com/ | sh


curl -L https://github.com/docker/compose/releases/download/1.5.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose

chmod +x /usr/local/bin/docker-compose


Task1

Container 1

docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)

sudo docker build -t container1 .
sudo docker run -d --name container1 container1

Container 2

sudo docker build -t container2 .
sudo docker run --link container1:container1 --rm -it --name container2 container2 curl container1:9001



Task 2

Server

docker-compose up

Client

docker-compose run redis_client


Task3

Install git
Install nodejs
Install npm
ln -s /usr/bin/nodejs /usr/bin/node
sudo apt-get install npm
sudo npm install npm -g

Create registry
docker run -d -p 5000:5000 --restart=always --name registry registry:2

Stop and remove registry 
docker stop registry && docker rm -v registry

Make directories
Blue and Green
post-receive
