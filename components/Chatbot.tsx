// components/Chatbot.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types';
import { chatWithGemini } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { GEMINI_CHAT_MODEL } from '../constants';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true); // To prevent state updates on unmounted components

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputMessage.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: inputMessage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    let modelResponseContent = '';
    const modelMessagePlaceholder: ChatMessage = { role: 'model', content: '' };
    setMessages((prev) => [...prev, modelMessagePlaceholder]);

    try {
      await chatWithGemini(newMessages, GEMINI_CHAT_MODEL, (chunk) => {
        if (!isMounted.current) return; // Prevent updates if component unmounted
        modelResponseContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = modelResponseContent;
          return updated;
        });
      });
    } catch (error) {
      console.error("Failed to fetch chat response:", error);
      if (isMounted.current) {
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[updated.length - 1] === modelMessagePlaceholder) {
            updated[updated.length - 1] = {
              role: 'model',
              content: `Error: Failed to get response. ${error instanceof Error ? error.message : String(error)}`,
            };
          } else {
            updated.push({
              role: 'model',
              content: `Error: Failed to get response. ${error instanceof Error ? error.message : String(error)}`,
            });
          }
          return updated;
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        scrollToBottom();
      }
    }
  }, [inputMessage, messages, isLoading]);


  const renderMessageContent = (content: string) => {
    // Basic Markdown-like rendering for bold, italics, and newlines
    const formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italics
      .replace(/(\n)/g, '<br />'); // Newlines
    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-4xl mx-auto">
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            Start a conversation with Gemini!
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg break-words
                ${msg.role === 'user'
                  ? 'bg-indigo-500 text-white dark:bg-indigo-600'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-50'
                }`}
            >
              {renderMessageContent(msg.content)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
              <LoadingSpinner />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask Gemini a question..."
          className="flex-grow p-3 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          disabled={isLoading}
          title="Type your message to Gemini here."
        />
        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white rounded-r-lg font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-900 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || inputMessage.trim() === ''}
          title="Send your message to Gemini."
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;