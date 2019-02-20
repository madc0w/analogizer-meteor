const selectedDomain = new ReactiveVar("size");


Template.main.helpers({

});

Template.main.events({
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
	//	a1 = document.getElementById("a1");
	//	b1 = document.getElementById("b1");
	//	a2 = document.getElementById("a2");
	//	b2 = document.getElementById("b2");
	//	multiplier = document.getElementById("multiplier");
	//	detailsTitle = document.getElementById("details_title");
	//	detailsMeasure = document.getElementById("details_measure");
	//	detailsLongDesc = document.getElementById("details_longDesc");
	//	const detailsSource = document.getElementById("details_source");
	//	const detailsImage = document.getElementById("details_image");

	const _selectedDomain = selectedDomain.get();
	//	defaults
	const a1Index = defaults[_selectedDomain].a1;
	const a2Index = defaults[_selectedDomain].a2;
	const b1Index = defaults[_selectedDomain].b1;
	$("#" + _selectedDomain).addClass("selected");
	$("#domain-descriptor").html(descriptors[_selectedDomain]);

	$("#a1 select").prop("selectedIndex", a1Index);
	$("#b1 select").prop("selectedIndex", b1Index);
	$("#a2 select").prop("selectedIndex", a2Index);

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
	a1Selection = data[_selectedDomain][a1.options[a1.selectedIndex].value];
	b1Selection = data[_selectedDomain][b1.options[b1.selectedIndex].value];
	a2Selection = data[_selectedDomain][a2.options[a2.selectedIndex].value];
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

	b2.innerHTML = b2Data[i - 1].description;
	b2.index = i - 1;
	multiplier.innerHTML = formatNum(result / b2Data[i - 1].measure, 2);

	a2a.init("Analogizer", {
		target : ".share-this",
		linkname : getFactText(),
	});

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
		i = $("#" + id + " select").prop("selectedIndex");
	} else {
		_data = getB2Data();
		i = b2.index;
	}
	const selection = _data[i];
	updateDetails(selection);
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
	updateUrl();
}

function updateUrl(isDefaults) {
	const url = document.URL;
	if (url.indexOf("?") > 0) {
		url = url.split("?")[0];
	}

	const a1Index = a1.selectedIndex;
	const a2Index = a2.selectedIndex;
	const b1Index = b1.selectedIndex;
	const _selectedDomain = selectedDomain.get();
	if (isDefaults) {
		a1Index = defaults[_selectedDomain].a1;
		a2Index = defaults[_selectedDomain].a2;
		b1Index = defaults[_selectedDomain].b1;
	}

	url += "?a1=" + a1Index + "&b1=" + b1Index + "&a2=" + a2Index + "&domain=" + _selectedDomain;
	window.history.pushState(null, null, url);
	return url;
}

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

function selectDomain(el) {
	if (selectedDomain.get() != el.id) {
		selectedDomain.set(el.id);
		window.location.href = updateUrl(true);
	}
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

function randomFact() {
	a1.selectedIndex = Math.floor(Math.random() * a1.options.length);
	do {
		b1.selectedIndex = Math.floor(Math.random() * b1.options.length);
	} while (a1.options[a1.selectedIndex].value == b1.options[b1.selectedIndex].value);
	do {
		a2.selectedIndex = Math.floor(Math.random() * a2.options.length);
	} while (a1.options[a1.selectedIndex].value == a2.options[a2.selectedIndex].value);

	compute();
	const selection = data[selectedDomain.get()][a1.options[a1.selectedIndex].value];
	updateDetails(selection);
	updateUrl();
}
