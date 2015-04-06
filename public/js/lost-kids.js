var studentsArray = [];

// Class of student display
var StudentLocationDisplay = function(student) {
	this.data = _.pick(student, ['_id', 'email','name','image','googleId']);
	
	console.log('student', student);
	// Create the DOM element representing the student
	var display = $('<div class="studentLocationDisplay" id='+student.googleId+'</div>');
	display.append('<div class="nameImageContainer"><div class="name">' + student.name + '</div><div><img class="studentImage" src="' +student.image+'"></div></div>');
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
		if (event && event.end && moment(event.end).add(TRANSITION_LENGTH, 'minutes').isAfter(moment())) {
				recent = true;
		}
		// If grove calendar, check against length of events
		else if (event && !event.end && moment().add(TRANSITION_LENGTH + EVENT_LENGTH, 'minutes').isAfter(moment())) {
			recent = true;
		}

		// If the scan is recent and the scan is correct, move the student based on the scan
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
	// If there is no recent scan at all, student is lost, create a dummy recent scan
	else {
		this.status = 'Lost';
		this.currentLocation = 'Lost';
		this.render('Lost');
	}

};

// Updates student display based on most recent scan / event 
StudentLocationDisplay.prototype.updateDisplay = function() {
	console.log('Context at update:', this);

	if (this.status === 'Found') {
		this.el.find('.studentInfoContainer').empty();
	}
	else {
		var time = this.recentScan ? moment(this.recentScan.time).fromNow() : '';
		this.el.find('.studentInfoContainer').empty().append('<p class="last-scan-info">Last scanned into: ' + this.currentLocation + ' ' + time + '</p>');
	}
};

// Move the student to a new location based on the most recent scan
StudentLocationDisplay.prototype.moveMe = function(scan) {
	// move from one array to another
	if (this.el) {
		this.el.remove();
	};

	// If this method was triggered by a scan, update the location to the location of the scan. If it was triggered by a timeout, leave the location as is.
	if (scan) {
		this.currentLocation = scan.scannedLocation;
	}

	if (scan && scan.correct) {
		this.status = 'Found';
		this.el.removeClass('Lost').addClass('Found');
		// Set a timeout based on the end of the event, and move the student to Lost after the event is over as a placeholder until they scan into another event
		// To check end of event, see whether there is a start and end defined on the event (in which case it came from Google calender) or not (in which case it came from Grove, and we will use the EVENT_LENGTH and TRANSITION_LENGTH config option)
		if (scan.event.end) {
			var difference = moment(scan.event.end).diff(moment());
		}
		else {
			var intervals = 60 / (EVENT_LENGTH / 60 * 1000);
			var end_times = [];
			// Create an array of all end times for this hour
			for (var i =1; i<=intervals; i++) {
				end_times.push(moment().startOf('hour').add(i * EVENT_LENGTH - TRANSITION_LENGTH, 'minutes'));
			}
			// Event ends at the first end time after this check-in
			var event_end = _.find(end_times, function(t) {
				return t.isAfter(moment());
			});
			// Push student into lost after event ends and transition time has lapsed
			var difference = event_end.add(TRANSITION_LENGTH, 'minutes').diff(moment());
		}
		this.transitionTimeout = window.setTimeout(this.moveMe, difference);
	}
	// If the scan does not match the location, the student is in the wrong location
	else if (scan) {
		this.status = 'Wrong Location';
		this.el.removeClass('Found').addClass('Lost');
	}
	// If not triggered by a scan, move student to lost
	else {
		this.status = 'Lost';
	}
	// Optional logic to change this.el based on status
	this.render();
}

StudentLocationDisplay.prototype.render = function() {
	// render into the domnode based on where their location is
	var location;
	if (this.status === 'Found') {
		location = this.currentLocation
	} else {
		location = this.status;
	}

	var locationId = location.split(' ').join('');
	this.updateDisplay();
	$('#'+locationId).append(this.el);
}

// When receiving a scan, find the student that matches the scan, move them to a new location based on the scan and clear any possible transitions
var scanReceived = function(scan) {
	var scanStudent = _.find(studentsArray, function(student) {
		return student.data.googleId === scan.googleId;
	});
	// If a student is found, move the student and override their recent scan
	if (scanStudent) {
		if (scanStudent.transitionTimeout) {
			window.clearTimeout(transitionTimeout);
		}
		scanStudent.recentScan = scan;
		scanStudent.moveMe(scan);
	}
};

$(function(){

	// Get AJAX call to User database and get all the students, create StudentLocationDisplay objects for each, and put them in the students array
	var tracker = io.connect();
	tracker.on('SCAN!', scanReceived);

	$.get('api/user', function(students) {
		studentsArray = _.map(students, function(student) {
			studentInstance = new StudentLocationDisplay(student);
			return studentInstance;
		});
	});

});