import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Auth from "./Auth";
import { getSavedUser, clearSession, getUsers, getChat, sendMessage, SeraUser, SeraMessage } from "@/lib/seraApi";

const Messenger = () => {
  const [user, setUser] = useState<SeraUser | null>(getSavedUser());
  const [contacts, setContacts] = useState<SeraUser[]>([]);
  const [activeContact, setActiveContact] = useState<SeraUser | null>(null);
  const [messages, setMessages] = useState<SeraMessage[]>([]);
  const [myId, setMyId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    getUsers().then(setContacts).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!activeContact) return;
    setLoadingChat(true);
    getChat(activeContact.id).then((data) => {
      setMessages(data.messages);
      setMyId(data.my_id);
      setLoadingChat(false);
    }).catch(() => setLoadingChat(false));
  }, [activeContact]);

  useEffect(() => {
    if (!activeContact) return;
    const interval = setInterval(() => {
      getChat(activeContact.id).then((data) => {
        setMessages(data.messages);
        setMyId(data.my_id);
      }).catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [activeContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeContact) return;
    const text = input.trim();
    setInput("");
    try {
      await sendMessage(activeContact.id, text);
      const data = await getChat(activeContact.id);
      setMessages(data.messages);
      setMyId(data.my_id);
    } catch (_e) {
      console.error(_e);
    }
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
  };

  if (!user) {
    return <Auth onAuth={() => setUser(getSavedUser())} />;
  }

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
        <span className="text-[#b9bbbe] text-sm hidden sm:block">Мессенджер</span>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0a84ff] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{user.first_name[0]}</span>
            </div>
            <span className="text-white text-sm font-medium hidden sm:block">{user.first_name} {user.last_name}</span>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-[#b9bbbe] hover:text-white hover:bg-[#40444b] p-2">
            <Icon name="LogOut" className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Список контактов */}
        <div className={`${sidebarOpen ? "flex" : "hidden"} md:flex w-full md:w-72 bg-[#2f3136] flex-col flex-shrink-0 absolute md:relative inset-0 z-10 md:z-auto`}>
          <div className="p-3 border-b border-[#202225]">
            <div className="bg-[#202225] rounded-lg px-3 py-2 flex items-center gap-2">
              <Icon name="Search" className="w-4 h-4 text-[#72767d]" />
              <span className="text-[#72767d] text-sm">Поиск пользователей</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {contacts.length === 0 ? (
              <div className="text-center text-[#72767d] text-sm mt-8 px-4">
                <Icon name="Users" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Пока нет других пользователей</p>
                <p className="text-xs mt-1">Попроси друга зарегистрироваться в Sera</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => { setActiveContact(contact); setSidebarOpen(false); }}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${activeContact?.id === contact.id ? "bg-[#393c43]" : "hover:bg-[#393c43]"}`}
                >
                  <div className="w-10 h-10 bg-[#0a84ff] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-sm">{contact.first_name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm truncate">{contact.first_name} {contact.last_name}</div>
                    <div className="text-[#72767d] text-xs truncate">{contact.email}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Область чата */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!activeContact ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-[#2f3136] rounded-full flex items-center justify-center mb-4">
                <Icon name="MessageCircle" className="w-10 h-10 text-[#0a84ff]" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Выбери собеседника</h3>
              <p className="text-[#72767d] text-sm max-w-xs">Выбери пользователя слева, чтобы начать переписку</p>
              <Button
                className="md:hidden mt-4 bg-[#0a84ff] hover:bg-[#0066cc] text-white"
                onClick={() => setSidebarOpen(true)}
              >
                <Icon name="Users" className="w-4 h-4 mr-2" />
                Открыть контакты
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-[#36393f] border-b border-[#202225] px-4 py-3 flex items-center gap-3 flex-shrink-0">
                <Button
                  variant="ghost"
                  className="md:hidden text-[#b9bbbe] hover:text-white hover:bg-[#40444b] p-1"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Icon name="Menu" className="w-5 h-5" />
                </Button>
                <div className="w-9 h-9 bg-[#0a84ff] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-sm">{activeContact.first_name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm">{activeContact.first_name} {activeContact.last_name}</div>
                  <div className="text-xs text-[#3ba55c]">в сети</div>
                </div>
                <Icon name="Phone" className="w-5 h-5 text-[#b9bbbe] cursor-pointer hover:text-white" />
                <Icon name="Video" className="w-5 h-5 text-[#b9bbbe] cursor-pointer hover:text-white ml-2" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loadingChat ? (
                  <div className="flex justify-center items-center h-full">
                    <Icon name="Loader" className="w-6 h-6 text-[#0a84ff] animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-14 h-14 bg-[#2f3136] rounded-full flex items-center justify-center mb-3">
                      <span className="text-2xl">{activeContact.first_name[0]}</span>
                    </div>
                    <p className="text-white font-semibold">{activeContact.first_name} {activeContact.last_name}</p>
                    <p className="text-[#72767d] text-sm mt-1">Начни переписку первым!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === myId ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${msg.sender_id === myId ? "bg-[#0a84ff] text-white rounded-br-sm" : "bg-[#2f3136] text-[#dcddde] rounded-bl-sm"}`}>
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender_id === myId ? "text-blue-200" : "text-[#72767d]"} text-right`}>{msg.time}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-[#202225] flex-shrink-0">
                <div className="flex items-center gap-3 bg-[#40444b] rounded-xl px-4 py-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={`Сообщение для ${activeContact.first_name}...`}
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder-[#72767d]"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-8 h-8 p-0 bg-[#0a84ff] hover:bg-[#0066cc] disabled:opacity-30 rounded-lg flex-shrink-0"
                  >
                    <Icon name="Send" className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messenger;