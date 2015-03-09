var studentsArray = [];

// var studentsAt = {
	// Library: [],
	// Lost: [],
	// 'Maker Space': []
// };

// How to set up an event handler if you dont care about having access to any of the data
// $(document).on('click', '.studentDisplay', function(e) {
// 	// blah blah
// });

// Class of student display
var StudentDisplay = function(student) {
	console.log('student', student);
	this.data = _.pick(student, ['_id', 'email','name','image','googleId']);
	
	// Define the html string for the student display
	var display = $('<div class="studentDisplay" id='+student.googleId+'</div>');
	display.append('<figure><img class="studentImage" src="' +student.image+'"><figcaption>' + student.name + '</figcaption></figure>');
	display.append('<div class="studentInfoContainer"></div>')
	// Some stuff with appending to display here
	this.el = display;

	if (student.recentScan) {
		this.moveMe(student.recentScan);
	}
	else {
		this.status = 'Lost';
		this.currentLocation = 'Lost';
	}

	// I think this works...!
	// $(document).on('click', $(this.el), function(e) {
	// 	this.onClick(e);
	// });
};

// Example of how to set up event handlers while still giving access to the StudentDisplay object and all the data it has
// StudentDisplay.prototype.onClick(e) {

// }.bind(this);


// Updates student display based on most recent scan / event 
StudentDisplay.prototype.updateDisplay = function(scan) {
	if (this.status === 'Found') {
		this.el.find('.studentInfoContainer').text('');
	}
	else {
		this.el.find('.studentInfoContainer').text('Last scanned into: ' + this.currentLocation);
	}
};

// Move the student to a new location based on the most recent scan
StudentDisplay.prototype.moveMe = function(scan) {
	// move from one array to another
	if (this.el) {
		this.el.remove();
	};

	this.currentLocation = scan.scannedLocation;
	if (scan.event && scan.event.length && scan.scannedLocation === scan.event[0].location) {
		this.status = 'Found';
		this.el.removeClass('Lost').addClass('Found');
	}
	else {
		this.status = 'Lost';
		this.el.removeClass('Found').addClass('Lost');
	}
	// Optional logic to change this.el based on status
	if (this.status === 'Found') {
		this.render(this.currentLocation);
	} else {
		this.render('Lost')
	}
}

StudentDisplay.prototype.render = function(location) {
	// render into the domnode based on where their location is
	var locationId = location.split(' ').join('');
	this.updateDisplay();
	$('#'+locationId).append(this.el);
}

var scanReceived = function(scan) {
	console.log('Scan received!', scan);

	var scanStudent = _.find(studentsArray, function(student) {
		student.data.googleId === scan.googleId;
	});

	if (scanStudent) {
		scanStudent.moveMe(scan);
	}
	// Some logic to see if they are lost or not, set their status
};

$(function(){

	// Get AJAX call to User database and get all the students, create StudentDisplay objects for each, and put them in the students array
	var tracker = io.connect();
	tracker.on('SCAN!', scanReceived);

	$.get('api/user', function(students) {
		console.log('Data returned on get users:', students);
		studentsArray = _.map(students, function(student) {
			studentInstance = new StudentDisplay(student);
			return studentInstance;
		});
		console.log('Array of Students:', students);
	});

});