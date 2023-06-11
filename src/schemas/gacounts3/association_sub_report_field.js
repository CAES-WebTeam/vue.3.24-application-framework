const schema = {
	columns: [
		{
			columnName: 'SUB_REPORT_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'FIELD_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'FIELD_VALUE',
			type: 'float',
			required: true
		}
	]
};

export default schema;
