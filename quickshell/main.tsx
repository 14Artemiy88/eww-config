import { Shell, Variable, Component, qs } from "quickshell";
import { Box, Label, Button, Icon, Slider, Revealer, Scrollable, Overlay } from "quickshell/widgets";
import { Audio, System, Http } from "quickshell/services";

// ==================== CONFIG ====================
const WEATHER_API_KEY_FILE = `${Shell.userConfigDir}/../eww/token`;
let WEATHER_API_KEY = "";
try {
    const file = qs.readFile(WEATHER_API_KEY_FILE);
    WEATHER_API_KEY = file.trim();
} catch (e) {
    console.warn("Token not found, please create ~/.config/eww/token");
}

// ==================== UTILS ====================
const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const getWeekday = (date: Date) => {
    return date.toLocaleDateString("ru-RU", { weekday: "long" });
};

// ==================== CLOCK WIDGET ====================
const ClockWidget = () => {
    const timeVar = Variable(Date.now()).poll(1000, Date.now);
    
    return (
        <Box class="clock-widget" halign="center">
            <Label class="time-label" label={timeVar.bind().map(formatTime)} />
        </Box>
    );
};

// ==================== DATE WIDGET ====================
const DateWidget = () => {
    const dateVar = Variable(Date.now()).poll(1000, Date.now);
    
    return (
        <Box class="date-widget" halign="center">
            <Label class="date-label" label={dateVar.bind().map(formatDate)} />
            <Label class="weekday-label" label={dateVar.bind().map(getWeekday)} />
        </Box>
    );
};

// ==================== CPU MONITOR ====================
const CpuMonitor = () => {
    const cpuUsage = Variable(0).poll(2000, async () => {
        try {
            const output = await qs.execAsync(["bash", "-c", "grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage}'"]);
            return parseFloat(output);
        } catch { return 0; }
    });

    const ramUsage = Variable(0).poll(2000, async () => {
        try {
            const output = await qs.execAsync(["bash", "-c", "free | grep Mem | awk '{print $3/$2 * 100.0}'"]);
            return parseFloat(output);
        } catch { return 0; }
    });

    return (
        <Box class="cpu-monitor" spacing={8}>
            <Box class="cpu-bar">
                <Label label="CPU" />
                <Slider class="cpu-slider" value={cpuUsage.bind()} min={0} max={100} sensitive={false} />
                <Label label={cpuUsage.bind().map(v => `${v.toFixed(1)}%`)} />
            </Box>
            <Box class="ram-bar">
                <Label label="RAM" />
                <Slider class="ram-slider" value={ramUsage.bind()} min={0} max={100} sensitive={false} />
                <Label label={ramUsage.bind().map(v => `${v.toFixed(1)}%`)} />
            </Box>
        </Box>
    );
};

// ==================== VOLUME CONTROL ====================
const VolumeControl = () => {
    const audio = Audio.default;
    const speaker = audio.defaultSpeaker!;
    
    const toggleMute = () => {
        speaker.mute = !speaker.mute;
    };

    return (
        <Box class="volume-control" spacing={8}>
            <Button class="mute-btn" onClick={toggleMute}>
                <Icon icon={speaker.mute ? "audio-volume-muted-symbolic" : "audio-volume-high-symbolic"} />
            </Button>
            <Slider 
                class="volume-slider" 
                value={speaker.volume.bind()} 
                min={0} 
                max={1} 
                step={0.01}
                onChange={(v) => { speaker.volume = v; }}
            />
            <Label label={speaker.volume.bind().map(v => `${(v * 100).toFixed(0)}%`)} />
        </Box>
    );
};

// ==================== CAVA VISUALIZER ====================
const CavaVisualizer = () => {
    // Mock data - in real implementation would read from cava output
    const bars = Array.from({ length: 51 }, (_, i) => Variable(Math.random() * 100));
    
    // Simulate updates (replace with actual cava pipe reading)
    setInterval(() => {
        bars.forEach(b => b.value = Math.random() * 100);
    }, 50);

    return (
        <Box class="cava-visualizer" spacing={2}>
            {bars.map((bar, i) => (
                <Box 
                    key={i} 
                    class="cava-bar" 
                    hexpand 
                    valign="end"
                    css={`height: ${bar.bind().map(v => `${v}%`)}`}
                />
            ))}
        </Box>
    );
};

// ==================== WEATHER WIDGET ====================
interface WeatherData {
    temp: number;
    description: string;
    city: string;
}

