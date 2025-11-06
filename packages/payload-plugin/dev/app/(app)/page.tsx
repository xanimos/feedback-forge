'use client'
import React, { useState } from 'react'
import { FeedbackWidget } from '@feedback-forge/react-widget'

const HomePage = () => {
  const [showWidget, setShowWidget] = useState(false)

  return (
    <div>
      <header style={{ backgroundColor: '#f5f5f5', padding: '1rem' }}>
        <h1>Feedback Forge Plugin</h1>
      </header>
      <main style={{ padding: '1rem' }}>
        <p>Welcome to the Feedback Forge plugin for Payload CMS. This plugin helps you collect and manage user feedback seamlessly within your Payload application.</p>
        <h2>Features</h2>
        <ul>
          <li>Easy integration with your existing Payload CMS setup.</li>
          <li>Collect feedback through a customizable widget.</li>
          <li>Analyze feedback using AI-powered tools.</li>
          <li>Integrate with third-party services like GitHub and Jules.</li>
        </ul>
        <h2>Getting Started</h2>
        <p>To get started, head over to the <a href="/admin">Payload Admin</a> panel to configure the plugin and start collecting feedback.</p>

        <button onClick={() => setShowWidget(true)} style={{ marginTop: '1rem' }}>
          Try it now
        </button>

        {showWidget && <FeedbackWidget feedbackApiUrl="/api/feedback" defaultBreadcrumbs={typeof window !== 'undefined' ? window.location.href : ''} />}
      </main>
    </div>
  )
}

export default HomePage
