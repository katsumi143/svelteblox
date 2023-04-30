import { request, fullRequest } from '.';
export const CAPTCHA_KEYS = await request<{
	captchaVersion: '',
	funCaptchaPublicKeys: {
		ACTION_TYPE_WEB_LOGIN: string,
		ACTION_TYPE_GROUP_JOIN: string,
		ACTION_TYPE_WEB_SIGNUP: string,
		ACTION_TYPE_FOLLOW_USER: string,
		ACTION_TYPE_ASSET_COMMENT: string,
		ACTION_TYPE_GROUP_WALL_POST: string,
		ACTION_TYPE_SUPPORT_REQUEST: string,
		ACTION_TYPE_GENERIC_CHALLENGE: string,
		ACTION_TYPE_WEB_RESET_PASSWORD: string,
		ACTION_TYPE_CLOTHING_ASSET_UPLOAD: string,
		ACTION_TYPE_WEB_GAMECARD_REDEMPTION: string
	},
	disableCaptchaVersionExperiment: boolean
}>('https://apis.rbxcdn.com/captcha/v1/metadata')
	.then(data => data.funCaptchaPublicKeys);

(window as any).XMLHttpRequest = class haha {
	public status = 200;
	public readyState: number = 0
	public responseText = ''
	private url: string = ''
	private method: string = ''
	private headers: Record<string, string> = {}
	public open(method: string, url: string) {
		console.log(method, url.replace('funcaptcha.com', 'client-api.arkoselabs.com'));
		this.url = url.replace('funcaptcha.com', 'client-api.arkoselabs.com');
		this.method = method;
		this.readyState = 1;
		(this as any).onreadystatechange?.();
	}

	public send(body: string) {
		console.log('sending request');
		fullRequest(this.url, this.method as any, body.replace(/site=.*?&/g, 'site=https%3A%2F%2Fwww.roblox.com&'), this.headers, {}).then(response => {
			const data = response.data;
			console.log(response);
			console.log(this);
			this.status = response.status;
			this.readyState = 4;
			this.responseText = data as any;
			(this as any).onreadystatechange?.();
			(this as any).onload?.(data);
		});
	}

	public abort() {
		console.log('abort');
	}

	public getAllResponseHeaders() {
		console.log('getAllResponseHeaders');
	}

	public getResponseHeader() {
		console.log('getResponseHeader');
	}

	public overrideMimeType() {
		console.log('overrideMimeType');
	}

	public setRequestHeader(name: string, value: string) {
		console.log(name, value);
		this.headers[name.toLowerCase()] = value;
	}
}

export function startCaptcha(publicKey: string) {
	const started = Date.now();
	console.log('starting captcha', publicKey);
	new (globalThis as any).FunCaptcha({
		language: 'en',
		public_key: publicKey,
		target_html: 'captcha',
		data: { blob: 'F1TfM7Gm9LU/nNQS.CR6c3agE3ZZZ7pjArt8jX1YneEC7/4k0SeNWxovlzThPrFxW/3wtg0kfRMxjAYEydoFAtAl0fuc4URoXgqLVYHffG6j9MnDv9Yjbv2fNScKv8+IOoFv2Tmjlsra5RF24pAE4HUoVvH6zUtnS17xy1jSIdU/0LiZkmgqH+xGuLgTkQjxyXGK4ZxWuNqzI9ORdVNLgvo1qzbY21hie2yI5y7++qOqmoV9wMRac8ZHDZGvXDlngq+jj5EUDkg31YJAQatqUb5+O+pFyyA8vcZadTOf/6Fj69jvd29Sm4LPrJuK9cDqwLXHW8Srg8uIVih63QbdgHdZMyoO2Hf1DJ/4SZkpUTIDfCIJ/d4mOy55dJ9cAdfD7kMfbn+A5RNrf/OReGs+k05mzwgiyopZjumaFH0YKAJv4WtdlZPxvAn/RKMQbpUcse8F5i+l6TwaF57QlQLJOB8KyAwIb7kNcqYFHh7MrRmMaF0ABfaUsDQqrnNGGy5i59bSYQC8lt3zrEpCxywQSpNq0W2o4avcsRNwMzP5EcCzldwVWDbekX3tr5YRw9K9kl1XF4d87iJrEnJSdFSO//BXB' },
		callback() {
			console.log('callback!');
			const userSolveFunCaptchaTime = Date.now() - started;

			const token = (document.getElementById('FunCaptcha-Token') as any).value;
			console.log(token);
			//logger.logCaptchaTokenReceivedEventToEventStream(fcParams.cType, token, unifiedCaptchaId);

			/*if (fcParams.returnTokenInSuccessCb === true) {
				logger.logSuccess(fcParams.cType);
				logger.logCaptchaEventToEventStream(
					fcParams.cType,
					userSolveFunCaptchaTime,
					true,
					token
				);
				fcParams.successCb(token, unifiedCaptchaId);
			} else {
				console.log('verify with server');
				//verifyWithServer(fcParams, elemId, token, userSolveFunCaptchaTime, unifiedCaptchaId);
			}*/
		},
		loaded_callback() {
			console.log('captcha callback loaded');
		},
		onsuppress() {
			console.log('captcha suppressed');
		},
		onshown() {
			console.log('captcha shown');
		}
	});
}