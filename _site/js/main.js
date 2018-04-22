var normal = document.getElementById("nav-menu");
var reverse = document.getElementById("nav-menu-left");

var icon = normal !== null ? normal : reverse;

// Toggle the "menu-open" % "menu-opn-left" classes
function toggle() {
	  var navRight = document.getElementById("nav");
	  var navLeft = document.getElementById("nav-left");
	  var nav = navRight !== null ? navRight : navLeft;

	  var button = document.getElementById("menu");
	  var site = document.getElementById("wrap");
	  
	  if (nav.className == "menu-open" || nav.className == "menu-open-left") {
	  	  nav.className = "";
	  	  button.className = "";
	  	  site.className = "";
	  } else if (reverse !== null) {
	  	  nav.className += "menu-open-left";
	  	  button.className += "btn-close";
	  	  site.className += "fixed";
	  } else {
	  	  nav.className += "menu-open";
	  	  button.className += "btn-close";
	  	  site.className += "fixed";
	    }
	}

// Ensures backward compatibility with IE old versions
function menuClick() {
	if (document.addEventListener && icon !== null) {
		icon.addEventListener('click', toggle);
	} else if (document.attachEvent && icon !== null) {
		icon.attachEvent('onclick', toggle);
	} else {
		return;
	}
}

menuClick();

window.onload = function() {
	wx.config({
      debug: true,
      appId: 'wxf8b4f85f3a794e77',
      timestamp: 1524384232,
      nonceStr: 'rBFHuB4686xzJnaL',
      signature: '9aa0602eb4f1da3b8fe25c389a92bf7f68f5551d',
      jsApiList: [
        'checkJsApi',
        'onMenuShareAppMessage',
        'onMenuShareTimeline',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'onMenuShareQZone'
      ]
  	});

	wx.ready(function () {

		var shareObj = {
	      title: document.title,
	      desc: document.querySelector('meta[name="description"]').getAttribute('content'),
	      link: location.href,
	      imgUrl: 'http://usercontents.authing.cn/client/logo-dark-colorful.jpg',
	      fail: function (res) {
	        alert('对不起，分享失败');
	      }
	    }

	    wx.onMenuShareAppMessage(shareObj);
	    wx.onMenuShareTimeline(shareObj);
	    wx.onMenuShareQQ(shareObj);
	    wx.onMenuShareWeibo(shareObj);
	});
}