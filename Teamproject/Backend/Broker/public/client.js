$(document).ready(function(){
    // WebSocket
    var socket = io.connect();
	
	// Step 1: Illustrating the Tasklet request
	socket.on('show', function (data) {
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
    
   
});