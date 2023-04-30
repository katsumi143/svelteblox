import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
export const ssr = false;
export const load = (({ url }) => {
	if ((globalThis as any).__ROSVELTE_VERSION__ !== '1.0.0' && url.pathname !== '/update')
		throw redirect(305, '/update');
}) satisfies LayoutLoad;