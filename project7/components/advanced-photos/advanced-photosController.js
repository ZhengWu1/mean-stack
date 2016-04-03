'use strict';

cs142App.controller('AdvancedPhotosController', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    /*
     * Since the route is specified as '/photos/:userId/:photoIndex' in $routeProvider config the
     * $routeParams  should have the userId and photoIndex property set with the path from the URL.
     */
    var needFetch = true;
    if ($scope.main.userId === $routeParams.userId && $scope.main.photos && $scope.main.photos[0].user_id === $scope.main.userId) {
        needFetch = false;
    } else if ($scope.main.userId !== $routeParams.userId) {
        $scope.main.userId = $routeParams.userId;
    }
    
    $scope.photoIndex = Number($routeParams.photoIndex);

    if (needFetch) {
        $scope.FetchModel('/photosOfUser/' + $scope.main.userId, function(model) {
            $scope.$apply(function() {
                $scope.main.photos = model;
                $scope.photo = $scope.main.photos[$scope.photoIndex];
                $scope.main.length = $scope.main.photos.length; 
            });
        });    
    } else {
        $scope.photo = $scope.main.photos[$scope.photoIndex];
    }

    if (needFetch) {
        $scope.FetchModel('/user/' + $scope.main.userId, function(model) {
            $scope.$apply(function() {
                $scope.main.user = model; 
                $scope.main.title = "Photo " + ($scope.photoIndex + 1) + " of " + $scope.main.user.first_name + " " + $scope.main.user.last_name;
            });
        });    
    } else {
         $scope.main.title = "Photo " + ($scope.photoIndex + 1) + " of " + $scope.main.user.first_name + " " + $scope.main.user.last_name;
    }
    $scope.main.advanced = true;
  }]);