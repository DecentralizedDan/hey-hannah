# Maestro Tests for Hey Hannah

This directory contains automated UI tests for the Hey Hannah iOS app using Maestro.

## Installation

Install Maestro using the following command:

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

After installation, restart your terminal or run:

```bash
export PATH="$PATH:$HOME/.maestro/bin"
```

## Running Tests

### Run All Tests

```bash
maestro test .maestro/
```

### Run a Specific Test

```bash
maestro test .maestro/01-create-new-image.yaml
```

### Run Tests in Studio (Interactive Mode)

```bash
maestro studio
```

This opens an interactive UI where you can:

- See your app and tests side by side
- Step through tests line by line
- Record new test flows

## Test Files

- `01-create-new-image.yaml` - Tests basic text input functionality
- `02-change-colors.yaml` - Tests background and text color changes
- `03-change-font-and-alignment.yaml` - Tests font family and alignment cycling
- `04-text-size.yaml` - Tests text size changes
- `05-share-flow.yaml` - Tests opening and closing share modal
- `06-gallery-navigation.yaml` - Tests navigation between create and gallery views
- `07-preview-mode.yaml` - Tests preview mode toggle

## Prerequisites

Before running tests:

1. Build and install the app on iOS Simulator:

   ```bash
   npx expo run:ios
   ```

2. Make sure the simulator is running with the app installed

3. The app bundle identifier is: `com.heyhannah.app`

## Writing New Tests

Maestro tests use simple YAML syntax:

```yaml
appId: com.heyhannah.app
---
- launchApp
- tapOn:
    id: "text-input"
- inputText: "Hello"
- assertVisible:
    text: "Hello"
```

### Key Commands

- `launchApp` - Launch the app
- `tapOn` - Tap an element (by text, id, or coordinates)
- `inputText` - Type text into focused input
- `assertVisible` - Assert element is visible
- `hideKeyboard` - Dismiss keyboard
- `swipe` - Swipe gestures
- `waitForAnimationToEnd` - Wait for animations

## Test IDs

The following test IDs are available:

### Text Input

- `text-input` - Main text input field

### Navigation

- `gallery-nav-button` - Navigate to gallery
- `edit-nav-button` - Navigate to edit/create view
- `gallery-sort-button` - Toggle gallery sort mode

### Controls

- `bg-color-control` - Background color control
- `text-color-control` - Text color control
- `font-control` - Font family control
- `size-control` - Text size control
- `alignment-control` - Text alignment control
- `preview-control` - Preview mode toggle
- `share-control` - Share button

### Modals

- `share-modal` - Share modal container
- `close-share-modal` - Close share modal button
- `save-to-photos-button` - Save to photos option
- `copy-to-clipboard-button` - Copy to clipboard option
- `share-via-apps-button` - Share via apps option

### Views

- `gallery-view` - Gallery view container
- `preview-overlay` - Preview mode overlay

## Documentation

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Test Examples](https://maestro.mobile.dev/examples)
- [API Reference](https://maestro.mobile.dev/api-reference)
