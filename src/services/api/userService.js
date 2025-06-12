import usersData from '../mockData/users.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let users = [...usersData];

export const userService = {
  async getAll() {
    await delay(250);
    return [...users];
  },

  async getById(id) {
    await delay(200);
    const user = users.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    return { ...user };
  },

  async create(userData) {
    await delay(400);
    const newUser = {
      id: `user_${Date.now()}`,
      name: userData.name,
      avatar: userData.avatar,
      joinDate: new Date().toISOString(),
      postCount: 0,
      bio: userData.bio || ''
    };
    users.push(newUser);
    return { ...newUser };
  },

  async update(id, updates) {
    await delay(300);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    users[index] = { ...users[index], ...updates };
    return { ...users[index] };
  },

  async delete(id) {
    await delay(200);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    users.splice(index, 1);
    return { success: true };
  }
};