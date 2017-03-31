$(document).ready(function(){
    // WebSocket
    var socket = io.connect();

	socket.on('ShowCoinRequest', function (data) {
        var zeit = new Date(data.zeit);
        var buttonid = data.userid +"_send";
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
            $('<span>').text('User ' + data.userid + ' requested ' + data.requestedcoins + ' Coins.')),
			$('<input/>').attr({
                type: "button",
                id: buttonid,
                value: "Confirm"
                })     
        );
        $('#' + buttonid).click({userid: data.userid, requestedcoins: data.requestedcoins }, sendCoinsApproval);

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

        socket.emit('SendCoinsApproval', {userid: user.data.userid, coins: user.data.coins, approval: true});
    };
	
	
});