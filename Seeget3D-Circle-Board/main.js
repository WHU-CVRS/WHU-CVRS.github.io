function appendGCPPattern(svg, centerX, centerY, outerCircleRadius, outerRatio, whiteRatio) {
	var whiteCircleRadius = outerCircleRadius * whiteRatio / outerRatio;
	var centerCircleRadius = outerCircleRadius / outerRatio;

	var outerCircle = document.createElement('circle');
	outerCircle.setAttribute('r', outerCircleRadius);
	outerCircle.setAttribute('cx', centerX);
	outerCircle.setAttribute('cy', centerY);
	outerCircle.setAttribute('fill', 'black');
	svg.appendChild(outerCircle);

	var whiteCircle = document.createElement('circle');
	whiteCircle.setAttribute('r', whiteCircleRadius);
	whiteCircle.setAttribute('cx', centerX);
	whiteCircle.setAttribute('cy', centerY);
	whiteCircle.setAttribute('fill', 'white');
	svg.appendChild(whiteCircle);

	var centerCircle = document.createElement('circle');
	centerCircle.setAttribute('r', centerCircleRadius);
	centerCircle.setAttribute('cx', centerX);
	centerCircle.setAttribute('cy', centerY);
	centerCircle.setAttribute('fill', 'black');
	svg.appendChild(centerCircle);
}

function appendCenterRing(svg, centerX, centerY, outerCircleRadius, outerRatio, ringOuterRatio, ringInnerRatio) {
	var ringOuterRadius = outerCircleRadius * ringOuterRatio / outerRatio;
	var ringInnerRadius = outerCircleRadius * ringInnerRatio / outerRatio;

	var outerRing = document.createElement('circle');
	outerRing.setAttribute('r', ringOuterRadius);
	outerRing.setAttribute('cx', centerX);
	outerRing.setAttribute('cy', centerY);
	outerRing.setAttribute('fill', 'black');
	svg.appendChild(outerRing);

	var innerRing = document.createElement('circle');
	innerRing.setAttribute('r', ringInnerRadius);
	innerRing.setAttribute('cx', centerX);
	innerRing.setAttribute('cy', centerY);
	innerRing.setAttribute('fill', 'white');
	svg.appendChild(innerRing);
}

function polarToPoint(centerX, centerY, radius, angleDegree) {
	var angleRadian = angleDegree * Math.PI / 180;
	return {
		x: centerX + radius * Math.cos(angleRadian),
		y: centerY + radius * Math.sin(angleRadian),
	};
}

function appendAnnularSector(svg, centerX, centerY, innerRadius, outerRadius, startAngle, endAngle, fill) {
	var outerStart = polarToPoint(centerX, centerY, outerRadius, startAngle);
	var outerEnd = polarToPoint(centerX, centerY, outerRadius, endAngle);
	var innerEnd = polarToPoint(centerX, centerY, innerRadius, endAngle);
	var innerStart = polarToPoint(centerX, centerY, innerRadius, startAngle);
	var largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

	var sector = document.createElement('path');
	var d = [
		'M', outerStart.x, outerStart.y,
		'A', outerRadius, outerRadius, 0, largeArcFlag, 1, outerEnd.x, outerEnd.y,
		'L', innerEnd.x, innerEnd.y,
		'A', innerRadius, innerRadius, 0, largeArcFlag, 0, innerStart.x, innerStart.y,
		'Z',
	].join(' ');
	sector.setAttribute('d', d);
	sector.setAttribute('fill', fill);
	svg.appendChild(sector);
}

function getEncodingBitCount(encodingType) {
	return encodingType === 20 ? 16 : 8;
}

function getEncodingLimit(encodingType) {
	return encodingType === 20 ? 65536 : 256;
}

function getEncodingLimitMessage(encodingType) {
	return encodingType === 20 ? '超16bit限制1-65536' : '超8bit限制1-256';
}

