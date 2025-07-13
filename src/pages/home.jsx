import React, { useContext, useState, useCallback, useRef, useEffect } from 'react';
import '../App.css';
import { RiImageAddLine, RiImageAiFill } from "react-icons/ri";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { FaPlus, FaArrowUp } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { dataContext, user, pre_user } from '../context/UserContext';
import { generateResponse } from '../gemini';

function Home() {
    const {
        setStartRes,
        setUserMessage,
        input,
        setInput,
        setfeature,
        setshowresult,
        setLoading,
        loading
    } = useContext(dataContext);

    const navigate = useNavigate();
    const [preview, setPreview] = useState(null);
    const [popUp, setPopUp] = useState(false);
    const fileInputRef = useRef(null);
    const popupRef = useRef(null);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target) && 
                event.target.id !== 'add-btn') {
                setPopUp(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        setUserMessage(input);
        setStartRes(true);

        Object.assign(pre_user, {
            data: user.data,
            mime_type: user.mime_type,
            imgUrl: user.imgUrl,
            prompt: input
        });

        try {
            setLoading(true);
            const result = await generateResponse(
                input, 
                user.data, 
                user.mime_type
            );
            setshowresult(result);
            navigate('/chat');
        } catch (error) {
            console.error("API Error:", error);
            alert("Failed to get response. Please try again.");
        } finally {
            setLoading(false);
            user.data = null;
            user.mime_type = null;
            user.imgUrl = null;
            setPreview(null);
        }
    };

    const handleImage = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("Please upload an image smaller than 2MB");
            return;
        }
        if (!file.type.startsWith("image/")) {
            alert("Only image files are allowed (JPEG, PNG, GIF)");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const fullBase64 = event.target.result;
            const base64 = fullBase64.split(",")[1];

            user.data = base64;
            user.mime_type = file.type;
            user.imgUrl = fullBase64;
            setPreview(fullBase64);
        };
        reader.onerror = () => {
            alert("Error reading file. Please try another image.");
        };
        reader.readAsDataURL(file);
        setfeature("uploadImg");
        setPopUp(false); // Close popup after selecting image
    }, [setfeature]);

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const togglePopUp = (e) => {
        e.stopPropagation();
        setPopUp(prev => !prev);
    };

    const handleGenerateImage = () => {
        setfeature("genImg");
        setPopUp(false);
    };

    return (
        <div className='home'>
            <nav>
                <div className='logo'>Smart AI Assistant</div>
            </nav>

            <div className='hero'>
                <h1 id='tag'>Start your research with here...</h1>

                <div className="feature-cards">
                    <div 
                        className="feature-card upload-card"
                        onClick={triggerFileInput}
                    >
                        <RiImageAddLine className="feature-icon upload-icon" />
                        <span className="feature-label">Upload Image</span>
                        <p className="feature-description">Analyze or discuss your images</p>
                    </div>
                    
                    <div 
                        className="feature-card generate-card"
                        onClick={handleGenerateImage}
                    >
                        <RiImageAiFill className="feature-icon generate-icon" />
                        <span className="feature-label">Generate Image</span>
                        <p className="feature-description">Create images from text prompts</p>
                    </div>
                    
                    <div 
                        className="feature-card chat-card"
                        onClick={() => {
                            setfeature("chat");
                            navigate("/chat");
                        }}
                    >
                        <IoChatbubbleEllipsesSharp className="feature-icon chat-icon" />
                        <span className="feature-label">Let's Chat</span>
                        <p className="feature-description">Ask anything to our AI assistant</p>
                    </div>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    hidden
                    id="inputImg"
                    ref={fileInputRef}
                    onChange={handleImage}
                />

                {preview && (
                    <div className="preview-container">
                        <div className="preview-header">
                            <h3>Image Preview</h3>
                            <button 
                                className="clear-preview"
                                onClick={() => {
                                    setPreview(null);
                                    user.data = null;
                                    user.mime_type = null;
                                    user.imgUrl = null;
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <img
                            src={preview}
                            alt="Preview"
                            className="preview-image"
                        />
                    </div>
                )}
            </div>

            <form className="input-box" onSubmit={handleSubmit}>
                {popUp && (
                    <div className='popup-menu' ref={popupRef}>
                        <div 
                            className="popup-option upload-option"
                            onClick={triggerFileInput}
                        >
                            <RiImageAddLine className="option-icon" />
                            <span>Upload Image</span>
                        </div>
                        <div 
                            className="popup-option generate-option"
                            onClick={handleGenerateImage}
                        >
                            <RiImageAiFill className="option-icon" />
                            <span>Generate Image</span>
                        </div>
                    </div>
                )}

                <button 
                    id="add-btn" 
                    type="button" 
                    onClick={togglePopUp}
                    aria-label="Show options"
                    disabled={loading}
                >
                    <FaPlus className="plus-icon" />
                </button>

                <input
                    type="text"
                    placeholder='Ask something...'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                />

                <button 
                    id="submit-btn" 
                    type="submit"
                    disabled={!input.trim() || loading}
                    aria-label="Send message"
                >
                    {loading ? (
                        <div className="spinner"></div>
                    ) : (
                        <FaArrowUp className="send-icon" />
                    )}
                </button>
            </form>
        </div>
    );
}

export default Home;