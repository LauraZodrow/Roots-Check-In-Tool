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

// Render a location image
renderLocationImage = function(eventLocation, eventActivity, eventCreator, order) {

  if (eventLocation == 'Library'){
    // TODO:  add images for all locations, with keys that are the name of the location
    var locationImages = {
      library: '<img class="location-image" src="/img/blue-triangle.png" width="70px">'
    };

    // TODO: add images for all activities, with keys that are the name of the activity
    var activityImages = {
      pencil: '<i class="activity-image fa fa-pencil fa-4x">'
    }

    $('#locationImage' + order).append(locationImages[eventLocation.toLowerCase()]);
    $('#locationText' + order).append(eventLocation);

    $('#activityImage' + order).append(activityImages[eventActivity.toLowerCase()]);
    $('#activityText' + order).append(eventActivity);
  }

  // TODO: chnage this to use the eventCreator
  if (eventCreator == 'team@rootselementary.org') {
    $('#creatorImage').append("<img src='/img/jill-image.jpg' width='70px'>");
    $('#creatorText').append('Jill Carty')
  }
}

// Render the grove calendar. If three events need to be rendered, render the first as the "main event"
renderGroveCalendar = function(numEvents) {
   $.get('/api/grove/' + userData.id, function(calendar) {
      var nextEventIndex = _.findIndex(calendar, function(event) {
        return !event.checkedIn;
      });
      // If there's not a next event, then the student has finished their calendar, in which case uncheck all events and start at the top
      if (!nextEventIndex) {
        nextEventIndex = 0;
        calendar = _.map(calendar, function(e) {
          e.checkedIn = false;
          return e;
        });

        // Save the new calendar
        $.ajax('/api/grove/' + userData.id, {
          method: 'PUT',
          data: JSON.stringify({calendar: calendar}),
          contentType: 'application/json',
          success: function() {
            // TODO
          },
          error: function(xhr, text, error) {
            // TODO
          }
        });
      }

      // Get next two events
      var nextEvent = calendar[nextEventIndex];
      var nexterEvent = calendar[(nextEventIndex + 1) % calendar.length];

      if (numEvents === 3) {
        $('#event').append($('<h3>' + calendar[nextEventIndex].location + '</h3>'));
        renderLocationImage(nextEvent.location, nextEvent.activity, null, 0);
        renderLocationImage(nexterEvent.location, nexterEvent.activity, null, 1);

        // Get third event
        var nextestEvent = calendar[(nextEventIndex + 2) % calendar.length];
        renderLocationImage(nextestEvent.location, nextestEvent.activity, null, 2)
      } else {
        renderLocationImage(nextEvent.location, nextEvent.activity, null, 1);
        renderLocationImage(nexterEvent.location, nexterEvent.activity, null, 2);
      }
      //pass event location and widget image to render correct image

      // Now render the other one / two events as coming up
      
      if 
      renderNext(calendar[]);
}

function getCalendar(userData){
  //get users google calendar events
  gapi.client.request('https://www.googleapis.com/calendar/v3/calendars/' + userData.email + '/events/').execute(function(response) {

        var currentTime = moment();

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
            };
        });

        //push all events objects in users calendar
        userData.calendar = events;

        //send user data with calendar events to backend, and save to database
        $.ajax ({
          type: "POST",
          url: 'api/user',
          data: JSON.stringify(userData),
          contentType: 'application/json'
        });
        
        //loop through all events to find one that is 10 minutes away
        var nextEvent = _.find(response.items, function(event){
          var a = currentTime;
          var b = moment(event.start.dateTime);
          var difference = b.diff(a, 'minutes');
          return (difference <= 10 && difference > 0)
        });

        // Check to see if there's an event currently happening that the student is late for or is checking into the app before the event is done
        var currentEvent = _.find(events, function(event) {
          return moment(currentTime).isBetween(event.start, event.end);
        });

        //if a current event is found, show location, teacher, and activity. 
        if (currentEvent) {
          $('#event').prepend($('<h3 class="current-event"> You have an event at: ' + currentEvent.location + '. Please check back later.</h3>'));
          
          // Render location for current event
          // TODO: Pass in the correct activity
          var activity = null; // Do something with nextEvent.description?
          renderLocationImage(currentEvent.location, activity, currentEvent.creator, 0);

          // Render grove calendar with two events
          renderGroveCalendar(2);
        } 
        // If there's not a current event, show the next event
        else if (nextEvent) {
          $('#event').prepend($('<h3>' + nextEvent.location + '</h3>'));

          //pass event start time to renderProgressBar
          renderProgressBar(nextEvent.start);

          //pass event location and creator to render correct image
          // TODO: Pass in the correct activity
          var activity = null; // Do something with nextEvent.description?
          renderLocationImage(nextEvent.location, activity , nextEvent.creator, 0);

          // Render the grove calendar with next two events
          renderGroveCalendar(2);
        }
        // If nothing came back from the google calendar, render the next three grove calendar events
        else {
          renderGroveCalendar(3);
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

      $('#name').append('<h2>' + response.displayName + '\'s Next Step</h2>')
      //add google id to scan href/link. that way when scan returns scanned_data we have the users id
      $('#scan-button').attr('href', 'scan://scan?callback=http%3A%2F%2F646ee683.ngrok.com/scanredirect/'+response.id)
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