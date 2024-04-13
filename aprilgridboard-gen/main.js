var pdfButtonClick;
var jsonButtonClick;
const { jsPDF } = window.jspdf;
// 9d477181b   
async function downloadPDF(element, fileName, width, height) {
	var pdf = new jsPDF({
		unit: 'mm',
		format: [width, height],
		floatPrecision: 'smart',
		orientation: width > height ? 'l' : 'p',
	});
	console.log(element);
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
var nxInput = document.querySelector('.setup input[name=nx]');
var nyInput = document.querySelector('.setup input[name=ny]');
var startIDInput = document.querySelector('.setup input[name=id]');
var sizeInput = document.querySelector('.setup input[name=size]');
var spaceInput = document.querySelector('.setup input[name=space]');
var aprilFamilySelect = document.querySelector('.setup select[name=family]');

var svgButton = document.querySelector('.svg-button');
var pdfButton = document.querySelector('.pdf-button');
var jsonButton = document.querySelector('.json-button');

function generateAprilTag(position, metricSize, tagSpacing, tagID, tagFamililyData, symmCorners = true, borderBits = 2) {
    // Create an SVG element
	const svg = document.createElement("svg");
	svg.setAttribute("viewBox", `0 0 ${(1 + 2 * tagSpacing) * metricSize} ${(1 + 2 * tagSpacing) * metricSize}`);
	svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	svg.setAttribute('shape-rendering', 'geometricPrecision');
    svg.setAttribute("width", (1 + 2 * tagSpacing) * metricSize);
    svg.setAttribute("height", (1 + 2 * tagSpacing) * metricSize);
	svg.setAttribute("x", position[0]);
    svg.setAttribute("y", position[1]);

    // Get the tag code
    let tagCode;
    try {
        tagCode = BigInt(tagFamililyData.tagCodes[tagID]);
    } catch (error) {
        console.error(`[ERROR]: Requested tag ID of ${tagID} not available in the ${tagFamililyData.chosenTagFamiliy}`);
        return svg;
    }
    // Calculate the bit size of the tag
    const sqrtBits = Math.sqrt(tagFamililyData.totalBits);
    const bitSquareSize = metricSize / (sqrtBits + borderBits * 2);
	const metricSquareSize = tagSpacing * metricSize;
    // Position of tag
    const xPos = metricSquareSize;
    const yPos = metricSquareSize;


    // Borders (2x bit size)
    const borderSize = borderBits * bitSquareSize;

    svg.innerHTML += `<rect x="${xPos}" y="${yPos}" width="${metricSize}" height="${borderSize}" fill="black"></rect>`; // Bottom
    svg.innerHTML += `<rect x="${xPos}" y="${yPos + metricSize - borderSize}" width="${metricSize}" height="${borderSize}" fill="black"></rect>`; // Top
    svg.innerHTML += `<rect x="${xPos + metricSize - borderSize}" y="${yPos}" width="${borderSize}" height="${metricSize}" fill="black"></rect>`; // Left
    svg.innerHTML += `<rect x="${xPos}" y="${yPos}" width="${borderSize}" height="${metricSize}" fill="black"></rect>`; // Right

    // Create a 2D array for the code matrix
    const codeMatrix = Array.from({ length: sqrtBits }, () => Array(sqrtBits).fill(0));

    // Populate the code matrix
	// 初始化一个二维数组 codeMatrix，用于表示标记位的矩阵
	for (let i = 0; i < sqrtBits; i++) {
		for (let j = 0; j < sqrtBits; j++) {
			// 检查 tagCode 中的特定位是否为零
			if (!(tagCode & (BigInt(1) << BigInt(sqrtBits * i + j)))) {
				// 如果特定位为零，将 codeMatrix 中对应位置的元素设置为1
				codeMatrix[i][sqrtBits - j - 1] = 1;
			}
		}
	}

    // Bits
    for (let i = 0; i < sqrtBits; i++) {
        for (let j = 0; j < sqrtBits; j++) {
            if (codeMatrix[i][j]) {
                svg.innerHTML += `<rect x="${xPos + (j + borderBits) * bitSquareSize}" y="${yPos + ((borderBits - 1) + sqrtBits - i) * bitSquareSize}" width="${bitSquareSize}" height="${bitSquareSize}" fill="black"></rect>`;
            }
        }
    }

    // Add squares to make corners symmetric
    if (symmCorners) {
        const corners = [
            [xPos - metricSquareSize, yPos - metricSquareSize],
            [xPos + metricSize, yPos - metricSquareSize],
            [xPos + metricSize, yPos + metricSize],
            [xPos - metricSquareSize, yPos + metricSize]
        ];

        corners.forEach(point => {
            svg.innerHTML += `<rect x="${point[0]}" y="${point[1]}" width="${metricSquareSize}" height="${metricSquareSize}" fill="black"></rect>`;
        });
    }

    return svg;
}


function generateAprilBoard(margin, startID, nCols, nRows, tagSize, tagSpace, tagFamilyData) {
    const svgBoard = document.createElement("svg");
	svgBoard.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	svgBoard.setAttribute('shape-rendering', 'geometricPrecision');
    svgBoard.setAttribute("viewBox", `0 0 ${2 * margin + (1 + 2 * tagSpace) * tagSize + (nCols - 1) * (1 + tagSpace) * tagSize} ${2 * margin + 30 + (1 + 2 * tagSpace) * tagSize + (nRows - 1) * (1 + tagSpace) * tagSize}`);
    svgBoard.setAttribute("width", 2 * margin + (1 + 2 * tagSpace) * tagSize + (nCols - 1) * (1 + tagSpace) * tagSize);
    svgBoard.setAttribute("height", 2 * margin + 30 + (1 + 2 * tagSpace) * tagSize + (nRows - 1) * (1 + tagSpace) * tagSize);
	

	numTags = nCols * nRows
	for (y = 0; y < nRows; y++) {
		for (x = 0; x < nCols; x++) {
			id = startID + nCols * y + x
			let pos = [margin + x * (1 + tagSpace) * tagSize, margin + (nRows - y - 1) * (1 + tagSpace) * tagSize];
			const tagSvg = generateAprilTag(pos, tagSize, tagSpace, id, tagFamilyData);
			svgBoard.appendChild(tagSvg);
		}
	}

	// Axias
	// <svg width="15" height="15">
	// <line x1="1.5" y1="13.5" x2="13.5" y2="13.5" stroke="black" stroke-width="2"/>
	// <polygon points="13.5,13.5 13.0,13.0 13.0,14.0" fill="black"/>
	// <line x1="1.5" y1="13.5" x2="1.5" y2="1.5" stroke="black" stroke-width="2"/>
	// <polygon points="1.5,1.5 1.0,2.5 2.0,2.5" fill="black"/>
	// </svg>

	let linex = document.createElement("line");
	linex.setAttribute("x1", 5);
	linex.setAttribute("y1", 2 * margin + (1 + 2 * tagSpace) * tagSize + (nRows - 1) * (1 + tagSpace) * tagSize + 25);
	linex.setAttribute("x2", 25);
	linex.setAttribute("y2", 2 * margin + (1 + 2 * tagSpace) * tagSize + (nRows - 1) * (1 + tagSpace) * tagSize + 25);	
	linex.setAttribute("stroke", "red");
	linex.setAttribute("stroke-width", "1");
	svgBoard.appendChild(linex);

	let liney = document.createElement("line");
	liney.setAttribute("x1", 5);
	liney.setAttribute("y1", 2 * margin + (1 + 2 * tagSpace) * tagSize + (nRows - 1) * (1 + tagSpace) * tagSize + 5);
	liney.setAttribute("x2", 5);
	liney.setAttribute("y2", 2 * margin + (1 + 2 * tagSpace) * tagSize + (nRows - 1) * (1 + tagSpace) * tagSize + 25);	
	liney.setAttribute("stroke", "green");
	liney.setAttribute("stroke-width", "1");
	svgBoard.appendChild(liney);

	let arrowx = document.createElement("polygon");
	arrowx.setAttribute("points", `22.0,${2 * margin + (1 + 2 * tagSpace) * tagSize + (nRows - 1) * (1 + tagSpace) * tagSize + 22} 
	28.0,${2 * margin + (1 + 2 * tagSpace) * tagSize + (nRows - 1) * (1 + tagSpace) * tagSize + 25} 
	22.0,${2 * margin + (1 + 2 * tagSpace) * tagSize + (nRows - 1) * (1 + tagSpace) * tagSize + 28}`);
	arrowx.setAttribute("fill", "red");
	svgBoard.appendChild(arrowx);

	let arrowy = document.createElement("polygon");
	arrowy.setAttribute("points", `2.0,${2 * margin + (1 + 2 * tagSpace) * tagSize + (nRows - 1) * (1 + tagSpace) * tagSize + 8} 
	5.0,${2 * margin + (1 + 2 * tagSpace) * tagSize + (nRows - 1) * (1 + tagSpace) * tagSize + 2} 
	8.0,${2 * margin + (1 + 2 * tagSpace) * tagSize + (nRows - 1) * (1 + tagSpace) * tagSize + 8}`);
	arrowy.setAttribute("fill", "green");
	svgBoard.appendChild(arrowy);

	let textx = document.createElement("text");
	textx.setAttribute("x", 21);
	textx.setAttribute("y", 2 * margin + (1 + 2 * tagSpace) * tagSize + (nRows - 1) * (1 + tagSpace) * tagSize + 21);
	textx.setAttribute("font-size", "8");
	textx.setAttribute("fill", "red");
	textx.setAttribute("font-family", "Arial");
	textx.innerHTML = "x";
	svgBoard.appendChild(textx);

	let texty = document.createElement("text");
	texty.setAttribute("x", 8);
	texty.setAttribute("y", 2 * margin + (1 + 2 * tagSpace) * tagSize + (nRows - 1) * (1 + tagSpace) * tagSize + 8);
	texty.setAttribute("font-size", "8");
	texty.setAttribute("fill", "green");
	texty.setAttribute("font-family", "Arial");
	texty.innerHTML = "y";
	svgBoard.appendChild(texty);

	// Text
	let text =document.createElement("text");
	text.setAttribute("x", 30);
	text.setAttribute("y", 2 * margin + (1 + 2 * tagSpace) * tagSize + (nRows - 1) * (1 + tagSpace) * tagSize + 20);
	text.setAttribute("font-size", "12");
	text.setAttribute("font-family", "Arial");
	let caption = `startID=${startID}, ${nCols}x${nRows} tags, size=${tagSize / 10.0}cm, spacing=${tagSpace * tagSize / 10.0}cm(ratio: ${tagSpace})`;
	text.innerHTML = caption;
	svgBoard.appendChild(text);
	return svgBoard;
}

function init() {
	function updateMarker() {
		var content = document.querySelector('.marker');

		pdfButton.removeEventListener('click', pdfButtonClick);
		jsonButton.removeEventListener('click', jsonButtonClick);

		// 新参数
		var margin = Number(marginInput.value);
		var nx = Number(nxInput.value);
		var ny = Number(nyInput.value);
		var size = Number(sizeInput.value);
		var space = Number(spaceInput.value);
		var startID = Number(startIDInput.value);
		var aprilFamily = aprilFamilySelect.options[aprilFamilySelect.selectedIndex].value;
		const tagFamililyData = new AprilTagCodes(aprilFamily);
		
		startIDInput.setAttribute("max", tagFamililyData.tagCodes.length - nx * ny)

		if (startID + nx * ny > tagFamililyData.tagCodes.length) {
			content.style.fontSize = "20px";
			content.innerHTML = "(Start ID + Rows * Cols) Out of Marker ID range. Start ID should be less than or equal to " + (tagFamililyData.tagCodes.length - nx * ny) + ".";
			content.style.border = "0px";
			return;
		}

		content.innerHTML = "";
		content.style.fontSize = "0";
		content.style.border = "#000000 1px solid";

		let aprilboard = generateAprilBoard(margin, startID, nx, ny, size, space, tagFamililyData);
		content.innerHTML = aprilboard.outerHTML;

		width = 2 * margin + (1 + 2 * space) * size + (nx - 1) * (1 + space) * size
		height = 2 * margin + 30 + (1 + 2 * space) * size + (ny - 1) * (1 + space) * size
		
		svgButton.setAttribute('href', 'data:image/svg;base64,' + btoa(aprilboard.outerHTML.replace('viewbox', 'viewBox').replace(`width="${width}"`, `width="${width}mm"`).replace(`height="${height}"`, `height="${height}mm"`)));
		svgButton.setAttribute('download', aprilFamily + '-' + margin + '-' + nx + "-" + ny + "-" + size + "-" + space + '.svg');

		pdfButtonClick = async () => {
			var svgPDF = document.createElement('svg');
			svgPDF.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
			svgPDF.setAttribute('width', width + 'mm');
			svgPDF.setAttribute('height', height + 'mm');
			svgPDF.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			svgPDF.setAttribute('shape-rendering', 'geometricPrecision');
			svgPDF.appendChild(aprilboard);
			console.log(aprilboard)
			await downloadPDF(svgPDF,
				aprilFamily + '-' + margin + '-' + nx + "-" + ny + "-" + size + "-" + space + '.pdf', 
				width, height
				);
		}
		jsonButtonClick = () => {
			marker = new AprilMarker(aprilFamily, margin, startID, nx, ny, size, space);
			json = {"aprilBoard": marker}
			saveAsJson(JSON.stringify(json), aprilFamily + '-' + margin + '-' + nx + "-" + ny + "-" + size + "-" + space + '.json');
		}
		pdfButton.addEventListener('click', pdfButtonClick);
		jsonButton.addEventListener('click', jsonButtonClick);
	}

	updateMarker();

	marginInput.addEventListener('change', updateMarker);
	startIDInput.addEventListener('change', updateMarker);
	nxInput.addEventListener('change', updateMarker);
	nyInput.addEventListener('change', updateMarker);
	sizeInput.addEventListener('change', updateMarker);
	spaceInput.addEventListener('change', updateMarker);
	aprilFamilySelect.addEventListener('change', updateMarker);
}

init();
