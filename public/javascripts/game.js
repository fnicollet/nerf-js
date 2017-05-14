var app = angular.module('GameApp', []);

app.controller('GameCtrl', function($scope, $http) {
    $scope.game = null;
    $scope.gameInit = false;
    $scope.gameState = 0;
    $scope.reloadGameInterval = null;
    $scope.PING_INTERVAL = 300;
    $scope.message = null;
    $scope.initTimeout = null;
    $scope.debug = window.location.href.indexOf("debug") != -1;

    $scope.onRoundStarted = function(){
        $scope.gameInit = false;
        $scope.message = "...Get Ready...";
        var message = "Get ready, bitches";
        $http.get('/game/say?message=' + encodeURIComponent(message)).then(function(response) {
        });
        $scope.reloadGameInterval = setInterval(function(){
            $scope.reloadGame();
        }, $scope.PING_INTERVAL);
        var waitTime = $scope.debug ? 3000 : 3000 + Math.random() * 10000;
            if ($scope.initTimeout != null){
                clearTimeout($scope.initTimeout);
            }
            $scope.initTimeout = setTimeout(() => {
                $http.get(`/game/init?id=${$scope.game.id}`);
            $scope.gameInit = true;
            $scope.message = "FIRE!";
        }, waitTime);
    };

    $scope.gameFinished = function(){
        $scope.gameInit = false;
        $scope.gameState = 2;
    };
    $scope.reloadGame = function(){
        $http.get('/game/load?id=' + $scope.game.id).then(function(response) {
            $scope.game = response.data;
            var hasAnyDraw = $scope.game.player1Drawn === true || $scope.game.player2Drawn === true;
            var drawBefore = !$scope.gameInit && hasAnyDraw;
            var touched = $scope.game.hasOwnProperty("player1") || $scope.game.hasOwnProperty("player2");
            if (drawBefore || touched){
                if ($scope.initTimeout != null){
                    clearTimeout($scope.initTimeout);
                    $scope.initTimeout = null;
                    $http.get(`/game/init?id=${$scope.game.id}`);
                }
                $scope.gameFinished();
            }
        });
    };
    $scope.stopPlayer = function(player){
        $http.get('/game/stop?player=' + player).then(function(response) {
        });
    };
    $scope.calibratePlayer = player => $http.get(`/calibrate/player${player}`);
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