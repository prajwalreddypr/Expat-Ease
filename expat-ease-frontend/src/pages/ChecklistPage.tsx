import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChecklistStep from '../components/ChecklistStep';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  country: string;
  order_index: number;
  is_required: boolean;
  estimated_days: number | null;
  created_at: string;
  updated_at: string;
  unlocked: boolean;
  documents: Document[];
}

interface Document {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  content_type: string;
  task_id: number;
  user_id: number;
  created_at: string;
  download_url: string;
}

const ChecklistPage: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && user) {
      fetchTasks();
    }
  }, [token, user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      console.log('Fetching tasks with token:', token ? 'Token present' : 'No token');

      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('http://localhost:8000/api/v1/tasks/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired, logout and redirect to login
          logout();
          navigate('/');
          throw new Error('Your session has expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`Failed to fetch tasks: ${response.status} ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('Tasks data:', data);
      setTasks(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const initializeTasks = async () => {
    try {
      const formData = new FormData();
      formData.append('country', user?.country || '');

      const response = await fetch('http://localhost:8000/api/v1/tasks/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to initialize tasks');
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize tasks');
    }
  };

  const updateTaskStatus = async (taskId: number, status: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      // Refresh tasks
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const uploadDocument = async (taskId: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`http://localhost:8000/api/v1/tasks/${taskId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      // Refresh tasks to get updated documents
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    }
  };

  const completedCount = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  if (loading || !token || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your checklist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTasks}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-6">📋</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Initialize Your Checklist</h1>
          <p className="text-gray-600 mb-6">
            Get started with your settlement checklist for {user?.country}. We'll create a personalized
            step-by-step guide to help you settle in your new country.
          </p>
          <button
            onClick={initializeTasks}
            className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Initialize Checklist for {user?.country}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settlement Checklist</h1>
          <p className="text-gray-600 mb-6">
            Track your progress as you settle in {user?.country}. Complete tasks in order to unlock the next steps.
          </p>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Progress</h2>
              <span className="text-sm text-gray-600">{completedCount} of {totalTasks} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{progressPercentage}% complete</p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <ChecklistStep
              key={task.id}
              task={task}
              stepNumber={index + 1}
              onStatusUpdate={updateTaskStatus}
              onDocumentUpload={uploadDocument}
            />
          ))}
        </div>

        {/* Completion Message */}
        {completedCount === totalTasks && totalTasks > 0 && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-semibold text-green-900 mb-2">Congratulations!</h2>
            <p className="text-green-700">
              You've completed all your settlement tasks. You're well on your way to settling in {user?.country}!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistPage;
