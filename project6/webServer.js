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


// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

mongoose.connect('mongodb://localhost/cs142project6');

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));


app.get('/', function (request, response) {
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
    var user_id = request.params.id;
    User.findOne({_id: user_id}, function(err, user) {
        if (err) {
            console.error('Doing /user/' + user_id + ' error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user && user.length === 0) {
                // Query didn't return an error but didn't find the user object - This
                // is also an internal error return.
                response.status(500).send('Missing user ' + user_id);
                return;
        }
        response.end(JSON.stringify(user));
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
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


