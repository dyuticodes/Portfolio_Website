'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Github, Linkedin, Menu, X, Download, Mail, ShieldCheck } from 'lucide-react';
import { profile, projects, experience, leadership, awards, skills } from '@/lib/content';

const sections = ['About', 'Experience', 'Projects', 'Leadership', 'Awards', 'Contact'];
const Robot = dynamic(() => import('./Robot'), { ssr: false, loading: () => <div className="robot-visual" aria-label="Loading interactive robot" /> });

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .08 }} transition={{ duration: .6 }}>{children}</motion.div>;
}

function SectionTitle({ number, label, title }: { number: string; label: string; title: string }) {
  return <div className="section-heading"><p className="eyebrow"><span>{number}</span> {label}</p><h2>{title}</h2></div>;
}

function ProjectVisual({ type }: { type: string }) {
  if (type === 'planner') return <div className="planner-window"><div className="window-top"><i/><i/><i/></div><div className="planner-title">Your next chapter.<span>DEGREE CURRICULUM PLANNER</span></div><div className="planner-grid">{Array.from({length:9},(_,j)=><i key={j}/>)}</div></div>;
  if (type === 'interview') return <div className="interview-graphic"><div className="wave">{[18,32,54,78,42,92,66,38,70,48,26,14].map((height,j)=><i style={{height}} key={j}/>)}</div><span>MOCKOR<span className="little-dot"/></span><small>A conversation with possibility.</small></div>;
  if (type === 'refit') return <div className="refit-graphic"><span>Re:Fit</span><p>Good clothes. New stories.</p><div><i/><i/><i/></div></div>;
  if (type === 'data') return <svg className="data-graphic" viewBox="0 0 280 180"><path d="M25 15V150H260" fill="none" stroke="currentColor" opacity=".4"/><path d="M30 137L250 35" fill="none" stroke="#802c40" strokeWidth="2"/>{Array.from({length:30},(_,i)=><circle key={i} cx={35+i*7.2} cy={139-i*3.1+Math.sin(i*2.3)*26} r="3.5" fill="#802c40" opacity=".6"/>)}<text x="180" y="174" fontSize="11" fill="currentColor">R² ≈ 0.64</text></svg>;
  if (type === 'system') return <div className="system-graphic"><ShieldCheck size={70} strokeWidth={1}/><span>ACCESS GRANTED</span><code>authenticate → authorise → access</code></div>;
  return <div className="engineering-graphic"><div/><div/><div/><span>IDEA → ANALYSIS → IMPACT</span></div>;
}

