const schema = {
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'SUB_REPORT_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'USER_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'COMMENT',
			type: 'ntext',
			required: true
		},
		{
			columnName: 'DATE_CREATED',
			type: 'datetime',
			required: true
		}
	]
};

export default schema;
