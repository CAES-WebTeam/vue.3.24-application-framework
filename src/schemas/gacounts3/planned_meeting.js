const schema = {
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'PERSONNEL_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'ACTUAL_SUBMITTER_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'TOPIC_ID',
			type: 'int'
		},
		{
			columnName: 'COMMITTEE_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'REPORT_ID',
			type: 'int'
		},
		{
			columnName: 'TITLE',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'DATE_BEGIN',
			type: 'datetime',
			required: true
		},
		{
			columnName: 'MEETING_HAS_OCCURED',
			type: 'bit',
			required: true
		},
		{
			columnName: 'MINUTES_FILE_PATH',
			type: 'nvarchar'
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
		}
	]
};

export default schema;
