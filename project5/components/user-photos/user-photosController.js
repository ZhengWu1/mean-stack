'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    $scope.main.userId = Number($routeParams.userId);
    $scope.photos = window.cs142models.photoOfUserModel($scope.main.userId); 
    $scope.user = window.cs142models.userModel($scope.main.userId);
    $scope.main.title = "Photos of " + $scope.user.first_name + " " + $scope.user.last_name;
  }]);
