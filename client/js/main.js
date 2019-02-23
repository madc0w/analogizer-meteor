const selectedDomain = new ReactiveVar("size");
const answer = new ReactiveVar({});

Template.main.helpers({
	isSelectedDomain : function(domain) {
		return selectedDomain.get() == domain;
	},

	answer : function() {
		return answer.get();
	},
});

Template.main.events({
	"click #random-fact" : function(e) {
		const a1 = $("#a1 select")[0];
		const a2 = $("#a2 select")[0];
		const b1 = $("#b1 select")[0];
		setSelectedIndex("a1", Math.floor(Math.random() * a1.options.length));
		do {
			setSelectedIndex("b1", Math.floor(Math.random() * b1.options.length));
		} while (a1.options[a1.selectedIndex].value == b1.options[b1.selectedIndex].value);
		do {
			setSelectedIndex("a2", Math.floor(Math.random() * a2.options.length));
		} while (a1.options[a1.selectedIndex].value == a2.options[a2.selectedIndex].value);

		compute();
		const selection = data[selectedDomain.get()][getSelectedIndex("a1")];
		updateDetails(selection);
	//		updateUrl();
	},

	"click #domains div" : function(e) {
		const domain = e.target.id.replace("-domain-button", "");
		selectedDomain.set(domain);
	//		if (selectedDomain.get() != domain) {
	//			selectedDomain.set(domain);
	//			window.location.href = updateUrl(true);
	//		}
	},

	"click .show-link" : function(e) {
		show(e.target.parentElement.parentElement.id);
	},

	"click #copy-fact" : function(e) {
		const textArea = document.createElement("textarea");

		// *** This styling is an extra step which is likely not required. ***
		//
		// Why is it here? To ensure:
		// 1. the element is able to have focus and selection.
		// 2. if element was to flash render it has minimal visual impact.
		// 3. less flakyness with selection and copying which **might** occur if the textarea element is not visible.
		//
		// The likelihood is the element won't even render, not even a flash, so some of these are just precautions. However in IE the element
		// is visible whilst the popup box asking the user for permission for the web page to copy to the clipboard.

		// Place in top-left corner of screen regardless of scroll position.
		textArea.style.position = "fixed";
		textArea.style.top = 0;
		textArea.style.left = 0;

		// Ensure it has a small width and height. Setting to 1px / 1em doesn't work as this gives a negative w/h on some browsers.
		textArea.style.width = "2em";
		textArea.style.height = "2em";

		// We don't need padding, reducing the size if it does flash render.
		textArea.style.padding = 0;

		// Clean up any borders.
		textArea.style.border = "none";
		textArea.style.outline = "none";
		textArea.style.boxShadow = "none";

		// Avoid flash of white box if rendered for any reason.
		textArea.style.background = "transparent";
		textArea.value = getFactText() + "\nprovided by Analogizer: " + updateUrl();

		document.body.appendChild(textArea);

		textArea.select();

		try {
			document.execCommand("copy");
		} catch (err) {
			alert("Huh, that did not work out.\n" + err);
		}

		document.body.removeChild(textArea);

		const copyConf = document.getElementById("copy-confirmation");
		copyConf.style.visibility = "visible";
		setTimeout(function() {
			copyConf.style.visibility = "hidden";
		}, 1500);
	},
});


Template.main.onRendered(function() {
	const _selectedDomain = selectedDomain.get();
	//	defaults
	const a1Index = defaults[_selectedDomain].a1;
	const a2Index = defaults[_selectedDomain].a2;
	const b1Index = defaults[_selectedDomain].b1;
	$("#" + _selectedDomain).addClass("selected");
	$("#domain-descriptor").html(descriptors[_selectedDomain]);

	setSelectedIndex("a1", a1Index);
	setSelectedIndex("b1", b1Index);
	setSelectedIndex("a2", a2Index);

	show("a1");
});

///////////////////////////////////////////////////////////////////////////////////////////////////

Template.selections.helpers({
	items : function() {
		return data[selectedDomain.get()];
	}
});

///////////////////////////////////////////////////////////////////////////////////////////////////

