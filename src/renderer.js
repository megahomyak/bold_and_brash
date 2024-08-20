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
// CIRCLE IS BUGGY! CROPPED ON THE RIGHT!
let circle = () => ({ x, y }) => distance({ x, y }, { x: 0.5, y: 0.5 }) <= 0.5;
let letter = ({ characterCode }) => ({

}[characterCode] || (
        /* Rendering a question mark */
        circle()
    ));
let partitioned = ({ coordinate, partAmount, partGap, renderer }) => {
    if (partAmount == 0) { return false; }
    let leftmostGap = partGap / partAmount;
    // Shifting the coordinate to after the leftmost gap before doing any processing
    coordinate = leftmostGap + coordinate * (1 - leftmostGap);
    let partIndex = Math.floor(coordinate * partAmount);
    let partLength = 1 / partAmount;
    let partBias = partIndex * partLength;
    // Getting the coordinate inside the part
    coordinate = (coordinate - partBias) / partLength;
    if (coordinate < partGap) { return false; }
    // Getting the coordinate without part gap
    coordinate = (coordinate - partGap) * (1 + partGap);
    return renderer({ partIndex, coordinate });
};
let partitionedHorizontally = ({ partAmount, partGap, renderer }) => ({ x, y }) => partitioned({ coordinate: x, partAmount, partGap, renderer: ({ partIndex, coordinate }) => renderer({ partIndex })({ x: coordinate, y }) });
let partitionedVertically = ({ partAmount, partGap, renderer }) => ({ x, y }) => partitioned({ coordinate: y, partAmount, partGap, renderer: ({ partIndex, coordinate }) => renderer({ partIndex })({ x, y: coordinate }) });
let line = ({ line, characterGap }) => partitionedHorizontally({ partAmount: line.length, partGap: characterGap, renderer: ({ partIndex }) => letter({ characterCode: line[partIndex] }) });
let lines = ({ lines, lineGap, characterGap }) => partitionedVertically({ partAmount: lines.length, partGap: lineGap, renderer: ({ partIndex }) => line({ line: lines[partIndex], characterGap }) });
let canvasImage = lines({ lines: ["BOLD", "AND", "BRASH"], lineGap: 0.2, characterGap: 0.2 });

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
        let minX = +inf;
        let minY = +inf;
        let maxX = 0;
        let maxY = 0;
        for (let x = 0; x < widthPx; ++x) {
            for (let y = 0; y < heightPx; ++y) {
                let xUnit = x * (1 / (widthPx - 1));
                let yUnit = y * (1 / (heightPx - 1));
                if (xUnit > maxX) {
                    maxX = xUnit;
                }
                if (xUnit < minX) {
                    minX = xUnit;
                }
                if (yUnit > maxY) {
                    maxY = yUnit;
                }
                if (yUnit < minY) {
                    minY = yUnit;
                }
                if (canvasImage({ x: xUnit, y: yUnit })) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        debug(maxX, maxY);
    }
}

window.onresize = render;
render();
