/* 热映：https://douban.uieee.com/v2/movie/in_theaters
top250：https://douban.uieee.com/v2/movie/top250
获取即将上映电影：https://douban.uieee.com/v2/movie/coming_soon */
const movies = ['https://douban.uieee.com/v2/movie/top250','https://douban.uieee.com/v2/movie/coming_soon','https://douban.uieee.com/v2/movie/in_theaters'
]

//屏幕默认大小,初始化图片的占用位置
var windowHeight = window.screen.height+600;
var start = 1;
var count = 10;
var url = movies[0]
var p = 0;
var total = [];
var flag= [false,false,false];
window.onload =function(){   
    setTimeout(() => {
        $(".loading").hide();
        $(".movie").show();
    }, 2000); 
   new TabSwitch();
   init()
   //监听滚动事件,防抖
   window.document.addEventListener("scroll", debounce(painting,500));
   
}
//转换
function TabSwitch()
{
	var _this=this;	
	this.aTab=document.getElementById("nav").children;
	this.aDiv=document.querySelectorAll(".panel")
	
	for(let i=0;i<this.aTab.length;i++)
    {   
		this.aTab[i].index=i;
		this.aTab[i].onclick=function ()
		{
            _this.fnClick(this);
        }
    }
	
};
TabSwitch.prototype.fnClick=function (oBtn)
{
	//alert(this);
	for(var i=0;i<this.aTab.length;i++)
	{
		this.aTab[i].className=''
        this.aDiv[i].style.display='none';
	}
	oBtn.className='active';
    this.aDiv[oBtn.index].style.display='block';
    url = movies[oBtn.index];
    p = oBtn.index;
    start = 1;

}
function init(){
    var aDiv=document.querySelectorAll(".panel")
    for(var i = 0;i<aDiv.length;i++){
        let data = getInfo(count,start,movies[i]);
        total[i] = data.total;
        let oH1 = aDiv[i].querySelector("#title");
        oH1.innerHTML = data.title;  
       //初始加载  
        insertInfo(data,i);
    }
    
}

function painting(){
    if(flag[p]){return;}
    //document.documentElement.scrollTop:已经滚动的内容高度
    //window.screen.height: 窗口高度
    //document.documentElement.scrollHeight:能滚动的最大高度    
    if(document.documentElement.scrollTop+ window.screen.height > document.documentElement.scrollHeight){
        console.log(document.documentElement.scrollTop+ window.screen.height, document.documentElement.scrollHeight)
        //再此插入图片
        windowHeight+=600;           
        start +=count;  
       //比较count和total[p]
      if(start>total[p] && !flag[p]){        
          let oFooter = document.createElement("div");
          oFooter.className = "wrapper";
          oFooter.innerHTML = `<span class="line"></span>
          <span class="footer">我是有底线的</span>
          <span class="line"></span>`;
          var aDiv=document.querySelectorAll(".panel")  
          aDiv[p].appendChild(oFooter);
          flag[p]=true;
          count = 10;
          start = 1;
          return;}
        data = getInfo(count,start,url);    
        //到底了
        insertInfo(data,p);
}
}
//防抖
function debounce(func, wait) {
let timeout;
return function () {
    let context = this;
    let args = arguments;
    if (timeout) clearTimeout(timeout);  
    timeout = setTimeout(() => {
        func.apply(context, args)
    }, wait);
}
}
//制作电影模块
function make(imgId,data){
    //console.log(imgId,data);
    let oDiv = document.createElement("div");
    let oImg = document.createElement("img");
    let oDes = document.createElement("div");
    oDiv.className = "box";
    //跳转页面
    oDiv.onclick= function () {      
        window.location.href = data.subjects[imgId].alt;
    }
    //设置图片
    oImg.src = data.subjects[imgId].images.small;
    oDiv.appendChild(oImg);
    //电影名
    let title = data.subjects[imgId].title;
    //年份
    let year = data.subjects[imgId].year
    //评分
    let average = data.subjects[imgId].rating.average.toFixed(1);
    //类型
    let genres = [...data.subjects[imgId].genres]
    //主演
    let casts = data.subjects[imgId].casts.map((i)=>i.name);
    //导演
    let directors = data.subjects[imgId].directors.map((i)=>i.name);
    //总分
    let total = data.subjects[imgId].rating.max
    // 获得分数百分比
    const starPercentage = (average/ total) * 100;

    // 获得四舍五入到十位到分数百分比
    const starPercentageRounded = `${Math.round(starPercentage / 10) * 10}%`;
    oDes.className = "describe"
    oDes.innerHTML=`<p class = "movieTitle">${title}<span class = "year"> (${year})</span></p>
     <div class ="stars-outer"><div class ="stars-inner" style="width:${starPercentageRounded}"></div></div><span style="color:red;font-weight:bold"> ${average}</span>
    <p>类型：${genres}</p><p>导演：${directors}</p><p>主演：${casts}</p>`
    oDiv.appendChild(oDes);
    return oDiv;
}


