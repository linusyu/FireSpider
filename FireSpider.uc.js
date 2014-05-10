/*FireSpider*/
;(function(config) {
	"use strict";
	
	if(window.fireSpider) return;
	var importModule = Components.utils.import;
	importModule("resource://gre/modules/Task.jsm");
	importModule("resource://gre/modules/osfile.jsm");
	importModule("resource://gre/modules/NetUtil.jsm");
	importModule("resource://gre/modules/Downloads.jsm");
	importModule( 'resource://services-common/observers.js');
	
	var file = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties)
				.get('ProfD', Components.interfaces.nsIFile);
	file.appendRelativePath('firespider');
	file.append('firespider.json');
			
	window.fireSpider = {
		protocol: "",
		host: "",
		href: "",
		URI: "",
		single:0,
		icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzUxNDJDNkNEODNCMTFFM0FEREZEMDY3ODExOUIwMDIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzUxNDJDNkREODNCMTFFM0FEREZEMDY3ODExOUIwMDIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozNTE0MkM2QUQ4M0IxMUUzQURERkQwNjc4MTE5QjAwMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozNTE0MkM2QkQ4M0IxMUUzQURERkQwNjc4MTE5QjAwMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhZkhEEAAAPASURBVHjaTJTfb5NVGMc/zznnbdlaRle3MQaMsmxBcCGZOkWEGAlRrvBCTQyBay+Jf4nRGC818Yo7ExOFGBMvTLjQRawyCTBEXDcGHV072q7t+77n+HQC8U3O6dtz3uc53x/Pc+S0gXkgKxReCxz/GX5JHNWVhO1nt6N4NOWN1cD6P16ujpowNQG1tcAjKzx7TH/qGjLW886GN3ORl2p/sasfhQBJQs1mWB+GD2suzNyLKPYiPhBhlP89JuvZG3l2nMxwqsBA50VylHpZerrZ1HHbw9cpC3cNN+YTOTuZsmhiMro1I7r3dJi3kPM1T5eua2wSN5bp8K2mGfBsA08t9GK2Ogk/xRKkHtjX8zwqCa0JJfR0uBbswzG+kCS/imOkmeJ2CYnS2xkHgk1pZg3GBbLVIKub+t/h7pvUr3j8M2r2EDJS8tErfxj/1eFU3tPcjGqAMWEk72XGGdIiuIkgEmFvP4+bjGG6Cjd7SLuFZVPB23cZuz6DP/ogSDm16Q9D4s+1gkR3AvdKEi4Whbl1L3W37YkZTvFvLrmkvBT8n30kf2mSRQJ2VqdF4txu4pPjwTxeDuFaCXtsCF8aET4aC5waMrw0FNxxpXLgFuE31agyix3KIfV1TEgVlfUSU4fVA9j5HJzPE51QNkcEmQqoathRFzJ1g32wiV8r4MeHye5XMC9HcPARLLcJbbtPoalk6S7Nmcc/lyITLTW0QSh77JiKvl8NudbEX9OghS3MSg9zW5MuRcjbCel0C3PdvqDijiAnJrEXmsiSU7g1kksJcrhAdC4hRA4zHRPm7mB+VPTf7CF5v0k0vkLyRQ671xN6cgFXnMB+XsF/nMftEcLDvYQbFlPOKpq+wSowsc51oltV4jNdpDaJu/SYzpX7yCcDmCNGS+VYTTVqkt7MEM7chat6WqGBjbtPuqjfdpEWcx6xekDpITRWCV8O4k4/xsxWMBV7EDmmrXC5iJ3MYg4p7ysJiSbxo1ovr+uvYlHj1d0GsqBrn4HvtJFbecxupd97SLJoNuDvLfxN/quR2g4Nuw+tDcL3HX1vaCLVjoqiqpCWV0k3Ov0CJI6rhO902e0nKjrVZXkXIVWK2SrpmoqKwmZQNVLLL+Ywr7ZI25uE3/Wgy4qKgkZn1CTVrasHDiiTQWeJ1oTUdAjdLe3PRNXYqUhiZF0t/lSFLKp+3S6mtePJvaOGaJp+M9mNFr6s5VG3U5hErx2tTjZjDdLqbWjDN41+rnrppWK29EqJk+1g2NK1fkJFoW8St/F9qt1/BRgAq9C1IFpzSmgAAAAASUVORK5CYII=",
	
		gui: function () {
			let navBar = document.querySelector("#nav-bar-customization-target");
			let firespiderTbb = document.createElement("toolbarbutton");
			navBar.appendChild(firespiderTbb);
			firespiderTbb.id = "firespider-tbb";
			firespiderTbb.label = "FireSpider";
			firespiderTbb.className = "toolbarbutton-1 chromeclass-toolbar-additional";
			firespiderTbb.addEventListener("click",this.command.openMenu,false);
			firespiderTbb.style.listStyleImage = "url("+this.icon+")";
			firespiderTbb.innerHTML = '<menupopup>\
			<menuitem label="下载全部页大图" oncommand="fireSpider.save(0)"></menuitem>\
			<menuitem label="下载当前页大图" oncommand="fireSpider.save(1)"></menuitem>\
			<menuseparator></menuseparator>\
			<menuitem label="规则配置" oncommand="fireSpider.configWindow()"></menuitem>\
			</menupopup>';
			Observers.add('configChanged', fireSpider.observer);
			
			/*检测配置文件*/
			
			if (!file.exists()) {
				file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 438);
				if (file.path.substr(2, 1) == '\\') {  					//for Windows
					writeFile(file.path, JSON.stringify(config), 1);
				}
				console.log('The configuration file does not exist, created successfully.');
			} 
			else {
				this.readConfig(file);
			}
			
			function writeFile(filepath, data, override) {
				data = parseUtf8(data);
				try {
					let outputFile = Components.classes['@mozilla.org/file/local;1']
									.createInstance(Components.interfaces.nsILocalFile);
					outputFile.initWithPath(filepath);
					let foStream = Components.classes['@mozilla.org/network/file-output-stream;1']
									.createInstance(Components.interfaces.nsIFileOutputStream);
					let val = override ? 32 : 16;
					foStream.init(outputFile, 2 | 8 | val, 438, 0);
					foStream.write(data, data.length);
					foStream.close();
				} catch (e) {
					alerts('Error',e);
				}
			}
			
			function parseUtf8(str) {
				var converter = Components.classes['@mozilla.org/intl/scriptableunicodeconverter']
								.createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
				converter.charset = 'UTF-8';
				return converter.ConvertFromUnicode(str);
			}		
		},
		
		command: {
			openMenu: function(){
				document.querySelector("#firespider-tbb menupopup").openPopup(this, "after_start", 0, 0, false, false);
			}
		},
		
		readConfig: function(file) {
			NetUtil.asyncFetch('file:///'+file.path, function(inputStream) {
				var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
				try {
					config = JSON.parse(data);
//					console.dir(config);
					console.log('Successfully reads the configuration file.');
				}
				catch(e) {
					alerts("FireSpider 配置文件格式错误","已自动恢复为默认状态。");
				}
			});	
		},
		
		save: function (s) {
			this.host = window.getBrowser().selectedBrowser.contentDocument.location.host;
			this.href = window.getBrowser().selectedBrowser.contentDocument.location.href;
			if (!config.hasOwnProperty(this.host)) {
				return alerts("FireSpider 下载失败","当前网站无下载规则");
			}
			else {
				let filePicker = Components.classes["@mozilla.org/filepicker;1"]
											.createInstance(Components.interfaces.nsIFilePicker);
				filePicker.init(window, "请选择要保存图片的文件夹", filePicker.modeGetFolder);
				if (!filePicker.show()){
					this.URI = filePicker.file.path;
					this.protocol = window.getBrowser().selectedBrowser.contentDocument.location.protocol;
					this.single = s;
					this.init();
					alerts("FireSpider","下载开始！");
				}
			}
		},
		
		init: function () {
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
			pageList.forEach(function(i){
				fireSpider.XHR(i,selectorIterator,index+1);
			});
		},

		XHR: function (url,selectorIterator,index) {
		   let req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
								.createInstance(Components.interfaces.nsIXMLHttpRequest);
		   req.onprogress = this.onProgress;
		   req.onload = function(e) {fireSpider.parseHTML(e,selectorIterator,index,url)};
		   req.onerror = this.onError;
		   req.open("GET", url, true);
		   req.send(null);	
		},

		onProgress: function (e){},
		onError: function (e){return alerts("FireSpider","下载过程似乎出现了一些问题");},
		
		parseHTML: function (e,selector,index,url) {
			if (e.target.channel.contentType !== "text/html"){
				return fireSpider.downloader(url);
			}
			let responseText = e.target.responseText;
			let doc = document.implementation.createHTMLDocument("newHTMLDocument");
			doc.documentElement.innerHTML = responseText;
			let aNodeList = doc.querySelectorAll(selector[index]);
			[].forEach.call(aNodeList,function(i){
				if(i.nodeName === "A") {
//					console.log(getAbsoluteUrl(i.href));
					fireSpider.XHR(getAbsoluteUrl(i.href),selector,index+1);
				}
				else if(i.nodeName === "IMG") {
//					console.log(getAbsoluteUrl(i.src));
					fireSpider.downloader(getAbsoluteUrl(i.src));
				}
			});
			doc = null;
		},

		downloader: function (imgURL) {
			let type = imgURL.slice(-3);
			let name = imgURL.replace(/.*\/([^\/]+)\..+/,'$1');
  			Task.spawn(function* () {
				yield Downloads.fetch(imgURL,OS.Path.join(fireSpider.URI,name+"."+type));
				console.log(name+"."+type+" has been downloaded!");
			}).then(null, Components.utils.reportError);
//			console.log(imgURL);
		},
		
		configWindow: function() {
			let xulCode = '<?xml version="1.0"?><?xml-stylesheet href="chrome://global/skin/" type="text/css"?>\
			<window id="Fire" title="FireSpider" width="600" height="600" xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">\
			<script>Components.utils.import("resource://services-common/observers.js");\
			var file = Components.classes["@mozilla.org/file/directory_service;1"]\
			.getService(Components.interfaces.nsIProperties) \
			.get("ProfD", Components.interfaces.nsIFile);\
			file.appendRelativePath("FireSpider");\
			window.addEventListener("load", function load(event){\
				window.removeEventListener("load", load, false);  \
				var URI = "file:///"+file.path+"/firespider.json";\
				document.querySelector("#fsEditor").setAttribute("src",URI);},false);\
			function saveIni(){var editor = document.getElementById("fsEditor");\
				var content = editor.getEditor(editor.contentWindow).document.body.textContent;\
				try{JSON.parse(content)}catch(e){alert("规则格式错误，请修改为标准 JSON 格式！");return;}\
				if (file.path.substr(2,1)=="\\\\"){ \
					writeFile(file.path+"\\\\firespider.json",content,1);\
					Observers.notify("configChanged");\
					window.close();}}\
			function writeFile(filepath, data, override){\
				data = parseUtf8(data);\
				try {let outputFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);\
				outputFile.initWithPath(filepath);\
				let foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);\
				let val = override ? 32 : 16;\
				foStream.init(outputFile, 2 | 8 | val, 438, 0);\
				foStream.write(data, data.length);\
				foStream.close();} catch (e) {alert("error:" + e);}}\
			function parseUtf8(str) {\
				var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);\
				converter.charset = "UTF-8";\
				return converter.ConvertFromUnicode(str);\
			}</script>\
			<label>规则编写</label>\
			<editor id="fsEditor" value="testsetset" editortype="text" flex="1" type="content-primary"/>\
			<hbox><button label="保存" oncommand="saveIni()"/><button label="取消" oncommand="window.close()"/></hbox>\
			<separator/></window>';
			var dataURI = "data:application/vnd.mozilla.xul+xml," + encodeURIComponent(xulCode);
			window.open(dataURI, 'firespider', 'centerscreen,chrome');		
		},
		
		observer: function() {
			fireSpider.readConfig(file);
		}
	}
	
	function unique(arr) {
		let ret = [];
		arr.forEach(function(i){
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
	
	function alerts(title,text){
		var alertsService = Components.classes["@mozilla.org/alerts-service;1"].
							  getService(Components.interfaces.nsIAlertsService);
		try {
			return alertsService.showAlertNotification(fireSpider.icon, 
											  title, text,false, "", null, "");
		} catch (e) {
			return alert(title+":"+text);
		}	
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
	fireSpider.gui();
})({
	"exhentai.org":[".ptb td a",".gdtm a","#img"],
	"yande.re":[".pagination a",".thumb","#image"],
	"konachan.com":[".pagination a",".thumb","#image"],
	"danbooru.donmai.us":[".paginator a","#posts article a","#image"],
	"img4.gelbooru.com":[".pagination a",".thumb a","#image"],
	"anime-girls.ru":[".page a",".content a","#theImage a"]
});
