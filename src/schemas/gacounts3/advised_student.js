const schema = {
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'REPORT_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'DEGREE_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'MAJOR_DEPARTMENT_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'ADVISING_ROLE_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'FIRST_NAME',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'MIDDLE_NAME',
			type: 'nvarchar'
		},
		{
			columnName: 'LAST_NAME',
			type: 'nvarchar',
			required: true
		}
	]
};

export default schema;
