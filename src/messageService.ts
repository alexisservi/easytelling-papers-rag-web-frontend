import { API_BASE_URL, MessageResponse } from './config';

export interface ChatMessage {
    text: string;
    isUser: boolean;
    timestamp: Date;
}

export class MessageService {
    private sessionId: string;
    private chatHistory: ChatMessage[] = [];

    constructor() {
        this.sessionId = this.generateSessionId();
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    addUserMessage(message: string): void {
        console.log('MessageService.addUserMessage called with:', message);
        this.addMessage(message, true);
        console.log('Message added to history. Current length:', this.chatHistory.length);
    }

    async sendMessageToAgent(message: string, userEmail: string, userToken: string): Promise<MessageResponse> {
        try {
            console.log('Sending request with session ID:', this.sessionId);
            const requestBody = {
                user_email: userEmail,
                session_id: this.sessionId,
                message_to_agent: message
            };
            console.log('Request body:', requestBody);

            const response = await fetch(`${API_BASE_URL}/message_to_agent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: MessageResponse = await response.json();
            console.log('API Response received:', data);

            // Update session ID from server response if provided
            if (data.session_id && data.session_id !== this.sessionId) {
                console.log('Updating session ID from server:', this.sessionId, '->', data.session_id);
                this.sessionId = data.session_id;
            }

            if (data.status === 'success') {
                console.log('Adding agent response to history:', data.message);
                // Add agent response to history
                this.addMessage(data.message, false);
                console.log('Agent message added. New history length:', this.chatHistory.length);
            } else {
                console.log('API response was not successful:', data);
            }

            return data;
        } catch (error) {
            console.error('Message error:', error);
            const errorResponse: MessageResponse = {
                status: 'fail',
                message: `Error communicating with agent: ${error instanceof Error ? error.message : 'Unknown error'}`,
                session_id: this.sessionId
            };

            // Add error message to history
            this.addMessage(errorResponse.message, false);

            return errorResponse;
        }
    }

    // Keep the old method for backward compatibility
    async sendMessage(message: string, userEmail: string, userToken: string): Promise<MessageResponse> {
        // Add user message to history immediately
        this.addMessage(message, true);
        return this.sendMessageToAgent(message, userEmail, userToken);
    }

    private addMessage(text: string, isUser: boolean): void {
        this.chatHistory.push({
            text,
            isUser,
            timestamp: new Date()
        });
    }

    getChatHistory(): ChatMessage[] {
        return [...this.chatHistory];
    }

    clearHistory(): void {
        this.chatHistory = [];
        this.sessionId = this.generateSessionId();
    }

    getSessionId(): string {
        return this.sessionId;
    }

    // Add method to update session ID (for debugging/testing)
    updateSessionId(newSessionId: string): void {
        console.log('Manually updating session ID:', this.sessionId, '->', newSessionId);
        this.sessionId = newSessionId;
    }

    async deleteSession(userEmail: string, userToken: string): Promise<{status: string, message: string}> {
        try {
            console.log('Deleting session:', this.sessionId);
            const requestBody = {
                user_email: userEmail,
                session_id: this.sessionId
            };

            const response = await fetch(`${API_BASE_URL}/delete_session`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Delete session response:', data);

            if (data.status === 'success') {
                // Generate new session ID (but keep chat history)
                this.sessionId = this.generateSessionId();
            }

            return data;
        } catch (error) {
            console.error('Delete session error:', error);
            return {
                status: 'fail',
                message: `Error deleting session: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}