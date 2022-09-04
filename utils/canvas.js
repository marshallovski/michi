function generateAvatar(
    text,
    foregroundColor = "white",
    backgroundColor = "black"
) {
    const { createCanvas, loadImage } = require('canvas');
    const canvas = createCanvas(200, 200);
    const context = canvas.getContext("2d");

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = "bold 100px Noto Sans";
    context.fillStyle = foregroundColor;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL("image/png");
}

// generateAvatar(
//     "DC",
//     "white",
//     "#009578"
// );

module.exports = {
    generateAvatar: generateAvatar
}