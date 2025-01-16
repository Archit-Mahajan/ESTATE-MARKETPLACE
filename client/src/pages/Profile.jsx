import { useSelector, useDispatch } from 'react-redux';
import { useState, useRef, useEffect } from 'react';
import { signInSuccess } from '../../redux/user/userSlice';
import axios from 'axios';
import { updateUserStart, updateUserSuccess, updateUserFailure } from '../../redux/user/userSlice';
import { useDispatch } from 'react-redux';

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading } = useSelector((state) => state.user);
  const [username] = useState(currentUser.username);
  const [email] = useState(currentUser.email);
  const [password] = useState('');
  const [image, setImage] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar);
  const dispatch = useDispatch();
  const [fileUploadError, setFileUploadError] = useState('');
  const [filePerc, setFilePerc] = useState(0);
  const [formData, setFormData] = useState({});

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      setFileUploadError('Image must be less than 2 MB.');
      setImage(null);
      setFilePerc(0);
    } else {
      setFileUploadError('');
      setImage(file);
    }
  };

  useEffect(() => {
    const uploadImage = async () => {
      if (image) {
        try {
          const formData = new FormData();
          formData.append('file', image);
          formData.append('upload_preset', 'profile_pictures');

          const response = await axios.post(
            'https://api.cloudinary.com/v1_1/dqdwnnrfv/image/upload',
            formData,
            {
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setFilePerc(percentCompleted);
              },
            }
          );

          setAvatarUrl(response.data.secure_url);
          setFilePerc(100);
        } catch (error) {
          console.error('Image upload failed:', error);
          setFileUploadError('Failed to upload image. Please try again.');
        }
      }
    };

    uploadImage();
  }, [image]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const userUpdateRes = await axios.put('/api/users/update-profile', {
        username,
        email,
        password,
        avatar: avatarUrl,
      });

      dispatch(signInSuccess(userUpdateRes.data));
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <img
          onClick={() => fileRef.current.click()}
          src={avatarUrl}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover mx-auto cursor-pointer'
        />
        <p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700'>{fileUploadError}</span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className='text-green-700'>Image successfully uploaded!</span>
          ) : (
            ''
          )}
        </p>
        <input
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
          onChange={handleFileChange}
        />
        <input
          type='text'
          placeholder='username'
          defaultValue={currentUser.username}
          id='username'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='email'
          placeholder='email'
          id='email'
          defaultValue={currentUser.email}
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='password'
          placeholder='password'
          onChange={handleChange}
          id='password'
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
