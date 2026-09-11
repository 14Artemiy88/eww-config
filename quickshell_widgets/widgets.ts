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

// ==================== МУЗЫКАЛЬНЫЙ ПЛЕЕР ====================

export const PlayerWidget = () => {
  const title = Reactive.value("");
  const artist = Reactive.value("");
  const album = Reactive.value("");
  const coverArt = Reactive.value("");
  const position = Reactive.value(0);
  const length = Reactive.value(0);
  const playing = Reactive.value(false);
  const shuffle = Reactive.value(false);
  const loopStatus = Reactive.value<"None" | "Track" | "Playlist">("None");

  const updatePlayer = async () => {
    try {
      // Получаем информацию о треке
      const titleResult = await execAsync("playerctl metadata title 2>/dev/null || echo ''");
      const artistResult = await execAsync("playerctl metadata artist 2>/dev/null || echo ''");
      const albumResult = await execAsync("playerctl metadata album 2>/dev/null || echo ''");
      const statusResult = await execAsync("playerctl status 2>/dev/null || echo 'Stopped'");
      const positionResult = await execAsync("playerctl position 2>/dev/null || echo '0'");
      const lengthResult = await execAsync("playerctl metadata mpris:length 2>/dev/null || echo '0'");
      const shuffleResult = await execAsync("playerctl shuffle 2>/dev/null || echo 'Off'");
      const loopResult = await execAsync("playerctl loop 2>/dev/null || echo 'None'");
      
      // Получаем обложку альбома
      let coverUrl = "";
      try {
        coverUrl = await execAsync("playerctl metadata mpris:artUrl 2>/dev/null || echo ''");
        coverUrl = coverUrl.trim();
      } catch (e) {
        coverUrl = "";
      }

      title.set(titleResult.trim() || "Нет трека");
      artist.set(artistResult.trim() || "Неизвестный исполнитель");
      album.set(albumResult.trim() || "");
      coverArt.set(coverUrl);
      playing.set(statusResult.trim() === "Playing");
      
      const pos = parseInt(positionResult) || 0;
      const len = parseInt(lengthResult) || 0;
      position.set(pos / 1000000); // конвертируем из микросекунд в секунды
      length.set(len / 1000000);
      
      shuffle.set(shuffleResult.trim() === "On");
      loopStatus.set(loopResult.trim() as any || "None");
    } catch (e) {
      console.error("Error getting player info:", e);
      title.set("Нет трека");
      artist.set("");
      album.set("");
      coverArt.set("");
      playing.set(false);
      position.set(0);
      length.set(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = async () => {
    await execAsync("playerctl play-pause");
    playing.set(!playing());
  };

  const nextTrack = async () => {
    await execAsync("playerctl next");
  };

  const prevTrack = async () => {
    await execAsync("playerctl previous");
  };

  const toggleShuffle = async () => {
    await execAsync("playerctl shuffle");
    shuffle.set(!shuffle());
  };

  const cycleLoop = async () => {
    await execAsync("playerctl loop");
    const newLoop = loopStatus() === "None" ? "Track" : loopStatus() === "Track" ? "Playlist" : "None";
    loopStatus.set(newLoop);
  };

  const seekTo = async (value: number) => {
    const microseconds = Math.floor(value * 1000000);
    await execAsync(`playerctl position ${microseconds}`);
    position.set(value);
  };

  updatePlayer();
  const interval = setInterval(updatePlayer, 1000); // Обновление каждую секунду
  onCleanup(() => clearInterval(interval));

  return (
    <box className="player-widget" orientation="vertical" space={8}>
      {/* Обложка и информация */}
      <box space={10}>
        {coverArt() && (
          <image 
            className="album-cover" 
            file={coverArt().replace("file://", "")}
            pixelSize={60}
          />
        )}
        <box orientation="vertical" space={4} vexpand={true}>
          <label className="track-title" text={title()} ellipsize="end" />
          <label className="track-artist" text={artist()} ellipsize="end" />
          {album() && <label className="track-album" text={album()} ellipsize="end" />}
        </box>
      </box>

      {/* Прогресс бар */}
      <box space={5}>
        <label className="time-label" text={formatTime(position())} />
        <slider
          className="progress-slider"
          value={length() > 0 ? position() / length() : 0}
          onChange={(v) => seekTo(v * length())}
          min={0}
          max={1}
          step={0.001}
          hexpand={true}
        />
        <label className="time-label" text={formatTime(length())} />
      </box>

      {/* Кнопки управления */}
      <box space={10} halign="center">
        <button onClick={toggleShuffle} className="control-btn">
          <label text={shuffle() ? "🔀" : "🔁"} opacity={shuffle() ? 1 : 0.5} />
        </button>
        <button onClick={prevTrack} className="control-btn">
          <label text="⏮️" />
        </button>
        <button onClick={togglePlayPause} className="control-btn play-btn">
          <label text={playing() ? "⏸️" : "▶️"} />
        </button>
        <button onClick={nextTrack} className="control-btn">
          <label text="⏭️" />
        </button>
        <button onClick={cycleLoop} className="control-btn">
          <label text={loopStatus() === "None" ? "🔂" : loopStatus() === "Track" ? "🔂" : "🔁"} opacity={loopStatus() !== "None" ? 1 : 0.5} />
        </button>
      </box>
    </box>
  );
};
