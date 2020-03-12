let canvas = document.querySelector("#drawing-board")
let ctx = canvas.getContext("2d");
let brush = document.getElementById("brush");
let eraser = document.getElementById("eraser");
let reSetCanvas = document.getElementById("clear");
let aColorBtn = document.getElementsByClassName("color-item");
let range = document.getElementById("range");
let undo = document.getElementById("undo");
let save = document.getElementById("save");

let clear = false;
let activeColor = 'black';
let lWidth = 4;

autoSetSize(canvas);
setCanvasBg('white');
listenToUser(canvas);
getColor();

//设置画布大小
//问题：改变窗口大小，之前的画没有了
function autoSetSize(canvas) {
    canvasSetSize();
    function canvasSetSize() {
        let pageW = document.documentElement.clientWidth;
        let pageH = document.documentElement.clientHeight;
        // 把变化之前的画布内容copy一份，然后重新画到画布上
        //通过 getImageData() 复制画布上指定矩形的像素数据，然后通过 putImageData() 将图像数据放回画布：
        let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        canvas.width = pageW;
        canvas.height = pageH;

        ctx.putImageData(imgData, 0, 0);
    }
    window.onresize = function () {
        canvasSetSize();
    }
}
//设置画布背景
function setCanvasBg(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

}
/* 
实现思路：监听鼠标事件，用drawCircle()方法把记录的数据画出来。

设置初始化当前画布功能为画笔状态，painting = false，
当鼠标按下时（mousedown），把painting设为true，表示正在画，鼠标没松开。把鼠标点记录下来。
当移动鼠标的时候，鼠标移动（mousemove）就把点记录下来并画出来。
如果鼠标移动过快，浏览器跟不上绘画速度，点与点之间会产品间隙，所以我们需要将画出的点用线连起来（lineTo()）。
鼠标松开的时候（mouseup），把painting设为false。
*/

