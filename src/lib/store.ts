import { get, writable } from 'svelte/store';

import { pinLocked } from './api/auth';
export const unlockPinModal = writable(false);

export function promptPinUnlock() {
	unlockPinModal.set(true);

	return new Promise<boolean>(resolve => {
		const unsubscribe = unlockPinModal.subscribe(value => {
			if (!value) {
				unsubscribe();
				resolve(!get(pinLocked));
			}
		});
	});
}