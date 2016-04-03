'use strict';

cs142App.controller('UserDetailController', ['$scope', '$routeParams',
  function ($scope, $routeParams) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    $scope.main.userId = Number($routeParams.userId);
    $scope.user = window.cs142models.userModel($scope.main.userId);
    $scope.main.title = $scope.user.first_name + " " + $scope.user.last_name;
  }]);
