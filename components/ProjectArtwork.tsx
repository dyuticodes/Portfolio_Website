import { ArrowUpRight, Layers, Mic, ShieldCheck, Code2 } from 'lucide-react';

// Graphic covers, rather than simulated application screenshots.
export default function ProjectArtwork({ name, visual }: { name: string; visual: string }) {
  const wdac = name.startsWith('WDAC');
  const Icon = visual === 'engineering' ? Layers : visual === 'interview' ? Mic : visual === 'system' ? ShieldCheck : Code2;
  return <div className={`project-artwork ${visual}`} aria-hidden="true">
    <div className="artwork-top"><span>{wdac ? 'OECD / WELLBEING' : visual === 'refit' ? 'SHARE. WEAR. REPEAT.' : visual === 'engineering' ? 'FROM FACTORY TO DELIVERY' : visual === 'data' ? 'NEW YORK / HOUSING' : 'DESIGNED TO SOLVE'}</span><ArrowUpRight size={24}/></div>
    {wdac ? <div className="data-poster"><div><strong>47</strong><span>countries & areas</span></div><div className="data-bars">{[37,62,48,88,73,100,58,80].map((height,i)=><i key={i} style={{height:`${height}%`}}/>)}</div></div>
      : visual === 'refit' ? <div className="refit-poster"><span>Re:</span><strong>Fit</strong><i>↻</i></div>
      : visual === 'data' ? <div className="housing-poster"><strong>NYC.</strong><span>1,734 records.<br/>One complex market.</span></div>
      : <div className="system-poster"><Icon strokeWidth={1} size={92}/><strong>{visual === 'engineering' ? 'Hanlon\nFab.' : visual === 'interview' ? 'MOCKOR' : visual === 'planner' ? 'Plan your\nnext step.' : 'Access,\ncontrolled.'}</strong></div>}
    <div className="artwork-bottom"><span>{wdac ? 'PROSPERITY ≠ QUALITY OF LIFE' : visual === 'refit' ? 'A SECOND LIFE FOR YOUR WARDROBE' : visual === 'engineering' ? 'WORKFLOWS, CONNECTED.' : visual === 'data' ? 'REGRESSION × RANDOM FOREST' : 'SOFTWARE / HUMAN POSSIBILITIES'}</span></div>
  </div>;
}
