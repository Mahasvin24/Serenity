"use client";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Settings, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/components/chat-message";
import { ConversationList } from "@/components/conversation-list";
import { SettingsPanel } from "@/components/settings-panel";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";
import { sendMessage } from "@/lib/api";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

export function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "New conversation",
      messages: [],
      createdAt: new Date(),
    },
  ]);
  const [currentConversationId, setCurrentConversationId] =
    useState<string>("1");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();

  const currentConversation =
    conversations.find((c) => c.id === currentConversationId) ||
    conversations[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    // Update conversation with user message
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === currentConversationId) {
        return {
          ...conv,
          messages: [...conv.messages, userMessage],
          title:
            conv.messages.length === 0 ? inputValue.slice(0, 30) : conv.title,
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setInputValue("");
    setIsLoading(true);

    try {
      // Prepare messages in the format expected by the API
      const currentConv = updatedConversations.find(
        (conv) => conv.id === currentConversationId
      );
      const apiMessages =
        currentConv?.messages.map((msg) => ({
          content: msg.content,
          role: msg.role,
        })) || [];

      // Call API with all messages for context
      const responseContent = await sendMessage(
        apiMessages,
        "llama-3.3-70b-versatile"
      );

      // Create assistant message
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: responseContent,
        role: "assistant",
        timestamp: new Date(),
      };

      // Update conversation with assistant response
      const finalConversations = updatedConversations.map((conv) => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, assistantMessage],
          };
        }
        return conv;
      });

      setConversations(finalConversations);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New conversation",
      messages: [],
      createdAt: new Date(),
    };
    setConversations([...conversations, newConversation]);
    setCurrentConversationId(newConversation.id);
    setSidebarOpen(false);
  };

  const deleteConversation = (id: string) => {
    const updatedConversations = conversations.filter((conv) => conv.id !== id);
    setConversations(updatedConversations);
    if (id === currentConversationId) {
      setCurrentConversationId(updatedConversations[0]?.id || "");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <User className="h-5 w-5" />
      </Button>
      {/* Settings toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-50"
        onClick={() => setSettingsOpen(true)}
      >
        <Settings className="h-5 w-5" />
      </Button>
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || !isMobile) && (
          <motion.div
            initial={isMobile ? { x: -300 } : false}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={cn(
              "fixed inset-y-0 left-0 z-40 w-72 border-r bg-background md:relative",
              isMobile ? "shadow-xl" : ""
            )}
          >
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
            <div className="flex h-full flex-col p-4">
              <Button className="mb-4" onClick={createNewConversation}>
                New Conversation
              </Button>
              <ConversationList
                conversations={conversations}
                currentId={currentConversationId}
                onSelect={(id) => {
                  setCurrentConversationId(id);
                  if (isMobile) setSidebarOpen(false);
                }}
                onDelete={deleteConversation}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Settings Panel */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Settings</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSettingsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SettingsPanel />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {currentConversation?.messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-md text-center">
                    <h2 className="mb-2 text-2xl font-bold">
                      Welcome to Serenity
                    </h2>
                    <p className="text-muted-foreground">
                      Start a conversation with the AI assistant. Your messages
                      will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pb-20">
                  {currentConversation?.messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && (
                    <div className="flex items-center space-x-2">
                      <Bot className="h-8 w-8 rounded-full bg-primary/10 p-1 text-primary" />
                      <div className="animate-pulse text-muted-foreground">
                        Thinking...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            <div className="border-t bg-background p-4">
              <div className="mx-auto flex max-w-3xl items-end gap-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="min-h-[60px] resize-none"
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="h-[60px] shrink-0"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
