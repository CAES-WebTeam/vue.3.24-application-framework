<template lang="html">
	<div v-if="messageName" class="modal-container" @click="closeModal">
		<div class="modal">
			<span class="close">
				<div @click="closeModal">
					<XIcon />
				</div>
			</span>
			<transition appear name="fade">
				<Spinner v-if="helpMessageHTML.length < 1" />
				<div v-else class="help-message" v-html="helpMessageHTML"></div>
			</transition>
		</div>
	</div>
</template>

<script>
	import Spinner from 'vue-simple-spinner';
	import XIcon from 'vue-feather-icons/icons/XIcon';
	import { logError } from '~/modules/caesdb';

	export default {
		name: 'ContextualHelpMessage',
		components: {
			Spinner,
			XIcon
		},
		props: {
			messageFetcher: {
				type: Function,
				required: true
			},
			messageName: {
				type: String,
				required: true
			}
		},
		data () {
			return {
				cssSelectorsForClosingModal: [
					'div.modal-container',
					'span.close div',
					'svg.feather',
					'line'
				],
				helpMessageHTML: ''
			};
		},
		async mounted () {
			try {
				const data = await this.messageFetcher(this.messageName);
				if (data.length < 1) this.$emit('close-model');
				this.helpMessageHTML = data.trim();
			} catch (err) {
				this.$emit('close-modal');
			}
		},
		methods: {
			closeModal (event) {
				const modalShouldBeClosed = this.cssSelectorsForClosingModal.reduce((modalShouldBeClosed, selector) => {
					if (event.target.matches(selector)) modalShouldBeClosed = true;

					return modalShouldBeClosed;
				}, false);
				if (modalShouldBeClosed) this.$emit('close-modal');
			}
		}
	};
</script>

<style lang="scss" scoped>
	div.modal-container {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 999;
		width: 100vw;
		height: 100vh;
		background: rgba(0,0,0,.15);
		padding-top: 1rem;
		overflow: auto;
		display: flex;
		flex-direction: column;
		justify-content: center;
		div.modal {
			background: #fff;
			max-width: 960px;
			margin: 0 auto;
			padding: 1rem;
			box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
			display: inline-block;
			border-radius: .375rem;
			text-align: left;
			max-height: 75vh;
			overflow: auto;
			span.close {
				display: block;
				text-align: right;
				float: right;
				div {
					padding: .5rem;
					svg {
						cursor: pointer;
					}
				}
			}
		}
	}
</style>
