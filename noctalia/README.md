# Noctalia Widgets Configuration

Port of EWW widgets to Noctalia format.

## Structure

```
noctalia/
├── src/
│   ├── _clock_date.yuck    # Clock and date widget definitions
│   └── _cpu_widgets.yuck   # CPU load and graph widget definitions
├── styles/
│   ├── _variables.scss     # Shared SCSS variables
│   ├── clock_date.scss     # Clock and date widget styles
│   └── cpu_widgets.scss    # CPU load and graph widget styles
├── scripts/
│   ├── get_cpu_cores       # Script to get per-core CPU usage
│   ├── get_ram_usage       # Script to get RAM usage percentage
│   └── cpu_graph_daemon    # Script for CPU graph historical data
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

