#HW#1 Provisioning and Configuring servers

###Prerequisites 

1. Install Node.js
2. Install ansible in your host machine.
3. Create a keypair on your host machine and import the public key on DigitalOcean and AWS.
4. Create a digitaloceanenv.js file to store you 'TOKEN','SSHKEY' and 'KEYPATH'.
5. Similarly create a awsconfig.json file to store your 'accessKeyId','secretAccessKey','region'. (For aws change the     keypath in code.)
6. Go to /etc/ansible/ansible.cfg and set host_key_checking = False

### Running the script

1. Run ./amittal-HW1.js on your terminal
2. Go to http://IP_ADDRESS/ to check if nginx is installed.

### References

* http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-intro.html
* http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html
* http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-examples.html
* http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#instanceRunning-waiter
* https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-ansible-on-an-ubuntu-12-04-vps
* https://www.digitalocean.com/community/tutorials/how-to-create-ansible-playbooks-to-automate-system-configuration-on-ubuntu
* https://github.com/CSC-DevOps/Course/blob/master/Workshops/CM.md

