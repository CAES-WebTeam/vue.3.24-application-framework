import { logError } from '~/modules/caesdb';

const constructNotificationMessage = (name, titles) => {
	if (titles.length < 1) {
		logError(new Error('Titles are missing from a schema component that affects other areas.'));

		return;
	}
	const before = `You have changed the ${name}.  This affects `;
	let middle = '';
	const after = `.  You might want to check ${titles.length > 1 ? 'those' : 'that'} area${titles.length > 1 ? 's' : ''} for new options!`;

	if (titles.length === 1) middle = `<strong>${titles[0]}</strong>`;
	 else if (titles.length === 2) middle = `<strong>${titles[0]}</strong> and <strong>${titles[1]}</strong>`;
	 else titles.forEach((title, i) => {
		if (i !== titles.length - 1) middle += `<strong>${title}</strong>, `;
			 else middle += `and <strong>${title}</strong>`;
	});

	return `
		${before}
		${middle}
		${after}
		<br />
		<button type="button" class="notify-button hide-notifications">
			Don't show me these again
		</button>
	`.trim();
};

export {
	constructNotificationMessage
};
