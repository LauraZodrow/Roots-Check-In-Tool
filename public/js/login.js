var getProfile = function(access_token, userid) {
	$.ajax({
		url: '/auth/getProfile',
		type: 'POST',
		data: {
			access_token: access_token,
			userid: userid
		},
		success: function(result) {
			// location = 'http://localhost:7060/calendar'+result.id;
			location = '/next-step/' + result.id
		}
	});
}

$(function(){
	var params = {}, queryString = location.hash.substring(1),
	    regex = /([^&=]+)=([^&]*)/g, m;
	while (m = regex.exec(queryString)) {
	  params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	}

	$.ajax({
		url: 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + params.access_token,
		dataType: 'json',
		success: function(response) {
			console.log('Response', response);
			getProfile(params.access_token, response.user_id);
		}
	})
});