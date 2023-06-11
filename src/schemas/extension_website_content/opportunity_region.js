const schema = {
	database: 'EXTENSION_WEBSITE_CONTENT',
	table: 'OPPORTUNITY_REGION',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'DISTANCE_IN_MILES',
			type: 'int'
		},
		{
			columnName: 'LABEL',
			type: 'nvarchar',
			required: true
		}
	]
};

export default schema;
