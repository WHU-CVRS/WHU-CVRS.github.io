// 生成单个SVG
function generateMarkerSvg(width, height, bits, numOfOutsideH, numOfOutsideV, outsideBlackCircleRadius,
	insideBlackCircleRadius, insideWhiteCircleRadius, insideCenterCircleRadius, size,
	reverseCheck = false, opencvMarker = false, blackWhite = false) {
	if (opencvMarker) { reverseCheck = false; blackWhite = false; }

	var svg = document.createElement('svg');
	if (opencvMarker) {
		svg.setAttribute('viewBox', '0 0 ' + (width + 2 * numOfOutsideH + 2) + ' ' + (height + 2 * numOfOutsideV + 2));
		svg.setAttribute('width', size * (numOfOutsideH * 2 + width + 2) + 'mm');
		svg.setAttribute('height', size * (numOfOutsideV * 2 + height + 2) + 'mm');
	}
	else {
		svg.setAttribute('viewBox', '0 0 ' + (width + 2 * numOfOutsideH) + ' ' + (height + 2 * numOfOutsideV));
		svg.setAttribute('width', size * (numOfOutsideH * 2 + width) + 'mm');
		svg.setAttribute('height', size * (numOfOutsideV * 2 + height) + 'mm');
	}
	svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	svg.setAttribute('shape-rendering', 'geometricPrecision');

	var outsideBlackRadius = outsideBlackCircleRadius / size;
	var insideBlackRadius = insideBlackCircleRadius / size;
	var insideWhiteRadius = insideWhiteCircleRadius / size;
	var insideCenterRadius = insideCenterCircleRadius / size;

	// 黑白翻转
	if (blackWhite) {
		var rect = document.createElement('rect');
		rect.setAttribute('x', 0);
		rect.setAttribute('y', 0);
		rect.setAttribute('width', width + 2 * numOfOutsideV);
		rect.setAttribute('height', height + 2 * numOfOutsideV);
		rect.setAttribute('fill', 'black');
		svg.appendChild(rect);
	}

	// OpenCV Marker 绘制方法
	if (opencvMarker) {
		// Outside
		for (var i = 0; i < height + 2 * numOfOutsideV + 2; i++) {
			for (var j = 0; j < width + 2 * numOfOutsideH + 2; j++) {
				var pixel = document.createElement('circle');
				pixel.setAttribute('r', outsideBlackRadius);
				pixel.setAttribute('cx', j + 0.5);
				pixel.setAttribute('cy', i + 0.5);
				pixel.setAttribute('fill', 'black');
				svg.appendChild(pixel);
			}
		}
		// Marker Background
		var rect = document.createElement('rect');
		rect.setAttribute('x', numOfOutsideH);
		rect.setAttribute('y', numOfOutsideV);
		rect.setAttribute('width', width + 2);
		rect.setAttribute('height', height + 2);
		rect.setAttribute('fill', 'black');
		svg.appendChild(rect);
		// Inside
		for (var i = 0; i < height; i++) {
			for (var j = 0; j < width; j++) {
				var white = bits[i * height + j];
				if (white) {
					var rect = document.createElement('rect');
					rect.setAttribute('x', j + numOfOutsideH + 1);
					rect.setAttribute('y', i + numOfOutsideV + 1);
					rect.setAttribute('width', 1);
					rect.setAttribute('height', 1);
					rect.setAttribute('fill', 'white');
					svg.appendChild(rect);
				}
			}
		}
	}

	// Marker 绘制方法
	else {
		// Outside
		for (var i = 0; i < height + 2 * numOfOutsideV; i++) {
			for (var j = 0; j < width + 2 * numOfOutsideH; j++) {
				var pixel = document.createElement('circle');
				pixel.setAttribute('r', outsideBlackRadius);
				pixel.setAttribute('cx', j + 0.5);
				pixel.setAttribute('cy', i + 0.5);
				pixel.setAttribute('fill', blackWhite ? "white" : "black");
				svg.appendChild(pixel);
			}
		}

		if ((blackWhite && reverseCheck) || (!blackWhite && !reverseCheck)) {
			whiteColor = "white";
			blackColor = "black";
		}
		else {
			whiteColor = "black";
			blackColor = "white";
		}

		// Marker Background
		var rect = document.createElement('rect');
		rect.setAttribute('x', numOfOutsideH);
		rect.setAttribute('y', numOfOutsideV);
		rect.setAttribute('width', width);
		rect.setAttribute('height', height);
		rect.setAttribute('fill', whiteColor);
		svg.appendChild(rect);

		// "Pixels"
		for (var i = 0; i < height; i++) {
			for (var j = 0; j < width; j++) {
				var white = bits[i * height + j];

				if (!white) {
					var circle1 = document.createElement('circle');
					circle1.setAttribute('r', insideBlackRadius);
					circle1.setAttribute('cx', j + numOfOutsideH + 0.5);
					circle1.setAttribute('cy', i + numOfOutsideV + 0.5);
					circle1.setAttribute('fill', blackColor);
					svg.appendChild(circle1);

					var circle2 = document.createElement('circle');
					circle2.setAttribute('r', insideWhiteRadius);
					circle2.setAttribute('cx', j + numOfOutsideH + 0.5);
					circle2.setAttribute('cy', i + numOfOutsideV + 0.5);
					circle2.setAttribute('fill', whiteColor);
					svg.appendChild(circle2);

					var circle3 = document.createElement('circle');
					circle3.setAttribute('r', insideCenterRadius);
					circle3.setAttribute('cx', j + numOfOutsideH + 0.5);
					circle3.setAttribute('cy', i + numOfOutsideV + 0.5);
					circle3.setAttribute('fill', blackColor);
					svg.appendChild(circle3);
				}
				else {
					var circle1 = document.createElement('circle');
					circle1.setAttribute('r', insideBlackRadius);
					circle1.setAttribute('cx', j + numOfOutsideH + 0.5);
					circle1.setAttribute('cy', i + numOfOutsideV + 0.5);
					circle1.setAttribute('fill', blackColor);
					svg.appendChild(circle1);

					var circle2 = document.createElement('circle');
					circle2.setAttribute('r', insideWhiteRadius);
					circle2.setAttribute('cx', j + numOfOutsideH + 0.5);
					circle2.setAttribute('cy', i + numOfOutsideV + 0.5);
					circle2.setAttribute('fill', whiteColor);
					svg.appendChild(circle2);
				}
			}
		}
	}

	return svg;
}

