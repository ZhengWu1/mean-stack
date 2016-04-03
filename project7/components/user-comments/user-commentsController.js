'use strict';

cs142App.controller('UserCommentsController', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    /*
     * Since the route is specified as '/comments/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    $scope.main.userId = $routeParams.userId;
    
    $scope.FetchModel('/commentsOfUser/' + $scope.main.userId, function(model) {
        $scope.$apply(function() {
            $scope.comments = model;
        });
    });
    
    $scope.FetchModel('/user/' + $scope.main.userId, function(model) {
        $scope.$apply(function() {
            $scope.main.user = model; 
            $scope.main.title = "Comments of " + $scope.main.user.first_name + " " + $scope.main.user.last_name;
        });
    });    

    $scope.main.advanced = true;
  }]);
