var app = angular.module('GameApp', []);

app.controller('GameCtrl', function($scope, $http) {
    $scope.game = null;
    $scope.gameState = 0;
    $scope.reloadGameInterval = null;
    $scope.PING_INTERVAL = 100;

    $scope.onRoundStarted = function(){
        var message = "Get ready, bitches";
        $http.get('/game/say?message=' + encodeURIComponent(message)).then(function(response) {
        });
        $scope.reloadGameInterval = setInterval(function(){
            $scope.reloadGame();
        }, $scope.PING_INTERVAL);
    };

    $scope.gameFinished = function(){
        $scope.gameState = 2;
    };
    $scope.reloadGame = function(){
        $http.get('/game/load?id=' + $scope.game.id).then(function(response) {
            $scope.game = response.data;
            if ($scope.game.hasOwnProperty("player1") || $scope.game.hasOwnProperty("player2")){
                $scope.gameFinished();
            }
        });
    };
    $scope.stopPlayer = function(player){
        $http.get('/game/stop?player=' + player).then(function(response) {
        });
    };
    $scope.startGame = function(){
        $http.get('/game/start?id=' + $scope.gameId).then(function(response) {
            $scope.game = response.data;
            $scope.gameState = 1;
            $scope.onRoundStarted();
        });
    };
    $scope.nextRound = function(){
        clearInterval($scope.reloadGameInterval);
        $scope.reloadGameInterval = null;
        $http.get('/game/nextRound').then(function(response) {
            $scope.game = response.data;
            $scope.gameState = 1;
            $scope.onRoundStarted();
        });
    };

});