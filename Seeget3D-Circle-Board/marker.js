class MetaBoardMarker
{
	constructor(config, multiMarker = null) {
		this.margin = config.margin;
		this.outerCircleRadius = config.outerCircleRadius;
		this.outerRatio = config.outerRatio;
		this.topLeftWhiteRatio = config.topLeftWhiteRatio;
		this.otherWhiteRatio = config.otherWhiteRatio;
		this.centerRatio = 1;
		this.centerRingOuterRatio = config.centerRingOuterRatio;
		this.centerRingInnerRatio = config.centerRingInnerRatio;
		this.centerOuterCircleRatio = config.centerOuterCircleRatio;
		this.encodingType = config.encodingType;
		this.sectorColorCode = config.sectorColorCode;
		this.boardSize = config.boardSize;
		this.markerCount = 5;
		this.layout = "center-and-four-corners";
		if (multiMarker) {
			this.multiMetaBoard = multiMarker;
		}
	}
}

class MultiMarker
{
	constructor(rows, cols, gapH, gapV, startedId = 1)
	{
		this.rows = rows;
		this.columns = cols;
		this.horizontalSpacing = gapH;
		this.verticalSpacing = gapV;
		this.startedId = startedId;
	}
}
