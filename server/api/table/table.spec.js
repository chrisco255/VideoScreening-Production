'use strict';
require('../../spec_helper');

var expect = require('chai').expect;
var app = require('../../app');
var request = require('supertest');
var Table = require('./table.model');
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
      topic: "BDD is da bomb"
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

describe('Table Controller', function() {
  //Inject test data into database
  before(function (done) {
    var table_1 = buildValidTable(ObjectId('4edd40c86762e0fb12000003'));
    var table_2 = buildValidTable(ObjectId('4edd40c86762e0fb12000004'));

    var data = {
      Table: [
        table_1,
        table_2
      ]
    };

    fixtures.load(data, done);
  });

  describe('GET /api/table/:id', function () {
    it('should return the requested table', function (done) {
      request(app)
        .get('/api/tables/4edd40c86762e0fb12000003/')
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          var id = res.body._id.toString();
          expect(id).to.equal(ObjectId("4edd40c86762e0fb12000003").toString());
          expect(res.body.title).to.equal("BDD vs TDD");
          done();
        });
    });

    it('given an incorrect id, should respond with a 404', function (done) {
      request(app)
        .get('/api/tables/5edd40c86762e0fb12000003/')
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.status).to.equal(404);
          done();
        });
    });
  });

  describe('GET /api/tables', function () {
    it('should respond with JSON array', function (done) {
      request(app)
        .get('/api/tables')
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body).to.be.instanceof(Array);
          done();
        });
    });

    it('should contain 2 items in response', function (done) {
      request(app)
        .get('/api/tables')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body).to.have.length(2);
          done();
        });
    });
  });

  describe('POST /api/tables', function () {
    it('should throw an error if the table does not define a title', function (done) {
      var noTitleTable = buildValidTable();
      delete noTitleTable.title;

      request(app)
        .post('/api/tables')
        .send(noTitleTable)
        .set('Accept', 'application/json')
        .end(function (err, res) {
          expect(res.status).to.equal(500);
          expect(res.body).to.have.ownProperty('errors');
          expect(res.body.errors).to.have.ownProperty('title');
          done();
        });
    });

    it('should fail if no hosts are defined', function (done) {
      var noHost = buildValidTable();
      noHost.hosts = [];

      request(app)
        .post('/api/tables')
        .send(noHost)
        .set('Accept', 'application/json')
        .end(function (err, res) {
          expect(res.status).to.equal(500);
          expect(res.body).to.have.ownProperty('errors');
          expect(res.body.errors).to.have.ownProperty('hosts');
          done();
        });
    });

    it('should fail if no participants are defined', function (done) {
      var noParticipants = buildValidTable();
      noParticipants.participants = [];

      request(app)
        .post('/api/tables')
        .send(noParticipants)
        .set('Accept', 'application/json')
        .end(function (err, res) {
          expect(res.status).to.equal(500);
          expect(res.body).to.have.ownProperty('errors');
          expect(res.body.errors).to.have.ownProperty('participants');
          done();
        });
    });

    it('should fail if no messages are defined', function (done) {
      var noMessages = buildValidTable();
      noMessages.messages = [];

      request(app)
        .post('/api/tables')
        .send(noMessages)
        .set('Accept', 'application/json')
        .end(function (err, res) {
          expect(res.status).to.equal(500);
          expect(res.body).to.have.ownProperty('errors');
          expect(res.body.errors).to.have.ownProperty('messages');
          done();
        });
    });
  });

  describe('PUT /api/tables/:id', function () {
    it('should return a 404 if table id does not exist in database', function (done) {
      var validTable = buildValidTable();

      request(app)
        .put('/api/tables/5edd40c86762e0fb12000003')
        .send(validTable)
        .set('Accept', 'application/json')
        .end(function (err, res) {
          expect(res.status).to.equal(404);
          done();
        });
    });

    it('should successfully update provided properties if table exists', function (done) {
      var validTable = buildValidTable();
      validTable.title = "New Title";

      request(app)
        .put('/api/tables/4edd40c86762e0fb12000003')
        .send(validTable)
        .set('Accept', 'application/json')
        .end(function (err, res) {
          expect(res.status).to.equal(200);
          expect(res.body.title).to.equal("New Title");
          done();
        });
    });
  });
});
