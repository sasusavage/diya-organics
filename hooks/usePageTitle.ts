'use client';

import { useEffect } from 'react';

const SITE_NAME = 'Diya Organics';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Pure Ayurvedic Hair Care`;
  }, [title]);
}
