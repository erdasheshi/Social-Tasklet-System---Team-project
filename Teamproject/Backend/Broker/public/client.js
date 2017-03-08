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
                $('<span>').text('QoC Cost: ' + data.cost + ' ' + 'QoC Privacy: ' + data.privacy ))
        );
        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
    });
	
	// Step 3: Illustrating potential sellers
	socket.on('ShowSellerInformation', function (data) {
        var zeit = new Date(data.zeit);
        var seller = data.potentialseller;
        var sellerinformation = '';
        $.each(seller, function( i, val ) {
            sellerinformation += 'User: ' + val.userid + ' - Price: ' + val.price + ' '
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
				$('<b>').text('Potential sellers for TaskletID ' + data.taskletid + ' from ' + data.name + ': ' ),
                // Potential sellers
                $('<b>').text(sellerinformation)
        ));
        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
    });
    
   
});