export const API_BASE_URL = 'https://papers-rag-web-backend-1031636165462.us-central1.run.app';

export interface LoginResponse {
    status: 'success' | 'fail';
    message: string;
    user_token: string | null;
    is_admin: boolean | null;
}

export interface MessageResponse {
    status: 'success' | 'fail';
    message: string;
    session_id: string;
}

export interface AddUserResponse {
    status: 'success' | 'fail';
    message: string;
}