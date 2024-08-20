let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext("2d");

function debug() {
    console.log(...arguments);
    throw new Object();
}

// { x, y } are all in [0; 1)

function distance(point1, point2) {
    return Math.hypot(point2.x - point1.x, point2.y - point1.y);
}

let rectangle = () => ({ x: _x, y: _y }) => true;
let circle = () => ({ x, y }) => distance({ x, y }, { x: 0.5, y: 0.5 }) <= 0.5;
let letter = ({ characterCode }) => ({

}[characterCode] || (
        /* Rendering a question mark */
        circle()
    ));
let partitioned = ({ coordinate, partAmount, partGap, renderer }) => {
    if (partAmount == 0) { return false; }
    let leftmostGap = partGap / partAmount;
    let a = coordinate;
    // Shifting the coordinate to after the leftmost gap before doing any processing
    coordinate = leftmostGap + coordinate * (1 - leftmostGap);
    let partIndex = Math.floor(coordinate * partAmount);
    let partLength = 1 / partAmount;
    let partBias = partIndex * partLength;
    // BUG AFTER THIS COMMENT, EVERYTHING IS CORRECT BEFORE THIS LINE
    let coordinateInsidePart = (coordinate - partBias) / partLength;
    if (coordinateInsidePart < partGap) { return false; }
    let coordinateWithoutPartGap = (coordinateInsidePart - partGap) * (1 + partGap);
    return renderer({ partIndex, coordinate: coordinateWithoutPartGap });
};
let partitionedHorizontally = ({ partAmount, partGap, renderer }) => ({ x, y }) => partitioned({ coordinate: x, partAmount, partGap, renderer: ({ partIndex, coordinate }) => renderer({ partIndex })({ x: coordinate, y }) });
let partitionedVertically = ({ partAmount, partGap, renderer }) => ({ x, y }) => partitioned({ coordinate: y, partAmount, partGap, renderer: ({ partIndex, coordinate }) => renderer({ partIndex })({ x, y: coordinate }) });
let line = ({ characters, characterGap }) => partitionedHorizontally({ partAmount: characters.length, partGap: characterGap, renderer: ({ partIndex }) => letter({ characterCode: characters[partIndex] }) });
let lines = ({ characters, lineGap, characterGap }) => partitionedVertically({ partAmount: characters.length, partGap: characterGap, renderer: ({ partIndex }) => letter({ characterCode: characters[partIndex] }) });
// let canvasImage = lines({ characters: ["BOLD", "AND", "BRASH"], lineGap: 0.2, characterGap: 0.2 });
let canvasImage = partitionedHorizontally({ partAmount: 4, partGap: 0.2, renderer: ({ partIndex }) => circle() });

function render() {
    let widthPx, heightPx;
    { // Making the canvas crisp with any DPR
        let dpr = window.devicePixelRatio;
        widthPx = Math.floor(ctx.canvas.clientWidth * dpr);
        heightPx = Math.floor(ctx.canvas.clientHeight * dpr);
        ctx.canvas.width = widthPx;
        ctx.canvas.height = heightPx;
    }

    { // Filling the canvas with black
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#FFFFFF";
    }

    { // Drawing every pixel
        for (let x = 0; x < widthPx; ++x) {
            for (let y = 0; y < heightPx; ++y) {
                let xUnit = x / widthPx;
                let yUnit = y / heightPx;
                if (canvasImage({ x: xUnit, y: yUnit })) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
}

window.onresize = render;
render();
