import React from 'react';
import { Zap, Scale, Sparkles } from 'lucide-react';

export const HELP_TOPICS = {
    wallet: {
        title: "Ресурсы Экспедиции",
        content: (
            <div className="space-y-3 text-sm text-gray-300">
                <p>Ваши ресурсы для выживания в Нутри-Экспедиции:</p>
                <ul className="space-y-2">
                    <li className="flex gap-2">
                        <Zap size={16} className="text-yellow-400 shrink-0" />
                        <span>
                            <strong className="text-white">Энергия:</strong> Топливо для движения. Начисляется за попадание в калораж и употребление белка. Нужна для перехода к следующим точкам.
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <Scale size={16} className="text-blue-400 shrink-0" />
                        <span>
                            <strong className="text-white">Баланс:</strong> Качество снаряжения. Дается за клетчатку, омега-3 и разнообразие. Открывает пассивные бонусы.
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <Sparkles size={16} className="text-purple-400 shrink-0" />
                        <span>
                            <strong className="text-white">Токены:</strong> Ваша ментальная стойкость. Используются для "заморозки" стрика, если вы пропустили день.
                        </span>
                    </li>
                </ul>
            </div>
        )
    },
    rank: {
        title: "Система Рангов",
        content: (
            <div className="space-y-3 text-sm text-gray-300">
                <p>Ваш уровень опыта (XP) определяет статус в Экспедиции.</p>
                <p>XP = Энергия + Баланс.</p>
                <div className="bg-gray-700/50 p-2 rounded-lg border border-gray-600/50">
                    <p className="mb-1 text-white font-bold">Текущий прогресс:</p>
                    <p>Чем выше ранг, тем сложнее маршруты и ценнее награды в конце Сезона.</p>
                </div>
            </div>
        )
    },
    map: {
        title: "Карта Экспедиции",
        content: (
            <div className="space-y-3 text-sm text-gray-300">
                <p>Каждый <strong>Сезон</strong> длится 28 дней (4 недели).</p>
                <ul className="list-disc list-inside space-y-1 ml-1">
                    <li><strong>Точки:</strong> Это дни. Чтобы пройти точку, нужно выполнить 3 условия:</li>
                    <ul className="ml-4 mt-1 space-y-1 text-xs text-gray-400">
                        <li>• Минимум 2 приема пищи</li>
                        <li>• Хотя бы 1 фото</li>
                        <li>• 1 качественная тарелка (Оценка A или S)</li>
                    </ul>
                    <li className="mt-2"><strong>Лагерь (Camp):</strong> Конец недели (каждый 7-й день). Дает большую награду.</li>
                </ul>
            </div>
        )
    },
    quests: {
        title: "Ежедневные Квесты",
        content: (
            <div className="space-y-3 text-sm text-gray-300">
                <p>Мини-задания, которые обновляются каждое утро.</p>
                <p>Выполнение квестов — самый быстрый способ накопить <strong>Энергию</strong> и <strong>Баланс</strong>.</p>
                <p className="italic text-gray-400">Совет: Квест "Дневник" выполняется автоматически, если вы просто фотографируете еду.</p>
            </div>
        )
    },
    habits: {
        title: "Привычки",
        content: (
            <div className="space-y-3 text-sm text-gray-300">
                <p>Долгосрочные цели, которые формируют ваш образ жизни.</p>
                <p>В отличие от квестов, привычки не сбрасываются каждый день. Чем дольше вы их поддерживаете, тем выше ваш статус.</p>
            </div>
        )
    }
};

export type HelpTopicKey = keyof typeof HELP_TOPICS;