$(function(){

	var splitURL = location.pathname.split('/');
	var googleId = splitURL[splitURL.length -1];

	renderProgressBar = function(eventStart){
		var currentTime = moment().format();

		$('.timer').countdown({  
			start_time: currentTime, //Time when the progress bar is at 0%
		    end_time: eventStart, //Time Progress bar is at 100% and timer runs out
		    progress: $('.progress-bar'), //There dom element which should display the progressbar.
		    onComplete: function() {
		    			$('.timer').show();
		                $('.timer').replaceWith("<div class=\"timer ended\">Time's Up!</div>");
		    }    
		});
	}

	renderLocationImage = function(eventLocation, eventCreator) {

		if (eventLocation == 'Library'){
			var libraryImg = $("<img src='/img/blue-triangle.png' width='70px'>")
			var pencilImg = $("<i class='fa fa-pencil fa-4x'>")

			$('.locationImage').append(libraryImg);
			$('.locationText').append('Library');

			$('.activityImage').append(pencilImg);
			$('.activityText').append('Writing');
		}

		if (eventCreator == 'team@rootselementary.org') {
			$('.creatorImage').append("<img src='/img/jill-image.jpg' width='70px'>");
			$('.creatorText').append('Jill Carty')
		}

	}

	renderEvents = function(eventData){
		var currentTime = moment().format();

		_.find(eventData.calendar, function(chr) {

			var a = moment(currentTime);
			var b = moment(chr.start);
			var difference = b.diff(a, 'minutes');
			console.log('difference', difference);

			//global variables defining the event location and creator for current event
			if (difference <= 10 && difference > 0) {

				eventLocation = chr.location;
				eventCreator = chr.creator
				var eventStart = chr.start
				//This renders the progress bar and the function passes the event start time 
				renderProgressBar(eventStart);
				renderLocationImage(eventLocation, eventCreator);

				$('#event').prepend($('<h3>' + eventLocation + '</h3>'));

				return eventLocation
			} 
			else {
				// $('.scan-button').hide();
				// $('#checkBackLater').append($('<h2>' + 'Check Back In Later!' + '</h2>'))
				// console.log('undefined!')
			};

		}), 'location';

		// $('.scan-button').hide();
		// $('#checkBackLater').append($('<h2>' + 'Check Back In Later!' + '</h2>'))


	}
	

	$.get('/api/getCalendar/' + googleId, {}, function(responseData){

		var userName = responseData.name;

		renderEvents(responseData);

		$('#name').prepend($('<h2>' + userName + '\'s Next Step' + '</h2>'));

	});

});
