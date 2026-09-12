import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Services

Item {
    id: root
    visible: false // Hidden by default, shown on date click
    width: 300
    height: 350
    
    property var currentDate: new Date()
    
    Calendar {
        anchors.centerIn: parent
        width: 280
        height: 300
        
        selectedDate: currentDate
        
        onSelectedDateChanged: {
            currentDate = selectedDate
        }
    }
    
    Rectangle {
        anchors.fill: parent
        color: "#282a36"
        radius: 10
        border.color: "#44475a"
        border.width: 2
        z: -1
    }
}
