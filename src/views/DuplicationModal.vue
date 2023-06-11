<template lang="html">
	<div class="modal" @click="closeModal">
		<div class="container">
			<span class="close">
				<XIcon @click="cancelDuplication" />
			</span>
			<h2>
				{{ duplicationSchema.title }}
			</h2>
			<div>
				<p class="instruction">
					{{ duplicationSchema.instruction }}
				</p>
				<div class="content-wrapper">
					<ul class="section-list">
						<li v-for="(section, title) in duplicationSchema.sections" :key="title">
							<label>
								<input v-model="section.duplicate" type="checkbox" :disabled="!dependenciesMet(section)" />
								<span :class="!dependenciesMet(section) ? 'disabled' : ''">
									{{ title }}
								</span>
							</label>
						</li>
					</ul>
					<div class="custom-content">
						<slot name="custom-content">
						<!--
							By defualt there's no content here, however custom content can be
							added when this component is included in another component.
						-->
						</slot>
					</div>
				</div>
			</div>
			<div class="button-container">
				<button type="button" @click="processDuplicationOptions">
					Go
				</button>
			</div>
		</div>
	</div>
</template>

<script>
	/* global swal */
	import { url } from '~/modules/utilities';
	import XIcon from 'vue-feather-icons/icons/XIcon';

	export default {
		name: 'DuplicationModal',
		components: { XIcon },
		props: {
			duplicationSchema: {
				type: Object,
				required: true
			}
		},
		data () {
			return { ...this.duplicationSchema };
		},
		computed: {
			duplication: {
				get () {
					return this.$store.state.duplication;
				},
				set (val) {
					this.$store.state.duplication = val;
				}
			},
			totalDuplicates () {
				let count = 0;
				for (const key in this.sections) if (this.sections[key].duplicate) ++count;

				return count;
			}
		},
		watch: {
			totalDuplicates () {
				for (const key in this.sections) {
					const section = this.sections[key];
					if (!this.dependenciesMet(section)) section.duplicate = false;
				}
			}
		},
		methods: {
			cancelDuplication () {
				this.duplication.ready = true;
			},
			closeModal (event) {
				if (event.target.matches('div.modal')) this.cancelDuplication();
			},
			dependenciesMet (section) {
				if (!section.depends) return true;
				let dependenciesMet = true;
				section.depends.forEach(dependency => {
					if (!this.sections[dependency].duplicate) dependenciesMet = false;
				});

				return dependenciesMet;
			},
			processDuplicationOptions () {
				for (const key in this.sections) {
					const section = this.sections[key];
					if (section.duplicate) {
						if (section.areas.columns && section.areas.columns.length > 0) section.areas.columns.forEach(column => {
							this.duplication.columns[column] = true;
						});

						if (section.areas.associations && section.areas.associations.length > 0) section.areas.associations.forEach(association => {
							this.duplication.associations[association] = true;
						});

						if (section.areas.subschemas && section.areas.subschemas.length > 0) section.areas.subschemas.forEach(subschema => {
							this.duplication.subschemas[subschema] = true;
						});
					}
				}
				this.duplication.ready = true;
				this.duplication.reportID = url.getParam('duplicateID');
				swal(
					'Yippee!',
					'Data from your old report has been imported successfully!',
					'success'
				);
			}
		}
	};
</script>

<style lang="scss" scoped>
	div.modal {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 999;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.15);
		padding-top: 1rem;
		overflow: auto;
		text-align: center;

		span.close {
			display: block;
			text-align: right;

			svg { cursor: pointer; }
		}

		div.container {
			background: #fff;
			max-width: 720px;
			margin: 0 auto;
			padding: 1rem;
			box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);
			text-align: center;
			display: inline-block;
			border-radius: 0.375rem;

			p.instruction,
			div.content-wrapper { padding: 0 2rem; }

			p.instruction { text-align: left; }

			div.content-wrapper {
				display: flex;
				justify-content: center;

				ul.section-list {
					flex-grow: 1;
					list-style-type: none;
					padding: 0 0.5rem;
					display: inline-block;
					column-count: 2;
					column-width: 14rem;

					li {
						margin-bottom: 0.75rem;
						break-inside: avoid;

						label {
							display: flex;

							span {
								display: flex;
								flex-direction: column;
								justify-content: center;

								&.disabled {
									color: #999;
								}
							}
						}
					}
				}

				div.custom-content { text-align: left; }
			}

			div.button-container { text-align: center; }
		}
	}
</style>
