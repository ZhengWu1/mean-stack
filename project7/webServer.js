"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be implemented:
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
var async = require('async');
var assert = require('assert');
var cs142password = require('./cs142password.js');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
var fs = require("fs");

mongoose.connect('mongodb://localhost/cs142project6');

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

app.post('/admin/login', function(request, response) {
    var login_name = request.body.login_name;
    var password = request.body.password;
    User.findOne({login_name: login_name}, function(err, user) {
        if (err) {
            console.error(login_name + ' is not a valid account, error: ', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (!user || user.length === 0) {
                // Query didn't return an error but didn't find the user object - This
                // is also an internal error return.
                response.status(400).send('Missing user with login_name ' + login_name);
                return;
        }
        if (!cs142password.doesPasswordMatch(user.password_digest, user.salt, password)) {
            response.status(400).send('Password with login_name ' + login_name + " incorrect");
            return;
        }
        request.session.user_id = user.id;
        request.session.login_name = login_name;
        response.end(JSON.stringify({id: user.id, first_name: user.first_name}));
    });
});

app.post('/admin/logout', function(request, response) {
    
    if (!request.session.user_id || !request.session.login_name) {
        response.status(401).end();
        return;
    }

    delete request.session.user_id;
    delete request.session.login_name;
    request.session.destroy(function (err) { 
        if (err) {
            console.error('logout failed');
            response.status(500).send(JSON.stringify(err));
            return;
        }
        response.status(200).end();
    });
});

app.post('/commentsOfPhoto/:photo_id', function(request, response) {

    if (!request.session.user_id || !request.session.login_name) {
        response.status(401).end();
        return;
    }

    var photo_id = request.params.photo_id;
    if (request.body.comment.length === 0) {
        response.status(400).end();
        return;
    }
    Photo.findOne({_id: photo_id}, function(err, photo) {
        if (err) {
            console.error('Doing /commentsOfPhoto/' + photo_id + ' error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (!photo || photo.length === 0) {
                // Query didn't return an error but didn't find the photo object - This
                // is also an internal error return.
                response.status(500).send('Missing photo ' + photo_id);
                return;
        }
        var comment = {};
        comment.comment = request.body.comment;
        comment.user_id = request.session.user_id;
        photo.comments.push(comment);
        photo.save();
        response.end();
    });
});

app.post('/photos/new', function(request, response) {
    
    if (!request.session.user_id || !request.session.login_name) {
        response.status(401).end();
        return;
    }

    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            // XXX -  Insert error handling code here.
            response.status(400).send(JSON.stringify(err));
            return;
        }
        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes

        // XXX - Do some validation here.
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        assert(request.file.fieldname === 'uploadedphoto');
        var timestamp = new Date().valueOf();
        var filename = 'U' +  String(timestamp) + request.file.originalname;

        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
                return;
            }
            Photo.create({file_name: filename, user_id: request.session.user_id, comments: []}, function(err, newPhoto) {
                   assert (!err);
                   newPhoto.id = newPhoto._id;
                   newPhoto.save();
                   response.end();
            });
        });
    });
});

app.post('/user', function(request, response) {

    var login_name = request.body.login_name;
    var password = request.body.password;
    var first_name = request.body.first_name;
    var last_name = request.body.last_name;
    var location = request.body.location;
    var description = request.body.description;
    var occupation = request.body.occupation;
    if (!login_name || login_name === "") {
        response.status(400).send("Must specify login name!");
        return;
    }
    User.findOne({login_name: login_name}, function(err, user) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user) {
                response.status(400).send('Login Name ' + login_name + ' is already taken');
                return;
        }
        var passwordEntry = cs142password.makePasswordEntry(password);
        User.create({login_name: login_name, password_digest: passwordEntry.hash, salt: passwordEntry.salt, first_name: first_name, last_name: last_name, 
        location:location, description: description, occupation: occupation}, function(err, newUser) {
           assert (!err);
           newUser.id = newUser._id;
           newUser.save();
           response.end();
        });
    });
});