//有问题！！！鼠标按下没有画点，并且按下后移动衔接为⚪---  原因：圆有半径，把半径去掉
function listenToUser(canvas) {
    //设置初始化当前画布功能为画笔状态
    let painting = false;
    let lastPoint = { x: undefined, y: undefined }

    //兼容移动端
    if (document.body.ontouchstart !== undefined) {
        //点击
        canvas.ontouchstart = function (e) {
            canvasDraw();
            painting = true;
            let x = e.targetTouches[0].clientX;
            let y = e.targetTouches[0].clientY;
            lastPoint = { "x": x, "y": y };
            ctx.save();
            drawCircle(x, y, 0);
        };
        //移动
        canvas.ontouchmove = function (e) {
            if (painting) {
                let x = e.targetTouches[0].clientX;
                let y = e.targetTouches[0].clientY;
                let newPoint = { "x": x, "y": y };
                drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);
                lastPoint = newPoint;
            }
        };
        //松开
        canvas.ontouchend = function () {
            painting = false;
        }
    } else {
        //鼠标按下
        canvas.onmousedown = function (ev) {
            canvasDraw();
            painting = true
            let x = ev.clientX;
            let y = ev.clientY;
            lastPoint = { "x": x, "y": y };
            ctx.save();
            drawCircle(x, y, 0, clear);
        };
        //移动鼠标
        canvas.onmousemove = function (ev) {
            if (painting) {
                let x = ev.clientX;
                let y = ev.clientY;
                let newPoint = { "x": x, "y": y };
                drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y, clear);
                lastPoint = newPoint;
            }
        };
        //鼠标松开
        canvas.onmouseup = function () {
            painting = false

        }
        //鼠标移开
        canvas.mouseleave = function () {
            painting = false;
        }
    }


    //画点的函数
    /* save：用来保存Canvas的状态。save之后，可以调用Canvas的平移、放缩、旋转、错切、裁剪等操作。 
       restore：用来恢复Canvas之前保存的状态。防止save后对Canvas执行的操作对后续的绘制有影响。

        对canvas中特定元素的旋转平移等操作实际上是对整个画布进行了操作，
        所以如果不对canvas进行save以及restore，那么每一次绘图都会在上一次的基础上进行操作，最后导致错位。 */
    function drawCircle(x, y, radius) {
        ctx.save();//保存当前画像
        ctx.beginPath();//开始一条路径
        ctx.arc(x, y, radius, 0, Math.PI * 2);//圆心x,圆心y,半径,起始角，结束角
        ctx.fill();//填充图形
        ctx.closePath();//闭合路径
        if (clear) {
            /* 圆形区域的擦除，也就是先实现一个圆形路径，然后把这个路径作为剪辑区域
                再清除像素就行了。有个注意点就是需要先保存绘图环境，
                清除完像素后要重置绘图环境，如果不重置的话以后的绘图都是会被限制在那个剪辑区域中。 */
            ctx.clip();//方法从原始画布中剪切任意形状和尺寸。
            ctx.clearRect(0, 0, canvas.width, canvas.height);//清空给定矩形内的指定像素
            ctx.restore();
        }
    }

    // 划线函数
    function drawLine(x1, y1, x2, y2) {
        ctx.lineWidth = lWidth;
        ctx.lineCap = "round";//向线条的每个末端添加圆形线帽。
        ctx.lineJoin = "round";//交汇时圆角
        ctx.save();//保存当前画像
        ctx.beginPath();//开始一条路径
        if (clear) {
            ctx.save();
            /* globalCompositeOperation:设置或返回如何将一个源（新的）图像绘制到目标（已有）的图像上。

                源图像 = 您打算放置到画布上的绘图。

                目标图像 = 您已经放置在画布上的绘图。 */
            ctx.globalCompositeOperation = "destination-out";//	在源图像外显示目标图像。只有源图像外的目标图像部分会被显示，源图像是透明的。
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.closePath();
            ctx.clip();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        } else {
            ctx.moveTo(x1, y1);//线条开始
            ctx.lineTo(x2, y2);//线条结束
            ctx.stroke();//绘制
            ctx.closePath();//返回起点
        }

    }
}
/* 获取橡皮擦元素
设置橡皮擦初始状态，clear = false。
监听橡皮擦click事件，点击橡皮擦，改变橡皮擦状态，clear = true。
clear为true时，移动鼠标使用canvas剪裁（clip()）擦除画布。 

注意：裁剪是指在裁剪区域去显示我们所画的图*/
eraser.onclick = function () {
    clear = true;
    this.classList.add("active");
    brush.classList.remove("active");
}
//画笔
brush.onclick = function () {
    clear = false;
    this.classList.add("active");
    eraser.classList.remove("active");
};
//清空画布  
//问题！！清空以后若点击撤销会返回之前画布，原因：historyDeta里记录了之前操作，没有清空
reSetCanvas.onclick = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBg('white');
    //清空historyDeta
    historyDeta.length = 0
};
//切换画笔颜色
function getColor() {
    for (let i = 0; i < aColorBtn.length; i++) {
        aColorBtn[i].onclick = function () {
            for (let i = 0; i < aColorBtn.length; i++) {
                //清除所有选中样式
                aColorBtn[i].classList.remove("active");
            }
            this.classList.add("active");
            activeColor = this.style.backgroundColor;
            /* fillStyle: 设置填充图形的颜色，渐变和模式。
               strokeStyle: 设置用于笔触（描边）的颜色，渐变和模式。 */
            ctx.fillStyle = activeColor;
            ctx.strokeStyle = activeColor;

        }
    }
}
//画笔大小
range.onchange = function () {
    lWidth = this.value;
};
//记录历史操作
let historyDeta = [];
// 绘制方法
function canvasDraw() {
    (historyDeta.length === 10) && (historyDeta.shift());//只能存十步操作
    // 添加新的绘制到历史记录
    historyDeta.push(canvas.toDataURL());

}
//撤销
//问题！！！最后一笔去不掉  原因：在鼠标抬起设置canvasDraw，应在鼠标按下设置
function canvasUndo() {
    if (historyDeta.length == 0) { alert('不能再继续撤销了'); return false; }
    let canvasPic = new Image();
    canvasPic.src = historyDeta[historyDeta.length - 1];
    canvasPic.onload = function () { ctx.drawImage(canvasPic, 0, 0); }
    historyDeta.pop()
}
undo.onclick = function () {
    canvasUndo();
}
//保存图片
/* 获取canvas.toDateURL
在页面里创建并插入一个a标签
a标签href等于canvas.toDateURL，并添加download属性
点击保存按钮，a标签触发click事件 */
save.onclick = function () {
    let imgUrl = canvas.toDataURL("image/png");//图片格式image/png
    let saveA = document.createElement("a");
    document.body.appendChild(saveA);
    saveA.href = imgUrl;
    saveA.download = "pic" + (new Date).getTime();
    saveA.target = "_blank";
    saveA.click();
};