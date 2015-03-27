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

describe('csapi person handling', function() {
  this.timeout(10000);

  var personauthorityData;
  var personauthorityCsid;
  var personauthorityIdentifier = 'person';
  var personauthorityPersonCsid;
  var personauthorityPersonIdentifier = 'WalterWhite032215';
  var personauthorityPersonKeyword = 'walter';
  var personauthorityLcnafId;

  it('can retrieve personauthority records', function(done) {
    csapi.getPersonAuthorities({ pgSz: 10 },function(err, res, data) {
      expect(res.statusCode).to.equal(200);
      var personauthorityData = data;
      expect(personauthorityData['$']).to.exist;
      expect(personauthorityData['fieldsReturned'][0]).to.include('csid');
      done();
    });
  });

  it('can retrieve personauthority records by identifier', function(done) {
    csapi.getPersonAuthorityById(personauthorityIdentifier, function(err, res, data) {
      expect(res.statusCode).to.equal(200);
      personauthorityCsid = data['ns2:personauthorities_common'][0]['csid'][0];
      var shortIdentifier = data['ns2:personauthorities_common'][0]['shortIdentifier'][0];
      expect(data['$']).to.exist;
      expect(shortIdentifier).to.equal(personauthorityIdentifier);
      done();
    });
  });

  it('can create personauthority records', function(done) {
    var parser = new xml2js.Parser();
    fs.readFile(__dirname + '/records/person-authority.xml', function(err, data) {
      parser.parseString(data, function (err, result) {
        csapi.createPersonAuthority(result, function(err, res, data) {
          expect(res.statusCode).to.equal(201);
          personauthorityLcnafId = res['headers']['location'].split("/").slice(-1)[0];;
          done();
        });
      });
    });
  });

  it('can delete personauthority records', function(done) {
    csapi.deletePersonAuthority(personauthorityLcnafId, function(err, res) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('can create personauthority person records', function(done) {
    var parser = new xml2js.Parser();
    fs.readFile(__dirname + '/records/person.xml', function(err, data) {
      parser.parseString(data, function (err, result) {
        csapi.createPerson(personauthorityCsid, result, function(err, res, data) {
          expect(res.statusCode).to.equal(201);
          done();
        });
      });
    });
  });

  it('can find created personauthority person records', function(done) {
    csapi.getPersons(personauthorityCsid, { pt: personauthorityPersonKeyword, wf_deleted: false }, function(err, res, data) {
      expect(res.statusCode).to.equal(200);
      personauthorityPersonCsid = data['list-item'][0]['csid'][0];
      var shortIdentifier = data['list-item'][0]['shortIdentifier'][0];
      expect(data['$']).to.exist;
      expect(shortIdentifier).to.equal(personauthorityPersonIdentifier);
      done();
    });
  });

  it('can retrieve personauthority person records', function(done) {
    csapi.getPerson(personauthorityCsid, personauthorityPersonCsid, function(err, res, data) {
      expect(res.statusCode).to.equal(200);
      var shortIdentifier = data['ns2:persons_common'][0]['shortIdentifier'][0];
      expect(data['$']).to.exist;
      expect(shortIdentifier).to.equal(personauthorityPersonIdentifier);
      done();
    });
  });

  it('can delete personauthority person records', function(done) {
    csapi.deletePerson(personauthorityCsid, personauthorityPersonCsid, function(err, res) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

});