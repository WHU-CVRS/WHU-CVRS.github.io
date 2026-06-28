function appendGCPPattern(svg, centerX, centerY, outerCircleRadius, outerRatio, whiteRatio) {
	var whiteCircleRadius = outerCircleRadius * whiteRatio / outerRatio;
	var centerCircleRadius = outerCircleRadius / outerRatio;

	var outerCircle = document.createElement('circle');
	outerCircle.setAttribute('r', outerCircleRadius);
	outerCircle.setAttribute('cx', centerX);
	outerCircle.setAttribute('cy', centerY);
	outerCircle.setAttribute('fill', 'black');
	outerCircle.setAttribute('stroke', 'none');
	svg.appendChild(outerCircle);

	var whiteCircle = document.createElement('circle');
	whiteCircle.setAttribute('r', whiteCircleRadius);
	whiteCircle.setAttribute('cx', centerX);
	whiteCircle.setAttribute('cy', centerY);
	whiteCircle.setAttribute('fill', 'white');
	whiteCircle.setAttribute('stroke', 'none');
	svg.appendChild(whiteCircle);

	var centerCircle = document.createElement('circle');
	centerCircle.setAttribute('r', centerCircleRadius);
	centerCircle.setAttribute('cx', centerX);
	centerCircle.setAttribute('cy', centerY);
	centerCircle.setAttribute('fill', 'black');
	centerCircle.setAttribute('stroke', 'none');
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
	outerRing.setAttribute('stroke', 'none');
	svg.appendChild(outerRing);

	var innerRing = document.createElement('circle');
	innerRing.setAttribute('r', ringInnerRadius);
	innerRing.setAttribute('cx', centerX);
	innerRing.setAttribute('cy', centerY);
	innerRing.setAttribute('fill', 'white');
	innerRing.setAttribute('stroke', 'none');
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
	sector.setAttribute('stroke', 'none');
	svg.appendChild(sector);
}

function appendWhiteBackground(svg, width, height) {
	var background = document.createElement('rect');
	background.setAttribute('x', 0);
	background.setAttribute('y', 0);
	background.setAttribute('width', width);
	background.setAttribute('height', height);
	background.setAttribute('fill', 'white');
	background.setAttribute('stroke', 'none');
	svg.appendChild(background);
}

function getEncodingBitCount(encodingType) {
	return encodingType === 20 ? 16 : 8;
}

function getEncodingLimit(encodingType) {
	return encodingType === 20 ? 65535 : 255;
}

function getEncodingLimitMessage(encodingType) {
	return encodingType === 20 ? '16bit encoding range: 1-65535' : '8bit encoding range: 1-255';
}

function getEncodingCode(value, encodingType) {
	var bitCount = getEncodingBitCount(encodingType);
	return value.toString(2).padStart(bitCount, '0');
}

function readSectorColorCode(encodingType, input, output) {
	var limit = getEncodingLimit(encodingType);
	var value = Number(input.value);

	input.setAttribute('max', limit);
	if (!Number.isInteger(value) || value < 1 || value > limit) {
		input.setCustomValidity(getEncodingLimitMessage(encodingType));
		input.reportValidity();
		output.textContent = '';
		return null;
	}

	input.setCustomValidity('');
	var code = getEncodingCode(value, encodingType);
	output.textContent = code;
	return code;
}

function readStartedId(encodingType, rows, cols) {
	var limit = getEncodingLimit(encodingType);
	var value = Number(startedIdInput.value);
	var lastValue = value + rows * cols - 1;

	startedIdInput.setAttribute('max', limit);
	if (!Number.isInteger(value) || value < 1 || value > limit) {
		startedIdInput.setCustomValidity(getEncodingLimitMessage(encodingType));
		startedIdInput.reportValidity();
		multiBinaryCodeOutput.textContent = '';
		return null;
	}
	if (lastValue > limit) {
		startedIdInput.setCustomValidity('Started ID plus marker count exceeds ' + limit);
		startedIdInput.reportValidity();
		multiBinaryCodeOutput.textContent = '';
		return null;
	}

	startedIdInput.setCustomValidity('');
	multiBinaryCodeOutput.textContent = getEncodingCode(value, encodingType);
	return value;
}

function getSectorFill(sectorColorCode, visualIndex, encodingType) {
	var bitCount = getEncodingBitCount(encodingType);
	var startVisualIndex = 0;
	var bitIndexFromRight = (visualIndex - startVisualIndex + bitCount) % bitCount;
	var codeIndex = bitCount - 1 - bitIndexFromRight;
	return sectorColorCode[codeIndex] === '1' ? 'black' : 'white';
}

