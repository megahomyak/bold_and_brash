let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext("2d");

// any number in this function is in [0; 1)
function check() {
    // beginning's values shouldn't be greater than the corresponding values of end
    function compress({ beginning, end, renderer }) {
        return ({x, y}) => {
            return (
                x >= beginning.x && x < end.x
                && y >= beginning.y && y < end.y
                && renderer({
                    x: (x - beginning.x) / (end.x - beginning.x),
                    y: (y - beginning.y) / (end.y - beginning.y),
                })
            );
        };
    }

    function circle() {
        function distance(point1, point2) {
            return Math.hypot(point2.x - point1.x, point2.y - point1.y);
        }
        return ({ x, y }) => {
            return distance({ x, y }, { x: 0.5, y: 0.5 }) <= 0.5;
        };
    }

    function letter(characterCode) {
        return {

        }[characterCode] || (({ x, y }) => {
            // Rendering a question mark

        });
    }

    function line(string) {
        let gap = 0.2 / string.length;
        return compress({  });
    }

    return compress({ beginning: { x: 0, y: 0 }, end: { x: 1, y: 1 / 3 }, renderer: circle() });
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
                let xUnit = x / widthPx;
                let yUnit = y / heightPx;
                if (check()({ x: xUnit, y: yUnit })) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
}

window.onresize = render;
render();
