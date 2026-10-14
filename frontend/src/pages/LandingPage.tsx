import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale, FileSearch, MessageSquare, CheckSquare,
  ShieldCheck, Users, Zap, ArrowRight, Lock, BarChart3,
  Menu, X
} from 'lucide-react';

const features = [
  {
    icon: <FileSearch size={22} />,
    title: 'Intelligent Document Search',
    desc: 'Upload any legal PDF and instantly search through its content with keyword and TF-IDF ranked retrieval. Every result is pinned to its exact page.',
  },
  {
    icon: <MessageSquare size={22} />,
    title: 'Evidence-Grounded Q&A',
    desc: 'Ask questions in plain English and receive answers backed by direct quotes and page citations — never a fabricated response.',
  },
  {
    icon: <CheckSquare size={22} />,
    title: 'Compliance Checklist',
    desc: 'Automatically scan for termination clauses, confidentiality terms, governing law and more. Flag items for review with a single click.',
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'Role-Based Access Control',
    desc: 'Three-tier permission model — Administrators, Legal Reviewers and Read-Only users — with server-side enforcement on every request.',
  },
  {
    icon: <Lock size={22} />,
    title: 'Secure by Design',
    desc: 'JWT authentication, bcrypt password hashing, IDOR prevention, rate limiting and a full audit log for every security-relevant event.',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Audit & Activity Logs',
    desc: 'Every login, upload, search and review action is recorded with actor, timestamp and outcome — giving administrators full visibility.',
  },
];

const roles = [
  {
    badge: 'role-badge-admin',
    label: 'Administrator',
    title: 'Full Platform Control',
    perms: [
      'Manage all users and permissions',
      'View complete audit logs',
      'Access all documents',
      'Upload and analyse documents',
      'Run compliance checklists',
    ],
  },
  {
    badge: 'role-badge-reviewer',
    label: 'Legal Reviewer',
    title: 'Document Analysis',
    perms: [
      'Upload PDF documents',
      'Run compliance checklists',
      'Add reviewer notes to findings',
      'Search and ask questions',
      'View own documents',
    ],
  },
  {
    badge: 'role-badge-readonly',
    label: 'Read-Only',
    title: 'Controlled Viewing',
    perms: [
      'View shared documents',
      'Search document content',
      'Ask questions',
      'No upload or edit access',
      'No admin access',
    ],
  },
];

const navLinks = [
  { label: 'Features',      href: '#features' },
  { label: 'Access Control', href: '#access-control' },
  { label: 'About',         href: '#about' },
];

