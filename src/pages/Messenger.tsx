import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const contacts = [
  { id: 1, name: "Мария", avatar: "М", color: "from-purple-500 to-pink-500", status: "online", lastMsg: "Давай созвонимся?", time: "12:05", unread: 2 },
  { id: 2, name: "Иван", avatar: "И", color: "from-green-500 to-blue-500", status: "online", lastMsg: "Класс!", time: "12:08", unread: 0 },
  { id: 3, name: "Семья", avatar: "С", color: "from-yellow-500 to-orange-500", status: "offline", lastMsg: "Приедете в воскресенье?", time: "Вчера", unread: 5 },
  { id: 4, name: "Рабочий чат", avatar: "Р", color: "from-blue-500 to-cyan-500", status: "online", lastMsg: "Дедлайн завтра", time: "11:30", unread: 0 },
  { id: 5, name: "Алексей", avatar: "А", color: "from-red-500 to-pink-500", status: "offline", lastMsg: "Ок, понял", time: "Пн", unread: 0 },
];

const initialMessages: Record<number, { id: number; text: string; from: "me" | "them"; time: string }[]> = {
  1: [
    { id: 1, text: "Привет!", from: "them", time: "12:00" },
    { id: 2, text: "Привет! Как дела?", from: "me", time: "12:01" },
    { id: 3, text: "Давай созвонимся обсудить проект?", from: "them", time: "12:05" },
  ],
  2: [
    { id: 1, text: "Перешёл на Sera — всё летает!", from: "them", time: "12:08" },
    { id: 2, text: "Да, согласен!", from: "me", time: "12:09" },
  ],
  3: [
    { id: 1, text: "Привет всем!", from: "them", time: "Вчера" },
    { id: 2, text: "Приедете в воскресенье?", from: "them", time: "Вчера" },
  ],
  4: [
    { id: 1, text: "Дедлайн завтра", from: "them", time: "11:30" },
  ],
  5: [
    { id: 1, text: "Ок, понял", from: "them", time: "Пн" },
  ],
};

const Messenger = () => {
  const [activeContact, setActiveContact] = useState(contacts[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => ({
      ...prev,
      [activeContact.id]: [
        ...(prev[activeContact.id] || []),
        { id: Date.now(), text: input.trim(), from: "me", time: now },
      ],
    }));
    setInput("");
  };

  const currentMessages = messages[activeContact.id] || [];

  return (
    <div className="h-screen bg-[#36393f] text-white flex flex-col overflow-hidden">
      {/* Шапка */}
      <div className="bg-[#2f3136] border-b border-[#202225] px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 bg-[#0a84ff] rounded-full flex items-center justify-center">
            <Icon name="MessageCircle" className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">Sera</span>
        </a>
        <div className="w-px h-5 bg-[#40444b]"></div>
        <span className="text-[#b9bbbe] text-sm">Мессенджер</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0a84ff] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">А</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Список контактов */}
        <div className={`${sidebarOpen ? "flex" : "hidden"} md:flex w-full md:w-72 bg-[#2f3136] flex-col flex-shrink-0 absolute md:relative inset-0 z-10 md:z-auto`}>
          {/* Поиск */}
          <div className="p-3 border-b border-[#202225]">
            <div className="bg-[#202225] rounded-lg px-3 py-2 flex items-center gap-2">
              <Icon name="Search" className="w-4 h-4 text-[#72767d]" />
              <span className="text-[#72767d] text-sm">Поиск</span>
            </div>
          </div>

          {/* Контакты */}
          <div className="flex-1 overflow-y-auto p-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => { setActiveContact(contact); setSidebarOpen(false); }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${activeContact.id === contact.id ? "bg-[#393c43]" : "hover:bg-[#393c43]"}`}
              >
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 bg-gradient-to-br ${contact.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-medium text-sm">{contact.avatar}</span>
                  </div>
                  {contact.status === "online" && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#3ba55c] border-2 border-[#2f3136] rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium text-sm truncate">{contact.name}</span>
                    <span className="text-[#72767d] text-xs ml-2 flex-shrink-0">{contact.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[#b9bbbe] text-xs truncate">{contact.lastMsg}</span>
                    {contact.unread > 0 && (
                      <div className="ml-2 w-5 h-5 bg-[#0a84ff] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{contact.unread}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Область чата */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Заголовок чата */}
          <div className="bg-[#36393f] border-b border-[#202225] px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <Button
              variant="ghost"
              className="md:hidden text-[#b9bbbe] hover:text-white hover:bg-[#40444b] p-1"
              onClick={() => setSidebarOpen(true)}
            >
              <Icon name="Menu" className="w-5 h-5" />
            </Button>
            <div className={`w-9 h-9 bg-gradient-to-br ${activeContact.color} rounded-full flex items-center justify-center flex-shrink-0`}>
              <span className="text-white font-medium text-sm">{activeContact.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm">{activeContact.name}</div>
              <div className="text-xs text-[#3ba55c]">{activeContact.status === "online" ? "в сети" : "не в сети"}</div>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="Phone" className="w-5 h-5 text-[#b9bbbe] cursor-pointer hover:text-white" />
              <Icon name="Video" className="w-5 h-5 text-[#b9bbbe] cursor-pointer hover:text-white" />
              <Icon name="MoreVertical" className="w-5 h-5 text-[#b9bbbe] cursor-pointer hover:text-white" />
            </div>
          </div>

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {currentMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${msg.from === "me" ? "bg-[#0a84ff] text-white rounded-br-sm" : "bg-[#2f3136] text-[#dcddde] rounded-bl-sm"}`}>
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.from === "me" ? "text-blue-200" : "text-[#72767d]"} text-right`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Поле ввода */}
          <div className="p-4 border-t border-[#202225] flex-shrink-0">
            <div className="flex items-center gap-3 bg-[#40444b] rounded-xl px-4 py-2">
              <Icon name="Paperclip" className="w-5 h-5 text-[#b9bbbe] cursor-pointer hover:text-white flex-shrink-0" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={`Сообщение ${activeContact.name}...`}
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-[#72767d]"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-8 h-8 p-0 bg-[#0a84ff] hover:bg-[#0066cc] disabled:opacity-30 rounded-lg flex-shrink-0"
              >
                <Icon name="Send" className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messenger;
