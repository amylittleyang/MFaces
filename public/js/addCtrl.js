var addCtrl = angular.module('addCtrl',['geolocation','gservice']);
addCtrl.controller('addCtrl',function($scope,$http, geolocation,gservice, $rootScope){
   $scope.formData = {};
    var coords = {};
    var lat = 0;
    var long = 0;
    
    // Get User's actual coordinates based on HTML5 at window load
    geolocation.getLocation().then(function(data){
       // Set the latitude and longitude equal to the HTML5 coorinates
        coords = {lat: data.coords.latitude, long: data.coords.longitude};
        // Display coordinates in location textboxes rounded to three decimal points
        $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
        $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);
        
        // Display message confirming that the coordinates verified.
        $scope.formData.htmlverified = "Yep (Thanks for giving us real data)";
        gservice.refresh($scope.formData.latitude, $scope.formData.longitude);
    });
    
    $scope.formData.latitude = 39.500;
    $scope.formData.longitude = -98.350;
    // Get coordinates based on mouse click. When a click event is detected 
    $rootScope.$on("clicked", function(){
       // Run the gservice functions associated with identifying coordinates
        $scope.$apply(function(){
            $scope.formData.latitude = parseFloat(gservice.clickLat).toFixed(3);
            $scope.formData.longitude = parseFloat(gservice.clickLong).toFixed(3);
            $scope.formData.htmlverified = "Nope (Thanks for spamming my map)";
        });
    });
    $scope.createUser = function(){
      var userData = {
          username:$scope.formData.username,
          gender:$scope.formData.gender,
          age:$scope.formData.age,
          favlang:$scope.formData.favlang,
          location:[$scope.formData.longitude, $scope.formData.latitude],
          htmlverified:$scope.formData.htmlverified
      };
    // save user data to db
    var response = $http.post('/users',userData)
        response.success(function(data){
       // Once complete, clear the form (except location) 
        $scope.formData.username = "";
        $scope.formData.gender = "";
        $scope.formData.age="";
        $scope.formData.favlang="";
        
        // Refresh the map with new data
        gservice.refresh($scope.formData.latitude, $scope.formData.longitude);
    });
        response.error(function(data){
           console.log('Error:'+data); 
        });
    };
});