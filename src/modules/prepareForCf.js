const prepareForCf = object => {
	if (Array.isArray(object)) {
		const newArr = [];
		object.forEach((record, i) => {
			if (record !== null && typeof record === 'object') newArr[i] = prepareForCf(record);
			else if (record === null) newArr[i] = '';
			else if (typeof record === 'boolean') newArr[i] = record ? 1 : 0;
			else newArr[i] = record;
		});

		return newArr;
	}
	const newObj = {};
	for (const key in object) {
		const { [key]: record } = object;
		if (record instanceof File) newObj[key] = record;
		else if (record !== null && typeof record === 'object') newObj[key] = prepareForCf(record);
		else if (record === null) newObj[key] = '';
		else if (typeof record === 'boolean') newObj[key] = record ? 1 : 0;
		else newObj[key] = record;
	}

	return newObj;
};

export default prepareForCf;
