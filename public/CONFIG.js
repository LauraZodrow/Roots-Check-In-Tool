// Set the event length. 10 minutes * 60 seconds * 1000 ms. 
window.EVENT_LENGTH = 10 * 60 * 1000;

// Transition time between events. 2 minutes * 60s * 1000 ms.
window.TRANSITION_LENGTH = 2 * 60 * 1000;

// Images for the various locations
// TODO:  add images for all locations, with keys that are the name of the location
window.LOCATION_IMAGES = {
  'library': '<img class="location-image" src="/img/blue-triangle.png" style="width:70px">',
  'maker space': '<i class="location-image fa fa-car fa-4x">',
  'tablets': '<i class="location-image fa fa-tablet fa-4x">',
  'red station':'<img class="location-image" src="/img/x.png">',
  'blue station': '<img class="location-image" src="/img/circle.png">',
  'green station': '<img class="location-image" src="/img/triangle.png">'
};

// Images for the various activity / descriptions
// TODO: add images for all activities, with keys that are the name of the activity
window.ACTIVITY_IMAGES = {
  'blocks': '<img class="activity-image" src="/img/blocks.png">',
  'level reading': '<i class="activity-image fa fa-pencil fa-4x">',
  'razkids': '<i class="activity-image fa fa-star fa-4x">',
  'st math': '<i class="activity-image fa fa-plus-square fa-4x">',
  'coloring': '<img class="activity-image" src="/img/crayon_green.png">',
  'mask': '<img class="activity-image" src="/img/masks.png">'

};

// Images for event creator
window.CREATOR_IMAGES = {
	'team@rootselementary.org': '<img src="/img/jill-image.jpg" class="creator-image">'
}

// The list of all possible grove calendar activities
window.GROVE_ACTIVITIES = {
	'Library': ['Level Reading', 'Buddy Reading'],
	'Maker Space': ['Blocks', 'Legos'],
	'Tablets': ['ST Math', 'RazKids']
};

// Getting activity from google descriptions
window.GET_ACTIVITY = function(description) {
	
	// Lower case description to ignore case on keywords 
	description = description.toLowerCase();

	// If 'read' shows up in description
	if (description.match('read')) {
		return '<i class="activity-image fa fa-book fa-4x">';
	}
	
	// For all of our predefined activities, if the name of the activity is in the summary somewhere, use that image
	Object.keys(ACTIVITY_IMAGES).forEach( function(activity) {
		if(description.match(activity)) {
			return ACTIVITY_IMAGES[activity];
		}
	});
}