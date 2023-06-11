<template lang="html">
	<div class="container">
		<!-- State Issue -->
		<div v-if="data.subReport.statePlannedProgram" class="row">
			<strong>
				State Issue:
			</strong>
			<span>
				{{ data.subReport.statePlannedProgram.NAME }}
			</span>
		</div>
		<!-- Local Issue -->
		<div v-if="data.subReport.plannedProgram" class="row">
			<strong>
				Local Issue:
			</strong>
			<span>
				{{ data.subReport.plannedProgram.NAME }}
			</span>
		</div>
		<!-- Roles -->
		<div class="row">
			<div v-if="data.roles.length > 0">
				<strong>
					Role(s):
				</strong>
				<span v-for="(role, index) in data.roles" :key="index">
					{{ role.SUB_REPORT_ROLE_LABEL ? role.SUB_REPORT_ROLE_LABEL : getRoleLabelFromTypeID(role.ROLE_ID) }}{{ index !== data.roles.length - 1 ? ',' : '' }}
				</span>
			</div>
			<div v-else>
				<strong>
					Role(s):
				</strong>
				<em>
					(None)
				</em>
			</div>
		</div>
		<!-- Outcomes, Impacts, and Achievements -->
		<div class="row">
			<div v-if="data.outcomes.length > 0">
				<strong>
					Outcome, Impact, &amp; Achievements:
				</strong>
				<span v-for="outcome in data.outcomes" :key="outcome.ID">
					{{ outcome.MEMO }}
				</span>
			</div>
			<div v-else>
				<strong>
					Outcome, Impact, &amp; Achievements:
				</strong>
				<em>
					(None)
				</em>
			</div>
		</div>
		<!-- Contacts -->
		<div v-if="data.contacts.length > 0" class="row">
			<h4>
				Contacts
			</h4>
			<table>
				<thead>
					<tr>
						<th>
							Contact Type
						</th>
						<th>
							Quantity
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="contact in data.contacts" :key="contact.TYPE_ID">
						<td>
							{{ contact.CONTACT_TYPE_LABEL }}
						</td>
						<td>
							{{ contact.QUANTITY }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<!-- Supplemental Data -->
		<div v-if="data.supplementalData.length > 0" class="row">
			<h4>
				Supplemental Data
			</h4>
			<table>
				<thead>
					<tr>
						<th>
							Field
						</th>
						<th>
							Value
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="record in data.supplementalData" :key="record.FIELD_ID">
						<td>
							{{ record.REPORT_FIELD_LABEL }}
						</td>
						<td>
							{{ fieldTypesWithLabels.indexOf(record.FIELD_TYPE_LABEL) !== -1 ? record.FIELD_OPTION_LABEL : record.FIELD_VALUE }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'SubReportPlainText',
		props: {
			data: {
				type: Object,
				required: true
			},
			roleTypes: {
				type: Array,
				default: () => []
			}
		},
		data () {
			return {
				fieldTypesWithLabels: ['String Data', 'Option Data']
			};
		},
		methods: {
			getRoleLabelFromTypeID (id) {
				const index = this.roleTypes.map(t => t.ROLE_ID).indexOf(id);
				if (index === -1) return '';

				return this.roleTypes[index].SUB_REPORT_ROLE_LABEL;
			}
		}
	};
</script>
