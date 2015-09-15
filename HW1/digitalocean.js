var needle = require("needle");
var fs = require("fs");


var config = {};
config.token = "db983f935e1ca03ebb53fcda1c31e95ddbd06fdfd744a1cf5978b7e402b88a26";

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
			"ssh_keys":[1297132],
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
							flag = 1;	
						}

						
						if ( data.droplet["image"]["distribution"] == "CoreOS" )
						{
							dropletUserName = "core";
						}

						else
						{
							dropletUserName = "root";
						}
						console.log("IP Address: ", dropletIp);

					}

					var ansibleInventory = name + " ansible_ssh_host=" + dropletIp
										 + " ansible_ssh_user=" +  dropletUserName
										 + " ansible_ssh_private_key_file" + pathToSsh ;
					fs.appendFile('inventory',ansibleInventory)
					if( flag == 1 )
					{
						clearInterval(timeoutForIp);
					}


				})
			},1000);
		});		
	});
});


// #############################################
// #2 Extend the client object to have a listImages method
// Comment out when completed.
// https://developers.digitalocean.com/#images
// - Print out a list of available system images, that are AVAILABLE in a specified region.
// - use 'slug' property
/*client.listImages(function(error, response)
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
						console.log("Image: ", image);
						flag = 1;
						break;
					}
				}
			}
		}
	}
});*/

// #############################################
// #3 Create an droplet with the specified name, region, and image
// Comment out when completed. ONLY RUN ONCE!!!!!
// Write down/copy droplet id.

// var region = "fra1"; // Fill one in from #1
// var image = "centos-7-0-x64"; // Fill one in from #2
/*client.createDroplet(name, region, image, function(err, resp, body)
{
	console.log(body);
	// StatusCode 202 - Means server accepted request.
	if(!err && resp.statusCode == 202)
	{
		console.log( JSON.stringify( body, null, 3 ) );
	}
});*/

// #############################################
// #4 Extend the client to retrieve information about a specified droplet.
// Comment out when done.
// https://developers.digitalocean.com/#retrieve-an-existing-droplet-by-id
// REMEMBER POST != GET
// Most importantly, print out IP address!
// var dropletId = "6882027";
/*client.getDroplet(dropletId, function(error, response)
{
	var data = response.body;
	var networks = data.droplet["networks"]["v4"]
	if ( data.droplet )
	{
		for(var i=0; i<networks.length; i++)
		{
			console.log("IP Address: ", networks[i]["ip_address"]);
		}
	}
});
*/
// #############################################
// #5 In the command line, ping your server, make sure it is alive!
// ping 46.101.229.135

// #############################################
// #6 Extend the client to DESTROY the specified droplet.
// Comment out when done.
// https://developers.digitalocean.com/#delete-a-droplet
// HINT, use the DELETE verb.
// HINT #2, needle.delete(url, data, options, callback), data needs passed as null.
// No response body will be sent back, but the response code will indicate success.
// Specifically, the response code will be a 204, which means that the action was successful with no returned body data.
// var dropletId = "6882027";
// client.deleteDroplet(dropletId, function(error, response)
// {

// 	if(!error && response.statusCode == 204)
// 	{
// 			console.log("Deleted!");
// 	}
// });
// #############################################
// #7 In the command line, ping your server, make sure it is dead!
// ping 46.101.229.135
// It could be possible that digitalocean reallocated your IP address to another server, so don't fret it is still pinging.