function generateArucoMarker(width, height, dictName, id,
	numOfOutsideH, numOfOutsideV, outsideBlackCircleRadius,
	insideBlackCircleRadius, insideWhiteCircleRadius, insideCenterCircleRadius, size, reverseCheck, opencvMarker, blackWhite) {

	var bytes = dict[dictName][id];
	var bits = [];
	var bitsCount = width * height;
	// Parse marker's bytes
	for (var byte of bytes) {
		var start = bitsCount - bits.length;
		for (var i = Math.min(7, start - 1); i >= 0; i--) {
			bits.push((byte >> i) & 1);
		}
	}
	return generateMarkerSvg(width, height, bits, numOfOutsideH, numOfOutsideV, outsideBlackCircleRadius,
		insideBlackCircleRadius, insideWhiteCircleRadius, insideCenterCircleRadius, size, reverseCheck, opencvMarker, blackWhite);
}

var dict;

// Fetch markers dict
var loadDict = fetch('dict.json').then(function (res) {
	return res.json();
}).then(function (json) {
	dict = json;
});

var pdfButtonClick;
var jsonButtonClick;
var multiPdfButtonClick;
var multiJsonButtonClick;
const { jsPDF } = window.jspdf;
var svgGroup = [];

// UI
var dictSelect = document.querySelector('.setup select[name=dict]');
var markerIdInput = document.querySelector('.setup input[name=id]');
var sizeInput = document.querySelector('.setup input[name=size]');
var sideInput = document.querySelector('.setup input[name=side]');
var opencvHidden = document.querySelector('.setup .opencv-hidden');

