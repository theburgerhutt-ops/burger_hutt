'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import styles from './Chatbot.module.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your AI Assistant at The Burger Hut. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages([...messages, userMsg]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      const botMsg = { 
        id: Date.now() + 1, 
        text: "That sounds delicious! I recommend our Classic Cheese Burger. Would you like to see more details?", 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className={styles.chatbotWrapper}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={styles.chatWindow}
          >
            <div className={styles.chatHeader}>
              <div className={styles.botInfo}>
                <div className={styles.botIcon}>
                  <Bot size={20} />
                </div>
                <div>
                  <h4>Hut AI</h4>
                  <span className={styles.status}>Online</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.messages}>
              {messages.map(msg => (
                <div key={msg.id} className={`${styles.message} ${msg.sender === 'user' ? styles.userMsg : styles.botMsg}`}>
                  <div className={styles.messageBubble}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.chatInput}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} className={styles.sendBtn}>
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={styles.toggleBtn}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
};

export default Chatbot;
