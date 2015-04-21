'use strict';

var _ = require('lodash');
var Asset = require('./asset.model');
var Config = require('../../config/local.env.js');
var mongoose = require('mongoose');
var azure = require('azure');
var moment = require('moment');
var AzureMedia = require('azure-media');
var async = require('async');
var url = require('url');
var request = require('request');
var inspect = require('util').inspect;
var Busboy = require('busboy');

var serviceConfig = {
  client_id: Config.AZURE_MEDIA_ID,
  client_secret: Config.AZURE_MEDIA_SECRET
};

var api = new AzureMedia(serviceConfig);

//TODO: Examine usefulness of this log
api.init(function(a, b) {
  console.log("A : " + a);
});

// Get list of assets
exports.index = function(req, res) {
  Asset.find(function (err, assets) {
    if(err) { return handleError(res, err); }
    return res.json(200, assets);
  });
};

// Get a single asset
exports.show = function(req, res) {
  Asset.findById(req.params.id, function (err, asset) {
    if(err) { return handleError(res, err); }
    if(!asset) { return res.send(404); }
    return res.json(asset);
  });
};

// Creates a new asset in the DB.
exports.create = function(req, res) {
  console.log("Creating Asset");

  var service = {};

  var blobService = azure.createBlobService();

  //TODO: Move these field values to constants
  var busboy = new Busboy({ headers: req.headers, limits: { fields: 5, files: 5, fileSize: 67108864 } });
  busboy.on('file', fileHandler);
  busboy.on('finish', finishHandler);
  req.pipe(busboy);



  //TODO: May need to send content size along with request to avoid calculating for blob upload
  function fileHandler(fieldname, file, filename, encoding, mimetype) {
    console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    if(!filename) { return; }

    //set service vars
    service.fieldname = fieldname;
    service.file = file;
    service.filename = filename + '.mp4';
    service.encoding = encoding;
    service.mimetype = mimetype;

    service.file.fileRead = [];

    async.parallel([ createAsset, createWriteAccessPolicy ], createAssetAndPolicyHandler);
  }

  function finishHandler() {
    console.log('Done parsing form!');
    //res.sendStatus(200);
  }

  //TODO: Move to permanent service, since accesspolicies should be reused
  //Perhaps store the access policy id as a constant for now?
  function createWriteAccessPolicy(done) {
    api.rest.accesspolicy.findOrCreate("525949", 2, done);
  }

  function createReadAccessPolicy(done) {
    api.rest.accesspolicy.findOrCreate("300", 1, done);
  }

  function createAsset(done) {
    api.rest.asset.create({ Name: "Test" }, done);
  }

  function createAssetAndPolicyHandler(err, results) {
    if(!err) {
      var asset = results[0];
      var accessPolicy = results[1];

      service.asset = asset;
      service.accessPolicy = accessPolicy;

      console.log("Created asset: " + asset.Id);
      console.log("Created/Found accessPolicy: " + accessPolicy.Id);

      service.startTime = moment().subtract(5, 'minutes').format("YYYY-MM-DDTHH:mm:ssZ");

      createLocator(accessPolicy.Id, asset.Id, service.startTime);
    } else {
      console.log('Error Creating Asset: ' + err);
    }
  }

  function createLocator(accessPolicyId, assetId, startTime) {
    api.rest.locator.create({
        AccessPolicyId: accessPolicyId,
        AssetId : assetId,
        StartTime : startTime,
        Type : 1
      },
      createLocatorHandler);
  }

  function createLocatorHandler(err, locator) {
    //TODO: Handle error here
    var path = locator.Path;
    var parsedpath = url.parse(path);
    parsedpath.pathname += '/' + service.filename;
    service.path = url.format(parsedpath);
    service.locator = locator;

    service.file.on('data', dataHandler);
    service.file.on('end', fileDoneHandler);
  }

  function fileDoneHandler() {
    var finalBuffer = Buffer.concat(service.file.fileRead);

    request.put({
        method: 'PUT',
        url: service.path,
        body: finalBuffer,
        headers: {
          'Content-Type': 'application/octet-stream',
          'x-ms-blob-type': 'BlockBlob',
          'Content-Length': finalBuffer.length
          //'x-ms-version': moment.utc().subtract('day', 1).format('YYYY-MM-DD'),
          //'x-ms-date': moment.utc().format('YYYY-MM-DD'),
          //Authorization: 'Bearer ' + this.api.oauth.access_token
        },
        strictSSL: true
      },
      putDataHandler);

  };

  function putDataHandler(err, putResponse) {
    console.log("PutResponse: " + putResponse);

    async.waterfall([
        //delete upload location
        function (cb) {
          api.rest.locator.delete(service.locator.Id, cb);
        },
        //generate file metadata
        function (cb) {
          api.media.generateMetadata(service.asset.Id, cb);
        },
        function (cb, metadata) {
          createReadAccessPolicy(cb);
        },
        //TODO : figure out why the cb argument reversed here!!
        function (accessPolicy, cb) {
          api.rest.locator.create({
            AccessPolicyId: accessPolicy.Id,
            AssetId : service.asset.Id,
            StartTime : service.startTime,
            Type : 1
          }, cb);
        }
      ],
      function (err, locator) {
        //if (typeof done_cb !== 'undefined') {
        //  done_cb(err, path, result);
        //}
        if(err) throw 'error';
        res.json(locator);
      });
  };

  function dataHandler(data) {
    console.log('File [' + service.fieldname + '] got ' + data.length + ' bytes');
    service.file.fileRead.push(data);
  }
};

// Updates an existing asset in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Asset.findById(req.params.id, function (err, asset) {
    if (err) { return handleError(res, err); }
    if(!asset) { return res.send(404); }
    var updated = _.merge(asset, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, asset);
    });
  });
};

// Deletes a asset from the DB.
exports.destroy = function(req, res) {
  Asset.findById(req.params.id, function (err, asset) {
    if(err) { return handleError(res, err); }
    if(!asset) { return res.send(404); }
    asset.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