var numOfOutsideHInput = document.querySelector('.setup input[name=num-outside-h]');
var numOfOutsideVInput = document.querySelector('.setup input[name=num-outside-v]');
var outsideBlackCircleRadiusInput = document.querySelector('.setup input[name=outside-black-circle-radius]');
var insideBlackCircleRadiusInput = document.querySelector('.setup input[name=inside-black-circle-radius]');
var insideWhiteCircleRadiusInput = document.querySelector('.setup input[name=inside-white-circle-radius]');
var insideCenterCircleRadiusInput = document.querySelector('.setup input[name=inside-center-circle-radius]');
var reverseCheckbox = document.querySelector('.setup input[name=checkbox]');
var opencvMarkerCheckbox = document.querySelector('.setup input[name=opencv]');
var blackWhiteCheckbox = document.querySelector('.setup input[name=bw]');

var svgButton = document.querySelector('.svg-button');
var pdfButton = document.querySelector('.pdf-button');
var jsonButton = document.querySelector('.json-button');

var rowInput = document.querySelector('.setup input[name=row]');
var colInput = document.querySelector('.setup input[name=col]');
var gapHInput = document.querySelector('.setup input[name=gapH]');
var gapVInput = document.querySelector('.setup input[name=gapV]');
var beginInput = document.querySelector('.setup input[name=begin]');
var multiPdfButton = document.querySelector('.multi-pdf-button');
var multiSvgButton = document.querySelector('.multi-svg-button');
var multiJsonButton = document.querySelector('.multi-json-button');


var startInput = document.querySelector('.setup input[name=start]');
var endInput = document.querySelector('.setup input[name=end]');
var batchPdfButton = document.querySelector('.batch-pdf-button');
var batchControlButton = document.querySelector('.batch-control-button');
var batchSvgButton = document.querySelector('.batch-svg-button');

async function downloadPDF(element, dictName, markerId, numOfOutsideH, numOfOutsideV, width, height) {

	var pdf = new jsPDF({
		unit: 'mm',
		format: [width, height],
		floatPrecision: 'smart',
		orientation: width > height ? 'l' : 'p',
	});
	await pdf.svg(element.firstElementChild);
	pdf.save(width + "mm_x_" + height + "mm-" + dictName + '-' + markerId + '-' + numOfOutsideH + "-" + numOfOutsideV + '.pdf');

}

function saveAsJson(str, fileName) {
	//指定类型文件类型application/json;charset=utf-8
	const blob = new Blob([str], { type: "application/json;charset=utf-8" });
	const href = URL.createObjectURL(blob);
	const alink = document.createElement("a");
	alink.style.display = "none";
	alink.download = fileName; // 下载后文件名
	alink.href = href;
	document.body.appendChild(alink);
	alink.click();
	document.body.removeChild(alink); // 下载完成移除元素
	URL.revokeObjectURL(href); // 释放掉blob对象
};

var maxMarkerID = 999;
var language = true;

