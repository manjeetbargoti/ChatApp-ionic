
angular.module('starter', ['ionic', 'btford.socket-io', 'ngSanitize', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})


// Configuration & Routing of Login & Chat Page
.config(function($stateProvider, $urlRouterProvider)
{
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html'
    })

    .state('chat', {
      url: '/chat/:nickname',
      templateUrl: 'templates/chat.html'
    });

    $urlRouterProvider.otherwise('login');
})

.factory('Socket', function (socketFactory) {
  var myIoSocket = io.connect('http://localhost:9090');

  mySocket = socketFactory({
    ioSocket: myIoSocket
  });

  return mySocket;
})


// Enter Button functionality
.directive('ngEnter', function()
{
  return function(scope, element, attrs)
  {
    element.bind("keydown keypress", function(event)
    {
      if(event.which === 13) // 13 is equal to Enter in ASCII
      {
        scope.$apply(function()
        {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  }
})

// LoginController for Login
.controller('LoginController', function($scope, $state)
{

  $scope.join = function(nickname)
  {
    if(nickname)
    {
      $state.go('chat', {nickname: nickname});
    }
  }

})


// ChatController for Chat Functionality
.controller('ChatController', function($scope, $stateParams, Socket, $ionicScrollDelegate, $sce, $cordovaMedia)
{

  $scope.messages = [];

  $scope.nickname = $stateParams.nickname;

  var COLORS = ['#F44336', '#E91E63', '#9C27B0', '#673AB4', '#3F51B5', '#009688'];

  Socket.on("connect", function(){
    $scope.socketId = this.id;

    var data = {
                  message: $scope.nickname + " has joined the Chat!", 
                  sender: $scope.nickname, 
                  socketId: $scope.socketId,
                  isLog: true,
                  color: $scope.getUsernameColor($scope.nickname)
                };

    Socket.emit("Message", data);
  });

  Socket.on("Message", function(data){

    data.message = fillWithEmoticons(data.message);
    data.message = $sce.trustAsHtml(data.message);

    $scope.messages.push(data);

    if($scope.socketId == data.socketId)
      playAudio("audio/outgoing.mp3");
    else
      playAudio("audio/incoming.mp3");

    $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(true);
  })

  var playAudio = function(src)
  {
    if(ionic.Platform.isAndroid() || ionic.Platform.isIOS())
    {
      var newUrl = '';
      if(ionic.Platform.isAndroid())
      {
        newUrl = "/android_asset/www/" + src;
      }
      else

        newUrl = src;

      var media = new Media(newUrl, null, null, null);
      media.play();
    }
    else
    {
      new Audio(src).play();
    }
  }

  $scope.sendMessage = function(){

    if($scope.message.length == 0)
      return;

    var newMessage = {sender:'', message:'', socketId:'', isLog:'', color:''};
    newMessage.sender = $scope.nickname;
    newMessage.message = $scope.message;
    newMessage.socketId = $scope.socketId;
    newMessage.isLog = false;
    newMessage.color = $scope.getUsernameColor($scope.nickname);

    Socket.emit("Message", newMessage);

    $scope.message = '';
  }


  var fillWithEmoticons = function(message)
  {
    message = message.replace(/\:\)/g, "<img src='img/emoticons/happy.png' width='20px' height='20px'>");
    return message;
  }

  $scope.getUsernameColor = function(username)
  {
    var hash = 7;

    for(var i=0; i<username.length; i++)
    {
      hash = username.charCodeAt(i)+ (hash<<5) - hash;
    }

    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

})
