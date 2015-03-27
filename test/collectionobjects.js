var chai   = require('chai');
var expect = chai.expect;
var fs     = require('fs');
var xml2js = require('xml2js');
var csapi  = require('../lib/csapi');

// use the demo site for tests
var cspace = {
  backend: "https://cspace.lyrasistechnology.org/cspace-services",
  validateSSL: false,
  username: 'admin@cspace.lyrasistechnology.org',
  password: 'Administrator'
};

var csapi = new csapi(cspace);

describe('csapi collectionobject handling', function() {
  this.timeout(10000);

  var collectionobjectData;
  var collectionobjectCeatedObject;
  var collectionobjectCeatedCsid;
  var collectionobjectCeatedKeyword = 'Antioch';
  var collectionobjectCeatedTitle   = 'The Holy Hand Grenade of Antioch';

  it('can retrieve collectionobject records', function(done) {
    csapi.getCollectionObjects({ pgSz: 10 },function(err, res, data) {
      expect(res.statusCode).to.equal(200);
      collectionobjectData = data;
      expect(collectionobjectData['$']).to.exist;
      expect(collectionobjectData['fieldsReturned'][0]).to.include('csid');
      done();
    });
  });

  it('can create collectionobject records', function(done) {
    var parser = new xml2js.Parser();
    fs.readFile(__dirname + '/records/collectionobject.xml', function(err, data) {
      parser.parseString(data, function (err, result) {
        csapi.createCollectionObject(result, function(err, res, data) {
          expect(res.statusCode).to.equal(201);
          done();
        });
      });
    });
  });

  it('can find created collectionobject records', function(done) {
    csapi.getCollectionObjects({ kw: collectionobjectCeatedKeyword, wf_deleted: false }, function(err, res, data) {
      expect(res.statusCode).to.equal(200);
      collectionobjectCeatedObject = data['list-item'][0];
      collectionobjectCeatedCsid = collectionobjectCeatedObject['csid'][0];
      var title = collectionobjectCeatedObject['title'][0];
      expect(title).to.equal(collectionobjectCeatedTitle);
      done();
    });
  });

  it('can retrieve collectionobject records by identifier', function(done) {
    csapi.getCollectionObject(collectionobjectCeatedCsid, function(err, res, data) {
      expect(res.statusCode).to.equal(200);
      var title = data['ns2:collectionobjects_common'][0]['titleGroupList'][0]['titleGroup'][0]['title'][0];
      expect(data['$']).to.exist;
      expect(title).to.equal(collectionobjectCeatedTitle);
      done();
    });
  });

  it('can delete collectionobject records', function(done) {
    csapi.deleteCollectionObject(collectionobjectCeatedCsid, function(err, res) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

});