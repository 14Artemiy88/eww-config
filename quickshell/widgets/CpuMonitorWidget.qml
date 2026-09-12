import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Services

Item {
    id: root
    visible: true
    width: 300
    height: 100
    
    property var cpuUsage: [0, 0, 0, 0, 0, 0, 0, 0]
    property var ramUsage: 0
    property var history: []
    
    Process {
        id: cpuProcess
        readonly property string command: "bash -c \"grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage}'\""
        running: false
        onExited: (exitCode, exitStatus) => {
            if (exitCode === 0) {
                ramUsage = parseFloat(String(cpuProcess.stdOut).trim())
            }
            cpuProcess.running = false
        }
    }
    
    Timer {
        interval: 1000
        running: true
        repeat: true
        triggeredOnStart: true
        onTriggered: {
            // Update CPU usage for each core
            for (let i = 0; i < 8; i++) {
                cpuUsage[i] = Math.random() * 100 // Placeholder, needs real implementation
            }
            // Update RAM usage
            cpuProcess.start()
            
            // Update history
            history.push(cpuUsage.reduce((a, b) => a + b, 0) / 8)
            if (history.length > 50) history.shift()
        }
    }
    
    Column {
        spacing: 10
        
        Row {
            spacing: 5
            Repeater {
                model: 8
                Rectangle {
                    width: 30
                    height: 10
                    color: cpuUsage[index] > 80 ? "#ff5555" : cpuUsage[index] > 50 ? "#ffb86c" : "#50fa7b"
                    radius: 2
                    
                    Rectangle {
                        width: parent.width * (cpuUsage[index] / 100)
                        height: parent.height
                        color: parent.color
                        radius: parent.radius
                    }
                }
            }
        }
        
        Rectangle {
            width: 200
            height: 20
            color: "#44475a"
            radius: 5
            
            Rectangle {
                width: parent.width * (ramUsage / 100)
                height: parent.height
                color: "#bd93f9"
                radius: parent.radius
            }
            
            Text {
                anchors.centerIn: parent
                text: "RAM: " + ramUsage.toFixed(1) + "%"
                color: "#f8f8f2"
                font.pixelSize: 12
            }
        }
        
        // History graph placeholder
        Rectangle {
            width: 200
            height: 50
            color: "#282a36"
            radius: 5
            border.color: "#6272a4"
            border.width: 1
            
            Text {
                anchors.centerIn: parent
                text: "CPU History"
                color: "#6272a4"
            }
        }
    }
}
