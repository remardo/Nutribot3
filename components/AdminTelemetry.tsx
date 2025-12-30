import React, { useEffect, useMemo, useState } from "react";
import { convexClient } from "../services/convexClient";
import { RefreshCw, Users, Activity, Filter } from "lucide-react";

type TelemetryEvent = {
  _id?: string;
  userId: string;
  type: string;
  payload: any;
  createdAt: number;
};

const REFRESH_MS = 5000;
const LIMIT = 200;

const safeStringify = (value: any, maxLen = 500) => {
  try {
    const text = JSON.stringify(value);
    if (text.length <= maxLen) return text;
    return `${text.slice(0, maxLen)}…`;
  } catch (err) {
    return "[unserializable]";
  }
};

const AdminTelemetry: React.FC = () => {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  const load = async () => {
    if (!convexClient) {
      setErrorText("Convex не настроен. Укажите VITE_CONVEX_URL.");
      return;
    }
    setErrorText(null);
    setIsLoading(true);
    try {
      const rows = await (convexClient as any).query("telemetry:listRecent", {
        limit: LIMIT,
      });
      setEvents(rows || []);
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const type = typeFilter.trim().toLowerCase();
    const user = userFilter.trim().toLowerCase();
    return events.filter((e) => {
      const typeOk = !type || e.type.toLowerCase().includes(type);
      const userOk = !user || e.userId.toLowerCase().includes(user);
      return typeOk && userOk;
    });
  }, [events, typeFilter, userFilter]);

  const stats = useMemo(() => {
    const uniqueUsers = new Set(events.map((e) => e.userId)).size;
    const byType: Record<string, number> = {};
    events.forEach((e) => {
      byType[e.type] = (byType[e.type] || 0) + 1;
    });
    const typesSorted = Object.entries(byType).sort((a, b) => b[1] - a[1]);
    return { uniqueUsers, typesSorted };
  }, [events]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs text-gray-400">Admin</div>
            <h1 className="text-2xl font-bold text-white">Панель телеметрии</h1>
            <div className="text-sm text-gray-400">Последние события приложения</div>
          </div>
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 hover:bg-gray-800 text-sm"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Обновить
          </button>
        </header>

        {errorText && (
          <div className="bg-red-900/20 border border-red-700/40 text-red-300 px-4 py-3 rounded-lg">
            {errorText}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <Activity size={14} /> Всего событий
            </div>
            <div className="text-2xl font-bold mt-2">{events.length}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <Users size={14} /> Уникальных пользователей
            </div>
            <div className="text-2xl font-bold mt-2">{stats.uniqueUsers}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <Filter size={14} /> Топ типов
            </div>
            <div className="mt-2 space-y-1">
              {stats.typesSorted.slice(0, 3).map(([type, count]) => (
                <div key={type} className="text-sm text-gray-200 flex justify-between">
                  <span className="truncate">{type}</span>
                  <span className="text-gray-400">{count}</span>
                </div>
              ))}
              {stats.typesSorted.length === 0 && (
                <div className="text-sm text-gray-500">Нет данных</div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              placeholder="Фильтр по типу"
              className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200"
            />
            <input
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              placeholder="Фильтр по userId"
              className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="py-2 pr-4">Время</th>
                  <th className="py-2 pr-4">Тип</th>
                  <th className="py-2 pr-4">UserId</th>
                  <th className="py-2">Payload</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e._id || `${e.userId}-${e.createdAt}`} className="border-b border-gray-900">
                    <td className="py-2 pr-4 text-gray-300">
                      {new Date(e.createdAt).toLocaleString("ru-RU")}
                    </td>
                    <td className="py-2 pr-4 text-blue-300">{e.type}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-gray-300">{e.userId}</td>
                    <td className="py-2 text-xs text-gray-400">
                      <pre className="whitespace-pre-wrap break-words">
                        {safeStringify(e.payload)}
                      </pre>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      События не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminTelemetry;
