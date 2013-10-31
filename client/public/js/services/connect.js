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
                authenticate: "/authenticate",
                logout: "/logout",
                newboards: "/boards/new",
                updateBoardName: "/boards/update",
                deleteBoard: "/boards/delete",
                shareBoard: "/boards/:id/share"
            },
            authenticateUser = function (params, onSuccess, onError) {
                postHandler(urlMap.authenticate, params, onSuccess, onError);
            },
            logoutUser = function (params, onSuccess, onError) {
                postHandler(urlMap.logout, params, onSuccess, onError);
            },
            newboards = function (params, onSuccess, onError) {
                postHandler(urlMap.newboards, params, onSuccess, onError);
            },
            updateBoardName = function (params, onSuccess, onError) {
                postHandler(urlMap.updateBoardName, params, onSuccess, onError);
            },
            deleteBoard = function (params, onSuccess, onError) {
                postHandler(urlMap.deleteBoard, params, onSuccess, onError);
            },
            shareBoard = function (params, onSuccess, onError) {
                postHandler(urlMap.shareBoard, params, onSuccess, onError);
            };

        return {
            authenticate: authenticateUser,
            logout: logoutUser,
            newboards: newboards,
            updateBoardName: updateBoardName,
            deleteBoard: deleteBoard,
            shareBoard: shareBoard
        };
    }]);