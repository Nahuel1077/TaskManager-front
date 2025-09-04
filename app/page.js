'use client'
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ title: '', duration: '', description: '', category: '' });
  const [editingId, setEditingId] = useState(null);

  // Obtener las tareas desde el backend
  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/tasks');
      if (!response.ok) {
        throw new Error('Error fetching tasks');
      }
      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) return <p>Cargando tareas...</p>;
  if (error) return <p>Error: {error}</p>;

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Crear o editar task
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `http://localhost:4000/api/tasks/${editingId}` : 'http://localhost:4000/api/tasks';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData }),
      });
      if (!res.ok) throw new Error('Error saving task');
      fetchTasks(); 
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  // Editar
  const handleEdit = (task) => {
    setFormData({
      title: task.title,
      duration: task.duration,
      description: task.description,
    });
    setEditingId(task._id);
  };

  // Eliminar task
  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar esta tarea?')) return;
    try {
      const res = await fetch(`http://localhost:4000/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error deleting task');
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({ title: '', duration: '', description: '', category: '' });
    setEditingId(null);
  };
 
  return (
    <div className='flex flex-col items-center gap-8'>
      <h1>Task Manager</h1>
      <form onSubmit={handleSubmit} className='flex flex-col items-center'>
        <input value={formData.title} placeholder='Tarea' onChange={handleInputChange} className='w-[200px] border-b-2 border-amber-100' name='title'></input>
        <input type='number' placeholder='Duración' value={formData.duration} onChange={handleInputChange} className='w-[200px] border-b-2 border-amber-100' name='duration'></input>
        <input value={formData.description} onChange={handleInputChange} placeholder='Descripción' className='w-[200px] border-b-2 border-amber-100' name='description'></input>
        <button type="submit">{editingId ? 'Editar' : 'Crear'}</button>
        {editingId && <button type="button" onClick={resetForm}>Cancelar</button>}
      </form>
      {tasks.length === 0 ? (
        <p>No hay tareas disponibles.</p>
      ) : (
        <ul className='flex flex-row gap-8'>
          {tasks.map((task) => (
            <li key={task._id} className='flex flex-col justify-between border-2 border-amber-100 rounded-md p-2 bg-[linear-gradient(180deg,black,#3f3f3f)]'>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Estado: {task.completed ? 'Completada' : 'Pendiente'}</p>
              <div className='flex flex-row justify-between'>
                <button onClick={()=> handleEdit(task)}>
                  <Image
                  src="/edit.svg"
                  alt="edit"
                  width={20}
                  height={20}
                  className='invert'
                  />
                </button>
                <button onClick={handleDelete}>
                  <Image
                  src="/trash.svg"
                  alt="edit"
                  width={20}
                  height={20}
                  className='invert'
                  />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}