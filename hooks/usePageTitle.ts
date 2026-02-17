'use client';

import { useEffect } from 'react';

const SITE_NAME = 'WIDAMA Pharmacy';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Quality Medicines & Healthcare Services`;
  }, [title]);
}
