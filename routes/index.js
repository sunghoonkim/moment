var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// our db models
var Moment = require("../models/moment.js");

// S3 File dependencies
var AWS = require('aws-sdk');
var awsBucketName = process.env.AWS_BUCKET_NAME;
var s3Path = process.env.AWS_S3_PATH;
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
var s3 = new AWS.S3();

// file processing dependencies
var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

/**
 * GET '/'
 * Default home route. Just relays a success message back.
 * @param  {Object} req
 * @return {Object} json
 */
router.get('/', function(req, res) {

  console.log('home page requested!');

  var jsonData = {
  	'name': 'moments',
  	'api-status':'OK'
  }

    res.render('moments2.html')

});

router.get('/add-moment', function(req,res){

    res.render('add-moment.html')

})

router.get('/find-moment', function(req,res){

    res.render('find-moment.html')

})

router.get('/moments', function(req,res){

  res.render('moments2.html')

})


router.get('/:id', function(req,res){ // for edit

  var requestedId = req.params.id;

  Moment.findById(requestedId,function(err,data){
    if(err){
      var error = {
        status: "ERROR",
        message: err
      }
      return res.json(err)
    }

    var viewData = {
      status: "OK",
      moment: data
    }

    return res.render('edit-moment.html',viewData);
  })

})


router.post('/api/create', function(req,res){

  console.log(req.body);

    var momentObj = {
        momentdate:req.body.datepicker_input,
        category: req.body.sel1,
        memo: req.body.memo,
        imageUrl: req.body.imageUrl
    }

  var moment = new Moment(momentObj);

  moment.save(function(err,data){
    if(err){
      var error = {
        status: "ERROR",
        message: err
      }
      return res.json(err)
    }

    var jsonData = {
      status: "OK",
      person: data
    }

    return res.json(jsonData);

  })

})

router.post('/api/edit/:id', function(req,res){

  console.log(req.body);
  var requestedId = req.params.id;

    var momentObj = {
        momentdate:req.body.datepicker_input,
        category: req.body.sel1,
        memo: req.body.memo,
        imageUrl: req.body.imageUrl
        //slug : req.body.name.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-')
    }

    console.log(momentObj);

  Moment.findByIdAndUpdate(requestedId,momentObj,function(err,data){
    if(err){
      var error = {
        status: "ERROR",
        message: err
      }
      return res.json(error)
    }

    var jsonData = {
      status: "OK",
      moment: data
    }

      return res.redirect('/moments');


  })

})

router.post('/api/find', function(req,res){

    console.log(req.body);
    var req_memo = req.body.find_memo;
    console.log(req_memo);

    Moment.find({'memo':req_memo},function(err,data){
        if(err){
            var error = {
                status: "ERROR",
                message: err
            }
            return res.json(err)
        }

        var jsonData = {
            status: "OK",
            moment: data
        }

        return res.json(jsonData);
    })

})



router.post('/api/create/image', multipartMiddleware, function(req,res){

  console.log('the incoming data >> ' + JSON.stringify(req.body));
  console.log('the incoming image file >> ' + JSON.stringify(req.files.image));
   //console.log("DATEPICKER: "+JSON.stringify(req.body.datepicker_input));

  var momentObj = {
      momentdate:req.body.datepicker_input,
    category: req.body.sel1,
    memo: req.body.memo
    //slug : req.body.name.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-')
  }

    console.log("MOMENTDATE: "+momentObj['momentdate']);

    var date_from_reply=new Date(momentObj['momentdate']);
    var date_to_reply=new Date("2013-11-18");

    //var timeinmilisec=today.getTime() - date_to_reply.getTime();
    var timeinmilisec=date_from_reply.getTime() - date_to_reply.getTime();
    var passtime=Math.floor(timeinmilisec / (1000 * 60 * 60 * 24));
    momentObj['passtime']=parseInt(passtime);

    console.log(momentObj['passtime']);

  //if (req.body.hasGlasses == 'yes') momentObj['hasGlasses'] = true;
  //else momentObj['hasGlasses'] = false;


  // NOW, we need to deal with the image
  // the contents of the image will come in req.files (not req.body)
  var filename = req.files.image.name; // actual filename of file
  var path = req.files.image.path; // will be put into a temp directory
  var mimeType = req.files.image.type; // image/jpeg or actual mime type
  
  // create a cleaned file name to store in S3
  // see cleanFileName function below
  var cleanedFileName = cleanFileName(filename);

  // We first need to open and read the uploaded image into a buffer
  fs.readFile(path, function(err, file_buffer){

    // reference to the Amazon S3 Bucket
    var s3bucket = new AWS.S3({params: {Bucket: awsBucketName}});
    
    // Set the bucket object properties
    // Key == filename
    // Body == contents of file
    // ACL == Should it be public? Private?
    // ContentType == MimeType of file ie. image/jpeg.
    var params = {
      Key: cleanedFileName,
      Body: file_buffer,
      ACL: 'public-read',
      ContentType: mimeType
    };
    
    // Put the above Object in the Bucket
    s3bucket.putObject(params, function(err, data) {
      if (err) {
        console.log(err)
        return;
      } else {
        console.log("Successfully uploaded data to s3 bucket");

        // now that we have the image
        // we can add the s3 url our person object from above
        momentObj['imageUrl'] = s3Path + cleanedFileName;

        // now, we can create our person instance
        var moment = new Moment(momentObj);

        moment.save(function(err,data){
          if(err){
            var error = {
              status: "ERROR",
              message: err
            }
            return res.json(err)
          }

          var jsonData = {
            status: "OK",
            moment: data
          }


            return res.redirect('/moments');

        })

      }

    }); // end of putObject function

  });// end of read file

})

function cleanFileName (filename) {
    
    // cleans and generates new filename for example userID=abc123 and filename="My Pet Dog.jpg"
    // will return "abc123_my_pet_dog.jpg"
    var fileParts = filename.split(".");
    
    //get the file extension
    var fileExtension = fileParts[fileParts.length-1]; //get last part of file
    
    //add time string to make filename a little more random
    d = new Date();
    timeStr = d.getTime();
    
    //name without extension
    newFileName = fileParts[0];
    
    return newFilename = timeStr + "_" + fileParts[0].toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_') + "." + fileExtension;
    
}

router.get('/api/get', function(req,res){


    Moment.find({}).sort('-passtime').exec(function(err,data){
        if(err){
                  var error = {
                    status: "ERROR",
                    message: err
                  }
                  return res.json(err)
                }

                var jsonData = {
                  status: "OK",
                  moment: data
                }

                return res.json(jsonData);
    });

})


router.get('/api/delete/:id', function(req, res){

    var requestedId = req.param('id');
    console.log(requestedId);
    //if(requestedId===1234){console.log("1234");}

    // Mongoose method to remove, http://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove
    Moment.findByIdAndRemove(requestedId,function(err, data){
        if(err || data == null){
            var error = {status:'ERROR', message: 'Could not find that moment to delete'};
            return res.json(error);
        }

        // otherwise, respond back with success
        var jsonData = {
            status: 'OK',
            message: 'Successfully deleted id ' + requestedId
        }

        //res.json(jsonData);

        console.log(jsonData);

        res.redirect('/moments');



    })

})




module.exports = router;







