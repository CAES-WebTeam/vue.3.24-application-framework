const schema = {
	database: 'EXTENSION_WEBSITE_CONTENT',
	table: 'OPPORTUNITY_DATE',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			immutable: true,
			prettyName: 'ID'
		},
		{
			columnName: 'OPPORTUNITY_ID',
			type: 'int',
			required: true,
			prettyName: 'Opportunity ID'
		},
		{
			columnName: 'START_DATE',
			type: 'datetime',
			required: true
		},
		{
			columnName: 'END_DATE',
			type: 'datetime',
			required: true
		},
		{
			columnName: 'DESCRIPTION',
			type: 'nvarchar'
		}
	]
};

export default schema;
