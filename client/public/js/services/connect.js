angular.module('httpService', []).
    factory('connect', ['$http', function ($http) {
        "use strict";
        var baseUrl = "http://localhost:8000",
            postHandler = function (path, params, onSuccess, onError) {
                $http.post(baseUrl + path, params).
                    success(onSuccess).
                    error(onError);
            },
            urlMap = {
                authenticate: "/authenticate"
            },
            authenticateUser = function (params, onSuccess, onError) {
                postHandler(urlMap.authenticate, params, onSuccess, onError);
            };

        return {
            authenticate: authenticateUser
        };
    }]);