// This function converts a Javascript date object into the local time zone
	function convertUTCDateToLocalDate(date) {
	    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
	    var offset = date.getTimezoneOffset() / 60;
	    var hours = date.getHours();
	    newDate.setHours(hours - offset);
	    return newDate;   
	}

	// This function formats a Javascript date object into a string that can be understood by the FullCalendar widget
	function formattedDate(localDate, formatType) {
		var hh = (localDate.getUTCHours());
		// This hardcodes the timezone to -07:00 GMT. Code not currently being used
		// var UTCOffset = -7
		// var hh = (date.getUTCHours() + UTCOffset);
		if (hh < 0) { hh += 24 }
		var h = hh; 
		var tt = "AM";
		if (h > 12) { 
			h -= 12; 
			tt = "PM";
		}
		var mm = localDate.getUTCMinutes();
		var ss = localDate.getSeconds();
		// These lines ensure you have two-digits
		if (hh < 10) {hh = "0"+hh;}
		if (mm < 10) {mm = "0"+mm;}
		if (ss < 10) {ss = "0"+ss;}
		// This formats your string to HH:MM:SS
		if (formatType == "HH:MM:SS") {
			var t = hh+":"+mm+":"+ss;
		}
		// This formats your sting to h:MM TT
		else {
			var t = h+":"+mm+" "+tt;
		}
		return t
	}

	// This function returns the next time block that the student should focus on
	function getNextTimeInterval(date) {
		// This sets the transition time (in minutes)
		var transitionMinutes = 4;
		// Add transition minutes to current time
		var nextDate = new Date(date.getTime() + transitionMinutes * 60 * 1000);
		// Round to 5 minute interval
		var coeff = 5 * 60 * 1000;
		var roundedDate = new Date(Math.floor(nextDate.getTime() / coeff) * coeff);
		// Convert to human-readable format
		return formattedDate(roundedDate, "h:MM TT");
	}

	$(document).ready(function() {

		// console.log('GoogleId:', googleId);
		var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		var date = new Date();
		var dayOfWeek = daysOfWeek[date.getDay()];
		// This converts the date object to the local time zone
		var localDate = convertUTCDateToLocalDate(date);
		// This converts the current time to a human-readable format. Used for auto-scrolling
		var currentTime = formattedDate(localDate, "HH:MM:SS");
		// This gets the next time block that the student should focus on. Used to bold and stylize this time
		var timeToFocus = getNextTimeInterval(localDate);
	    $('#calendar').fullCalendar({
	    	// This is Roger's Google Calendar API key. See http://fullcalendar.io/docs/google_calendar/
	        googleCalendarApiKey: 'AIzaSyAY-0UE  cPWe5JRn0cm3ZacDvwW1T-Awr7E',
	        events: {
	            googleCalendarId: 'team@rootselementary.org',
	            className: 'gcal-event'
	        },

			eventRender: function(event, element) {
				// Use event.description if you need access to the event's description, use element.html() to get access to the entire HTML of the event element
 
				// The below lines check for the creator of the event, and displays a corresponding image
				if (event.creator == "roger.ray.lee@gmail.com") {
			        // This line inserts an image to the beginning of the event text (which is identified by .fc-title)
					element.find('.fc-title').prepend('<img src="male.jpg" style="width:24px; padding-right:5px">');
				}
				else if (event.creator == "jill@rootselementary.org") {
					element.find('.fc-title').prepend('<img src="female.jpg" style="width:24px; padding-right:5px">');					
				}

				// The below lines check if the event title contains key phrases, and if so, adds a corresponding image. 
				// Please use the lowercase form of the key phrase (ex. "morning", not "Morning") in the below code. The match itself is not case sensitive.
				if (event.title.toLowerCase().indexOf('morning') > -1) {
			        // This line inserts an image to the beginning of the event text (which is identified by .fc-title)
					element.find('.fc-title').prepend('<img src="pencil.svg" style="width:18px; padding-right:5px">');
				}
				else if (event.title.toLowerCase().indexOf('short') > -1) {
					element.find('.fc-title').prepend('<img src="pencil.svg" style="width:18px; padding-right:5px">');
				}

				// The below lines check for possible event locations, and styles the event element accordingly
				if (event.location == "Library") {
					// This lines sets the background color of the event element
			        element.css({'background-color': '#660000'});
			        // This line inserts an image to the beginning of the event text (which is identified by .fc-title)
			        element.find('.fc-title').prepend('<img src="x-mark-m.png" style="width:24px; padding-right:0px"> ');			
				}
				else if (event.location == "Classroom A") {
			        element.css({'background-color': '#006600'});			
			        element.find('.fc-title').prepend('<img src="circle-m.png" style="width:24px; padding-right:0px"> ');			
				}

				// The below lines inserts the event location to the end of the event text, if an event location exists
				if (event.location) {
					element.find('.fc-title').append(" (" + event.location + ")");
				}
    		},

    		// eventAfterRender: function(event, element, view) {
    		// 	console.log('eventid', event.id);
    		// 	console.log('event title', event.title);
    		// 	console.log('event location', event.location);
    		// 	console.log('start', event.start._i);
    		// 	var start = event.start._i;
    		// 	var split = start.split("T");
    		// 	console.log('split', split2);

    		// 	// $.ajax({
    		// 	// 	data: {
    		// 	// 		googleEventId: event.id,

    		// 	// 	}
    		// 	// })

    		// },

    		// Sets the calendar view to only show a single day
	        defaultView: 'agendaDay',
	        // Zooms the calendar in to show 5 minute intervals
	        slotDuration: '00:05:00',
	        // Automatically scrolls the calendar to the current time (defined above)
	        scrollTime: currentTime,
	        // This governs what's displayed in the header. Used to get rid of the Today button, which would otherwise be shown by default
			header: {
				left:   'title',
				center: '',
				right:  'prev,next'
			},
			// Removes the "All Day" section
			allDaySlot: false,
			// Formats the time alongside the left axis (ex. 8:00 AM)
			axisFormat: 'h:mm A',
			// Prevents the event time from being displayed in the event element
			timeFormat: {
				agenda: ''
			},
			// Disables clicking on the event
			eventClick: function(calEvent, jsEvent, view) {
		        return false;
		    }
	    });
	 	// Adds "Today is [day of week], " to the beginning of the date in the calendar title
		$('.fc-left h2').prepend('Today is ' + dayOfWeek + ', ');
		// Adds "Today is " to the beginning of the day of week in the calendar's heading. Code not currently being used
		// $('.fc-day-header').prepend('Today is ');
		// Styles the next time to focus on
		$(".fc-axis span:contains('" + timeToFocus + "')").wrapInner("<b style='color:#0000CC; font-size:110%'></b>");
	});
