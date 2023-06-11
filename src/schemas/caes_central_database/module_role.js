const schema = {
	database: 'CAES_CENTRAL_DATABASE',
	table: 'MODULE_ROLE',
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
			columnName: 'LABEL',
			type: 'nvarchar',
			required: true
		}
	]
};

export default schema;
