// Global variable students: array of all the student objects

var students = [];

// Function for resetting the event form
function resetForm(hideForm, retainSubmit){
	$('#add-event-text').text('   Add Event');
	document.getElementById('activity-form').reset();

	if (!retainSubmit) {
		$('#add-event').off('click');
	}
	if (hideForm) {
		$('#activity-form').hide('fast');
		$('#calendar-button-container').show('fast');
	}
}

// Constructor for student objects
var StudentGroveDisplay = function(student){
	this.googleId = student.googleId;
	this.name = student.name;
	this.image = student.image;
	this.calendar = student.groveCalendar || [];
	this.option = $('<a class="list-group-item" style={cursor: pointer}>'+student.name+'</a>');
	this.optionRendered = false;

	this.eventDisplays = _.map(student.groveCalendar, function(event, index) {
		return new EventDisplay(this, event, index);
	}.bind(this)) || [];
};

// Check if the student is displayed in the list and, if not, render
StudentGroveDisplay.prototype.renderOption = function(selectId){
	if (!this.optionRendered) {
		$(selectId).append(this.option);
		this.optionRendered = true;
		this.option.click(this.renderCalendar.bind(this, '#events-list'));
	}
};

// Throw each of the event display rows into the table
StudentGroveDisplay.prototype.renderEvents = function(containerTable) {
	_.each(this.eventDisplays, function(d) {
		d.render(containerTable);
	});
};

// Render the events into the calendar table
StudentGroveDisplay.prototype.renderCalendar = function(containerId) {
	// Change the title
	$('#student-name').text(this.name);
	$('#student-icon').empty().append('<img class="student-icon" src="'+this.image+'">')

	// Empty out the list if any events are in there, render the new events, then show the calendar
	$(containerId).empty();
	this.renderEvents(containerId);

	// Attach the add event button handlers, bound to this student
	var self = this;
	$('#calendar-container').show();

	// Make the new event button show the form and attach the proper event handler to it
	$('#create-new-event').off('click').on('click', function(event){
		// Update the form legend and show it
		$('#activity-legend').text('New event for: ' + self.name);
		$('#activity-form').show('fast');
		$('#calendar-button-container').hide('fast');

		// Event handler for submitting
		$('#add-event').on('click', function(e){
			e.preventDefault();
			// On submit, grab all the data, create a new EventDisplay object, push it into the student's event displays, and append it to the DOM
			var newEvent = {};
			newEvent.checkedIn = $("#activity-form input[name='checkedIn']")[0].checked;
			var activity = $("#activity-form select").val();
			newEvent.location = activity.split('#')[0];
			newEvent.activity = activity.split('#')[1];
			var index = self.eventDisplays.length;
			
			newEvent = new EventDisplay(self, newEvent, index)
			self.eventDisplays.push(newEvent);
			newEvent.render('#events-list');

			// Reset the form
			resetForm(false, true)
		});

		// Event handler for canceling
		$('#cancel-event-add').on('click', function(e){
			e.preventDefault();
			// Reset the form and hide it
			resetForm(true)
		});
	});

	// Update the event handler on the save calendar button to refer to this student
	$('#save-calendar').off('click').on('click', function(event) {
		$('#save-calendar').empty().text('Saving...').attr('disabled');

		var calendar = self.eventDisplays.map(function(e) {
			return e.event;
		});

		$.ajax('/api/grove/'+self.googleId, {
			method: 'PUT',
			data: JSON.stringify({calendar: calendar}),
			contentType: 'application/json',
			success: function() {
				$('#save-calendar').empty().append('<i class="fa fa-calendar"></i>   Save Calendar').attr('disabled', false);
			},
			error: function(xhr, text, error) {
				$('#save-calendar').empty().removeClass('btn-success').addClass('btn-danger').text('Error Saving');
			}
		});
	});
};

// Event Display constructor
var EventDisplay = function(student, event, index) {
	this.student = student;
	this.event = event;
	this.index = index;
	// Call create display to make the DOM element
	this.el = this.createDisplay();
};

