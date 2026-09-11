# Quickshell Widgets (EWW Port)

Полный набор виджетов, перенесенный из конфигурации EWW на фреймворк **Quickshell**. Включает часы, мониторинг системы, погоду (Gismeteo), управление звуком, визуализатор CAVA, медиа-плеер и утилиты.

## 📋 Зависимости

Для работы виджетов необходимо установить следующие пакеты:

### Ubuntu / Debian-based

```bash
# 1. Установка Quickshell (требуется Rust)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
cargo install quickshell

# 2. Системные утилиты
sudo apt update
sudo apt install playerctl pulseaudio-utils cava curl jq libgtk-3-dev libglib2.0-dev libjavascriptcoregtk-4.1-dev libsoup-3.0-dev libwebkit2gtk-4.1-dev procps

# Примечание: Если используется PipeWire вместо PulseAudio, пакет pulseaudio-utils замените на pipewire-pulse
```

### NixOS

Добавьте следующие пакеты в вашу конфигурацию (`configuration.nix` или `home.nix`):

```nix
environment.systemPackages = with pkgs; [
  quickshell
  playerctl
  pavucontrol # или pipewire, pulseaudio
  cava
  curl
  jq
  procps
];
```

Или через `home-manager`:

```nix
home.packages = with pkgs; [
  quickshell
  playerctl
  cava
  curl
  jq
  procps
];
```

## 🔑 Настройка Погоды (Gismeteo)

Виджет погоды использует API Gismeteo, аналогично вашему EWW конфигу.

1. Убедитесь, что у вас есть токен в файле `~/.config/eww/token` (как в оригинале).
   ```bash
   mkdir -p ~/.config/eww
   echo "ВАШ_ТОКЕН_GISMETEO" > ~/.config/eww/token
   chmod 600 ~/.config/eww/token
   ```
   *Если у вас нет токена, виджет попытается использовать демо-режим или вернет ошибку.*

2. Виджет автоматически подхватит токен при запуске.

## 🚀 Установка и Запуск

1. **Скопируйте файлы конфигурации:**
   ```bash
   cp -r /workspace/quickshell_config/* ~/.config/quickshell/
   ```

2. **Проверьте права доступа:**
   ```bash
   chmod +x ~/.config/quickshell/main.tsx
   ```

3. **Запустите оболочку:**
   ```bash
   qs shell
   ```

   Для автозапуска добавьте `qs shell &` в ваш файл запуска Wayland compositor (например, `~/.config/hypr/hyprland.conf` или `~/.config/sway/config`).

## 🧩 Структура Виджетов

| Виджет | Описание | Зависимости |
|--------|----------|-------------|
| **Clock/Date** | Время, дата, день недели | - |
| **SysMon** | Загрузка CPU (8 ядер), RAM, графики | - |
| **TopApps** | Топ-5 процессов по CPU/RAM | `procps` (стандарт) |
| **Volume** | Мастер-громкость, громкость приложений | `pactl` / `pavucontrol` |
| **Cava** | Визуализатор аудио (51 полоса) | `cava` |
| **Weather** | Текущая погода и прогноз (Gismeteo) | `curl`, `jq`, токен |
| **Player** | Управление музыкой (Spotify, Firefox и др.) | `playerctl` |
| **Utils** | Календарь, уведомления, меню питания | - |

## 🎨 Стилизация

Все стили находятся в файле `style.css`. Вы можете менять цвета, шрифты и размеры, редактируя этот файл. Изменения применяются после перезапуска оболочки (`qs quit` -> `qs shell`).

## 🛠 Troubleshooting

- **Погода не работает:** Проверьте наличие токена в `~/.config/eww/token` и доступ к интернету.
- **Нет звука в Cava:** Убедитесь, что `cava` настроен на вывод в `fifo` или совместимый формат. Для полной интеграции может потребоваться настройка вывода cava в fifo файл.
- **Виджеты не видны:** Проверьте логи через `journalctl -f` или запустите `qs shell` в терминале для просмотра ошибок.
