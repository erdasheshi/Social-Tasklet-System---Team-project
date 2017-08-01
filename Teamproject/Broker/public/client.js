$(document).ready(function(){
    // WebSocket
    const conf = require('./../config.json');
    var socket = io.connect('http://' + conf.broker.ip  + ':' + conf.broker.port + '/');


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
                $('<span>').text('QoC Cost: ' + data.cost + ' ' + 'QoC Privacy: ' + data.privacy +' ' +'QoC Speed: ' + data.speed + ' ' + 'QoC Reliability: ' + data.reliability ))
        );

        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
    });

    // Step 5: Illustrating potential provider
    socket.on('ShowProviderInformation', function (data) {
        var zeit = new Date(data.zeit);
        if (typeof data.balance_check == 'undefined') {

            var provider = data.potentialprovider;
            var providerinformation = '';
            $.each(provider, function (i, val) {
                providerinformation += 'User: ' + val.username + ' - Price: ' + val.price + ' '
            });

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
                    $('<b>').text('Potential provider for Tasklet ' + data.taskletid + ' from ' + data.username + ': '),
                    // Potential provider
                    $('<b>').text(providerinformation)
                ));
        }
        else{
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
                    $('<b>').text('Consumer ' + data.consumer + ' does not have enough coins for tasklet ' + data.taskletid + '! Minimum Coins: ' + data.min_balance)
                ));
        }
        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
    });


});