function init() {
	function updateMarker() {
		pdfButton.removeEventListener('click', pdfButtonClick);
		jsonButton.removeEventListener('click', jsonButtonClick);
		var content = document.querySelector('.marker');

		var markerId = Number(markerIdInput.value);
		var size = Number(sizeInput.value);
		var side = Number(sideInput.value);
		var dictName = dictSelect.options[dictSelect.selectedIndex].value;
		var width = Number(dictSelect.options[dictSelect.selectedIndex].getAttribute('data-width'));
		var height = Number(dictSelect.options[dictSelect.selectedIndex].getAttribute('data-height'));
		if (dictName == "3x3_32")
			maxMarkerID = 31;
		else
			maxMarkerID = 999;
		markerIdInput.setAttribute("max", maxMarkerID);

		// 新参数
		var numOfOutsideH = Number(numOfOutsideHInput.value);
		var numOfOutsideV = Number(numOfOutsideVInput.value);
		var outsideBlackCircleRadius = Number(outsideBlackCircleRadiusInput.value);
		var insideBlackCircleRadius = Number(insideBlackCircleRadiusInput.value);
		var insideWhiteCircleRadius = Number(insideWhiteCircleRadiusInput.value);
		var insideCenterCircleRadius = Number(insideCenterCircleRadiusInput.value);
		var reverseCheck = reverseCheckbox.checked;
		var blackWhite = blackWhiteCheckbox.checked;
		var opencvMarker = opencvMarkerCheckbox.checked;

		if (opencvMarker)
			opencvHidden.style.display = "none";
		else
			opencvHidden.style.display = "block";

		// Wait until dict data is loaded
		loadDict.then(function () {
			if (markerId > maxMarkerID) {
				content.style.fontSize = "20px";
				if (language)
					content.innerHTML = "ID Out of Marker ID range. ID should be less than or equal to " + maxMarkerID + ".";
				else
					content.innerHTML = "ID 超出 Marker ID 范围, ID 应小于等于" + maxMarkerID;
				content.style.border = "0px";
				return;
			}

			content.innerHTML = "";
			content.style.fontSize = "0";
			content.style.border = "#000000 1px solid";

			// Generate marker
			var svg = generateArucoMarker(width, height, dictName, markerId,
				numOfOutsideH, numOfOutsideV, outsideBlackCircleRadius, insideBlackCircleRadius, insideWhiteCircleRadius, insideCenterCircleRadius,
				size, reverseCheck, opencvMarker, blackWhite);

			var output = document.createElement('svg');

			if (opencvMarker) {
				output.setAttribute('viewBox', '0 0 ' + (width + 2 * numOfOutsideH + 2 + side / size * 2) + ' ' + (height + 2 * numOfOutsideV + 2 + side / size * 2));
				output.setAttribute('width', size * (numOfOutsideH * 2 + width + 2) + side * 2 + 'mm');
				output.setAttribute('height', size * (numOfOutsideV * 2 + height + 2) + side * 2 + 'mm');

				svg.setAttribute('x', side / size);
				svg.setAttribute('y', side / size);
				svg.setAttribute('width', width + 2 + 2 * numOfOutsideH);
				svg.setAttribute('height', height + 2 + 2 * numOfOutsideV);
			}
			else {
				output.setAttribute('viewBox', '0 0 ' + (width + 2 * numOfOutsideH + side / size * 2) + ' ' + (height + 2 * numOfOutsideV + side / size * 2));
				output.setAttribute('width', size * (numOfOutsideH * 2 + width) + side * 2 + 'mm');
				output.setAttribute('height', size * (numOfOutsideV * 2 + height) + side * 2 + 'mm');
				svg.setAttribute('x', side / size);
				svg.setAttribute('y', side / size);
				svg.setAttribute('width', width + 2 * numOfOutsideH);
				svg.setAttribute('height', height + 2 * numOfOutsideV);
			}
			output.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			output.setAttribute('shape-rendering', 'geometricPrecision');
			output.appendChild(svg);

			content.innerHTML = output.outerHTML;

			if (opencvMarker) {
				width += 2;
				height += 2;
			}

			svgButton.setAttribute('href', 'data:image/svg;base64,' + btoa(output.outerHTML.replace('viewbox', 'viewBox')));
			svgButton.setAttribute('download', (size * (numOfOutsideH * 2 + width) + side * 2) +
				"mm_x_" + (size * (numOfOutsideV * 2 + height) + side * 2) + "mm-" +
				dictName + '-' + markerId + '-' + numOfOutsideH + "-" + numOfOutsideV + '.svg');

			pdfButtonClick = async () => {
				await downloadPDF(content,
					dictName, markerId, numOfOutsideH, numOfOutsideV,
					size * (numOfOutsideH * 2 + width) + side * 2,
					size * (numOfOutsideV * 2 + height) + side * 2);
			}
			jsonButtonClick = () => {
				if (opencvMarker)
					marker = new OpenCVMarker(dictName, markerId, side, numOfOutsideH, numOfOutsideV, size,
						outsideBlackCircleRadius, opencvMarker)
				else
					marker = new Marker(dictName, markerId, side, numOfOutsideH, numOfOutsideV, size,
						outsideBlackCircleRadius, insideBlackCircleRadius, insideWhiteCircleRadius, insideCenterCircleRadius,
						reverseCheck, blackWhite, opencvMarker);
				json = { "metaBoard": marker }
				saveAsJson(JSON.stringify(json), (size * (numOfOutsideH * 2 + width) + side * 2) +
					"mm_x_" + (size * (numOfOutsideV * 2 + height) + side * 2) + "mm-" + dictName + '-' + markerId + '-' + numOfOutsideH + "-" + numOfOutsideV + '.json');
			}
			pdfButton.addEventListener('click', pdfButtonClick);
			jsonButton.addEventListener('click', jsonButtonClick);
		});
	}

	updateMarker();

	dictSelect.addEventListener('change', updateMarker);
	markerIdInput.addEventListener('change', updateMarker);
	sizeInput.addEventListener('change', updateMarker);
	sideInput.addEventListener('change', updateMarker);
	numOfOutsideHInput.addEventListener('change', updateMarker);
	numOfOutsideVInput.addEventListener('change', updateMarker);
	outsideBlackCircleRadiusInput.addEventListener('change', updateMarker);
	insideBlackCircleRadiusInput.addEventListener('change', updateMarker);
	insideWhiteCircleRadiusInput.addEventListener('change', updateMarker);
	insideCenterCircleRadiusInput.addEventListener('change', updateMarker);
	reverseCheckbox.addEventListener('change', updateMarker);
	blackWhiteCheckbox.addEventListener('change', updateMarker);
	opencvMarkerCheckbox.addEventListener('change', updateMarker);

	function randomGroupMarker() {
		multiPdfButton.removeEventListener('click', multiPdfButtonClick);
		multiJsonButton.removeEventListener('click', multiJsonButtonClick);
		var content = document.querySelector('.multi-marker');
		svgGroup = [];

		var size = Number(sizeInput.value);
		var side = Number(sideInput.value);
		var begin = Number(beginInput.value);
		var dictName = dictSelect.options[dictSelect.selectedIndex].value;
		var width = Number(dictSelect.options[dictSelect.selectedIndex].getAttribute('data-width'));
		var height = Number(dictSelect.options[dictSelect.selectedIndex].getAttribute('data-height'));

		var numOfOutsideH = Number(numOfOutsideHInput.value);
		var numOfOutsideV = Number(numOfOutsideVInput.value);
		var outsideBlackCircleRadius = Number(outsideBlackCircleRadiusInput.value);
		var insideBlackCircleRadius = Number(insideBlackCircleRadiusInput.value);
		var insideWhiteCircleRadius = Number(insideWhiteCircleRadiusInput.value);
		var insideCenterCircleRadius = Number(insideCenterCircleRadiusInput.value);
		var reverseCheck = reverseCheckbox.checked;
		var blackWhite = blackWhiteCheckbox.checked;
		var opencvMarker = opencvMarkerCheckbox.checked;

		var row = Number(rowInput.value);
		var col = Number(colInput.value);
		var gapH = Number(gapHInput.value);
		var gapV = Number(gapVInput.value);

		var gapHPerSize = gapH / size;
		var gapVPerSize = gapV / size;

		// Wait until dict data is loaded
		loadDict.then(function () {
			if (begin + row * col > maxMarkerID + 1) {
				content.style.fontSize = "20px";
				if (language)
					content.innerHTML = "(Start ID + Rows * Columns) Out of Marker ID range. (Start ID + Rows * Columns) should be less than or equal to " + (maxMarkerID + 1) + ".";
				else
					content.innerHTML = "起始ID + row * col 超出 Marker ID 范围, 起始ID + row * col 应小于等于" + (maxMarkerID + 1);
				content.style.border = "0px";
				return;
			}

			content.innerHTML = "";
			content.style.fontSize = "0";
			content.style.border = "#000000 1px solid";

			var res = document.createElement('svg');
			res.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			res.setAttribute('shape-rendering', 'geometricPrecision');
			if (opencvMarker) {
				res.setAttribute('viewBox', '0 0 ' + (col * (width + 2 + 2 * numOfOutsideH) + (col - 1) * gapHPerSize + side / size * 2) + ' ' + (row * (height + 2 + 2 * numOfOutsideV) + (row - 1) * gapVPerSize + side / size * 2));
				res.setAttribute('width', size * (col * (width + 2 + 2 * numOfOutsideH)) + (col - 1) * gapH + side * 2 + 'mm');
				res.setAttribute('height', size * (row * (numOfOutsideV * 2 + height + 2)) + (row - 1) * gapV + side * 2 + 'mm');
			}
			else {
				res.setAttribute('viewBox', '0 0 ' + (col * (width + 2 * numOfOutsideH) + (col - 1) * gapHPerSize + side / size * 2) + ' ' + (row * (height + 2 * numOfOutsideV) + (row - 1) * gapVPerSize + side / size * 2));
				res.setAttribute('width', size * (col * (width + 2 * numOfOutsideH)) + (col - 1) * gapH + side * 2 + 'mm');
				res.setAttribute('height', size * (row * (numOfOutsideV * 2 + height)) + (row - 1) * gapV + side * 2 + 'mm');
			}

			for (var i = 0; i < row * col; ++i) {
				// Generate marker
				var svg = generateArucoMarker(width, height, dictName, begin + i,
					numOfOutsideH, numOfOutsideV, outsideBlackCircleRadius, insideBlackCircleRadius, insideWhiteCircleRadius, insideCenterCircleRadius,
					size, reverseCheck, opencvMarker, blackWhite);
				svgGroup.push(svg);
			}

			for (var i = 0; i < row; ++i) {
				for (var j = 0; j < col; ++j) {
					var svg = svgGroup[i * col + j];
					if (opencvMarker) {
						svg.setAttribute('x', j * (width + 2 + 2 * numOfOutsideH + gapHPerSize) + side / size);
						svg.setAttribute('y', i * (height + 2 + 2 * numOfOutsideV + gapVPerSize) + side / size);
						svg.setAttribute('width', width + 2 + 2 * numOfOutsideH);
						svg.setAttribute('height', height + 2 + 2 * numOfOutsideV);
					}
					else {
						svg.setAttribute('x', j * (width + 2 * numOfOutsideH + gapHPerSize) + side / size);
						svg.setAttribute('y', i * (height + 2 * numOfOutsideV + gapVPerSize) + side / size);
						svg.setAttribute('width', width + 2 * numOfOutsideH);
						svg.setAttribute('height', height + 2 * numOfOutsideV);
					}
					res.appendChild(svg);
				}
			}

			if (opencvMarker) {
				width += 2;
				height += 2;
			}

			multiSvgButton.setAttribute('href', 'data:image/svg;base64,' + btoa(res.outerHTML.replace('viewbox', 'viewBox')));
			multiSvgButton.setAttribute('download', (size * (col * (width + 2 * numOfOutsideH)) + (col - 1) * gapH + side * 2) + "mm_x_" +
				(size * (row * (numOfOutsideV * 2 + height)) + (row - 1) * gapV + side * 2) + "mm-" +
				dictName + '-' + "multi-" + begin + "-" + (begin + row * col) + '-' + numOfOutsideH + "-" + numOfOutsideV + '.svg');
			content.innerHTML = res.outerHTML;
			multiPdfButtonClick = async () => {
				await downloadPDF(content,
					dictName, "multi-" + begin + "-" + (begin + row * col), numOfOutsideH, numOfOutsideV,
					size * (col * (width + 2 * numOfOutsideH)) + (col - 1) * gapH + side * 2,
					size * (row * (numOfOutsideV * 2 + height)) + (row - 1) * gapV + side * 2,
				);
			}
			multiJsonButtonClick = () => {
				multi = new MultiMarker(begin, row, col, gapH, gapV)
				if (opencvMarker)
					marker = new OpenCVMarker(dictName, begin, side, numOfOutsideH, numOfOutsideV, size,
						outsideBlackCircleRadius, opencvMarker, multi)
				else
					marker = new Marker(dictName, begin, side, numOfOutsideH, numOfOutsideV, size,
						outsideBlackCircleRadius, insideBlackCircleRadius, insideWhiteCircleRadius, insideCenterCircleRadius,
						reverseCheck, blackWhite, opencvMarker, multi);
				json = { "metaBoard": marker }
				saveAsJson(JSON.stringify(json), (size * (col * (width + 2 * numOfOutsideH)) + (col - 1) * gapH + side * 2) + "mm_x_" +
					(size * (row * (numOfOutsideV * 2 + height)) + (row - 1) * gapV + side * 2) + "mm-" + dictName + '-' + "multi-" + begin + "-" + (begin + row * col) + '-' + numOfOutsideH + "-" + numOfOutsideV + '.json');
			}

			multiPdfButton.addEventListener('click', multiPdfButtonClick);
			multiJsonButton.addEventListener('click', multiJsonButtonClick);
		})
	}

	randomGroupMarker();

	dictSelect.addEventListener('change', randomGroupMarker);
	markerIdInput.addEventListener('change', randomGroupMarker);
	sizeInput.addEventListener('change', randomGroupMarker);
	sideInput.addEventListener('change', randomGroupMarker);
	numOfOutsideHInput.addEventListener('change', randomGroupMarker);
	numOfOutsideVInput.addEventListener('change', randomGroupMarker);
	outsideBlackCircleRadiusInput.addEventListener('change', randomGroupMarker);
	insideBlackCircleRadiusInput.addEventListener('change', randomGroupMarker);
	insideWhiteCircleRadiusInput.addEventListener('change', randomGroupMarker);
	insideCenterCircleRadiusInput.addEventListener('change', randomGroupMarker);
	reverseCheckbox.addEventListener('change', randomGroupMarker);
	blackWhiteCheckbox.addEventListener('change', randomGroupMarker);
	opencvMarkerCheckbox.addEventListener('change', randomGroupMarker);
	rowInput.addEventListener('change', randomGroupMarker);
	colInput.addEventListener('change', randomGroupMarker);
	gapHInput.addEventListener('change', randomGroupMarker);
	gapVInput.addEventListener('change', randomGroupMarker);
	beginInput.addEventListener('change', randomGroupMarker);
}

