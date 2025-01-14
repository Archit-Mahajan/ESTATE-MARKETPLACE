import { useSelector, useDispatch } from 'react-redux';
import { useState, useRef } from 'react';
import { signInSuccess } from '../../redux/user/userSlice';
import axios from 'axios';

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading } = useSelector((state) => state.user);
  const [username, setUsername] = useState(currentUser.username);
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      let avatarUrl = currentUser.avatar; 

      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', 'profile_pictures');

        const cloudinaryRes = await axios.post(
          'https://api.cloudinary.com/v1_1/dqdwnnrfv/image/upload', 
          formData
        );
        avatarUrl = cloudinaryRes.data.secure_url; 
      }

    
      const userUpdateRes = await axios.put(
        '/api/users/update-profile', 
        { username, email, password, avatar: avatarUrl }
      );

      // Dispatch updated user data to Redux
      dispatch(signInSuccess(userUpdateRes.data));
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form className='flex flex-col gap-4' onSubmit={handleUpdate}>
        <img
          onClick={() => fileRef.current.click()}
          src={currentUser.avatar}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover mx-auto cursor-pointer'
        />
        <input
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
          onChange={handleFileChange}
        />
        <input
          type='text'
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className='border p-3 rounded-lg'
        />
        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='border p-3 rounded-lg'
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='border p-3 rounded-lg'
        />
        <button
          type='submit'
          disabled={loading}
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Loading...' : 'Update'}
        </button>
      </form>
      <div className='flex justify-between mt-5'>
        <span className='text-red-700 cursor-pointer'>Delete account</span>
        <span className='text-red-700 cursor-pointer'>Sign out</span>
      </div>
    </div>
  );
}
