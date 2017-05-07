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
	
	// Step 3: Balance was not sufficient
    socket.on('CancelTasklet', function (data) {
        $('#content').append(
            $('<li></li>').append(

                $('<b>').text('Broker: '),
                $('<span>').text('You have sent a Tasklet request with TaskletID' + data.taskletid),
                $('<span>').text(' but you have not enough money in your account! To change your current balance, please proceed with a coin request.'))
        );
        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
    });
	
	// Step 6: Showing coins block status
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
				$('<span>').text('The default amount of ' + data.coins +' coins is blocked from ' + data.consumer + ', for ' + data.provider + ' - regarding Tasklet ' + data.taskletid))
				);
        
		// scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
		}
		
		// Coins block was not successful
        //****this one does not give a correct result of the condition...it comes always as true****
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

	// Step 7: Sending Tasklet to provider
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

	// Step 10: Consumer received Tasklet result
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
                $('<b>').text(' received - Cycles of Tasklet computation was ' + data.computation + ' .'),
                // Text
                $('<b>').text(' Provider: ' + data.provider + ' ' ))
        );

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);

    });

	// Step 8: Provider received Tasklet
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
                value: "Send Tasklet Confirmation to Broker"
                }),
                $('<input/>').attr({
                id: inputComputation, placeholder: "Computation_Cylces"
            })
        );
        $('#' + buttonid).click({id: data.taskletid, consumer: data.consumer }, sendConfirmationToBroker);

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);

    });
    
    // Sending a message
    function send(){
        // Reading the input fields
		  if($('#cost').prop("checked") == true){
                var cost = "low";
            }
            else if($('#cost').prop("checked") == false){
                var cost = "high";
            }
          if($('#privacy').prop("checked") == true){
                var privacy = "high";
            }
            else if($('#privacy').prop("checked") == false){
                var privacy = "low";
            }
		  if($('#speed').prop("checked") == true){
                var speed = "high";
            }
            else if($('#speed').prop("checked") == false){
                var speed = "low";
            }
		  if($('#reliability').prop("checked") == true){
                var reliability = "high";
            }
            else if($('#reliability').prop("checked") == false){
                var reliability = "low";
            }
		
        // Sending socket
        socket.emit('TaskletRequest', {cost: cost, privacy: privacy, speed: speed, reliability: reliability});
        // Empty input fields
        $('#cost').prop('checked', false);
		$('#privacy').prop('checked', false);
		$('#speed').prop('checked', false);
		$('#reliability').prop('checked', false);
	
    }
    // Trigger function when clicking
    $('#send').click(send);

    //Step 7: Trigger send to Provider
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

    // Step 9: Trigger send computation cycles to Broker
    function sendConfirmationToBroker(tasklet){
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

                $('<span>').text(' sent as well as the result back to the Consumer')
            )
        )

        if (isNaN(computation))
        {computation = 0 ;}

		socket.emit('TaskletCycles', {computation: computation, taskletid: tasklet.data.id, consumer: tasklet.data.consumer });
    };

});