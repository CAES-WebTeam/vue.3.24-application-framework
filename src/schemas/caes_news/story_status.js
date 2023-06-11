const schema = {
	database: 'CAES_NEWS',
	table: 'STORY_STATUS',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'NAME',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'LABEL',
			type: 'nvarchar',
			required: true
		}
	]
};

export default schema;
