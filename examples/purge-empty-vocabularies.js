var _      = require('underscore');
var csapi  = require('../lib/csapi');

var cspace = {
  backend: "https://cspace.lyrasistechnology.org/cspace-services",
  validateSSL: false,
  username: 'admin@cspace.lyrasistechnology.org',
  password: 'Administrator'
};

var csapi = new csapi(cspace);

csapi.getVocabularies({ pgSz: 100 },function(err, res, data) {
  _.each(data['list-item'], function(vocabulary, index) {
    var csid = vocabulary['csid'][0];
    var shortIdentifier = vocabulary['shortIdentifier'][0];

    csapi.getVocabularyItems(csid, function(err, res, data) {
      if (parseInt(data['totalItems']) == 0 && shortIdentifier != "xxx") {
        console.log('Attempting to delete vocabulary: ' + csid + ' ' + shortIdentifier);
        csapi.deleteVocabulary(csid, function(err, res){
          if (res.statusCode == 200) {
            console.log('Successfully deleted: ' + csid + ' ' + shortIdentifier);
          } else {
            console.log('Failed to delete: ' + csid + ' ' + shortIdentifier);
          }
        });
      }
    });
  });
});