function readSectorColorCode(encodingType) {
	var bitCount = getEncodingBitCount(encodingType);
	var limit = getEncodingLimit(encodingType);
	var value = Number(encodingCodeInput.value);

	encodingCodeInput.setAttribute('max', limit);
	if (!Number.isInteger(value) || value < 1 || value > limit) {
		encodingCodeInput.setCustomValidity(getEncodingLimitMessage(encodingType));
		encodingCodeInput.reportValidity();
		binaryCodeOutput.textContent = '';
		return null;
	}

	encodingCodeInput.setCustomValidity('');
	var code = (value - 1).toString(2).padStart(bitCount, '0');
	binaryCodeOutput.textContent = code;
	return code;
}

function getSectorFill(sectorColorCode, index) {
	return sectorColorCode[index] === '1' ? 'black' : 'white';
}

function appendCenterOuterAnnulusSectors(svg, centerX, centerY, config) {
	var innerRadius = config.outerCircleRadius * config.centerRingOuterRatio / config.outerRatio;
	var outerRadius = config.outerCircleRadius * config.centerOuterCircleRatio / config.outerRatio;
	var directions = [-90, 0, 90, 180];
	var sectorAngle = config.encodingType === 20 ? 20 : 30;
	var sectorsPerDirection = config.encodingType === 20 ? 4 : 2;
	var sectorIndex = 0;

	directions.forEach(direction => {
		var startAngle = direction - sectorAngle * sectorsPerDirection / 2;
		for (var i = 0; i < sectorsPerDirection; i += 1) {
			appendAnnularSector(
				svg,
				centerX,
				centerY,
				innerRadius,
				outerRadius,
				startAngle + sectorAngle * i,
				startAngle + sectorAngle * (i + 1),
				getSectorFill(config.sectorColorCode, sectorIndex)
			);
			sectorIndex += 1;
		}
	});
}

function generateMetaBoardPattern(config) {
	var centerOuterCircleRadius = config.outerCircleRadius * config.centerOuterCircleRatio / config.outerRatio;
	var boardSize = 2 * (centerOuterCircleRadius + config.outerCircleRadius);
	var boardCenter = boardSize / 2;
	var svg = document.createElement('svg');

	svg.setAttribute('viewBox', '0 0 ' + boardSize + ' ' + boardSize);
	svg.setAttribute('width', boardSize);
	svg.setAttribute('height', boardSize);
	svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	svg.setAttribute('shape-rendering', 'geometricPrecision');

	appendCenterOuterAnnulusSectors(svg, boardCenter, boardCenter, config);
	appendCenterRing(svg, boardCenter, boardCenter, config.outerCircleRadius, config.outerRatio, config.centerRingOuterRatio, config.centerRingInnerRatio);

	var positions = [
		[boardCenter - centerOuterCircleRadius, boardCenter - centerOuterCircleRadius, config.topLeftWhiteRatio],
		[boardCenter + centerOuterCircleRadius, boardCenter - centerOuterCircleRadius, config.otherWhiteRatio],
		[boardCenter, boardCenter, config.otherWhiteRatio],
		[boardCenter - centerOuterCircleRadius, boardCenter + centerOuterCircleRadius, config.otherWhiteRatio],
		[boardCenter + centerOuterCircleRadius, boardCenter + centerOuterCircleRadius, config.otherWhiteRatio],
	];

	positions.forEach(position => {
		appendGCPPattern(svg, position[0], position[1], config.outerCircleRadius, config.outerRatio, position[2]);
	});

	return svg;
}

function getConfig() {
	var encodingType = Number(encodingTypeSelect.value);

	var sectorColorCode = readSectorColorCode(encodingType);
	if (sectorColorCode === null) {
		return null;
	}

	var config = {
		margin: Number(marginInput.value),
		outerCircleRadius: Number(outerCircleRadiusInput.value),
		outerRatio: Number(outerRatioInput.value),
		topLeftWhiteRatio: Number(topLeftWhiteRatioInput.value),
		otherWhiteRatio: Number(otherWhiteRatioInput.value),
		centerRingOuterRatio: Number(centerRingOuterRatioInput.value),
		centerRingInnerRatio: Number(centerRingInnerRatioInput.value),
		centerOuterCircleRatio: Number(centerOuterCircleRatioInput.value),
		encodingType: encodingType,
		sectorColorCode: sectorColorCode,
	};
	config.centerOuterCircleRadius = config.outerCircleRadius * config.centerOuterCircleRatio / config.outerRatio;
	config.boardSize = 2 * (config.centerOuterCircleRadius + config.outerCircleRadius);
	config.width = 2 * config.margin + config.boardSize;
	config.height = 2 * config.margin + config.boardSize;
	return config;
}

