let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext("2d");

function debug() {
    console.log(...arguments);
    throw new Object();
}

// { x, y } are all in [0; 1)

// beginning's values shouldn't be greater than the corresponding values of end
let compressed = ({ beginning, end, renderer }) => ({ x, y }) => (
    x >= beginning.x && x < end.x
    && y >= beginning.y && y < end.y
    && renderer({
        x: (x - beginning.x) / (end.x - beginning.x),
        y: (y - beginning.y) / (end.y - beginning.y),
    })
);

let limitX = ({ beginning, end, renderer }) => ({ x, y }) => renderer({ x: (beginning + x * (1 - beginning)) * end, y });

let circle = () => {
    function distance(point1, point2) {
        return Math.hypot(point2.x - point1.x, point2.y - point1.y);
    }
    return ({ x, y }) => distance({ x, y }, { x: 0.5, y: 0.5 }) <= 0.5;
};

let letter = ({ characterCode }) => ({

}[characterCode] || (({ x, y }) => {
    // Rendering a question mark
    return circle()({ x, y });
}));

function partitionedHorizontally({ partAmount, partGap, renderer }) {
    return ({ x, y }) => {
        if (partAmount == 0) {
            return false;
        }
        let partIndex = Math.floor(x * partAmount);
        let compressedGap = partGap / partAmount;
        return limitX({ beginning: compressedGap, end: 1, renderer: compressed({ beginning: { x: partGap, y: 0 }, end: { x: 1, y: 1 }, renderer: renderer({ partIndex }) }) })({ x, y });
    };
}

function line({ gap, characters }) {
    return partitionedHorizontally({ partAmount: characters.length, partGap: gap, renderer: ({ partIndex }) => circle() });
    return partitionedHorizontally({
        partAmount: characters.length, partGap: gap, renderer: ({ partIndex }) => {
            return letter({ characterCode: characters[partIndex] });
        }
    });
}

let canvasImage = () => line({ characters: "BOLD", gap: 0.2 });

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
                if (canvasImage()({ x: xUnit, y: yUnit })) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
}

window.onresize = render;
render();
