const canvas = document.getElementsByTagName("canvas")[0];
const ctx = canvas.getContext("2d");

const debug = {
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

const combined = (...renderers) => coordinates => renderers.map(renderer => renderer(coordinates)).some(result => result);
const carved = ({ renderer, carver }) => coordinates => renderer(coordinates) && !carver(coordinates);
// Beginning and end are { x: [0; 1], y: [0; 1] }
// Input requirements: beginning.x < end.x; beginning.y < end.y
const positioned = ({ beginning, end, renderer }) => ({ x, y }) => (
    x >= beginning.x && x <= end.x
    && y >= beginning.y && y <= end.y
    && renderer({
        x: (x - beginning.x) / (end.x - beginning.x),
        y: (y - beginning.y) / (end.y - beginning.y),
    })
);
const filled = () => ({ x: _x, y: _y }) => true;
const reversedByX = renderer => ({ x, y }) => renderer({ x: 1 - x, y });
const circle = () => ({ x, y }) => distance({ x, y }, { x: 0.5, y: 0.5 }) <= 0.5;
const questionMark = () => combined(
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
const slope = () => ({ x, y }) => x < y;
const letter = ({ characterCode }) => ({
    "L": combined(
        positioned({ beginning: { x: 0, y: 0 }, end: { x: 1 / 3, y: 1 }, renderer: filled() }),
        positioned({ beginning: { x: 0, y: 2 / 3 }, end: { x: 1, y: 1 }, renderer: filled() }),
    ),
    "O": carved({
        renderer: circle(),
        carver: positioned({ beginning: { x: 0.25, y: 0.25 }, end: { x: 0.75, y: 0.75 }, renderer: circle() })
    }),
    "A": combined(
        carved({
            renderer: reversedByX(slope()),
            carver: positioned({ beginning: { x: 0.2, y: 0.2 }, end: { x: 1, y: 1 }, renderer: reversedByX(slope()) })
        })
    ),
}[characterCode] || questionMark());
const partitioned = ({ coordinate, partAmount, partGap, renderer }) => {
    if (partAmount == 0) { return false; }
    const leftmostGap = partGap / partAmount;
    // Shifting the coordinate to after the leftmost gap before doing any processing
    coordinate = leftmostGap + coordinate * (1 - leftmostGap);
    let partIndex = Math.floor(coordinate * partAmount);
    if (partIndex == partAmount) partIndex--;
    const partLength = 1 / partAmount;
    const partBias = partIndex * partLength;
    // Getting the coordinate inside the part
    coordinate = (coordinate - partBias) * partAmount;
    if (coordinate < partGap) { return false; }
    // Getting the coordinate without part gap
    coordinate = (coordinate - partGap) / (1 - partGap);
    return renderer({ partIndex, coordinate });
};
const partitionedHorizontally = ({ partAmount, partGap, renderer }) => ({ x, y }) => partitioned({ coordinate: x, partAmount, partGap, renderer: ({ partIndex, coordinate }) => renderer({ partIndex })({ x: coordinate, y }) });
const partitionedVertically = ({ partAmount, partGap, renderer }) => ({ x, y }) => partitioned({ coordinate: y, partAmount, partGap, renderer: ({ partIndex, coordinate }) => renderer({ partIndex })({ x, y: coordinate }) });
const line = ({ line, characterGap }) => partitionedHorizontally({ partAmount: line.length, partGap: characterGap, renderer: ({ partIndex }) => letter({ characterCode: line[partIndex] }) });
const lines = ({ lines, lineGap, characterGap }) => partitionedVertically({ partAmount: lines.length, partGap: lineGap, renderer: ({ partIndex }) => line({ line: lines[partIndex], characterGap }) });
const canvasImage = lines({ lines: ["BOLD", "AND", "BRASH"], lineGap: 0.2, characterGap: 0.2 });

function render() {
    let widthPx, heightPx;
    { // Making the canvas crisp with any DPR
        const dpr = window.devicePixelRatio;
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
                const xUnit = x * (1 / (widthPx - 1));
                const yUnit = y * (1 / (heightPx - 1));
                if (canvasImage({ x: xUnit, y: yUnit })) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
}

window.onresize = render;
render();
