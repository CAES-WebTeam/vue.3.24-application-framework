const criteriaFields = [
	'eq',
	'neq',
	'gt',
	'lt'
];

const getCriteriaStructure = schema => {
	const criteriaStructure = {
		submitSearch: true,
		displayMode: 'NORMAL',
		queryMode: 'NORMAL',
		sortKey: ''
	};
	schema.columns.forEach(column => {
		criteriaFields.forEach(field => {
			criteriaStructure[`criteria_${column.columnName}_${field}`] = '';
		});
	});

	return criteriaStructure;
};

export default { getCriteriaStructure };
