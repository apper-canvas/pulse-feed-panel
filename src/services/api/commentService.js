import commentsData from '../mockData/comments.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let comments = [...commentsData];

export const commentService = {
  async getAll() {
    await delay(250);
    return [...comments].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getById(id) {
    await delay(200);
    const comment = comments.find(c => c.id === id);
    if (!comment) {
      throw new Error('Comment not found');
    }
    return { ...comment };
  },

  async getByPostId(postId) {
    await delay(300);
    return comments.filter(c => c.postId === postId)
                  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  async create(commentData) {
    await delay(400);
    const newComment = {
      id: `comment_${Date.now()}`,
      postId: commentData.postId,
      content: commentData.content,
      authorId: commentData.authorId,
      authorName: commentData.authorName,
      authorAvatar: commentData.authorAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      timestamp: new Date().toISOString(),
      parentId: commentData.parentId || null
    };
    comments.push(newComment);
    return { ...newComment };
  },

  async update(id, updates) {
    await delay(250);
    const index = comments.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Comment not found');
    }
    comments[index] = { ...comments[index], ...updates };
    return { ...comments[index] };
  },

  async delete(id) {
    await delay(200);
    const index = comments.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Comment not found');
    }
    
    // Also delete replies to this comment
    const repliesToDelete = comments.filter(c => c.parentId === id);
    repliesToDelete.forEach(reply => {
      const replyIndex = comments.findIndex(c => c.id === reply.id);
      if (replyIndex !== -1) {
        comments.splice(replyIndex, 1);
      }
    });
    
    comments.splice(index, 1);
    return { success: true };
  }
};