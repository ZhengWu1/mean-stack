'use strict';

cs142App.controller('LoginRegisterController', ['$scope', '$location', '$resource', '$rootScope',
  function ($scope, $location, $resource, $rootScope) {
    $scope.login = function() {
        var res = $resource("/admin/login");
        res.save({login_name: $scope.main.login_name, password: $scope.main.password}, function(user) {
            $scope.main.loggedin = true;
            $location.path("/users/" + user.id);
            $scope.main.first_name = user.first_name;
            $scope.main.logged_in_user_id = user.id;
            $rootScope.$broadcast('LoggedIn');
        }, function errorHandling(err) {
            $scope.main.login_failed = true;
        });
    };

    $scope.register = function() {
        if (!$scope.main.new_login_name || $scope.main.new_login_name === "") {
            $scope.main.register_message = "Please specify login name and try again.";
            return;
        }
        if (!$scope.main.password1 || !$scope.main.password2) {
            $scope.main.register_message = "Please enter non-empty passwords twice!";
            return;
        }
        if ($scope.main.password1 !== $scope.main.password2) {
            $scope.main.register_message = "The two passwords you entered do not match.";
            return;
        }
        if (!$scope.main.first_name || $scope.main.first_name === "") {
            $scope.main.register_message = "Please specify first name and try again";
            return;
        }
        if (!$scope.main.last_name || $scope.main.last_name === "") {
            $scope.main.register_message = "Please specify last name and try again";
            return;
        }
        var res = $resource("/user");
        res.save({login_name: $scope.main.new_login_name, password: $scope.main.password1,
        first_name: $scope.main.first_name, last_name: $scope.main.last_name, location: $scope.main.location,
        description: $scope.main.description, occupation: $scope.main.occupation}, function() {
            $scope.main.register_message = "Register success! Please login!";
            $scope.main.new_login_name = "";
            $scope.main.password1 = "";
            $scope.main.password2 = "";
            $scope.main.first_name = "";
            $scope.main.last_name = "";
            $scope.main.location = "";
            $scope.main.description = "";
            $scope.main.occupation = "";
        }, function errorHandling(err) {
            $scope.main.register_message = err.data;
        });
    };
  }]);