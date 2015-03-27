var extend       = require('extend');
var url          = require('url');
var util         = require('util');
var request      = require('request');
var xml2js       = require('xml2js');
var parseString  = xml2js.parseString;

// using `request` module auth but for manual header control:
// 'Authorization': 'Basic ' + (new Buffer(self.auth.user + ':' + self.auth.pass).toString('base64'));

var DEFAULT_CLIENT_OPTIONS = {
  backend: "https://localhost:8180/cspace-services",
  validateSSL: false,
  timeout: 30000,
  username: 'admin@core.collectionspace.org',
  password: 'Administrator'
};

function CollectionSpaceApi(opts) {
  this.opts        = extend(true, {}, DEFAULT_CLIENT_OPTIONS, opts || {});
  this.backend     = opts.backend;
  this.validateSSL = opts.validateSSL || false;
  this.timeout     = opts.timeout || 30000;
  this.auth        = {
    user: opts.username,
    pass: opts.password
  };

  var self = this;

  this.createCollectionObject = function(object, callback) {
    return doPost('/collectionobjects', false, object, callback);
  };

  this.createPerson = function(authority_id, object, callback) {
    return doPost('/personauthorities/' + authority_id + '/items', false, object, callback);
  };

  this.createPersonAuthority = function(object, callback) {
    return doPost('/personauthorities', false, object, callback);
  };

  this.createRole = function(object, callback) {
    return doPost('/authorization/roles', false, object, callback);
  };

  this.createVocabulary = function(object, callback) {
    return doPost('/vocabularies', false, object, callback);
  };

  this.deleteCollectionObject = function(id, callback) {
    return doDelete('/collectionobjects/' + id, callback);
  };

  this.deletePerson = function(authority_id, id, callback) {
    return doDelete('/personauthorities/' + authority_id + '/items/' + id, callback);
  };

  this.deletePersonAuthority = function(id, callback) {
    return doDelete('/personauthorities/' + id, callback);
  };

  this.deletePersonAuthorityById = function(id, callback) {
    return doDelete('/personauthorities/urn:cspace:name(' + id + ')', callback);
  };

  this.deleteRole = function(id, callback) {
    return doDelete('/authorization/roles/' + id, callback);
  };

  this.deleteVocabulary = function(id, callback) {
    return doDelete('/vocabularies/' + id, callback);
  };

  this.getAcquisitions = function(params, callback) {
    return doGet('/acquisitions', 'ns2:abstract-common-list', params, callback);
  };

  this.getCollectionObject = function(id, params, callback) {
    return doGet('/collectionobjects/' + id, 'document', params, callback);
  };

  this.getCollectionObjects = function(params, callback) {
    return doGet('/collectionobjects', 'ns2:abstract-common-list', params, callback);
  };

  this.getMedia = function(params, callback) {
    return doGet('/media', 'ns2:abstract-common-list', params, callback);
  };

  this.getPersonAuthorities = function(params, callback) {
    return doGet('/personauthorities', 'ns2:abstract-common-list', params, callback);
  };

  this.getPersonAuthority = function(id, params, callback) {
    return doGet('/personauthorities/' + id, 'ns2:abstract-common-list', params, callback);
  };

  this.getPersonAuthorityById = function(id, callback) {
    return doGet('/personauthorities/urn:cspace:name(' + id + ')', 'document', callback);
  };

  this.getPerson = function(authority_id, id, params, callback) {
    return doGet('/personauthorities/' + authority_id + '/items/' + id, 'document', params, callback);
  };

  this.getPersons = function(authority_id, params, callback) {
    return doGet('/personauthorities/' + authority_id + '/items', 'ns2:abstract-common-list', params, callback);
  };

  this.getRolePermissions = function(role_id, params, callback) {
    return doGet('/authorization/roles/' + role_id + '/permroles', 'ns2:permission_role', params, callback);
  };

  this.getRoles = function(params, callback) {
    return doGet('/authorization/roles', 'ns2:roles_list', params, callback);
  };

  this.getRolesByName = function(name, callback) {
    return doGet('/authorization/roles/', 'ns2:roles_list', { r: name }, callback);
  };

  this.getVocabularies = function(params, callback) {
    return doGet('/vocabularies', 'ns2:abstract-common-list', params, callback);
  };

  this.getVocabulary = function(id, params, callback) {
    return doGet('/vocabularies/' + id, 'ns2:abstract-common-list', params, callback);
  };

  this.getVocabularyById = function(id, callback) {
    return doGet('/vocabularies/urn:cspace:name(' + id + ')', 'document', callback);
  };

  this.getVocabularyItems = function(id, params, callback) {
    return doGet('/vocabularies/' + id + '/items', 'ns2:abstract-common-list', params, callback);
  };

  // wonky -- find a good ping endpoint
  this.ping = function(callback) {
    return doGet("", false, callback);
  }

  function doDelete(path, callback) {
    var opts = {
      url: self.backend + path,
      auth: self.auth,
      rejectUnauthorized: self.validateSSL,
      timeout: self.timeout,
      headers: {}
    };

    request.del(opts, function(err, res) {
      callback(err, res);
    });
  }

  function doGet(path, root_element, params, callback) {
    if (typeof(params) === 'function') {
      callback = params;
      params = {};
    }

    var opts = {
      url: self.backend + path,
      qs: params,
      auth: self.auth,
      rejectUnauthorized: self.validateSSL,
      timeout: self.timeout,
      headers: {
        'Accept': 'application/xml'
      }
    };

    request.get(opts, function(err, res, body) {
      return doResponse(root_element, callback, err, res, body);
    });
  };

  function doPost(path, root_element, object, callback) {
    var builder = new xml2js.Builder({ 'renderOpts': { 'pretty': false }});
    var xml = builder.buildObject(object);

    var opts = {
      url: self.backend + path,
      auth: self.auth,
      rejectUnauthorized: self.validateSSL,
      timeout: self.timeout,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Length': Buffer.byteLength(xml)
      },
      body: xml
    };

    request.post(opts, function(err, res, body) {
      return doResponse(root_element, callback, err, res, body);
    });
  }

  function doResponse(root_element, callback, err, res, body) {
    if (res && res.statusCode == 200) {
      parseString(body, function (err, result) {
        root_element ? callback(err, res, result[root_element]) : callback(err, res, result);
      });
    }
    else if (res && res.statusCode == 201) {
      callback(err, res, body);
    }
    else {
      // todo: add error handling
      console.log('ERROR: (' + res.statusCode + ') ' + body);
      callback(err, res, body);
    }
  }
}

module.exports = CollectionSpaceApi;

if (typeof(window) != 'undefined') {
  window.CollectionSpaceApi = CollectionSpaceApi;
}
