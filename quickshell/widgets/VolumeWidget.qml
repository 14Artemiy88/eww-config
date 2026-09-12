import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Services

Item {
    id: root
    visible: true
    width: 200
    height: 60
    
    property real volume: 0.5
    property bool muted: false
    
    Slider {
        id: volumeSlider
        width: 150
        height: 30
        from: 0
        to: 1
        value: root.volume
        onValueChanged: {
            root.volume = value
            // Use pactl to set volume
            var process = Qt.createQmlObject("import Quickshell.Io; Process {}", root)
            process.command = `pactl set-sink-volume @DEFAULT_SINK@ ${Math.round(value * 100)}%`
            process.start()
        }
    }
    
    Text {
        anchors.left: volumeSlider.right
        anchors.leftMargin: 10
        anchors.verticalCenter: volumeSlider.verticalCenter
        text: Math.round(root.volume * 100) + "%"
        color: "#f8f8f2"
        font.pixelSize: 14
    }
    
    MouseArea {
        anchors.fill: parent
        acceptedButtons: Qt.RightButton
        onClicked: {
            root.muted = !root.muted
            var process = Qt.createQmlObject("import Quickshell.Io; Process {}", root)
            process.command = `pactl set-sink-mute @DEFAULT_SINK@ ${root.muted ? '1' : '0'}`
            process.start()
        }
    }
}
