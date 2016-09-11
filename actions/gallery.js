var util = require("util");
var helpers = require("../helpers");
var Policy = require("../s3post").Policy;
var S3Form = require("../s3post").S3Form;
var AWS_CONFIG_FILE = "config.json";
var POLICY_FILE = "policy.json";
var INDEX_TEMPLATE = "index.ejs";
var AWS = require("aws-sdk");



exports.action = function(request, callback) {
	var error = 0;
	if ( request.method == 'POST') {
		error = 1;
	}

  var config = helpers.readJSONFile(AWS_CONFIG_FILE);
	var policyData = helpers.readJSONFile(POLICY_FILE);
	var policy = new Policy(policyData);
	var s3Form = new S3Form(policy);

	var bucket = policy.getConditionValueByKey("bucket");

  var fields = s3Form.generateS3FormFields();
  fields = s3Form.addS3CredientalsFields(fields, config);

	AWS.config.loadFromPath(AWS_CONFIG_FILE);
	var params = {
		Bucket: 'bucketdawid',
		Prefix: "photos/"
	};
	var s3 = new AWS.S3();

	var urlList = [];

    s3.listObjects(params, function (err, data) {
        if ( err ) {
            return err;
        }
        else {
        	data.Contents.forEach(function (elem) {
	            if (elem.Key !== 'photos/') {
	                var params = {Bucket: 'bucketdawid', Key: elem.Key};
	                s3.getSignedUrl('getObject', params, function (err, url) {
	                    var elemet = {
	                        name: elem.Key,
	                        url: url
	                    }
	                    urlList.push(elemet);
	                });
	            }
	        });

        }
        callback(null, {
        	template: INDEX_TEMPLATE,
        	params: {
        		fields: fields,
        		bucket: bucket,
        		urlList: urlList
        	}
        });
    });
}
