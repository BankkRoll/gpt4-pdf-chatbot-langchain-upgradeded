import { useRef, useState, useEffect } from 'react';
import Layout from '@/components/layout';
import { Message } from '@/types/chat';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import { Document } from 'langchain/document';
import { PROJECT_TITLE_NAME, CHATBOT_NAME } from '@/config/projectSettings';
import Footer from '@/components/Footer';
import Swal from 'sweetalert2';

const typingDelay = 50;

const typeMessage = async (message: string | any[], callback: (arg0: string) => void) => {
  let typedMessage = '';

  for (let i = 0; i < message.length; i++) {
    typedMessage += message[i];
    await new Promise((resolve) => setTimeout(resolve, typingDelay));
    callback(typedMessage);
  }
};

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: `Hi, what would you like to learn about ${PROJECT_TITLE_NAME}?`,
        type: 'apiMessage',
      },
    ],
    history: [],
  });

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (messageListRef.current) {
      const scrollHeight = messageListRef.current.scrollHeight;
      const height = messageListRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      messageListRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, [messages]);

  const handleSourceClick = (sourceContent: string) => {
    Swal.fire({
      title: 'Source Information',
      text: sourceContent,
      icon: 'info',
      confirmButtonText: 'Close'
    });
  };

  useEffect(() => {
    const handleMessageTyping = async () => {
      const messageIndex = messages.length - 1;
      const lastMessage = messages[messageIndex];
      if (lastMessage.type === 'apiMessage' && !lastMessage.typed) {
        await typeMessage(lastMessage.message, (typedMessage) => {
          setMessageState((state) => {
            const newMessages = [...state.messages];
            newMessages[messageIndex] = {
              ...newMessages[messageIndex],
              message: typedMessage,
            };
            return { ...state, messages: newMessages };
          });
        });
        setMessageState((state) => {
          const newMessages = [...state.messages];
          newMessages[messageIndex] = { ...newMessages[messageIndex], typed: true };
          return { ...state, messages: newMessages };
        });
      }
    };

    handleMessageTyping();
  }, [messages]);
  
  
  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();
    
    if (!query) {
      setMessageState((state) => ({
        ...state,
        messages: [
          ...state.messages,
          {
            type: 'apiMessage',
            message: 'Please input a question',
          },
        ],
      }));
      return;
    }
  
    const question = query.trim();
  
    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
    }));
  
    setLoading(true);
    setQuery('');
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
        }),
      });
      const data = await response.json();
      console.log('data', data);
  
      if (data.error) {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.error,
            },
          ],
        }));
      } else {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.text,
              sourceDocs: data.sourceDocuments,
            },
          ],
          history: [...state.history, [question, data.text]],
        }));
      }
      console.log('messageState', messageState);
  
      setLoading(false);
  
      //scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setMessageState((state) => ({
        ...state,
        messages: [
          ...state.messages,
          {
            type: 'apiMessage',
            message: 'An error occurred while fetching the data. Please try again.',
          },
        ],
      }));
      setLoading(false);
      console.log('error', error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center min-w-fit justify-center space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Chat With {CHATBOT_NAME}
        </h1>
        <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
          <div className="overflow-y-auto min-h-[40vh] max-h-[40vh] mb-4 border-t-2 border-b-2 border-gray-200 py-4 message-list" ref={messageListRef}>
            {messages.map((message, index) => (
              <div key={`chatMessage-${index}`} className={`flex items-start mt-4 first:mt-0 ${message.type === 'apiMessage' ? 'flex-row' : 'flex-row-reverse'}`}>
                <Image
                  src={message.type === 'apiMessage' ? "/bot-image.png" : "/usericon.png"}
                  alt={message.type === 'apiMessage' ? "AI" : "Me"}
                  width="40"
                  height="40"
                  className="rounded-full"
                  priority
                />
                <div className={`ml-4 mr-4 p-4 rounded-lg ${message.type === 'apiMessage' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                  <ReactMarkdown linkTarget="_blank">
                    {message.message}
                  </ReactMarkdown>
                  {message.sourceDocs && (
                    <div className="mt-2 flex justify-center flex-wrap">
                      {message.sourceDocs.map((doc, index) => (
                        <button
                          onClick={() => handleSourceClick(doc.pageContent)}
                          key={`sourceDocs-${index}`}
                          className="m-1 px-1 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
                        >
                          Lines {doc.metadata['loc.lines.from']} to {doc.metadata['loc.lines.to']}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}


          </div>
          <form onSubmit={handleSubmit} className="flex items-center">
            <textarea
              disabled={loading}
              onKeyDown={handleEnter}
              ref={textAreaRef}
              autoFocus={false}
              rows={1}
              maxLength={512}
              id="userInput"
              name="userInput"
              placeholder={
                loading
                  ? 'Waiting for response...'
                  : `What is ${PROJECT_TITLE_NAME} about?`
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-grow mr-3 p-2 rounded border border-gray-200"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
            >
              {loading ? (
                <LoadingDots color="#fff" />
              ) : (
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="paper-airplane w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </form>
        </div>
        <Footer />
        </div>
      </Layout>
  );
}
