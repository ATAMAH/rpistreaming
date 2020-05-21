'use strict';

const express        = require('express');
const path           = require('path');
const errorHandler   = require('errorhandler');
const logger         = require('morgan');
const methodOverride = require('method-override');
const { StreamCamera, Codec } = require('pi-camera-connect');
const WebSocket      = require('ws');

// handle to our websocket server instance
var wsHandle;

function openWebServer() {
    var app = express();
    
    app.use(logger('dev'));
    app.use(methodOverride());

    app.use(express.static(path.join(__dirname, 'public')));

    if ('development' == app.get('env')) {
        app.use(errorHandler());
    }

    var listener = app.listen(8080, function() {
        let appPort = listener.address().port;

        console.log(`# Web server is listening on port ${appPort}`);
    });
};

function openWsServer() {
    wsHandle = new WebSocket.Server({ port: 8081 });

    console.log(`# WS server opened on ${8081}`);
};

function broadcastFrame(data) {
    if (wsHandle) {
        wsHandle.clients.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                // we sending frame (jpeg image) as Buffer in binary mode
                ws.send(data, {binary: true});
            }
        });
    }
};

function startCamera() {
    const streamCamera = new StreamCamera({
        codec: Codec.MJPEG,
        fps: 20,
        width: 640,
        height: 480,
        // increase this to reduce compression artefacts
        bitRate: 10000000 
    });

    streamCamera.startCapture().then(() => {
        console.log(`# Camera started`);
    })
    .catch(e => {
        console.log(`% Error opening camera: ${e}`);
    });

    streamCamera.on('frame', data => {
        // you can add some processing to frame data here
        // e.g let Mat = cv.imdecode(data)
        broadcastFrame(data);
    });
}

openWebServer();
openWsServer();
startCamera();