//插入数据
function insertInfo(data,p){  
    var imgId = -1;
   //先插入10个
    var insert = setInterval(function(){ //就是给浏览器渲染图片的时间 
    var aDiv=document.querySelectorAll(".panel")  
    var mDiv = minDiv(aDiv[p]);   
    //插入图片 
    imgId++;
   if(imgId > data.subjects.length-1){
        console.log(p,imgId,data.subjects.length-1)
        clearInterval(insert);//停止定时器
        return;
    } 
    var img = make(imgId,data);
    mDiv.appendChild(img);//放图, 给浏览器一个指令. 插图. 但是浏览器的渲染还没有完成. 
    }, 100);//定时器, 每隔100毫秒. 运行一次function
}

//获取数据
 function getInfo(count,start,url){
   var data;  
    $.ajax({
        url:url+"?count="+count+"&start="+start,
        type:"get",
        async:false,
        dataType:"json",
         beforeSend: function(){
           $(".loading").show();
           $(".movie").hide();
        },
         complete:function(){
            $(".loading").hide();
           $(".movie").show();
          },
        success:function (res) {
            data = res
        },
        error:function (res) {
            console.log(res.status);
        }
    })
    return data;
}
/**
 * 计算当前哪一列是高度最小的
 */
var minDiv = function(panel){
    
    var pb1 = panel.querySelector("#pubu-01");
    var pb2 = panel.querySelector("#pubu-02");
    var pb3 = panel.querySelector("#pubu-03");
    var pb4 = panel.querySelector("#pubu-04");
  
    var pbImgs_1 = pb1.children;
    var pbImgs_2 = pb2.children;
    var pbImgs_3 = pb3.children;
    var pbImgs_4 = pb4.children;
    
    var pb1Height = compute(pbImgs_1);
    var pb2Height = compute(pbImgs_2);
    var pb3Height = compute(pbImgs_3);
    var pb4Height = compute(pbImgs_4);
    
    var minHeight = Math.min(pb1Height, pb2Height, pb3Height, pb4Height);
    
    if(minHeight == pb1Height){
        return pb1;
    }
    if(minHeight == pb2Height){
        return pb2;
    }
    if(minHeight == pb3Height){
        return pb3;
    }
    if(minHeight == pb4Height){
        return pb4;
    }
}
//瀑布流 --计算图片高度
var compute = function(pbImgs){
    if(pbImgs == null || pbImgs.length == 0){//这一列还没有图片
        return 0;
    } else {
        var height = 0;
        //获取到当前列每一个图片
        for(var i = 0 ; i < pbImgs.length;i++){
            var img = pbImgs[i];          
            var h = getHeight(img);
            height += h;//累加
        }
        return height;
    }
}
//克隆一个新建的图片
function getHeight(img){
    var node = img.cloneNode(true);
    //console.log(node);
    document.body.appendChild(node);//需要将新容器挂载到DOM中,浏览器才会进行高度计算
    let height = window.getComputedStyle(node).height;
    document.body.removeChild(node);//需要将镜像DOM进行移除
    if(height.indexOf('px')>0) {
        length = parseInt(height.split('px')[0]);
    }else {
        length = 0;
    }
    return length;
}
//回到顶部
$(".top").on("click", function() {
    $('html, body').animate({
      scrollTop: 0
    }, 'slow');
    return false;
  });
  //点击导航
 