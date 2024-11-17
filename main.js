let canvas, uploadedImage;

function handleImageUpload() {
    const file = document.getElementById("upload").files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        uploadedImage = new Image();
        uploadedImage.onload = function() {
            canvas = new fabric.Canvas('canvas');
            scaleAndCenterImage(uploadedImage, 800, 600); 
            setupCanvasListeners();
        }
        uploadedImage.src = event.target.result;
    }

    reader.readAsDataURL(file);
}

function scaleAndCenterImage(img, targetWidth, targetHeight) {
    canvas.setWidth(targetWidth);
    canvas.setHeight(targetHeight);

    // Calculate scale to fill the canvas completely
    const scaleToFill = Math.max(targetWidth / img.width, targetHeight / img.height);
    
    // Calculate dimensions of the scaled image
    const scaledWidth = img.width * scaleToFill;
    const scaledHeight = img.height * scaleToFill;
    
    // Calculate cropping coordinates
    const left = (targetWidth - scaledWidth) / 2;
    const top = (targetHeight - scaledHeight) / 2;

    fabric.Image.fromURL(img.src, function(oImg) {
        oImg.scale(scaleToFill).set({
            left: left,
            top: top,
            clipTo: function(ctx) {
                ctx.rect(-left / scaleToFill, -top / scaleToFill, 
                         targetWidth / scaleToFill, targetHeight / scaleToFill);
            }
        });
        canvas.setBackgroundImage(oImg, canvas.renderAll.bind(canvas));
        setupCanvasListeners();
    });
}

document.getElementById('resizeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const width = parseInt(document.getElementById('widthInput').value);
    const height = parseInt(document.getElementById('heightInput').value);
    if (uploadedImage) {
        scaleAndCenterImage(uploadedImage, width, height);
    }
});

function setupCanvasListeners(){
    canvas.isDrawingMode = false;
    canvas.freeDrawingBrush.color = 'white';
    canvas.freeDrawingBrush.width = 5;

    $('#draw').off('click').on('click', function() {
        canvas.isDrawingMode = !canvas.isDrawingMode;
    });

    $('#rectangle').off('click').on('click', function () {
        canvas.isDrawingMode = false;
        const rectangle = new fabric.Rect({
            left:40,
            top: 40,
            width: 60,
            height: 60,
            fill:'transparent',
            stroke: 'white',
            strokeWidth: 7,
        });
        canvas.add(rectangle);
    });

    $('#circle').off('click').on('click', function () {
        canvas.isDrawingMode = false;
        const circle = new fabric.Circle({
            left:40,
            top: 40,
            radius: 60,
            fill:'transparent',
            stroke: 'white',
            strokeWidth: 7,
        });
        canvas.add(circle);
    });

    $('#text').off('click').on('click', function () {
        canvas.isDrawingMode = false;
        const text = new fabric.IText('Text',{
            left:40,
            top: 40,
            objecttype: 'text',
            fontFamily: 'Times New Roman black', 
            fill:'white',
        });
        canvas.add(text);
    });

    $('#remove').off('click').on('click', function () {
        canvas.isDrawingMode = false;
        canvas.remove(canvas.getActiveObject());
    });
    
    canvas.on ('selection:created', function() {
        $('#remove').prop('disabled', (''));
    });

    canvas.on ('selection:cleared', function() {
        $('#remove').prop('disabled', ('disabled'));
    });
    
    $('#tosvg').off('click').on('click', function (){
        $('#svg').html('<h1>EDITED:</h1><br>' + canvas.toSVG());
        showDownloadButton();
    });
    
    function showDownloadButton() {
        $('#downloadBtn').show();
    }
};

$('#downloadBtn').on('click', function() {
    var dataURL = canvas.toDataURL({
        format: 'jpg',
        quality: 1
    });

    var downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'edited_photo.jpg';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});