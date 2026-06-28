import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { register, login, saveSession } from "@/lib/seraApi";

interface AuthProps {
  onAuth: () => void;
}

const Auth = ({ onAuth }: AuthProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let result;
      if (mode === "register") {
        result = await register(firstName, lastName, email, password);
      } else {
        result = await login(email, password);
      }
      saveSession(result.token, result.user);
      onAuth();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#36393f] flex flex-col items-center justify-center p-4">
      {/* Логотип */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#0a84ff] rounded-full flex items-center justify-center">
          <Icon name="MessageCircle" className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-white">Sera</span>
      </div>

      <div className="w-full max-w-sm bg-[#2f3136] rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white text-center mb-1">
          {mode === "login" ? "Добро пожаловать!" : "Создать аккаунт"}
        </h2>
        <p className="text-[#b9bbbe] text-sm text-center mb-6">
          {mode === "login" ? "Войдите, чтобы продолжить" : "Заполните данные для регистрации"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[#8e9297] text-xs font-semibold uppercase tracking-wide block mb-1">Имя</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Иван"
                  required
                  className="w-full bg-[#202225] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0a84ff] placeholder-[#72767d]"
                />
              </div>
              <div className="flex-1">
                <label className="text-[#8e9297] text-xs font-semibold uppercase tracking-wide block mb-1">Фамилия</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Иванов"
                  required
                  className="w-full bg-[#202225] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0a84ff] placeholder-[#72767d]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[#8e9297] text-xs font-semibold uppercase tracking-wide block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ivan@example.com"
              required
              className="w-full bg-[#202225] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0a84ff] placeholder-[#72767d]"
            />
          </div>

          <div>
            <label className="text-[#8e9297] text-xs font-semibold uppercase tracking-wide block mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#202225] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0a84ff] placeholder-[#72767d]"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-lg px-3 py-2 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0a84ff] hover:bg-[#0066cc] text-white py-2.5 rounded-lg font-medium mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <Icon name="Loader" className="w-4 h-4 animate-spin" />
                {mode === "login" ? "Входим..." : "Регистрируем..."}
              </span>
            ) : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-[#b9bbbe] text-sm">
            {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
          </span>
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="text-[#0a84ff] text-sm font-medium hover:underline"
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </div>
      </div>

      <a href="/" className="mt-6 text-[#72767d] text-sm hover:text-[#b9bbbe] transition-colors flex items-center gap-1">
        <Icon name="ArrowLeft" className="w-4 h-4" />
        На главную
      </a>
    </div>
  );
};

export default Auth;
