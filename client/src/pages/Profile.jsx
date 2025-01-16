import { useSelector, useDispatch } from 'react-redux';
import { useState, useRef, useEffect } from 'react';
import { updateUserStart, updateUserSuccess, updateUserFailure } from '../../redux/user/userSlice';
import axios from 'axios';

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || '');
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    password: '',
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const uploadImage = async () => {
      if (file) {
        try {
          const formData = new FormData();
          formData.append('file', file);
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
          setFileUploadError(false);
        } catch (error) {
          console.error('Image upload failed:', error);
          setFileUploadError('Failed to upload image. Please try again.');
        }
      }
    };

    uploadImage();
  }, [file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePerc(0);
      setFileUploadError(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());

      const updatedData = {
        ...formData,
        avatar: avatarUrl,
      };

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();

      if (!data.success) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      console.error('Update failed:', error);
      dispatch(updateUserFailure(error.message));
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <img
          onClick={() => fileRef.current.click()}
          src={avatarUrl || 'https://via.placeholder.com/150'}
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
          placeholder='Username'
          id='username'
          value={formData.username}
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='email'
          placeholder='Email'
          id='email'
          value={formData.email}
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='password'
          placeholder='Password'
          id='password'
          value={formData.password}
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <button
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
      <p className='text-red-700 mt-5'>{error || ''}</p>
      <p className='text-green-700 mt-5'>
        {updateSuccess ? 'User is updated successfully!' : ''}
      </p>
    </div>
  );
}
