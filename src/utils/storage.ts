export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
}

const STORAGE_KEYS = {
  USERS: "users",
  IS_LOGGED_IN: "isLoggedIn",
  CURRENT_USER: "currentUser",
} as const;

// Users management
export const getUsers = (): User[] => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const saveUser = (user: Omit<User, "id">): void => {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: Date.now().toString(),
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const findUserByEmail = (email: string): User | undefined => {
  const users = getUsers();
  return users.find((user) => user.email === email);
};

// Session management
export const isLoggedIn = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === "true";
};

export const setLoggedIn = (value: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, value.toString());
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const logout = (): void => {
  setLoggedIn(false);
  setCurrentUser(null);
};
