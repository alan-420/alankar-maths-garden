var model;

async function loadModel() {
      model = await tf.loadGraphModel('TFJS/model.json')
  }
function predictImage(){
    // console.log('processing...');
    
    let image = cv.imread(canvas); //reading the image drawn on the canvas.

    // Steps to convert the image into black and white.
    cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 0);
    // the convert ted image is light.so we  make it bright.
    cv.threshold(image, image, 175, 255, cv.THRESH_BINARY );

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    // You can try more different parameters.

    cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    let cnt = contours.get(0);
    let rect = cv.boundingRect(cnt);
    image= image.roi(rect);

    var height = image.rows;
    var width = image.cols;

    if(height > width){
        height = 20;
        const scaleFactor = image.rows / height;
        width = Math.round(image.cols /scaleFactor)
    }else{
        width = 20;
        const scaleFactor = image.cols / width;
        height = Math.round(image.rows /scaleFactor);
    }


    let newSize = new cv.Size(width, height);
    cv.resize(image, image, newSize, 0, 0, cv.INTER_AREA)
    // Calculating the padding size.

    const LEFT = Math.ceil(4 + (20 - width) /2);
    const RIGHT = Math.floor(4 + (20 - width) / 2);
    const TOP = Math.ceil(4 + (20 - height) / 2);
    const BOTTOM = Math.floor(4 + (20 -height) / 2);

    // console.log(`top : ${TOP}, bottom : ${BOTTOM}, Left : ${LEFT}, Right : ${RIGHT}`);

    const BLACK = new cv.Scalar(0, 0, 0, 0);//Color of padding.
    cv.copyMakeBorder(image, image, TOP, BOTTOM, LEFT, RIGHT, cv.BORDER_CONSTANT, BLACK);// adding padding .
 
    // Centre of mass
    cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    cnt = contours.get(0);
    const Moments = cv.moments(cnt, false);
    // calculating x and y coordinate of the centre of mass.
    const cx = Moments.m10 / Moments.m00;
    const cy = Moments.m01 / Moments.m00;
    // console.log(`M00 : ${Moments.m00} , cx: ${cx}, cy: ${cy}`);

    // Shifting the image to its centre of mass.
    const X_SHIFT = Math.round(image.cols/2.0 - cx);
    const Y_SHIFT = Math.round(image.rows/2.0 - cy);

    newSize = new cv.Size(image.cols, image.rows);
    let trans_Matrix = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, X_SHIFT, 0, 1, Y_SHIFT]);

    cv.warpAffine(image, image, trans_Matrix, newSize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, BLACK );

    // Scaling the image data.
    let pixelValues = image.data; // this array hold integer values,so we have to convert it into float.
    // console.log(`pixelvalues: ${pixelValues}`);
    
    pixelValues = Float32Array.from(pixelValues);
    pixelValues = pixelValues.map(function(item){
        return item / 255.0;
    });

    // console.log(`ScalePixelValues: ${pixelValues}`);

    // Creating Tensor.
    const X = tf.tensor([pixelValues]);
    // console.log(`Shape of tensor: ${X.shape}`);
    // console.log(`Dtype of tensor: ${X.dtype}`);

    // Predicting the image.
    const result = model.predict(X);
    result.print();
    const Output = result.dataSync()[0];

    // Testing only(delete later)
    // const outputCanvas = document.createElement('CANVAS');
    // cv.imshow(outputCanvas, image);
    // document.body.appendChild(outputCanvas);

    //Cleanup
    image.delete();
    contours.delete();
    cnt.delete();
    hierarchy.delete();
    trans_Matrix.delete();
    X.dispose();
    result.dispose();
  
    return Output;
}