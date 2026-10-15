"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FiArrowDown, FiArrowRight, FiCode, FiMoon, FiSun } from "react-icons/fi";
import { FaEnvelope, FaGithub, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { SiNextdotjs, SiReact, SiTypescript, SiTailwindcss, SiSupabase } from "react-icons/si";

const projects = [
  { name: "Project one", type: "Web application", stack: ["Next.js", "TypeScript"], status: "Replace with a real project", number: "01" },
  { name: "Project two", type: "E-commerce", stack: ["React", "Supabase"], status: "Replace with a real project", number: "02" },
  { name: "Project three", type: "Content platform", stack: ["Next.js", "PostgreSQL"], status: "Replace with a real project", number: "03" },
];

const services = [
  ["01", "Web applications", "A clear, responsive experience built around the people who use it."],
  ["02", "Frontend development", "Thoughtful interfaces with strong foundations and accessible details."],
  ["03", "Full stack development", "From the first screen to data, APIs, and deployment."],
  ["04", "E-commerce", "Product and checkout experiences designed to feel simple and trustworthy."],
  ["05", "API integrations", "Connect the tools and services your product depends on."],
  ["06", "Ongoing support", "Careful updates, fixes, and improvements as your product grows."],
];

const links = [{ label: "Home", target: "home" }, { label: "About", target: "about" }, { label: "Projects", target: "projects" }, { label: "Services", target: "services" }, { label: "Blog", target: "journal" }, { label: "Contact", target: "contact" }];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All work");
  const filtered = useMemo(() => projects.filter((project) =>
    `${project.name} ${project.type} ${project.stack.join(" ")}`.toLowerCase().includes(query.toLowerCase()) &&
    (filter === "All work" || project.type === filter)), [query, filter]);

  return <>
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label="Jatin Kr. Koli home"><FiCode aria-hidden="true" /><b>Jatin Kr. Koli</b></a>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? "Close" : "Menu"}</button>
      <nav className={menuOpen ? "nav-links nav-open" : "nav-links"} aria-label="Main navigation">
        {links.map(({ label, target }, index) => <a className={index === 0 ? "active" : undefined} key={target} href={`#${target}`} onClick={() => setMenuOpen(false)}>{label}</a>)}
      </nav>
      <button className="theme-toggle" onClick={() => { document.documentElement.dataset.theme = isLight ? "dark" : "light"; setIsLight(!isLight); }} aria-label={`Switch to ${isLight ? "dark" : "light"} theme`}><FiSun aria-hidden="true" /><FiMoon aria-hidden="true" /></button>
    </header>

    <main>
      <section className="hero section-wrap" id="home">
        <div className="hero-copy">
          <div className="hero-greeting">HELLO, I’M <span /></div>
          <h1>Jatin <span>Kr. Koli</span></h1>
          <h2 className="hero-role">Full Stack Developer</h2>
          <p className="hero-lede">I build modern, scalable and user-friendly web applications. Passionate about clean code, great user experiences, and turning ideas into reality.</p>
          <div className="hero-actions"><a className="button button-primary" href="#projects">View My Work <FiArrowRight aria-hidden="true" /></a><a className="button hero-hire" href="#contact">Hire Me</a></div>
          <a className="resume-link" href="#contact"><FiArrowDown aria-hidden="true" /> <span>Resume available on request</span></a>
          <div className="hero-socials" aria-label="Social profiles">
            <span aria-label="Instagram profile not yet provided"><FaInstagram /></span>
            <span aria-label="LinkedIn profile not yet provided"><FaLinkedinIn /></span>
            <a href="https://github.com/codeswithdark83-sudo" target="_blank" rel="noreferrer" aria-label="GitHub"><FaGithub /></a>
            <span aria-label="WhatsApp profile not yet provided"><FaWhatsapp /></span>
            <a href="#contact" aria-label="Email contact"><FaEnvelope /></a>
          </div>
          <div className="tech-stack"><div className="tech-title">Tech Stack <span /></div><div className="tech-items">
            <div><SiNextdotjs /><span>Next.js</span></div><div><SiReact /><span>React</span></div><div><SiTypescript /><span>TypeScript</span></div><div><SiTailwindcss /><span>Tailwind CSS</span></div><div><SiSupabase /><span>Supabase</span></div>
          </div></div>
        </div>
        <div className="hero-visual">
          <Image src="/images/jatin-portrait.webp" alt="Jatin Kr. Koli in his development workspace" fill priority sizes="(max-width: 640px) 55vw, 42vw" className="portrait-image" />
          <div className="portrait-fade" aria-hidden="true" />
        </div>
      </section>

      <section className="intro section-wrap" id="about">
        <div className="section-kicker"><span>01</span> / A little about me</div>
        <div className="intro-content"><h2>Good work lives<br />at the intersection of<br /><span>clarity &amp; craft.</span></h2><div className="intro-aside"><p>I enjoy taking an idea from a rough sketch to a finished product—making considered choices along the way, from the smallest interaction to the shape of the system behind it.</p><a href="#contact" className="text-link">More about me <span>↗</span></a></div></div>
        <div className="principles"><div><span>01</span><b>Thoughtful by default</b><small>Purpose before pixels.</small></div><div><span>02</span><b>Built to last</b><small>Solid foundations, no shortcuts.</small></div><div><span>03</span><b>Always curious</b><small>There’s always more to learn.</small></div></div>
      </section>

      <section className="work section-wrap" id="projects">
        <div className="section-top"><div><div className="section-kicker"><span>02</span> / Selected work</div><h2>Projects with<br /><span>purpose.</span></h2></div><p>A few things I’ve been working on.<br />Details will be updated with real project work.</p></div>
        <div className="work-tools"><label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects" aria-label="Search projects" /></label><div className="filter-group">{["All work", "Web application", "E-commerce"].map((item) => <button key={item} className={filter === item ? "filter active" : "filter"} onClick={() => setFilter(item)}>{item}</button>)}</div><span className="result-count">{String(filtered.length).padStart(2, "0")} PROJECTS</span></div>
        <div className="project-grid">{filtered.map((project) => <article className="project-card" key={project.number}>
          <div className={`project-art art-${project.number}`}><div className="browser-bar"><span /><span /><span /><i>{project.name.toLowerCase().replaceAll(" ", "-")}.app</i></div><div className="mock-interface"><div className="mock-sidebar"><b>◦</b><b>◦</b><b>◦</b><b>◦</b></div><div className="mock-content"><span className="mock-label">OVERVIEW</span><div className="mock-title" /><div className="mock-stats"><i /><i /><i /></div><div className="mock-chart"><i /><i /><i /><i /><i /><i /><i /></div></div></div><span className="project-number">{project.number}</span><span className="art-glow" /></div>
          <div className="project-meta"><div><span className="project-type">{project.type}</span><h3>{project.name}</h3></div><span className="project-arrow">↗</span></div><div className="project-tags">{project.stack.map((stack) => <span key={stack}>{stack}</span>)}<span className="draft-tag">Draft content</span></div>
        </article>)}</div>
        {filtered.length === 0 && <p className="empty-state">No matching projects. Try another search.</p>}
        <p className="content-note">Project names and previews are placeholders. Replace them with verified work before publishing your portfolio.</p>
      </section>

      <section className="services section-wrap" id="services">
        <div className="section-top"><div><div className="section-kicker"><span>03</span> / What I can help with</div><h2>From idea<br />to <span>impact.</span></h2></div><p>Practical development support for<br />the full life of a digital product.</p></div>
        <div className="service-grid">{services.map(([n, title, desc]) => <article className="service-card" key={n}><div className="service-top"><span>{n}</span><span>↗</span></div><h3>{title}</h3><p>{desc}</p></article>)}</div>
        <div className="service-cta"><div><span className="cta-eyebrow">HAVE SOMETHING IN MIND?</span><h3>Let’s make it<br /><span>real.</span></h3></div><a className="button button-primary" href="#contact">Tell me about it <span>↗</span></a></div>
      </section>

      <section className="journal section-wrap" id="journal"><div className="section-kicker"><span>04</span> / Notes from the process</div><div className="journal-row"><h2>Ideas in<br /><span>progress.</span></h2><div className="journal-entry"><span>COMING SOON <span>·</span> WRITING</span><h3>A space for notes on design, development, and the things I’m learning along the way.</h3><p>Articles will appear here when they’re ready.</p><a href="#contact" className="text-link">Get in touch <span>↗</span></a></div></div></section>

      <section className="credentials section-wrap" id="credentials"><div className="section-kicker"><span>05</span> / The foundations</div><div className="credentials-head"><h2>Learning<br /><span>in motion.</span></h2><p>A growing toolkit, shaped by curiosity<br />and the projects I take on.</p></div><div className="skills-layout"><div className="skills-list"><div><span>01</span><b>Frontend</b><p>Replace with verified frontend skills</p></div><div><span>02</span><b>Backend</b><p>Replace with verified backend skills</p></div><div><span>03</span><b>Tools &amp; workflow</b><p>Replace with verified tools</p></div></div><div className="credentials-note"><span>CONTENT NOTE</span><p>Education, certifications, and experience details are intentionally omitted until verified information is available.</p><a href="#contact" className="text-link">Share an update <span>↗</span></a></div></div></section>

      <section className="contact section-wrap" id="contact"><div className="contact-main"><div className="section-kicker"><span>06</span> / Your next move</div><h2>Have a good<br /><span>one in mind?</span></h2><p>Tell me a little about what you’re building. We can take it from there.</p><a className="button button-primary" href="mailto:hello@example.com?subject=Portfolio%20inquiry">Email me <span>↗</span></a><small className="placeholder-note">Replace hello@example.com with your real email address.</small></div><div className="contact-side"><div className="contact-card"><span>BASED IN</span><b>Location to confirm</b><small>Availability to confirm</small></div><div className="contact-card"><span>ELSEWHERE</span><div className="social-links"><a href="https://github.com/codeswithdark83-sudo" target="_blank" rel="noreferrer">GitHub <span>↗</span></a><span>LinkedIn · add profile</span><span>Instagram · add profile</span></div><small>Social profile links need to be confirmed.</small></div></div></section>
    </main>

    <footer className="site-footer"><a className="wordmark" href="#home">J<span>.</span> Koli</a><span>Thoughtfully built, one detail at a time.</span><a href="#home">Back to top ↑</a><small>© 2026 Jatin Kr. Koli</small></footer>
  </>;
}

