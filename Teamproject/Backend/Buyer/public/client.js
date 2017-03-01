$(document).ready(function(){
    // WebSocket
    var socket = io.connect();
	
	socket.on('TaskletSend', function (data) {
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
                $('<b>').text('Tasklet '),
                // ID
                $('<b>').text(typeof(data.tasklet_id) != 'undefined' ? data.tasklet_id : ''),
                $('<b>').text(' send - '),
                // Text
                $('<span>').text('QoC Cost:' + data.cost + ' ' + 'QoC Privacy:' + data.privacy ))
        );
        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
    });

    socket.on('TaskletCalc', function (data) {
        var zeit = new Date(data.zeit);
        var button_id = data.tasklet_id +"_send";
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
                $('<b>').text('Tasklet '),
                // ID
                $('<b>').text(typeof(data.tasklet_id) != 'undefined' ? data.tasklet_id : ''),
                $('<b>').text(' ready for calculation - '),
                // Text
                $('<span>').text('Seller:' + data.seller + ' ' )),
                $('<input/>').attr({
                    type: "button",
                    id: button_id,
                    value: "Send Tasklet to Seller"
                })
        );
        $('#' + button_id).click({id: data.tasklet_id}, sendTaskletToSeller);

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);

    });

    socket.on('TaskletFinished', function (data) {
        var zeit = new Date(data.zeit);
        var button_id = data.tasklet_id +"_finished";
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
                $('<b>').text('Tasklet '),
                // ID
                $('<b>').text(typeof(data.tasklet_id) != 'undefined' ? data.tasklet_id : ''),
                $('<b>').text(' calculated by '),
                // Text
                $('<span>').text('Seller:' + data.seller + ' ' )),
            $('<input/>').attr({
                type: "button",
                id: button_id,
                value: "Send Confirmation to SFBroker"
            })
        );
        $('#' + button_id).click({id: data.tasklet_id}, sendConfirmationToSFBroker);

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);

    });

    socket.on('TaskletReceived', function (data) {
        var zeit = new Date(data.zeit);
        var button_id = data.tasklet_id +"_received";
        var cycles = data.tasklet_id +"_computation";
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
                $('<b>').text('Tasklet '),
                // ID
                $('<b>').text(typeof(data.tasklet_id) != 'undefined' ? data.tasklet_id : ''),
                $('<b>').text(' received - '),
                // Text
                $('<span>').text('Buyer:' + data.buyer + ' ' )),
                $('<input/>').attr({
                type: "button",
                id: button_id,
                value: "Send Confirmation to SFBroker"
                }),
                $('<input/>').attr({
                id: cycles, placeholder: "computation_cylces"
            })
        );
        $('#' + button_id).click({id: data.tasklet_id}, sendConfirmationToSFBroker);

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);

    });
    
    // Sending a message
    function send(){
        // Reading the input fields
        var tasklet_id = $('#tasklet_id').val();
        var cost = $('#cost').val();
		var privacy = $('#privacy').val();
        // Sending socket
        socket.emit('TaskletSend', {tasklet_id: tasklet_id, cost: cost, privacy: privacy});
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
                $('<b>').text('Tasklet '),
                // ID
                $('<b>').text(tasklet.data.id),

                $('<b>').text(' send to Seller')
            )
        )
    };

    // Trigger send to Seller
    function sendConfirmationToSFBroker(tasklet){
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
                $('<b>').text('Tasklet '),
                // ID
                $('<b>').text(tasklet.data.id),

                $('<b>').text(' confirmed')
            )
        )
    };

    // Trigger send computation cycles to SFBroker
    function sendConfirmationToSFBroker(tasklet){
        var zeit = new Date();
        $(this).prop("disabled",true);
        $('#' + tasklet.data.id + "_computation")
        $('#content').append(
            $('<li></li>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
                $('<b>').text('Computation cycles of tasklet '),
                // ID
                $('<b>').text(tasklet.data.id),

                $('<b>').text(' send')
            )
        )
    };

});