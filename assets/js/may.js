
//声明变量
var citySel=d3.select("body").select("#info").select("#left").select("#city").select("#two").select("#citySelector").on("change",drawChart);
var chartSel=d3.select("body").select("#info").select("#left").select("#chart").select("#one").select("#chartSelector").on("change",load);
var direc="环比-utf-8/",fix=".csv";
var url="";
var chart="";
var selectedCity=0;
//声明函数

//初始化表格选项列表
function generateChart(){
  var charts=["新建住宅环比","新建商品住宅环比","二手住宅环比","144平米以上新建住宅环比","144平米以上二手住宅环比","90平米以下新建住宅环比","90平米以下二手住宅环比","90-144平米新建住宅环比","90-144平米二手住宅环比"];

  for(var i=0;i<charts.length;i++){
    var chart1=charts[i];
    var option=chartSel.append("option");
    option.attr("value",chart1);
    option.text(chart1);
    if(chart1=="新建住宅环比"){
      chart=chart1;
      url=direc+chart+fix;
      option.attr("selected",true);
    }
  }
}

//初始化城市选项列表
function generateCities(d){
  for(var i=0;i<d.length;i++){
    var option=citySel.append("option");
    option.attr("value",i);
    option.text(d[i].city);
    if(i==0){
      option.attr("selected",true);
      selectedCity=i;
    }
  }
}
//城市选项进行监听回调函数

function drawChart(){
  selectedCity=citySel.node().value;
  redraw();
}

//表格选项监听回调函数
function load(){
  chart=chartSel.node().value;
  url=direc+chart+fix;
  redraw(true);
}

//获取svg元素
var svg = d3.select("body").select("#info").select("#tab").select("svg"),
    margin = {top: 20, right: 0, bottom: 20, left: 20},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");



function customXAxis(g) {
  g.call(xAxis);
  g.select(".domain").remove();
}

function customYAxis(g) {
  g.call(yAxis).append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 40)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("指数环比（上月=100）");
  g.select(".domain").remove();
  g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
  g.selectAll(".tick text").attr("x", 4).attr("dy", -4);
}

generateChart();
//对csv文件数据进行转换
function row(data){
  /**/
  var obj=new Object();
  var attributes=Object.keys(data);

  var parseTime=d3.timeParse("%Y年%m月");
  obj.city=data[attributes[0]];
  obj.data=new Array();
  for(var j=1;j<attributes.length;j++){
    obj.data[j-1]=new Object();
    obj.data[j-1].time=parseTime(attributes[j]);
    obj.data[j-1].value=data[attributes[j]]==""?undefined:+data[attributes[j]];
  }
  return obj;
  /**/
  /****
  var array=new Array();
  var parseTime=d3.timeParse("%Y年%m月");
  var k=0;
  var attributes=Object.keys(data);
  for(var j=1;j<attributes.length;j++){
    array[k]=new Object();
    array[k].city=data[attributes[0]];
    array[k].time=parseTime(attributes[j]);
    array[k].value=data[attributes[j]]==""?undefined:+data[attributes[j]];
    k++;
  }
  //return an two dimension array,70X36.
  // with callback function end
  return array;
  **/
}
//初始化绘图
var formatNumber = d3.format(".1f");

var x = d3.scaleTime()
    .domain([new Date(2014, 2, 1), new Date(2017, 4,1)])
    .range([0, width]);

var y = d3.scaleLinear()
    .domain([90, 110])
    .range([height, 0]);

var xAxis = d3.axisBottom(x)
    .ticks(d3.Month);

var yAxis = d3.axisRight(y)
    .tickSize(width)
    .tickFormat(formatNumber);

g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(customXAxis);

g.append("g")
    .call(customYAxis);

var line = d3.line()
      .x(function(d) { return x(d.time); })
      .y(function(d) { return y(d.value); });
//向服务器请求csv文件
d3.csv(url,row,function(error,data){
        //添加路径
        if (error) throw error;
        //生成城市列表
        generateCities(data);
        g.append("path")
            .datum(data[selectedCity].data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line);
        //打点
        dot(g,data[selectedCity].data);
        //tips添加
        //tips(g,svg,data[selectedCity].data);
        //生成表格数据
        tabfill(data[selectedCity]);

});
//为g元素内的折线图打点
function dot(g,data){
  //对折线图打点
  for(var i=0;i<data.length;i++){
  }
  var dots =g.selectAll('circle')
    .data(data)
    .enter()
    .append('g')
    .append('circle')
    .attr('class', 'linecircle')
    .attr('cx', line.x())
    .attr('cy', line.y())
    .attr('r', 3.5)
    .attr("fill","steelblue")
    .on('mouseover', function() {
    d3.select(this).transition().duration(100).attr('r', 5).attr("fill","yellow");
  })
  .on('mouseout', function() {
    d3.select(this).transition().duration(100).attr('r', 3.5).attr("fill","steelblue");
  });
}
//tips添加
function tips(g,svg,data){
  //tips添加
  g.selectAll(".tips").remove();
  var tips = g.append('g').attr('class', 'tips');
  tips.append('rect')
    .attr('class', 'tips-border')
    .attr('width', 200)
    .attr('height', 50)
    .attr('rx', 10)
    .attr('ry', 10)
    .attr('fill',"steelblue");

  var wording1 = tips.append('text')
    .attr('class', 'tips-text')
    .attr('x', 10)
    .attr('y', 20)
    .text('');

  var wording2 = tips.append('text')
    .attr('class', 'tips-text')
    .attr('x', 10)
    .attr('y', 40)
    .text('');
    //tips show
    svg.on('mousemove', function() {
      //折线图由于点的大小存在一定误差
      var timeformat=d3.timeFormat("%Y年%m月");

      var m = d3.mouse(this),
        cx = m[0] - margin.left,
        cy=m[1]-margin.top,
        yvalue=formatNumber(y.invert(cy)),
        xvalue=timeformat(x.invert(cx));

      wording1.text("x:"+xvalue);
      wording2.text('y：' + yvalue);

      d3.select('.tips')
        .attr('transform', 'translate(' + cx + ',' + cy + ')');

      d3.select('.tips').style('display', 'block');
    })
    .on('mouseout', function() {
      d3.select('.tips').style('display', 'none');
    });
}
//重新绘制可视化数据
function redraw(type){
  d3.csv(url,row,function(error,data){
    if (error) throw error;
    if(type!=undefined&&type){
      generateCities(data);
    }
    g.select("path").remove();
    g.selectAll("circle").remove();
    g.append("path")
        .datum(data[selectedCity].data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);
    dot(g,data[selectedCity].data);
    //tips(g,svg,data[selectedCity].data);
    tabfill(data[selectedCity]);
  });
}
//初始化表格数据
function tabfill(o){
  var timeformat=d3.timeFormat("%Y年%m月");
  d3.select("body").select("#info").select("#right").select("#cityname").text(chart+"("+o.city+")");
  var tdiv=d3.select("body").select("#info").select("#right").select("#tdiv");
  tdiv.select("table").remove();
  var table=tdiv.append("table").attr("class","table table-striped");
  var tr=table.append("thead").append("tr");
  tr.append("th").text("时间");
  tr.append("th").text("环比（上月=100）");
  var tb=table.append("tbody");
  var array=o.data;
  console.log(array);
  for(var i=0;i<array.length;i++){
    var tmptr=tb.append("tr");
    tmptr.append("td").text(timeformat(array[i].time));
    tmptr.append("td").text(array[i].value);
  }
}
