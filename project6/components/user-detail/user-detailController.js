'use strict';

cs142App.controller('UserDetailController', ['$scope', '$routeParams',
  function ($scope, $routeParams) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    $scope.main.userId = $routeParams.userId;
    $scope.FetchModel('/user/' + $scope.main.userId, function(model) {
        $scope.$apply(function() {
            $scope.main.user = model;
            $scope.main.title = $scope.main.user.first_name + " " + $scope.main.user.last_name;
        });
    });
  }]);
