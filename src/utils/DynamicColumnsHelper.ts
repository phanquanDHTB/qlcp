/**
 * This function calculate the width of a string based on its length
 * @param {string} text
 * @param {string} font
 */
const getTextWidth = (text: string, font = "14px -apple-system"): number => {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	let metrics: any = null
	if(context) {
		context.font = font;
		metrics = context.measureText(text);
	}
	return Math.round(metrics !== null ? metrics.width : 0 + 80);
};

/**
 * This function calculates the width of each column based on all CELL VALUES
 * @param {Array} columns
 * @param {Array} source
 * @param {Number} maxWidthPerCell
 */
export const calculateColumnsWidth = (
	columns: any[],
	source: any[],
	maxWidthPerCell = 500
): {
	columns: any[];
	source: any[];
	tableWidth: number;
} => {
	const columnsParsed = JSON.parse(JSON.stringify(columns));

	// First, we calculate the width for each column
	// The column width is based on its string length

	const columnsWithWidth = columnsParsed.map((column) =>
		Object.assign(column, {
			width: getTextWidth(column.title),
		})
	);

	// Since we have a minimum width (column's width already calculated),
	// now we are going to verify if the cell value is bigger
	// than the column width which is already set

	source.map((entry) => {
		columnsWithWidth.map((column, indexColumn) => {
			const columnWidth = column.width;
			const cellValue = Object.values(entry)[indexColumn];

			// Get the string width based on chars length
			let cellWidth = getTextWidth(cellValue as string);

			// Verify if the cell value is smaller than the column's width
			if (cellWidth < columnWidth) cellWidth = columnWidth;

			// Verify if the cell value width is bigger than our max width flag
			if (cellWidth > maxWidthPerCell) cellWidth = maxWidthPerCell;

			// Update the column width
			columnsWithWidth[indexColumn].width = cellWidth;
		});
	});

	// Sum of all columns width to determine the table max width
	const tableWidth = columnsWithWidth.reduce((a, b) => {
		return a + b.width;
	}, 0);

	return {
		columns: columnsWithWidth,
		source,
		tableWidth,
	};
};
