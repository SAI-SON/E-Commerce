import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component:
 * Listens to location changes (both pathname and query search changes)
 * and scrolls the window smoothly to the top of the page.
 */
export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