EventDisplay.prototype.createDisplay = function() {
	// Row item for the event
	var row = '<tr></tr>';

	// Checked in or not
	var checkedIn = '<td></td>';
	if (this.event.checkedIn) {
		checkedIn = $(checkedIn).append('<i class="fa fa-check-circle">');
	} else {
		checkedIn = $(checkedIn).append('<i class="fa fa-circle-o">');
	}
	// Center
	var location = '<td></td>';
	location = $(location).text(this.event.location);

	// Activity
	var activity = '<td></td>';
	activity = $(activity).text(this.event.activity);

	// Buttons for editing and removing, added to the EventDisplay object
	var edit = '<td></td>';
	this.editButton = $('<button class="btn btn-xs btn-info"><i class="fa fa-pencil"></i></button>');
	edit = $(edit).append(this.editButton);
	var remove = '<td></td>';
	this.removeButton = $('<button class="btn btn-xs btn-danger"><i class="fa fa-times"></i></button>');
	remove = $(remove).append(this.removeButton);

	// Append cells to the row
	return $(row).append(checkedIn, location, activity, edit, remove)[0];
};

EventDisplay.prototype.render = function(container, replace) {
	
	// Create a new variable pointing to this particular event display so we can reference it in the edit and remove events
	var self = this;

	// If the render is after an edit and replace was passed in, replace the old element
	if (replace) {
		var oldElement = self.el;
		self.el = self.createDisplay();
		$(oldElement).replaceWith(self.el);
	} else {
		$(container).append(this.el);
	}

	// Once the element is added to the DOM, attach the event handlers to its elements
	// Attach the event handler for the edit button
	$(this.editButton).click(function(e) {
		// Show the event form, fill in the defaults for this event, bind submission to changing this event
		$('#activity-form select').val(self.event.location+'#'+self.event.activity);
		if (self.event.checkedIn) {
			$('#activity-form input[name="checkedIn"]')[0].checked = true;
		} else {
			$('#activity-form input[name="checkedIn"]')[0].checked = false;
		} 
		$('#add-event-text').text('   Save');

		$('#activity-form').show('fast', function(){
			$('#add-event').off('click').one('click', function(e){
				e.preventDefault();
				// Update values for this event
				self.event.checkedIn = $("#activity-form input[name='checkedIn']")[0].checked;
				var activity = $("#activity-form select").val();
				if (activity) {
					self.event.location = activity.split('#')[0];
					self.event.activity = activity.split('#')[1];
				}
				else {
					self.event.location = '';
					self.event.activity = '';
				}
				
				// Reset the form, unbind handlers, and hide it
				resetForm(true)

				// Render the element with replace set to true
				self.render('#events-list', true)
			});

			// Event handler for canceling
			$('#cancel-event-add').on('click', function(e){
				// Reset the form and hide it
				resetForm(true)
			});
		});
	});
	// Attach the event handler for the remove button, binding to this create display
	$(this.removeButton).click(function(e) {
		// Remove the el from the DOM
		$(self.el).remove()
		// Remove this event display from the student calendar
		self.student.eventDisplays.splice(self.index, 1);
		// Change the index of the later events
		self.student.eventDisplays.forEach(function(eventDisplay){
			if (eventDisplay.index > self.index) eventDisplay.index--;
		});
		// Remove all event handlers from the activity form and hide it
		resetForm(true);
	});
}

$(function(){
	// Get all students
	$.get('/api/grove', function(data){

		// Initially fill the student list
		$('#student-names-container').text('');
		$('#student-names-container').append('<div class="list-group" id="student-list"></div>');
		students = _.map(_.sortBy(data, 'name'), function(s) {
			student = new StudentGroveDisplay(s);
			student.renderOption('#student-list');
			return student;
		});
		// When the student name input is changed, go through the students and only display the ones whose name matches the fragment in the input
		$('#student-name-search').on('keyup', function(e){
			var frag = $(this).val().toLowerCase();
			var matching_students = _.each(students, function(s) {
				if (s.name.toLowerCase().match(frag)){
					s.renderOption('#student-list');
				}
				else {
					$(s.option).remove();
					s.optionRendered = false;
				}
			});
		});
	});
});
