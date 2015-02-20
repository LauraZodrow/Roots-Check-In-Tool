renderProgressBar = function(eventStart){
  var currentTime = moment().format();

  $('.timer').countdown({  
    start_time: currentTime, //Time when the progress bar is at 0%
      end_time: eventStart.dateTime, //Time Progress bar is at 100% and timer runs out
      progress: $('.progress-bar'), //There dom element which should display the progressbar.
      onComplete: function() {
            $('.timer').show();
                  $('.timer').replaceWith("<div class=\"timer ended\">Time's Up!</div>");
      }    
  });
}

renderLocationImage = function(eventLocation, eventCreator) {

  if (eventLocation == 'Library'){
    var libraryImg = $("<img src='/img/blue-triangle.png' width='70px'>")
    var pencilImg = $("<i class='fa fa-pencil fa-4x'>")

    $('.locationImage').append(libraryImg);
    $('.locationText').append('Library');

    $('.activityImage').append(pencilImg);
    $('.activityText').append('Writing');
  }

  if (eventCreator == 'team@rootselementary.org') {
    $('.creatorImage').append("<img src='/img/jill-image.jpg' width='70px'>");
    $('.creatorText').append('Jill Carty')
  }

}


function getCalendar(userData){
  //get users google calendar events
  gapi.client.request('https://www.googleapis.com/calendar/v3/calendars/' + userData.email + '/events/').execute(function(response) {

        var currentTime = moment().format()

        //loop through all events in user's google calendar
        var events = _.map(response.items, function(event){

          //return events in this format
          return {
              eventId: event.id,
              location: event.location,
              creator: event.creator.email,
              start: event.start.dateTime,
              end: event.end.dateTime,
              description: event.description
            }
        });

        //push all events objects in users calendar
        userData.calendar = events;


        var dataString = JSON.stringify(userData);
        console.log('userData', userData)

        //send user data with calendar events to backend, and save to database
        $.ajax ({
          type: "POST",
          url: 'api/saveUser',
          data: dataString,
          contentType: 'application/json',
          success: function(err, results){
            console.log('results', results)
          }
        });
        
        //loop through all events to find one that is 10 minutes away
        var nextEvent = _.find(response.items, function(event){
          var a = moment(currentTime);
          var b = moment(event.start.dateTime);
          var difference = b.diff(a, 'minutes');
          return (difference <= 10 && difference > 0)
        });

        //if one is found show location, teacher, and activity. else eventually show grove calendar
        if (nextEvent) {

          $('#event').prepend($('<h3>' + nextEvent.location + '</h3>'));
          //pass event start time to renderProgressBar
          renderProgressBar(nextEvent.start);
          //pass event location and creator to render correct image
          renderLocationImage(nextEvent.location, nextEvent.creator);

        } 
        else {
          $('#groveCalendar').append($('<h3>Grove Calendar Will Go Here</h3>'));
        }
  });
}


function signinCallback(authResult) {
  if (authResult['status']['signed_in']) {
    // Update the app to reflect a signed in user
    // Hide the sign-in button now that the user is authorized, for example:
    document.getElementById('signinButton').setAttribute('style', 'display: none');

    //make call to google profile for users account information
    gapi.client.request('https://www.googleapis.com/plus/v1/people/me?fields=name(familyName%2Cformatted%2CgivenName)%2CdisplayName%2Cemails%2Fvalue%2Cimage%2Furl%2Cid').execute(function(response) {

      var signInData = {
        id: response.id,
        name: response.displayName,
        email: response.emails[0].value,
        image: response.image.url
      }

      //add google id to scan href/link. that way when scan returns scanned_data we have the users id
      $('#scan-button').attr('href', 'scan://scan?callback=http%3A%2F%2F4376acff.ngrok.com/'+response.id)

      //get calendar events on signIn and send events/user to database in function above
      getCalendar(signInData);
  });
  } else {
    // Update the app to reflect a signed out user
    // Possible error values:
    //   "user_signed_out" - User is signed-out
    //   "access_denied" - User denied access to your app
    //   "immediate_failed" - Could not automatically log in the user
    console.log('Sign-in state: ' + authResult['error']);
  }
}