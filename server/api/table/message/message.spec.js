'use strict';
require('../../../spec_helper');

var expect = require('chai').expect;
var app = require('../../../app');
var request = require('supertest');
var Table = require('../table.model');
var mongoose = require('mongoose');
var _ = require('lodash');
var fixtures = require('mongoose-fixtures');
var ObjectId = mongoose.Types.ObjectId;

function buildValidTable(tableId) {
  return {
    _id: tableId || ObjectId(),
    title: "BDD vs TDD",
    hosts: [{
      name: "Vaughn Vernon",
      ref_id: ObjectId()
    }],
    highlightURL: "http://blobs.azurewebsites.net/232323",
    messages: [{
      _id: ObjectId('4edd40c86762e0fb12000008'),
      topic: "BDD is da bomb"
    }, {
      _id: ObjectId('4edd40c86762e0fb12000009'),
      topic: "Paul Graham Essays"
    }],
    participants: [{
      name: "George",
      ref_id: ObjectId()
    }, {
      name: "Vaughn Vernon",
      ref_id: ObjectId()
    }]
  };
}

describe('Message Controller', function() {
  //Inject test data into database
  before(function (done) {
    var table_1 = buildValidTable(ObjectId('4edd40c86762e0fb12000003'));

    var data = {
      Table: [
        table_1
      ]
    };

    fixtures.load(data, done);
  });

  describe('GET /api/tables/:tableId/messages/:messageId', function() {
    it('should respond with the message requested', function(done) {
      request(app)
        .get('/api/tables/4edd40c86762e0fb12000003/messages/4edd40c86762e0fb12000008')
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.topic).to.be.equal("BDD is da bomb");
          done();
        });
    });

    it('given an invalid message id should return a 404', function(done) {
      request(app)
        .get('/api/tables/4edd40c86762e0fb12000003/messages/5edd40c86762e0fb12000008')
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.status).to.equal(404);
          done();
        });
    });
  });

  describe('GET /api/tables/:tableId/messages', function() {
    it('should respond with JSON array', function(done) {
      request(app)
        .get('/api/tables/4edd40c86762e0fb12000003/messages')
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body).to.be.instanceof(Array);
          done();
        });
    });

    it('should contain 2 item in response', function (done) {
      request(app)
        .get('/api/tables/4edd40c86762e0fb12000003/messages')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body).to.have.length(2);
          done();
        });
    });
  });

  describe('POST /api/tables/:tableId/messages', function() {
    it('should successfully save message to provided table id', function (done) {
      var message = {
        topic: "My New Topic"
      };

      request(app)
        .post('/api/tables/4edd40c86762e0fb12000003/messages')
        .send(message)
        .set('Accept', 'application/json')
        .end(function (err, res) {
          expect(res.status).to.equal(201);
          expect(res.body).to.have.ownProperty('topic');
          expect(res.body.topic).to.equal('My New Topic');
          done();
        });
    });

    it('given a message is posted with no title, returns 500 error', function (done) {
      var message = {};

      request(app)
        .post('/api/tables/4edd40c86762e0fb12000003/messages')
        .send(message)
        .set('Accept', 'application/json')
        .end(function (err, res) {
          expect(res.status).to.equal(500);
          done();
        });
    });

    it('given an empty message is sent, returns 500 error', function (done) {
      request(app)
        .post('/api/tables/4edd40c86762e0fb12000003/messages')
        .send(undefined)
        .set('Accept', 'application/json')
        .end(function (err, res) {
          expect(res.status).to.equal(500);
          done();
        });
    });
  });

  describe('POST /api/tables/:tableId/messages/:messageId', function() {
    it('should successfully save message to provided table id', function (done) {
      var message = {
        topic: "My New Topic"
      };

      request(app)
        .put('/api/tables/4edd40c86762e0fb12000003/messages/4edd40c86762e0fb12000008')
        .send(message)
        .set('Accept', 'application/json')
        .end(function (err, res) {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.ownProperty('topic');
          expect(res.body.topic).to.equal('My New Topic');
          expect(res.body._id.toString()).to.equal(ObjectId('4edd40c86762e0fb12000008').toString());
          done();
        });
    });

    it('given an invalid message id, should return a 404', function (done) {
      var message = {
        topic: "My New Topic"
      };

      request(app)
        .put('/api/tables/4edd40c86762e0fb12000003/messages/5edd40c86762e0fb12000008')
        .send(message)
        .set('Accept', 'application/json')
        .end(function (err, res) {
          expect(res.status).to.equal(404);
          done();
        });
    });

    it('given an invalid table id, should return a 404', function (done) {
      var message = {
        topic: "My New Topic"
      };

      request(app)
        .put('/api/tables/5edd40c86762e0fb12000003/messages/4edd40c86762e0fb12000008')
        .send(message)
        .set('Accept', 'application/json')
        .end(function (err, res) {
          expect(res.status).to.equal(404);
          done();
        });
    });
  });
});

