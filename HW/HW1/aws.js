var AWS = require("aws-sdk");
var fs = require("fs");
AWS.config.loadFromPath('./awsconfig.json');
var ec2 = new AWS.EC2();
var params = {
    ImageId: 'ami-d05e75b8', // Ubuntu
    InstanceType: 't2.micro',
    KeyName: 'id_rsa',
    MinCount:1 ,
    MaxCount:1
};

// Create the instance, and based on instance id fetches the public IP of the instance.
// Also appends the inventory file. 
ec2.runInstances(params, function(err, data) {

    console.log("\nInitializing the process of instance creation for AWS !!\n")
    if (err) { 
        console.log("Could not create instance", err);
        return;
    }
    var instanceId = data.Instances[0].InstanceId;
    console.log("\nCreating instance.....");

    var paramsForPublicIp = {
        InstanceIds : [instanceId]
    };

    ec2.waitFor('instanceRunning', paramsForPublicIp, function(err, data) {
        if(err) 
            console.log(err, err.stack); // an error occurred 
        else {
            var publicIP = data.Reservations[0]["Instances"][0]["PublicIpAddress"];
            console.log("\nInstance created successfully !")
            console.log("Public IP:",publicIP);           // successful response
            console.log("Instance ID:", instanceId);
            var d = new Date();
            var n = d.getTime(); 
            var name = "amittal-aws-"+n;
            var userName = "ubuntu";
            var pathToSsh = "/home/apoorv/.ssh/id_rsa";
            var ansibleInventory = "\n" + name + " ansible_ssh_host=" + publicIP
                                 + " ansible_ssh_user=" +  userName
                                 + " ansible_ssh_private_key_file=" + pathToSsh ;
            console.log("\nWriting to inventory file....");
            fs.appendFile('inventory',ansibleInventory);
            console.log("Inventory file successfully appended.\n");
        }
    });
});
