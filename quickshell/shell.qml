import Quickshell
import Quickshell.Io
import Quickshell.Services
import Quickshell.Wayland
import QtQuick

ShellRoot {
    property var theme: QtObject {
        property color bg_primary: "#282a36"
        property color bg_secondary: "#44475a"
        property color fg_primary: "#f8f8f2"
        property color fg_secondary: "#6272a4"
        property color accent: "#bd93f9"
        property color danger: "#ff5555"
        property color warning: "#ffb86c"
        property color success: "#50fa7b"
        property color cyan: "#8be9fd"
        property color green: "#50fa7b"
        property color orange: "#ffb86c"
        property color pink: "#ff79c6"
        property color purple: "#bd93f9"
        property color red: "#ff5555"
        property color yellow: "#f1fa8c"
    }
    
    // Main panel
    Panel {
        id: mainPanel
        screen: WaylandSeat.defaultScreen
        anchor: QsPanelAnchor.Top
        alignment: Qt.AlignHCenter
        
        Layer.enabled: true
        Layer.color: "transparent"
        
        Row {
            spacing: 20
            
            // Clock and Date
            Column {
                spacing: 5
                ClockWidget { }
                DateWidget { }
            }
            
            // CPU Monitor
            CpuMonitorWidget { }
            
            // Volume Control
            VolumeWidget { }
            
            // CAVA Visualizer
            CavaWidget { }
            
            // Weather
            WeatherWidget { }
            
            // Music Player
            PlayerWidget { }
            
            // Top Processes
            TopProcessesWidget { }
        }
    }
    
    // Calendar popup (hidden by default)
    CalendarWidget {
        id: calendarPopup
        z: 1000
    }
    
    // Power menu popup (hidden by default)
    PowerMenuWidget {
        id: powerPopup
        z: 1000
    }
}
