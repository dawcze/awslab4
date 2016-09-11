var AWS = require("aws-sdk");
var helpers = require("../helpers");
var AWS_CONFIG_FILE = "config.json";
var POLICY_FILE = "policy.json";
var INDEX_TEMPLATE = "s3digest.ejs";
QueueUrl = "https://sqs.us-west-2.amazonaws.com/607083138257/queuedawid",
Queue = require("queuemanager");

AWS.config.loadFromPath('./config.json');

var task =  function(request, callback){

		var keys = request.query.keys;
		keys = Array.isArray(keys)?keys:[keys];

		keys.forEach(function(key){

		var queue = new Queue(new AWS.SQS(), QueueUrl);
		queue.sendMessage(key, function(err, data){
				if ( err ) {
						callback(null, {template: INDEX_TEMPLATE, params:{sqs: false, keys:key, prefix:"photos"}});
				}
				else {
						console.log("Wysłano plik: " + key.replace("photos/", ""));
						callback(null, {template: INDEX_TEMPLATE, params:{sqs: true, keys:key, prefix:"photos"}});
				}
			});
		});

}

exports.action = task
