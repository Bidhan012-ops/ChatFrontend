import React from 'react'

const Smessage = ({ message, onImageClick }) => {
    return (
        <div className="flex gap-3 max-w-[80%] self-end flex-row-reverse">
            <div className="flex flex-col gap-1 items-end">
                {message.image && (
                    message.image.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) ? (
                        <img
                            src={message.image}
                            alt="Sent"
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
                            className="flex items-center gap-2 p-3 bg-primary/20 border border-primary/30 hover:bg-primary/30 transition-colors rounded-lg mb-1 cursor-pointer text-primary"
                        >
                            <span className="material-symbols-outlined text-2xl">download</span>
                            <span className="text-sm font-medium">Download Document</span>
                        </button>
                    )
                )}
                {message.content && (
                    <div className="smoked-bubble-outgoing text-emerald-50 px-4 py-2.5 rounded-2xl rounded-br-sm text-right">
                        {message.content}
                    </div>
                )}
                <div className="flex items-center gap-1 mt-1 mr-1.5 text-[10px] text-slate-400">
                    <span>{message.time}</span>
                    <span className="material-symbols-outlined text-[14px] text-emerald-400">done_all</span>
                </div>
            </div>
        </div>
    )
}

export default Smessage
