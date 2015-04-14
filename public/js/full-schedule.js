
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
renderGroveLocationImage = function(eventLocation, eventActivity, order) {

  // Location
  $('#locationImage' + order).append(LOCATION_IMAGES[eventLocation.toLowerCase()]);
  $('#locationText' + order).append(eventLocation);

  // Activity
  $('#activityImage' + order).append(ACTIVITY_IMAGES[eventActivity.toLowerCase()]);
  $('#activityText' + order).append(eventActivity);
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

  // Get next three events
  var nextEvent = calendar[nextEventIndex];
  var nexterEvent = calendar[(nextEventIndex + 1) % calendar.length];
  var nextestEvent = calendar[(nextEventIndex + 2) % calendar.length];
  
  renderGroveLocationImage(nextEvent.location, nextEvent.activity, 1);
  renderGroveLocationImage(nexterEvent.location, nexterEvent.activity, 2);
  renderGroveLocationImage(nextestEvent.location, nextestEvent.activity, 3)
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

$(function() {

  var id = _.last(window.location.pathname.split('/'))
  // Get the user info
  $.get('/api/user/' + id, function(student) {
    renderGroveCalendar(student.groveCalendar);
    renderGoogleCalendar(student.calendar);
  });
});