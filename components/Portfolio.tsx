'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { ArrowUpRight, ArrowDown, Github, Linkedin, Menu, X, Download, Mail, ChevronDown, Code2, Layers, Mic, Shirt, ChartNoAxesCombined, ShieldCheck, Award, GraduationCap, Users, Sparkles } from 'lucide-react';
import { profile, projects, experience, leadership, awards } from '@/lib/content';
import RobotHero from './RobotHero';
import ProjectArtwork from './ProjectArtwork';
import ContactForm from './ContactForm';

const sections = ['About', 'Experience', 'Projects', 'Leadership', 'Awards', 'Contact'];
const greeting = 'Hello, I am Dyuti.';
const heroSceneUrl = 'https://prod.spline.design/h12OeYmStwyAO-f6/scene.splinecode';


export default function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');
  const [typedText, setTypedText] = useState('');
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTypedText(greeting);
      return;
    }
    if (typedText.length >= greeting.length) return;
    const timer = setTimeout(() => {
      setTypedText(greeting.slice(0, typedText.length + 1));
    }, 90);
    return () => clearTimeout(timer);
  }, [typedText]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    }, { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="navbar">
      <a className="wordmark" href="#home">Dyuti Shraboni Ghosh</a>
      <nav aria-label="Main navigation" className={menuOpen ? 'nav-links open' : 'nav-links'} id="navigation" onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus(); } }}>
        {sections.map(section => <a key={section} href={`#${section.toLowerCase()}`} aria-current={active === section.toLowerCase() ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{section}</a>)}
      </nav>
      <button className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
    </header>
    <main id="main">
      <section id="home" className="hero">
        <div className="hero-copy hero-code-copy">
          <div className="hero-code-stage">
            <h1 className="hero-greeting" aria-label={greeting}>
              <span className="line-number" aria-hidden="true">01</span>
              <span className="line-core" aria-hidden="true">
                <span className="line-bracket">&lt;</span>
                <span className="line-text">{typedText}</span>
                {typedText.length < greeting.length && <span className="typing-cursor">|</span>}
                <span className="line-bracket">&gt;</span>
              </span>
            </h1>
            <div className={`hero-introduction${typedText === greeting ? ' is-visible' : ''}`}>
              <p className="intro-role">I'm a Software Engineering Student,</p>
              <p>Specialising in Data Science.</p>
              <p className="intro-university">@ University of Sydney.</p>
            </div>
          </div>
        </div>
        <RobotHero sceneUrl={heroSceneUrl} />
      </section>
      <section id="about" className="section dark-panel about">
        <h2>Engineering with<br/><em>people in mind.</em></h2>
        <div className="about-layout"><div className="about-body"><p className="lead">I’m Dyuti Shraboni Ghosh, a Software Engineering student and Dalyell Scholar at the University of Sydney.</p><p>I specialise in Engineering Data Science and enjoy work that connects software development, analytical thinking, and people. My experience includes delivering production and transport solutions for Hanlon Industries, building predictive models, and developing full-stack applications.</p><p>Alongside my studies, I teach programming at Code Camp, represent Engineers Australia, and lead mentors supporting first-year engineering students.</p><div className="education-card"><GraduationCap size={32} strokeWidth={1.4}/><h3>Bachelor of Engineering Honours</h3><p>Software Engineering · Engineering Data Science</p><p>University of Sydney · 2024–2027 (expected)</p><strong className="wam-stat"><span>83</span> WAM · Distinction average</strong></div></div><div className="skills-panel"><h3>Technical Skills</h3><div className="skill-grid"><div><h4>Languages</h4><p>Python, Java, C, C#, R, SQL</p></div><div><h4>Software Development</h4><p>.NET MAUI, Git, JUnit, Jenkins</p></div><div><h4>Data & Machine Learning</h4><p>pandas, NumPy, scikit-learn, Jupyter Notebooks</p></div><div><h4>Project Delivery</h4><p>Agile, stakeholder engagement, requirements gathering</p></div></div><div className="academic"><h3>Academic Foundation</h3><p>Data Structures & Algorithms · Object-Oriented Programming · Databases · Data Analytics · Operating Systems</p></div></div></div>
      </section>
      <section id="experience" className="section experience"><h2>Experience</h2><div className="experience-list">{experience.map((item, index) => <article className="experience-card" key={item.company}><span className="experience-index" aria-hidden="true">0{index + 1}</span><div className="card-heading"><div><h3>{item.company}</h3><p className="role">{item.role}</p><p className="organisation">{item.organisation}</p></div><span className="date-badge">{item.dates}</span></div><p>{item.summary}</p><ul>{item.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul></article>)}</div></section>
      <section id="projects" className="section dark-panel projects"><div className="section-heading"><h2>Selected <em>work.</em></h2><a href={profile.github} target="_blank" rel="noreferrer" className="all-projects">Explore GitHub <ArrowUpRight size={20}/></a></div><div className="project-grid">{projects.map((project) => {
        return <article className="project-card" key={project.name}><ProjectArtwork name={project.name} visual={project.visual}/><div className="project-copy"><div className="project-category"><span>{project.category.split(" / ")[0]}</span>{project.date && <span>{project.date}</span>}</div><h3>{project.name}</h3>{project.metric && <p className="project-metric">{project.metric}</p>}<p>{project.description}</p><details open><summary>Technologies <ChevronDown size={18}/></summary><div className="project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></details>{project.url && <a className="button project-link" href={project.url} target="_blank" rel="noreferrer">View project <ArrowUpRight size={18}/></a>}</div></article>;
      })}</div></section>
      <section id="leadership" className="section leadership"><h2>Leadership & Volunteering</h2><div className="leadership-list">{leadership.map((item, index) => <article className="leadership-card" key={item.role}><div className="leadership-stat"><strong>{["3+", "150+", "600+", "30"][index]}</strong><span>{["campus events", "students supported", "society members", "students per workshop"][index]}</span></div><div className="leadership-symbol" aria-hidden="true">{index % 2 === 0 ? <Users size={27} strokeWidth={1.3}/> : <Sparkles size={27} strokeWidth={1.3}/>}</div><div className="card-heading"><div><h3>{item.organisation}</h3><p className="role">{item.role}</p></div><span className="date-badge">{item.dates}</span></div><p>{item.summary}</p><p>{item.impact}</p></article>)}</div></section>
      <section id="awards" className="section awards"><h2>Awards</h2><div className="award-list">{awards.map((award,i) => <article className="award-card" key={award.name}><Award className="award-symbol" size={35} strokeWidth={1.2} aria-hidden="true"/><div className="card-heading"><div><h3>{award.name}</h3><p className="award-detail">{award.detail}</p><p className="award-description">{award.description}</p></div>{i === 3 && <span className="date-badge award-year">2025</span>}</div></article>)}</div></section>
      <section id="contact" className="section dark-panel contact">
        <h2>Let’s <em>Connect</em></h2>
        <p className="contact-intro">Always open to discussing new opportunities and projects.</p>
        <div className="contact-layout">
          <div className="contact-details">
            <h3>Get in Touch</h3>
            <div className="contact-grid">
              <a className="contact-item" href={`mailto:${profile.email}`}><Mail size={24}/><div><h3>Email</h3><span>{profile.email}</span></div><ArrowUpRight size={18}/></a>
              <a className="contact-item" href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={24}/><div><h3>LinkedIn</h3><span>Dyuti Ghosh</span></div><ArrowUpRight size={18}/></a>
              <a className="contact-item" href={profile.github} target="_blank" rel="noreferrer"><Github size={24}/><div><h3>GitHub</h3><span>dyuticodes</span></div><ArrowUpRight size={18}/></a>
              <a className="contact-item" href={profile.resume} download><Download size={24}/><div><h3>Résumé</h3><span>Download PDF</span></div><ArrowDown size={18}/></a>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
    <footer><span>© {new Date().getFullYear()} Dyuti Shraboni Ghosh</span><a href="#home">Back to top ↑</a></footer>
    <aside className="socials" aria-label="Social profiles"><a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={23}/></a>{profile.github ? <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={23}/></a> : <a href={`mailto:${profile.email}`} aria-label="Email Dyuti"><Mail size={23}/></a>}</aside>
  </>;
}
