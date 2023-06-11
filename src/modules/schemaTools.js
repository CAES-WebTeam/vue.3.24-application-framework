const enableConstraintValues = schema => {
	schema.columns.forEach(column => {
		if (column.constraint && !column.constraint.values) column.constraint.values = [];
	});

	return schema;
};

const sortingFunction = (a, b) => {
	if (!a.order || !b.order) return 0;
	if (a.order === -1 && b.order === -1) return 0;
	if (a.order === -1) return 1;
	if (b.order === -1) return -1;

	return a.order - b.order;
};

const getUnsortedSections = schema => {
	// Create an array to hold all of the sections
	const sections = [];

	// Check if the schema has sections defined
	if (!schema.sections) {
		// If there are no sections defined in the schema, first just create an
		// empty array to hold all of the areas
		const areas = [];

		// Then loop through each of the columns, adding them to the areas array
		schema.columns.forEach(column => {
			areas.push({
				type: 'column',
				data: column
			});
		});

		// Do the same for associations
		schema.associations.forEach(association => {
			if (association.forDataStoreOnly) return;

			areas.push({
				type: 'association',
				data: association
			});
		});

		// As well as for the subschemas
		schema.subschemas.forEach(subschema => {
			areas.push({
				type: 'subschema',
				data: subschema
			});
		});

		// Finally, push a default section with all of those areas into the sections
		// array
		sections.push({
			title: schema.title,
			order: 1,
			areas
		});


		// And return it
		return sections;
	}

	// Else, if there *are* sections defined in the schema
	// Push each of those sections into the sections array
	schema.sections.forEach(section => {
		section.areas = [];
		sections.push(section);
	});

	// Then add one last section to hold any unsorted areas
	sections.push({
		title: 'unsorted',
		order: -1,
		areas: []
	});

	// Create a map from the section titles, which we'll use to find the right
	// sections as we loop through everything else
	const sectionTitleMap = sections.map(s => s.title);

	// So, first we're gonna loop through each of the columns in the schema
	if (schema.columns) schema.columns.forEach(column => {
		// Check if the column has grouping information specified
		if (!column.grouping || !column.grouping.section) {
			// If the column doesn't have grouping information specified, push it into
			// the 'unsorted' section
			sections[sectionTitleMap.indexOf('unsorted')].areas.push({
				type: 'column',
				order: 1,
				data: column
			});
		} else {
			const section = sections[sectionTitleMap.indexOf(column.grouping.section)];
			if (section.fieldsets) {
				// Check if column belongs to a fieldset in its section
				let sectionBelongsToFieldset = false;
				section.fieldsets.forEach((fieldset, index) => {
					if (fieldset.columns && fieldset.columns.indexOf(column.columnName) !== -1) {
						sectionBelongsToFieldset = true;
						const indexOfExistingArea = section.areas.map(a => a.data.title).indexOf(fieldset.title);
						if (indexOfExistingArea === -1) {
							// If the fieldset has not already been added as an area, we
							// need to make a new one
							const area = {
								type: 'fieldset',
								order: fieldset.order,
								data: {
									...fieldset,
									fields: [column]
								}
							};
							if (column.breakAfter) area.data.fields.push({
								columnName: Math.random().toString(),
								isFlexBreak: true
							});

							section.areas.push(area);
						} else {
							// It's already added, so we just need to add the column
							section.areas[indexOfExistingArea].data.fields.push(column);
							if (column.breakAfter) section.areas[indexOfExistingArea].data.fields.push({
								columnName: Math.random().toString(),
								isFlexBreak: true
							});
						}
					}
				});
				if (!sectionBelongsToFieldset) sections[sectionTitleMap.indexOf(column.grouping.section)].areas.push({
					type: 'column',
					order: column.grouping.order || -1,
					data: column
				});
			} else {
				sections[sectionTitleMap.indexOf(column.grouping.section)].areas.push({
					type: 'column',
					order: column.grouping.order || -1,
					data: column
				});
			}
		}
	});


	// Then, essentially do the same thing for associations
	if (schema.associations) schema.associations.forEach(association => {
		// If the association is only present to populate the data store, we can
		// skip it here.
		if (association.forDataStoreOnly) return;

		// Check if the association has grouping information specified
		if (!association.grouping || !association.grouping.section)

		// If it doesn't, push it into the unsorted section
			sections[sectionTitleMap.indexOf('unsorted')].areas.push({
				type: 'association',
				order: 1,
				data: association
			});
				 else sections[sectionTitleMap.indexOf(association.grouping.section)].areas.push({
			type: 'association',
			order: association.grouping.order || -1,
			data: association
		});
	});


	// And finally, for subschemas
	if (schema.subschemas) schema.subschemas.forEach(subschema => {
		if (!subschema.grouping || !subschema.grouping.section) sections[sectionTitleMap.indexOf('unsorted')].areas.push({
			type: 'subschema',
			order: 1,
			data: subschema
		});
		else sections[sectionTitleMap.indexOf(subschema.grouping.section)].areas.push({
			type: 'subschema',
			order: subschema.grouping.order || -1,
			data: subschema
		});
	});

	return sections;
};

const getSortedSections = sections => {
	// First, just sort the sections
	const sortedSections = sections.sort(sortingFunction);

	// Then loop through each of the sections
	sortedSections.forEach(section => {
		// And sort their areas
		section.areas = section.areas.sort(sortingFunction);
	});


	// Then return our (hopefully) sorted sections!
	return sortedSections;
};

const getSortedSchema = schema => {
	// First, put everything into their respective sections
	const unsortedSections = getUnsortedSections(schema);

	// Then sort the sections and areas
	const sortedSections = getSortedSections(unsortedSections);

	// Then get rid of the unsorted section if there isn't anything there
	const unsortedIndex = sortedSections.map(s => s.title).indexOf('unsorted');
	if (unsortedIndex !== -1 && sortedSections[unsortedIndex].areas.length < 1) sortedSections.pop();
	const sortedSchema = {
		title: schema.title,
		tablePrefix: schema.tablePrefix,
		criteria: schema.criteria,
		deleteExisting: schema.deleteExisting,
		fetchExisting: schema.fetchExisting,
		cleanUpData: schema.cleanUpData,
		processSubmission: schema.processSubmission,
		sections: sortedSections,
		messageFetcher: schema.messageFetcher,
		databaseName: schema.databaseName
	};

	return sortedSchema;
};

export {
	enableConstraintValues,
	getSortedSchema
};
