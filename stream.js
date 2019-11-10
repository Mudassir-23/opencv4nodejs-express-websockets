const socketIOProvider = require('socket.io');
const cv = require('opencv4nodejs');

const fps = 30; //frames per second
/**
 * video source set to 0 for stream from webcam
 * video source can be set url from ip cam also eg: "http://192.168.1.112:8080/video"
 */
const videoSource = 0;
const videoCap = new cv.VideoCapture(videoSource);
videoCap.set(cv.CAP_PROP_FRAME_WIDTH, 600);
videoCap.set(cv.CAP_PROP_FRAME_HEIGHT, 600);

const stream = (server) => {
    const io = socketIOProvider(server);
    let processingIntervalMultiple = 10;
    setInterval(() => {
        const frame = videoCap.read();
        const image = cv.imencode('.jpg', frame).toString('base64');
        io.emit('new-frame', { live: image });
    }, 1000 / fps);
    /**
     * Since video/image transformations are computionally expensive operations, these operations are performed independent of live feed streaming.
     */
    setInterval(() => {
        const frame = videoCap.read();
        const frameWithFaces = faceDetector(frame);
        const imageWithFaces = cv.imencode('.jpg', frameWithFaces).toString('base64');
        io.emit('new-frame', { transformed: imageWithFaces });
    }, 10000 / fps);
};

/**
 * 
 * Face detection transformation on the stream
 */
const faceDetector = (frame) => {
    const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

    const detection = classifier.detectMultiScale(frame.bgrToGray());

    if (!detection.objects.length) {
        // no faces detectd
        return frame;
    }

    // draw faces
    const frameWithFaces = frame.copy();
    detection.objects.forEach((rect, i) => {
        const blue = new cv.Vec(255, 0, 0);
        frameWithFaces.drawRectangle(
            new cv.Point(rect.x, rect.y),
            new cv.Point(rect.x + rect.width, rect.y + rect.height), { color: blue, thickness: 2 }
        );
    });
    return frameWithFaces;
};
module.exports = stream;