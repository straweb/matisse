function ApplicationController($scope, $location, connect, localize) {
    "use strict";
    $scope.userName = undefined;
    $scope.email = undefined;
    $scope.password = undefined;
    $scope.ownedBoards = undefined;
    $scope.boardName = 'default board name';
    $scope.board = undefined;
    $scope.sharedBoards = undefined;
    $scope.lang = "en-US";
    $scope.authenticateUser = function () {
        if ($scope.email && $scope.password) {
            connect.authenticate({email: $scope.email, password: $scope.password},
                function (data) {
                    $scope.email = data.email;
                    $scope.password = '';
                    $scope.userName = data.user;
                    $scope.createdNum = data.createdNum == null? 0 : data.createdNum;
                    $scope.sharedNum = data.sharedNum == null? 0 : data.sharedNum;
                    // Change path and handle success
                    $scope.sharedBoards = data.sharedBoards;
                    $scope.ownedBoards = data.ownedBoards;
                }, function (data) {
                    console.log("Error: ", data.error);
                });
        }
        return false;
    };
    $scope.newboards = function (txt) {
//        if ($scope.email && $scope.password) {
            connect.newboards({email: $scope.email, boardName: $scope.boardName},
                function (data) {
                   /* user:docs['user'],
                        createdUrl:docs['createdUrl'],
                        sharedUrl:docs['sharedUrl'],
                        name:docs['name']*/
                    $scope.url = data.board.createdUrl;
                    $scope.ownedBoards.push(data.board);
                    window.location = 'board/'+data.board.createdUrl;
//                    $location.path();
                    // Change path and handle success
                }, function (data) {
                    console.log("Error: ", data.error);
                });
//        }
        return false;
    };
    $scope.updateBoardName = function (value) {
//        if ($scope.email && $scope.password) {
            connect.updateBoardName({email: value.email, _id: value._id, createdUrl: value.createdUrl, boardName: value.name, created_at: value.created_at},
                function (data) {
                    value.name = data.boardName;
                    // Change path and handle success
                }, function (data) {
                    console.log("Error: ", data.error);
                });
//        }
        return false;
    };
    $scope.deleteBoard = function (value) {
//        if ($scope.email && $scope.password) {
            $scope.board = value;
            connect.deleteBoard({_id: value._id, board: value},
                function (data) {
                    var index = $scope.ownedBoards.indexOf($scope.board);
                    if(index!=-1){
                        $scope.ownedBoards.splice(index, 1);
                    }
                    // Change path and handle success
                }, function (data) {
                    console.log("Error: ", data.error);
                });
//        }
        return false;
    };
    $scope.shareBoard = function () {
        if ($scope.email && $scope.password) {
            connect.shareBoard({email: $scope.email, id: $scope.boardId, boardName: $scope.boardName},
                function (data) {
                    $scope.email = data.email;
                    $scope.boardId = data.id;
                    $scope.boardName = data.boardName;
                    // Change path and handle success
                }, function (data) {
                    console.log("Error: ", data.error);
                });
        }
        return false;
    };
    $scope.islogged = function () {
        connect.authenticate({email: null, password: $scope.password},
            function (data) {
                $scope.userName = data.user;
                $scope.email = data.email;
                $scope.createdNum = data.createdNum == null? 0 : data.createdNum;
                $scope.sharedNum = data.sharedNum == null? 0 : data.sharedNum;
                // Change path and handle success
                $scope.sharedBoards = data.sharedBoards;
                $scope.ownedBoards = data.ownedBoards;
            }, function (data) {
                console.log("Error: ", data.error);
            });
    };
    $scope.logoutUser = function () {
        connect.logout({},
            function (data) {
                $scope.userName = undefined;
                $scope.createdNum = undefined;
                $scope.sharedNum = undefined;
            }, function (data) {
                console.log("Error: ", data.error);
            });
    };

    $scope.setEnglishLanguage = function () {
        localize.setLanguage('en-US');
    };

    $scope.setPigLatinLanguage = function () {
        localize.setLanguage('es-es');
    };
}

ApplicationController.$inject = [
    "$scope",
    "$location",
    "connect",
    "localize"
];