var Monitor = require('monitor');
var WebSocketServer = require('ws').Server;
var _ = require('underscore');

function WSMonitor(options) {
    if (this instanceof WSMonitor === false) {
        return new WSMonitor(options);
    }

    options = options || {};

    var webSocketClients = {};

    var port = options.port || 8080;

    var wss = new WebSocketServer({
        port : port
    });

    console.info("Application monitor started on port " + port);

    var pmOptions = {
        probeClass : 'Process',
        initParams : {
            pollInterval : options.pollInterval || 5000
        }
    };

    var processMonitor = new Monitor(pmOptions);

    wss.on('connection', function(ws) {
        ws.on('message', function(message) {
            console.info('received message from client: ' + message);
        });
        var clients = this.clients;

        var clientId = generateClientId();
        webSocketClients[clientId] = ws;
        ws.clientId = clientId;

        console.info("client connected to app monitor : " + clientId);

        if (!processMonitor.isConnected()) {
            processMonitor.connect(function(error) {
                if (error) {
                    console.error('Error connecting with the process probe: ' + error);
                }
            });
        }

        ws.on('close', function() {
            app.logger.info("client disconnected from app monitor : " + ws.clientId);
            delete webSocketClients[ws.clientId];
            if (_.keys(webSocketClients).length === 0) {
                console.info("no clients connected to app monitor");
                console.info("halting app monitor");
                processMonitor.disconnect(function(error) {
                    if (error) {
                        console.error('Error disconnecting the process probe: ' + error);
                    }
                });
            }
        });
    });

    wss.on('error', function(error) {
        console.error('Error on application monitor WS server: ' + error);
    });

    processMonitor.on('change', function() {
        var hostname = processMonitor.get('hostname');
        var uptime = processMonitor.get('uptime');
        var freemem = processMonitor.get('freemem');
        var totalmem = processMonitor.get('totalmem');
        var loadavg = processMonitor.get('loadavg');
        var heapUsed = processMonitor.get('heapUsed');
        var heapTotal = processMonitor.get('heapTotal');

        // get current timestamp
        var now = Math.round(+new Date() / 1000);

        var statData = now + ":" + hostname + ":" + uptime + ":" + freemem + ":" + totalmem + ":" + loadavg[0] + ":" + heapUsed + ":" + heapTotal;
        console.info('Sending stat data: ' + statData);
        broadcastAll(statData);
    });

    var logError = function(error) {
        if (error) {
            console.error('error sending data to app monitor client : ' + error);
        }
    };

    var broadcastAll = function(msg) {
        for ( var i in webSocketClients) {
            if (!webSocketClients.hasOwnProperty(i)) {
                continue;
            }
            (webSocketClients[i]).send(msg, function ack(error) {
                logError(error);
            });
        }
    };

    var generateClientId = function() {
        var dStr = Math.random().toString(36).substring(2).toUpperCase();

        while (webSocketClients[dStr]) {
            console.info('ID collision: ' + dstr);
            dStr = Math.random().toString(36).substring(2).toUpperCase();
        }

        return dStr;
    };
}

module.exports = WSMonitor;


