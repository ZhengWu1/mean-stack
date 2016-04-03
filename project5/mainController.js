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
            }
        };
    }]);
