// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('gservice', [])
    .factory('gservice', function($http,$rootScope){

        // Initialize Variables
        // -------------------------------------------------------------
        // Service our factory will return
        var googleMapService = {};

        // Array of locations obtained from API calls
        var locations = [];

        // Selected Location (initialize to center of America)
        var selectedLat = 39.50;
        var selectedLong = -98.35;

        // Functions
        // --------------------------------------------------------------
        // Refresh the Map with new data. Function will take new latitude and longitude coordinates.
        googleMapService.refresh = function(latitude, longitude, filteredResultes){

            // Clears the holding array of locations
            locations = [];

            // Set the selected lat and long equal to the ones provided on the refresh() call
            selectedLat = latitude;
            selectedLong = longitude;
            
            if(filteredResultes){
                locations = convertToMapPoints(filteredResultes);
                initialize(latitude,longitude,true);
            }else{
                $http.get('/users').success(function(response){
                    // Convert the results into Google Map Format
                    locations = convertToMapPoints(response);

                    // Then initialize the map.
                    initialize(latitude, longitude, false);
                }).error(function(){});
            }
        };

        // Private Inner Functions
        // --------------------------------------------------------------
        // Convert a JSON of users into map points
        var convertToMapPoints = function(response){

            // Clear the locations holder
            var locations = [];

            // Loop through all of the JSON entries provided in the response
            for(var i= 0; i < response.length; i++) {
                var user = response[i];
                if(user.avatar===undefined){
                    if(user.gender==="Male"){
                    user.avatar = "https://cdn4.iconfinder.com/data/icons/rounded-avatars/512/hockey-mask-face-avatar-round-128.png";
                    }else{
                        user.avatar="http://png.clipart.me/graphics/thumbs/170/cartoon-girl-icon-avatar-portrait-illustration-series_170660654.jpg";
                    }
                }
                // Create popup windows for each record
                var  contentString =
                    '<img src="'+user.avatar+'"width="80" height="80">'+'<br>'+'<br>'+
                    '<p><b>Name</b>: ' + user.username +
                    '<br><b>Age</b>: ' + user.age +
                    '<br><b>Gender</b>: ' + user.gender +
                    '<br><b>' + user.question +'</b>'+
                    '<br>' + user.answer+
                    '</p>';
                

                // Converts each of the JSON records into Google Maps Location format (Note [Lat, Lng] format).
                locations.push({
                    latlon: new google.maps.LatLng(user.location[1], user.location[0]),
                    message: new google.maps.InfoWindow({
                        content: contentString,
                        maxWidth: 320
                    }),
                    username: user.username,
                    question: user.question,
                    gender: user.gender,
                    age: user.age,
                    feeling:user.feeling,
                    answer: user.favlang
            });
        }
        // location is now an array populated with records in Google Maps format
        return locations;
    };

// Initializes the map
var initialize = function(latitude, longitude, filter) {

    // Uses the selected lat, long as starting point
    var myLatLng = {lat: selectedLat, lng: selectedLong};

    // If map has not been created already...
    if (!map){

        // Create a new map and place in the index.html page
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 3,
            center: myLatLng
        });
    }
    // If a filter was used set the icons yellow, otherwise blue
    if(filter){
        icon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
    }else{
        icon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
    }

    // Loop through each location in the array and place a marker
    locations.forEach(function(n, i){
        var marker = new google.maps.Marker({
            position: n.latlon,
            map: map,
            title: "Big Map",
            icon: icon,
        });
        if(n.feeling==="superman"){
            marker.icon="http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
        }
        else if(n.feeling==="exhausted"){
            marker.icon="http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
        }
        else if(n.feeling==="sad"){
            marker.icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png";
        }
        else{
            marker.icon="http://maps.google.com/mapfiles/ms/icons/purple-dot.png";
        }
        // For each marker created, add a listener that checks for clicks
        google.maps.event.addListener(marker, 'click', function(e){

            // When clicked, open the selected marker's message
            currentSelectedMarker = n;
            n.message.open(map, marker);
        });
    });

    // Set initial location as a bouncing red marker
    var initialLocation = new google.maps.LatLng(latitude, longitude);
    var marker = new google.maps.Marker({
        position: initialLocation,
        animation: google.maps.Animation.BOUNCE,
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });
    lastMarker = marker;
    
    // Function for moving to a selected location
    map.panTo(new google.maps.LatLng(latitude, longitude));
    
    // Clicking on the Map moves the bouncing red marker
    google.maps.event.addListener(map,'click',function(e){
       var marker = new google.maps.Marker({
           position: e.latLng,
           animation: google.maps.Animation.BOUNCE,
           map: map,
           icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
       });
        // When a new spot is selected, delete the old red bouncing marker
        if(lastMarker){
            lastMarker.setMap(null);
        }
        // Create a new red bouncing marker and move to it
        lastMarker = marker;
        map.panTo(marker.position);
        
        // Update Broadcasted Variable (lets the panels know to change their lat, long values)
        googleMapService.clickLat = marker.getPosition().lat();
        googleMapService.clickLong = marker.getPosition().lng();
        $rootScope.$broadcast("clicked");
    });

};

// Refresh the page upon window load. Use the initial latitude and longitude
google.maps.event.addDomListener(window, 'load',
    googleMapService.refresh(selectedLat, selectedLong));

return googleMapService;
});
