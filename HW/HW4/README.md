#Advanced Docker

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