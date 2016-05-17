var Monitor = require('monitor');
var WebSocketServer = require('ws').Server;
var _ = require('underscore');

function WSMonitor(options) {
    if (this instanceof WSMonitor === false) {
        return new WSMonitor(options);
    }

    options = options || {};

    this.webSocketClients = {};

    this.port = options.port || 8080;
    this.pollInterval = options.pollInterval || 5000;
    this.debug = options.debug || false;

    // checking and setting up the logger.
    if (options.logger &&
        typeof options.logger.debug === "function" &&
        typeof options.logger.info === "function" &&
        typeof options.logger.error === "function") {
        this.logger = options.logger;
    }

    this.wss = new WebSocketServer({
        port : this.port
    });

    console.info("Application monitor started on port " + this.port);

    var pmOptions = {
        probeClass : 'Process',
        initParams : {
            pollInterval : this.pollInterval
        }
    };

    this.processMonitor = new Monitor(pmOptions);

    var self = this;

    this.wss.on('connection', function(ws) {
        ws.on('message', function(message) {
            self.logMessage('received message from client: ' + message);
        });
        var clients = this.clients;

        var clientId = self.generateClientId();
        self.webSocketClients[clientId] = ws;
        ws.clientId = clientId;

        self.logMessage("client connected to app monitor : " + clientId);

        if (!self.processMonitor.isConnected()) {
            self.processMonitor.connect(function(error) {
                if (error) {
                    self.logError('Error connecting with the process probe: ' + error);
                }
            });
        }

        ws.on('close', function() {
            self.logMessage("client disconnected from app monitor : " + ws.clientId);
            delete self.webSocketClients[ws.clientId];
            if (_.keys(self.webSocketClients).length === 0) {
                self.logMessage("no clients connected to app monitor");
                self.logMessage("halting app monitor");
                self.processMonitor.disconnect(function(error) {
                    if (error) {
                        self.logError('Error disconnecting the process probe: ' + error);
                    }
                });
            }
        });
    });

    this.wss.on('error', function(error) {
        self.logError('Error on application monitor WS server: ' + error);
    });

    this.processMonitor.on('change', function() {
        var hostname = self.processMonitor.get('hostname');
        var uptime = self.processMonitor.get('uptime');
        var freemem = self.processMonitor.get('freemem');
        var totalmem = self.processMonitor.get('totalmem');
        var loadavg = self.processMonitor.get('loadavg');
        var heapUsed = self.processMonitor.get('heapUsed');
        var heapTotal = self.processMonitor.get('heapTotal');

        // get current timestamp
        var now = Math.round(+new Date() / 1000);

        var statData = now + ":" + hostname + ":" + uptime + ":" + freemem + ":" + totalmem + ":" + loadavg[0] + ":" + heapUsed + ":" + heapTotal;
        self.logMessage('Sending stat data: ' + statData);
        self.broadcastAll(statData);
    });
}

/**
 * Broadcast the message to all the connected WS clients.
 */
WSMonitor.prototype.broadcastAll = function(msg) {
    var self = this;

    _.each(self.webSocketClients, function(client) {
        client.send(msg, function(error) {
            if (error) {
                self.logError('error sending data to app monitor client : ' + error);
            }
        });
    });

};

/**
 * log debug messages to console if debug on tion is on.
 */
WSMonitor.prototype.logMessage = function(msg) {
    if (msg && this.debug) {
        console.info('[INFO] ' + msg);
    }
};

/**
 * log error messages to console.
 */
WSMonitor.prototype.logError = function(error) {
    if (error) {
        console.error('[ERROR] ' + error);
    }
};

/**
 * Generate a unique client ID for each of the connected WS clients.
 */
WSMonitor.prototype.generateClientId = function() {
    var self = this;

    var dStr = Math.random().toString(36).substring(2).toUpperCase();

    while (self.webSocketClients[dStr]) {
        console.info('ID collision: ' + dstr);
        dStr = Math.random().toString(36).substring(2).toUpperCase();
    }

    return dStr;
};

module.exports = WSMonitor;


