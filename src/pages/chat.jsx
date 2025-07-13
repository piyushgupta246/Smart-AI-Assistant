import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import '../App.css';
import { dataContext, pre_user } from '../context/UserContext';
import { FaPlus, FaArrowUp } from "react-icons/fa";
import { RiImageAddLine, RiImageAiFill } from "react-icons/ri";
import { generateResponse } from '../gemini';

function Chat() {
    // Context and state management
    const {
        userMessage,
        input,
        setInput,
        feature,
        setfeature,
        showresult,
        setshowresult,
        setUserMessage
    } = useContext(dataContext);

    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [localImage, setLocalImage] = useState(null);
    const [popUp, setPopUp] = useState(false);
    
    // Refs
    const fileInputRef = useRef(null);
    const popupRef = useRef(null);
    const chatHistoryEndRef = useRef(null);

    // Effects
    useEffect(() => {
        // Close popup when clicking outside
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target) && 
                event.target.id !== 'add') {
                setPopUp(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        // Scroll to bottom when chat updates
        chatHistoryEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, loading]);

    useEffect(() => {
        // Fetch initial response when coming from Home
        if (userMessage && chatHistory.length === 0) {
            fetchResponse(userMessage, true);
        }
    }, [userMessage]);

    // Helper functions
    const fetchResponse = async (message, isInitial = false) => {
        setLoading(true);
        try {
            const result = await generateResponse(
                message,
                isInitial ? pre_user.data : null,
                isInitial ? pre_user.mime_type : null
            );
            
            updateChatHistory(message, result, isInitial);
            setshowresult(result);
            setLocalImage(null);
        } catch (err) {
            console.error("API Error:", err);
            addErrorMessage();
        } finally {
            setLoading(false);
        }
    };

    const updateChatHistory = (message, result, isInitial) => {
        setChatHistory(prev => [
            ...prev,
            { 
                type: 'user', 
                content: message, 
                image: isInitial ? pre_user.imgUrl : localImage 
            },
            { type: 'ai', content: result }
        ]);
    };

    const addErrorMessage = () => {
        setChatHistory(prev => [
            ...prev,
            { type: 'ai', content: "❌ Error processing request" }
        ]);
    };

    // Event handlers
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (feature === "genImg") {
            await handleImageGeneration();
            return;
        }

        if (!input.trim() && !localImage) return;
        const currentMessage = input || "Regarding the uploaded image";
        setUserMessage(currentMessage);
        setInput("");
        await fetchResponse(currentMessage);
    };

    const handleImageGeneration = async () => {
        if (!input.trim()) return;
        setLoading(true);
        try {
            const generatedImageUrl = await generateImage(input);
            setChatHistory(prev => [
                ...prev,
                { type: 'user', content: input },
                { type: 'ai', content: "Here's your generated image:", image: generatedImageUrl }
            ]);
            setInput("");
        } catch (err) {
            console.error("Image generation error:", err);
            addErrorMessage();
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file
        if (file.size > 2 * 1024 * 1024) {
            alert("Image too large. Max 2MB.");
            return;
        }
        if (!file.type.startsWith("image/")) {
            alert("Only images are allowed.");
            return;
        }

        // Read and process image
        const reader = new FileReader();
        reader.onload = (event) => {
            const fullBase64 = event.target.result;
            setLocalImage(fullBase64);
            pre_user.data = fullBase64.split(',')[1];
            pre_user.mime_type = file.type;
            pre_user.imgUrl = fullBase64;
        };
        reader.readAsDataURL(file);
        setPopUp(false);
    }, []);

    const togglePopUp = (e) => {
        e.stopPropagation();
        setPopUp(prev => !prev);
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
        setfeature("uploadImg");
    };

    const handleGenerateImage = () => {
        setfeature("genImg");
        setPopUp(false);
    };

    const generateImage = async (prompt) => {
        console.log("Generating image with prompt:", prompt);
        return "https://example.com/generated-image.jpg";
    };

    // Render helpers
    const renderMessage = (msg, index) => (
        <div key={index} className={`message ${msg.type}-message`}>
            <img
                src={msg.type === 'user' 
                    ? "https://cdn-icons-png.flaticon.com/512/1946/1946429.png" 
                    : "https://cdn-icons-png.flaticon.com/512/4712/4712027.png"}
                alt={msg.type}
                className="chat-icon"
            />
            <div className="message-content">
                {msg.content}
                {msg.image && (
                    <div className="image-message-container">
                        <img src={msg.image} alt="User upload" className="uploaded-image" />
                    </div>
                )}
            </div>
        </div>
    );

    const renderLoadingIndicator = () => (
        <div className="message ai-message">
            <div className="message-content loading">
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </div>
        </div>
    );

    const renderImageUploadPreview = () => (
        <div className="message user-message">
            <div className="message-content">
                <div className="image-prompt-container">
                    <div className="image-message-container">
                        <img src={localImage} alt="Preview" className="uploaded-image" />
                    </div>
                    <input
                        type="text"
                        placeholder="Ask about this image..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="image-prompt-input"
                    />
                </div>
            </div>
        </div>
    );

    const renderPopupOptions = () => (
        <div className='pop-up' ref={popupRef}>
            <div className="popup-option" onClick={triggerFileInput}>
                <RiImageAddLine className="option-icon" />
                <span>Upload Image</span>
            </div>
            <div className="popup-option" onClick={handleGenerateImage}>
                <RiImageAiFill className="option-icon" />
                <span>Generate Image</span>
            </div>
        </div>
    );

    const renderChatInput = () => (
        <>
            <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button id="submit" type="submit" disabled={loading || (!input.trim() && !localImage)}>
                <FaArrowUp className="send-icon" />
            </button>
        </>
    );

    const renderImageUploadInput = () => (
        <div className="image-upload-container">
            <label htmlFor="chatInputImg" className="upload-label">
                <RiImageAddLine className="upload-icon" />
                <span>Select Image</span>
            </label>
            <button type="button" onClick={() => setfeature("chat")} className="cancel-upload">
                Cancel
            </button>
        </div>
    );

    const renderImageGenerationInput = () => (
        <div className="gen-image-container">
            <RiImageAiFill className="gen-image-icon" />
            <input
                type="text"
                placeholder="Describe the image you want..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={!input.trim() || loading} className="generate-btn">
                {loading ? "Generating..." : "Generate"}
            </button>
            <button type="button" onClick={() => setfeature("chat")} className="cancel-gen">
                Cancel
            </button>
        </div>
    );

    return (
        <div className='chat-wrapper'>
            <nav>
                <div className='logo'>Smart AI Bot</div>
            </nav>

            <div className='chat-container'>
                <div className='chat-history'>
                    {chatHistory.map(renderMessage)}
                    
                    {loading && renderLoadingIndicator()}
                    {localImage && feature === "uploadImg" && renderImageUploadPreview()}
                    <div ref={chatHistoryEndRef} />
                </div>

                <form className="input-box" onSubmit={handleSubmit}>
                    {popUp && renderPopupOptions()}

                    <input
                        type="file"
                        ref={fileInputRef}
                        id="chatInputImg"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                    />

                    <button 
                        id="add" 
                        type="button" 
                        onClick={togglePopUp}
                        aria-label="Toggle options"
                    >
                        <FaPlus className="plus-icon" />
                    </button>

                    {feature === "chat" && renderChatInput()}
                    {feature === "uploadImg" && !localImage && renderImageUploadInput()}
                    {feature === "genImg" && renderImageGenerationInput()}
                </form>
            </div>
        </div>
    );
}

export default Chat;