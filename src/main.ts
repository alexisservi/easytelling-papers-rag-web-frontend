import { AuthService } from './authService';
import { MessageService, ChatMessage } from './messageService';
import { UserService } from './userService';
import { marked } from 'marked';

class ChatApp {
    private authService: AuthService;
    private messageService: MessageService;
    private userService: UserService;
    private addUserModal: any;

    constructor() {
        this.authService = new AuthService();
        this.messageService = new MessageService();
        this.userService = new UserService();
        this.init();
    }

    private init(): void {
        this.setupEventListeners();
        this.initializeBootstrapModals();

        // Try to restore session
        if (this.authService.restoreSession()) {
            this.showChatPage();
        } else {
            this.showLoginPage();
        }
    }

    private initializeBootstrapModals(): void {
        const modalElement = document.getElementById('addUserModal');
        if (modalElement && (window as any).bootstrap) {
            this.addUserModal = new (window as any).bootstrap.Modal(modalElement);
        }
    }

    private setupEventListeners(): void {
        // Login form
        const loginForm = document.getElementById('loginForm') as HTMLFormElement;
        loginForm?.addEventListener('submit', (e) => this.handleLogin(e));

        // Chat functionality
        const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
        const messageInput = document.getElementById('messageInput') as HTMLInputElement;

        sendBtn?.addEventListener('click', () => this.handleSendMessage());
        messageInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSendMessage();
            }
        });

        // Navigation
        const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement;
        logoutBtn?.addEventListener('click', () => this.handleLogout());

        const addUserBtn = document.getElementById('addUserBtn') as HTMLButtonElement;
        addUserBtn?.addEventListener('click', () => this.showAddUserModal());

        // Add user form
        const confirmAddUserBtn = document.getElementById('confirmAddUser') as HTMLButtonElement;
        confirmAddUserBtn?.addEventListener('click', () => this.handleAddUser());
    }

    private async handleLogin(e: Event): Promise<void> {
        e.preventDefault();

        const emailInput = document.getElementById('userEmail') as HTMLInputElement;
        const errorDiv = document.getElementById('loginError') as HTMLDivElement;
        const loginBtn = (e.target as HTMLFormElement).querySelector('button[type="submit"]') as HTMLButtonElement;

        const email = emailInput.value.trim();
        if (!email) {
            this.showError(errorDiv, 'Please enter an email address');
            return;
        }

        this.hideError(errorDiv);

        // Show loading state
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';

        try {
            const response = await this.authService.login(email);

            if (response.status === 'success') {
                this.showChatPage();
            } else {
                this.showError(errorDiv, response.message);
            }
        } catch (error) {
            this.showError(errorDiv, 'Login failed. Please try again.');
        } finally {
            // Reset button state
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    }

    private async handleSendMessage(): Promise<void> {
        const messageInput = document.getElementById('messageInput') as HTMLInputElement;
        const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;

        const message = messageInput.value.trim();
        if (!message) return;

        // Clear input and disable send button
        messageInput.value = '';
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';

        // Add user message to chat immediately
        console.log('Adding user message:', message);
        this.messageService.addUserMessage(message);
        console.log('Chat history after adding:', this.messageService.getChatHistory());
        this.updateChatDisplay();
        console.log('Chat display updated');

        try {
            const userEmail = this.authService.getUserEmail();
            const userToken = this.authService.getToken();

            if (!userEmail || !userToken) {
                throw new Error('Authentication required');
            }

            console.log('Sending message to agent...');
            const response = await this.messageService.sendMessageToAgent(message, userEmail, userToken);
            console.log('Agent response processing complete:', response);
            this.updateChatDisplay();
            console.log('Chat display updated after agent response');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send';
            messageInput.focus();
        }
    }

    private handleLogout(): void {
        this.authService.logout();
        this.messageService.clearHistory();
        this.showLoginPage();
    }

    private showAddUserModal(): void {
        // Clear previous form data and messages
        const form = document.getElementById('addUserForm') as HTMLFormElement;
        form?.reset();

        const errorDiv = document.getElementById('addUserError') as HTMLDivElement;
        const successDiv = document.getElementById('addUserSuccess') as HTMLDivElement;
        this.hideError(errorDiv);
        this.hideError(successDiv);

        this.addUserModal?.show();
    }

    private async handleAddUser(): Promise<void> {
        const newUserEmailInput = document.getElementById('newUserEmail') as HTMLInputElement;
        const isAdminCheckbox = document.getElementById('newUserIsAdmin') as HTMLInputElement;
        const errorDiv = document.getElementById('addUserError') as HTMLDivElement;
        const successDiv = document.getElementById('addUserSuccess') as HTMLDivElement;
        const confirmBtn = document.getElementById('confirmAddUser') as HTMLButtonElement;

        const newUserEmail = newUserEmailInput.value.trim();
        const isAdmin = isAdminCheckbox.checked;

        if (!newUserEmail) {
            this.showError(errorDiv, 'Please enter an email address');
            return;
        }

        this.hideError(errorDiv);
        this.hideError(successDiv);

        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Adding...';

        try {
            const currentUserEmail = this.authService.getUserEmail();
            const userToken = this.authService.getToken();

            if (!currentUserEmail || !userToken) {
                throw new Error('Authentication required');
            }

            const response = await this.userService.addUser(
                currentUserEmail,
                newUserEmail,
                isAdmin,
                userToken
            );

            if (response.status === 'success') {
                this.showSuccess(successDiv, response.message);
                // Clear form
                (document.getElementById('addUserForm') as HTMLFormElement)?.reset();

                // Close modal after 2 seconds
                setTimeout(() => {
                    this.addUserModal?.hide();
                }, 2000);
            } else {
                this.showError(errorDiv, response.message);
            }
        } catch (error) {
            this.showError(errorDiv, 'Failed to add user. Please try again.');
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Add User';
        }
    }

    private showLoginPage(): void {
        document.getElementById('loginPage')?.classList.remove('hidden');
        document.getElementById('chatPage')?.classList.add('hidden');

        // Clear login form
        const loginForm = document.getElementById('loginForm') as HTMLFormElement;
        loginForm?.reset();

        const errorDiv = document.getElementById('loginError') as HTMLDivElement;
        this.hideError(errorDiv);
    }

    private showChatPage(): void {
        document.getElementById('loginPage')?.classList.add('hidden');
        document.getElementById('chatPage')?.classList.remove('hidden');

        // Update user info
        const userInfo = document.getElementById('userInfo') as HTMLSpanElement;
        if (userInfo) {
            userInfo.textContent = `Logged in as: ${this.authService.getUserEmail()}`;
        }

        // Show/hide admin button
        const addUserBtn = document.getElementById('addUserBtn') as HTMLButtonElement;
        if (addUserBtn) {
            if (this.authService.getIsAdmin()) {
                addUserBtn.classList.remove('hidden');
            } else {
                addUserBtn.classList.add('hidden');
            }
        }

        // Update chat display
        this.updateChatDisplay();

        // Focus on message input
        const messageInput = document.getElementById('messageInput') as HTMLInputElement;
        messageInput?.focus();
    }

    private updateChatDisplay(): void {
        console.log('updateChatDisplay called');
        const chatContainer = document.getElementById('chatContainer') as HTMLDivElement;
        if (!chatContainer) {
            console.log('Chat container not found!');
            return;
        }

        const history = this.messageService.getChatHistory();
        console.log('Chat history for display:', history);
        console.log('Chat history length:', history.length);

        if (history.length === 0) {
            console.log('No messages in history, showing welcome message');
            chatContainer.innerHTML = `
                <div class="text-center text-muted">
                    <p>Welcome! Ask me anything about research papers.</p>
                </div>
            `;
            return;
        }

        console.log('Generating HTML for', history.length, 'messages');
        const messagesHtml = history.map(msg => this.createMessageElement(msg)).join('');
        console.log('Generated messages HTML:', messagesHtml);
        chatContainer.innerHTML = messagesHtml;
        console.log('Chat container updated with new HTML');

        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
        console.log('Scrolled to bottom');
    }

    private createMessageElement(message: ChatMessage): string {
        console.log('Creating message element for:', message);
        const messageClass = message.isUser ? 'user' : 'agent';
        const timeString = message.timestamp.toLocaleTimeString();

        // For user messages, escape HTML. For agent messages, render markdown
        let messageContent: string;
        if (message.isUser) {
            messageContent = `<p class="mb-1">${this.escapeHtml(message.text)}</p>`;
            console.log('Created user message content:', messageContent);
        } else {
            console.log('Rendering agent message with marked. Text:', message.text);
            console.log('Marked function available:', typeof marked);
            const markedContent = marked(message.text);
            console.log('Marked rendered content:', markedContent);
            messageContent = `<div class="mb-1">${markedContent}</div>`;
            console.log('Created agent message content:', messageContent);
        }

        const finalElement = `
            <div class="message ${messageClass}">
                <div class="message-content">
                    ${messageContent}
                    <small class="text-muted">${timeString}</small>
                </div>
            </div>
        `;
        console.log('Final message element:', finalElement);
        return finalElement;
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    private showError(element: HTMLElement, message: string): void {
        element.textContent = message;
        element.classList.remove('hidden');
    }

    private showSuccess(element: HTMLElement, message: string): void {
        element.textContent = message;
        element.classList.remove('hidden');
    }

    private hideError(element: HTMLElement): void {
        element.classList.add('hidden');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});