function scrollTo(id: string) {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function LandingPage() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [activeSection, setActiveSection] = useState('');

  /* ── scroll effects ── */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      // highlight active nav link
      const sections = ['features', 'access-control', 'about'];
      let current = '';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    scrollTo(href);
  };

  return (
    <div className="landing">

      {/* ════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════ */}
      <nav
        className="landing-nav"
        style={{
          boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.25)' : 'none',
          background: scrolled ? 'rgba(15,23,42,0.98)' : 'var(--color-secondary)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          transition: 'box-shadow 0.2s, background 0.2s',
        }}
      >
        {/* Brand */}
        <a
          href="/"
          className="landing-nav-brand"
          aria-label="LexAI home"
          style={{ textDecoration: 'none' }}
        >
          <div className="landing-nav-brand-icon">
            <Scale size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em' }}>LexAI</span>
        </a>

        {/* Desktop nav links (centre) */}
        <div className="landing-nav-links-desktop">
          {navLinks.map(link => {
            const sectionId = link.href.replace('#', '');
            const isActive  = activeSection === sectionId;
            return (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="landing-nav-link"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isActive ? '#fff' : '#94a3b8',
                  fontWeight: isActive ? 600 : 500,
                  borderBottom: isActive ? '2px solid var(--color-primary-mid)' : '2px solid transparent',
                  borderRadius: 0,
                  paddingBottom: 6,
                }}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Desktop actions */}
        <div className="landing-nav-actions landing-nav-actions-desktop">
          <Link to="/login" className="landing-nav-link">Sign in</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">
            Get started <ArrowRight size={13} />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="landing-nav-hamburger"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} color="#fff" /> : <Menu size={22} color="#fff" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="landing-nav-mobile-drawer">
          {navLinks.map(link => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="landing-nav-mobile-link"
            >
              {link.label}
            </button>
          ))}
          <div className="landing-nav-mobile-actions">
            <Link to="/login"  className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', borderColor: 'rgba(255,255,255,0.15)', color: '#e2e8f0', background: 'rgba(255,255,255,0.06)' }} onClick={() => setMobileOpen(false)}>Sign in</Link>
            <Link to="/signup" className="btn btn-primary"   style={{ width: '100%', justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>Get started</Link>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="landing-hero" id="hero">
        <div className="landing-hero-tag">
          <Zap size={11} /> Legal Document Intelligence
        </div>
        <h1>
          Analyse contracts with<br />
          <em>clarity and confidence</em>
        </h1>
        <p>
          Upload any legal PDF and instantly search its contents, ask plain-English questions,
          and run automated compliance checklists — all backed by evidence, never guesswork.
        </p>
        <div className="landing-hero-actions">
          <Link to="/signup" className="btn btn-primary btn-lg">
            Start for free <ArrowRight size={16} />
          </Link>
          <button
            onClick={() => scrollTo('#features')}
            className="btn btn-lg"
            style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#e2e8f0', cursor: 'pointer' }}
          >
            See features
          </button>
        </div>

        {/* scroll hint */}
        <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.4 }}>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, transparent, #94a3b8)' }} />
          <span style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>scroll</span>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════ */}
      <section className="landing-features" id="features">
        <div className="landing-features-inner">
          <div className="landing-section-tag">Platform Features</div>
          <h2 className="landing-section-title">Everything you need to review contracts faster</h2>
          <p className="landing-section-sub">
            From PDF extraction to evidence-grounded Q&amp;A, LexAI covers the full
            document review workflow in one secure platform.
          </p>
          <div className="landing-features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-card-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          ACCESS CONTROL / ROLES
      ════════════════════════════════════════ */}
      <section className="landing-roles" id="access-control">
        <div className="landing-section-tag">Access Control</div>
        <h2 className="landing-section-title">Built for teams of all sizes</h2>
        <p className="landing-section-sub">
          Granular role-based permissions ensure every team member sees exactly
          what they need — nothing more.
        </p>
        <div className="landing-roles-grid">
          {roles.map(r => (
            <div key={r.label} className="role-card">
              <div className="role-card-header">
                <span className={`role-badge ${r.badge}`}>{r.label}</span>
              </div>
              <h3 style={{ marginBottom: 14 }}>{r.title}</h3>
              <ul>
                {r.perms.map(p => <li key={p}>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          ABOUT
      ════════════════════════════════════════ */}
      <section id="about" style={{ padding: '80px 60px', borderTop: '1px solid rgba(255,255,255,0.06)', maxWidth: 1100, margin: '0 auto' }}>
        <div className="landing-section-tag">About LexAI</div>
        <h2 className="landing-section-title">What is LexAI?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 32, marginTop: 8 }}>
          <div>
            <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.8 }}>
              LexAI is a secure, local-first legal document intelligence platform. It extracts
              text from legal PDFs page by page, enables keyword and TF-IDF search, and provides
              evidence-grounded answers to plain-English questions.
            </p>
          </div>
          <div>
            <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.8 }}>
              Built with React, Node.js, Express, SQLite and Prisma. Every action is
              protected by JWT authentication, role-based access control, and a full audit log.
              Designed for legal teams who need speed without sacrificing security.
            </p>
          </div>
          <div>
            <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.8 }}>
              ⚠️ LexAI provides document search and preliminary checklist assistance only.
              It does not provide legal advice or determine whether a contract is legally valid.
              All findings must be reviewed by a qualified human reviewer.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA
      ════════════════════════════════════════ */}
      <section className="landing-cta">
        <Users size={36} style={{ color: 'var(--color-accent)', margin: '0 auto 16px', display: 'block' }} />
        <h2>Ready to get started?</h2>
        <p>Create your account in seconds — no credit card required.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Create free account <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="btn btn-lg"
            style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#e2e8f0' }}
          >
            Sign in to existing account
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="landing-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Scale size={14} style={{ color: 'var(--color-primary-mid)' }} />
          <span>LexAI — Legal Document Intelligence Platform</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {navLinks.map(link => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 12, padding: 0 }}
            >
              {link.label}
            </button>
          ))}
          <Link to="/login"  style={{ color: '#475569', fontSize: 12 }}>Sign in</Link>
          <Link to="/signup" style={{ color: '#475569', fontSize: 12 }}>Sign up</Link>
        </div>
      </footer>

    </div>
  );
}