function appendCenterOuterAnnulusSectors(svg, centerX, centerY, config) {
	var innerRadius = config.outerCircleRadius * config.centerRingOuterRatio / config.outerRatio;
	var outerRadius = config.outerCircleRadius * config.centerOuterCircleRatio / config.outerRatio;
	var directions = [-90, 0, 90, 180];
	var sectorAngle = config.encodingType === 20 ? 20 : 30;
	var sectorsPerDirection = config.encodingType === 20 ? 4 : 2;
	var sectorIndex = 0;
	var radiusOverlap = Math.max(0.05, config.outerCircleRadius * 0.001);
	var angleOverlap = 0.04;

	directions.forEach(direction => {
		var startAngle = direction - sectorAngle * sectorsPerDirection / 2;
		for (var i = 0; i < sectorsPerDirection; i += 1) {
			var fill = getSectorFill(config.sectorColorCode, sectorIndex, config.encodingType);
			if (fill === 'black') {
				appendAnnularSector(
					svg,
					centerX,
					centerY,
					Math.max(0, innerRadius - radiusOverlap),
					outerRadius + radiusOverlap,
					startAngle + sectorAngle * i - angleOverlap,
					startAngle + sectorAngle * (i + 1) + angleOverlap,
					fill
				);
			}
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

	appendWhiteBackground(svg, boardSize, boardSize);
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

function getBaseConfig(encodingType) {
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
	};
	config.centerOuterCircleRadius = config.outerCircleRadius * config.centerOuterCircleRatio / config.outerRatio;
	config.boardSize = 2 * (config.centerOuterCircleRadius + config.outerCircleRadius);
	config.width = 2 * config.margin + config.boardSize;
	config.height = 2 * config.margin + config.boardSize;
	return config;
}

function getConfig() {
	var encodingType = Number(encodingTypeSelect.value);

	var sectorColorCode = readSectorColorCode(encodingType, encodingCodeInput, binaryCodeOutput);
	if (sectorColorCode === null) {
		return null;
	}

	var config = getBaseConfig(encodingType);
	config.sectorColorCode = sectorColorCode;
	return config;
}

function wrapWithMargin(svg, config, displaySize) {
	var output = document.createElement('svg');
	output.setAttribute('viewBox', '0 0 ' + config.width + ' ' + config.height);
	output.setAttribute('width', displaySize ? displaySize + 'px' : config.width + 'mm');
	output.setAttribute('height', displaySize ? displaySize + 'px' : config.height + 'mm');
	output.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	output.setAttribute('shape-rendering', 'geometricPrecision');
	appendWhiteBackground(output, config.width, config.height);
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

function makeConfigForId(baseConfig, markerId) {
	return Object.assign({}, baseConfig, {
		sectorColorCode: getEncodingCode(markerId, baseConfig.encodingType),
	});
}

function validateBatchRange(start, end, limit) {
	batchStartInput.setAttribute('max', limit);
	batchEndInput.setAttribute('max', limit + 1);

	if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < 1) {
		return 'Start ID and End ID must be integers greater than or equal to 1.';
	}
	if (start >= end) {
		return 'End ID should be greater than Start ID.';
	}
	if (start > limit || end > limit + 1) {
		return 'ID out of range. Start ID should be less than or equal to ' + limit + ', End ID should be less than or equal to ' + (limit + 1) + '.';
	}
	if (end - start > 10) {
		return 'A maximum of 10 files can be downloaded in batches.';
	}
	return '';
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
	var encodingType = Number(encodingTypeSelect.value);
	var config = getBaseConfig(encodingType);

	var rows = Number(rowInput.value);
	var cols = Number(colInput.value);
	var gapH = Number(gapHInput.value);
	var gapV = Number(gapVInput.value);
	var startedId = readStartedId(encodingType, rows, cols);
	if (startedId === null) {
		return;
	}

	var width = 2 * config.margin + cols * config.boardSize + (cols - 1) * gapH;
	var height = 2 * config.margin + rows * config.boardSize + (rows - 1) * gapV;
	var output = document.createElement('svg');

	output.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
	output.setAttribute('width', width + 'mm');
	output.setAttribute('height', height + 'mm');
	output.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	output.setAttribute('shape-rendering', 'geometricPrecision');
	appendWhiteBackground(output, width, height);

	for (var i = 0; i < rows; i += 1) {
		for (var j = 0; j < cols; j += 1) {
			var markerId = startedId + i * cols + j;
			var markerConfig = Object.assign({}, config, {
				sectorColorCode: getEncodingCode(markerId, encodingType),
			});
			var svg = generateMetaBoardPattern(markerConfig);
			svg.setAttribute('x', config.margin + j * (config.boardSize + gapH));
			svg.setAttribute('y', config.margin + i * (config.boardSize + gapV));
			output.appendChild(svg);
		}
	}

	var filePrefix = getFilePrefix(Object.assign({}, config, {
		sectorColorCode: getEncodingCode(startedId, encodingType),
	})) + '-started-' + startedId + '-multi-' + rows + 'x' + cols;
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
		var marker = new MetaBoardMarker(Object.assign({}, config, {
			sectorColorCode: getEncodingCode(startedId, encodingType),
		}), new MultiMarker(rows, cols, gapH, gapV, startedId));
		saveAsJson(JSON.stringify({ "metaBoard": marker }), filePrefix + '.json');
	}

	multiPdfButton.addEventListener('click', multiPdfButtonClick);
	multiJsonButton.addEventListener('click', multiJsonButtonClick);
}

async function batchDownload(isDownloadSvg) {
	var content = document.querySelector('.batch-marker');
	var encodingType = Number(encodingTypeSelect.value);
	var limit = getEncodingLimit(encodingType);
	var start = Number(batchStartInput.value);
	var end = Number(batchEndInput.value);
	var errorMessage = validateBatchRange(start, end, limit);

	if (errorMessage) {
		content.style.fontSize = '20px';
		content.textContent = errorMessage;
		return;
	}

	content.innerHTML = '';
	content.style.fontSize = '0';

	var baseConfig = getBaseConfig(encodingType);
	for (var markerId = start; markerId < end; markerId += 1) {
		var config = makeConfigForId(baseConfig, markerId);
		var output = wrapWithMargin(generateMetaBoardPattern(config), config);
		var filePrefix = getFilePrefix(config);

		if (isDownloadSvg) {
			batchSvgButton.setAttribute('href', 'data:image/svg;base64,' + btoa(output.outerHTML.replace('viewbox', 'viewBox')));
			batchSvgButton.setAttribute('download', filePrefix + '.svg');
			batchSvgButton.click();
		} else {
			content.innerHTML = output.outerHTML;
			await downloadPDF(output, filePrefix + '.pdf', config.width, config.height);
		}
	}

	content.innerHTML = '';
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
var binaryCodeOutput = document.querySelector('.setup .single-binary-code');

var svgButton = document.querySelector('.svg-button');
var pdfButton = document.querySelector('.pdf-button');
var jsonButton = document.querySelector('.json-button');

var rowInput = document.querySelector('.setup input[name=row]');
var colInput = document.querySelector('.setup input[name=col]');
var gapHInput = document.querySelector('.setup input[name=gapH]');
var gapVInput = document.querySelector('.setup input[name=gapV]');
var startedIdInput = document.querySelector('.setup input[name=started-id]');
var multiBinaryCodeOutput = document.querySelector('.setup .multi-binary-code');
var multiPdfButton = document.querySelector('.multi-pdf-button');
var multiSvgButton = document.querySelector('.multi-svg-button');
var multiJsonButton = document.querySelector('.multi-json-button');
var batchStartInput = document.querySelector('.setup input[name=batch-start]');
var batchEndInput = document.querySelector('.setup input[name=batch-end]');
var batchPdfButton = document.querySelector('.batch-pdf-button');
var batchControlButton = document.querySelector('.batch-control-button');
var batchSvgButton = document.querySelector('.batch-svg-button');

function updateBatchLimits() {
	var limit = getEncodingLimit(Number(encodingTypeSelect.value));
	batchStartInput.setAttribute('max', limit);
	batchEndInput.setAttribute('max', limit + 1);
	if (Number(batchEndInput.value) > limit + 1) {
		batchEndInput.value = limit + 1;
	}
	if (Number(batchStartInput.value) > limit) {
		batchStartInput.value = limit;
	}
}

function init() {
	updateBatchLimits();
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
		startedIdInput,
		rowInput,
		colInput,
		gapHInput,
		gapVInput,
		encodingCodeInput,
		batchStartInput,
		batchEndInput,
	].forEach(input => {
		input.addEventListener('change', renderAll);
	});

	encodingCodeInput.addEventListener('focus', () => {
		encodingCodeInput.select();
	});
	encodingCodeInput.addEventListener('input', renderAll);
	startedIdInput.addEventListener('input', renderAll);
	batchStartInput.addEventListener('input', renderAll);
	batchEndInput.addEventListener('input', renderAll);
	encodingTypeSelect.addEventListener('change', updateBatchLimits);
	batchControlButton.addEventListener('click', () => batchDownload(true));
	batchPdfButton.addEventListener('click', () => batchDownload(false));
}

init();

