// Regular expressions used to determine the functionality of the criteria
// structure lines.
const rgx = {
	criteria: /^criteria_/,
	key: /^criteria_(.*)_[^_]+$/,
	comparison: /_([^_]+)$/
};

// Object to contain our comparison functions
const compare = {
	eq: (a, b) => b.indexOf(a) !== -1 || b.indexOf(a.toString()) !== -1,
	neq: (a, b) => b.indexOf(a) === -1 || b.indexOf(a.toString()) === -1,
	gt: (a, b) => a > b,
	lt: (a, b) => a < b
};

// Sorting function
const sortRecords = (records, key) => {
	if (records.length > 0) if (!key) {
		// If no key, attempt alphabetical sort
		const testRecord = records[0];
		if (testRecord.hasOwnProperty('LABEL'))

		// Sort by LABEL key
			records.sort((a, b) => {
				if (a.LABEL > b.LABEL) return 1;
				if (a.LABEL === b.LABEL) return 0;

				return -1;
			});
			 else if (testRecord.hasOwnProperty('NAME'))

		// Sort by NAME key
			records.sort((a, b) => {
				if (a.NAME > b.NAME) return 1;
				if (a.NAME === b.NAME) return 0;

				return -1;
			});
	} else {
		// Else, sort by the key
		records.sort((a, b) => {
			if (a[key] > b[key]) return 1;
			if (a[key] === b[key]) return 0;

			return -1;
		});
	}
};

// Function to convert criteria key to object
const criteriaToObj = (criteria, value) => {
	// If the criteria doesn't begin with 'criteria_', it's invalid (for now) so
	// return null.
	if (!rgx.criteria.test(criteria)) return null;

	// If the criteria value is empty, we don't care about it
	if (!value || value.length < 1) return null;

	// Attempt to get the criteria key, returning null if no match found
	const criteriaKeyMatch = criteria.match(rgx.key);
	if (!criteriaKeyMatch[1]) return null;

	// Do the same for the comparison
	const criteriaComparisonMatch = criteria.match(rgx.comparison);
	if (!criteriaComparisonMatch[1]) return null;

	// Create the criteria object
	const obj = {
		key: criteriaKeyMatch[1],
		comparison: criteriaComparisonMatch[1],
		value,
		test (record) {
			// If the record doesn't contain the key, it's invalid
			if (!record[this.key]) return false;

			return compare[this.comparison](record[this.key], this.value);
		}
	};

	// And return it
	return obj;
};

// The actual filtering function, which will filter out results that do not meet
// the specified criteria.
const filter = (records, criteriaStructure = {}) => {
	// An array to hold records that satisfy the criteria
	const newRecords = [];

	// Loop through each of the records
	records.forEach(record => {
		let recordIsValid = true;
		for (const key in criteriaStructure) {
			// Convert the key to an object
			const criteria = criteriaToObj(key, criteriaStructure[key]);

			// If the criteria is invalid, skip it
			if (!criteria) continue;

			// Test the record
			recordIsValid = criteria.test(record);

			// If the record is invalid, exit the loop
			if (!recordIsValid) break;
		}

		// Self-explanatory
		if (recordIsValid) newRecords.push(record);
	});

	// Return the valid records
	sortRecords(newRecords, criteriaStructure.SortKey);

	return newRecords;
};

const jsToCf = criteriaStructure => {
	const newCriteriaStructure = { ...criteriaStructure };
	for (const key in newCriteriaStructure) switch (true) {
		case newCriteriaStructure[key] === null:
			newCriteriaStructure[key] = '';
			break;
		case Array.isArray(newCriteriaStructure[key]):
			newCriteriaStructure[key] = newCriteriaStructure[key].join(',');
			break;
		case typeof newCriteriaStructure[key] === 'boolean':
			newCriteriaStructure[key] = newCriteriaStructure[key].toString();
			break;
	}

	return newCriteriaStructure;
};

const cfToJs = criteriaStructure => {
	const newCriteriaStructure = { ...criteriaStructure };
	for (const key in newCriteriaStructure) switch (true) {
		case newCriteriaStructure[key] === '':
			const critMatch = key.match(rgx.comparison);
			if (critMatch && critMatch[1]) if ((/n?eq/).test(critMatch[1])) {
				newCriteriaStructure[key] = [];
			} else {
				newCriteriaStructure[key] = null;
			}

			break;
		case (/false|true/i).test(newCriteriaStructure[key]):
			newCriteriaStructure[key] = JSON.parse(newCriteriaStructure[key]);
			break;
	}

	return newCriteriaStructure;
};

// We only want to export the filter function
export {
	cfToJs,
	filter,
	jsToCf
};
