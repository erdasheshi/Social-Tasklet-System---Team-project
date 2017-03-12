$(document).ready(function(){
    // WebSocket
    var socket = io.connect();

	// Step 1: Illustrating the Tasklet request
	socket.on('ShowTaskletRequest', function (data) {
        var zeit = new Date(data.zeit);
        $('#content').append(
            $('<li></li>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
                // Name and TaskletID
                $('<b>').text(typeof(data.name) != 'undefined' ? data.name + ': ' : ''),
				$('<span>').text('TaskletID: ' + data.taskletid + ' '),
                // Requirements
				// do the same for the other broker an dfor th ebuer/seller
			
                $('<span>').text('QoC Cost: ' + data.cost + ' ' + 'QoC Privacy: ' + data.privacy +' ' +'QoC Speed: ' + data.speed + ' ' + 'QoC Reliability: ' + data.reliability ))
        );
		
        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
    });
	
	// Step 3: Illustrating potential provider
	socket.on('ShowProviderInformation', function (data) {
        var zeit = new Date(data.zeit);
        var provider = data.potentialprovider;
        var providerinformation = '';
        $.each(provider, function( i, val ) {
            providerinformation += 'User: ' + val.userid + ' - Price: ' + val.price + ' '
        })

        $('#content').append(
            $('<li></li>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
                // Name
				$('<b>').text('Potential provider for Tasklet ' + data.taskletid + ' from ' + data.name + ': ' ),
                // Potential provider
                $('<b>').text(providerinformation)
        ));
        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
    });
    
   
});