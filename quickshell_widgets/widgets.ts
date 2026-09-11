import { Reactive, onCleanup } from "quickshell/reactivity";
import { exec, execAsync } from "quickshell/io";
import { qml } from "quickshell/ui";

// ==================== ЧАСЫ И ДАТА ====================

export const Clock = () => {
  const time = Reactive.derive(() => {
    const now = new Date();
    return now.toLocaleTimeString("ru-RU", { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  });

  // Обновление каждую секунду
  const interval = setInterval(() => time.markDirty(), 1000);
  onCleanup(() => clearInterval(interval));

  return (
    <box className="clock-widget" space={5}>
      <label className="time-label" text={time()} />
    </box>
  );
};

export const DateWidget = () => {
  const date = Reactive.derive(() => {
    const now = new Date();
    return now.toLocaleDateString("ru-RU", { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  });

  const weekday = Reactive.derive(() => {
    const now = new Date();
    return now.toLocaleDateString("ru-RU", { weekday: 'long' });
  });

  const interval = setInterval(() => {
    date.markDirty();
    weekday.markDirty();
  }, 60000); // Обновление каждую минуту
  onCleanup(() => clearInterval(interval));

  return (
    <box className="date-widget" space={5}>
      <label className="date-label" text={date()} />
      <label className="weekday-label" text={weekday()} />
    </box>
  );
};

// ==================== ЗАГРУЗКА CPU И RAM ====================

export const CpuMonitor = () => {
  const cpuUsage = Reactive.value(0);
  const ramUsage = Reactive.value(0);
  const cpuHistory = Reactive.value(new Array(50).fill(0));

  const updateStats = async () => {
    try {
      // Получаем загрузку CPU
      const cpuResult = await execAsync("grep 'cpu ' /proc/stat");
      const cpuLine = cpuResult.split('\n')[0];
      const values = cpuLine.split(/\s+/).slice(1).map(Number);
      const total = values.reduce((a, b) => a + b, 0);
      const idle = values[3];
      const usage = ((total - idle) / total) * 100;
      
      cpuUsage.set(usage);
      
      // Обновляем историю
      const history = cpuHistory();
      history.shift();
      history.push(usage);
      cpuHistory.set([...history]);

      // Получаем загрузку RAM
      const memInfo = await execAsync("free -m");
      const lines = memInfo.split('\n');
      const memLine = lines.find(l => l.startsWith('Mem:'));
      if (memLine) {
        const [, total, used] = memLine.split(/\s+/).map(Number);
        ramUsage.set((used / total) * 100);
      }
    } catch (e) {
      console.error("Error getting stats:", e);
    }
  };

  updateStats();
  const interval = setInterval(updateStats, 1000);
  onCleanup(() => clearInterval(interval));

  return (
    <box className="cpu-monitor" orientation="vertical" space={5}>
      <box space={10}>
        <label text={`CPU: ${cpuUsage().toFixed(1)}%`} />
        <label text={`RAM: ${ramUsage().toFixed(1)}%`} />
      </box>
      
      {/* График загрузки CPU */}
      <box className="cpu-graph">
        {cpuHistory().map((value, i) => (
          <box 
            key={i} 
            className="cpu-bar" 
            hexpand={false}
            vexpand={false}
            css={`height: ${Math.max(2, value * 0.5)}px;`}
          />
        ))}
      </box>
    </box>
  );
};

// ==================== ГРОМКОСТЬ ====================

export const VolumeControl = () => {
  const volume = Reactive.value(50);
  const muted = Reactive.value(false);

  const updateVolume = async () => {
    try {
      const result = await execAsync("pactl get-sink-volume @DEFAULT_SINK@");
      const match = result.match(/(\d+)%/);
      if (match) {
        volume.set(parseInt(match[1]));
      }
      
      const muteResult = await execAsync("pactl get-sink-mute @DEFAULT_SINK@");
      muted.set(muteResult.includes("yes"));
    } catch (e) {
      console.error("Error getting volume:", e);
    }
  };

  const setVolume = async (newVol: number) => {
    const clamped = Math.max(0, Math.min(100, newVol));
    await execAsync(`pactl set-sink-volume @DEFAULT_SINK@ ${clamped}%`);
    volume.set(clamped);
  };

  const toggleMute = async () => {
    await execAsync("pactl set-sink-mute @DEFAULT_SINK@ toggle");
    muted.set(!muted());
  };

  updateVolume();
  const interval = setInterval(updateVolume, 500);
  onCleanup(() => clearInterval(interval));

  return (
    <box className="volume-control" space={5}>
      <button onClick={toggleMute} className="mute-btn">
        <label text={muted() ? "🔇" : "🔊"} />
      </button>
      <slider
        className="volume-slider"
        value={volume()}
        onChange={(v) => setVolume(v * 100)}
        min={0}
        max={1}
        step={0.01}
      />
      <label text={`${volume()}%`} />
    </box>
  );
};

// ==================== CAVA ВИЗУАЛИЗАТОР ====================

export const CavaVisualizer = () => {
  const bars = Reactive.value(new Array(51).fill(0));

  const updateCava = async () => {
    try {
      // Запускаем cava в режиме raw output
      const result = await execAsync("cava -p /dev/stdout 2>/dev/null | head -n 1");
      // Парсим данные (упрощённо)
      const values = result.split('').map(c => c.charCodeAt(0)).slice(0, 51);
      const normalized = values.map(v => (v / 255) * 100);
      
      // Дополняем до 51 элемента если нужно
      while (normalized.length < 51) {
        normalized.push(0);
      }
      
      bars.set(normalized.slice(0, 51));
    } catch (e) {
      // Если cava не запущен, показываем нули
      bars.set(new Array(51).fill(0));
    }
  };

  updateCava();
  const interval = setInterval(updateCava, 50); // ~20 FPS
  onCleanup(() => clearInterval(interval));

  return (
    <box className="cava-visualizer" space={2}>
      {bars().map((value, i) => (
        <box
          key={i}
          className="cava-bar"
          hexpand={false}
          vexpand={false}
          css={`
            height: ${Math.max(4, value * 0.8)}px;
            width: 4px;
          `}
        />
      ))}
    </box>
  );
};
