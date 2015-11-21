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
###Screencast

[Link to video](https://youtu.be/POmZ-JjMhDM)

