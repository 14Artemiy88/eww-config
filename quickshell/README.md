# Quickshell Widgets Configuration

Конфигурация виджетов для Quickshell на основе EWW конфига.

## Установка

### Ubuntu/Debian

```bash
# Установите Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Установите зависимости
sudo apt update
sudo apt install -y cmake clang libgtk-3-dev libglib2.0-dev libpulse-dev \
    libcairo2-dev libpango1.0-dev libjavascriptcoregtk-4.0-dev \
    libsoup2.4-dev libwebkit2gtk-4.0-dev playerctl cava curl jq

# Установите Quickshell
git clone https://github.com/quickshell-mirror/quickshell.git
cd quickshell
cargo build --release
sudo cp target/release/quickshell /usr/local/bin/
```

### NixOS

```nix
# В configuration.nix или home-manager конфигурации
environment.systemPackages = with pkgs; [
  quickshell
  playerctl
  cava
  curl
  jq
  pactl  # или pipewire
];
```

## Настройка

1. Скопируйте файлы конфигурации:
```bash
cp -r /workspace/quickshell/* ~/.config/quickshell/
```

2. Создайте файл с токеном Gismeteo API:
```bash
mkdir -p ~/.config/eww
echo "YOUR_GISMETEO_TOKEN" > ~/.config/eww/token
```

3. Запустите Quickshell:
```bash
qs shell
```

## Виджеты

| Виджет | Описание | Зависимости |
|--------|----------|-------------|
| ClockWidget | Время в формате HH:MM:SS | - |
| DateWidget | Дата и день недели | - |
| CpuMonitorWidget | Загрузка 8 ядер CPU + RAM + график | /proc/stat |
| VolumeWidget | Управление громкостью с слайдером | pactl/pipewire |
| CavaWidget | 51-полосный аудио визуализатор | cava (опционально) |
| WeatherWidget | Погода от Gismeteo | curl, токен API |
| PlayerWidget | Управление медиаплеером | playerctl |
| TopProcessesWidget | Топ-5 процессов по CPU/RAM | ps |
| CalendarWidget | Календарь (popup) | - |
| PowerMenuWidget | Меню питания (popup) | systemctl, swaylock |

## Структура проекта

```
~/.config/quickshell/
├── shell.qml          # Главный файл
└── widgets/           # Компоненты виджетов
    ├── ClockWidget.qml
    ├── DateWidget.qml
    ├── CpuMonitorWidget.qml
    ├── VolumeWidget.qml
    ├── CavaWidget.qml
    ├── WeatherWidget.qml
    ├── PlayerWidget.qml
    ├── TopProcessesWidget.qml
    ├── CalendarWidget.qml
    └── PowerMenuWidget.qml
```

## Решение проблем

- **Quickshell не запускается**: Убедитесь, что вы используете Wayland сессию
- **Виджеты не отображаются**: Проверьте логи `journalctl -f` при запуске
- **Погода не работает**: Проверьте токен в `~/.config/eww/token`
- **Громкость не меняется**: Убедитесь, что установлен pactl/pipewire
- **CAVA не работает**: Установите пакет `cava` и настройте вывод в совместимом формате

## Примечания

- Все стили используют цветовую схему Dracula
- Виджеты календаря и питания скрыты по умолчанию и могут быть показаны по клику
- CAVA визуализатор работает в демо-режиме (случайные значения), для реального использования требуется интеграция с cava через pipe
