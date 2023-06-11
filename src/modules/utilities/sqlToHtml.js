const maps = [
	{
		input: 'number',
		types: ['int', 'float']
	},
	{
		input: 'date',
		types: ['datetime']
	},
	{
		input: 'checkbox',
		types: ['bit']
	},
	{
		input: 'text',
		types: ['nvarchar']
	},
	{
		input: 'textarea',
		types: ['ntext']
	}
];

export default column => {
	for (let i = 0; i < maps.length; ++i) {
		if (!column.constraint && maps[i].types.indexOf(column.type) !== -1) return maps[i].input;
		 if (column.constraint) return 'select';
	}
};
