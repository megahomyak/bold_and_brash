let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext("2d");

let debug = {
    print() {
        console.log(...arguments);
        throw "debug throw";
    },
    BoundChecker() {
        return {
            min: Infinity,
            max: -Infinity,
            register(number) {
                if (this.max < number) {
                    this.max = number;
                }
                if (this.min > number) {
                    this.min = number;
                }
            },
            print() {
                console.log(this.min, this.max);
            }
        }
    }
};

// { x, y } are all in [0; 1]

function distance(point1, point2) {
    return Math.hypot(point2.x - point1.x, point2.y - point1.y);
}

let combined = (...renderers) => ({ x, y }) => renderers.map(renderer => renderer({ x, y })).some(result => result);
let carved = ({ renderer, carver }) => ({ x, y }) => renderer({ x, y }) && !carver({ x, y });
// Beginning and end are { x: [0; 1], y: [0; 1] }
// Input requirements: beginning.x < end.x; beginning.y < end.y
let positioned = ({ beginning, end, renderer }) => ({ x, y }) => (
    x >= beginning.x && x < end.x
    && y >= beginning.y && y < end.y
    && renderer({
        x: (x - beginning.x) / (end.x - beginning.x),
        y: (y - beginning.y) / (end.y - beginning.y),
    })
);
let filled = () => ({ x: _x, y: _y }) => true;
let circle = () => ({ x, y }) => distance({ x, y }, { x: 0.5, y: 0.5 }) <= 0.5;
let questionMark = () => combined(
    // Lower dot
    positioned({ beginning: { x: 0.4, y: 0.825 }, end: { x: 0.6, y: 1 }, renderer: filled() }),
    // Upper part circle
    carved({
        renderer: positioned({ beginning: { x: 0, y: 0 }, end: { x: 1, y: 0.6 }, renderer: circle() }),
        carver: combined(
            // Hole in circle
            positioned({ beginning: { x: 0.25, y: 0.15 }, end: { x: 0.75, y: 0.45 }, renderer: circle() }),
            // Bottom left rectangle cut
            positioned({ beginning: { x: 0, y: 0.3 }, end: { x: 0.5, y: 0.6 }, renderer: filled() })
        ),
    }),
    // Circle down stem
    positioned({ beginning: { x: 0.4, y: 0.45 }, end: { x: 0.6, y: 0.7 }, renderer: filled() }),
);
let letter = ({ characterCode }) => ({

}[characterCode] || questionMark());
let partitioned = ({ coordinate, partAmount, partGap, renderer }) => {
    if (partAmount == 0) { return false; }
    let leftmostGap = partGap / partAmount;
    // Shifting the coordinate to after the leftmost gap before doing any processing
    coordinate = leftmostGap + coordinate * (1 - leftmostGap);
    let partIndex = Math.floor(coordinate * partAmount);
    if (partIndex == partAmount) partIndex--;
    let partLength = 1 / partAmount;
    let partBias = partIndex * partLength;
    // Getting the coordinate inside the part
    coordinate = (coordinate - partBias) * partAmount;
    if (coordinate < partGap) { return false; }
    // Getting the coordinate without part gap
    coordinate = (coordinate - partGap) / (1 - partGap);
    return renderer({ partIndex, coordinate });
};
let partitionedHorizontally = ({ partAmount, partGap, renderer }) => ({ x, y }) => partitioned({ coordinate: x, partAmount, partGap, renderer: ({ partIndex, coordinate }) => renderer({ partIndex })({ x: coordinate, y }) });
let partitionedVertically = ({ partAmount, partGap, renderer }) => ({ x, y }) => partitioned({ coordinate: y, partAmount, partGap, renderer: ({ partIndex, coordinate }) => renderer({ partIndex })({ x, y: coordinate }) });
let line = ({ line, characterGap }) => partitionedHorizontally({ partAmount: line.length, partGap: characterGap, renderer: ({ partIndex }) => letter({ characterCode: line[partIndex] }) });
let lines = ({ lines, lineGap, characterGap }) => partitionedVertically({ partAmount: lines.length, partGap: lineGap, renderer: ({ partIndex }) => line({ line: lines[partIndex], characterGap }) });
let canvasImage = lines({ lines: ["BOLD", "AND", "BRASH"], lineGap: 0.2, characterGap: 0.2 });
//let canvasImage = circle();

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
                let xUnit = x * (1 / (widthPx - 1));
                let yUnit = y * (1 / (heightPx - 1));
                if (canvasImage({ x: xUnit, y: yUnit })) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
}

window.onresize = render;
render();
