
renderGoogleLocationImage = function(event) {
  
  // Create the new row
  var newRow = $('<tr></tr>');
  
  // Time cell
  var time = $('<td></td>').append(moment(event.start).format('hh:mm') + ' - ' + moment(event.end).format('hh:mm'));
  
  // Location cell
  var location_image = $('<div></div>').append(LOCATION_IMAGES[event.location.toLowerCase()]);
  var location_description = $('<div></div>').text(event.location);
  var location = $('<td></td>').append(location_image).append(location_description);


  // Activity cell
  if (ACTIVITY_IMAGES[event.description.toLowerCase()]) {
    var activity_image = $('<div></div>').append(ACTIVITY_IMAGES[event.description.toLowerCase()]);
  } else if (event.description) {
    var activity_image = $('<div></div>').append(GET_ACTIVITY(event.description));
  }

  var activity_description = $('<div></div>').text(event.description);
  var activity = $('<td></td>').append(activity_image).append(activity_description);

  // Creator cell
  var creator_image = $('<div></div>').append(CREATOR_IMAGES[event.creator]);
  var creator_description = $('<div></div>').text(event.creator);
  var creator = $('<td></td>').append(creator_image).append(creator_description);

  // Throw it onto the calendar
  newRow.append(time).append(location).append(activity).append(creator).appendTo($('#googleCalendar tbody'));
}

// Render a location image into grove
renderGroveLocationImage = function(event, order) {

  // Location
  $('#locationImage' + order).append(LOCATION_IMAGES[event.location.toLowerCase()]);
  $('#locationText' + order).append(event.location);

  // Activity
  $('#activityImage' + order).append(ACTIVITY_IMAGES[event.activity.toLowerCase()]);
  $('#activityText' + order).append(event.activity);

  // Focus Area
  $('#focusAreaImage' + order).append(FOCUS_AREAS[event.focus_area]);
  $('#focusAreaText' + order).append(event.focus_area);
};

// Render the grove calendar.
renderGroveCalendar = function(calendar) {
  
  var nextEventIndex = _.findIndex(calendar, function(event) {
    return !event.checkedIn;
  });

  // If there's not a next event (all have been checked into), start at the top
  if (nextEventIndex === -1) {
    nextEventIndex = 0;
  }

  // Get next three events, going back to the top if needed
  var nextEvent = calendar[nextEventIndex];
  var nexterEvent = calendar[(nextEventIndex + 1) % calendar.length];
  var nextestEvent = calendar[(nextEventIndex + 2) % calendar.length];
  
  renderGroveLocationImage(nextEvent, 1);
  renderGroveLocationImage(nexterEvent, 2);
  renderGroveLocationImage(nextestEvent, 3);
};

// Render the google calendar
renderGoogleCalendar = function(calendar) {

  // Get start and end times, filter events to get just rest of today's events
  var start = moment();
  var end = moment().endOf('day');

  var events = _.filter(calendar, function(event) {
    return moment(event.start).isBetween(start, end);
  });

  // Render each event
  _.each(events, function(event) {
    renderGoogleLocationImage(event);
  });
};

function signinCallback(authResult) {

  if (authResult['status']['signed_in']) {
    // Update the app to reflect a signed in user
    // Hide the sign-in button now that the user is authorized, for example:
    document.getElementById('signinButton').setAttribute('style', 'display: none');

    //make call to google profile for users account information
    gapi.client.request('https://www.googleapis.com/plus/v1/people/me?fields=name(familyName%2Cformatted%2CgivenName)%2CdisplayName%2Cemails%2Fvalue%2Cimage%2Furl%2Cid').execute(function(response) {


      // Show the calendar container
      $('#calendar-container').show();

      // Get the user info and display the calendars
      $.get('/api/user/' + response.id, function(student) {
        renderGroveCalendar(student.groveCalendar);

        // In case we want to display google calendar in the future...
        // renderGoogleCalendar(student.calendar);
      });


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
