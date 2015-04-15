renderProgressBar = function(eventStart){
  var currentTime = moment();

  $('.timer').countdown({  
    start_time: currentTime, //Time when the progress bar is at 0%
      end_time: eventStart, //Time Progress bar is at 100% and timer runs out
      progress: $('.progress-bar'), //There dom element which should display the progressbar.
      onComplete: function() {
            $('.timer').show();
                  $('.timer').replaceWith("<div class=\"timer ended\">Time's Up!</div>");
      }    
  });
}

// Render a location image
renderLocationImage = function(eventLocation, eventActivity, eventCreator) {

  $('#locationImage').append(LOCATION_IMAGES[eventLocation.toLowerCase()]);
  $('#locationText').append(eventLocation);

  // Check if the event activity has an icon, otherwise it is a description and use GET_ACTIVITY
  if (ACTIVITY_IMAGES[eventActivity.toLowerCase()]) {
    $('#activityImage').append(ACTIVITY_IMAGES[eventActivity.toLowerCase()]);
  } else {
    $('#activityImage').append(GET_ACTIVITY(eventActivity));
  }

  $('#activityText').append(eventActivity);

  if (eventCreator) {
    $('#creatorImage').append(CREATOR_IMAGES[eventCreator]);
    $('#creatorText').append(eventCreator);
  }
}

// Render the grove calendar.
renderGroveCalendar = function(numEvents, userData) {
   $.get('/api/grove/' + userData.id, function(calendar) {
      var nextEventIndex = _.findIndex(calendar, function(event) {
        return !event.checkedIn;
      });

      // If there's not a next event, then the student has finished their calendar, in which case uncheck all events and start at the top
      if (nextEventIndex === -1) {
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
      
      var nextEvent = calendar[nextEventIndex];

      renderLocationImage(nextEvent.location, nextEvent.activity);
  });
}

function getCalendar(userData){

  // Start and end times for calendar
  var start = moment().startOf('day').toISOString();
  var end = moment().endOf('day').toISOString();

  //get users google calendar events starting with today
  gapi.client.request('https://www.googleapis.com/calendar/v3/calendars/' + userData.email + '/events/?singleEvents=true&timeMin=' + start + '&timeMax=' + end + '&orderBy=startTime').execute(function(response) {

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
              description: event.description,
              summary: event.summary
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
        var nextEvent = _.find(events, function(event){
          var a = currentTime;
          var b = moment(event.start);
          var difference = b.diff(a, 'minutes');
          return (difference <= 10 && difference > 0);
        });

        // Check to see if there's an event currently happening that the student is late for or is checking into the app before the event is done
        var currentEvent = _.find(events, function(event) {
          return moment(currentTime).isBetween(event.start, event.end);
        });

        //if a current event is found, show location, teacher, and activity. 
        if (currentEvent) {
          // Render location for current event
          renderLocationImage(currentEvent.location, currentEvent.summary, currentEvent.creator);
        } 
        // If there's not a current event, show the next event
        else if (nextEvent) {

          //pass event start time to renderProgressBar
          renderProgressBar(nextEvent.start);

          renderLocationImage(nextEvent.location, nextEvent.summary, nextEvent.creator);
        }
        // If nothing came back from the google calendar, render the next grove calendar event
        else {
          // Get the next start time based on clock and EVENT_LENGTH
          var intervals = 60 / (EVENT_LENGTH / (60 * 1000)) + 1;
          var start_times = [];
          for (var i =0; i < intervals; i++) {
            start_times.push(moment().startOf('hour').add(i * EVENT_LENGTH, 'ms'));
          }
          // Event starts at the first start time after this check-in
          var event_start = _.find(start_times, function(t) {
            return t.isAfter(moment());
          });

          renderProgressBar(event_start);
          renderGroveCalendar(1, userData);
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

      $('#name').append('<h2>' + response.displayName + '\'s Next Step</h2>');
      
      //add google id to scan href/link. that way when scan returns scanned_data we have the users id
      $('#scan-button').attr('href', 'scan://scan?callback=https%3A%2F%2Froots-elementary.herokuapp.com/scanredirect/'+response.id);

      // add google id to student schedule href
      $('#schedule-button').attr('href', '/student-full-schedule/'+response.id).show();

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