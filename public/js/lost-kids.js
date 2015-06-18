// Globals

var studentsArray = [];
var FILTER = 'All'

// Class of student display
var StudentLocationDisplay = function(student) {
	this.data = _.pick(student, ['_id', 'email','name','image','googleId']);
	
	// Create the DOM element representing the student
	var display = $('<div>').addClass('studentLocationDisplay').addClass('col-md-2').attr('id', student.googleId);
	var container = $('<div>').addClass('nameImageContainer');
	container
		.append('<div class="name">' + student.name + '</div>')
		.append('<div><img class="studentImage" src="' +student.image+'"></div>');
	display.append(container);
	display.append('<div class="studentInfoContainer"></div>')
	this.el = display;

	// Look at the student's recent scan to determine if they are in the correct place or not
	if (student.recentScan) {
		scan = student.recentScan;
		this.recentScan = scan;
		// First, check if the scan is recent (i.e. if that event is still ongoing)
		var recent = false;
		var event = scan.event ? scan.event[0] : undefined;

		// If google event, check against event end
		if (event && event.end && moment(event.end).add(TRANSITION_LENGTH, 'ms').isAfter(moment())) {
			recent = true;
		}
		// If grove calendar, check against length of events
		else if (event && !event.end && moment(scan.time).add(TRANSITION_LENGTH + EVENT_LENGTH, 'ms').isAfter(moment())) {
			recent = true;
		}

		// If the scan is recent
		if (recent) {
			this.moveMe(scan);
		} 
		// If the scan is not recent, student is lost
		else {
			this.status = 'Lost';
			this.currentLocation = 'Lost';
			this.render('Lost');
		}
	} 
	// If there is no recent scan at all, student is lost
	else {
		this.status = 'Lost';
		this.currentLocation = 'Lost';
		this.render('Lost');
	}

};

// Updates student display based on most recent scan / event 
StudentLocationDisplay.prototype.updateDisplay = function() {

	if (this.status === 'Found') {
		var scannedEvent = this.recentScan.event[0];
		var text = _.chain(['location', 'activity', 'focus_area'])
			.map(function(key) {
				return scannedEvent[key];
			})
			.filter()
			.join(' | ')
			.value()

		var info = $('<p>').addClass('last-scan-info').addClass('text-primary').text(text);

		this.el.find('.studentInfoContainer').empty();
		this.el.removeClass('Lost').addClass('Found');
	}
	// If the student is in the wrong location, display the scan information
	else if (this.status === 'Wrong Location') {
		this.el.removeClass('Found').addClass('Lost');

		// Time of the scan, if we want to display this information
		// var time = this.recentScan ? moment(this.recentScan.time).fromNow() : '';

		var info = $('<p>').addClass('last-scan-info').addClass('text-danger').text(this.currentLocation);
		var correction = $('<p>').addClass('text-primary').addClass('correct-location-info').text(this.recentScan.event[0].location);

		this.el.find('.studentInfoContainer').empty().append(info, correction);
	}
	// If the student has not scanned in recently, do not display the last scan information
	else {
		var self = this;

		// Call the API endpoint to get current event without a scan
		$.get('/current-event/' + this.data.googleId, function(result) {
			self.el.removeClass('Found').addClass('Lost');
			var message = $('<em>').addClass('text-muted').text('No Recent Scan.');
			if(result.location) {
				var correction = $('<p>').addClass('correct-location-info').addClass('text-primary').text(result.location);
			} else {
				var correction = $('<p>').addClass('correction-location-info').text('No current event in system.');
			}
			self.el.find('.studentInfoContainer').empty().append(message, correction);
		});
	}
};

StudentLocationDisplay.prototype.render = function() {
	// render into the domnode based on where their location is
	var location;
	if (this.status === 'Found') {
		location = this.currentLocation
	} else {
		location = 'Lost';
	}

	var locationId = location.split(' ').join('');
	this.updateDisplay();
	$('#'+locationId).append(this.el);
};

