let ext = function() {
	let yt = {
		type: "lang",
		regex: /\[yt\](.*?)\[\/yt\]/g,
		replace: '<div class="fit-wrapper"><div class="fit-wrapper2 yt"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>'
	};
	let hr = {
		type: "lang",
		regex: /\[hr\]/g,
		replace: "<hr>"
	}
	let br = {
		type: "lang",
		regex: /\[br\]/g,
		replace: "<br>"
	}
	let ts = {
		type: "lang",
		regex: /\[timestamp=(.*?)\]/g,
		replace: "<div style='float: right'>$1</div>"
	}
	let img = {
		type: "lang",
		regex: /\[img=(.*?), hratio=(.*?)\]/g,
		replace: '<div class="fit-wrapper"><div class="fit-wrapper2" style="padding-top: $2%"><img style="cursor:pointer;" onclick="window.open(\'$1\')" src="$1"></div></div>'
	}

	let jank = document.createElement("textarea");
	jank.classList.add("clipboard-jank");
	let cnt = 0;
	let code = {
		type: "lang",
		regex: /\[code\]([^]+?)\[\/code\]/g,
		replace: function(match, content) {
			// putting the content in data-clipboard-text didn't really work
			let clip = jank.cloneNode();
			clip.innerHTML = content;
			clip.setAttribute("id", "clipboard"+cnt);
			document.body.appendChild(clip);
			return "<hljs>"+highlightCode(content)+"<span class='copy-btt' data-clipboard-action='copy' data-clipboard-target='#clipboard"+(cnt++)+"'>Copy</span></hljs>";
		}
	}

	let title = {
		type: "lang",
		regex: /\[title=(.*?)\]\n/,
		replace: function(match, content) {
			setWindowTitleDirect(content);
			return "";
		}
	}

	let c = {
		type: "lang",
		regex: /\[c=(.*?)\]([^]*?)\[\/c\]/g,
		replace: "<span style='color: $1'>$2</span>"
	}

	let replaceId = 0;
	let include = {
		type: "lang",
		regex: /\[include=(.*?)\]/g,
		replace: function(match, include) {
			let id = replaceId++;
			getInclude(include, id);
			return "<div id='included-content-"+id+"'>Loading...</div>";
		}
	}

	let colors = {
		10: "#fafca2",
		11: "#adb0e6",
		12: "lightgreen",
		125: "orange",
		128: "#40ffeb",
		13: "lightblue",
		14: "#cf943a",
		143: "#ff9eb9",
		15: "#f6d7ff",
		16: "#63f863",
		165: "violet",
		17: "#ff6565"
	}

	let game = {
		type: "lang",
		regex: /\[game=([0-9]*?)\]([^]*?)\[\/game\]/g,
		replace: function(match, game, txt) {
			return "<span style='color: "+colors[game]+"'>"+txt+"</span>";
		}
	}

	let rawGame = {
		type: "lang",
		regex: /%GAMECOLOR-([0-9]*?)%/g,
		replace: function(match, game) {
			return colors[game];
		}
	}

	let vartable = {
		type: "lang",
		regex: /\[vartable\]/g,
		replace: function() {
			return generateVarTable()
		}
	}

	let html = {
		type: "lang",
		regex: /\[html\]([^]*?)\[\/html\]/g,
		replace: "$1"
	}

	let script = {
		type: "lang",
		regex: /\[script\]([^]*?)\[\/script\]/g,
		replace: function(match, content) {
			const $script = document.createElement("script");
			$script.innerHTML = content;
			$scriptContent.appendChild($script);
			return "";
		}
	}

	let ins = {
		type: "lang",
		regex: /\[ins=(.*?),(.*?)\]/g,
		replace: function(match, num, game) {
			const ins = getOpcode(parseFloat(game), parseInt(num));
			if (ins == null) return "`opcode_error_"+num+"`";
			let tip = getOpcodeTip(ins);
			return "<code data-tip=\""+tip+"\">"+getOpcodeName(ins.number, ins.documented)+"</code>";
		}
	}
	let ins_notip = {
		type: "lang",
		regex: /\[ins_notip=(.*?),(.*?)\]/g,
		replace: function(match, num, game) {
			const ins = getOpcode(parseFloat(game), parseInt(num));
			if (ins == null) return "`opcode_error_"+num+"`";
			return "<code>"+getOpcodeName(ins.number, ins.documented)+"</code>";
		}
	}

	let tip = {
		type: "lang",
		regex: /\[tip=(.*?)\]([^]*?)\[\/tip\]/g,
		replace: `<span data-tip='$1'>$2</span>`
	}

	/*let eclTooltips = {
		type: "lang",
		filter: function(text) {
			return addTooltips(text);
		}
	}*/

	return [yt, hr, br, ts, img, code, title, c, include, game, rawGame, vartable, html, script, ins, ins_notip, tip];
}
