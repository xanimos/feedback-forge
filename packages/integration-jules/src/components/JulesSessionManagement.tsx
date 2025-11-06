'use client';

import type { TextFieldClientComponent } from 'payload';

import { useDocumentInfo, useFormFields } from '@payloadcms/ui';
import React, { useEffect, useState } from 'react';

import type { Feedback } from '@feedback-forge/core';

export const JulesSessionManagement: TextFieldClientComponent = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const [copied, setCopied] = useState(false);

  const { id: feedbackId } = useDocumentInfo();
  const julesSessionId = useFormFields(([fields]) => fields.julesSessionId)
    ?.value as Feedback['julesSessionId'];
  const developerPrompt = useFormFields(([fields]) => fields.developerPrompt)
    ?.value as Feedback['developerPrompt'];

  const title = useFormFields(([fields]) => fields.title)?.value as Feedback['title'];
  const status = useFormFields(([fields]) => fields.status)?.value as Feedback['status'];

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

  if (!feedbackId) {
    return null;
  }

  const handleStartSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback-forge/start-jules-session', {
        body: JSON.stringify({
          developerPrompt: developerPrompt ?? '',
          feedbackId,
          title,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!response.ok) {
        const res = await response
          .json()
          .catch(() => ({ error: 'Failed to parse error response.' }));
        throw new Error(res.error || `Request failed with status ${response.status}`);
      }

      // Refresh the page to show the new session ID and updated status
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to copy the developer prompt to the clipboard
  const handleCopy = () => {
    // Ensure there's a value to copy
    if (developerPrompt) {
      // Use the Clipboard API to copy the text
      navigator.clipboard
        .writeText(developerPrompt)
        .then(() => {
          setCopied(true);
          // Reset the "Copied!" message after 2 seconds
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
        });
    }
  };
  const julesConsoleUrl =
    process.env.NEXT_PUBLIC_JULES_CONSOLE_URL || 'https://jules.google.com/session/';

  if (isLoadingSettings) {
    return <div>Loading...</div>;
  }

  if (!settings?.jules?.enabled) {
    return null;
  }

  if (julesSessionId) {
    return (
      <div className='bg-[#2B2B2B] p-6 rounded-lg border border-gray-700 shadow-md font-sans'>
        <h3 className='text-gray-200 font-semibold text-base mb-3'>Jules Session Active</h3>
        <div className='bg-gray-800 p-4 rounded-md flex items-center justify-between'>
          <p className='text-gray-400 text-sm'>
            <strong className='font-medium text-gray-200'>Session ID:</strong>
            <span className='ml-2 font-mono bg-gray-900 text-green-400 px-2 py-1 rounded'>
              {julesSessionId}
            </span>
          </p>
        </div>
        <a
          className='inline-block mt-4'
          href={`${julesConsoleUrl}/${julesSessionId}`}
          rel='noopener noreferrer'
          target='_blank'
        >
          <button
            className='bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500'
            type='button'
          >
            Monitor Session
          </button>
        </a>
      </div>
    );
  }
  // Otherwise, show the form to start a new session.
  return (
    <div className='bg-[#2B2B2B] p-6 rounded-lg border border-gray-700 shadow-md space-y-4 font-sans'>
      <div className='flex justify-between items-center'>
        <label className='block text-gray-200 font-semibold text-base'>Developer Prompt</label>
      </div>

      {/* Code block display for the developer prompt */}
      <div className='relative bg-[#1e1e1e] border border-gray-600 rounded-md'>
        <button
          className='absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold py-1 px-2 rounded-md transition-colors duration-200 flex items-center'
          onClick={handleCopy}
          type='button'
        >
          <svg
            className='mr-1.5'
            fill='none'
            height='12'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            viewBox='0 0 24 24'
            width='12'
            xmlns='http://www.w3.org/2000/svg'
          >
            <rect height='13' rx='2' ry='2' width='13' x='9' y='9'></rect>
            <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'></path>
          </svg>
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <pre className='p-4 pt-8 text-gray-300 text-sm overflow-x-auto'>
          <code className='font-mono whitespace-pre-wrap'>
            {developerPrompt || 'No developer prompt provided.'}
          </code>
        </pre>
      </div>

      <div>
        <button
          className='bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed'
          disabled={isLoading || status !== 'received'}
          onClick={handleStartSession}
          type='button'
        >
          {isLoading ? 'Starting...' : 'Start Jules Session'}
        </button>
        {status !== 'received' && (
          <p className='text-gray-500 text-xs mt-2'>
            A session can only be started when the status is ‘Received’.
          </p>
        )}
        {error && <p className='text-red-400 text-sm mt-2'>Error: {error}</p>}
      </div>
    </div>
  );
};
