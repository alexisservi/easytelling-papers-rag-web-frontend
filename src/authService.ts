import { API_BASE_URL, LoginResponse } from './config';

export class AuthService {
    private userToken: string | null = null;
    private userEmail: string | null = null;
    private isAdmin: boolean = false;

    async login(email: string): Promise<LoginResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_email: email
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: LoginResponse = await response.json();

            if (data.status === 'success' && data.user_token) {
                this.userToken = data.user_token;
                this.userEmail = email;
                this.isAdmin = data.is_admin || false;

                // Store in localStorage for persistence
                localStorage.setItem('userToken', this.userToken);
                localStorage.setItem('userEmail', this.userEmail);
                localStorage.setItem('isAdmin', this.isAdmin.toString());
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            return {
                status: 'fail',
                message: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                user_token: null,
                is_admin: null
            };
        }
    }

    logout(): void {
        this.userToken = null;
        this.userEmail = null;
        this.isAdmin = false;

        // Clear localStorage
        localStorage.removeItem('userToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('isAdmin');
    }

    restoreSession(): boolean {
        const token = localStorage.getItem('userToken');
        const email = localStorage.getItem('userEmail');
        const isAdmin = localStorage.getItem('isAdmin');

        if (token && email) {
            this.userToken = token;
            this.userEmail = email;
            this.isAdmin = isAdmin === 'true';
            return true;
        }

        return false;
    }

    getToken(): string | null {
        return this.userToken;
    }

    getUserEmail(): string | null {
        return this.userEmail;
    }

    getIsAdmin(): boolean {
        return this.isAdmin;
    }

    isLoggedIn(): boolean {
        return this.userToken !== null;
    }
}