// Move the student to a new location based on the most recent scan
StudentLocationDisplay.prototype.moveMe = function(scan) {

	var self = this;

	// move from one array to another
	if (this.el) {
		this.el.remove();
	};

	// If this method was triggered by a scan, update the location to the location of the scan. If it was triggered by a timeout, leave the location as is.
	if (scan) {
		this.currentLocation = scan.scannedLocation;
	}

	console.log('scan and correct:', this, scan, scan && scan.correct);

	if (scan && scan.correct) {
		this.status = 'Found';
		// Set a timeout based on the end of the event, and move the student to Lost after the event is over as a placeholder until they scan into another event
		// To check end of event, see whether there is a start and end defined on the event (in which case it came from Google calender) or not (in which case it came from Grove, and we will use the EVENT_LENGTH and TRANSITION_LENGTH config option)
		var now = moment( new Date() );
		if (scan.event.end) {
			var difference = moment(scan.event.end).diff( now );
		}
		else {
			var intervals = 60 / (EVENT_LENGTH / (60 * 1000));
			var end_times = [];
			var hour_start = moment( new Date() ).startOf('hour');

			// Create an array of all end times for this hour
			for (var i =1; i<=intervals; i++) {
				end_times.push( hour_start.add(i * EVENT_LENGTH - TRANSITION_LENGTH, 'ms') );
			}
			console.log('end times:', _.map(end_times, function(t) { return t.format('L');}));
			// Event ends at the first end time after this check-in
			var event_end = _.find(end_times, function(t) {
				return t.isAfter(now);
			});
			// Push student into lost after event ends and transition time has lapsed
			var difference = event_end.add(TRANSITION_LENGTH, 'ms').diff(now);
		}
		console.log('Times:', now.format('L'), hour_start.format('L'), event_end.format('L'), difference);
		this.transitionTimeout = window.setTimeout(function() { self.moveMe() }, difference);
	}
	// If the scan does not match the location, the student is in the wrong location
	else if (scan) {
		this.status = 'Wrong Location';
	}
	// If there is no scan, this method is being triggered by the timeout, meaning the student has not scanned in to anywhere on time and is lost
	else {
		this.status = 'Lost';
		this.currentLocation = 'Lost';
	}

	// Now render
	self.render();
};

// When receiving a scan, find the student that matches the scan, move them to a new location based on the scan and clear any possible transitions
var scanReceived = function(scan) {

	console.log('Scan:', scan);

	var scanStudent = _.find(studentsArray, function(student) {
		return student.data.googleId === scan.googleId;
	});

	console.log('scanStudent:', scanStudent);

	// If a student is found, move the student and override their recent scan
	if (scanStudent) {
		if (scanStudent.transitionTimeout) { window.clearTimeout(scanStudent.transitionTimeout); }
		scanStudent.recentScan = scan;
		// Call the moveMe function, making sure it is bound to the current student
		scanStudent.moveMe.call(scanStudent, scan);
	}
};

$(function(){

	// Load the different button filters and divs
	_.keys(LOCATION_IMAGES).forEach( function(location) {
		var prettyDisplay = location.split(' ').map( function(word) {
			return word[0].toUpperCase() + word.slice(1);
		}).join(' ');

		// Create the button and add it to button group
		var button = $('<button>').addClass('btn btn-info btn-block').text(prettyDisplay);
		var listItem = $('<li>').append(button);
		$('#location-filters').append(listItem);

		// Create the container for the students
		// Title is just the location, the container id needs to have spaces removed
		var title = $('<h3>').text(prettyDisplay);
		var container = $('<div>').addClass('row').attr('id', prettyDisplay.split(' ').join('')).append(title);
		$('#locations-container').append(container);
	});

	// Attach event handler to the filter buttons
	$('#location-filters button').click(function(e) {
		
		// Set filter
		FILTER = $(this).text();

		// Update display
		if (FILTER === 'All') {
			$('#locations-container > div').show();
		}
		else {
			// First, hide all containers
			$('#locations-container > div').hide();

			// Then show just the one with id matching the filter (spaces removed from filter)
			$('#' + FILTER.split(' ').join('')).show();
		}

		// Update the display of the filter buttons by removing primary from all and adding it to this one
		$('#location-filters button.btn-warning').removeClass('btn-warning').addClass('btn-info');
		$(this).removeClass('btn-info').addClass('btn-warning');
	});

	// Get AJAX call to User database and get all the students, create StudentLocationDisplay objects for each, and put them in the students array
	var tracker = io.connect();
	tracker.on('SCAN!', scanReceived);

	$.get('api/user', function(students) {
		studentsArray = _.map(students, function(student) {
			return new StudentLocationDisplay(student);
		});

		// Put in a slight display for student panels to display, then set them all to same height

		window.setTimeout(function(){
			var displays = $('.studentLocationDisplay');

			var heights = displays.map(function() {
				return $(this).height()
			});

			var maxHeight = Math.max.apply(null, heights);

			displays.height(maxHeight);
		}, 500);
	});

});