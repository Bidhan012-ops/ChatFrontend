import React from 'react'

const Rmessage = ({ message, onImageClick }) => {
    console.log("this is message from the Rmessage", message);
    return (
        <div className="flex gap-3 max-w-[80%]">
            <img className="w-8 h-8 rounded-full object-cover mt-auto hidden md:block" src={message.sender?.profilepic || message.sender?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender?.name || 'User')}&background=random`} alt={`${message.sender?.name || 'User'} avatar`} />
            <div className="flex flex-col gap-1">
                {message.image && (
                    message.image.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) ? (
                        <img
                            src={message.image}
                            alt="Received"
                            className="w-32 h-32 object-cover rounded-lg mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={onImageClick}
                        />
                    ) : (
                        <button 
                            onClick={async (e) => {
                                e.preventDefault();
                                try {
                                    const response = await fetch(message.image);
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = "Document.pdf"; // Forces the .pdf extension!
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                } catch (err) {
                                    console.error(err);
                                    window.open(message.image, '_blank');
                                }
                            }}
                            className="flex items-center gap-2 p-3 bg-white/10 hover:bg-white/20 transition-colors rounded-lg mb-1 cursor-pointer text-on-surface border border-white/5"
                        >
                            <span className="material-symbols-outlined text-2xl">download</span>
                            <span className="text-sm font-medium">Download Document</span>
                        </button>
                    )
                )}
                {message.content && (
                    <div className="smoked-bubble-incoming text-slate-100 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                        {message.content}
                    </div>
                )}
                <span className="text-[10px] text-slate-400/80 mt-1 ml-1.5 inline-block">{message.time}</span>
            </div>
        </div>
    )
}

export default Rmessage
