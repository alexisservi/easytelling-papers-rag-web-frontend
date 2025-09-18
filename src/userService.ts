import { API_BASE_URL, AddUserResponse } from './config';

export class UserService {
    async addUser(
        currentUserEmail: string,
        newUserEmail: string,
        isAdmin: boolean,
        userToken: string
    ): Promise<AddUserResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/add_user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    user_email: currentUserEmail,
                    new_user_email: newUserEmail,
                    is_admin: isAdmin
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: AddUserResponse = await response.json();
            return data;
        } catch (error) {
            console.error('Add user error:', error);
            return {
                status: 'fail',
                message: `Error adding user: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}