function wrapWithMargin(svg, config, displaySize) {
	var output = document.createElement('svg');
	output.setAttribute('viewBox', '0 0 ' + config.width + ' ' + config.height);
	output.setAttribute('width', displaySize ? displaySize + 'px' : config.width + 'mm');
	output.setAttribute('height', displaySize ? displaySize + 'px' : config.height + 'mm');
	output.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	output.setAttribute('shape-rendering', 'geometricPrecision');
	svg.setAttribute('x', config.margin);
	svg.setAttribute('y', config.margin);
	output.appendChild(svg);
	return output;
}

function setPreviewSize(svg, width, height, maxSize) {
	var scale = Math.min(maxSize / width, maxSize / height, 1);
	svg.setAttribute('width', width * scale + 'px');
	svg.setAttribute('height', height * scale + 'px');
}

async function downloadPDF(element, fileName, width, height) {
	var pdf = new jsPDF({
		unit: 'mm',
		format: [width, height],
		floatPrecision: 'smart',
		orientation: width > height ? 'l' : 'p',
	});
	await pdf.svg(element);
	pdf.save(fileName);
}

function saveAsJson(str, fileName) {
	const blob = new Blob([str], { type: "application/json;charset=utf-8" });
	const href = URL.createObjectURL(blob);
	const alink = document.createElement("a");
	alink.style.display = "none";
	alink.download = fileName;
	alink.href = href;
	document.body.appendChild(alink);
	alink.click();
	document.body.removeChild(alink);
	URL.revokeObjectURL(href);
};

function getFilePrefix(config) {
	return 'meta-board-r' + config.outerCircleRadius + '-ratio-' + config.outerRatio + '-' + config.topLeftWhiteRatio + '-' + config.otherWhiteRatio +
		'-ring-' + config.centerRingOuterRatio + '-' + config.centerRingInnerRatio + '-outer-' + config.centerOuterCircleRatio +
		'-encoding-' + config.encodingType + '-code-' + config.sectorColorCode;
}

function renderSingle() {
	pdfButton.removeEventListener('click', pdfButtonClick);
	jsonButton.removeEventListener('click', jsonButtonClick);

	var content = document.querySelector('.marker');
	var config = getConfig();
	if (config === null) {
		return;
	}

	var output = wrapWithMargin(generateMetaBoardPattern(config), config, 550);
	content.innerHTML = output.outerHTML;
	var filePrefix = getFilePrefix(config);

	var exportSvg = output.outerHTML
		.replace('viewbox', 'viewBox')
		.replace('550px', config.width + 'mm')
		.replace('550px', config.height + 'mm');
	svgButton.setAttribute('href', 'data:image/svg;base64,' + btoa(exportSvg));
	svgButton.setAttribute('download', filePrefix + '.svg');

	pdfButtonClick = async () => {
		var svgPDF = wrapWithMargin(generateMetaBoardPattern(config), config);
		await downloadPDF(svgPDF, filePrefix + '.pdf', config.width, config.height);
	}

	jsonButtonClick = () => {
		var marker = new MetaBoardMarker(config);
		saveAsJson(JSON.stringify({ "metaBoard": marker }), filePrefix + '.json');
	}

	pdfButton.addEventListener('click', pdfButtonClick);
	jsonButton.addEventListener('click', jsonButtonClick);
}

