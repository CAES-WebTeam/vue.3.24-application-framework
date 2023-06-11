const isObject = item => item && typeof item === 'object' && !Array.isArray(item);

const deepObjectAssign = (target, ...sources) => {
	if (!sources.length) return target;
	const source = sources.shift();

	if (isObject(target) && isObject(source)) for (const key in source) if (isObject(source[key])) {
		if (!target[key]) Object.assign(target, {
			[key]: {}
		});

		deepObjectAssign(target[key], source[key]);
	} else {
		Object.assign(target, {
			[key]: source[key]
		});
	}


	return deepObjectAssign(target, ...sources);
};

export default deepObjectAssign;
