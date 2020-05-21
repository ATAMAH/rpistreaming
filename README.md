# Raspberry Pi MJPEG low latency web streaming demo

This demo using stdout of raspivid and sends raw JPEG images to webpage in binary mode without any conversion to base64 and back.

### Quick start

```sh
$ wget https://github.com/ATAMAH/rpistreaming/archive/master.zip -o rpimjpeg.zip
$ unzip rpimjpeg.zip -d rpimjpeg
$ node rpimjpeg/server.js
```

Open webpage http://**your-rpi-ip-address**:8080

![webpage view](https://raw.githubusercontent.com/ATAMAH/rpistreaming/master/screen01.png)

### Some explanation

The frames capturing by [pi-camera-connect](https://github.com/servall/pi-camera-connect#readme) library as node.js Buffers:

```sh
streamCamera.on('frame', data => {
// data is JPEG image as Buffer
});
```

Then you can send these buffers as binary data over websockets to client webpage:

```sh
ws.send(data, {binary: true});
```

On client side you can cast this node.js **Buffer** directly to browser-JS **arraybuffer** cause on low-level they are both arrays of Uint8:
```sh
ws.onmessage = (event) => {
  var arrayBufferView = new Uint8Array(event.data);
```

Then we tell browser to treat this arraybuffer as Blob object with JPEG data in it:
```sh
var blob = new Blob([ arrayBufferView ], { type: "image/jpeg" });
```

So we have image on client side and can draw it, save or anything. This demo uses canvas to draw frames.

### FAQ

If you getting error like this on starting demo:

```sh
% Error opening camera: Error: Could not determine JPEG signature. Unknown system model 'BCM2835 - Pi 2 Model B'
```

You need to change file **node_modules\pi-camera-connect\dist\lib\stream-camera.js** like this ([issue](https://github.com/servall/pi-camera-connect/issues/10)):

```sh
switch (systemInfo.model) {
    case 'BCM2835 - Pi Zero':
    case 'BCM2835 - Pi Zero W':
    case 'BCM2835 - Pi 2 Model B':
    case 'BCM2835 - Pi 3 Model B':
    case 'BCM2835 - Pi 3 Model B+':
    case 'BCM2835 - Pi 4 Model B':
```

Or send PR to original lib.