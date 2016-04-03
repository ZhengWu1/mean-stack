'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams', '$resource', '$rootScope',
  function($scope, $routeParams, $resource, $rootScope) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    $scope.main.userId = $routeParams.userId;
    
    $scope.FetchModel('/photosOfUser/' + $scope.main.userId, function(model) {
        $scope.$apply(function() {
            $scope.photos = model; 
        });
    });

    $scope.FetchModel('/user/' + $scope.main.userId, function(model) {
        $scope.$apply(function() {
            $scope.main.user = model; 
            $scope.main.title = "Photos of " + $scope.main.user.first_name + " " + $scope.main.user.last_name;
        });
    });    

    $scope.comment = function(photo_id) {
        var res = $resource("/commentsOfPhoto/" + photo_id);
        res.save({comment: $scope.main.new_comment}, function() {
          $rootScope.$broadcast('RefetchPhotos');
          $scope.main.new_comment = "";
        }, function errorHandling(err) {
            
        });
    };

    $scope.$on('RefetchPhotos', function() {
      $scope.FetchModel('/photosOfUser/' + $scope.main.userId, function(model) {
        $scope.$apply(function() {
            $scope.photos = model; 
        });
      });
    });
    
  }]);
