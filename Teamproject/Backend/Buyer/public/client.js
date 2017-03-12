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
                $('<b>').text('Consumer: '),
				$('<span>').text('You (' + data.name + ') have sent a Tasklet request - '),
                //QoC text
                $('<span>').text('QoC Cost: ' + data.cost + '  ' + 'QoC Privacy: ' + data.privacy + '  ' + 'QoC Speed: ' + data.speed + '  ' + 'QoC Reliability: ' + data.reliability ))
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
				$('<span>').text('Coins from ' + data.consumer + ' were successfully blocked for ' + data.provider + ' regarding Tasklet ' + data.taskletid))
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
				$('<span>').text('Alert! Coins from ' + data.consumer + ' were not successfully blocked for ' + data.provider + ' regarding TaskletID ' + data.taskletid +
				' - Transaction was cancelled.'))
				);
        
		// scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
		}
    });

	// Step 9: Sending Tasklet to provider
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
                $('<b>').text('Consumer: Tasklet '),
                // ID
                $('<b>').text(typeof(data.taskletid) != 'undefined' ? data.taskletid : ''),
                $('<b>').text(' ready for calculation - '),
                // Text
                $('<span>').text('Provider: ' + data.provider + ' ' )),
            $('<input/>').attr({
                type: "button",
                id: buttonid,
                value: "Send Tasklet to Provider"
            })
        );
        $('#' + buttonid).click({id: data.taskletid, provider: data.provider, consumer: data.consumer}, sendTaskletToProvider);

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);

    });

	// Step 12: Coins were blocked for provider
    socket.on('ShowTaskletCyclesCoinsBlocked', function (data) {
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
                $('<b>').text('Provider: Tasklet '),
                // ID
                $('<b>').text(typeof(data.taskletid) != 'undefined' ? data.taskletid : ''),
                $('<b>').text(' coins for calculation reserved - '),
                // Text
                $('<span>').text('Consumer: ' + data.consumer + ' ' )),
            $('<input/>').attr({
                type: "button",
                id: buttonid,
                value: "Return Tasklet Result to Consumer"
            })
        );
        $('#' + buttonid).click({id: data.taskletid, provider: data.provider, consumer: data.consumer}, returnTaskletToConsumer);

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);

    });

	// Step 13: Consumer received Tasklet result
    socket.on('ShowTaskletFinished', function (data) {
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
                $('<b>').text('Consumer: Tasklet '),
                // ID
                $('<b>').text(typeof(data.taskletid) != 'undefined' ? data.taskletid : ''),
                $('<b>').text(' result ' + data.result + ' received - '),
                // Text
                $('<span>').text('Provider: ' + data.provider + ' ' )),
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

	// Step 9: Provider received Tasklet
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
                $('<b>').text('Provider: Tasklet '),
                // ID
                $('<b>').text(typeof(data.taskletid) != 'undefined' ? data.taskletid : ''),
                $('<b>').text(' calculated - '),
                // Text
                $('<span>').text('Consumer: ' + data.consumer + ' ' )),
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

    //Step 9: Trigger send to Provider
    function sendTaskletToProvider(tasklet){
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

                $('<span>').text(' sent to ' + tasklet.data.provider)
            )
        )
		socket.emit('SendTaskletToProvider', {taskletid: tasklet.data.id, provider: tasklet.data.provider, consumer: tasklet.data.consumer});
    };

   
    // Step 11: Trigger send computation cycles to SFBroker
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

                $('<span>').text(' sent')
            )
        )
		
		socket.emit('TaskletCycles', {computation: computation, taskletid: tasklet.data.id});
    };

    // Step 13: Trigger send result to consumer
    function returnTaskletToConsumer(tasklet){
        var zeit = new Date();
		// generate default result
		var result = ['3', '7', '11']
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
                $('<span>').text('Tasklet result '),
                // ID
                $('<span>').text(result),

                $('<span>').text(' returned to ' + tasklet.data.consumer)
            )
        )
        socket.emit('ReturnTaskletToConsumer', {taskletid: tasklet.data.id, provider: tasklet.data.provider, consumer: tasklet.data.consumer, result: result});
    };

    // Step 14: Trigger confirmation of Tasklet result
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
                $('<span>').text('Result of Tasklet '),
                // ID
                $('<span>').text(tasklet.data.id),

                $('<span>').text(' confirmed')
            )
        )

        socket.emit('TaskletResultConfirm', {taskletid: tasklet.data.id});
    };

});