const WeatherWidget = () => {
    const weather = Variable<WeatherData | null>(null);
    
    const fetchWeather = async () => {
        if (!WEATHER_API_KEY) {
            console.warn("No Gismeteo token");
            return;
        }
        
        try {
            // Get coordinates (mock - implement geolocation)
            const lat = 55.75;
            const lon = 37.61;
            
            const response = await Http.get(`https://api.gismeteo.net/v2/weather/current/?latitude=${lat}&longitude=${lon}`, {
                headers: {
                    "X-Gismeteo-Token": WEATHER_API_KEY,
                    "Accept": "application/json"
                }
            });
            
            const data = JSON.parse(response);
            weather.value = {
                temp: data.temperature.value,
                description: data.description.ru,
                city: data.location.name
            };
        } catch (e) {
            console.error("Weather fetch error:", e);
        }
    };
    
    fetchWeather();
    Variable.poll(1800000, fetchWeather); // 30 min

    return (
        <Box class="weather-widget" spacing={8}>
            <Label class="weather-temp" label={weather.bind().map(w => w ? `${w.temp}°C` : "--")} />
            <Label class="weather-desc" label={weather.bind().map(w => w ? w.description : "")} />
            <Label class="weather-city" label={weather.bind().map(w => w ? w.city : "")} />
        </Box>
    );
};

// ==================== PLAYER WIDGET ====================
const PlayerWidget = () => {
    const player = Variable<any>(null);
    
    // Use playerctl via exec
    const updatePlayer = async () => {
        try {
            const title = await qs.execAsync(["playerctl", "metadata", "xesam:title"]).catch(() => "");
            const artist = await qs.execAsync(["playerctl", "metadata", "xesam:artist"]).catch(() => "");
            const status = await qs.execAsync(["playerctl", "status"]).catch(() => "");
            
            player.value = { title: title.trim(), artist: artist.trim(), status };
        } catch {
            player.value = null;
        }
    };
    
    updatePlayer();
    Variable.poll(2000, updatePlayer);

    const playPause = () => qs.execAsync(["playerctl", "play-pause"]);
    const next = () => qs.execAsync(["playerctl", "next"]);
    const prev = () => qs.execAsync(["playerctl", "previous"]);

    return (
        <Box class="player-widget" spacing={8}>
            <Label class="player-title" label={player.bind().map(p => p ? p.title : "No media")} />
            <Label class="player-artist" label={player.bind().map(p => p ? p.artist : "")} />
            <Box spacing={4}>
                <Button onClick={prev}><Icon icon="media-skip-backward-symbolic" /></Button>
                <Button onClick={playPause}><Icon icon={player.bind().map(p => p?.status === "Playing" ? "media-playback-pause-symbolic" : "media-playback-start-symbolic")} /></Button>
                <Button onClick={next}><Icon icon="media-skip-forward-symbolic" /></Button>
            </Box>
        </Box>
    );
};

// ==================== TOP APPS WIDGET ====================
const TopAppsWidget = () => {
    const topCpu = Variable<string[]>([]);
    const topMem = Variable<string[]>([]);
    
    const updateTop = async () => {
        try {
            const cpuOut = await qs.execAsync(["bash", "-c", "ps aux --sort=-%cpu | head -n 6 | tail -n 5 | awk '{print $11 \" \" $3 \"%\"}'"]);
            const memOut = await qs.execAsync(["bash", "-c", "ps aux --sort=-%mem | head -n 6 | tail -n 5 | awk '{print $11 \" \" $4 \"%\"}'"]);
            
            topCpu.value = cpuOut.trim().split("\n");
            topMem.value = memOut.trim().split("\n");
        } catch {}
    };
    
    updateTop();
    Variable.poll(2000, updateTop);

    return (
        <Box class="top-apps-widget" spacing={16}>
            <Box class="top-cpu">
                <Label label="Top CPU" />
                {topCpu.bind().map(apps => apps.map(a => <Label key={a} label={a} />))}
            </Box>
            <Box class="top-mem">
                <Label label="Top MEM" />
                {topMem.bind().map(apps => apps.map(a => <Label key={a} label={a} />))}
            </Box>
        </Box>
    );
};

// ==================== MAIN PANEL ====================
export default () => (
    <Box class="main-panel" orientation="vertical" spacing={8}>
        <ClockWidget />
        <DateWidget />
        <CpuMonitor />
        <VolumeControl />
        <CavaVisualizer />
        <WeatherWidget />
        <PlayerWidget />
        <TopAppsWidget />
    </Box>
);
