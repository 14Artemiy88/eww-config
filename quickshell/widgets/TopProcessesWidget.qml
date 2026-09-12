import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Services

Item {
    id: root
    visible: true
    width: 400
    height: 200
    
    property var topCpu: []
    property var topMem: []
    
    Timer {
        interval: 2000
        running: true
        repeat: true
        triggeredOnStart: true
        onTriggered: {
            // Get top CPU processes
            var cpuProcess = Qt.createQmlObject("import Quickshell.Io; Process {}", root)
            cpuProcess.command = "ps -eo pid,comm,%cpu --sort=-%cpu | head -6 | tail -5"
            cpuProcess.onExited = (exitCode, exitStatus) => {
                if (exitCode === 0) {
                    var lines = String(cpuProcess.stdOut).trim().split("\n")
                    topCpu = lines.map(line => {
                        var parts = line.trim().split(/\s+/)
                        return { pid: parts[0], name: parts[1], cpu: parseFloat(parts[2]) }
                    })
                }
            }
            cpuProcess.start()
            
            // Get top Memory processes
            var memProcess = Qt.createQmlObject("import Quickshell.Io; Process {}", root)
            memProcess.command = "ps -eo pid,comm,%mem --sort=-%mem | head -6 | tail -5"
            memProcess.onExited = (exitCode, exitStatus) => {
                if (exitCode === 0) {
                    var lines = String(memProcess.stdOut).trim().split("\n")
                    topMem = lines.map(line => {
                        var parts = line.trim().split(/\s+/)
                        return { pid: parts[0], name: parts[1], mem: parseFloat(parts[2]) }
                    })
                }
            }
            memProcess.start()
        }
    }
    
    Column {
        anchors.centerIn: parent
        spacing: 15
        
        Column {
            width: parent.width
            spacing: 5
            
            Text {
                text: "Top CPU"
                color: "#bd93f9"
                font.pixelSize: 16
                font.bold: true
            }
            
            Repeater {
                model: topCpu
                Row {
                    spacing: 10
                    Text {
                        text: modelData.name
                        color: "#f8f8f2"
                        font.pixelSize: 12
                        width: 150
                        elide: Text.ElideRight
                    }
                    Text {
                        text: modelData.cpu.toFixed(1) + "%"
                        color: "#50fa7b"
                        font.pixelSize: 12
                        width: 60
                        horizontalAlignment: Text.AlignRight
                    }
                }
            }
        }
        
        Column {
            width: parent.width
            spacing: 5
            
            Text {
                text: "Top Memory"
                color: "#ff79c6"
                font.pixelSize: 16
                font.bold: true
            }
            
            Repeater {
                model: topMem
                Row {
                    spacing: 10
                    Text {
                        text: modelData.name
                        color: "#f8f8f2"
                        font.pixelSize: 12
                        width: 150
                        elide: Text.ElideRight
                    }
                    Text {
                        text: modelData.mem.toFixed(1) + "%"
                        color: "#8be9fd"
                        font.pixelSize: 12
                        width: 60
                        horizontalAlignment: Text.AlignRight
                    }
                }
            }
        }
    }
}
