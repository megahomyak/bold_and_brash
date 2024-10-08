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
                debug.print(this.min, this.max);
            }
        }
    }
};

// { x, y } are all in [0; 1]

function distance(point1, point2) {
    return Math.hypot(point2.x - point1.x, point2.y - point1.y);
}

const lineThickness = 0.2;

const combined = (...renderers) => coordinates => renderers.map(renderer => renderer(coordinates)).some(result => result);
// Beginning and end are { x: number, y: number }
// Input requirements: beginning.x < end.x; beginning.y < end.y
const horizontalLine = ({ beginning, end }) => ({ x, y }) => ;
const carved = ({ renderer, carver }) => coordinates => renderer(coordinates) && !carver(coordinates);
// Beginning and end are { x: number, y: number }
// Input requirements: beginning.x < end.x; beginning.y < end.y
const positioned = ({ beginning, end, renderer }) => ({ x, y }) => (
    x >= beginning.x && x <= end.x
    && y >= beginning.y && y <= end.y
    && renderer({
        x: (x - beginning.x) / (end.x - beginning.x),
        y: (y - beginning.y) / (end.y - beginning.y),
    })
);
const withReversedX = renderer => ({ x, y }) => renderer({ x: 1 - x, y });
const withReversedY = renderer => ({ x, y }) => renderer({ x, y: 1 - y });
const filled = () => ({ x: _x, y: _y }) => true;
const circle = ({ thickness }) => ({ x, y }) => {
    let dist = distance({ x, y }, { x: 0.5, y: 0.5 });
    return thickness <= dist && dist <= 0.5;
}
const slope = ({ thickness }) => ({ x, y }) => x < y && y - x <= thickness;
// Beginning and end are { x: number, y: number }
// Input requirements: beginning.x < end.x; beginning.y < end.y
const cropped = ({ beginning, end, renderer }) => ({ x, y }) => renderer({ x: beginning.x + x * (end.x - beginning.x), y: beginning.y + y * (end.y - beginning.y) });
const questionMark = () => combined(
    // Lower dot
    positioned({ beginning: { x: 0.4, y: 0.825 }, end: { x: 0.6, y: 1 }, renderer: filled() }),
    // Upper part circle
    carved({
        renderer: positioned({ beginning: { x: 0, y: 0 }, end: { x: 1, y: 0.6 }, renderer: circle({ thickness: 0.25 }) }),
        carver: combined(
            // Bottom left rectangular cut
            positioned({ beginning: { x: 0, y: 0.3 }, end: { x: 0.5, y: 0.6 }, renderer: filled() })
        ),
    }),
    // Circle down stem
    positioned({ beginning: { x: 0.4, y: 0.45 }, end: { x: 0.6, y: 0.7 }, renderer: filled() }),
);
const letter = ({ characterCode }) => ({
    "L": carved({
        renderer: filled(),
        carver: positioned({ beginning: { x: 1 / 3, y: 0 }, end: { x: 1, y: 2 / 3 }, renderer: filled() })
    }),
    "O": circle({ thickness: 0.25 }),
    "A": combined(
        // Right
        positioned({ beginning: { x: 0, y: 0 }, end: { x: 0.5, y: 1 }, renderer: withReversedX(slope({ thickness: 1 / 3 })) }),
        // Left
        positioned({ beginning: { x: 0.5, y: 0 }, end: { x: 1, y: 1 }, renderer: slope({ thickness: 1 / 3 }) }),
        // Middle connection
        positioned({ beginning: { x: 0.2, y: 0.6 }, end: { x: 0.8, y: 0.8 }, renderer: filled() })
    ),
    "D": combined(
        // Right arch
        positioned({
            beginning: { x: 0.5, y: 0 }, end: { x: 1, y: 1 }, renderer: cropped({
                beginning: { x: 0.5, y: 0 }, end: { x: 1, y: 1 }, renderer: circle({ thickness: 0.25 }),
            })
        }),
        // Left top line
        positioned({ beginning: { x: 0, y: 0 }, end: { x: 0.5, y: 0.25 }, renderer: filled() }),
        // Left bottom line
        positioned({ beginning: { x: 0, y: 0.75 }, end: { x: 0.5, y: 1 }, renderer: filled() }),
        // Leftmost connection line
        positioned({ beginning: { x: 0, y: 0 }, end: { x: 0.25, y: 1 }, renderer: filled() }),
    ),
    "B": (() => {
        let half = () => combined(
            // Right arch
            positioned({
                beginning: { x: 0.5, y: 0 }, end: { x: 1, y: 1 }, renderer: cropped({
                    beginning: { x: 0.5, y: 0 }, end: { x: 1, y: 1 }, renderer: circle({ thickness: 0.25 }),
                })
            }),
            // Left top line
            positioned({ beginning: { x: 0, y: 0 }, end: { x: 0.5, y: 0.25 }, renderer: filled() }),
            // Left bottom line
            positioned({ beginning: { x: 0, y: 0.75 }, end: { x: 0.5, y: 1 }, renderer: filled() }),
            // Leftmost connection line
            positioned({ beginning: { x: 0, y: 0 }, end: { x: 0.25, y: 1 }, renderer: filled() }),
        );
        return combined(
            // Lower
            positioned({ beginning: { x: 0, y: 0 }, end: { x: 1, y: 0.5 + 0.25 / 2 / 2 }, renderer: half() }),
            // Higher
            positioned({ beginning: { x: 0, y: 0.5 - 0.25/2/2 }, end: { x: 1, y: 1 }, renderer: half() }),
        );
    })(),
    "H": carved({
        renderer: filled(),
        carver: combined(
            // Upper cut
            positioned({ beginning: { x: 0.25, y: 0 }, end: { x: 0.75, y: 0.4 }, renderer: filled() }),
            // Lower cut
            positioned({ beginning: { x: 0.25, y: 0.6 }, end: { x: 0.75, y: 1 }, renderer: filled() }),
        ),
    }),
    "N": carved({
        renderer: filled(),
        carver: combined(
            positioned({ beginning: { x: 0.25, y: 0 }, end: { x: 0.75, y: 2 / 3 }, renderer: withReversedX(withReversedY(slope({ thickness: Infinity }))) }),
            positioned({ beginning: { x: 0.25, y: 1 / 3 }, end: { x: 0.75, y: 1 }, renderer: slope({ thickness: Infinity }) }),
        ),
    }),
    "S": combined(
        // Upper part
        carved({
            renderer: positioned({ beginning: { x: 0, y: 0 }, end: { x: 1, y: 0.5625 }, renderer: circle({ thickness: 0.25 }) }),
            carver: combined(
                // Bottom right rectangular cut
                positioned({ beginning: { x: 0.5, y: 0.25 }, end: { x: 1, y: 0.5625 }, renderer: filled() })
            ),
        }),
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
