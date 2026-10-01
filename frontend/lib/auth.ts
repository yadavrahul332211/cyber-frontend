const KEY = "cyber_token";

export async function login(email: string, password: string): Promise<boolean> {
    // TODO: replace with the real backend login API
    if (!email || !password) return false;
    localStorage.setItem(KEY, "mock-token");
    return true;
}

export function logout() {
    localStorage.removeItem(KEY);
}

export function isLoggedIn(): boolean {
    return typeof window !== "undefined" && !!localStorage.getItem(KEY);
}