function renderMulti() {
	multiPdfButton.removeEventListener('click', multiPdfButtonClick);
	multiJsonButton.removeEventListener('click', multiJsonButtonClick);

	var content = document.querySelector('.multi-marker');
	var config = getConfig();
	if (config === null) {
		return;
	}

	var rows = Number(rowInput.value);
	var cols = Number(colInput.value);
	var gapH = Number(gapHInput.value);
	var gapV = Number(gapVInput.value);
	var width = 2 * config.margin + cols * config.boardSize + (cols - 1) * gapH;
	var height = 2 * config.margin + rows * config.boardSize + (rows - 1) * gapV;
	var output = document.createElement('svg');

	output.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
	output.setAttribute('width', width + 'mm');
	output.setAttribute('height', height + 'mm');
	output.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	output.setAttribute('shape-rendering', 'geometricPrecision');

	for (var i = 0; i < rows; i += 1) {
		for (var j = 0; j < cols; j += 1) {
			var svg = generateMetaBoardPattern(config);
			svg.setAttribute('x', config.margin + j * (config.boardSize + gapH));
			svg.setAttribute('y', config.margin + i * (config.boardSize + gapV));
			output.appendChild(svg);
		}
	}

	var filePrefix = getFilePrefix(config) + '-multi-' + rows + 'x' + cols;
	multiSvgButton.setAttribute('href', 'data:image/svg;base64,' + btoa(output.outerHTML.replace('viewbox', 'viewBox')));
	multiSvgButton.setAttribute('download', filePrefix + '.svg');
	setPreviewSize(output, width, height, 1100);
	content.innerHTML = output.outerHTML;

	multiPdfButtonClick = async () => {
		output.setAttribute('width', width + 'mm');
		output.setAttribute('height', height + 'mm');
		await downloadPDF(output, filePrefix + '.pdf', width, height);
		setPreviewSize(output, width, height, 1100);
	}

	multiJsonButtonClick = () => {
		var marker = new MetaBoardMarker(config, new MultiMarker(rows, cols, gapH, gapV));
		saveAsJson(JSON.stringify({ "metaBoard": marker }), filePrefix + '.json');
	}

	multiPdfButton.addEventListener('click', multiPdfButtonClick);
	multiJsonButton.addEventListener('click', multiJsonButtonClick);
}

function renderAll() {
	renderSingle();
	renderMulti();
}

var pdfButtonClick;
var jsonButtonClick;
var multiPdfButtonClick;
var multiJsonButtonClick;
const { jsPDF } = window.jspdf;

var marginInput = document.querySelector('.setup input[name=margin]');
var outerCircleRadiusInput = document.querySelector('.setup input[name=radius]');
var outerRatioInput = document.querySelector('.setup input[name=outer-ratio]');
var topLeftWhiteRatioInput = document.querySelector('.setup input[name=top-left-white-ratio]');
var otherWhiteRatioInput = document.querySelector('.setup input[name=other-white-ratio]');
var centerRingOuterRatioInput = document.querySelector('.setup input[name=center-ring-outer-ratio]');
var centerRingInnerRatioInput = document.querySelector('.setup input[name=center-ring-inner-ratio]');
var centerOuterCircleRatioInput = document.querySelector('.setup input[name=center-outer-circle-ratio]');
var encodingTypeSelect = document.querySelector('.setup select[name=encoding-type]');
var encodingCodeInput = document.querySelector('.setup input[name=encoding-code]');
var binaryCodeOutput = document.querySelector('.setup .binary-code');

var svgButton = document.querySelector('.svg-button');
var pdfButton = document.querySelector('.pdf-button');
var jsonButton = document.querySelector('.json-button');

var rowInput = document.querySelector('.setup input[name=row]');
var colInput = document.querySelector('.setup input[name=col]');
var gapHInput = document.querySelector('.setup input[name=gapH]');
var gapVInput = document.querySelector('.setup input[name=gapV]');
var multiPdfButton = document.querySelector('.multi-pdf-button');
var multiSvgButton = document.querySelector('.multi-svg-button');
var multiJsonButton = document.querySelector('.multi-json-button');

function init() {
	renderAll();

	[
		marginInput,
		outerCircleRadiusInput,
		outerRatioInput,
		topLeftWhiteRatioInput,
		otherWhiteRatioInput,
		centerRingOuterRatioInput,
		centerRingInnerRatioInput,
		centerOuterCircleRatioInput,
		encodingTypeSelect,
		rowInput,
		colInput,
		gapHInput,
		gapVInput,
		encodingCodeInput,
	].forEach(input => {
		input.addEventListener('change', renderAll);
	});

	encodingCodeInput.addEventListener('focus', () => {
		encodingCodeInput.select();
	});
	encodingCodeInput.addEventListener('input', renderAll);
}

init();
