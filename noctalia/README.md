# Noctalia Widgets Configuration

Port of EWW widgets to Noctalia format.

## Structure

```
noctalia/
├── src/
│   └── _clock_date.yuck    # Clock and date widget definitions
├── styles/
│   ├── _variables.scss     # Shared SCSS variables
│   └── clock_date.scss     # Clock and date widget styles
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

## Next Steps

This is the first widget ported. Future widgets to port:
- CPU usage monitor
- CPU graph
- Top applications
- Network statistics
- Weather display
- Timer
- Volume controls
- Media player
- Cava visualizer
