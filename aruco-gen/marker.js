class Marker
{
	constructor(dictionary, id, margin, numOutsideH, numOutsideV, gridSize, 
		outsideBlackCircleRadius, insideFristCircleRadius, insideSecondCircleRadius,
		insideThirdCircleRadius, centerReverse, blackWhiteReverse, openCV) {
		this.dictionary = dictionary;
		this.id = id;
		this.margin = margin;
		this.numOutsideH = numOutsideH;
		this.numOutsideV = numOutsideV;
		this.gridSize = gridSize;
		this.outsideBlackCircleRadius = outsideBlackCircleRadius;
		this.insideFristCircleRadius = insideFristCircleRadius;
		this.insideSecondCircleRadius = insideSecondCircleRadius;
		this.insideThirdCircleRadius = insideThirdCircleRadius;
		this.centerReverse = centerReverse;
		this.blackWhiteReverse = blackWhiteReverse;
		this.openCV = openCV;
	  }
}
