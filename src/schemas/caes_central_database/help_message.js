const schema = {
	database: 'CAES_CENTRAL_DATABASE',
	table: 'HELP_MESSAGE',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			immutable: true,
			prettyName: 'ID'
		},
		{
			columnName: 'MODULE_ID',
			type: 'int',
			required: true,
			prettyName: 'Module ID',
			constraint: {
				database: 'CAES_CENTRAL_DATABASE',
				table: 'MODULE',
				foreignKey: 'ID',
				values: []
			}
		},
		{
			columnName: 'CODE_NAME',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'DESCRIPTION',
			type: 'ntext',
			required: true
		},
		{
			columnName: 'LABEL',
			type: 'nvarchar'
		}
	]
};

export default schema;
