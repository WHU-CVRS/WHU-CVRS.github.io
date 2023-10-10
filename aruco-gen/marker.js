class Marker
{
	constructor(dictionary, id, margin, numOutsideH, numOutsideV, gridSize, 
		outsideBlackCircleRadius, insideFristCircleRadius, insideSecondCircleRadius,
		insideThirdCircleRadius, centerReverse, blackWhiteReverse, openCV, multimarker=null) {
		this.dictionary = dictionary.split('_')[0];
		this.markerID = id;
		this.margin = margin;
		this.horizontalRounds = numOutsideH;
		this.verticalRounds = numOutsideV;
		this.gridSize = gridSize;
		this.outerCircleRadius = outsideBlackCircleRadius;
		this.innerLargeCircleRadius = insideFristCircleRadius;
		this.innerMediumCircleRadius = insideSecondCircleRadius;
		this.innerSmallCircleRadius = insideThirdCircleRadius;
		this.isInnerBWFlip = centerReverse;
		this.isBWFlip = blackWhiteReverse;
		this.isOpenCVMarker = openCV;
		if(multimarker)
			this.multiMetaBoard = multimarker
	  }
}

class OpenCVMarker
{
	constructor(dictionary, id, margin, numOutsideH, numOutsideV, gridSize, 
		outsideBlackCircleRadius, openCV, multimarker=null) {
			this.dictionary = dictionary.split('_')[0];	
			this.markerID = id;
			this.margin = margin;
			this.horizontalRounds = numOutsideH;
			this.verticalRounds = numOutsideV;
			this.gridSize = gridSize;
			this.outerCircleRadius = outsideBlackCircleRadius;
			this.isOpenCVMarker = openCV;
			if(multimarker)
				this.multiMetaBoard = multimarker
	  }
}

class MultiMarker
{
	constructor(startID, rows, cols, gapH, gapV)
	{
		this.startMarkerID = startID;
		this.rows = rows;
		this.columns = cols;
		this.horizontalSpacing = gapH;
		this.verticalSpacing = gapV;
	}
}
