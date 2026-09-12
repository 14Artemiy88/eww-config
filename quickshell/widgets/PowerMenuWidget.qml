import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Services

Item {
    id: root
    visible: false // Hidden by default
    width: 250
    height: 200
    
    Rectangle {
        anchors.fill: parent
        color: "#282a36"
        radius: 10
        border.color: "#ff5555"
        border.width: 2
        z: -1
    }
    
    Column {
        anchors.centerIn: parent
        spacing: 15
        
        Text {
            text: "Power Menu"
            color: "#ff5555"
            font.pixelSize: 20
            font.bold: true
            anchors.horizontalCenter: parent.horizontalCenter
        }
        
        Repeater {
            model: [
                { label: "Lock", cmd: "swaylock" },
                { label: "Logout", cmd: "swaymsg exit" },
                { label: "Suspend", cmd: "systemctl suspend" },
                { label: "Reboot", cmd: "systemctl reboot" },
                { label: "Shutdown", cmd: "systemctl poweroff" }
            ]
            
            Rectangle {
                width: 200
                height: 40
                radius: 5
                color: "#44475a"
                
                MouseArea {
                    anchors.fill: parent
                    onClicked: {
                        var process = Qt.createQmlObject("import Quickshell.Io; Process {}", root)
                        process.command = modelData.cmd
                        process.start()
                    }
                }
                
                Text {
                    anchors.centerIn: parent
                    text: modelData.label
                    color: "#f8f8f2"
                    font.pixelSize: 16
                }
            }
        }
    }
}
