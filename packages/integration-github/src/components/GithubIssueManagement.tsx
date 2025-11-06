'use client';

import React, { useEffect, useState } from 'react';
import { useField } from '@payloadcms/ui/forms/useField';

export const GithubIssueManagement: React.FC<{ path: string }> = ({ path }) => {
  const { value: feedbackId } = useField<number>({ path: 'id' });
  const { value: issueUrl, setValue: setIssueUrl } = useField<string>({ path: 'githubIssueUrl' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/feedback-settings');
        if (!res.ok) {
          throw new Error('Failed to fetch settings');
        }
        const data = await res.json();
        setSettings(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/create-github-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedbackId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create issue');
      }

      const data = await res.json();
      setIssueUrl(data.issueUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingSettings) {
    return <div>Loading...</div>;
  }

  if (!settings?.github?.enabled) {
    return null;
  }

  if (issueUrl) {
    return (
      <div>
        <a href={issueUrl} target='_blank' rel='noopener noreferrer'>
          View GitHub Issue
        </a>
      </div>
    );
  }

  return (
    <div>
      <button type='button' onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Creating Issue...' : 'Create GitHub Issue'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
