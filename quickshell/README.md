# Quickshell Widgets (EWW Port)

Полный набор виджетов для Quickshell, портированный из EWW конфигурации.

## Виджеты

| Виджет | Описание | Обновление | Зависимости |
|--------|----------|------------|-------------|
| **Clock** | Время в формате HH:MM:SS | 1 сек | - |
| **Date** | Дата и день недели на русском | 1 сек | - |
| **CPU Monitor** | Загрузка CPU и RAM с графиками | 2 сек | - |
| **Volume Control** | Громкость с mute/unmute |实时 | pipewire/pulseaudio |
| **CAVA Visualizer** | 51 полоса частот | 50 мс | cava (опционально) |
| **Weather** | Погода через Gismeteo API | 30 мин | токен Gismeteo |
| **Player** | Управление плеером (MPRIS) | 2 сек | playerctl |
| **Top Apps** | Топ-5 по CPU и RAM | 2 сек | - |

## Установка

### Ubuntu/Debian

```bash
# 1. Установите Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# 2. Установите зависимости
sudo apt update
sudo apt install -y \
    libgtk-3-dev \
    libglib2.0-dev \
    libjavascriptcoregtk-4.1-dev \
    libsoup-3.0-dev \
    playerctl \
    cava \
    curl \
    jq

# 3. Установите Quickshell
git clone https://github.com/quickshell-mirror/quickshell.git
cd quickshell
cargo build --release
sudo cp target/release/quickshell /usr/local/bin/

# 4. Настройте токен Gismeteo
mkdir -p ~/.config/eww
echo "YOUR_GISMETEO_TOKEN" > ~/.config/eww/token

# 5. Скопируйте конфиг
cp -r /workspace/quickshell/* ~/.config/quickshell/

# 6. Запустите
qs shell
```

### NixOS

#### Через environment.systemPackages (глобально)

```nix
environment.systemPackages = with pkgs; [
  quickshell
  playerctl
  cava
  curl
  jq
];
```

#### Через Home Manager (рекомендуется)

```nix
{ pkgs, ... }: {
  home.packages = with pkgs; [
    quickshell
    playerctl
    cava
    curl
    jq
  ];

  # Настройка токена
  home.file.".config/eww/token".text = "YOUR_GISMETEO_TOKEN";

  # Копирование конфига
  xdg.configFile."quickshell".source = /workspace/quickshell;
}
```

После применения конфигурации:
```bash
qs shell
```

## Настройка токена Gismeteo

1. Получите токен на https://gismeteo.ru/api/
2. Создайте файл `~/.config/eww/token`
3. Вставьте токен в файл (одной строкой)
4. Убедитесь, что права доступа: `chmod 600 ~/.config/eww/token`

## Troubleshooting

### Виджеты не отображаются
- Проверьте, что Wayland композитор запущен
- Убедитесь, что `qs shell` выполняется без ошибок

### Погода не работает
- Проверьте наличие токена в `~/.config/eww/token`
- Убедитесь, что есть подключение к интернету

### CAVA не работает
- Установите `cava`: `sudo apt install cava`
- Для реальной визуализации нужно настроить вывод cava в pipe

### Громкость не меняется
- Убедитесь, что установлен pipewire или pulseaudio
- Проверьте работу `pactl` в терминале

## Структура файлов

```
~/.config/quickshell/
├── main.tsx      # Основной код виджетов
└── style.css     # Стили
```

## Отличия от EWW

- Используется TypeScript/JSX вместо Yuck
- CSS вместо SCSS
- Быстрая загрузка благодаря нативному GTK
- Лучшая интеграция с Wayland
