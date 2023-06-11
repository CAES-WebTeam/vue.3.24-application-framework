const schema = {
	database: 'EXTENSION_WEBSITE_CONTENT',
	table: 'EXTENSION_TOPIC',
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
		},
		{
			columnName: 'PARENT_ID',
			type: 'int'
		},
		{
			columnName: 'IS_ACTIVE',
			type: 'bit',
			required: true
		}
	]
};

export default schema;
