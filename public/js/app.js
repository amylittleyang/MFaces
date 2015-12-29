var app = angular.module('meanMapApp' , ['addCtrl','geolocation','gservice','ngRoute','queryCtrl'])
    .config(function($routeProvider){
       // Join Team Control Panel
        $routeProvider.when('/join',{
            controller:'addCtrl',
            templateUrl:'partials/addForm.html',
        }).when('/find',{
            controller:'queryCtrl',
            templateUrl: 'partials/queryForm.html',
        }).otherwise({redirectTo:'/join'})
    });

