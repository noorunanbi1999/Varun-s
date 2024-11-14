import React from "react";
import { useState, useEffect } from "react";
const Admin = () => {
  const [message, setMessage] = useState(null);
  const [value, setValue] = useState("");
  const [previousChats, setPreviousChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const createNewChat = () => {
    setMessage(null);
    setValue("");
    setCurrentTitle(null);
  };

  const handleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setValue("");
  };

  const getMessages = async () => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: value,
      }),
    };
    try {
      const response = await fetch(
        "http://localhost:8000/completions",
        options
      );
      const data = await response.json();

      if (data && data.message) {
        setMessage({
          role: "assistant",
          content: data.message,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const uploadFile = async (event) => {
    const file = event.target.files[0];
    setUploadedFile(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      alert(data.message || "File uploaded successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!currentTitle && value && message) {
      setCurrentTitle(value);
    }
    if (currentTitle && value && message) {
      setPreviousChats((prevChats) => [
        ...prevChats,
        {
          title: currentTitle,
          role: "user",
          content: value,
        },
        {
          title: currentTitle,
          role: message.role,
          content: message.content,
        },
      ]);
    }
  }, [message, currentTitle]);

  const currentChat = previousChats.filter(
    (chat) => chat.title === currentTitle
  );
  const uniqueTitles = Array.from(
    new Set(previousChats.map((chat) => chat.title))
  );

  return (
    <div className="app">
      <section className="sidebar">
        <button onClick={createNewChat}>+ New Chat</button>
        <ul className="history">
          {uniqueTitles.map((title, index) => (
            <li key={index} onClick={() => handleClick(title)}>
              {title}
            </li>
          ))}
        </ul>
        <input
          type="file"
          onChange={uploadFile}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          className="uploadFile"
        />
        <nav>
          <p></p>
        </nav>
      </section>

      <section className="main">
        {!currentTitle && <h1>Admin Dashboard</h1>}
        <ul className="feed">
          {currentChat.map((chatMessage, index) => (
            <li key={index}>
              <p className="role">{chatMessage.role}</p>
              <p>{chatMessage.content}</p>
            </li>
          ))}
        </ul>
        <div className="bottom-section">
          <div className="input-container">
            <textarea
              className="input"
              rows={1}
              cols={20}
              wrap="soft"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            ></textarea>
            <div id="submit" onClick={getMessages}>
              &#10146;
            </div>
          </div>
          <p className="info">
            {" "}
            This ChatBot is run on AI and can at times hallucinate
          </p>
        </div>
      </section>
    </div>
  );
};

export default Admin;
