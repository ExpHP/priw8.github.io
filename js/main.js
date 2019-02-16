let MD = new showdown.Converter({
	extensions: [ext]
});
let $content = document.querySelector(".content-wrapper");
let cache = {};
let active = "";

function initNavigation() {
	let $nav = document.querySelector(".header-navigation");
	let html = "";
	for (let i=0; i<INDEX.length; i++) {
		html += getNavigationEntry(INDEX[i]);
	}
	html += "<div class='navigation-entry dummy'></div>";
	$nav.innerHTML = html;
	$nav.addEventListener("click", handleNavigation);
	window.addEventListener("hashchange", initContent, false);
}

function getNavigationEntry(data) {
	let html;
	html = "<div class='navigation-entry' data-path='"+data.path+"'>";
	if (!data.single) {
		html += "<div class='navigation-entry-name'>"+data.groupName+"</div>";
		html += "<div class='navigation-entry-list'>";
		for (let i=0; i<data.content.length; i++) {
			let item = data.content[i];
			html += "<div class='navigation-entry-list-item' "+getNavEntryDatasetString(item, data.path)+">"+item.name+"</div>";
		};
		html += "</div>";
	} else {
		html += "<div class='navigation-entry-name' "+getNavEntryDatasetString(data, data.path)+">"+data.groupName+"</div>";
	};
	html += "</div>";
	return html;
}

function getNavEntryDatasetString(item, path) {
	return "data-type='"+item.type+"' data-url='"+item.url+"' data-path='"+path+"'";
}

function handleNavigation(e) {
	if (typeof e.target.dataset.type != "undefined") {
		navigate(e.target.dataset);
	}
}

function navigate(data) {
	if (data.type == "href") {
		window.open(data.url);
	};
	if (data.type == "site") {
		loadContent(data.path, data.url);
	};
}

function loadContent(path, file) {
	if (active && active == file) return;
	active = file;
	let realPath = path+file;
	if (cache[realPath]) loadMd(cache[realPath], path, file);
	else {
		let xhr = new XMLHttpRequest();
		xhr.open("GET", "content/"+realPath+".md");
		xhr.onreadystatechange = function() {
			if (this.readyState == 4) {
				if (this.status == 200) {
					loadMd(this.responseText, path, file);
					cache[realPath] = this.responseText;
				} else {
					loadMd(getErrorString(path, file), path, file);
					active = "";
				};
			}
		};
		xhr.send();
	};
	let query = buildQuery({
		"s": realPath
	});
	location.hash = query;
}

function getErrorString(path, file) {
	let str = ERROR;
	str += "  \n  \n  **Requested path**: `"+path+"`";
	str += "  \n  **Requested file**: `"+file+".md`";

	let group = getGroupByPath(path);
	if (group) {
		str += "  \n  \n  You might be looking for one of the following pages:  \n"
		let list = group.single ? [group] : group.content;
		for (let i=0; i<list.length; i++) {
			let entry = list[i];
			let url = entry.type == "site" ? "#"+buildQuery({s: group.path + entry.url}) : entry.url;
			str += "- `"+group.path+entry.url+".md` - ["+entry.name+"]("+url+")  \n";
		};
	}
	return str;
}

function getGroupByPath(path) {
	for (let i=0; i<INDEX.length; i++) {
		if (INDEX[i].path == path) return INDEX[i];
	};
	return null;
}

function loadMd(txt, path, file) {
	let html = MD.makeHtml(txt);
	$content.innerHTML = html;
	setActiveNavigation(path, file);
	setWindowTitle(path, file);
	resetScroll();
}

function resetScroll() {
	document.body.scrollTop = document.documentElement.scrollTop = 0;
}

function setWindowTitle(path, file) {
	let group;
	for (let i=0; i<INDEX.length; i++) {
		group = INDEX[i];
		if (group.path == path) break;
	}
	if (group.single) document.head.querySelector("title").innerText = group.name;
	else {
		for (let i=0; i<group.content.length; i++) {
			let item = group.content[i];
			if (item.url == file) document.head.querySelector("title").innerText = item.name;
		}
	}
}

function setActiveNavigation(path, file) {
	let $active, $activeItem;

	$active = document.querySelector(".navigation-entry.active");
	if ($active != null) {
		$active.classList.remove("active");
		$activeItem = $active.querySelector(".active");
		if ($activeItem != null) $activeItem.classList.remove("active");
	};

	$active = document.querySelector(".navigation-entry[data-path='"+path+"']");
	if ($active != null) {
		$active.classList.add("active");
		$activeItem = $active.querySelector("[data-url='"+file+"']");
		if ($activeItem != null) $activeItem.classList.add("active");
	};
}

function initContent() {
	let query = parseQuery();
	if (query.s) {
		let spl = query.s.split("/");
		let file = spl.pop();
		let path = spl.join("/") + "/";
		loadContent(path, file);
	} else loadContent("/", "index");
};

function parseQuery() {
	let ret = {};
	let s = location.hash;
	s = s.substring(1);
	let spl = s.split("&");
	for (let i=0; i<spl.length; i++) {
		let tmp = spl[i].split("=");
		ret[tmp[0]] = tmp[1];
	};
	return ret;
};

function buildQuery(query) {
	let str = "";
	let first = true;
	for (let key in query) {
		if (first) first = false;
		else str += "&";
		str += key + "=" + query[key];
	};
	return str;
}

function resize() {
	if (screen.width < 540) {
		document.querySelector("#viewport").setAttribute("content", "width=540px, user-scalable=no");
	} else {
		// make it actually usable with horizontal orientation
		let w = "device-width";
		if (screen.height < 450) w = "900px";
		document.querySelector("#viewport").setAttribute("content", "width="+w+", user-scalable=no");
	};
};

function initResize() {
	window.onresize = resize;
	resize();
};

function init() {
	initNavigation();
	initContent();
	initResize();
}

init();