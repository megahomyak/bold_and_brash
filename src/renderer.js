let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext("2d");

// any number in this function is in [0; 1)
function check({x, y}) {
    // "p1" is "point 1", the beginning point
    // "p2" is "point 2", the ending point
    // p1's values shouldn't be greater than the corresponding values of p2
    function compress(p1, p2, renderer) {
        return (
            x >= p1.x && x < p2.x
            && y >= p1.y && y < p2.y
            && renderer({
                x: (x - p1.x) / (p2.x - p1.x),
                y: (y - p1.y) / (p2.y - p1.y),
            })
        );
    }

    function circle() {
        function distance(p1, p2) {
            return Math.hypot(p2.x - p1.x, p2.y - p1.y);
        }
        return ({x, y}) => {
            return distance({x, y}, {x: 0.5, y: 0.5}) <= 0.5;
        };
    }

    function line(string) {
        return ({x, y}) => {
            return 
        };
    }

    return compress({x: 0, y: 0}, {x: 1, y: 1/3}, circle());
}

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
                let xi = x / widthPx;
                let yi = y / heightPx;
                if (check({x: xi, y: yi})) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
}

window.onresize = render;
render();
