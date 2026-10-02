import ReactDOM from 'react-dom';
import './ProfileDetailsModal.css';
import { useAuth } from '../context/AuthContext';
import { useRef, useState } from 'react';
import { updateprofile } from '../services/Chatservice';
const ProfileDetailsModal = ({ isOpen, onClose, userProfile }) => {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [localUrl, setLocalUrl] = useState(null);
  const [fullName, setFullName] = useState(user?.name || 'John Johnson');
  const [bio, setBio] = useState(user?.bio || 'Hi Everyone, I am Using ichat');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedFile = fileInputRef.current.files[0];
    
    let base64Image = null;
    if (selectedFile) {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        base64Image = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
        });
    }

    if (selectedFile) {
        setLocalUrl(URL.createObjectURL(selectedFile));
    }
    console.log("Bro please look The values are: ", fullName, bio, selectedFile);
    setIsSaving(true);
    try {
      const response = await updateprofile(fullName, bio, base64Image);
      console.log(response.data);
      setUser(response.data); // Update the user context!
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      onClose();
    } catch (error) {
      console.log(error.response.data.message);
      setIsSaving(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-hidden font-sans">
      <div className="relative z-10 w-full max-w-3xl my-8">
        {/* Profile Card Container */}
        <article className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden transition-all duration-300 min-h-[480px] flex flex-col justify-between">
          {/* Header title */}
          <header className="mb-8 border-b border-white/10 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium tracking-wide text-slate-100">Profile details</h1>
              <p className="text-sm text-slate-400 mt-1">Manage your personal display information and QuickChat presence</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 text-xs font-medium text-purple-300 bg-purple-900/40 rounded-full border border-purple-500/30">Active</span>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          {/* Main card body */}
          <div className="flex flex-col-reverse md:flex-row items-center md:items-start justify-between gap-10 flex-1">
            {/* Form Elements Column */}
            <form className="flex-1 w-full flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="w-full flex flex-col gap-2">
                <label htmlFor="full-name" className="text-xs font-medium text-slate-300 tracking-wider uppercase">Display Name</label>
                <input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-xl px-4 py-3.5 text-base text-slate-100 placeholder-slate-400 focus:outline-none transition duration-150 bg-[#130f26]/75 border border-purple-500/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 backdrop-blur-md shadow-inner"
                />
              </div>

              <div className="w-full flex flex-col gap-2">
                <label htmlFor="bio-status" className="text-xs font-medium text-slate-300 tracking-wider uppercase">About / Bio</label>
                <textarea
                  id="bio-status"
                  rows="4"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-base text-slate-100 resize-none focus:outline-none font-normal tracking-wide transition duration-150 leading-relaxed bg-[#130f26]/75 border border-purple-500/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 backdrop-blur-md shadow-inner"
                />
              </div>

              <div className="pt-3 mt-auto">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`w-full sm:w-auto min-w-[180px] py-3.5 px-8 rounded-full bg-gradient-to-r from-[#9947f5] to-[#a23ef6] hover:from-[#a855f7] hover:to-[#b04af8] text-white text-base font-medium tracking-wide transition-all duration-200 btn-glow active:scale-[0.99] text-center shadow-lg cursor-pointer ${saved ? 'opacity-90' : ''}`}
                >
                  {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </form>

            {/* Profile Avatar Section */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center pt-2 md:pt-4">
              <div className="relative group">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden bg-slate-800/80 shadow-2xl border-2 border-white/20 relative flex items-center justify-center ring-4 ring-purple-500/20">
                  <img
                    alt="Profile portrait"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    src={localUrl || user?.profilepic || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || user?.name || 'User')}&background=random`}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Edit profile photo"
                  className="absolute bottom-1 right-1 w-11 h-11 rounded-full bg-[#1e1338] border border-purple-400/50 text-purple-300 hover:text-white hover:bg-purple-600/60 transition-all flex items-center justify-center shadow-xl cursor-pointer transform hover:scale-105 focus:outline-none group"
                >
                  <input className='hidden' type="file" id="profileimage" name="profileimage" accept=".jpg, .jpeg, .png" ref={fileInputRef}></input>
                  <label htmlFor="profileimage">
                    <svg className="w-5 h-5 group-hover:text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </label>
                </button>
              </div>
              <span className="text-xs text-slate-400 mt-3">Click icon to update avatar</span>
            </div>
          </div>
        </article>
      </div>
    </div>,
    document.body
  );
};

export default ProfileDetailsModal;
