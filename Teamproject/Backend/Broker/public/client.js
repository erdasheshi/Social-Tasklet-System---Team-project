$(document).ready(function(){
    // WebSocket
    var socket = io.connect();
	
	socket.on('event', function (data) {
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
                // Name
                $('<b>').text(typeof(data.name) != 'undefined' ? data.name + ': ' : ''),
                // Text
                $('<span>').text('QoC Cost:' + data.cost + ' ' + 'QoC Privacy:' + data.privacy ))
        );
        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
    });
    
   
});