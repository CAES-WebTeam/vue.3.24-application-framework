export const phoneInputMask = e => {
	if (e.target.value.length === 0 || e.target.value === '(') return;

	const maxPhoneLength = 14;

	e.target.value = e.target.value
		.replace(/[^0-9]/g, '')
		.split('')
		.reduce((output, character, i, arr) => {
			output += character;
			if (arr.length >= 3 && i === 2) output += ') ';
			if (arr.length >= 6 && i === 5) output += '-';

			return output;
		}, '(')
		.substring(0, maxPhoneLength);
};
