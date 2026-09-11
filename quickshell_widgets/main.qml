// Quickshell виджеты на основе EWW конфига
// Запуск: qs shell

import { Clock, DateWidget, CpuMonitor, VolumeControl, CavaVisualizer, PlayerWidget } from "./widgets";

export default () => (
  <box space={10} className="eww-container">
    {/* Виджет часов и даты */}
    <Clock />
    
    {/* Виджет загрузки CPU и RAM */}
    <CpuMonitor />
    
    {/* Топ приложений по загрузке */}
    {/* Требует кастомного скрипта */}
    
    {/* Виджет громкости и CAVA */}
    <VolumeControl />
    <CavaVisualizer />
    
    {/* Музыкальный плеер */}
    <PlayerWidget />
  </box>
);
