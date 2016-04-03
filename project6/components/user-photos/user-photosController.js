'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams',
  function($scope, $routeParams) {
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

    if (!$scope.main.user) {
        $scope.FetchModel('/user/' + $scope.main.userId, function(model) {
            $scope.$apply(function() {
                $scope.main.user = model; 
                $scope.main.title = "Photos of " + $scope.main.user.first_name + " " + $scope.main.user.last_name;
            });
        });    
    } else {
        $scope.main.title = "Photos of " + $scope.main.user.first_name + " " + $scope.main.user.last_name;
    }
    
  }]);
