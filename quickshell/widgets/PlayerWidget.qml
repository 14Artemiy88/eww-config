import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Services

Item {
    id: root
    visible: true
    width: 300
    height: 120
    
    property var playerInfo: null
    
    Timer {
        interval: 1000
        running: true
        repeat: true
        triggeredOnStart: true
        onTriggered: {
            var process = Qt.createQmlObject("import Quickshell.Io; Process {}", root)
            process.command = "playerctl metadata --format '{{artist}} - {{title}}|{{albumArtUrl}}|{{status}}' 2>/dev/null || echo 'No player'"
            process.onExited = (exitCode, exitStatus) => {
                if (exitCode === 0 && process.stdOut.trim() !== "No player") {
                    var parts = String(process.stdOut).trim().split("|")
                    playerInfo = {
                        title: parts[0] || "Unknown",
                        albumArt: parts[1] || "",
                        status: parts[2] || "Stopped"
                    }
                } else {
                    playerInfo = null
                }
            }
            process.start()
        }
    }
    
    Column {
        anchors.centerIn: parent
        spacing: 10
        
        Row {
            spacing: 15
            Image {
                source: playerInfo?.albumArt || ""
                width: 60
                height: 60
                fillMode: Image.PreserveAspectCrop
                radius: 5
                visible: playerInfo !== null
            }
            
            Column {
                spacing: 5
                width: 200
                
                Text {
                    text: playerInfo ? playerInfo.title : "No media playing"
                    color: "#f8f8f2"
                    font.pixelSize: 14
                    elide: Text.ElideRight
                    width: parent.width
                }
                
                Row {
                    spacing: 10
                    visible: playerInfo !== null
                    
                    Repeater {
                        model: ["previous", "playpause", "next"]
                        
                        Rectangle {
                            width: 30
                            height: 30
                            radius: 15
                            color: "#44475a"
                            
                            MouseArea {
                                anchors.fill: parent
                                onClicked: {
                                    var cmd = "playerctl " + modelData
                                    var process = Qt.createQmlObject("import Quickshell.Io; Process {}", root)
                                    process.command = cmd
                                    process.start()
                                }
                            }
                            
                            Text {
                                anchors.centerIn: parent
                                text: modelData === "playpause" ? "⏯" : modelData === "previous" ? "⏮" : "⏭"
                                color: "#f8f8f2"
                                font.pixelSize: 16
                            }
                        }
                    }
                }
            }
        }
    }
}
