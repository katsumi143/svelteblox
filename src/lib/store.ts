import { get, writable } from 'svelte/store';

import { pinLocked } from './api/auth';
export const unlockPinModal = writable(false);
export const confirmPasswordModal = writable(false);
export const confirmPasswordResult = writable('');

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

export function confirmPassword() {
	confirmPasswordModal.set(true);
	return new Promise<string>(resolve => {
		const unsubscribe = confirmPasswordModal.subscribe(value => {
			if (!value) {
				unsubscribe();
				resolve(get(confirmPasswordResult));
			}
		});
	});
}