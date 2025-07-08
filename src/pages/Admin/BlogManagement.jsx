import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../../lib/supabase';
import { AuthContext } from '../../context/AuthContext';

const BlogManagement = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setPosts(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title || !content) {
      setError('Title and content are required.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('blog_posts').insert([
      {
        title,
        content,
        author_id: user?.id,
      },
    ]);
    if (error) setError(error.message);
    else {
      setTitle('');
      setContent('');
      fetchPosts();
    }
    setLoading(false);
  };

  if (!isAdmin) {
    return <div>Access denied. Admins only.</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h2>Blog Management</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <div>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 8 }}
          />
        </div>
        <div>
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            style={{ width: '100%', padding: 8, marginBottom: 8 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Posting...' : 'Post Blog'}
        </button>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
      <h3>Existing Blog Posts</h3>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {posts.map((post) => (
            <li key={post.id} style={{ border: '1px solid #ccc', marginBottom: 12, padding: 12 }}>
              <h4>{post.title}</h4>
              <p>{post.content}</p>
              <small>Posted on {new Date(post.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BlogManagement; 