'use strict';

cs142App.controller('AdvancedPhotosController', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    /*
     * Since the route is specified as '/photos/:userId/:photoIndex' in $routeProvider config the
     * $routeParams  should have the userId and photoIndex property set with the path from the URL.
     */
    $scope.main.userId = Number($routeParams.userId);
    $scope.photoIndex = Number($routeParams.photoIndex);
    var photos = window.cs142models.photoOfUserModel($scope.main.userId); 
    var user = window.cs142models.userModel($scope.main.userId);
    $scope.photo = photos[$scope.photoIndex];
    $scope.length = photos.length;
    $scope.main.title = "Photo " + ($scope.photoIndex + 1) + " of " + user.first_name + " " + user.last_name;
    $scope.main.advanced = true;
  }]);