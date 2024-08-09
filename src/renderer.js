let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext("2d");

let lines = ["BOLD", "AND", "BRASH"];

function printN(n) {
    return {
        print: function() {
            if (n != 0) {
                console.log(...arguments);
                n--;
            }
        }
    };
}

let p = printN(500);

function check(xi, yi) { // xi and yi are [0; 1)
    function getFractionalPart(f) {
        return f % 1;
    }

    function getInner(container, measure) {
        let containerMeasure = container.length * measure;
        let itemIndex = Math.floor(containerMeasure);
        let item = container[itemIndex];
        let scaledMeasure = getFractionalPart(containerMeasure);
        return [scaledMeasure, item];
    }
    let [cy, line] = getInner(lines, yi);
    let [cx, char] = getInner(line, xi);
    p.print(cx, cy, xi, yi);
    if (cx < 0.5 && cy < 0.5) {
        return true;
    }
    return false;
}

function render() {
    let dpr = window.devicePixelRatio;
    let widthPx = Math.floor(ctx.canvas.clientWidth * dpr);
    let heightPx = Math.floor(ctx.canvas.clientHeight * dpr);
    ctx.canvas.width = widthPx;
    ctx.canvas.height = heightPx;

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFFFFF";

    for (let x = 0; x < widthPx; ++x) {
        for (let y = 0; y < heightPx; ++y) {
            let xi = x / widthPx;
            let yi = y / heightPx;
            if (check(xi, yi)) {
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}

window.onresize = render;
render();
