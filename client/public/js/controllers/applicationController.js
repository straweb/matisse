function ApplicationController($scope, $location, connect, localize) {
    "use strict";
    $scope.userName = undefined;
    $scope.email = undefined;
    $scope.password = undefined;
    $scope.authenticateUser = function () {
        if ($scope.email && $scope.password) {
            connect.authenticate({email: $scope.email, password: $scope.password},
                function (data) {
                    $scope.userName = data.user;
                    $scope.createdNum = data.createdNum;
                    $scope.sharedNum = data.sharedNum;
                    // Change path and handle success
                }, function (data) {
                    console.log("Error: ", data.error);
                });
        }
        return false;
    };

    $scope.setEnglishLanguage = function() {
        localize.setLanguage('en-US');
    };

    $scope.setPigLatinLanguage = function() {
        localize.setLanguage('es-es');
    };
}

ApplicationController.$inject = [
    "$scope",
    "$location",
    "connect",
    "localize"
];