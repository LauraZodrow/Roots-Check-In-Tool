$(function(){

	var splitURL = location.pathname.split('/');
	var googleId = splitURL[splitURL.length -1];
	console.log('Id:', googleId);

	renderProgressBar = function(eventStartTime){
		var currentTime = moment().format();

		console.log('eventStartTime', eventStartTime);

		console.log('time', eventStartTime.calendar.start); 

		$('.timer').countdown({  
			start_time: currentTime, //Time when the progress bar is at 0%
		    end_time: eventStartTime.calendar.start, //Time Progress bar is at 100% and timer runs out
		    progress: $('.progress-bar'), //There dom element which should display the progressbar.
		    onComplete: function() {
		                $('.timer').replaceWith("<div class=\"timer ended\">Time's Up!</div>");
		    }    
		});
	}

	renderEvents = function(eventData){
		//This renders the progress bar and the function passes the event start time 
		renderProgressBar(eventData);

		for(var i = 0; i < eventData.calendar.length; i++){
			var calendarLocation = eventData.calendar[i].location;
			var calendarStart = eventData.calendar[i].start;
			var calendarCreator = eventData.calendar[i].creator;
		}
		$('#event').prepend($('<h3>' + calendarLocation + '</h3>'));
		

		if (calendarLocation == 'Library'){
			var libraryImg = $("<img src='/img/blue-triangle.png' width='70px'>")
			var pencilImg = $("<i class='fa fa-pencil fa-4x'>")

			$('.locationImage').append(libraryImg);
			$('.locationText').append('Library');

			$('.activityImage').append(pencilImg);
			$('.activityText').append('Writing');
		}

		if (calendarCreator == 'team@rootselementary.org') {
			$('.creatorImage').append("<img src='/img/jill-image.jpg' width='70px'>");
			$('.creatorText').append('Jill Carty')
		}


	}
	

	$.get('/api/getCalendar/' + googleId, {}, function(responseData){

		var userName = responseData.name;

		renderEvents(responseData);

		$('#name').prepend($('<h2>' + userName + '\'s Next Step' + '</h2>'));

	});

});
