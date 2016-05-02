# ws-monitor

A runtime and server monitor for Node.js applications with WebSocket based reporting.

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

#### Example - Monitoring from the Node.js application itself

Use a WebSocket library, such as `ws` to create a client and connect to the monitor.

```js
var WebSocket = require('ws');
var ws = new WebSocket('ws://localhost:8080');

ws.on('message', function(data, flags) {
  console.log(data);
});
```

You will get the following messages on the console,

    client connected to app monitor : IQ8KBIJZ600Y66R

    1462167081:HOSTNAME:0.35:4310102016:8506159104:0:14865080:31246592

    1462167086:HOSTNAME:5.357:4313698304:8506159104:0:15460720:32266496

    1462167091:HOSTNAME:10.393:4313415680:8506159104:0:15600072:32266496

    1462167096:HOSTNAME:15.421:4313788416:8506159104:0:15656288:32266496

    1462167101:HOSTNAME:20.443:4313341952:8506159104:0:15700144:32266496


### Options

The monitor object constructor accepts 2 parameters,

```js
var monitor = new WSMonitor({
                            port : 10080,
                            pollInterval : 1000
                            });
```

| Property  | Default   | Description |
|-----------|-----------|-------------|
| port          | 8080   | The port on which the WebSocket server of the monitor will be started |
| pollInterval  | 5000   | The interval in which the parameters are checked and reported, in milliseconds |

## Output Format

The output/report format received by the clients are as follows,

    <timestamp>:<hostname>:<application uptime>:<free memory>:<total memory>:<1 minute CPU load average>:<heap used>:<heap total>

Example,

    1462167101:HOSTNAME:20.443:4313341952:8506159104:0:15700144:32266496

Current version only supports this delimited output format. More formats support coming soon.

## Node.js version compatibility

Tested up to Node.js `v5.11.0`

## License

[MIT](LICENSE)

### Contributors

Authored by [Thimira Amaratunga](https://github.com/Thimira)
