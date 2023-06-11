import deepObjectAssign from './deepObjectAssign';
import formatDates from './formatDates';
import getObjectIndexedByKeyFromArray from './getObjectIndexedByKeyFromArray';
import recursiveAssign from './recursiveAssign';
import request from './request';
import sqlToHtml from './sqlToHtml';
import stringFormats from './stringFormats';
import url from './url';

// Function for prettifying table column names
const getPrettyColumnName = name => {
	const replacer = txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();

	return name.replace(/_/g, ' ').replace(/\w\S*/g, replacer);
};

// Function for validating modes of interaction with components
const modeValidator = mode => ['edit', 'view'].indexOf(mode) !== -1;

export {
	deepObjectAssign,
	formatDates,
	getPrettyColumnName,
	getObjectIndexedByKeyFromArray,
	modeValidator,
	recursiveAssign,
	request,
	sqlToHtml,
	stringFormats,
	url
};
