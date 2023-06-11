import dateFormat from 'dateformat';

const formatDates = (dateFields, records) => {
	if (!Array.isArray(records)) records = [records];
	records.forEach(record => {
		dateFields.forEach(field => {
			// Have to check for null, because dateformat turns nulls into today's
			// date, which is lame and we don't want it.  WE DON'T WANT IT!
			if (record[field] !== null) record[field] = dateFormat(record[field], 'yyyy-mm-dd');
		});
	});
};

export default formatDates;
