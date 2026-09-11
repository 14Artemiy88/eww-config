# Noctalia Конфигурация на основе EWW виджетов

Этот проект содержит конфигурацию **Noctalia 5.0.0**, созданную на основе существующего EWW конфига.

## 📋 Перенесённые виджеты

### ✅ Реализованные через встроенные виджеты Noctalia:

1. **Часы и дата** (`clock`)
   - Формат времени: HH:MM:SS
   - Формат даты: DD.MM.YYYY
   - День недели
   - Тултип с полной датой

2. **Загрузка CPU** (`sysmon`)
   - Общая загрузка CPU с gauge визуализацией
   - График загрузки CPU (graph visualization)
   - 8 отдельных виджетов для каждого ядра
   - Мониторинг RAM

3. **Громкость** (`volume`)
   - Мастер-громкость (output)
   - Громкость микрофона (input)
   - Индикатор mute
   - Скрытие микрофона при неактивности

4. **CAVA Визуализатор** (`audio_visualizer`)
   - 51 полоса (как в оригинале)
   - Зеркальное отображение
   - Центрированные бары
   - Градиентная окраска

### ⚠️ Требующие дополнительной реализации:

5. **Топ приложений** (`top_apps`)
   - Noctalia не имеет встроенного виджета для топ приложений
   - Требуется кастомный скрипт или плагин
   - В конфиге оставлено место для интеграции

## 📁 Структура файлов

```
/workspace/
├── noctalia_config.toml    # Основная конфигурация Noctalia
├── README.md               # Этот файл
├── eww.yuck               # Оригинальный EWW конфиг (для справки)
├── eww.scss               # Оригинальные стили EWW (для справки)
├── src/                   # EWW виджеты (оригинал)
└── styles/                # EWW стили (оригинал)
```

## 🚀 Установка

1. **Установите Noctalia** (следуйте [официальной инструкции](https://docs.noctalia.dev/noctalia/getting-started/installation/))

2. **Скопируйте конфигурацию**:
   ```bash
   mkdir -p ~/.config/noctalia
   cp /workspace/noctalia_config.toml ~/.config/noctalia/config.toml
   ```

3. **Настройте монитор**:
   - Замените `output = "auto"` на ваш монитор (например, `DP-1`, `HDMI-A-1`)
   - Отрегулируйте координаты `cx` и `cy` для desktop widgets

4. **Запустите Noctalia**:
   ```bash
   noctalia run
   ```

## ⚙️ Настройка виджетов

### Часы и дата
```toml
[widget.clock]
format = "{:%H:%M:%S}\n{:%d.%m.%Y}"  # Измените формат по вкусу
vertical_format = "{:%H\n%M\n%S}"     # Для вертикального бара
```

### CPU мониторинг
```toml
[widget.cpu_usage]
type = "sysmon"
stat = "cpu_usage"           # cpu_usage, cpu_core_0-7, ram_used, и т.д.
visualization = "gauge"      # gauge, graph, none
show_value = true
```

### Громкость
```toml
[widget.volume]
type = "volume"
device = "output"            # output или input
show_label = true            # Показывать процент громкости
mute_color = "error"         # Цвет когда muted
```

### CAVA визуализатор
```toml
[widget.audio_vis]
type = "audio_visualizer"
width = 300                  # Ширина в пикселях
bands = 51                   # Количество полос
mirrored = true              # Зеркальное отображение
color_1 = "primary"          # Первый цвет градиента
color_2 = "secondary"        # Второй цвет градиента
```

## 🎨 Темизация

Цвета в конфиге соответствуют оригинальному EWW:
- Primary: `#00CCCC` (циан)
- Secondary: `#FF00FF` (маджента)
- Background: `#070722` (тёмно-синий)
- Surface: `#0F0F1A` (поверхность)
- Error: `#FF5555` (красный)

Измените в секции `[theme.palette]` под вашу тему.

## 🔧 Команды управления громкостью

```bash
# Установка громкости
noctalia msg volume-set 65

# Увеличение/уменьшение
noctalia msg volume-up
noctalia msg volume-up 10
noctalia msg volume-down

# Mute
noctalia msg volume-mute

# Микрофон
noctalia msg mic-volume-set 50
noctalia msg mic-mute
```

## 📝 Примечания

### Desktop Widgets
В оригинальном EWW конфиге виджеты размещаются на рабочем столе в фиксированных позициях. В Noctalia это реализовано через `[desktop_widgets]`. Координаты `cx` и `cy` нужно подобрать под ваше разрешение экрана.

### Топ приложений
EWW виджет `top_apps` показывает топ-5 приложений по CPU и памяти. В Noctalia нет встроенного аналога. Варианты решения:
1. Использовать внешний скрипт и виджет `text`
2. Написать кастомный плагин
3. Использовать IPC для получения данных о процессах

### CAVA
Noctalia использует встроенный `audio_visualizer` виджет, который работает через PipeWire monitor stream. Внешний cava не требуется.

## 🔗 Полезные ссылки

- [Документация Noctalia](https://docs.noctalia.dev/)
- [Bar Widgets](https://docs.noctalia.dev/noctalia/bar/widgets/)
- [System Monitor](https://docs.noctalia.dev/noctalia/services/system-monitor/)
- [Audio Visualizer](https://docs.noctalia.dev/noctalia/bar/widgets/audio-visualizer/)
- [Volume Widget](https://docs.noctalia.dev/noctalia/bar/widgets/volume/)
- [Clock Widget](https://docs.noctalia.dev/noctalia/bar/widgets/clock/)
- [Discord сообщество](https://discord.noctalia.dev)

## 🆘 Troubleshooting

### Виджеты не отображаются
- Проверьте что `enabled = true` в `[bar.main]` и `[desktop_widgets]`
- Убедитесь что `output` соответствует имени вашего монитора
- Проверьте логи: `journalctl --user -f -t noctalia`

### Неправильное позиционирование
- Отрегулируйте `margin_ends`, `margin_edge`, `padding` в `[bar.main]`
- Для desktop widgets измените `cx` и `cy`

### CAVA не работает
- Убедитесь что аудио воспроизводится
- Проверьте настройки PipeWire
- Попробуйте `show_when_idle = true` для отладки

## 📄 Лицензия

Конфигурация создана на основе пользовательского EWW конфига. Noctalia распространяется под MIT лицензией.
