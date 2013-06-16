function ApplicationController($scope, $location, connect) {
    "use strict";
    $scope.userName = undefined;
    $scope.email = undefined;
    $scope.password = undefined;
    $scope.authenticateUser = function () {
        if ($scope.email && $scope.password) {
            connect.authenticate({email: $scope.email, password: $scope.password},
                function (data) {
                    $scope.userName = data.user;
                    // Change path and handle success
                }, function (data) {
                    console.log("Error: ", data.error);
                });
        }
        return false;
    };
}

ApplicationController.$inject = [
    "$scope",
    "$location",
    "connect"
];