init();

function batchDownload(isDownloadSvg = false) {
	var content = document.querySelector('.batch-marker');

	var start = Number(startInput.value);
	var end = Number(endInput.value);

	var size = Number(sizeInput.value);
	var side = Number(sideInput.value);
	var dictName = dictSelect.options[dictSelect.selectedIndex].value;
	var width = Number(dictSelect.options[dictSelect.selectedIndex].getAttribute('data-width'));
	var height = Number(dictSelect.options[dictSelect.selectedIndex].getAttribute('data-height'));
	var numOfOutsideH = Number(numOfOutsideHInput.value);
	var numOfOutsideV = Number(numOfOutsideVInput.value);
	var outsideBlackCircleRadius = Number(outsideBlackCircleRadiusInput.value);
	var insideBlackCircleRadius = Number(insideBlackCircleRadiusInput.value);
	var insideWhiteCircleRadius = Number(insideWhiteCircleRadiusInput.value);
	var insideCenterCircleRadius = Number(insideCenterCircleRadiusInput.value);
	var reverseCheck = reverseCheckbox.checked;
	var blackWhite = blackWhiteCheckbox.checked;
	var opencvMarker = opencvMarkerCheckbox.checked;

	startInput.setAttribute("max", maxMarkerID);
	endInput.setAttribute("max", maxMarkerID + 1);

	if (start >= end) {
		content.style.fontSize = "20px";
		if (language)
			content.innerHTML = "End ID should be greater than Start ID.";
		else
			content.innerHTML = "终止 ID 应大于起始 ID";
		return;
	}
	if (start > maxMarkerID || end > maxMarkerID + 1) {
		content.style.fontSize = "20px";
		if (language)
			content.innerHTML = "ID out of Marker ID range. Start ID Should be less than or equal to " + maxMarkerID + ", End ID Should be less than or equal to " + (maxMarkerID + 1) + ".";
		else
			content.innerHTML = "ID 超出 Marker ID 范围, 起始 ID 应小于等于" + maxMarkerID + ", 终止 ID 应小于等于" + (maxMarkerID + 1);
		return;
	}
	if (end - start > 10) {
		content.style.fontSize = "20px";
		if (language)
			content.innerHTML = "A maximum of 10 files can be downloaded in batches, Beacuse excessive batch downloads can easily lead to file loss.";
		else
			content.innerHTML = "建议批量下载个数不超过10个, 批量下载个数过多容易导致文件丢失";
		return;
	}

	content.innerHTML = "";
	content.style.fontSize = "0";
	// Wait until dict data is loaded
	loadDict.then(function () {
		for (var i = start; i < end; ++i) {
			// Generate marker
			var svg = generateArucoMarker(width, height, dictName, i,
				numOfOutsideH, numOfOutsideV, outsideBlackCircleRadius, insideBlackCircleRadius, insideWhiteCircleRadius, insideCenterCircleRadius,
				size, reverseCheck, opencvMarker, blackWhite);

			var output = document.createElement('svg');

			if (opencvMarker) {
				output.setAttribute('viewBox', '0 0 ' + (width + 2 * numOfOutsideH + 2 + side / size * 2) + ' ' + (height + 2 * numOfOutsideV + 2 + side / size * 2));
				output.setAttribute('width', size * (numOfOutsideH * 2 + width + 2) + side * 2 + 'mm');
				output.setAttribute('height', size * (numOfOutsideV * 2 + height + 2) + side * 2 + 'mm');

				svg.setAttribute('x', side / size);
				svg.setAttribute('y', side / size);
				svg.setAttribute('width', width + 2 + 2 * numOfOutsideH);
				svg.setAttribute('height', height + 2 + 2 * numOfOutsideV);
			}
			else {
				output.setAttribute('viewBox', '0 0 ' + (width + 2 * numOfOutsideH + side / size * 2) + ' ' + (height + 2 * numOfOutsideV + side / size * 2));
				output.setAttribute('width', size * (numOfOutsideH * 2 + width) + side * 2 + 'mm');
				output.setAttribute('height', size * (numOfOutsideV * 2 + height) + side * 2 + 'mm');
				svg.setAttribute('x', side / size);
				svg.setAttribute('y', side / size);
				svg.setAttribute('width', width + 2 * numOfOutsideH);
				svg.setAttribute('height', height + 2 * numOfOutsideV);
			}
			output.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			output.setAttribute('shape-rendering', 'geometricPrecision');
			output.appendChild(svg);
			tempWidth = width;
			tempHeight = height;
			if (opencvMarker) {
				tempWidth += 2;
				tempHeight += 2;
			}
			if (!isDownloadSvg) {
				content.innerHTML = output.outerHTML;
				downloadPDF(content,
					dictName, i, numOfOutsideH, numOfOutsideV,
					size * (numOfOutsideH * 2 + tempWidth) + side * 2,
					size * (numOfOutsideV * 2 + tempHeight) + side * 2);
			}
			else {
				batchSvgButton.setAttribute('href', 'data:image/svg;base64,' + btoa(output.outerHTML.replace('viewbox', 'viewBox')));
				batchSvgButton.setAttribute('download', (size * (numOfOutsideH * 2 + tempWidth) + side * 2) + "mm_x_" +
					(size * (numOfOutsideV * 2 + tempHeight) + side * 2) + "mm-" + dictName + '-' + i + '-' + numOfOutsideH + "-" + numOfOutsideV + '.svg');
				batchSvgButton.click();
			}
		}
		content.innerHTML = "";
	})

}

batchPdfButton.addEventListener("click", () => batchDownload());
batchControlButton.addEventListener("click", () => batchDownload(true));

