'use strict';


cs142App.controller('UserListController', ['$scope',
    function ($scope) {
        $scope.main.title = 'Users';
        $scope.FetchModel('/user/list', function(model) {
            $scope.$apply(function() {
                $scope.users = model;
            });
        });
    }]);

