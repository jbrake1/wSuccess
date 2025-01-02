import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

interface User {
  _id: string;
  name: string;
  email: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users...');
        const response = await api.get('/users');
        console.log('API response:', response);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <div className="space-y-4">
        {users.map(user => (
          <div key={user._id} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <Link
                to={`/users/${user._id}/edit`}
                className="text-blue-500 hover:text-blue-700"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
