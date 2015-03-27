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

describe('csapi roles handling', function() {
  this.timeout(10000);

  var roleData;
  var roleAdminData;
  var roleAdminDataCsid;
  var roleSiteData;
  var roleSiteDataCsid;
  var roleSiteName = "SITE_ADMINISTRATOR";

  it('can retrieve roles', function(done) {
    csapi.getRoles({ pgSz: 10 }, function(err, res, data) {
      expect(res.statusCode).to.equal(200);
      roleData = data;
      expect(roleData['$']).to.exist;
      expect(roleData['role'].length).to.be.gte(2);
      done();
    });
  });

  it('can retrieve roles by name', function(done) {
    var name = 'TENANT_ADMIN';
    csapi.getRolesByName(name, function(err, res, data) {
      expect(res.statusCode).to.equal(200);
      expect(data['role'].length).to.eq(1);
      roleAdminData = data['role'][0];
      roleAdminDataCsid = roleAdminData['$']['csid']
      expect(roleAdminData['$']).to.exist;
      expect(roleAdminData['description'][0]).to.eq('Generated tenant admin role.');
      done();
    });
  });

  it('can create roles', function(done) {
    var parser = new xml2js.Parser();
    fs.readFile(__dirname + '/records/role.xml', function(err, data) {
      parser.parseString(data, function (err, result) {
        csapi.createRole(result, function(err, res, data) {
          expect(res.statusCode).to.equal(201);
          done();
        });
      });
    });
  });

  it('can find created role records', function(done) {
    csapi.getRolesByName(roleSiteName, function(err, res, data) {
      expect(res.statusCode).to.equal(200);
      roleSiteData = data['role'][0];
      roleSiteDataCsid = roleSiteData['$']['csid'];
      expect(roleSiteData['displayName'][0]).to.equal(roleSiteName);
      done();
    });
  });

  it('can retrieve permissions associated with role', function(done) {
    csapi.getRolePermissions(roleAdminDataCsid, function(err, res, data) {
      expect(res.statusCode).to.equal(200);
      expect(data['permission'].length).to.be.gt(10);
      expect(data['role'][0]['roleId'][0]).to.eq(roleAdminDataCsid);
      done();
    });
  });

  it('can delete role records', function(done) {
    csapi.deleteRole(roleSiteDataCsid, function(err, res) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

});