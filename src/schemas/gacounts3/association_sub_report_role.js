const schema = {
	columns: [
		{
			columnName: 'SUB_REPORT_ID',
			type: 'int',
			required: true,
			constraint: {
				foreignKey: 'ID',
				values: []
			}
		},
		{
			columnName: 'ROLE_ID',
			type: 'int',
			required: true,
			constraint: {
				foreignKey: 'ID',
				foreignLabel: 'LABEL',
				values: []
			}
		}
	]
};

export default schema;
