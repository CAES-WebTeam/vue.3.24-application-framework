const schema = {
	database: 'CAES_CENTRAL_DATABASE',
	table: 'IMPERSONATION_PERMISSION',
	columns: [
		{
			columnName: 'IMPERSONATEE_ID',
			type: 'int',
			required: true,
			prettyName: 'Impersonatee ID',
			constraint: {
				database: 'CAES_CENTRAL_DATABASE',
				table: 'PERSONNEL',
				foreignKey: 'ID',
				values: []
			}
		},
		{
			columnName: 'IMPERSONATOR_ID',
			type: 'int',
			required: true,
			prettyName: 'Impersonator ID',
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
		}
	]
};

export default schema;
