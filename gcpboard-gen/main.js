// 生成单个SVG
function generateGCPMarker(width, height, centerLargeCircleDiameter, centerSmallCircleDiameter,
	outerLargeCircleDiameter, outerSmallCircleDiameter, outerCenterDistance) {

	var svg = document.createElement('svg');

	svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
	svg.setAttribute('width', width);
	svg.setAttribute('height', height);
	svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	svg.setAttribute('shape-rendering', 'geometricPrecision');

	var circles = [
		{
			cx: outerCenterDistance + outerLargeCircleDiameter / 2,
			cy: outerCenterDistance + outerLargeCircleDiameter / 2,
			r: centerLargeCircleDiameter / 2,
			small: centerSmallCircleDiameter / 2
		},
		{
			cx: outerLargeCircleDiameter / 2,
			cy: outerLargeCircleDiameter / 2,
			r: outerLargeCircleDiameter / 2,
			small: outerSmallCircleDiameter / 2
		},
		{
			cx: outerLargeCircleDiameter / 2,
			cy: outerLargeCircleDiameter / 2 + outerCenterDistance * 2,
			r: outerLargeCircleDiameter / 2,
			small: outerSmallCircleDiameter / 2
		},
		{
			cx: outerLargeCircleDiameter / 2 + outerCenterDistance * 2,
			cy: outerLargeCircleDiameter / 2,
			r: outerLargeCircleDiameter / 2,
			small: outerSmallCircleDiameter / 2
		},
		{
			cx: outerLargeCircleDiameter / 2 + outerCenterDistance * 2,
			cy: outerLargeCircleDiameter / 2 + outerCenterDistance * 2,
			r: outerLargeCircleDiameter / 2,
			small: outerSmallCircleDiameter / 2
		},
	];

	circles.forEach(circle => {
		var large = document.createElement('circle');
		large.setAttribute('r', circle.r);
		large.setAttribute('cx', circle.cx);
		large.setAttribute('cy', circle.cy);
		large.setAttribute('fill', 'black');
		svg.appendChild(large);

		var small1 = document.createElement('path');
		var d1 = "M" + circle.cx + " " + circle.cy + "L" + circle.cx + " " + (circle.cy - circle.small) + "A " + circle.small + " " + circle.small +  " 0 0 1 " + (circle.cx + circle.small) + " " + circle.cy + " Z";
		small1.setAttribute('d', d1);
		small1.setAttribute('fill', 'white');
		svg.appendChild(small1);

		var small2 = document.createElement('path');
		var d2 = "M" + circle.cx + " " + circle.cy + "L" + circle.cx + " " + (circle.cy + circle.small) + "A " + circle.small + " " + circle.small +  " 0 0 1 " + (circle.cx - circle.small) + " " + circle.cy + " Z";
		small2.setAttribute('d', d2)
		small2.setAttribute('fill', 'white');
		svg.appendChild(small2);
	}); 

	return svg;
}

var pdfButtonClick;
var jsonButtonClick;
const { jsPDF } = window.jspdf;

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

// UI
var marginInput = document.querySelector('.setup input[name=margin]');
var centerLargeCircleDiameterInput = document.querySelector('.setup input[name=clcd]');
var centerSmallCircleDiameterInput = document.querySelector('.setup input[name=cscd]');
var outerLargeCircleDiameterInput = document.querySelector('.setup input[name=olcd]');
var outerSmallCircleDiameterInput = document.querySelector('.setup input[name=oscd]');
var outerCenterDistanceInput = document.querySelector('.setup input[name=ocd]');

var svgButton = document.querySelector('.svg-button');
var pdfButton = document.querySelector('.pdf-button');
var jsonButton = document.querySelector('.json-button');

function init() {
	function updateMarker() {
		var content = document.querySelector('.marker');

		pdfButton.removeEventListener('click', pdfButtonClick);
		jsonButton.removeEventListener('click', jsonButtonClick);

		// 新参数
		var margin = Number(marginInput.value);
		var centerLargeCircleDiameter = Number(centerLargeCircleDiameterInput.value);
		var centerSmallCircleDiameter = Number(centerSmallCircleDiameterInput.value);
		var outerLargeCircleDiameter = Number(outerLargeCircleDiameterInput.value);
		var outerSmallCircleDiameter = Number(outerSmallCircleDiameterInput.value);
		var outerCenterDistance = Number(outerCenterDistanceInput.value);

		var width = 2 * (margin + outerCenterDistance) + outerLargeCircleDiameter
		var height = 2 * (margin + outerCenterDistance) + outerLargeCircleDiameter

		// Generate marker
		var svg = generateGCPMarker(width - 2 * margin, height - 2 * margin, centerLargeCircleDiameter, centerSmallCircleDiameter,
			outerLargeCircleDiameter, outerSmallCircleDiameter, outerCenterDistance);

		var output = document.createElement('svg');

		output.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
		output.setAttribute('width', 550 + 'px');
		output.setAttribute('height', 550 + 'px');
		svg.setAttribute('x', margin);
		svg.setAttribute('y', margin);
		
		output.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		output.setAttribute('shape-rendering', 'geometricPrecision');
		output.appendChild(svg);

		content.innerHTML = output.outerHTML;

		svgButton.setAttribute('href', 'data:image/svg;base64,' + btoa(output.outerHTML.replace('viewbox', 'viewBox').replace("550px", width + "mm").replace("550px", height + "mm")));
		svgButton.setAttribute('download', margin + '-' + centerLargeCircleDiameter + '-' + centerSmallCircleDiameter
		 + "-" + outerLargeCircleDiameter + "-" + outerSmallCircleDiameter + "-" + outerCenterDistance + '.svg');

		pdfButtonClick = async () => {
			var svgPDF = document.createElement('svg');
			svgPDF.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
			svgPDF.setAttribute('width', width + 'mm');
			svgPDF.setAttribute('height', height + 'mm');
			svgPDF.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			svgPDF.setAttribute('shape-rendering', 'geometricPrecision');
			svgPDF.appendChild(svg);
			await downloadPDF(svgPDF,
				margin + '-' + centerLargeCircleDiameter + '-' + centerSmallCircleDiameter
				+ "-" + outerLargeCircleDiameter + "-" + outerSmallCircleDiameter + "-" + outerCenterDistance + '.pdf', 
				width, height
				);
		}
		jsonButtonClick = () => {
			marker = new GCPMarker(margin, centerLargeCircleDiameter, centerSmallCircleDiameter, 
				outerLargeCircleDiameter, outerSmallCircleDiameter, outerCenterDistance);
			json = {"gcpBoard": marker}
			saveAsJson(JSON.stringify(json), margin + '-' + centerLargeCircleDiameter + '-' + centerSmallCircleDiameter
			+ "-" + outerLargeCircleDiameter + "-" + outerSmallCircleDiameter + "-" + outerCenterDistance + '.json');
		}
		pdfButton.addEventListener('click', pdfButtonClick);
		jsonButton.addEventListener('click', jsonButtonClick);
	}

	updateMarker();

	marginInput.addEventListener('change', updateMarker);
	centerLargeCircleDiameterInput.addEventListener('change', updateMarker);
	centerSmallCircleDiameterInput.addEventListener('change', updateMarker);
	outerLargeCircleDiameterInput.addEventListener('change', updateMarker);
	outerSmallCircleDiameterInput.addEventListener('change', updateMarker);
	outerCenterDistanceInput.addEventListener('change', updateMarker);
}

init();
