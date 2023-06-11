<template lang="html">
	<div>
		<label v-if="fieldType !== 'radio'" :class="fieldType === 'checkbox' && isInsideFieldset ? 'flex' : ''">
			<legend v-if="displayLabel">
				<h3 v-if="!isInsideFieldset">
					{{ fieldName }}
					<a v-if="field.helpMessageName" class="help-link" @click="$emit('show-help')">
						<HelpCircleIcon />
					</a>
					<em v-if="field.required" class="required-asterisk">*</em>
					<em v-if="field.caveat" class="is-small">
						({{ field.caveat }})
					</em>
				</h3>
				<h4 v-else>
					{{ fieldName }}
					<a v-if="field.helpMessageName" class="help-link" @click="$emit('show-help')">
						<HelpCircleIcon />
					</a>
					<em v-if="field.required" class="required-asterisk">*</em>
					<em v-if="field.caveat" class="is-small">
						({{ field.caveat }})
					</em>
				</h4>
				<p v-if="field.description">
					{{ field.description }}
				</p>
			</legend>
			<textarea
				v-if="fieldType === 'textarea'"
				:value="value"
				:required="field.required"
				:disabled="field.immutable"
				:style="field.style"
				:minlength="field.minlength"
				:maxlength="field.maxlength"
				:class="field.customClasses ? field.customClasses.join(' ') : ''"
				@input="$emit('input', $event.target.value)"
			>
			</textarea>
			<Editor
				v-else-if="fieldType === 'richtext'"
				:value="value"
				@input="$emit('input', $event.target.value)"
			/>
			<FuzzySelect
				v-else-if="fieldType === 'fuzzyselect'"
				:options="field.constraint.values"
				:value="value"
				@input="$emit('input', $event.target.value)"
			/>
			<select
				v-else-if="fieldType === 'select'"
				:value="value"
				:required="field.required"
				:disabled="field.immutable"
				:style="field.style"
				@change="$emit('input', $event.target.value)"
				@input="$emit('input', $event.target.value)"
			>
				<option :disabled="!field.allowNullOption" selected value>
					{{ field.allowNullOption ? '(None)' : '(Select One)' }}
				</option>
				<option
					v-for="option in field.constraint.values"
					:key="option[field.constraint.foreignKey]"
					:value="option[field.constraint.foreignKey]"
				>
					{{ option[field.constraint.foreignLabel] }}
				</option>
			</select>
			<input
				v-else-if="fieldType === 'number'"
				type="number"
				:value="value"
				:required="field.required"
				:disabled="field.immutable"
				:style="field.style"
				:min="field.min || 0"
				:max="field.max"
				:step="field.step"
				@input="$emit('input', $event.target.value)"
			/>
			<input
				v-else-if="fieldType === 'checkbox'"
				type="checkbox"
				:value="value"
				:checked="value"
				:required="field.required"
				:disabled="field.immutable"
				:style="field.style"
				@change="$emit('input', $event.target.checked)"
			/>
			<div v-else-if="fieldType === 'file'">
				<input
					v-if="value === null"
					type="file"
					:files="[value]"
					:accepted="field.acceptedTypes ? field.acceptedTypes.join(', ') : false"
					:required="field.required"
					:disabled="field.immutable"
					:style="field.style"
					@change="$emit('input', $event.target.files[0] || null)"
				/>
				<div v-else-if="isFile(value)">
					<span>
						{{ value.name }}
					</span>
					<br />
					<button type="button" class="button file-delete" @click="$emit('reset-value')">
						Delete
					</button>
				</div>
				<div v-else-if="duplicateId">
					<a :href="`${application.attachmentWebPath}${value}`">
						{{ value }}
					</a>
					<br />
					<button type="button" class="button file-delete" @click="$emit('reset-value')">
						Delete
					</button>
				</div>
				<div v-else>
					<a :href="`${application.attachmentWebPath}${value}`">
						{{ value }}
					</a>
					<br />
					<button type="button" class="button file-delete" @click="$emit('delete-file')">
						Delete
					</button>
				</div>
			</div>
			<input
				v-else-if="fieldType === 'text'"
				:type="fieldType"
				:value="value"
				:class="field.customClasses ? field.customClasses.join(' ') : ''"
				:placeholder="field.placeholder"
				:required="field.required"
				:disabled="field.immutable"
				:style="field.style"
				:minlength="field.minlength"
				:maxlength="field.maxlength"
				@input="$emit('input', $event.target.value)"
			/>
			<input
				v-else-if="fieldType === 'date'"
				type="date"
				placeholder="yyyy-mm-dd"
				:value="value"
				:class="field.customClasses ? field.customClasses.join(' ') : ''"
				:required="field.required"
				:disabled="field.immutable"
				:style="field.style"
				@input="$emit('input', $event.target.value)"
			/>
			<input
				v-else-if="fieldType === 'tel'"
				ref="telInput"
				type="tel"
				pattern="\([0-9]{3}\) [0-9]{3}-[0-9]{4}"
				:value="value"
				:class="field.customClasses ? field.customClasses.join(' ') : ''"
				:placeholder="field.placeholder"
				:required="field.required"
				:disabled="field.immutable"
				:style="field.style"
				@input="handlePhoneInput"
			/>
			<input
				v-else-if="fieldType === 'email'"
				type="email"
				pattern="[^@]+@[^@]+\.[A-Za-z]+"
				:value="value"
				:class="field.customClasses ? field.customClasses.join(' ') : ''"
				:placeholder="field.placeholder"
				:required="field.required"
				:disabled="field.immutable"
				:style="field.style"
				@input="$emit('input', $event.target.value)"
			/>
			<input
				v-else
				:type="fieldType"
				:value="value"
				:class="field.customClasses ? field.customClasses.join(' ') : ''"
				:placeholder="field.placeholder"
				:required="field.required"
				:disabled="field.immutable"
				:style="field.style"
				@input="$emit('input', $event.target.value)"
			/>
		</label>
		<div v-else-if="fieldType === 'radio'" class="radio-container">
			<h3 v-if="!isInsideFieldset">
				{{ fieldName }}
				<a v-if="field.helpMessageName" class="help-link" @click="$emit('show-help')">
					<HelpCircleIcon />
				</a>
				<em v-if="field.required" class="required-asterisk">*</em>
				<em v-if="field.caveat" class="is-small">
					({{ field.caveat }})
				</em>
			</h3>
			<h4 v-else>
				{{ fieldName }}
				<a v-if="field.helpMessageName" class="help-link" @click="$emit('show-help')">
					<HelpCircleIcon />
				</a>
				<em v-if="field.required" class="required-asterisk">*</em>
				<em v-if="field.caveat" class="is-small">
					({{ field.caveat }})
				</em>
			</h4>
			<label
				v-for="option in field.constraint.values"
				:key="option[field.constraint.foreignKey]"
			>
				<input
					type="radio"
					:name="fieldName"
					:class="field.customClasses ? field.customClasses.join(' ') : ''"
					:checked="value === option[field.constraint.foreignKey]"
					:value="option[field.constraint.foreignKey]"
					@change="$emit('input', $event.target.value)"
				/>
				<span>{{ option[field.constraint.foreignLabel] }}</span>
			</label>
		</div>
	</div>
