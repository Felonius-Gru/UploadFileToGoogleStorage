function saveInFS(request, dir, callback) {
    var formidable = require('formidable');
    var form = new formidable.IncomingForm();
    
    form.uploadDir = dir;
    form.keepExtensions = true;
    form.maxFieldsSize = 100 * 1024 * 1024;
    form.maxFields = 1000;
    form.multiples = false;
    
    form.parse(request, function(err, fields, files) {
        callback(err, files.file.path);
    });
}

function getFileName(filePath) {
    var fileName = filePath.substring(filePath.indexOf('tmp/') + 4, filePath.length);
    return fileName;
}

function uploadFileToGoogle (filePath, bucketName, done) {
    var fileName = getFileName(filePath);
    
    // Instantiates a client
    const storage = require('@google-cloud/storage')();
    
    // Uploads a local file to the bucket
    storage
        .bucket(bucketName)
        .upload(filePath)
        .then(function () {
            var publicURL = 'https://storage.googleapis.com/' + bucketName + '/' + fileName;
            var gcURL = 'gs://' + bucketName + '/' + fileName;
            done(null, publicURL, gcURL);
        })
        .catch(function(err) {
            done(err);
        });
}

exports.uploadFile = function (req, res) {
    var async = require('async');
    var mime = require('mime');
    
    var sourceLang, targetLang, filePath, public1 = null, public2 = null;
    var result1 = null, result2 = null;
    
    console.log("here is start");
    var sTime = new Date().getTime();
    var pTime = sTime;

    async.waterfall([
        (done)=>{
            saveInFS(req, '../tmp/', done);
        },
        (filePath, done)=>{
            uploadFileToGoogle(filePath, "upload-abcde", (err, publicURL, gcURL)=>{
                res.json({publicURL, gcURL});
            });
        }
    ], function (err) {
        res.json({
            success : false
        });
    });
};
