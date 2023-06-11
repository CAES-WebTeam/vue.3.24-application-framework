const schema = {
	database: 'CAES_CENTRAL_DATABASE',
	table: 'FAILED_ATTEMPT',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			immutable: true,
			prettyName: 'ID'
		},
		{
			columnName: 'USERNAME',
			type: 'nvarchar',
			required: true
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
			columnName: 'ATTEMPT_TIME',
			type: 'datetime',
			required: true
		},
		{
			columnName: 'IP_ADDRESS',
			type: 'nvarchar',
			required: true
		}
	]
};

export default schema;
