menuArray = [
    ['home', 'href="index.html">Home</a>'],
    ['features', 'href="whatis.html">Features</a>'],
    ['history', 'href="history.html">History</a>'],
    ['docs', 'href="http://openwisp.io/docs">Docs</a>'],
    ['support', 'href="support.html">Support</a>'],
    ['code', 'href="thecode.html">Code</a>'],
    ['people', 'href="about.html">People</a>']
];

footcont = `<div class="ui black inverted segment padding-vertical" id="footer">
<div class="ui container stackable two column grid">
  <div class="column logo white">
    <a href="./">OpenWISP</a>
  </div>
  <div class="column social">
    <a href="https://twitter.com/openwisp" class="ui twitter button">
      <i class="twitter icon"></i>
      Twitter
    </a>
    <a  href="https://facebook.com/openwisp" class="ui facebook button">
      <i class="facebook icon"></i>
      Facebook
    </a>
    <a href="https://www.linkedin.com/groups/4777261" class="ui linkedin button">
      <i class="linkedin icon"></i>
      Linked In
    </a>
    <a href="https://github.com/openwisp" class="ui black button">
      <i class="github icon"></i> Github
    </a>
  </div>
  <p>&copy; 2008-2018 OpenWISP and individual contributors.</p>
</div>
</div>
</div>`;


var headPart =  $("#head-content");

var selectedMenu = headPart.data("setactive");

var menuList = '';

for(var i = 0; i < menuArray.length; i++){
    if(menuArray[i][0] == selectedMenu){
        menuList = menuList + ' <a class="active item" ' + menuArray[i][1];
    }
    else{
        menuList = menuList + ' <a class="item" ' + menuArray[i][1];
    }
}

headcont = '<div class="ui sidebar vertical menu">' + 
menuList + '</div>' + `<div class="pusher">
<div class="ui grid" id="top-bar">
<div class="ui computer only column sixteen wide">
<div class="ui center aligned container secondary menu">
<h1 class="item logo">
<a href="./">OpenWISP</a>
</h1>
<div class="right menu">` + 
menuList + `</div>
</div>
</div>
<div class="ui mobile tablet only sixteen wide column">
<div class="ui menu">
<h1 class="item logo">
<a href="./">OpenWISP</a></h1>
<div class="right menu">
<div class="menu-open item">
<i class="sidebar icon"></i>
</div>
</div>
</div>
</div>
</div>`;

headPart.append(headcont);
$("#foot-content").append(footcont);