function compute() {
	const b2Data = getB2Data();
	const _selectedDomain = selectedDomain.get();
	const a1 = $("#a1 select")[0];
	const b1 = $("#b1 select")[0];
	const a2 = $("#a2 select")[0];
	const a1Selection = data[_selectedDomain][getSelectedIndex("a1")];
	const b1Selection = data[_selectedDomain][getSelectedIndex("b1")];
	const a2Selection = data[_selectedDomain][getSelectedIndex("a2")];
	const result = a2Selection.measure * (b1Selection.measure / a1Selection.measure);

	var i = 0;
	while (b2Data[i++].measure > result && i < b2Data.length);

	if (i > 1) {
		// find the closest match, larger or smaller
		multiplier1 = result / b2Data[i - 1].measure;
		multiplier2 = result / b2Data[i - 2].measure;
		if (multiplier1 > 1 / multiplier2) {
			i--;
		}
	}

	answer.set({
		text : b2Data[i - 1].description,
		index : i - 1,
		multiplier : formatNum(result / b2Data[i - 1].measure, 2),
	});

	//	a2a.init("Analogizer", {
	//		target : ".share-this",
	//		linkname : getFactText(),
	//	});

//	a2a_linkname = getFactText();
//	a2a_linkurl = window.location.href;
//	var fbDesc = document.getElementById("facebook-description");
//	fbDesc.setAttribute("content", "kakaka");
}

function getFactText() {
	const _selectedDomain = selectedDomain.get();
	const descriptor = descriptors[_selectedDomain] ? (descriptors[_selectedDomain] + " ") : "";
	const text = "If " + a1Selection.description + " were " + descriptor + b1Selection.description + ", then " + a2Selection.description + " would be "
		+ multiplier.innerHTML + " times " + descriptor + b2.innerHTML + ".";
	return text;
}

function facebookA2aClick() {
	alert("To share this fact to Facebook, please use the 'Copy fact to clipboard' button under it, and then paste it to your post.");
}

function show(id) {
	var i;
	var _data = data[selectedDomain.get()];
	if (id) {
		i = getSelectedIndex(id);
	} else {
		_data = getB2Data();
		i = b2.index;
	}
	const selection = _data[i];
	updateDetails(selection);
}

function getSelectedIndex(id) {
	return $("#" + id + " select").prop("selectedIndex");
}

function setSelectedIndex(id, index) {
	return $("#" + id + " select").prop("selectedIndex", index);
}

function update(e) {
	compute();
	// evt evaluates to window.event or inexplicit e object, depending on which one is defined
	const evt = window.event || e;
	if (!evt.target) {
		// if event obj doesn't support e.target, presume it does e.srcElement
		evt.target = evt.srcElement; // extend obj with custom e.target prop
	}
	const selection = data[selectedDomain.get()][evt.target.options[evt.target.selectedIndex].value];
	updateDetails(selection);
//	updateUrl();
}

//function updateUrl(isDefaults) {
//	const url = document.URL;
//	if (url.indexOf("?") > 0) {
//		url = url.split("?")[0];
//	}
//
//	const a1Index = a1.selectedIndex;
//	const a2Index = a2.selectedIndex;
//	const b1Index = b1.selectedIndex;
//	const _selectedDomain = selectedDomain.get();
//	if (isDefaults) {
//		a1Index = defaults[_selectedDomain].a1;
//		a2Index = defaults[_selectedDomain].a2;
//		b1Index = defaults[_selectedDomain].b1;
//	}
//
//	url += "?a1=" + a1Index + "&b1=" + b1Index + "&a2=" + a2Index + "&domain=" + _selectedDomain;
//	window.history.pushState(null, null, url);
//	return url;
//}

function updateDetails(selection) {
	$("#details_title").html(selection.description.substr(0, 1).toUpperCase() + selection.description.substr(1));
	$("#details_measure").html(formatNum(selection.measure / conversions[selectedDomain.get()][selection.alternateUnit], 3) + " " + selection.alternateUnit);
	$("#details_longDesc").html(selection.longDesc);
	$("#details_image").html(selection.imageUrl ? '<a href="' + selection.imageUrl + '"><img src="' + selection.imageUrl + '"/></a>' : "");
	$("#details_source").html(selection.source ? '<a href="' + selection.source + '">Source</a>' : "");
}

function formatNum(num, precision) {
	return num.toPrecision(precision);
//	numFromat.setNumber(num.toPrecision(precision));
//	return numFromat.toFormatted();
}

function getB2Data() {
	const _selectedDomain = selectedDomain.get();
	const b2Data = [];
	for (var i in data[_selectedDomain]) {
		//		if (data[selectedDomain][i].include.includes("b2")) {
		b2Data.push(data[_selectedDomain][i]);
	//		}
	}
	return b2Data;
}
