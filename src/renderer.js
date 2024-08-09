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

function check(xi, yi) { // xi and yi are [0; 1)
    function getFractionalPart(f) {
        return f % 1;
    }

    function between(f, smallerBound, greaterBound) {
        return f >= smallerBound && f <= greaterBound;
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

    function rect(x1, y1, x2, y2) {
        return between(cx, x1, x2) && between(cy, y1, y2);
    }

    function distance(x1, y1, x2, y2) {
        let xl = Math.abs(x1 - x2);
        let yl = Math.abs(y1 - y2);
        let dist = Math.hypot(xl, yl);
        return dist;
    }

    function circle(x, y, r) {
        return distance(cx, cy, x, y) <= r;
    }

    function slopeUp(x1, y1, x2, y2) {
        return (between(cx, x1, x2) && between(cy, y1, y2)) && ((x2 - cx) * (x2 - x1 / y2 - y1) <= cy - y1);
    }

    {
        let dot = rect(0.4, 0.8, 0.6, 1.0);
        let mainCircle = circle(0.5, 0.35, 0.35);
        let circleCutout = circle(0.5, 0.35, 0.15);
        let squareCutout = rect(0.0, 0.35, 0.5, 0.7);
        let slope = slopeUp(0.0, 0.0, 1.0, 0.5);
        return dot || (mainCircle && !circleCutout && !squareCutout) || slope;
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
