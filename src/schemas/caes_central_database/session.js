const schema = {
	database: 'CAES_CENTRAL_DATABASE',
	table: 'SESSION',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			immutable: true,
			prettyName: 'ID'
		},
		{
			columnName: 'PERSONNEL_ID',
			type: 'int',
			required: true,
			prettyName: 'Personnel ID',
			constraint: {
				database: 'CAES_CENTRAL_DATABASE',
				table: 'PERSONNEL',
				foreignKey: 'ID',
				values: []
			}
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
			columnName: 'BEGIN_TIME',
			type: 'datetime',
			required: true
		},
		{
			columnName: 'LAST_ACCESS_TIME',
			type: 'datetime',
			required: true
		},
		{
			columnName: 'IP_ADDRESS',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'HAS_LOGGED_OUT',
			type: 'bit',
			required: true
		},
		{
			columnName: 'REQUEST_COUNT',
			type: 'int',
			required: true
		}
	]
};

export default schema;
