import { useState } from "react";
import { getDownloadURL, getStorage,ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function CreateListing() {
    const { currentUser } = useSelector((state) => state.user);
    const [files, setFiles] = useState([]);
    const [formData, setFormData] = useState({
        images:[],
        name: '',
        description: '',
        address: '',
        type: 'sale',
        parking: false,
        furnished: false,
        offer: false,
        bedrooms: 1,
        bathrooms: 1,
        regularPrice: 1,
        discountPrice: 0
    });
    const [imageUploadLoading, setImageUploadLoading] = useState(false);
    const [imageUploadError, setImageUploadError] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleImageSubmit = async () => {
        
        if (files.length > 0 && files.length + formData.images.length < 7) {
            setImageUploadLoading(true);
            setImageUploadError(false);
            const promises = [];

            for (let i = 0; i < files.length; i++) {
                promises.push(storeImage(files[i])); 
            }

            Promise.all(promises)
                .then( (urls) => {
                    setFormData({ 
                        ...formData, 
                        images: formData.images.concat(urls) 
                    });
                    setImageUploadError(false);
                    setImageUploadLoading(false);
                })
                .catch( (error) => {
                    console.log(error);
                    setImageUploadError('Image upload failed');
                    setImageUploadLoading(false);
                });
        }else{
            setImageUploadError('You can only upload 6 images per listing');
            setImageUploadLoading(false);
        }
    };

    const storeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const fileName = new Date().getTime() + file.name;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log("Upload progress: " +Math.round(progress) + "%");
                },
                (error) => {
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref)
                    .then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            )
        })  
    };
    
    const handleRemoveIndex = (index) => {
        setFormData({
            ...formData,
            images: formData.images.filter( (_, i) =>  i !== index)
        });
    };

    const handleChange = (e) => {
        if(e.target.type==='text' || e.target.type==='textarea'){
            setFormData({
                ...formData,
                [e.target.id]: e.target.value
            });
        }

        if (e.target.type==='number') {
            setFormData({
                ...formData,
                [e.target.id]: parseInt(e.target.value)
            });
        }

        if(e.target.id==='sale' || e.target.id==='rent'){
            setFormData({
                ...formData,
                type: e.target.id
            });
        }

        if(e.target.id==='parking' || e.target.id==='furnished' || e.target.id==='offer'){
            setFormData({
                ...formData,
                [e.target.id]: e.target.checked
            });
        }

    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (formData.images.length < 1) return setError("You must upload at least one image");
            if (+ formData.regularPrice < + formData.discountPrice) return setError("Discount price must be lower than the regular price");
    
            setLoading(true);
            setError(false);

            const res = await fetch(`/api/listing/create`,
                {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    userRef: currentUser._id
                })
                }
            );
            const data = await res.json();
            setLoading(false);
            if (data.success === false) {
                setError(data.message);
                return;
            }
            navigate(`/listing/${data._id}`);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <main className="p-3 max-w-4xl mx-auto">
            <h1 className="text-3xl font-semibold my-7 text-center" >Create a listing</h1>

            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-4 flex-1">
                    <input className="border p-3 rounded-lg" type="text" placeholder="Name" id="name" maxLength='62' minLength='10' onChange={handleChange} value={formData.name} required />
                    <input className="border p-3 rounded-lg" type="textarea" placeholder="Description" id="description" onChange={handleChange} value={formData.description} required />
                    <input className="border p-3 rounded-lg" type="textarea" placeholder="Address" id="address" onChange={handleChange} value={formData.address} required />

                    <div className="flex gap-6 flex-wrap">
                        <div className="flex gap-2">
                            <input className="w-5" type="checkbox" name="sale" id="sale" onChange={handleChange} checked={formData.type==='sale'} />
                            <span name="sale">Sell</span>
                        </div>

                        <div className="flex gap-2">
                            <input className="w-5" type="checkbox" name="rent" id="rent" onChange={handleChange} checked={formData.type==='rent'} />
                            <span name="rent">Rent</span>
                        </div>

                        <div className="flex gap-2">
                            <input className="w-5" type="checkbox" name="parking" id="parking" onChange={handleChange} />
                            <span name="parking">Parking spot</span>
                        </div>

                        <div className="flex gap-2">
                            <input className="w-5" type="checkbox" name="furnished" id="furnished" onChange={handleChange} />
                            <span name="furnished">Furnished</span>
                        </div>

                        <div className="flex gap-2">
                            <input className="w-5" type="checkbox" name="offer" id="offer" onChange={handleChange} />
                            <span name="offer">Offer</span>
                        </div>
                    </div>

                    <div className="flex gap-6 flex-wrap">
                        <div className="flex items-center gap-2 ">
                            <input className="p-3 border border-gray-300 rounded-lg" type="number" name="bedrooms" id="bedrooms" min="1" max="10" defaultValue="1" onChange={handleChange} />
                            <p name="beds">Beds</p>
                        </div>

                        <div className="flex items-center gap-2 ">
                            <input className="p-3 border border-gray-300 rounded-lg" type="number" name="bathrooms" id="bathrooms" min="1" max="10" defaultValue="1" onChange={handleChange} />
                            <p name="baths">Baths</p>
                        </div>

                        <div className="flex items-center gap-2 ">
                            <input className="p-3 border border-gray-300 rounded-lg" type="number" name="regularPrice" id="regularPrice" defaultValue="1" min="1" onChange={handleChange} />
                            <div className="flex flex-col items-center">
                                <p>Regular price</p>
                                <span className="text-xs">($ / Month)</span>
                                
                            </div>
                        </div>
                        { formData.offer && (
                            <div className="flex items-center gap-2 ">
                                <input className="p-3 border border-gray-300 rounded-lg" type="number" name="discountPrice" id="discountPrice" defaultValue="0" min="0" onChange={handleChange} />
                                <div className="flex flex-col items-center">
                                    <p>Discounted price</p>
                                    <span className="text-xs">($ / Month)</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col flex-1 gap-4">
                    <p>
                        <span className="text-semibold">Images:</span> 
                        <span className="font-normal text-gray-600 ml-2">The first image will be the cover (max 6)</span>
                    </p>

                    <div className="flex gap-4">
                        <input onChange={(e) => setFiles(e.target.files)} className="border border-gray-300 p-3 rounded w-full" type="file" name="images" id="images" accept="image/*" multiple />
                        <button onClick={handleImageSubmit} disabled={imageUploadLoading} type="button" className="border border-green-700 rounded p-3 text-green-700 uppercase hover:shadow-lg disabled:opacity-80">
                            {
                                imageUploadLoading ? 'Uploading...' : 'Upload'
                            }
                        </button>
                    </div>
                    <p className="text-red-700 text-sm">
                        {imageUploadError && imageUploadError}
                    </p>
                    {
                        formData.images.length>0  
                        && formData.images.map( (url, index) => (
                            <div key={url} className="flex justify-between p-3 border items-center">
                                <img src={url} alt="listing image" className="w-20 h-20 object-contain rounded-lg" />
                                <button onClick={() => handleRemoveIndex(index)} className="text-red-700 p-3 rounded-lg uppercase hover:opacity-80" type="button">
                                    Delete
                                </button>
                            </div>
                        ))
                    }
                    
                    <button className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80" disabled={loading || imageUploadLoading}>
                        { loading ? 'Creating...' : 'Create listing' }
                    </button>
                    <p className='text-red-700 mt-3'>
                        {error ? error : ''}
                    </p>
                </div>
                
            </form>

        </main>
    )

}


