// Global variable students: array of all the student objects
var students = [];

// Load the FOCUS_AREA options for initializing the select2, allowing teachers to input new focus areas if desired
var FOCUS_AREA_OPTIONS = _.chain(FOCUS_AREAS).keys().sortBy().value().map( function(fa) {
	return {
		id: fa,
		text: fa
	};
});

// Helper function for adding to FOCUS_AREA_OPTIONS
function addToFocus(focus_area) {
	// Check if the focus_area already exists in the list, otherwise add it
	if (!_.findWhere(FOCUS_AREA_OPTIONS, {id: focus_area})) {
		FOCUS_AREA_OPTIONS = FOCUS_AREA_OPTIONS.concat({
			id: focus_area,
			text: focus_area
		});

		$('select[name="focus_area"]').select2({
			data: FOCUS_AREA_OPTIONS,
			tags: true,
			allowClear: true,
			width: 'style'
		});
	}
}

// Function for resetting the event form
function resetForm(hideForm, retainSubmit){
	$('#add-event-text').text('   Add Event');

	// Manually reset values because select2 doesn't work with form.reset()
	$('#activity-form select[name="activity"]').val(null);
	$('#activity-form select[name="focus_area"]').select2('val', null);

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
	this.option = $('<option>'+student.name+'</option>').attr('value', student.googleId);
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
	}
};

// Throw each of the event display rows into the table
StudentGroveDisplay.prototype.renderEvents = function(containerTable) {
	_.each(this.eventDisplays, function(d) {
		d.render(containerTable);

		// Add any custom focus areas to the FOCUS_AREA_OPTIONS
		addToFocus(d.event.focus_area);
	});
};

// When the list is re-sorted through drag and drop, update all the indices
StudentGroveDisplay.prototype.updateSort = function(e, ui) {

	var self = this;

	// First, grab the updated list of indices, stored in the data-index attribute, and create a copy of the student's array of events
	var indices = $('#events-list').sortable("toArray", { attribute: 'data-index' });
	var tempDisplays  = _.cloneDeep(this.eventDisplays);

	// Now iterate through each index, and update the orders
	indices.forEach(function(data_index, order) {
		if (data_index != order) {
			self.eventDisplays[data_index].index = order;
			$(self.eventDisplays[data_index].el).attr('data-index', order)
		}
	});

	this.eventDisplays = _.sortBy(this.eventDisplays, 'index');

	// Enable the save button now that changes have been made, change the text to "Save Calendar" if not already done
	$('#save-calendar').removeClass('disabled').empty().append('<i class="fa fa-calendar"></i>   Save Grove Cycle');
}

