// queryCtrl.js

//Creates the addCtrl Module and Controller. Note that it depends on 'geolocation' and 'gservice' modules.
var queryCtrl = angular.module('queryCtrl',['geolocation','gservice']);
queryCtrl.controller('queryCtrl',function($scope, $log, $http, $rootScope, geolocation, gservice){
    // Initialize variables
    $scope.formData = {};
    var queryBody = {};
    var coords = [];
    // Get User's actual coordinates based on HTML5 at window load
    geolocation.getLocation().then(function(data){
        coords = {lat: data.coords.latitude, long: data.coords.longitude};
        $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
        $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);
        gservice.refresh($scope.formData.latitude, $scope.formData.longitude);
    });
    
    $rootScope.$on("clicked",function(){
        $scope.$apply(function(){
             // Run the gservice functions associated with identifying coordinates
            $scope.formData.latitude = parseFloat(gservice.clickLat).toFixed(3);
            $scope.formData.longitude = parseFloat(gservice.clickLong).toFixed(3);
        });
      
    });


    // Take query parameters and incorporate into a JSON query body
    $scope.queryUsers = function(){
      // Assembly Query Body
        var queryBody = {
            longitude: parseFloat($scope.formData.longitude),
            latitude: parseFloat($scope.formData.latitude),
            distance: parseFloat($scope.formData.distance),
            male: $scope.formData.male,
            female: $scope.formData.female,
            other: $scope.formData.other,
            minAge: $scope.formData.minage,
            maxAge: $scope.formData.maxage,
            favlang: $scope.formData.favlang,
            reqVerified: $scope.formData.verified
        };
        // Post the queryBody to the /query POST route to retrieve the filtered results
        $http.post('/query',queryBody)
        // Store the filtered results in queryResults
            .success(function(queryResults){
                // Query body and result logging
                gservice.refresh(queryBody.latitude,queryBody.longitude, queryResults);
                // Count the number of records retrieved for the panel-footer
                $scope.queryCount = queryResults.length;
        })
            .error(function(queryResults){
                console.log("Error"+ queryResults);
        })
    };
});