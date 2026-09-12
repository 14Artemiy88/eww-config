import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Services

Item {
    id: root
    visible: true
    
    Text {
        text: Qt.formatTime(SysClock.time, "HH:mm:ss")
        font.pixelSize: 55
        font.family: "JetBrains Mono"
        color: "#f8f8f2"
        font.weight: Font.Bold
    }
}
