# Noctalia Widgets Configuration

Port of EWW widgets to Noctalia format.

## Structure

```
noctalia/
├── src/
│   ├── _clock_date.yuck    # Clock and date widget definitions
│   ├── _cpu_widgets.yuck   # CPU load and graph widget definitions
│   └── _top_apps.yuck      # Top applications by CPU and memory usage
├── styles/
│   ├── _variables.scss     # Shared SCSS variables
│   ├── clock_date.scss     # Clock and date widget styles
│   ├── cpu_widgets.scss    # CPU load and graph widget styles
│   └── top_apps.scss       # Top applications widget styles
├── scripts/
│   ├── get_cpu_cores       # Script to get per-core CPU usage
│   ├── get_ram_usage       # Script to get RAM usage percentage
│   ├── cpu_graph_daemon    # Script for CPU graph historical data
│   ├── get_top_cpu_apps    # Script to get top apps by CPU usage
│   └── get_top_mem_apps    # Script to get top apps by memory usage
└── README.md
```

## Clock & Date Widget

The clock widget displays:
- Current time in HH:MM:SS format (large LED-style font)
- Current date in DD.MM.YYYY format (clickable button)
- Day of the week
- Calendar popup (when date is clicked)

### Features Ported from EWW

1. **Time Display**: Updates every second, shows hours, minutes, and seconds
2. **Date Button**: Shows current date, clickable to toggle calendar
3. **Weekday Display**: Shows day of the week, updates hourly
4. **Calendar**: Reveals when date button is clicked

### Usage

```rust
// In your main noctalia config, include the widget:
include!("src/_clock_date.yuck");

// Use the widget in your layout:
widget: clock_date
```

### Styling

The widget uses the following CSS classes:
- `.clock-widget` - Main container
- `.time` - Time display label
- `.rightdate` - Date container box
- `.date` - Date button
- `.day` - Weekday label
- `.calendar` - Calendar container
- `.cal` - Calendar widget

### Customization

Edit `styles/_variables.scss` to change:
- Colors
- Fonts
- Spacing
- Border radius
- Transition speeds

Edit `styles/clock_date.scss` to modify:
- Font sizes
- Margins and padding
- Hover/active states
- Calendar appearance

## CPU Load & Graph Widgets

The CPU widgets display real-time system resource usage:

### CPU Load Widget (`cpu_load`)
- Shows individual CPU core usage (8 cores) as horizontal bars
- Displays RAM usage percentage
- Updates every second
- Each core has a unique color matching the original EWW config

### CPU Graph Widget (`cpu_graph_widget`)
- Historical CPU usage visualization
- 51 data points showing usage over time
- Two-segment display (flipped top and normal bottom)
- Width: 313px, height per segment: 35px
- Updates every second

### Features Ported from EWW

1. **Per-Core Metrics**: 8 individual CPU core usage bars with labels
2. **RAM Monitor**: Memory usage percentage bar
3. **Color Coding**: Each core has a distinct pastel color
4. **Graph Display**: Historical usage shown as vertical bars
5. **Real-time Updates**: All metrics refresh every second

### Usage

```rust
// In your main noctalia config, include the widgets:
include!("src/_cpu_widgets.yuck");

// Use the widgets in your layout:
widget: cpu_load        // For per-core usage bars
widget: cpu_graph_widget // For historical graph
```

### Styling

The widgets use the following CSS classes:
- `.cpu-load-widget` - Main CPU load container
- `.cpu-graph-widget` - Main graph container
- `.metric` - Individual metric row
- `.label` - Metric label (core icon)
- `.cpustuffBar` - Progress bar trough
- `.CPU1` through `.CPU8` - Individual core bars
- `.RAM` - RAM usage bar
- `.cpu_graph_segments` - Graph container
- `.cpu_graph_segment` - Individual graph bar

### Scripts

Three helper scripts are required:

1. **get_cpu_cores**: Returns JSON array of 8 core usage percentages
2. **get_ram_usage**: Returns single number (RAM usage %)
3. **cpu_graph_daemon**: Continuous daemon outputting 51-value history array

### Customization

Edit `styles/cpu_widgets.scss` to modify:
- Core colors (maintains original EWW color scheme)
- Bar dimensions and spacing
- Graph appearance
- Font sizes and families

## Top Applications Widget

The top applications widget displays the most resource-intensive processes:

### Features
- **Top CPU Apps**: Shows 5 applications with highest CPU usage
- **Top Memory Apps**: Shows 5 applications with highest memory usage
- **Auto-refresh**: Updates every 2 seconds
- **Compact Display**: Name and value in a clean list format

### Usage

```rust
// In your main noctalia config, include the widget:
include!("src/_top_apps.yuck");

// Use the widget in your layout:
widget: top_apps_widget
```

### Styling

The widget uses the following CSS classes:
- `.topstuff` - Main container
- `.top_app` - Individual app list section
- `.name` - Application name label
- `.value` - Usage value label

### Scripts

Two helper scripts are required:

1. **get_top_cpu_apps**: Returns JSON array of top 5 apps by CPU usage
2. **get_top_mem_apps**: Returns JSON array of top 5 apps by memory usage

Each script returns data in the format:
```json
[
  {"name": "firefox", "value": "15.3%"},
  {"name": "code", "value": "8.7%"},
  ...
]
```

### Customization

Edit `styles/top_apps.scss` to modify:
- Minimum width (default: 293px)
- Padding and margins
- Font sizes and families
- Text alignment

