import { useState } from "react";
import { getDownloadURL, getStorage,ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase.js";

export default function CreateListing() {
    const [sell, setSell] = useState();
    const [files, setFiles] = useState([]);
    const [formData, setFormData] = useState({
        imageURLs:[]
    });
    const [imageUploadLoading, setImageUploadLoading] = useState(false);
    const [imageUploadError, setImageUploadError] = useState(false);

    const handleImageSubmit = async () => {
        
        if (files.length > 0 && files.length + formData.imageURLs.length < 7) {
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
                        imageURLs: formData.imageURLs.concat(urls) 
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
            imageURLs: formData.imageURLs.filter( (_, i) =>  i !== index)
        });
    };

    return (
        <main className="p-3 max-w-4xl mx-auto">
            <h1 className="text-3xl font-semibold my-7 text-center" >Create a listing</h1>

            <form className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-4 flex-1">
                    <input className="border p-3 rounded-lg" type="text" placeholder="Name" id="name" maxLength='62' minLength='10' required />
                    <input className="border p-3 rounded-lg" type="textarea" placeholder="Description" id="description" required />
                    <input className="border p-3 rounded-lg" type="textarea" placeholder="Address" id="address" required />

                    <div className="flex gap-6 flex-wrap">
                        <div className="flex gap-2">
                            <input className="w-5" type="checkbox" name="sale" id="sale" onChange={(e) => setSell(e.target.value)} />
                            <span name="sale">Sell</span>
                        </div>

                        <div className="flex gap-2">
                            <input className="w-5" type="checkbox" name="rent" id="rent" />
                            <span name="rent">Rent</span>
                        </div>

                        <div className="flex gap-2">
                            <input className="w-5" type="checkbox" name="parking" id="parking" />
                            <span name="parking">Parking spot</span>
                        </div>

                        <div className="flex gap-2">
                            <input className="w-5" type="checkbox" name="furnished" id="furnished" />
                            <span name="furnished">Furnished</span>
                        </div>

                        <div className="flex gap-2">
                            <input className="w-5" type="checkbox" name="offer" id="offer" />
                            <span name="offer">Offer</span>
                        </div>
                    </div>

                    <div className="flex gap-6 flex-wrap">
                        <div className="flex items-center gap-2 ">
                            <input className="p-3 border border-gray-300 rounded-lg" type="number" name="beds" id="beds" min="1" max="10" defaultValue="1" />
                            <p name="beds">Beds</p>
                        </div>

                        <div className="flex items-center gap-2 ">
                            <input className="p-3 border border-gray-300 rounded-lg" type="number" name="baths" id="baths" min="1" max="10" defaultValue="1" />
                            <p name="baths">Baths</p>
                        </div>

                        <div className="flex items-center gap-2 ">
                            <input className="p-3 border border-gray-300 rounded-lg" type="number" name="price" id="price" defaultValue="1" />
                            <div className="flex flex-col items-center">
                                <p>Regular price</p>
                                <span>{sell=='on' ? <small >($ / Month)</small> : ''}</span>
                                
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ">
                            <input className="p-3 border border-gray-300 rounded-lg" type="number" name="discount" id="discount" defaultValue="1" />
                            <div className="flex flex-col items-center">
                                <p>Discounted price</p>
                                <span>{sell=='on' ? <small >($ / Month)</small> : ''}</span>
                            </div>
                        </div>
                        <p>{sell}</p>
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
                        formData.imageURLs.length>0  
                        && formData.imageURLs.map( (url, index) => (
                            <div key={url} className="flex justify-between p-3 border items-center">
                                <img src={url} alt="listing image" className="w-20 h-20 object-contain rounded-lg" />
                                <button onClick={() => handleRemoveIndex(index)} className="text-red-700 p-3 rounded-lg uppercase hover:opacity-80" type="button">
                                    Delete
                                </button>
                            </div>
                        ))
                    }
                    
                    <button className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">Create listing</button>
                </div>
                
            </form>

        </main>
    )

}

