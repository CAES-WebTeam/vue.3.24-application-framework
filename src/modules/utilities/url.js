/* global URL */
const url = new URL(window.location.href);

// Right now this just returns the output of another function, but in the future
// it should be expanded to support browsers which do not support the
// searchParams api
const getParam = term => url.searchParams.get(term);

const getEditMode = () => {
	const editParam = getParam('edit');

	return editParam && editParam === 'true';
};

const isEditMode = getEditMode();

export default { getParam, isEditMode };
