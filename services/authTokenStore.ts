type GetTokenFn = () => Promise<string | null>;

let _getToken: GetTokenFn | null = null;

export function setGetTokenFn(fn: GetTokenFn) {
    _getToken = fn;
}

export function clearGetTokenFn() {
    _getToken = null;
}

export async function getAuthToken(): Promise<string> {
    if (!_getToken) {
        throw new Error('Auth token provider not initialized');
    }
    const token = await _getToken();
    if (!token) {
        throw new Error('No authentication token available');
    }
    return token;
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await getAuthToken();

    const response = await fetch(`/api/${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            window.dispatchEvent(new CustomEvent('session-expired'));
            throw new Error('Session expired');
        }

        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `API request failed: ${response.status}`);
    }

    return response.json();
}
