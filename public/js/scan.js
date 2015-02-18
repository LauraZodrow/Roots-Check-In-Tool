(function(){

	$.post('/api/qrScan/' + scanned_data, {}, function(err, results){
		console.log('scanned_data', scanned_data);
		console.log('scan results:', results);
	});

});