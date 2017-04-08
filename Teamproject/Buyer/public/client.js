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
                $('<span>').text('You have sent a Tasklet request - '),
                //QoC text
                $('<span>').text(' but you have not enough money in your account! To change your current balance, please proceed with a coin request.'))
        );
        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
    });
	
	// Step 10: Showing coins block status
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
				$('<span>').text('The amount of ' + data.coins +' coins is blocked from ' + data.consumer + ', for ' + data.provider + ' - regarding Tasklet ' + data.taskletid))
				);
        
		// scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
		}
		
		// Coins block was not successful
            //***************this one does not give a correct result of the condition...it comes always as true
           //it has to be checked when we will want to cancel the tasklet if the user has not enough money for the real computation cycles
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

	// Step 11: Sending Tasklet to provider
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

    //**************why data.consumer is valid and data.coins is not recognized???????
	// Step 14: Coins were blocked for provider
    socket.on('ShowTaskletCyclesCoinsBlocked', function (data) {

        if (data.confirmation == true) {
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
                $('<b>').text(', the amount of '+ data.coins + ' coins for calculation are reserved - '),
                // Text
                $('<span>').text('Consumer: ' + data.consumer + ' ' )),
            $('<input/>').attr({
                type: "button",
                id: buttonid,
                value: "Return Tasklet Result to Consumer"
            })
        );
        $('#' + buttonid).click({id: data.taskletid, provider: data.provider, consumer: data.consumer, coins: data.coins, computation: data.computation}, returnTaskletToConsumer);

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
        }
        else{
            //*****when the else executes it doesnt show most of the messages (messages that are before this call)

            var zeit = new Date(data.zeit);
          
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
                    $('<span>').text(' coins for calculation were not reserved because the consumer had not enough money to pay for the transaction.'))
            );

            // scroll down
            $('body').scrollTop($('body')[0].scrollHeight);
        }
    });

	// Step 15: Consumer received Tasklet result
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
                $('<b>').text(' result ' + data.result + ' received - Total cycles of Tasklet was: ' + data.computation + '  and it costed: ' + data.coins),
                // Text
                $('<span>').text(' Provider: ' + data.provider + ' ' )),
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

	// Step 13: Provider received Tasklet
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

    //Step 11: Trigger send to Provider
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

    // Step 13: Trigger send computation cycles to SFBroker
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

    // Step 15: Trigger send result to consumer
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

                $('<span>').text(' returned to ' + tasklet.data.consumer + ' The total number of cycles was: ' + tasklet.data.computation + 'and it costed: ' + tasklet.data.coins )
            )
        )
        socket.emit('ReturnTaskletToConsumer', {taskletid: tasklet.data.id, coins: tasklet.data.coins, computation: tasklet.data.computation, provider: tasklet.data.provider, consumer: tasklet.data.consumer, result: result});
    };

    // Step 16: Trigger confirmation of Tasklet result
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