app.get('/', function (request, response) {
    
    if (!request.session.user_id || !request.session.login_name) {
        response.status(401).end();
        return;
    }

    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    if (!request.session.user_id || !request.session.login_name) {
        response.status(401).end();
        return;
    }

    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.count({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    
    if (!request.session.user_id || !request.session.login_name) {
        response.status(401).end();
        return;
    }

    User.find(function (err, users) {
        if (err) {
            console.error('Doing /user/list error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (users.length === 0) {
                // Query didn't return an error but didn't find the users object - This
                // is also an internal error return.
                response.status(500).send('Missing user list');
                return;
        }
        var minimalUsers = [];
        for (var i = 0; i < users.length; i++) {
            minimalUsers[i] = {id: users[i].id, first_name: users[i].first_name, last_name: users[i].last_name};
        }
        var photoCount = {};
        var commentCount = {};
        Photo.find(function (err, photos) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (photos.length === 0) {
                response.status(500).send('Missing Photos');
                return;
            }
            for(var i = 0; i < photos.length; i++) {
                var currentPhotoCount = photoCount[photos[i].user_id] || 0;
                photoCount[photos[i].user_id] = currentPhotoCount + 1;
                for (var j = 0; j < photos[i].comments.length; j++) {
                    var currentCommentCount = commentCount[photos[i].comments[j].user_id] || 0;
                    commentCount[photos[i].comments[j].user_id] = currentCommentCount + 1;
                }
            }
            for (i = 0; i < minimalUsers.length; i++) {
                minimalUsers[i].numPhotos = photoCount[minimalUsers[i].id];
                minimalUsers[i].numComments = commentCount[minimalUsers[i].id];
            }
            response.end(JSON.stringify(minimalUsers));
        });
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    
    if (!request.session.user_id || !request.session.login_name) {
        response.status(401).end();
        return;
    }

    var user_id = request.params.id;
    User.findOne({_id: user_id}, function(err, user) {
        if (err) {
            console.error('Doing /user/' + user_id + ' error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (!user || user.length === 0) {
                // Query didn't return an error but didn't find the user object - This
                // is also an internal error return.
                response.status(500).send('Missing user ' + user_id);
                return;
        }
        var minimalUsers = {id: user.id, first_name: user.first_name, last_name: user.last_name, location: user.location,
            description: user.description, occupation: user.occupation};
        response.end(JSON.stringify(minimalUsers));
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    
    if (!request.session.user_id || !request.session.login_name) {
        response.status(401).end();
        return;
    }

    var user_id = request.params.id;
    Photo.find({user_id: user_id}, function (err, photos) {
        if (err) {
            console.error('Doing /photosOfUser/' + user_id + ' error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (photos.length === 0) {
                // Query didn't return an error but didn't find the photos object - This
                // is also an internal error return.
                response.status(500).send('Missing photos for ' + user_id);
                return;
        }
        var photosClone = JSON.parse(JSON.stringify(photos));
        async.each(photosClone, function (photo, photo_callback) {
            async.each(photo.comments, function (comment, comment_callback) {
                User.findOne({_id: comment.user_id}, function(err, user) {
                    if (err) {
                        comment_callback(err);
                        return;
                    }
                    if (!user || user.length === 0) {
                            // Query didn't return an error but didn't find the user object - This
                            // is also an internal error return.
                            response.status(500).send('Missing user ' + user_id);
                            return;
                    }
                    comment.user = user;
                    comment_callback();
                });
            }, function (err) {
                photo_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                response.end(JSON.stringify(photosClone));
            }
        });
    });
});

/*
 * URL /commentsOfUser/:id - Return the Comments for User (id)
 */
app.get('/commentsOfUser/:id', function (request, response) {
    
    if (!request.session.user_id || !request.session.login_name) {
        response.status(401).end();
        return;
    }

    var user_id = request.params.id;
    User.findOne({_id: user_id}, function(err, user) {
        if (err) {
            console.error('Doing /commentsOfUser/' + user_id + ' error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user && user.length === 0) {
                // Query didn't return an error but didn't find the User object - This
                // is also an internal error return.
                response.status(500).send('Missing user ' + user_id);
                return;
        }
    });
    Photo.find(function (err, photos) {
        if (err) {
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (photos.length === 0) {
            response.status(500).send('Missing Photos');
            return;
        }
        var comments = [];
        async.each(photos, function (photo, photo_callback) {
            async.each(photo.comments, function (comment, comment_callback) {
                if (String(comment.user_id) === user_id) {
                    var commentClone = JSON.parse(JSON.stringify(comment));
                    commentClone.photo_file_name = photo.file_name;
                    commentClone.photo_user_id = photo.user_id;
                    Photo.find({user_id: String(photo.user_id)}, function (err, photosOfUser) {
                        if (err) {
                            comment_callback(err);
                            return;
                        }
                        if (photosOfUser.length === 0) {
                            response.status(500).send('Missing Photos of' + String(photo.user_id));
                            return;
                        }
                        for (var index = 0; index < photosOfUser.length; index ++) {
                            if (photosOfUser[index].id === photo.id) {
                                commentClone.photo_index = index;
                                comments.push(commentClone);
                                break;
                            }
                        }
                        comment_callback();
                    });
                } else {
                    comment_callback();
                }
            }, function (err) {
                photo_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                response.end(JSON.stringify(comments));
            }
        });
    });
});


var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


