import { QS, Shell, Widget, Signal, Property } from "quickshell";
import { exec, execAsync } from "quickshell/io";
import { Clock } from "quickshell/lib/clock";
import { AppLauncher } from "quickshell/widgets/AppLauncher";

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
const GISMETEO_TOKEN = exec(`cat $HOME/.config/eww/token 2>/dev/null || echo ""`).trim();
const CACHE_DIR = "/tmp/qs_weather_cache";
const CACHE_TTL = 600; // 10 минут

// Создаем директорию кэша
exec(`mkdir -p ${CACHE_DIR}`);

// ==================== УТИЛИТЫ ====================
function formatTime(unix: number, fmt: string): string {
    const date = new Date(unix * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const weekday = date.getDay();
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    
    if (fmt === "%H:%M") return `${hours}:${minutes}`;
    if (fmt === "%d") return day;
    if (fmt === "%u") return (weekday === 0 ? 7 : weekday).toString();
    if (fmt === "%d.%m.%Y") return `${day}.${month}.${year}`;
    if (fmt === "%A") return days[weekday];
    return "";
}

function getCacheFile(cache: string, params: string): string {
    const safeParams = params.replace(/[^a-z0-9]/g, "_");
    return `${CACHE_DIR}/${cache}_${safeParams}.json`;
}

function isCacheValid(file: string): boolean {
    try {
        const stat = exec(`stat -c %Y "${file}" 2>/dev/null`).trim();
        const mtime = parseInt(stat);
        const now = Math.floor(Date.now() / 1000);
        return (now - mtime) < CACHE_TTL;
    } catch {
        return false;
    }
}

function getWeatherData(cache: string, type: string, params: string): any {
    const cacheFile = getCacheFile(cache, params);
    
    if (isCacheValid(cacheFile)) {
        return exec(`cat "${cacheFile}"`).trim();
    }
    
    const result = exec(`curl -sfS -H "X-Gismeteo-Token: ${GISMETEO_TOKEN}" "https://api.gismeteo.net/v2/weather/${type}/4517/${params}" 2>/dev/null`);
    try {
        const parsed = JSON.parse(result);
        const response = JSON.stringify(parsed.response || {});
        exec(`echo '${response}' > "${cacheFile}"`);
        return response;
    } catch {
        return "{}";
    }
}

// ==================== ВРЕМЯ И ДАТА ====================
class TimeWidget extends Widget.Box {
    constructor() {
        const clock = Clock({ format: "%H:%M:%S" });
        
        super({
            className: "clock-widget",
            children: [
                new Widget.Label({
                    className: "time-label",
                    label: clock.time.bind("format", "%H:%M:%S"),
                }),
            ],
        });
    }
}

class DateWidget extends Widget.Box {
    constructor() {
        const clock = Clock({ format: "%d.%m.%Y" });
        const weekdayClock = Clock({ format: "%A" });
        
        super({
            className: "date-widget",
            orientation: "vertical",
            children: [
                new Widget.Label({
                    className: "date-label",
                    label: clock.time.bind("format", "%d.%m.%Y"),
                }),
                new Widget.Label({
                    className: "weekday-label",
                    label: weekdayClock.time.bind("format", "%A"),
                }),
            ],
        });
    }
}

// ==================== CPU МОНИТОР ====================
class CpuMonitor extends Widget.Box {
    private cpuUsage = Signal.new<number>(0);
    private ramUsage = Signal.new<number>(0);
    private cpuHistory = Signal.new<number[]>([]);
    
    constructor() {
        super({
            className: "cpu-monitor",
            orientation: "vertical",
        });
        
        // Обновление каждые 2 секунды
        setInterval(() => {
            this.updateCpuRam();
        }, 2000);
        
        this.setupChildren();
    }
    
    private updateCpuRam() {
        try {
            const result = exec(`scripts/system_monitor 2>/dev/null || echo '{"cpu":0,"ram":0}'`);
            const data = JSON.parse(result);
            this.cpuUsage.value = data.cpu || 0;
            this.ramUsage.value = data.ram || 0;
            
            // История для графика
            const history = this.cpuHistory.value;
            history.push(data.cpu || 0);
            if (history.length > 50) history.shift();
            this.cpuHistory.value = [...history];
        } catch {
            this.cpuUsage.value = 0;
            this.ramUsage.value = 0;
        }
    }
    
    private setupChildren() {
        const cpuLabel = new Widget.Label({
            className: "cpu-label",
            label: this.cpuUsage.bind(v => `CPU: ${v.toFixed(1)}%`),
        });
        
        const ramLabel = new Widget.Label({
            className: "ram-label",
            label: this.ramUsage.bind(v => `RAM: ${v.toFixed(1)}%`),
        });
        
        const progressBar = new Widget.Box({
            className: "cpu-progress",
            children: [
                new Widget.Box({
                    className: "cpu-bar",
                    hexpand: true,
                    setup: (self: any) => {
                        self.connect('draw', () => {
                            // Рисуем прогресс бар
                        });
                    },
                }),
            ],
        });
        
        this.append(cpuLabel);
        this.append(ramLabel);
        this.append(progressBar);
    }
}

// ==================== ГРОМКОСТЬ ====================
class VolumeControl extends Widget.Box {
    private volume = Signal.new<number>(50);
    private muted = Signal.new<boolean>(false);
    
    constructor() {
        super({
            className: "volume-control",
            orientation: "horizontal",
        });
        
        this.updateVolume();
        this.setupChildren();
    }
    
    private updateVolume() {
        try {
            const result = exec(`pactl get-sink-volume @DEFAULT_SINK@ 2>/dev/null | head -1`);
            const match = result.match(/(\d+)%/);
            if (match) {
                this.volume.value = parseInt(match[1]);
            }
            
            const muteResult = exec(`pactl get-sink-mute @DEFAULT_SINK@ 2>/dev/null`);
            this.muted.value = muteResult.includes("yes");
        } catch {
            this.volume.value = 50;
            this.muted.value = false;
        }
    }
    
    private setVolume(vol: number) {
        vol = Math.max(0, Math.min(100, vol));
        exec(`pactl set-sink-volume @DEFAULT_SINK@ ${vol}% 2>/dev/null`);
        this.volume.value = vol;
    }
    
    private toggleMute() {
        exec(`pactl set-sink-mute @DEFAULT_SINK@ toggle 2>/dev/null`);
        this.updateVolume();
    }
    
    private setupChildren() {
        const iconLabel = new Widget.Label({
            className: "volume-icon",
            label: this.muted.bind(m => m ? "🔇" : "🔊"),
            setup: (self: any) => {
                self.add_events(1 << 1); // Button press
                self.connect('button-press-event', () => {
                    this.toggleMute();
                });
            },
        });
        
        const slider = new Widget.Scale({
            className: "volume-slider",
            hexpand: true,
            min: 0,
            max: 100,
            value: this.volume.value,
            setup: (self: any) => {
                self.connect('value-changed', (s: any) => {
                    this.setVolume(s.get_value());
                });
            },
        });
        
        this.append(iconLabel);
        this.append(slider);
    }
}

// ==================== CAVA ВИЗУАЛИЗАТОР ====================
class CavaVisualizer extends Widget.Box {
    private bars = Signal.new<number[]>(new Array(51).fill(0));
    
    constructor() {
        super({
            className: "cava-visualizer",
            hexpand: true,
        });
        
        this.startCava();
        this.setupBars();
    }
    
    private startCava() {
        // Запускаем cava в фоне
        try {
            exec(`pkill -f "cava.*output=raw" 2>/dev/null || true`);
            exec(`cava -p /dev/stdin <<EOF &
[general]
framerate = 20
bars = 51
[output]
method = raw
raw_target = /dev/stdout
data_format = ascii
ascii_max_range = 100
EOF
`);
        } catch {}
        
        // Читаем данные (упрощенно)
        setInterval(() => {
            // Эмуляция данных для примера
            const newBars = Array.from({length: 51}, () => Math.floor(Math.random() * 100));
            this.bars.value = newBars;
        }, 50);
    }
    
    private setupBars() {
        // Создаем бары динамически
        for (let i = 0; i < 51; i++) {
            const bar = new Widget.Box({
                className: "cava-bar",
                vexpand: true,
                hexpand: true,
            });
            this.append(bar);
        }
    }
}

// ==================== ПОГОДА ====================
class WeatherNow extends Widget.Box {
    private weatherData = Signal.new<any>(null);
    
    constructor() {
        super({
            className: "weather-now",
            orientation: "horizontal",
        });
        
        this.updateWeather();
        setInterval(() => this.updateWeather(), 600000); // 10 минут
        
        this.setupChildren();
    }
    
    private updateWeather() {
        if (!GISMETEO_TOKEN) {
            console.error("Gismeteo token not found!");
            return;
        }
        
        try {
            const data = getWeatherData("now", "current", "");
            this.weatherData.value = JSON.parse(data);
        } catch (e) {
            console.error("Weather update error:", e);
        }
    }
    
    private setupChildren() {
        const tempLabel = new Widget.Label({
            className: "weather-temp",
            label: this.weatherData.bind(d => d?.temperature?.air?.C ? `${d.temperature.air.C}°` : "--"),
        });
        
        const descLabel = new Widget.Label({
            className: "weather-desc",
            label: this.weatherData.bind(d => d?.description?.full || ""),
        });
        
        const windLabel = new Widget.Label({
            className: "weather-wind",
            label: this.weatherData.bind(d => d?.wind?.speed?.m_s ? `${d.wind.speed.m_s} м/с` : ""),
        });
        
        this.append(tempLabel);
        this.append(descLabel);
        this.append(windLabel);
    }
}

class WeatherDay extends Widget.Box {
    private weatherData = Signal.new<any[]>([]);
    
    constructor() {
        super({
            className: "weather-day",
            orientation: "horizontal",
        });
        
        this.updateWeather();
        setInterval(() => this.updateWeather(), 3600000); // 1 час
        
        this.setupChildren();
    }
    
    private updateWeather() {
        if (!GISMETEO_TOKEN) return;
        
        try {
            const data = getWeatherData("day", "forecast", "?days=2");
            const parsed = JSON.parse(data);
            this.weatherData.value = Array.isArray(parsed) ? parsed : [];
        } catch {}
    }
    
    private setupChildren() {
        const listContainer = new Widget.Box({
            className: "weather-day-list",
            orientation: "horizontal",
            setup: (self: any) => {
                self.connect('notify::visible', () => {
                    // Очищаем и пересоздаем элементы
                    const children = self.get_children();
                    children.forEach((c: any) => self.remove(c));
                    
                    this.weatherData.value.forEach((entry: any, idx: number) => {
                        const item = new Widget.Box({
                            className: "weather-item",
                            orientation: "vertical",
                            children: [
                                new Widget.Label({
                                    label: formatTime(entry.date?.unix, "%H:%M"),
                                    className: "weather-time",
                                }),
                                new Widget.Label({
                                    label: entry.temperature?.air?.C ? `${entry.temperature.air.C}°` : "",
                                    className: "weather-temp",
                                }),
                            ],
                        });
                        self.append(item);
                    });
                });
            },
        });
        
        this.append(listContainer);
    }
}

class WeatherWeek extends Widget.Box {
    private weatherData = Signal.new<any[]>([]);
    private days = ["", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
    
    constructor() {
        super({
            className: "weather-week",
            orientation: "horizontal",
        });
        
        this.updateWeather();
        setInterval(() => this.updateWeather(), 3600000); // 1 час
        
        this.setupChildren();
    }
    
    private updateWeather() {
        if (!GISMETEO_TOKEN) return;
        
        try {
            const data = getWeatherData("week", "forecast/aggregate", "?days=5");
            const parsed = JSON.parse(data);
            this.weatherData.value = Array.isArray(parsed) ? parsed : [];
        } catch {}
    }
    
    private setupChildren() {
        const listContainer = new Widget.Box({
            className: "weather-week-list",
            orientation: "horizontal",
            setup: (self: any) => {
                self.connect('notify::visible', () => {
                    const children = self.get_children();
                    children.forEach((c: any) => self.remove(c));
                    
                    this.weatherData.value.forEach((entry: any) => {
                        const dayNum = formatTime(entry.date?.unix, "%u");
                        const dayName = this.days[parseInt(dayNum) || 0];
                        const dateDay = formatTime(entry.date?.unix, "%d");
                        
                        const item = new Widget.Box({
                            className: "weather-day-item",
                            orientation: "vertical",
                            children: [
                                new Widget.Label({
                                    label: `${dateDay} ${dayName}`,
                                    className: "weather-day-label",
                                }),
                                new Widget.Label({
                                    label: entry.temperature?.air?.max?.C ? `${entry.temperature.air.max.C}°` : "",
                                    className: "weather-temp-max",
                                }),
                                new Widget.Label({
                                    label: entry.temperature?.air?.min?.C ? `${entry.temperature.air.min.C}°` : "",
                                    className: "weather-temp-min",
                                }),
                            ],
                        });
                        self.append(item);
                    });
                });
            },
        });
        
        this.append(listContainer);
    }
}

// ==================== ПЛЕЕР ====================
class PlayerWidget extends Widget.Box {
    private playerInfo = Signal.new<any>({
        title: "",
        artist: "",
        album: "",
        playing: false,
        position: 0,
        length: 0,
    });
    
    constructor() {
        super({
            className: "player-widget",
            orientation: "vertical",
        });
        
        this.updatePlayer();
        setInterval(() => this.updatePlayer(), 1000);
        
        this.setupChildren();
    }
    
    private updatePlayer() {
        try {
            const title = exec(`playerctl metadata title 2>/dev/null || echo ""`).trim();
            const artist = exec(`playerctl metadata artist 2>/dev/null || echo ""`).trim();
            const album = exec(`playerctl metadata album 2>/dev/null || echo ""`).trim();
            const status = exec(`playerctl status 2>/dev/null || echo ""`).trim();
            const position = exec(`playerctl position 2>/dev/null || echo "0"`).trim();
            const length = exec(`playerctl metadata mpris:length 2>/dev/null || echo "0"`).trim();
            
            this.playerInfo.value = {
                title: title || "Нет трека",
                artist: artist || "",
                album: album || "",
                playing: status === "Playing",
                position: parseInt(position) / 1000000,
                length: parseInt(length) / 1000000,
            };
        } catch {
            this.playerInfo.value = {
                title: "Нет трека",
                artist: "",
                album: "",
                playing: false,
                position: 0,
                length: 0,
            };
        }
    }
    
    private playPause() {
        exec(`playerctl play-pause 2>/dev/null`);
    }
    
    private next() {
        exec(`playerctl next 2>/dev/null`);
    }
    
    private prev() {
        exec(`playerctl previous 2>/dev/null`);
    }
    
    private setupChildren() {
        const titleLabel = new Widget.Label({
            className: "player-title",
            label: this.playerInfo.bind(i => i.title),
            ellipsize: "end",
        });
        
        const artistLabel = new Widget.Label({
            className: "player-artist",
            label: this.playerInfo.bind(i => i.artist),
            ellipsize: "end",
        });
        
        const controlsBox = new Widget.Box({
            className: "player-controls",
            orientation: "horizontal",
            children: [
                new Widget.Button({
                    child: new Widget.Label({ label: "⏮" }),
                    setup: (self: any) => {
                        self.connect('clicked', () => this.prev());
                    },
                }),
                new Widget.Button({
                    child: new Widget.Label({ label: this.playerInfo.bind(i => i.playing ? "⏸" : "▶") }),
                    setup: (self: any) => {
                        self.connect('clicked', () => this.playPause());
                    },
                }),
                new Widget.Button({
                    child: new Widget.Label({ label: "⏭" }),
                    setup: (self: any) => {
                        self.connect('clicked', () => this.next());
                    },
                }),
            ],
        });
        
        const progressSlider = new Widget.Scale({
            className: "player-progress",
            hexpand: true,
            min: 0,
            max: this.playerInfo.value.length || 100,
            value: this.playerInfo.value.position,
            setup: (self: any) => {
                self.connect('value-changed', (s: any) => {
                    const pos = s.get_value() * 1000000;
                    exec(`playerctl position ${pos} 2>/dev/null`);
                });
            },
        });
        
        this.append(titleLabel);
        this.append(artistLabel);
        this.append(controlsBox);
        this.append(progressSlider);
    }
}

// ==================== ТОП ПРИЛОЖЕНИЙ ====================
class TopAppsWidget extends Widget.Box {
    private apps = Signal.new<any[]>([]);
    
    constructor() {
        super({
            className: "top-apps",
            orientation: "vertical",
        });
        
        this.updateApps();
        setInterval(() => this.updateApps(), 2000);
        
        this.setupChildren();
    }
    
    private updateApps() {
        try {
            // Получаем топ-5 по CPU
            const cpuApps = exec(`ps aux --sort=-%cpu | head -6 | tail -5 | awk '{print "{\"name\":\""$11"\",\"cpu\":\""$3"\"}"}' | jq -s '.' 2>/dev/null || echo "[]"`);
            // Получаем топ-5 по памяти
            const memApps = exec(`ps aux --sort=-%mem | head -6 | tail -5 | awk '{print "{\"name\":\""$11"\",\"mem\":\""$4"\""}' | jq -s '.' 2>/dev/null || echo "[]"`);
            
            this.apps.value = {
                cpu: JSON.parse(cpuApps) || [],
                mem: JSON.parse(memApps) || [],
            };
        } catch {
            this.apps.value = { cpu: [], mem: [] };
        }
    }
    
    private setupChildren() {
        const cpuBox = new Widget.Box({
            className: "top-cpu",
            orientation: "vertical",
            setup: (self: any) => {
                self.connect('notify::visible', () => {
                    const children = self.get_children();
                    children.forEach((c: any) => self.remove(c));
                    
                    new Widget.Label({
                        label: "🖥️ По CPU",
                        className: "top-header",
                    });
                    
                    this.apps.value.cpu?.forEach((app: any) => {
                        self.append(new Widget.Label({
                            label: `${app.name}: ${app.cpu}%`,
                            className: "top-app-item",
                        }));
                    });
                });
            },
        });
        
        const memBox = new Widget.Box({
            className: "top-mem",
            orientation: "vertical",
            setup: (self: any) => {
                self.connect('notify::visible', () => {
                    const children = self.get_children();
                    children.forEach((c: any) => self.remove(c));
                    
                    new Widget.Label({
                        label: "💾 По памяти",
                        className: "top-header",
                    });
                    
                    this.apps.value.mem?.forEach((app: any) => {
                        self.append(new Widget.Label({
                            label: `${app.name}: ${app.mem}%`,
                            className: "top-app-item",
                        }));
                    });
                });
            },
        });
        
        this.append(cpuBox);
        this.append(memBox);
    }
}

// ==================== КАЛЕНДАРЬ ====================
class CalendarWidget extends Widget.Box {
    constructor() {
        super({
            className: "calendar-widget",
            orientation: "vertical",
        });
        
        this.setupCalendar();
    }
    
    private setupCalendar() {
        const calendar = new Widget.Calendar({
            className: "calendar",
            showDetails: false,
        });
        
        this.append(calendar);
    }
}

// ==================== МЕНЮ ПИТАНИЯ ====================
class PowerMenu extends Widget.Box {
    constructor() {
        super({
            className: "power-menu",
            orientation: "horizontal",
        });
        
        this.setupButtons();
    }
    
    private setupButtons() {
        const buttons = [
            { label: "🔒", cmd: "loginctl lock-session" },
            { label: "😴", cmd: "systemctl suspend" },
            { label: "🔄", cmd: "systemctl reboot" },
            { label: "⏻", cmd: "systemctl poweroff" },
        ];
        
        buttons.forEach(btn => {
            const button = new Widget.Button({
                child: new Widget.Label({ label: btn.label }),
                className: "power-btn",
                setup: (self: any) => {
                    self.connect('clicked', () => {
                        exec(`${btn.cmd} 2>/dev/null &`);
                    });
                },
            });
            this.append(button);
        });
    }
}

// ==================== ГЛАВНАЯ ПАНЕЛЬ ====================
class MainPanel extends Widget.Window {
    constructor() {
        const timeWidget = new TimeWidget();
        const dateWidget = new DateWidget();
        const cpuMonitor = new CpuMonitor();
        const volumeControl = new VolumeControl();
        const cavaVis = new CavaVisualizer();
        const weatherNow = new WeatherNow();
        const weatherDay = new WeatherDay();
        const weatherWeek = new WeatherWeek();
        const playerWidget = new PlayerWidget();
        const topApps = new TopAppsWidget();
        const calendar = new CalendarWidget();
        const powerMenu = new PowerMenu();
        
        super({
            name: "main-panel",
            anchor: ["top", "left"],
            x: 5,
            y: 5,
            exclusive: true,
            visible: true,
            child: new Widget.Box({
                className: "main-container",
                orientation: "vertical",
                children: [
                    new Widget.Box({
                        className: "row",
                        children: [timeWidget, dateWidget],
                    }),
                    cpuMonitor,
                    volumeControl,
                    cavaVis,
                    weatherNow,
                    weatherDay,
                    weatherWeek,
                    playerWidget,
                    topApps,
                    calendar,
                    powerMenu,
                ],
            }),
        });
    }
}

// Запуск
const panel = new MainPanel();
QS.export({ windows: [panel] });
