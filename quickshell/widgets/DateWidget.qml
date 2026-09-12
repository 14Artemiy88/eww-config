import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Services

Item {
    id: root
    visible: true
    
    Text {
        text: Qt.formatDate(SysClock.time, "dd.MM.yyyy") + "\n" + 
              Qt.locale().standaloneDayName(SysClock.time.dayOfWeek, Locale.LongFormat)
        font.pixelSize: 25
        font.family: "JetBrains Mono"
        color: "#f8f8f2"
        horizontalAlignment: Text.AlignHCenter
    }
}
