const schema = {
	database: 'CAES_CENTRAL_DATABASE',
	table: 'ASSOCIATION_WORKING_GROUP_MODULE',
	columns: [
		{
			columnName: 'GROUP_ID',
			type: 'int',
			required: true,
			prettyName: 'Group ID',
			constraint: {
				database: 'CAES_CENTRAL_DATABASE',
				table: 'WORKING_GROUP',
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
