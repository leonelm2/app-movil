import { Platform } from 'react-native';

const LOCAL_URL = 'http://localhost:4000';
const ANDROID_URL = 'http://10.0.2.2:4000';

const BASE_URL = Platform.OS === 'android' ? ANDROID_URL : LOCAL_URL;

export const API_URL = `${BASE_URL}/api`;

export async function apiRequest(path, options = {}) {
	const response = await fetch(`${API_URL}${path}`, {
		headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
		...options
	});

	const text = await response.text();
	let data = {};
	if (text) {
		try {
			data = JSON.parse(text);
		} catch (error) {
			data = {};
		}
	}

	if (!response.ok) {
		throw new Error(data.message || 'Error del servidor');
	}
	return data;
}
