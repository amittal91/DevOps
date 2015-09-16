var needle = require("needle");
var fs = require("fs");
require('./digitaloceanenv.js')

var config = {};
config.token = process.env.TOKEN;

var headers =
{
	'Content-Type':'application/json',
	Authorization: 'Bearer ' + config.token
};

// Documentation for needle:
// https://github.com/tomas/needle

var client =
{
	listRegions: function( onResponse )
	{
		needle.get("https://api.digitalocean.com/v2/regions", {headers:headers}, onResponse)
	},

	listImages: function (onResponse)
	{
		needle.get("https://api.digitalocean.com/v2/images", {headers:headers}, onResponse)
	},

	createDroplet: function (dropletName, region, imageName, onResponse)
	{
		var data = 
		{
			"name": dropletName,
			"region":region,
			"size":"512mb",
			"image":imageName,
			// Id to ssh_key already associated with account.
			"ssh_keys":[process.env.SSHKEY],
			"backups":false,
			"ipv6":false,
			"user_data":null,
			"private_networking":null
		};

		needle.post("https://api.digitalocean.com/v2/droplets", data, {headers:headers,json:true}, onResponse );
	},

	getDroplet: function (dropletId, onResponse)
	{
		needle.get("https://api.digitalocean.com/v2/droplets/" + dropletId, {headers:headers}, onResponse)
	},
};


// The script first fetches the list of available regions from the digitalocean API. Then 
// it selects a region and selects an image avaialable for that region.
// A droplet is then created for the selected region and image. Based on the droplet id of 
// the created droplet, the public IP associated with the droplet is fetched and corresponding
// entries are made in the 'inventory' file to be consumed by ansible. 

client.listRegions(function(error, response)
{
	var data = response.body;
	if( data.regions )
	{
		console.log("\nInitializing the process of droplet creation for DigitalOcean !!\n")
		console.log("Selecting a region....")
		var region = data.regions[0]["slug"];
		
	}

	client.listImages(function(error, response)
	{
		var data = response.body;
		var flag = 0 ;
		if( data.images )
		{
			console.log("\nSelecting an image.....")
			for(var i=0; i<data.images.length; i++)
			{
				if( flag == 1 ) {
					break;
				}

				else {
					for(var j=0; j<data.images[i]["regions"].length; j++)
					{
						if (data.images[i]["regions"][j] == region) {
							var image = data.images[i]["slug"];
							flag = 1;
							break;
						}
					}
				}
			}
		}

		// The image here is hard coded because of ansible issues with the selected image of coreOS.
		// In an ideal situation with no dependency errors of ansible, any selected image would work.

		image = "ubuntu-14-04-x64";
		
		var d = new Date();
		var n = d.getTime(); 
		var name = "amittal-"+n;
		client.createDroplet(name, region, image, function(err, resp, body)
		{
			var data = resp.body;
			var dropletId = data.droplet["id"];
			
			// StatusCode 202 - Means server accepted request.
			if(!err && resp.statusCode == 202)
			{
				console.log("\nCreating droplet....");
			}

			var timeoutForIp = setInterval( function() {
				client.getDroplet(dropletId, function(error, response)
				{
					flag = 0 ;
					var data = response.body;
					if ( data.droplet )
					{
						if ( data.droplet["networks"]["v4"].length != 0 )
						{
							console.log("Droplet Created !!")
							var dropletIp = data.droplet["networks"]["v4"][0]["ip_address"];
							if ( data.droplet["image"]["distribution"] == "CoreOS" )
							{
								var dropletUserName = "core";
							}

							else
							{
								var dropletUserName = "root";
							}
							console.log("Droplet Id:", dropletId)
							console.log("IP Address: ", dropletIp);
							console.log("Region: ",region);
							console.log("Image: ", image);

							var pathToKey = "/home/apoorv/.ssh/id_rsa";
							var ansibleInventory = "\n" + name + " ansible_ssh_host=" + dropletIp
												 + " ansible_ssh_user=" +  dropletUserName
												 + " ansible_ssh_private_key_file=" + pathToKey ;
							console.log("\nWriting to inventory file....");
							fs.writeFile('inventory','[droplets]');
							fs.appendFile('inventory',ansibleInventory);
				            console.log("Inventory file successfully appended.\n");
							flag = 1;	
						}
					}

					if( flag == 1 )
					{
						clearInterval(timeoutForIp);
					}
				})
			},1000);
		});		
	});
});


