<template lang="html">
	<div class="fuzzy-select">
		<input v-model="inputText" type="text" />
		<div class="options">
			<span
				v-for="(option, index) in filteredOptions"
				:id="option.label"
				:key="option.key"
				:class="index === inputHandling.selectionIndex ? 'selected' : ''"
				@click="setValue(option)"
				@mouseover="setSelectionIndex(index)"
			>
				{{ option.label }}
			</span>
		</div>
	</div>
</template>

<script>
	import debounce from 'debounce';
	import Fuse from 'fuse.js';

	// Wait 250ms before handling input
	const DEBOUNCE_TIMEOUT = 250;

	// Object holding keycodes for arrow keys
	const KEY_CODES = {
		up: 38,
		down: 40,
		enter: 13
	};

	export default {
		name: 'FuzzySelect',
		props: {
			options: {
				type: Array,
				required: true
			},
			value: {
				default: null,
				type: [Boolean, Number, String]
			}
		},
		data () {
			const { options, value } = this;
			let selectedOptionLabel = '';
			options.forEach(({ key, label }) => {
				if (key === value) selectedOptionLabel = label;
			});

			return {
				fuseOptions: {
					includeMatches: true,
					includeScore: true,
					shouldSort: true,
					threshold: 0.45
				},
				filteredOptions: options,
				inputHandling: {
					selectionIndex: -1
				},
				inputText: selectedOptionLabel
			};
		},
		computed: {
			computedValue: {
				get () {
					return this.value;
				},
				set (val) {
					this.$emit('input', val);
				}
			},
			inputEl () {
				return this.$el.querySelector('input');
			},
			inputList () {
				return this.$el.querySelectorAll('div.options span');
			}
		},
		watch: {
			fuseOptions () { this.resetFuse(); },
			inputText () {
				this.debouncedHandleInput();
			},
			value () {
				if (this.value === null) this.inputText = '';
			}
		},
		beforeDestroy () {
			if ('fuse' in this) delete this.fuse;
		},
		created () {
			this.resetFuse();
			this.debouncedHandleInput = debounce(this.handleInput, DEBOUNCE_TIMEOUT);
		},
		mounted () {
			this.inputEl.onkeydown = e => {
				const { up, down, enter } = KEY_CODES;
				const { keyCode } = e;
				switch (keyCode) {
					case up:
						if (this.inputHandling.selectionIndex > -1) --this.inputHandling.selectionIndex;
						break;
					case down:
						if (this.inputHandling.selectionIndex < this.filteredOptions.length) ++this.inputHandling.selectionIndex;
						break;
					case enter:
						if (this.inputHandling.selectionIndex >= 0) this.setValue(this.filteredOptions[this.inputHandling.selectionIndex]);
						break;
					default:
						break;
				}
			};
		},
		methods: {
			handleInput () {
				const {
					fuse,
					inputText,
					options
				} = this;

				const matches = fuse
					.search(inputText)
					.map(({ refIndex }) => options[refIndex]);

				if (matches.length > 0) this.filteredOptions = [...matches];
				else this.filteredOptions = [...options];

				if (inputText.length > 0) this.computedValue = this.filteredOptions[0].key;
			},
			resetFuse () {
				if ('fuse' in this) delete this.fuse;
				const { fuseOptions, options } = this;
				this.fuse = new Fuse(options.map(({ label }) => label), fuseOptions);
			},
			setSelectionIndex (index) {
				this.inputHandling.selectionIndex = index;
			},
			setValue (option) {
				this.computedValue = option.key;
				this.unfocusInput();
				this.inputHandling.selectionIndex = -1;
				this.$emit('addCollaborator');
			},
			unfocusInput () {
				this.inputEl.blur();
				this.$el.focus();
			}
		}
	};
</script>

<style lang="scss" scoped>
	div.fuzzy-select {
		position: relative;
		width: 100%;
		input {
			width: 100%;
			margin-bottom: 0;
		}
		input + div.options {
			display: none;
		}
		input:focus + div.options {
			display: block;
		}
		div.options {
			position: absolute;
			z-index: 10;
			width: 100%;
			overflow: auto;
			max-height: 15rem;
			background: #fff;
			border: 1px solid #333;
			&:hover {
				display: block;
			}
			span {
				display: block;
				cursor: pointer;
				padding: .125rem .25rem;
				&.selected {
					background: #6666cc;
					color: #fff;
				}
				&:active {
					background: #fff;
					color: #000;
				}
			}
		}
	}
</style>
