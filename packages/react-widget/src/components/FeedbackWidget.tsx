'use client';

import React, { useState } from 'react';

interface FeedbackWidgetStyles {
  button?: React.CSSProperties;
  formContainer?: React.CSSProperties;
  input?: React.CSSProperties;
  textarea?: React.CSSProperties;
  widgetContainer?: React.CSSProperties;
  closeButton?: React.CSSProperties;
}

interface FeedbackWidgetProps {
  /**
   * The URL of the feedback API endpoint.
   */
  feedbackApiUrl: string;
  /**
   * Optional user data to associate with the feedback.
   */
  user?: {
    id: number | string;
  };
  /**
   * Optional default value for the title.
   */
  defaultTitle?: string;
  /**
   * Optional default value for the feedback.
   */
  defaultFeedback?: string;
  /**
   * Optional default value for the breadcrumbs.
   */
  defaultBreadcrumbs?: string;
  /**
   * Optional custom styles for the widget components.
   */
  customStyles?: FeedbackWidgetStyles;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  feedbackApiUrl,
  user,
  defaultTitle = '',
  defaultFeedback = '',
  defaultBreadcrumbs = '',
  customStyles,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [feedback, setFeedback] = useState(defaultFeedback);
  const [breadcrumbs, setBreadcrumbs] = useState(defaultBreadcrumbs);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(feedbackApiUrl, {
        body: JSON.stringify({
          breadcrumbs: breadcrumbs || 'Submitted via public widget',
          feedback,
          title,
          user: user?.id,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.errors?.[0]?.message || 'Failed to submit feedback.');
      }

      setSuccess(true);
      setTitle('');
      setFeedback('');
      setBreadcrumbs('');
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Basic styling for the widget. Users can override this with their own styles.
  const defaultStyles = {
    button: {
      backgroundColor: '#007bff',
      border: 'none',
      borderRadius: '5px',
      color: 'white',
      cursor: 'pointer',
      padding: '10px 20px',
    },
    formContainer: {
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '5px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      padding: '20px',
      width: '300px',
    },
    input: {
      boxSizing: 'border-box',
      margin: '5px 0 10px 0',
      padding: '8px',
      width: '100%',
    },
    textarea: {
      boxSizing: 'border-box',
      margin: '5px 0 10px 0',
      minHeight: '100px',
      padding: '8px',
      width: '100%',
    },
    widgetContainer: {
      bottom: '20px',
      position: 'fixed',
      right: '20px',
      zIndex: 1000,
    },
    closeButton: {
      backgroundColor: '#6c757d',
      marginLeft: '10px',
    },
  } as const;

  const styles = {
    button: { ...defaultStyles.button, ...customStyles?.button },
    formContainer: { ...defaultStyles.formContainer, ...customStyles?.formContainer },
    input: { ...defaultStyles.input, ...customStyles?.input },
    textarea: { ...defaultStyles.textarea, ...customStyles?.textarea },
    widgetContainer: { ...defaultStyles.widgetContainer, ...customStyles?.widgetContainer },
    closeButton: { ...defaultStyles.closeButton, ...customStyles?.closeButton },
  };

  return (
    <div style={styles.widgetContainer}>
      {isOpen ? (
        <div style={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            <h3>Submit Feedback</h3>
            <input
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Title'
              required
              style={styles.input}
              type='text'
              value={title}
            />
            <textarea
              onChange={(e) => setFeedback(e.target.value)}
              placeholder='Describe your issue or idea...'
              required
              style={styles.textarea}
              value={feedback}
            />
            <input
              onChange={(e) => setBreadcrumbs(e.target.value)}
              placeholder='Breadcrumbs (optional)'
              style={styles.input}
              type='text'
              value={breadcrumbs}
            />
            <button disabled={isSubmitting} style={styles.button} type='submit'>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              style={{ ...styles.button, ...styles.closeButton }}
              type='button'
            >
              Close
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>Feedback submitted successfully!</p>}
          </form>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} style={styles.button}>
          Feedback
        </button>
      )}
    </div>
  );
};
