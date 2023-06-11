const getObjectIndexedByKeyFromArray = (arr, key) => arr.reduce((finalObject, item) => {
	finalObject[item[key]] = item;

	return finalObject;
}, {});

export default getObjectIndexedByKeyFromArray;
