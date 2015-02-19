$(function(){

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


	function getCalendar(userData){
	  gapi.client.request('https://www.googleapis.com/calendar/v3/calendars/' + userData.email + '/events/').execute(function(response) {
	  		console.log('userData', userData);

	        var currentTime = moment().format()

	        //loop through all events in user's google calendar
	        var events = _.map(response.items, function(event){

	          //return events in this format
	          return {
	              eventId: event.id,
	              location: event.location,
	              creator: event.creator.email,
	              start: event.start.dateTime,
	              end: event.end.dateTime,
	              description: event.description
	            }
	        });

	        userData.calendar = events;


	        var dataString = JSON.stringify(userData);
	        console.log('userData', userData)

	        //send user data with calendar events to backend, and save to database
	        $.ajax ({
	          type: "POST",
	          url: 'api/saveUser',
	          data: userData,
	          dataType: 'JSON',
	          success: function(err, results){
	            console.log('results', results)
	          }
	        });
	        
	        //loop through all events to find one that is 10 minutes away
	        var nextEvent = _.find(response.items, function(event){
	          var a = moment(currentTime);
	          var b = moment(event.start.dateTime);
	          var difference = b.diff(a, 'minutes');
	          return (difference <= 10 && difference > 0)
	        });

	        //if one is found show location, teacher, and activity. else eventually show grove calendar
	        if (nextEvent) {
	          $('#event').prepend($('<h3>' + nextEvent.location + '</h3>'));

	          renderProgressBar(nextEvent.start);

	          renderLocationImage(nextEvent.location, nextEvent.creator);

	        } 
	        else {
	          $('#groveCalendar').append($('<h3>Grove Calendar Will Go Here</h3>'));
	        }
	  });
	}

	getProfile = function(){
		 gapi.client.request('https://www.googleapis.com/plus/v1/people/me?fields=name(familyName%2Cformatted%2CgivenName)%2CdisplayName%2Cemails%2Fvalue%2Cimage%2Furl%2Cid').execute(function(response) {

	      var signInData = {
	        id: response.id,
	        name: response.displayName,
	        email: response.emails[0].value,
	        image: response.image.url
	      }

	      console.log('signInData', signInData);

	      //get calendar events on signIn and send events/user to database in function above
	      getCalendar(signInData);
	  });
	}

});