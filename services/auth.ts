import { User } from '../types';

const USERS_STORAGE_KEY = 'shinyTrackerUsers';
const CURRENT_USER_KEY = 'shinyTrackerUser';

// Simulation of a backend database
const getUsers = (): User[] => {
    try {
        const users = localStorage.getItem(USERS_STORAGE_KEY);
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error('Failed to parse users from localStorage', error);
        return [];
    }
};

const saveUsers = (users: User[]) => {
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
        console.error('Failed to save users to localStorage', error);
    }
};

export const authService = {
    register: (email: string, username: string, password: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            // Simulate network delay
            setTimeout(() => {
                const users = getUsers();

                // Check for duplicates
                if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                    reject(new Error('Email already registered'));
                    return;
                }
                if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                    reject(new Error('Username already taken'));
                    return;
                }

                // Simple hash simulation (NOT SECURE in real apps, strictly for this local simulation)
                // In a real app, never store passwords, even hashed, in localStorage if possible,
                // and definitely use a proper hashing library like bcrypt on the backend.
                const passwordHash = btoa(password);

                const newUser: User = { username, email, passwordHash };
                users.push(newUser);
                saveUsers(users);

                // Auto-login after register
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
                resolve(newUser);
            }, 500);
        });
    },

    login: (identifier: string, password: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = getUsers();
                const user = users.find(u =>
                    (u.email.toLowerCase() === identifier.toLowerCase() ||
                        u.username.toLowerCase() === identifier.toLowerCase()) &&
                    u.passwordHash === btoa(password)
                );

                if (user) {
                    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
                    resolve(user);
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 500);
        });
    },

    logout: () => {
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    getCurrentUser: (): User | null => {
        try {
            const user = localStorage.getItem(CURRENT_USER_KEY);
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    }
};
