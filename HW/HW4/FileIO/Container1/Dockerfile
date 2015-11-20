FROM ubuntu:14.04
MAINTAINER Apoorv Mittal, amittal@ncsu.edu

RUN apt-get -y update
RUN apt-get -y install socat
#touch legacyfile.txt
RUN echo Hello HW4-task1 > legacyfile.txt
CMD socat TCP-LISTEN:9001 SYSTEM:'cat legacyfile.txt'

