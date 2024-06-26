import { app } from '../firebase';
import { useSelector,useDispatch } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutUserFailure, signOutUserStart, signOutUserSuccess } from '../redux/user/userSlice';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileError, setFileError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      
      setFileError(false);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFilePerc(Math.round(progress))
        },
        () => {
          setFileError(true);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then(
              downloadURL => setFormData({ ...formData, avatar: downloadURL })
            )
        }
      );
    }

  }, [formData, file])


  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(updateUserStart());

      const res = await fetch(`/api/user/update/${currentUser._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        }
      );
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data.user));
      setUpdateSuccess(true);

    } catch (error) {
      dispatch(updateUserFailure(error.message))
    }
  }

  const handleSignOut = async()=>{
    try {
      dispatch(signOutUserStart());

      const res = await fetch(`/api/auth/sign-out`);
      const data = await res.json();

      if (data.success===false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }

      dispatch(signOutUserSuccess());
      
    } catch (error) {
      dispatch(signOutUserFailure(error.message))
    }
  }
  const handleDeleteUser = async()=>{
    try {
      dispatch(deleteUserStart());

      const res = await fetch(`/api/user/delete/${currentUser._id}`, 
        {
          method: 'DELETE'
        }
      );
      const data = await res.json();

      if (data.success===false) {
        dispatch(deleteUserFailure(data.message))
        return;
      }
      dispatch(deleteUserSuccess());
    } catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  }
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input onChange={(e) => setFile(e.target.files[0])} type="file" ref={fileRef} hidden accept='image/*' />
        <img onClick={() => fileRef.current.click()} className='self-center mt-2 rounded-full h-24 w-24 object-cover cursor-pointer' src={formData.avatar || currentUser.avatar} alt="profile pic" />

        <p className='text-sm self-center'>
          {
            fileError ?
              <span className='text-red-700'>Error Image Upload (Image must be less than 2 mb) </span> :

              filePerc > 0 && filePerc < 100 ?
                <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span> :

                filePerc === 100 ?
                  <span className='text-green-700'>Image successfully uploaded!</span> :
                  ""
          }
        </p>
        <input className='border p-3 rounded-lg' defaultValue={currentUser.username} id="username" type="text" placeholder='Username' onChange={handleChange} />
        <input className='border p-3 rounded-lg' defaultValue={currentUser.email} id="email" type="email" placeholder='Email' onChange={handleChange} />
        <input className='border p-3 rounded-lg' id="password" type="password" placeholder='Password' onChange={handleChange} />

        <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>
          {loading ? 'Loading...' : 'Update'}
        </button>

        <Link to={'/create-listing'} className='bg-green-700 text-center text-white rounded-lg p-3 uppercase hover:opacity-95'>
          Create listing
        </Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>Delete account</span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Sign out</span>
      </div>

      <p className='text-red-700 mt-5'>
        {error ? error : ''}
      </p>
      <p className='text-green-700 mt-5'>
        {updateSuccess ? 'User has been updated successfully!' : ''}
      </p>
    </div>

  )
}
