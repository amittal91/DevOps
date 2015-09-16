var needle = require("needle");
var fs = require("fs");
require('./env.js')



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
			//"ssh_keys":null,
			"backups":false,
			"ipv6":false,
			"user_data":null,
			"private_networking":null
		};

		console.log("Attempting to create: "+ JSON.stringify(data) );

		needle.post("https://api.digitalocean.com/v2/droplets", data, {headers:headers,json:true}, onResponse );
	},

	getDroplet: function (dropletId, onResponse)
	{
		needle.get("https://api.digitalocean.com/v2/droplets/" + dropletId, {headers:headers}, onResponse)
	},

	deleteDroplet: function(dropletId, onResponse)
	{
		var data = null;
		needle.delete("https://api.digitalocean.com/v2/droplets/" + dropletId, data, {headers:headers}, onResponse)
	}
};

var region;
var image;
var dropletId;
var dropletIp;
var dropletUserName;
var pathToSsh = "/home/apoorv/.ssh/id_rsa";
// #############################################
// #1 Print out a list of available regions
// Comment out when completed.
// https://developers.digitalocean.com/#list-all-regions
// use 'slug' property

client.listRegions(function(error, response)
{
	var data = response.body;
	//console.log( JSON.stringify(response.body) );
	if( data.regions )
	{
		region = data.regions[0]["slug"];
		console.log("Fetched Region: ",region);
	}

	client.listImages(function(error, response)
	{
		var data = response.body;
		var flag = 0 ;
		if( data.images )
		{
			for(var i=0; i<data.images.length; i++)
			{
				if( flag == 1 ) {
					break;
				}

				else {
					
					for(var j=0; j<data.images[i]["regions"].length; j++)
					{
						if (data.images[i]["regions"][j] == region) {
							
							image = data.images[i]["slug"];
							console.log("Fetched Image: ", image);
							flag = 1;
							break;
						}
					}
				}
			}
		}
		//coreOs doesn't work with ansible. Python issues.
		image = "ubuntu-14-04-x64";
		var d = new Date();
		var n = d.getTime(); 
		var name = "amittal-"+n;
		client.createDroplet(name, region, image, function(err, resp, body)
		{
			var data = resp.body;
			dropletId = data.droplet["id"];
			console.log("Droplet Id:", dropletId)
			// StatusCode 202 - Means server accepted request.
			if(!err && resp.statusCode == 202)
			{
				console.log("Creating droplet.... ! ");
			}

			var timeoutForIp = setInterval( function() {
				client.getDroplet(dropletId, function(error, response)
				{
					var flag = 0 ;
					var data = response.body;
					if ( data.droplet )
					{
						if ( data.droplet["networks"]["v4"].length != 0 )
						{
							console.log("Droplet Created!")
							dropletIp = data.droplet["networks"]["v4"][0]["ip_address"];
							if ( data.droplet["image"]["distribution"] == "CoreOS" )
							{
								dropletUserName = "core";
							}

							else
							{
								dropletUserName = "root";
							}
							console.log("IP Address: ", dropletIp);

							var ansibleInventory = "\n" + name + " ansible_ssh_host=" + dropletIp
												 + " ansible_ssh_user=" +  dropletUserName
												 + " ansible_ssh_private_key_file=" + pathToSsh ;
							fs.writeFile('inventory','[droplets]');
							fs.appendFile('inventory',ansibleInventory);
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


