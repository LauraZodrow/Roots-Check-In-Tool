$(function(){

	var splitURL = location.pathname.split('/');
	var googleId = splitURL[splitURL.length -1];
	console.log('Id:', googleId);

	$.get('/api/getCalendar/' + googleId, {}, function(responseData){
		console.log('responseData');
	});


});
