'use client';

import { useEffect, useRef, useState } from 'react';

export default function RobotHero({ sceneUrl }: { sceneUrl?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !sceneUrl) return;
    let cancelled = false;
    let viewer: HTMLElement | undefined;
    const complete = () => { if (!cancelled) setIsReady(true); };
    setIsReady(false);

    async function mount() {
      if (!customElements.get('spline-viewer')) {
        if (!document.querySelector('script[data-spline-viewer]')) {
          const script = document.createElement('script');
          script.type = 'module';
          script.src = 'https://cdn.spline.design/@splinetool/viewer@2.0.46/build/spline-viewer.js';
          script.dataset.splineViewer = 'true';
          document.head.appendChild(script);
        }
        await customElements.whenDefined('spline-viewer');
      }
      if (cancelled || !host) return;
      viewer = document.createElement('spline-viewer');
      viewer.setAttribute('url', sceneUrl!);
      viewer.setAttribute('loading', 'eager');
      viewer.setAttribute('events-target', 'global');
      viewer.setAttribute('background', getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
      viewer.addEventListener('load-complete', complete);
      host.appendChild(viewer);
    }
    void mount().catch(() => { if (!cancelled) setIsReady(false); });
    return () => {
      cancelled = true;
      viewer?.removeEventListener('load-complete', complete);
      viewer?.remove();
    };
  }, [sceneUrl]);

  return <div className="robot-visual" data-ready={isReady}>
    <div className="robot-stage" ref={hostRef} aria-label="Interactive robot scene" />
  </div>;
}
