'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial', 'ngResource']);

cs142App.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/users', {
                templateUrl: 'components/user-list/user-listTemplate.html',
                controller: 'UserListController'
            }).
            when('/users/:userId', {
                templateUrl: 'components/user-detail/user-detailTemplate.html',
                controller: 'UserDetailController'
            }).
            when('/photos/:userId', {
                templateUrl: 'components/user-photos/user-photosTemplate.html',
                controller: 'UserPhotosController'
            }).
            when('/photos/:userId/:photoIndex', {
                templateUrl: 'components/advanced-photos/advanced-photosTemplate.html',
                controller: 'AdvancedPhotosController'
            }).
            when('/comments/:userId', {
                templateUrl: 'components/user-comments/user-commentsTemplate.html',
                controller: 'UserCommentsController'
            }).
            when('/login-register', {
                templateUrl: 'components/login-register/login-registerTemplate.html',
                controller: 'LoginRegisterController'
            }).
            otherwise({
                redirectTo: '/users'
            });
    }]);

cs142App.controller('MainController', ['$scope', '$location', '$resource', '$rootScope', '$http',
    function ($scope, $location, $resource, $rootScope, $http) {
        $scope.main = {};
        $scope.main.title = 'CS142 Class Project';
        $scope.main.loggedin = false;
        $scope.main.register_message = "";
        $scope.main.login_name = "";
        $scope.main.password = "";

        $rootScope.$on( "$routeChangeStart", function(event, next, current) {
            if (!$scope.main.loggedin) {
             // no logged user, redirect to /login-register unless already there
                if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                    $location.path("/login-register");
                }
            }
        });

        $scope.redirect = function() {
            if ($scope.main.title.substring(0, 5) === "Photo") {
                if($scope.main.advanced) {
                    $location.url("/photos/" + $scope.main.userId + "/0");
                } else {
                    $location.url("/photos/" + $scope.main.userId);
                }
            } else if ($scope.main.title.substring(0, 8) === "Comments") {
                $location.url("/users/" + $scope.main.userId);
            }
        };

        $scope.logout = function() {
            var res = $resource("/admin/logout");
            res.save({}, function() {
                $scope.main.loggedin = false;
                $location.path("/login-register");
                $rootScope.$broadcast('LoggedOut');
                $scope.main.login_name = "";
                $scope.main.first_name = "";
                $scope.main.register_message = "";
                $scope.main.password = "";
                $scope.main.title = "CS142 Class Project";
            }, function errorHandling(err) {

            });
        };

        /*
        * FetchModel - Fetch a model from the web server.
        *   url - string - The URL to issue the GET request.
        *   doneCallback - function - called with argument (model) when the
        *                  the GET request is done. The argument model is the object
        *                  containing the model. model is undefined in the error case.
        */
        $scope.FetchModel = function(url, doneCallback) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                //Don’t do anything if not final state
                if (xhr.readyState !== 4){ 
                    return; 
                }
                //Final State but status not OK
                if (xhr.status !== 200) {
                    return;
                }
                //Final State & status OK
                //do something with response.text
                doneCallback(JSON.parse(xhr.responseText));
            };
            xhr.open("GET", url);
            xhr.send();
        };

        $scope.computePhotoSrc = function(file_name) {
            if (!file_name) {
                return ''; // Likely needed - delete to see why
            }
            return file_name.match(/^http:/) ? file_name : ('images/' + file_name);
        };

        var selectedPhotoFile;   // Holds the last file selected by the user

        // Called on file selection - we simply save a reference to the file in selectedPhotoFile
        $scope.inputFileNameChanged = function (element) {
            selectedPhotoFile = element.files[0];
        };

        // Has the user selected a file?
        $scope.inputFileNameSelected = function () {
            return !!selectedPhotoFile;
        };

        // Upload the photo file selected by the user using a post request to the URL /photos/new
        $scope.uploadPhoto = function () {
            if (!$scope.inputFileNameSelected()) {
                console.error("uploadPhoto called will no selected file");
                return;
            }

            // Create a DOM form and add the file to it under the name uploadedphoto
            var domForm = new FormData();
            domForm.append('uploadedphoto', selectedPhotoFile);

            // Using $http to POST the form
            $http.post('/photos/new', domForm, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).success(function(newPhoto){
                $location.path("/photos/" + $scope.main.logged_in_user_id);
            }).error(function(err){
                // Couldn't upload the photo. XXX  - Do whatever you want on failure.
                console.error('ERROR uploading photo', err);
            });

        };

    }]);
