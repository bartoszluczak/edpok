<script>
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { webVitals } from '$lib/vitals';
	import Header from './Header.svelte';
	import './styles.css';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';

	inject({ mode: dev ? 'development' : 'production' });

	/** @type {import('./$types').LayoutServerData} */
	export let data;

	$: if (browser && data?.analyticsId) {
		webVitals({
			path: $page.url.pathname,
			params: $page.params,
			analyticsId: data.analyticsId
		});
	}
</script>

<div class="app">
	<div class="gradient" />
	<Header />

	<main>
		<slot />
	</main>

	<footer>
		<p>Created and copyright by Bartosz Łuczak | {new Date().getFullYear()}</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	.gradient {
		width: 100%;
		height: 180%;
		display: flex;
		background: rgb(76, 76, 114);
		background: radial-gradient(circle, rgba(76, 76, 114, 1) 5%, rgba(76, 76, 114, 0) 65%);
		position: absolute;
		z-index: -23;
		top: -101%;
		opacity: 0.5;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 0.5rem;
	}

	footer a {
		font-weight: bold;
	}

	footer p {
		font-size: 0.75rem;
		padding: 0;
		margin: 0;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
