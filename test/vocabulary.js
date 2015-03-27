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

describe('csapi vocabulary handling', function() {
  this.timeout(10000);

  var vocabularyCeatedIdentifier = 'hotbutteredtoast';
  var vocabularyCeatedObject;
  var vocabularyData;
  var vocabularyItemsData;

  it('can retrieve vocabulary records', function(done) {
    csapi.getVocabularies({ pgSz: 10 }, function(err, res, data) {
      expect(res.statusCode).to.equal(200);
      vocabularyData = data;
      expect(vocabularyData['$']).to.exist;
      expect(vocabularyData['list-item'].length).to.equal(parseInt(vocabularyData['itemsInPage'][0]));
      done();
    });
  });

  it('can retrieve vocabulary item records', function(done) {
    var csid = vocabularyData['list-item'][0]['csid'][0];
    csapi.getVocabularyItems(csid, function(err, res, data) {
      expect(res.statusCode).to.equal(200);
      vocabularyItemsData = data;
      expect(vocabularyData['$']).to.exist;
      expect(vocabularyItemsData['fieldsReturned'][0]).to.include('csid');
      done();
    });
  });

  it('can create vocabulary records', function(done) {
    var parser = new xml2js.Parser();
    fs.readFile(__dirname + '/records/vocabulary.xml', function(err, data) {
      parser.parseString(data, function (err, result) {
        csapi.createVocabulary(result, function(err, res, data) {
          expect(res.statusCode).to.equal(201);
          done();
        });
      });
    });
  });

  it('can retrieve vocabulary records by shortIdentifier', function(done) {
    csapi.getVocabularyById(vocabularyCeatedIdentifier, function(err, res, data) {
      expect(res.statusCode).to.equal(200);
      var shortIdentifier = data['ns2:vocabularies_common'][0]['shortIdentifier'][0];
      expect(data['$']).to.exist;
      expect(shortIdentifier).to.equal(vocabularyCeatedIdentifier);
      done();
    });
  });

  it('can find created vocabulary records', function(done) {
    csapi.getVocabularies({ kw: vocabularyCeatedIdentifier }, function(err, res, data) {
      expect(res.statusCode).to.equal(200);
      vocabularyCeatedObject = data['list-item'][0];
      var shortIdentifier = vocabularyCeatedObject['shortIdentifier'][0];
      expect(shortIdentifier).to.equal(vocabularyCeatedIdentifier);
      done();
    });
  });

  it('can delete vocabulary records', function(done) {
    csapi.deleteVocabulary(vocabularyCeatedObject['csid'], function(err, res) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

});