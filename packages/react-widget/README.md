# @feedback-forge/react-widget

This package provides a customizable React component for collecting user feedback.

## Installation

```bash
npm install @feedback-forge/react-widget
# or
pnpm install @feedback-forge/react-widget
# or
yarn add @feedback-forge/react-widget
```

## Usage

Import the `FeedbackWidget` component and render it in your application.

```jsx
'use client' // Required for Next.js App Router

import { FeedbackWidget } from '@feedback-forge/react-widget';
import React from 'react';

const App = () => {
  return (
    <div>
      <h1>My Awesome App</h1>
      <p>Welcome to the app. Feel free to leave feedback!</p>
      <FeedbackWidget
        feedbackApiUrl="/api/feedback"
        defaultBreadcrumbs={typeof window !== 'undefined' ? window.location.href : ''}
      />
    </div>
  );
};

export default App;
```

## Props

The `FeedbackWidget` component accepts the following props:

| Prop                 | Type                   | Required | Description                                                                 |
| -------------------- | ---------------------- | -------- | --------------------------------------------------------------------------- |
| `feedbackApiUrl`     | `string`               | Yes      | The full URL of the API endpoint that will receive the feedback submission. |
| `user`               | `{ id: number | string }` | No       | Optional user data to associate with the feedback.                          |
| `defaultTitle`       | `string`               | No       | An optional default value for the feedback title.                           |
| `defaultFeedback`    | `string`               | No       | An optional default value for the feedback description.                     |
| `defaultBreadcrumbs` | `string`               | No       | An optional default value for the breadcrumbs (e.g., the current URL).      |
| `customStyles`       | `FeedbackWidgetStyles` | No       | An object to customize the styles of the widget's components.               |

### `customStyles` Object

You can provide an object to the `customStyles` prop to override the default styling. The object can have the following keys, each accepting a `React.CSSProperties` object:

*   `button`
*   `formContainer`
*   `input`
*   `textarea`
*   `widgetContainer`
*   `closeButton`

#### Example

```jsx
<FeedbackWidget
  feedbackApiUrl="/api/feedback"
  customStyles={{
    button: {
      backgroundColor: '#ff6347',
      color: 'white',
    },
    formContainer: {
      borderColor: '#ff6347',
    },
  }}
/>
```

---

[Back to root README](../../../README.md)
