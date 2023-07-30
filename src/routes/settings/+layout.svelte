<script lang="ts">
	import { t } from '$lib/localisation';
	
	import SideNavigationItem from '$lib/components/SideNavigationItem.svelte';

	import Eye from '$lib/icons/Eye.svelte';
	import Display from '$lib/icons/Display.svelte';
	import GridFill from '$lib/icons/GridFill.svelte';
	import BrushFill from '$lib/icons/BrushFill.svelte';
	import PersonFill from '$lib/icons/PersonFill.svelte';
	import PeopleFill from '$lib/icons/PeopleFill.svelte';
	import BroadcastPin from '$lib/icons/BroadcastPin.svelte';
	import XDiamondFill from '$lib/icons/XDiamondFill.svelte';
	import CreditCardFill from '$lib/icons/CreditCardFill.svelte';
</script>

<div class="settings">
	<div class="navigation">
		<p>{$t('settings.account')}</p>
		<SideNavigationItem id="settings.account.account" path="/settings/account">
			<PersonFill/>
		</SideNavigationItem>
		<SideNavigationItem id="settings.account.privacy" path="https://www.roblox.com/my/account#!/privacy">
			<Eye/>
		</SideNavigationItem>

		<p>{$t('settings.access')}</p>
		<SideNavigationItem id="settings.access.billing" path="https://www.roblox.com/my/account#!/billing">
			<CreditCardFill/>
		</SideNavigationItem>
		<SideNavigationItem id="settings.access.parental" path="/settings/access/parental">
			<PeopleFill/>
		</SideNavigationItem>
		<SideNavigationItem id="settings.access.sessions" path="/settings/access/sessions">
			<BroadcastPin/>
		</SideNavigationItem>

		<p>{$t('settings.integrations')}</p>
		<SideNavigationItem id="settings.integrations.apps" path="/settings/integrations/applications">
			<GridFill/>
		</SideNavigationItem>

		<p>{$t('settings.website')}</p>
		<SideNavigationItem id="settings.website.appearance" path="/settings/appearance">
			<BrushFill/>
		</SideNavigationItem>

		<p>{$t('settings.advanced')}</p>
		<SideNavigationItem id="settings.advanced.beta" path="/settings/advanced/beta">
			<XDiamondFill/>
		</SideNavigationItem>
		<SideNavigationItem id="settings.advanced.client" path="/settings/advanced/client">
			<Display/>
		</SideNavigationItem>
	</div>
	<slot/>
</div>

<style lang="scss">
	.settings {
		display: flex;
		min-height: 100%;
		.navigation {
			width: 25%;
			margin: 16px 0 16px 16px;
			display: flex;
			min-width: 25%;
			flex-direction: column;
			p {
				color: var(--color-secondary);
				margin: 32px 16px 8px;
				font-size: .8em;
			}
		}
		:global(.input-label) {
			color: var(--color-secondary);
			margin: 32px 0 8px;
			font-size: .9em;
		}
		:global(.input-summary) {
			color: var(--color-tertiary);
			margin: 0 0 16px;
			font-size: .75em;
			white-space: pre;
			line-height: 1.5;
		}
		:global(.input-row) {
			gap: 16px;
			display: flex;
		}
	}
</style>