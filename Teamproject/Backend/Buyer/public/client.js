$(document).ready(function(){
    // WebSocket
    var socket = io.connect();
	
	//Step 1: Showing Tasklet request
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
                $('<b>').text('Buyer: '),
				$('<span>').text('You (' + data.name + ') have sent a Tasklet request - '),
                //QoC text
                $('<span>').text('QoC Cost: ' + data.cost + ' ' + 'QoC Privacy: ' + data.privacy ))
        );
        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
    });
	
	// Step 8: Showing coins block status
	socket.on('ShowCoinsBlock', function (data) {
        var zeit = new Date(data.zeit);
		// Coins block was successful
		if(data.success == true){
		 $('#content').append(
            $('<li></li>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
				$('<span>').text('Coins from ' + data.buyer + ' were successfully blocked for ' + data.seller + ' regarding TaskletID ' + data.taskletid))
				);
        
		// scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
		}
		
		// Coins block was not successful
		else {
        $('#content').append(
            $('<li></li>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
				$('<span>').text('Alert! Coins from ' + data.buyer + ' were not successfully blocked for ' + data.seller + ' regarding TaskletID ' + data.taskletid +
				' - Transaction was cancelled.'))
				);
        
		// scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
		}
    });

    socket.on('ShowTaskletCalc', function (data) {
        var zeit = new Date(data.zeit);
        var buttonid = data.taskletid +"_send";
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
                $('<b>').text('Buyer: Tasklet '),
                // ID
                $('<b>').text(typeof(data.taskletid) != 'undefined' ? data.taskletid : ''),
                $('<b>').text(' ready for calculation - '),
                // Text
                $('<span>').text('Seller: ' + data.seller + ' ' )),
            $('<input/>').attr({
                type: "button",
                id: buttonid,
                value: "Send Tasklet to Seller"
            })
        );
        $('#' + buttonid).click({id: data.taskletid, seller: data.seller, buyer: data.buyer}, sendTaskletToSeller);

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);

    });

    socket.on('TaskletCyclesMoneyBlocked', function (data) {
        var zeit = new Date(data.zeit);
        var buttonid = data.taskletid +"_return";
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
                $('<b>').text('Seller: Tasklet '),
                // ID
                $('<b>').text(typeof(data.taskletid) != 'undefined' ? data.taskletid : ''),
                $('<b>').text(' money for calculation reserved - '),
                // Text
                $('<span>').text('Seller: ' + data.seller + ' ' )),
            $('<input/>').attr({
                type: "button",
                id: buttonid,
                value: "Return Tasklet Result to Buyer"
            })
        );
        $('#' + buttonid).click({id: data.taskletid, seller: data.seller, buyer: data.buyer}, returnTaskletToBuyer);

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);

    });

    socket.on('TaskletFinished', function (data) {
        var zeit = new Date(data.zeit);
        var buttonid = data.taskletid +"_finished";
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
                $('<b>').text('Buyer: Tasklet '),
                // ID
                $('<b>').text(typeof(data.taskletid) != 'undefined' ? data.taskletid : ''),
                $('<b>').text(' result received from '),
                // Text
                $('<span>').text('Seller:' + data.seller + ' ' )),
            $('<input/>').attr({
                type: "button",
                id: buttonid,
                value: "Send Confirmation to SFBroker"
            })
        );
        $('#' + buttonid).click({id: data.taskletid}, sendResultConfirmationToSFBroker);

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);

    });

    socket.on('ShowTaskletReceived', function (data) {
        var zeit = new Date(data.zeit);
        var buttonid = data.taskletid +"_received";
        var inputComputation = data.taskletid +"Computation";
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
                $('<b>').text('Seller: Tasklet '),
                // ID
                $('<b>').text(typeof(data.taskletid) != 'undefined' ? data.taskletid : ''),
                $('<b>').text(' calculated - '),
                // Text
                $('<span>').text('Buyer: ' + data.buyer + ' ' )),
                $('<input/>').attr({
                type: "button",
                id: buttonid,
                value: "Send Confirmation to SFBroker"
                }),
                $('<input/>').attr({
                id: inputComputation, placeholder: "Computation_Cylces"
            })
        );
        $('#' + buttonid).click({id: data.taskletid}, sendConfirmationToSFBroker);

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);

    });
    
    // Sending a message
    function send(){
        // Reading the input fields
        var cost = $('#cost').val();
		var privacy = $('#privacy').val();
        // Sending socket
        socket.emit('TaskletRequest', {cost: cost, privacy: privacy});
        // Empty input fields
        $('#cost').val('');
		$('#privacy').val('');
    }
    // Trigger function when clicking
    $('#send').click(send);

    // Trigger send to Seller
    function sendTaskletToSeller(tasklet){
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
                $('<span>').text('Tasklet '),
                // ID
                $('<span>').text(tasklet.data.id),

                $('<span>').text(' send to ' + tasklet.data.seller)
            )
        )
		socket.emit('SendTaskletToSeller', {taskletid: tasklet.data.id, seller: tasklet.data.seller, buyer: tasklet.data.buyer});
    };

   
    // Trigger send computation cycles to SFBroker
    function sendConfirmationToSFBroker(tasklet){
        var zeit = new Date();
		var computation = $('#' + tasklet.data.id +"Computation").val();
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
                $('<span>').text('Computation cycles ' + computation +' of Tasklet '),
                // ID
                $('<span>').text(tasklet.data.id),

                $('<span>').text(' send')
            )
        )
		
		socket.emit('TaskletCycles', {computation: computation, taskletid: tasklet.data.id});
    };

    // Trigger send to Buyer
    function returnTaskletToBuyer(tasklet){
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
                $('<span>').text('Return Tasklet result'),
                // ID
                $('<span>').text(tasklet.data.id),

                $('<span>').text(' to ' + tasklet.data.buyer)
            )
        )
        socket.emit('ReturnTaskletToBuyer', {taskletid: tasklet.data.id, seller: tasklet.data.seller, buyer: tasklet.data.buyer});
    };

    // Trigger send computation cycles to SFBroker
    function sendResultConfirmationToSFBroker(tasklet){
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
                $('<span>').text('Result of '),
                // ID
                $('<span>').text(tasklet.data.id),

                $('<span>').text(' confirmed')
            )
        )

        socket.emit('TaskletResultConfirm', {taskletid: tasklet.data.id});
    };

});