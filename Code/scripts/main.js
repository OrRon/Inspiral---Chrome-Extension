(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','scripts/ga.js','ga');




var app = angular.module('extention',['ngRoute']);

app.config(function($routeProvider){


    $routeProvider
        .when('/',{
            templateUrl: "main.html",
            controller: "MainController"
        })
        .otherwise({
            redirectTo: '/'
        })
})

app.factory('champions', function($http){

       return {
           getChampions: function() {
               return $http.get('https://api.500px.com/v1/photos?feature=popular&consumer_key=2CaTgmY7w3MTyUQNFnMx7NF1MTw5pm5hmEOLEpCv&image_size=5&rpp=100');
               //return $http.get('https://api.500px.com/v1/photos/search?term=monkey&consumer_key=2CaTgmY7w3MTyUQNFnMx7NF1MTw5pm5hmEOLEpCv&image_size=5&rpp=100sort=times_viewed');
           },
           addUser: function(user) {
            return $http({
                method: 'POST',
                url: 'https://api.parse.com/1/classes/newusers',
                data: user,
                headers: {
                    'X-Parse-Application-Id': 'J8juSeskSp5Sf59peOl7axRdv5ZMXMhpqVE3BeFT',
                    'X-Parse-REST-API-Key': 'uMAEXZe8oewE7gWks6oi65pBfka7llh5ozjgGH4t'
                }})
           },
           saveTopSites: function(data) {
            return $http({
                method: 'POST',
                url: 'https://api.parse.com/1/classes/topsites',
                data: data,
                headers: {
                    'X-Parse-Application-Id': 'J8juSeskSp5Sf59peOl7axRdv5ZMXMhpqVE3BeFT',
                    'X-Parse-REST-API-Key': 'uMAEXZe8oewE7gWks6oi65pBfka7llh5ozjgGH4t'
                }})
           },
           incTabOpened: function(userID) {
            return $http({
                method: 'PUT',
                url: 'https://api.parse.com/1/classes/newusers/'+userID,
                data: {"count":{"__op":"Increment","amount":1}},
                headers: {
                    'X-Parse-Application-Id': 'J8juSeskSp5Sf59peOl7axRdv5ZMXMhpqVE3BeFT',
                    'X-Parse-REST-API-Key': 'uMAEXZe8oewE7gWks6oi65pBfka7llh5ozjgGH4t'
                }})
           }

       }

})


app.controller('MainController', function($scope,$timeout,champions){


    //VAR
    var MAX_RESULTS = 100;
    var TIME_TO_UPDATE = 60 //in minutes


    //METHODS
    $scope.onTimeout = function(){
        var d = new Date();
        $scope.n = d.getTime();
        mytimeout = $timeout($scope.onTimeout,1000);
    }
    
    $scope.openTab = function(image_id) {
        chrome.tabs.create({url: "http://500px.com/photo/"+image_id});
    }

    $scope.udid = function guid() {
                      function s4() {
                        return Math.floor((1 + Math.random()) * 0x10000)
                                   .toString(16)
                                   .substring(1);
                      }
                      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                             s4() + '-' + s4() + s4() + s4();
                    }

    
    var d = new Date();
    $scope.n = d.getTime();

    var curr_hour = d.getHours();
    var curr_time = curr_hour + ":" + '00';

    var morning_limit = '11:00';
    var night_limit = '19:00';
    $scope.message = "Have a good day";
    if (morning_limit >= curr_time) {
      $scope.message = "Have a good morning";
    }  
    if (night_limit >= curr_time && curr_time > morning_limit) {
      $scope.message = "Have a good day";
    }
    if (night_limit < curr_time && curr_time ) {
      $scope.message = "Have a good night";
    }





    $timeout($scope.onTimeout,1000);


    //check last time updated
    var lastUpdate = (d.getTime() - localStorage.getItem("lastUpdate") ) / (1000*60);
    console.log(lastUpdate);


    //Call the 500px API
    if (localStorage.getItem("results") == null ) {
        
        champions.getChampions()
        .success(function(data){
            localStorage.setItem("lastUpdate",d.getTime());
            localStorage.setItem("results",JSON.stringify(data.photos));
            $scope.data = data.photos;
            $scope.pic = data.photos[Math.floor(Math.random()*MAX_RESULTS)]
            

        })
    }
    else
    {
            var photos = JSON.parse(localStorage.getItem("results"));
            $scope.data = photos;
            $scope.pic = photos[Math.floor(Math.random()*MAX_RESULTS)]
            console.log(photos[0])
            if (lastUpdate > TIME_TO_UPDATE) 
            {
                //updating
                champions.getChampions()
                    .success(function(data){
                        localStorage.setItem("lastUpdate",d.getTime());
                        localStorage.setItem("results",JSON.stringify(data.photos));
                        console.log("done");
                    })
                console.log("updating");
            }
    }
   

    

    //check if new user
    if (localStorage.getItem("userID") == null )
    {
        
        champions.addUser({count: 1})
            .success( function(data) {
                if (data.objectId) {
                    localStorage.setItem("userID",data.objectId);
                }
            })
    } else {
        champions.incTabOpened(localStorage.getItem("userID"))
    }

    // chrome.topSites.get(function(sites) {
    //     champions.saveTopSites({udid: localStorage.getItem("userID"), topsites: sites});
    // })

})
