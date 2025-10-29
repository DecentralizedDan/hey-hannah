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

### Run All Tests (Parallel - Fastest)

By default, tests run in parallel for speed:

```bash
maestro test .maestro/
```

**Note:** Tests will complete in undefined order when run in parallel.

### Run All Tests (Sequential - In Order)

To run tests in numerical order (00 → 07):

```bash
maestro test .maestro/run-all-sequential.yaml
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

- `00-reset-app.yaml` - Tests app reset with cleared state
- `01-create-new-image.yaml` - Tests basic text input functionality
- `02-change-colors.yaml` - Tests background and text color changes
- `03-change-font-and-alignment.yaml` - Tests font family and alignment cycling
- `04-text-size.yaml` - Tests text size changes
- `05-share-flow.yaml` - Tests share functionality
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
- extendedWaitUntil:
    visible:
      id: "text-view"
    timeout: 5000
- tapOn:
    id: "text-view"
- extendedWaitUntil:
    visible:
      id: "text-input"
    timeout: 2000
- inputText: "Hello"
- hideKeyboard
- assertVisible:
    text: "Hello"
```

### Key Commands

- `launchApp` - Launch the app
- `extendedWaitUntil` - Wait until a condition is met (with timeout in milliseconds)
- `waitForAnimationToEnd` - Wait for animations to complete
- `tapOn` - Tap an element (by text, id, or coordinates)
- `inputText` - Type text into focused input
- `assertVisible` - Assert element is visible
- `hideKeyboard` - Dismiss keyboard
- `swipe` - Swipe gestures

**Note:** All tests wait for the UI to be fully loaded using `extendedWaitUntil` with appropriate timeouts:

- After `launchApp`, tests wait up to 5 seconds for `text-view` to appear (ensures fonts are loaded)
- After tapping `text-view`, tests wait up to 2 seconds for `text-input` to appear (ensures editing mode is active)
- After `hideKeyboard`, tests wait up to 2 seconds for controls to be visible before interacting with them

This approach ensures reliable test execution by waiting for actual UI elements to be ready rather than using fixed delays.

## Test IDs

The following test IDs are available:

### Text Input

- `text-view` - Text viewing area (tap to enter editing mode)
- `text-input` - Main text input field (only visible when editing)

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
