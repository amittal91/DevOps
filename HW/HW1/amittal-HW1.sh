#!/bin/bash
# Script to automate the process of provisioning and configuring servers.
# The script first installs the required dependencies and then performs necessary tasks for 
# spinning up VMs and installing nginx with the help of ansible playbook.
echo "-------------------------------------------------------------------------"
echo "Installing dependencies..."
npm install
echo "Successfully installed the required dependencies."
echo "-------------------------------------------------------------------------"
node digitalocean.js
echo "-------------------------------------------------------------------------"
node aws.js
echo "Waiting for the EC2 instance to get properly initialized....."
sleep 1m
echo "-------------------------------------------------------------------------"
echo "Running the ansible playbook now."
ansible-playbook -i inventory --sudo nginx.yml
echo "Playbook executed successfully."
echo "-------------------------------------------------------------------------"