export default function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="navbar">
      <a className="wordmark" href="#home">Dyuti Ghosh<span>.</span></a>
      <nav aria-label="Main navigation" className={menuOpen ? 'nav-links open' : 'nav-links'} id="navigation" onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus(); } }}>
        {sections.map(section => <a key={section} href={`#${section.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{section}</a>)}
      </nav>
      <button className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
    </header>
    <main id="main">
      <section id="home" className="hero">
        <Reveal className="hero-copy">
          <h1>Hi,<br/>I am <span>Dyuti</span><span className="period">.</span></h1>
          <p className="hero-description">Software Engineering student<br/>specialising in <strong>Engineering Data Science</strong></p>
          <p className="university">@ The University of Sydney</p>
          <div className="hero-actions"><a className="button primary" href="#projects">Explore my work <ArrowUpRight size={20}/></a><a className="text-link" href={profile.resume} download>Download résumé <Download size={20}/></a></div>
        </Reveal>
        <Robot/>
        <div className="hero-bottom"><a href="#about"><ArrowDown size={17}/> SCROLL TO EXPLORE</a><span>SOFTWARE · DATA · PEOPLE</span><span>BASED IN SYDNEY, AU</span></div>
      </section>
      <div className="interest-strip"><span>Engineering thoughtful solutions.</span><span className="asterisk">✳</span><span>Turning data into possibilities.</span><span className="asterisk">✳</span><span>Building with people, for people.</span></div>
      <section id="about" className="section about">
        <Reveal><SectionTitle number="01" label="ABOUT" title="A little about me."/><div className="education-card"><p className="eyebrow">UNIVERSITY OF SYDNEY</p><h3>Bachelor of Engineering Honours</h3><p>Software Engineering<br/>Engineering Data Science specialisation</p><span>2024 — Expected November 2027</span><div className="education-stats"><div><strong>83</strong><span>WAM · Distinction average</span></div><div><strong>Dalyell</strong><span>Scholar</span></div></div></div></Reveal>
        <Reveal className="about-body"><h3>At the intersection of<br/>code, data <em>& people.</em></h3><p>I’m Dyuti Shraboni Ghosh, a Software Engineering student and Dalyell Scholar at the University of Sydney. I combine software development and data analysis with a strong interest in engineering consulting.</p><p>From delivering production and transport solutions for Hanlon Industries to building predictive models and full-stack applications, I enjoy turning complex requirements into practical outcomes.</p><p>Beyond the code, I teach programming, lead engineering mentors, and help connect students with the wider engineering community.</p><div className="skills">{skills.map(skill => <span key={skill}>{skill}</span>)}</div></Reveal>
      </section>
      <section id="experience" className="section">
        <Reveal><SectionTitle number="02" label="EXPERIENCE" title="Learning by doing."/></Reveal>
        <div className="experience-list">{experience.map((item,i) => <Reveal className="experience-row" key={item.company}><span className="row-number">0{i+1}</span><div className="experience-company"><h3>{item.company}</h3><p>{item.organisation}</p><span className="role-date">{item.dates}</span></div><div className="experience-detail"><h4>{item.role}</h4><p>{item.summary}</p><ul>{item.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul></div></Reveal>)}</div>
      </section>
      <section id="projects" className="section projects">
        <Reveal><SectionTitle number="03" label="SELECTED PROJECTS" title="Ideas, made tangible."/></Reveal>
        <div className="project-grid">{projects.map((project, i) => <Reveal className="project-card" key={project.name}>
          <div className={`project-visual ${project.visual}`} aria-hidden="true"><span className="project-index">DG / 0{i+1}</span><ProjectVisual type={project.visual}/></div>
          <div className="project-info"><p className="eyebrow">{project.category}</p><h3>{project.name}</h3>{project.date && <span className="role-date">{project.date}</span>}<p>{project.description}</p>{project.metric && <p className="project-metric">{project.metric}</p>}<div className="project-tags">{project.tags.map(tag=><span key={tag}>{tag}</span>)}</div>{project.url && <a className="text-link" href={project.url} target="_blank" rel="noreferrer">View project <ArrowUpRight size={18}/></a>}</div>
        </Reveal>)}</div>
      </section>
      <section id="leadership" className="section">
        <Reveal><SectionTitle number="04" label="LEADERSHIP" title="Growing, together."/></Reveal>
        <div className="leadership-grid">{leadership.map(item => <Reveal className="leadership-card" key={item.role}><span className="leadership-symbol" aria-hidden="true">{item.symbol}</span><p className="eyebrow">{item.organisation}</p><h3>{item.role}</h3><span className="role-date">{item.dates}</span><p>{item.summary}</p><p>{item.impact}</p></Reveal>)}</div>
      </section>
      <section id="awards" className="section awards">
        <Reveal><SectionTitle number="05" label="AWARDS & RECOGNITION" title="Milestones along the way."/></Reveal>
        <Reveal className="award-list">{awards.map((award, i)=><div className="award-row" key={award.name}><span className="award-star" aria-hidden="true">✧</span><div><h3>{award.name}</h3><p>{award.detail}</p></div><span className="award-index">0{i+1}</span></div>)}</Reveal>
      </section>
      <section id="contact" className="section contact">
        <Reveal><p className="eyebrow"><span>06</span> WHAT’S NEXT?</p><h2>Let’s build<br/>something <em>meaningful.</em></h2><p>Have an interesting idea, an opportunity, or a shared curiosity?<br/>I’d love to connect.</p><a className="contact-email" href={`mailto:${profile.email}`}>{profile.email} <ArrowUpRight size={24}/></a><div className="contact-links"><a className="button primary" href={`mailto:${profile.email}`}>Say hello <Mail size={20}/></a><a className="text-link" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={20}/></a>{profile.github && <a className="text-link" href={profile.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={20}/></a>}<a className="text-link" href={profile.resume} download>Résumé <Download size={20}/></a></div></Reveal><div className="contact-decoration" aria-hidden="true">✳</div>
      </section>
    </main>
    <footer><a className="wordmark" href="#home">Dyuti Ghosh<span>.</span></a><span>Made with curiosity & intention.</span><a href="#home">Back to top ↑</a></footer>
    <aside className="socials" aria-label="Social profiles"><a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={24}/></a>{profile.github ? <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={24}/></a> : <a href={`mailto:${profile.email}`} aria-label="Email Dyuti"><Mail size={24}/></a>}</aside>
  </>;
}
