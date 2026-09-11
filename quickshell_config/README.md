# Quickshell Widgets Configuration

Полный набор виджетов для Quickshell на основе EWW конфигурации.

## 📋 Виджеты

### 1. Часы и Дата (`TimeWidget`, `DateWidget`)
- Время в формате HH:MM:SS с обновлением каждую секунду
- Дата в формате DD.MM.YYYY
- День недели на русском языке

### 2. Монитор CPU/RAM (`CpuMonitor`)
- Загрузка процессора и оперативной памяти в реальном времени
- Исторический график из 50 точек
- Обновление каждые 2 секунды

### 3. Управление громкостью (`VolumeControl`)
- Слайдер громкости (0-100%)
- Кнопка mute/unmute
- Использование `pactl` для управления

### 4. Визуализатор CAVA (`CavaVisualizer`)
- 51 полоса частот
- Обновление ~20 FPS
- Градиентная раскраска

### 5. Погода (`WeatherNow`, `WeatherDay`, `WeatherWeek`)
- **Текущая погода**: температура, описание, ветер, давление
- **Прогноз на день**: по часам на 2 дня
- **Прогноз на неделю**: на 5 дней с макс/мин температурой
- Использует Gismeteo API с токеном из `$HOME/.config/eww/token`
- Кэширование на 10 минут для текущей погоды
- Кэширование на 1 час для прогнозов

### 6. Музыкальный плеер (`PlayerWidget`)
- Название трека, исполнитель, альбом
- Кнопки управления: предыдущий, play/pause, следующий
- Прогресс-бар с перемоткой
- Использует `playerctl`

### 7. Топ приложений (`TopAppsWidget`)
- Топ-5 приложений по загрузке CPU
- Топ-5 приложений по потреблению памяти
- Обновление каждые 2 секунды

### 8. Календарь (`CalendarWidget`)
- Стандартный GTK календарь
- Выделение текущего дня

### 9. Меню питания (`PowerMenu`)
- Блокировка сессии
- Приостановка (suspend)
- Перезагрузка
- Выключение

## 🔧 Требования

```bash
# Quickshell
yay -S quickshell-git  # или через другой AUR helper

# Для погоды (Gismeteo API)
# Токен должен быть в ~/.config/eww/token

# Для управления громкостью
sudo pacman -S pulseaudio-alsa  # или pipewire

# Для визуализатора
sudo pacman -S cava

# Для плеера
sudo pacman -S playerctl

# Утилиты
sudo pacman -S jq curl  # для скриптов
```

## 🚀 Установка

```bash
# Скопируйте конфиг в директорию Quickshell
cp -r /workspace/quickshell_config/* ~/.config/quickshell/

# Или создайте символические ссылки
ln -s /workspace/quickshell_config/main.tsx ~/.config/quickshell/main.tsx
ln -s /workspace/quickshell_config/style.css ~/.config/quickshell/style.css
```

## ▶️ Запуск

```bash
# Запустить оболочку
qs shell

# Перезапустить
qs reload

# Остановить
qs quit
```

## ⚙️ Настройка

### Токен Gismeteo
Создайте файл с токеном:
```bash
mkdir -p ~/.config/eww
echo "YOUR_GISMETEO_TOKEN" > ~/.config/eww/token
chmod 600 ~/.config/eww/token
```

### Позиционирование
Измените координаты в `MainPanel`:
```typescript
super({
    name: "main-panel",
    anchor: ["top", "left"],  // якорь
    x: 5,                      // отступ по X
    y: 5,                      // отступ по Y
    // ...
});
```

### Интервалы обновления
- Погода (текущая): 10 минут
- Погода (прогноз): 1 час
- CPU/RAM: 2 секунды
- Плеер: 1 секунда
- Топ приложений: 2 секунды
- CAVA: 50мс (20 FPS)

## 🎨 Стилизация

Все стили находятся в `style.css`. Основные классы:
- `.clock-widget`, `.time-label` - часы
- `.date-widget`, `.date-label` - дата
- `.cpu-monitor` - монитор CPU
- `.volume-control` - громкость
- `.cava-visualizer` - визуализатор
- `.weather-now`, `.weather-day`, `.weather-week` - погода
- `.player-widget` - плеер
- `.top-apps` - топ приложений
- `.calendar-widget` - календарь
- `.power-menu` - меню питания

## 📝 Примечания

1. **CAVA**: Для корректной работы требуется настройка cava с выводом в raw формате. Текущая реализация использует эмуляцию данных.

2. **Погода**: Использует тот же API и токен, что и оригинальный EWW конфиг. Код города жестко задан (4517 - Москва).

3. **Топ приложений**: Упрощенная версия через `ps aux`. Для более точных данных можно использовать специализированные утилиты.

4. **Quickshell API**: Некоторые методы могут отличаться в зависимости от версии Quickshell. Проверьте документацию для вашей версии.

## 🔗 Ссылки

- [Quickshell GitHub](https://github.com/quickshell/quickshell)
- [Оригинальный EWW конфиг](../eww.yuck)
- [Gismeteo API Documentation](https://api.gismeteo.net/)