// Render the events into the calendar table
StudentGroveDisplay.prototype.renderCalendar = function(containerId) {
	// Change the title
	$('#student-name').text(this.name);
	$('#title-text').text("\'s Grove Cycle")
	$('#student-icon').empty().append('<img class="student-icon" src="'+this.image+'">')

	// Hide the edit / add event form, if it is open, and reset it.
	resetForm(true, false);

	// Empty out the list if any events are in there, render the new events, then show calendar and make table sortable
	$(containerId).empty();
	this.renderEvents(containerId);

	var self = this;

	$('#calendar-container').show();
	$('#events-list').sortable({
		stop: self.updateSort.bind(self)
	});

	// Make the new event button show the form and attach the proper event handler to it
	$('#create-new-event').off('click').on('click', function(event){
		// Update the form legend and show it
		$('#activity-legend').text('New event for: ' + self.name);
		$('#activity-form').show('fast');

		// Event handler for submitting
		$('#add-event').on('click', function(e){
			e.preventDefault();

			// On submit, grab all the data, create a new EventDisplay object, push it into the student's event displays, and append it to the DOM
			var newEvent = {};
			var activity = $('#activity-form select[name="activity"]').val();
			newEvent.location = activity.split('#')[0];
			newEvent.activity = activity.split('#')[1];

			var index = self.eventDisplays.length;
			
			var focus_area = $('#activity-form select[name="focus_area"]').val();
			newEvent.focus_area = focus_area
			addToFocus(focus_area);
			
			newEvent = new EventDisplay(self, newEvent, index);

			self.eventDisplays.push(newEvent);

			newEvent.render('#events-list');
			
			// Reset the form
			resetForm(false, true);

			// Enable the save button now that changes have been made, change the text to "Save Calendar" if not already done
			$('#save-calendar').removeClass('disabled').empty().append('<i class="fa fa-calendar"></i>   Save Grove Cycle');
		});

		// Event handler for canceling
		$('#cancel-event-add').on('click', function(e){
			e.preventDefault();
			// Reset the form and hide it
			resetForm(true)
		});
	});
	
	// Update the save calendar button to have disabled class and text of "Save Calendar"
	$('#save-calendar').empty().append('<i class="fa fa-calendar"></i>   Save Grove Cycle').addClass('disabled');

	// Update the event handler on the save calendar button to refer to this student
	$('#save-calendar').off('click').on('click', function(event) {
		$('#save-calendar').empty().text('Saving...').addClass('disabled');

		var calendar = self.eventDisplays.map(function(e) {
			e.event.checkedIn = false;
			return e.event;
		});

		$.ajax('/api/grove/'+self.googleId, {
			method: 'PUT',
			data: JSON.stringify({calendar: calendar}),
			contentType: 'application/json',
			success: function() {
				$('#save-calendar').empty().append('<i class="fa fa-calendar"></i>   Cycle Saved!');
				
			},
			error: function(xhr, text, error) {
				$('#save-calendar').empty().removeClass('btn-success').addClass('btn-danger').text('Error Saving').removeClass('disabled');
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

// Creates the display element
EventDisplay.prototype.createDisplay = function() {
	// Row item for the event
	var row = '<tr></tr>';

	// Center
	var location = $('<td></td>').text(this.event.location);

	// Activity
	var activity = $('<td></td>').text(this.event.activity);

	// Focus Area
	var focus_area = $('<td></td>').text(this.event.focus_area);

	// Buttons for editing and removing, added to the EventDisplay object
	var edit = '<td></td>';
	this.editButton = $('<button class="btn btn-xs btn-info"><i class="fa fa-pencil"></i></button>');
	edit = $(edit).append(this.editButton);
	var remove = '<td></td>';
	this.removeButton = $('<button class="btn btn-xs btn-danger"><i class="fa fa-times"></i></button>');
	remove = $(remove).append(this.removeButton);

	// Append cells to the row
	return $(row).attr('data-index', this.index).append(location, activity, focus_area, edit, remove)[0];
};

// Renders the display element
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
		$('#activity-form select[name="activity"]').val(self.event.location+'#'+self.event.activity);
		$('#activity-form select[name="focus_area"]').select2('val', self.event.focus_area);
		$('#add-event-text').text('   Save');

		$('#activity-form').show('fast', function(){
			$('#add-event').off('click').one('click', function(e){
				e.preventDefault();
				// Update values for this event
				var activity = $('#activity-form select[name="activity"]').val();
				if (activity) {
					self.event.location = activity.split('#')[0];
					self.event.activity = activity.split('#')[1];
				}
				else {
					self.event.location = '';
					self.event.activity = '';
				}

				var focus_area = $('#activity-form select[name="focus_area"]').val();
				self.event.focus_area = focus_area;
				addToFocus(focus_area);
				
				// Reset the form, unbind handlers, and hide it
				resetForm(true);

				// Render the element with replace set to true
				self.render('#events-list', true);

				// Enable the save calendar button now that changes have been made
				$('#save-calendar').removeClass('disabled');
			});

			// Event handler for canceling
			$('#cancel-event-add').on('click', function(e){
				e.preventDefault();
				// Reset the form and hide it
				resetForm(true);
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
	// Load up the grove calendar options from CONFIG.js
	// The keys of GROVE_ACTIVITIES are the different centers
	_.keys(GROVE_ACTIVITIES).forEach( function(center) {
		var group = $('<optgroup>').attr('label', center);

		// For each center, take all the activities and add an option
		GROVE_ACTIVITIES[center].forEach( function(activity) {
			var option = $('<option>').attr('value', [center, activity].join('#')).text(activity);
			group.append(option);
		});
		$('select[name="activity"]').append(group);
	});

	$('select[name="focus_area"]').css('width', '100%').select2({
		data: FOCUS_AREA_OPTIONS,
		tags: true,
		width: 'style'
	});

	// Get all students
	$.get('/api/grove', function(data){

		// Initially fill the student list
		students = _.map(_.sortBy(data, 'name'), function(s) {
			student = new StudentGroveDisplay(s);
			student.renderOption('#student-names-select');
			return student;
		});

		// When a student is selected, trigger their render calendar
		$('#student-names-select').on('change', function(e) {
			var student = _.find(students, { 'googleId': e.target.value});
			student.renderCalendar('#events-list');
		});

		// When the student name input is changed, go through the students and only display the ones whose name matches the fragment in the input
		$('#student-name-search').on('keyup', function(e){

			$('#student-names-select').css('visibility', '');

			var frag = $(this).val().toLowerCase();
			_.each(students, function(s) {
				if (s.name.toLowerCase().match(frag)){
					s.renderOption('#student-names-select');
				}
				else {
					$(s.option).remove();
					s.optionRendered = false;
				}
			});

			// If there is only one student in the list, trigger change
			if ($('#student-names-select option').length === 1) {
				$('#student-names-select').trigger('change');
			}
		});
	});
});
