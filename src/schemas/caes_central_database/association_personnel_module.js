const schema = {
	database: 'CAES_CENTRAL_DATABASE',
	table: 'ASSOCIATION_PERSONNEL_MODULE',
	title: 'Association Personnel Module',
	columns: [
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
			columnName: 'IS_ADMINISTRATOR',
			type: 'bit',
			required: true
		},
		{
			columnName: 'USERNAME',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'PASSWORD',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'DATE_CREATED',
			type: 'datetime',
			required: true
		},
		{
			columnName: 'DATE_LAST_UPDATED',
			type: 'datetime',
			required: true
		},
		{
			columnName: 'DATE_LAST_PASSWORD_CHANGE',
			type: 'datetime',
			required: true
		}
	]
};

export default schema;
