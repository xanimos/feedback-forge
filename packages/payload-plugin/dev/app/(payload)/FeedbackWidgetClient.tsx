'use client';

import { FeedbackWidget } from '@feedback-forge/react-widget';
import React, { useEffect, useState } from 'react';

export const FeedbackWidgetClient: React.FC = () => {
  const [breadcrumbs, setBreadcrumbs] = useState('');

  useEffect(() => {
    setBreadcrumbs(window.location.href);
  }, []);

  return <FeedbackWidget serverURL='/api' defaultBreadcrumbs={breadcrumbs} />;
};
