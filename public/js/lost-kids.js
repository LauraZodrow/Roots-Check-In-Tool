$(function(){

	$.get('/api/getProfileImage', {}, function(responseData){
		console.log('getProfileImage response', responseData);
	});	

});