</template>

<script>
	/* global caesCache */
	import Editor from '@tinymce/tinymce-vue';
	import FuzzySelect from '~/views/elements/FuzzySelect';
	import HelpCircleIcon from 'vue-feather-icons/icons/HelpCircleIcon';
	import { isFile } from '~/modules/utilities/validation';
	import { phoneInputMask } from '~/modules/utilities/input-masking';
	import {
		getPrettyColumnName,
		sqlToHtml,
		url
	} from '~/modules/utilities';

	export default {
		name: 'SmartInput',
		components: {
			Editor,
			FuzzySelect,
			HelpCircleIcon
		},
		props: {
			displayLabel: {
				type: Boolean,
				default: true
			},
			fetched: {
				type: Boolean,
				required: true,
				default: false
			},
			field: {
				type: Object,
				required: true
			},
			isInsideFieldset: {
				type: Boolean,
				default: false
			},
			value: {
				default: null,
				type: [
					File,
					FileList,
					Number,
					String,
					Boolean
				]
			}
		},
		data () {
			return {
				application: caesCache.application,
				dependentValue: null
			};
		},
		computed: {
			dependentColumnValue () {
				if (!this.field.depends || !this.field.depends.column) return null;

				return this.$store.state[this.$store.state.schema.title.toLowerCase()][this.field.depends.column];
			},
			fieldName () { return this.field.prettyName || getPrettyColumnName(this.field.columnName); },
			fieldType () { return this.field.inputType || sqlToHtml(this.field); },
			duplicateId () {
				return [
					'duplicateId',
					'duplicateID',
					'DUPLICATEID',
					'duplicateid',
					'DuplicateID',
					'DuplicateId',
					'DuPlIcAtEiD'
				].reduce((duplicateId, param) => {
					if (url.getParam(param) !== null) duplicateId = url.getParam(param);

					return duplicateId;
				}, false);
			},
		},
		watch: {
			dependentColumnValue () { this.updateDependentValue(); },
			dependentValue (newVal) { this.$emit('input', newVal); }
		},
		mounted () {
			if (this.field.defaultValue) this.setDefaultValue();
			this.updateDependentValue();
		},
		methods: {
			handlePhoneInput (e) {
				phoneInputMask(e);
				this.$emit('input', e.target.value);
			},
			isFile,
			setDefaultValue () {
				this.$emit('input', this.field.defaultValue);
			},
			async updateDependentValue () {
				if (!this.fetched && this.field.getDependentValue) this.dependentValue = await this.field.getDependentValue(this.$store);
			}
		}
	};
</script>

<style lang="scss" scoped>
	$red: #6c3129;
	input[type="text"].is-extra-wide { width: 28.5rem; }
	label {
		&.flex {
			display: flex;
			flex-direction: column;
		}
		legend h4 { margin: 0; }
	}
	label legend h4 { margin: 0; }
	input[type="number"] { width: auto; }
	button.file-delete {
		background-color: $red;
		font-size: .8em;
		padding: .5em;
	}
	h3, h4 {
		em.is-small { font-weight: normal; }
		em.required-asterisk { color: $red; }
	}
	div.radio-container {
		label:not(:last-of-type) { padding-right: 1rem; }
	}
</style>
