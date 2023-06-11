// Thanks to trincot for this wonderful solution found here:
// https://stackoverflow.com/questions/45269991/nested-object-assign-using-javascript

const recursiveAssign = (a, b) => (Object(b) !== b ? b
		: Object.keys(b).reduce((a, key) =>
			Object.assign(a, {
				[key]: recursiveAssign(a[key], b[key])
			})
		, Object(a) === a ? a : {}));

export default recursiveAssign;
