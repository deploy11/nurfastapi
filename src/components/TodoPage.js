import React, { useState, useEffect } from 'react';

const toast = {
  success: (content) => {
    if (window.Toast) {
      new window.Toast({ content, type: 'success' });
    } else {
      console.error('Toast is not defined');
    }
  },
  error: (content) => {
    if (window.Toast) {
      new window.Toast({ content, type: 'danger' });
    } else {
      console.error('Toast is not defined');
    }
  },
};

function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState({ title: '', description: '', done: false });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    if (token && userId) {
      fetchTodos(token);
    } else {
      window.location.href = '/login';
    }
  }, []);

  const fetchTodos = async (token) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/todo/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      } else {
        toast.error('Error fetching todos');
      }
    } catch (error) {
      toast.error(`Fetch error: ${error.message}`);
    }
  };

  const handleAddOrUpdate = async () => {
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    const method = isUpdating ? 'PUT' : 'POST';
    const url = isUpdating
      ? `http://127.0.0.1:8000/todo/${currentTodo.id}/`
      : 'http://127.0.0.1:8000/todo/';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ...currentTodo, user_id: userId }),
      });

      if (response.ok) {
        toast.success(isUpdating ? 'Task successfully updated!' : 'Task successfully added!');
        setModalOpen(false);
        fetchTodos(token);
      } else {
        toast.error(`Error: ${response.statusText}`);
      }
    } catch (error) {
      toast.error(`Fetch error: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://127.0.0.1:8000/todo/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Task successfully deleted!');
        fetchTodos(token);
      } else {
        toast.error(`Error deleting task: ${response.statusText}`);
      }
    } catch (error) {
      toast.error(`Fetch error: ${error.message}`);
    }
  };

  const openModal = (todo = { title: '', description: '', done: false }) => {
    setCurrentTodo(todo);
    setIsUpdating(!!todo.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentTodo({ title: '', description: '', done: false });
    setIsUpdating(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    window.location.href = '/login'; // Redirect to login page
  };
  

  return (
    <div className="TodoPage">
      <div className="navbar">
        <h1>N-TODO</h1>
        <div className="d-flex">
            <button className="add-btn" onClick={() => openModal()}>Add</button>
            <button className="logout-btn" onClick={() => handleLogout()}>Logout</button>
        </div>
      </div>
      
      <div className="cards-container">
        {todos.length === 0 ? (
          <div className='status-card'>
            <p>No todos available</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div key={todo.id} className="card">
              <h2 className="card-title">{todo.title}</h2>
              <p className="card-body">{todo.description}</p>
              <p className="card-status">{todo.done ? "Completed" : "Not Completed"}</p>
              <div className="card-actions">
                <button className="update-btn" onClick={() => openModal(todo)}>Update</button>
                <button className="delete-btn" onClick={() => handleDelete(todo.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isUpdating ? 'Update Todo' : 'New Todo'}</h2>
              <span className="close" onClick={closeModal}>&times;</span>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Title"
                value={currentTodo.title}
                onChange={(e) => setCurrentTodo({ ...currentTodo, title: e.target.value })}
              />
              <textarea
                placeholder="Description"
                rows="4"
                value={currentTodo.description}
                onChange={(e) => setCurrentTodo({ ...currentTodo, description: e.target.value })}
              />
              <label>
                <input
                  type="checkbox"
                  checked={currentTodo.done}
                  onChange={(e) => setCurrentTodo({ ...currentTodo, done: e.target.checked })}
                /> Completed
              </label>
            </div>
            <div className="modal-footer">
              <button className="save-btn" onClick={handleAddOrUpdate}>
                {isUpdating ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoPage;
