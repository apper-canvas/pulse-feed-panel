import postsData from '../mockData/posts.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let posts = [...postsData];

export const postService = {
  async getAll() {
    await delay(300);
    return [...posts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getById(id) {
    await delay(200);
    const post = posts.find(p => p.id === id);
    if (!post) {
      throw new Error('Post not found');
    }
    return { ...post };
  },

  async getByAuthor(authorId) {
    await delay(250);
    return posts.filter(p => p.authorId === authorId)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async search(query) {
    await delay(400);
    const searchTerm = query.toLowerCase();
    return posts.filter(post => 
      post.content.toLowerCase().includes(searchTerm) ||
      post.authorName.toLowerCase().includes(searchTerm)
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
},

  async create(postData) {
    await delay(500);
    const newPost = {
      id: `post_${Date.now()}`,
      content: postData.content,
      images: postData.images || [],
      authorId: postData.authorId,
      authorName: postData.authorName,
      authorAvatar: postData.authorAvatar,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      reactions: {},
      isLiked: false
    };
    posts.unshift(newPost);
    return { ...newPost };
  },

  async toggleLike(id, isLiked) {
    await delay(200);
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Post not found');
    }
    
    const currentLikes = posts[index].likes || 0;
    const newLikes = isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
    
    posts[index] = { 
      ...posts[index], 
      likes: newLikes,
      isLiked: isLiked
};
    return { ...posts[index] };
  },

  async update(id, updates) {
    await delay(200);
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Post not found');
    }
    posts[index] = { ...posts[index], ...updates };
    return { ...posts[index] };
  },

  async delete(id) {
    await delay(200);
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Post not found');
    }
    posts.splice(index, 1);
    return { success: true };
  }
};