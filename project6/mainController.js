'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial']);

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
            otherwise({
                redirectTo: '/users'
            });
    }]);

cs142App.controller('MainController', ['$scope', '$location',
    function ($scope, $location) {
        $scope.main = {};
        $scope.main.title = {title: 'Users'};
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

        $scope.FetchModel('http://localhost:3000/test/info', function(model) {
            $scope.$apply(function() {
                // Put your code that updates any $scope variables here
                $scope.main.version = model.version;
            });
        });
    }]);
