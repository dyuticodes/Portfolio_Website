'use client';

import { createElement } from 'react';

export default function RobotHero({ sceneUrl }: { sceneUrl?: string }) {
  return <div className="robot-visual">
    <div className="robot-stage" aria-label="Interactive robot scene">
      {createElement('spline-viewer', {
        url: sceneUrl,
        loading: 'eager',
        'events-target': 'global',
        background: '#f2f5f9',
      })}
    </div>
  </div>;
}
