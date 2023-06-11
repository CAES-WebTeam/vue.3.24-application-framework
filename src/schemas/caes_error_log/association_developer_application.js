const schema = {
	database: 'CAES_ERROR_LOG',
	table: 'ASSOCIATION_DEVELOPER_APPLICATION',
	title: 'Developer/Application Associations',
	columns: [
		{
			columnName: 'DEVELOPER_ID',
			prettyName: 'Developer ID',
			type: 'int',
			required: true,
			constraint: {
				database: 'CAES_ERROR_LOG',
				table: 'DEVELOPER',
				foreignKey: 'ID',
				values: []
			}
		},
		{
			columnName: 'APPLICATION_ID',
			prettyName: 'Application',
			type: 'int',
			required: true,
			constraint: {
				database: 'CAES_ERROR_LOG',
				table: 'APPLICATION',
				foreignKey: 'ID',
				foreignLabel: 'APPLICATION_NAME',
				values: []
			}
		},
		{
			columnName: 'DATE_CREATED',
			type: 'datetime',
			immutable: true
		},
		{
			columnName: 'DATE_LAST_UPDATED',
			type: 'datetime',
			immutable: true
		}
	]
};

export default schema;
