import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Services

Item {
    id: root
    visible: true
    width: 250
    height: 150
    
    property var weatherData: null
    property string apiKey: ""
    
    Component.onCompleted: {
        // Read API key from file
        var file = Qt.openFileReadOnly(Qt.home + "/.config/eww/token")
        if (file) {
            apiKey = file.readAll().trim()
            file.close()
            fetchWeather()
        }
    }
    
    function fetchWeather() {
        if (!apiKey) return
        
        var process = Qt.createQmlObject("import Quickshell.Io; Process {}", root)
        process.command = `curl -s "https://api.gismeteo.net/v2/weather/current/?location_id=PLACE_ID" -H "X-Gismeteo-Token: ${apiKey}"`
        process.onExited = (exitCode, exitStatus) => {
            if (exitCode === 0) {
                try {
                    weatherData = JSON.parse(process.stdOut)
                } catch(e) {
                    console.error("Failed to parse weather data:", e)
                }
            }
        }
        process.start()
    }
    
    Timer {
        interval: 600000 // 10 minutes
        running: apiKey !== ""
        repeat: true
        triggeredOnStart: false
        onTriggered: fetchWeather()
    }
    
    Column {
        anchors.centerIn: parent
        spacing: 10
        
        Text {
            text: weatherData ? weatherData.temperature?.value + "°C" : "--"
            font.pixelSize: 48
            color: "#f8f8f2"
            font.bold: true
            anchors.horizontalCenter: parent.horizontalCenter
        }
        
        Text {
            text: weatherData ? weatherData.description?.ru || weatherData.description?.en : "Loading..."
            font.pixelSize: 16
            color: "#6272a4"
            anchors.horizontalCenter: parent.horizontalCenter
        }
    }
}
