import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from 'react-redux';
import { signInSuccess, signInFailure, signInStart } from "../redux/user/userSlice.js";
import { useNavigate } from "react-router-dom"

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClic = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);
      dispatch( signInStart() );
      
      const res = await fetch('api/auth/google',{
        method:'POST',
        headers: {
          'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL
        })
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }

      dispatch(signInSuccess(data));
      navigate("/")

    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  }
  return (
    <button onClick={handleGoogleClic} type="button" className=" bg-red-700 text-white uppercase p-3 rounded-lg hover:opacity-95 disabled:opacity-80">Continue with google</button>
  )
}
