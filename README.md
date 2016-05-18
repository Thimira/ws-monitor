# ws-monitor

A runtime and server monitor for Node.js applications with WebSocket based reporting.

This allows cross-application monitoring stats sharing through WebSockets, allowing you to create central monitoring applications and dashboards.

![ws-monitor usage](docs/ws-monitor.jpg?raw=true "ws-monitor usage")

Still in Beta with very limited functionality. More options and customizability coming soon.

## Installation

    npm install ws-monitor

## Usage

Require the ws-monitor module and create a WSMonitor object,

```js
var WSMonitor = require('ws-monitor');

var monitor = new WSMonitor();
```

This will start the ws-monitor with the default options: running on port 8080 with 5 second poll interval.

You will see the following message on the Node.js console.

    Application monitor started on port 8080

You can then use any WebSocket client to connect with the monitor and start receiving the monitor data.

Multiple clients can be connected to the same monitor, and all messages will be broadcasted to all the clients alike.

#### Example - Monitoring from a Node.js application

You can connect to the WebSocket server of the monitor through the same Node.js application which you have it installed, or from a different application, allowing cross-application monitor data sharing.

In the Node.js application, use a WebSocket library, such as `ws` to create a client and connect to the monitor.

```js
var WebSocket = require('ws');
var ws = new WebSocket('ws://localhost:8080');

ws.on('message', function(data, flags) {
  console.log(data);
});
```

You will get the following messages on the console,

    1462167081:HOSTNAME:0.35:4310102016:8506159104:0:14865080:31246592

    1462167086:HOSTNAME:5.357:4313698304:8506159104:0:15460720:32266496

    1462167091:HOSTNAME:10.393:4313415680:8506159104:0:15600072:32266496

    ....

    ....

#### Example - Monitoring from a Javascript frontend

If you want to monitor from the frontend - such as when you want to build a dashboard to view your Node.js application performance - you can use the javascript built-n WebSocket capability to connect to the WebSocket server of the monitor,

```js
    var exampleSocket = new WebSocket("ws://localhost:8080");

    exampleSocket.onmessage = function (event) {
        console.log(event.data);
    };
```

### Options

The monitor object constructor accepts several parameters,

```js
var monitor = new WSMonitor({
                            port : 10080,
                            pollInterval : 1000,
                            debug : true
                            });
```

| Property  | Default   | Description |
|-----------|-----------|-------------|
| port          | 8080   | The port on which the WebSocket server of the monitor will be started |
| pollInterval  | 5000   | The interval in which the parameters are checked and reported, in milliseconds |
| debug         | false  | Whether the debug messages should be printed out to console |

## Output Format

The output/report format received by the clients are as follows,

    <timestamp>:<hostname>:<application uptime>:<free memory>:<total memory>:<1 minute CPU load average>:<heap used>:<heap total>

Example,

    1462167101:HOSTNAME:20.443:4313341952:8506159104:0:15700144:32266496

Current version only supports this delimited output format. More formats support coming soon.

## Resource Friendliness

The WS-Monitor will keep track of the clients connected to it. And, if it detects that no clients are connected, it will automatically shutdown the monitoring process, and will start it up again when a client connects again, preventing the use of server resources unnecessarily,

    [INFO] client disconnected from app monitor : 1R1ZFWHG47QILIK9
    [INFO] no clients connected to app monitor
    [INFO] halting app monitor

## Node.js version compatibility

Tested up to Node.js `v5.11.0`

## License

[MIT](LICENSE)

### Contributors

Authored by [Thimira Amaratunga](https://github.com/Thimira)
