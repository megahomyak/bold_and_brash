let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext("2d");

let lines = ["BOLD", "AND", "BRASH"];

function check(xi, yi) {
    return true;
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
            let xi = (x + 1) / widthPx;
            let yi = (y + 1) / heightPx;
            if (check(xi, yi)) {
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}

window.onresize = render;
render();
