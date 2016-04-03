/**
 * Define StatesController for the states component of CS142 project #4
 * problem #2.  The model data for this view (the states) is available
 * at window.cs142models.statesModel().
 */

cs142App.controller('StatesController', ['$scope', function($scope) {

   $scope.allStates = window.cs142models.statesModel();

   $scope.subString = "";

   $scope.filteredStates = [];

   $scope.filter = function() {
   		var subString = $scope.subString;
   		console.log(subString);
   		$scope.filteredStates = window.cs142models.statesModel().map(function(string){
   			return string.toLowerCase();
   		}).filter(function(string){
   			return string.indexOf(subString.toLowerCase()) > -1;
   		}).sort().map(function(string) {
   			return string.charAt(0).toUpperCase() + string.slice(1);
   		});
   	};

}]);
