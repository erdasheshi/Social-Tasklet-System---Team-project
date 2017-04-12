$(document).ready(function(){
    // WebSocket
    var socket = io.connect();

	socket.on('ShowCoinRequest', function (data) {
        var zeit = new Date(data.zeit);
        var buttonid = data.requestid +"_send";
        //noinspection JSAnnotator,JSAnnotator
        $('#content').append(
            $('<li></li>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
            $('<span>').text('User ' + data.username + ' requested ' + data.requestedcoins + ' Coins.')),
			$('<input/>').attr({
                type: "button",
                id: buttonid,
                value: "Confirm"
                })     
        );
        $('#' + buttonid).click({requestid: data.requestid, username: data.username, requestedcoins: data.requestedcoins}, sendCoinsApproval);

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);

    });
	
	function sendCoinsApproval(user){
        var zeit = new Date();
        $(this).prop("disabled",true);
        $('#content').append(
            $('<li></li>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
                $('<span>').text('Coins request was approved.')
            )
        )

        socket.emit('SendCoinsApproval', {requestid: user.data.requestid, username: user.data.username, requestedcoins: user.data.requestedcoins, approval: true});
    };
	
	function send(){
		
		socket.emit('GetRequests', {requests: 'Send it'});
	};
	
	 // Trigger function when clicking
    $('#get').click(send);
	
});