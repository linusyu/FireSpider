/*FireSpider*/
;(function(config) {

	"use strict";
	
	if(window.fireSpider) return;
	
	const Cu = Components.utils;
	const Cc = Components.classes;
	const Ci = Components.interfaces;
	
	Cu.import("resource://gre/modules/Task.jsm");
	Cu.import("resource://gre/modules/osfile.jsm");
	Cu.import("resource://gre/modules/NetUtil.jsm");
	Cu.import("resource://gre/modules/Downloads.jsm");
	Cu.import( 'resource://services-common/observers.js');
	
	var configFile = Cc['@mozilla.org/file/directory_service;1']
				.getService(Ci.nsIProperties)
				.get('ProfD', Ci.nsIFile);
	configFile.appendRelativePath('firespider');
	configFile.append('firespider.json');
	
	var selfScript = Cc['@mozilla.org/file/directory_service;1']
				.getService(Ci.nsIProperties)
				.get('UChrm', Ci.nsIFile);
	selfScript.append('FireSpider.uc.js');
			
	window.fireSpider = {
		version: "0.2.1",
		protocol: "",
		host: "",
		href: "",
		URI: "",
		single:0,
		scriptURL:"https://raw.githubusercontent.com/linusyu/FireSpider/master/FireSpider.uc.js",
		configURL:"https://raw.githubusercontent.com/linusyu/FireSpider/master/firespider.json",
		versionURL:"https://raw.githubusercontent.com/linusyu/FireSpider/master/version.json",
		icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzUxNDJDNkNEODNCMTFFM0FEREZEMDY3ODExOUIwMDIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzUxNDJDNkREODNCMTFFM0FEREZEMDY3ODExOUIwMDIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozNTE0MkM2QUQ4M0IxMUUzQURERkQwNjc4MTE5QjAwMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozNTE0MkM2QkQ4M0IxMUUzQURERkQwNjc4MTE5QjAwMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhZkhEEAAAPASURBVHjaTJTfb5NVGMc/zznnbdlaRle3MQaMsmxBcCGZOkWEGAlRrvBCTQyBay+Jf4nRGC818Yo7ExOFGBMvTLjQRawyCTBEXDcGHV072q7t+77n+HQC8U3O6dtz3uc53x/Pc+S0gXkgKxReCxz/GX5JHNWVhO1nt6N4NOWN1cD6P16ujpowNQG1tcAjKzx7TH/qGjLW886GN3ORl2p/sasfhQBJQs1mWB+GD2suzNyLKPYiPhBhlP89JuvZG3l2nMxwqsBA50VylHpZerrZ1HHbw9cpC3cNN+YTOTuZsmhiMro1I7r3dJi3kPM1T5eua2wSN5bp8K2mGfBsA08t9GK2Ogk/xRKkHtjX8zwqCa0JJfR0uBbswzG+kCS/imOkmeJ2CYnS2xkHgk1pZg3GBbLVIKub+t/h7pvUr3j8M2r2EDJS8tErfxj/1eFU3tPcjGqAMWEk72XGGdIiuIkgEmFvP4+bjGG6Cjd7SLuFZVPB23cZuz6DP/ogSDm16Q9D4s+1gkR3AvdKEi4Whbl1L3W37YkZTvFvLrmkvBT8n30kf2mSRQJ2VqdF4txu4pPjwTxeDuFaCXtsCF8aET4aC5waMrw0FNxxpXLgFuE31agyix3KIfV1TEgVlfUSU4fVA9j5HJzPE51QNkcEmQqoathRFzJ1g32wiV8r4MeHye5XMC9HcPARLLcJbbtPoalk6S7Nmcc/lyITLTW0QSh77JiKvl8NudbEX9OghS3MSg9zW5MuRcjbCel0C3PdvqDijiAnJrEXmsiSU7g1kksJcrhAdC4hRA4zHRPm7mB+VPTf7CF5v0k0vkLyRQ671xN6cgFXnMB+XsF/nMftEcLDvYQbFlPOKpq+wSowsc51oltV4jNdpDaJu/SYzpX7yCcDmCNGS+VYTTVqkt7MEM7chat6WqGBjbtPuqjfdpEWcx6xekDpITRWCV8O4k4/xsxWMBV7EDmmrXC5iJ3MYg4p7ysJiSbxo1ovr+uvYlHj1d0GsqBrn4HvtJFbecxupd97SLJoNuDvLfxN/quR2g4Nuw+tDcL3HX1vaCLVjoqiqpCWV0k3Ov0CJI6rhO902e0nKjrVZXkXIVWK2SrpmoqKwmZQNVLLL+Ywr7ZI25uE3/Wgy4qKgkZn1CTVrasHDiiTQWeJ1oTUdAjdLe3PRNXYqUhiZF0t/lSFLKp+3S6mtePJvaOGaJp+M9mNFr6s5VG3U5hErx2tTjZjDdLqbWjDN41+rnrppWK29EqJk+1g2NK1fkJFoW8St/F9qt1/BRgAq9C1IFpzSmgAAAAASUVORK5CYII=",
	
		init: function() {
			let navBar = document.querySelector("#nav-bar-customization-target") || 
						document.querySelector("#nav-bar");
			let firespiderTbb = document.createElement("toolbarbutton");
			navBar.appendChild(firespiderTbb);
			firespiderTbb.id = "firespider-tbb";
			firespiderTbb.label = "FireSpider";
			firespiderTbb.className = "toolbarbutton-1 chromeclass-toolbar-additional";
			firespiderTbb.addEventListener("click",this.command.openMenu,false);
			firespiderTbb.style.listStyleImage = "url("+this.icon+")";
			firespiderTbb.innerHTML = '<menupopup>\
			<menuitem label="下载全部页大图" oncommand="fireSpider.downloadInit(0)"></menuitem>\
			<menuitem label="下载当前页大图" oncommand="fireSpider.downloadInit(1)"></menuitem>\
			<menuseparator></menuseparator>\
			<menu id="fp-menu" label="已匹配的网站"></menu>\
			<menuitem label="打开下载文件夹" oncommand="fireSpider.command.openFolder()"></menuitem>\
			<menuseparator></menuseparator>\
			<menuitem label="规则配置" oncommand="fireSpider.configWindow()"></menuitem>\
			<menuitem id="fp-check" label="检查更新" oncommand="fireSpider.updateWindow()"></menuitem>\
			</menupopup>';
			Observers.add('configChanged', fireSpider.observer);
			
			/*检测配置文件*/
			
			if (!configFile.exists()) {
				configFile.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 438);
				writeFile(configFile.path, JSON.stringify(config), 1);
				console.log('The configuration file does not exist, created successfully.');
			} 
			else {
				this.readConfig(configFile);
			}
			if(!selfScript.exists()) {
				document.querySelector("#fp-check").style.display = "none";
			}
		},
		
		command: {
			openMenu: function() {
				document.querySelector("#firespider-tbb menupopup").openPopup(this, "after_start", 0, 0, false, false);
			},
			openFolder: function(){
				let nsLocalFile = Components.Constructor("@mozilla.org/file/local;1",
														"nsILocalFile", "initWithPath");			
				if(!fireSpider.URI) {
					let DfltDwnld = Services.dirsvc.get("DfltDwnld", Ci.nsIFile);
					return nsLocalFile(DfltDwnld.path).reveal();
				}		
				return nsLocalFile(fireSpider.URI).reveal();
			},
			openURL: function(e) {
				let newTab = window.getBrowser().addTab("http://"+e.label, null, null);
				window.getBrowser().selectedTab = newTab;
			}
		},
		
		readConfig: function(file) {
			NetUtil.asyncFetch('file:///'+file.path, function(inputStream) {
				var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
				try {
					config = JSON.parse(data);
					fireSpider.websiteList();
//					console.dir(config);
					console.log('Successfully reads the configuration file.');
				}
				catch(e) {
					alerts("FireSpider 配置文件格式错误","已自动恢复为默认状态。");
					fireSpider.websiteList();
				}
			});	
		},
		
		downloadInit: function(s) {
			this.host = window.getBrowser().selectedBrowser.contentDocument.location.host;
			this.href = window.getBrowser().selectedBrowser.contentDocument.location.href;
			if (!config.hasOwnProperty(this.host)) {
				return alerts("FireSpider 下载失败","当前网站无下载规则");
			}
			else {
				let filePicker = Cc["@mozilla.org/filepicker;1"]
											.createInstance(Ci.nsIFilePicker);
				filePicker.init(window, "请选择要保存图片的文件夹", filePicker.modeGetFolder);
				if (!filePicker.show()) {
					this.URI = filePicker.file.path;
					this.protocol = window.getBrowser().selectedBrowser.contentDocument.location.protocol;
					this.single = s;
					this.entrance();
					alerts("FireSpider","下载开始！");
				}
			}
		},
		
		entrance: function() {
			let body = window.getBrowser().selectedBrowser.contentDocument.body;
			let selectorIterator = config[this.host];
			let index = 0;
			let linkNodeList = body.querySelectorAll(selectorIterator[index]);
			let locationHref = window.getBrowser().selectedBrowser.contentDocument.location.href;
			let pageList = [locationHref];
			if (!this.single && linkNodeList.length){
				[].forEach.call(linkNodeList,function(i){
					pageList.push(getAbsoluteUrl(i.href))
				});
				pageList = unique(pageList);
//				console.dir(pageList);
			}
			pageList.forEach(function(i) {
				fireSpider.spiders(i,selectorIterator,index+1);
			});
		},

		spiders: function(url,selectorIterator,index) {
		   let req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
								.createInstance(Ci.nsIXMLHttpRequest);
		   req.onprogress = this.onProgress;
		   req.onload = function(e) {fireSpider.parseHTML(e,selectorIterator,index,url)};
		   req.onerror = this.onError;
		   req.open("GET", url, true);
		   req.send(null);	
		},

		onProgress: function(e) {},
		onError: function (e){return alerts("FireSpider","下载过程似乎出现了一些问题");},
		
		parseHTML: function(e,selector,index,url) {
			if (e.target.channel.contentType !== "text/html"){
				return fireSpider.downloader(url);
			}
			let responseText = e.target.responseText;
			let doc = document.implementation.createHTMLDocument("newHTMLDocument");
			doc.documentElement.innerHTML = responseText;
			let aNodeList = doc.querySelectorAll(selector[index]);
			/*Scheduler*/
			[].forEach.call(aNodeList,function(i) {
				switch (i.nodeName){
					case "A":
						fireSpider.spiders(getAbsoluteUrl(i.href),selector,index+1);
						break;
					case "IMG":
						fireSpider.downloader(getAbsoluteUrl(i.src));
						break;
					default:
						break;
				}
			});
			doc = null;
		},

		downloader: function(imgURL) {
			let imgName = getImgName(imgURL);
  			Task.spawn(function* () {
				yield Downloads.fetch(imgURL,OS.Path.join(fireSpider.URI,getImgName(imgURL)));
				console.log(imgName+" has been downloaded!");
			}).then(null, Cu.reportError);
//			console.log(imgURL);
		},
		
		configWindow: function() {
			let xulCode = '<?xml version="1.0"?><?xml-stylesheet href="chrome://global/skin/" type="text/css"?>\
			<window id="Fire" title="firespider规则" width="650" height="600" xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">\
			<script>const Cu = Components.utils;const Cc = Components.classes;const Ci = Components.interfaces;\
			Cu.import("resource://services-common/observers.js");\
			Cu.import("resource://gre/modules/NetUtil.jsm");\
			var file = Cc["@mozilla.org/file/directory_service;1"]\
			.getService(Ci.nsIProperties) \
			.get("ProfD", Ci.nsIFile);\
			file.appendRelativePath("firespider");\
            var editor;\
			window.addEventListener("load", function load(event){\
				var URI = "file:///"+file.path+"/firespider.json";\
				editor = document.querySelector("#fpeditor").contentWindow;\
				editor.Scratchpad.hideMenu();\
				var toolbar=editor.document.querySelector("#sp-toolbar");\
				if(toolbar){toolbar.style.display = "none";}\
				setTimeout(function(){\
					NetUtil.asyncFetch(URI, function(inputStream) {\
					var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());\
					if (data === "Not Found") {alert("网络错误!");}\
					else{editor.Scratchpad.setText(data);}})\
				},250);\
			},false);\
			function saveIni(){\
				var content = editor.Scratchpad.getText();\
				try{JSON.parse(content)}catch(e){alert("规则格式错误，请修改为标准 JSON 格式！");return;}\
				if (file.path.substr(2,1)=="\\\\"){ \
					writeFile(file.path+"\\\\firespider.json",content,1);\
					Observers.notify("configChanged");\
					window.close();}}\
			function subscribe(){ var subs = document.querySelector("#msg");subs.label="正在下载";subs.style.listStyleImage=\' url("chrome://browser/skin/tabbrowser/loading.png")\';\
				NetUtil.asyncFetch("'+fireSpider.configURL+'", function(inputStream) {\
                var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());\
				if (data === "Not Found") {alert("网络错误!");}\
                else{editor.Scratchpad.setText(data);\
					subs.style.listStyleImage="";subs.label="";}\
				});}	\
			function writeFile(filepath, data, override){\
				data = parseUtf8(data);\
				try {let outputFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);\
				outputFile.initWithPath(filepath);\
				let foStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);\
				let val = override ? 32 : 16;foStream.init(outputFile, 2 | 8 | val, 438, 0);\
				foStream.write(data, data.length);foStream.close();} catch (e) {alert("error:" + e);}}\
			function parseUtf8(str) {\
				var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);\
				converter.charset = "UTF-8";return converter.ConvertFromUnicode(str);\
			}</script>\
			<hbox><description style="padding:8px;" value="规则编写：规则为 JSON 格式，属性名为网站的根域，属性值为要采集的 CSS 选择器。"/></hbox>\
			<iframe id="fpeditor" src="chrome://browser/content/devtools/scratchpad.xul" style="margin:10px 8px;" flex="1" type="content-primary"/>\
            <hbox><button id="subs" label="订阅规则" oncommand="subscribe()"/><label style="font: normal 15px/30px Arial;">'+fireSpider.configURL+'</label></hbox>\
			<hbox><toolbarbutton id="msg"></toolbarbutton></hbox>\
			<hbox><button label="保存" style="margin-left:420px;" oncommand="saveIni()"/><button label="取消" oncommand="window.close()"/></hbox>\
			<separator/></window>';
			var dataURI = "data:application/vnd.mozilla.xul+xml," + encodeURIComponent(xulCode);
			window.open(dataURI, '', 'centerscreen,chrome');
		},

		updateWindow: function() {
			let xulCode = '<?xml version="1.0"?>\
			<?xml-stylesheet href="chrome://global/skin/global.css" type="text/css"?>\
			<window id="donothing" style="padding:20px;" width="300" height="150" title="FireSpider"\
			xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" buttons="null">\
			<script>const Cu = Components.utils;const Cc = Components.classes;const Ci = Components.interfaces;\
			Cu.import("resource://gre/modules/NetUtil.jsm");\
			Cu.import("resource://gre/modules/Task.jsm");\
			Cu.import("resource://gre/modules/osfile.jsm");\
			Cu.import("resource://gre/modules/Downloads.jsm");\
			var subs;\
			window.addEventListener("load", function load(event){\
				window.removeEventListener("load", load, false);  \
				subs = document.querySelector("#msg");subs.label="正在检查新版本……";subs.style.listStyleImage=\' url("chrome://browser/skin/tabbrowser/loading.png")\';\
				NetUtil.asyncFetch("'+fireSpider.versionURL+'", function(inputStream) {\
                var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());\
				if (data === "Not Found") {alert("网络错误!");}\
                else{var v = document.querySelector("#version").className;\
					data = JSON.parse(data);\
					if(data.version == v){subs.style.listStyleImage="";subs.label="已是最新版。";}\
					else{subs.style.listStyleImage="";subs.label="发现新版本 "+data.version;document.querySelector("#update").style.display="block";}}\
				});},false);\
				function update(){\
					var selfScript = Cc["@mozilla.org/file/directory_service;1"]\
					.getService(Ci.nsIProperties)\
					.get("UChrm", Ci.nsIFile);\
					subs.label="正在下载更新……";subs.style.listStyleImage=\' url("chrome://browser/skin/tabbrowser/loading.png")\';\
					Task.spawn(function () {\
						var url ="'+fireSpider.scriptURL+'";\
						yield Downloads.fetch(url,OS.Path.join(selfScript.path,"FireSpider.uc.js"));\
						subs.style.listStyleImage ="";\
						subs.label="更新成功，重启浏览器生效";\
						document.querySelector("#update").style.display="none";\
						document.querySelector("#restart").style.display="block";\
					}).then(null, Cu.reportError);\
				}\
				function restart(){var xulRuntime = Cc["@mozilla.org/xre/app-info;1"]\
                 .getService(Ci.nsIXULRuntime);\
				xulRuntime.invalidateCachesOnRestart();\
				window.close();Application.restart();}\
			</script>\
			<hbox><description id="version" class="'+fireSpider.version+'" value="FireSpider '+fireSpider.version+'"></description></hbox>\
			<hbox><toolbarbutton id="msg"></toolbarbutton></hbox>\
			<hbox style="padding-left:90px;"><button id="update" oncommand="update()" style="display:none;" label="下载更新"></button>\
			<button id="restart" oncommand="restart()" style="display:none;" label="重启浏览器"></button></hbox>\
			</window>'
			var dataURI = "data:application/vnd.mozilla.xul+xml," + encodeURIComponent(xulCode);
			let dialog = openDialog(dataURI,'','centerscreen,chrome');
		},
		
		observer: function() {
			fireSpider.readConfig(configFile);
		},
		
		websiteList: function() {
			let menu = document.querySelector("#fp-menu");
			let it = Iterator(config, true);
			let xulCode = "";
			for (let item in it) {
				xulCode +='<menuitem label="'+item+'" oncommand="fireSpider.command.openURL(this)"/>';
			}
			menu.innerHTML = '<menupopup>'+xulCode+ '</menupopup>';
		}
	}
	
	/*Tool function*/
	
	function alerts(title,text) {
		var alertsService = Cc["@mozilla.org/alerts-service;1"]
							.getService(Ci.nsIAlertsService);
		try {
			return alertsService.showAlertNotification(fireSpider.icon, 
											  title, text,false, "", null, "");
		} catch (e) {
			return alert(title+":"+text);
		}	
	}
	
	function writeFile(filepath, data, override) {
		data = parseUtf8(data);
		try {
			let outputFile = Cc['@mozilla.org/file/local;1']
							.createInstance(Ci.nsILocalFile);
			outputFile.initWithPath(filepath);
			let foStream = Cc['@mozilla.org/network/file-output-stream;1']
							.createInstance(Ci.nsIFileOutputStream);
			let val = override ? 32 : 16;
			foStream.init(outputFile, 2 | 8 | val, 438, 0);
			foStream.write(data, data.length);
			foStream.close();
		} catch (e) {
			alerts('Error',e);
		}
	}
	
	function parseUtf8(str) {
		var converter = Cc['@mozilla.org/intl/scriptableunicodeconverter']
						.createInstance(Ci.nsIScriptableUnicodeConverter);
		converter.charset = 'UTF-8';
		return converter.ConvertFromUnicode(str);
	}		
	
	function unique(arr) {
		let ret = [];
		arr.forEach(function(i) {
			ret.indexOf(i) === -1 && ret.push(i);
		})
		return ret;
	}
	
	function getAbsoluteUrl(url) {
		if(location.host === "browser") {
			var protocol = fireSpider.protocol;
			var host = fireSpider.host;
			var href = fireSpider.href;
		}
		else{
			var protocol = location.protocol;
			var host = location.host;
			var href = location.href;
		}
		let regProtocol = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
		return regProtocol.test(url) ? url : absolutizeURI(href,url);
	}
	
	function parseURI(url) {
		var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
		return (m ? {
			href : m[0] || '',
			protocol : m[1] || '',
			authority: m[2] || '',
			host : m[3] || '',
			hostname : m[4] || '',
			port : m[5] || '',
			pathname : m[6] || '',
			search : m[7] || '',
			hash : m[8] || ''
		} : null);
	}
	 
	function absolutizeURI(base, href) {	 
		function removeDotSegments(input) {
			var output = [];
			input.replace(/^(\.\.?(\/|$))+/, '')
			.replace(/\/(\.(\/|$))+/g, '/')
			.replace(/\/\.\.$/, '/../')
			.replace(/\/?[^\/]*/g, function (p) {
				if (p === '/..') {
					output.pop();
				} else {
					output.push(p);
				}
			});
			return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
		}
		 
		href = parseURI(href || '');
		base = parseURI(base || '');
		 
		return !href || !base ? null : (href.protocol || base.protocol) +
		(href.protocol || href.authority ? href.authority : base.authority) +
		removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
		(href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
		href.hash;
	}
	
	function getImgName(url) {
		let imgType = ["jpg","gif","png","jpeg"];
		url=url.substr(url.lastIndexOf('/')+1);  
		if(url.indexOf('?') !== -1) {
		   url = url.substr(0,url.indexOf('?'));
		}
		let type = url.lastIndexOf('.');
		if(type !== -1) {
			let t = url.substr(type+1);
			if(imgType.indexOf(t) !== -1){
				return url;
			}
		}
		return url+".jpg";
	}
	
	fireSpider.init();
	
})({
	"exhentai.org":[".ptb td a",".gdtm a","#img"],
	"yande.re":[".pagination a",".thumb","#image"],
	"konachan.com":[".pagination a",".thumb","#image"],
	"danbooru.donmai.us":[".paginator a","#posts article a","#image"],
	"img4.gelbooru.com":[".pagination a",".thumb a","#image"],
	"anime-girls.ru":[".page a",".content a","#theImage a"]
});
