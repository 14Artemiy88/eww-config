import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Services

Item {
    id: root
    visible: true
    width: 300
    height: 100
    
    property var bars: []
    
    Component.onCompleted: {
        // Initialize bars
        for (let i = 0; i < 51; i++) {
            bars.push(0)
        }
    }
    
    Timer {
        interval: 50 // ~20 FPS
        running: true
        repeat: true
        triggeredOnStart: true
        onTriggered: {
            // Simulate CAVA data - in real implementation, read from cava output
            for (let i = 0; i < 51; i++) {
                bars[i] = Math.random() * 100
            }
        }
    }
    
    Row {
        spacing: 2
        Repeater {
            model: 51
            Rectangle {
                width: 4
                height: bars[index] || 0
                color: {
                    if (index < 17) return "#8be9fd"  // Cyan for low frequencies
                    if (index < 34) return "#bd93f9"  // Purple for mid frequencies
                    return "#ff79c6"                   // Pink for high frequencies
                }
                radius: 2
                
                Behavior on height {
                    NumberAnimation { duration: 50 }
                }
            }
        }
    }
}
