import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createRoot } from "react-dom/client";

import logo from "./tk2.png";

import {
  BrowserRouter,
  useNavigate,
  useParams,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import {
  ArrowUpRight,
  Github,
  Linkedin,
  Youtube as YT,
  Mail,
  Play,
  BookOpen,
  Code2,
  Cpu,
  Smartphone,
  Globe,
  BrainCircuit,
  GraduationCap,
  LayoutDashboard,
  FolderKanban,
  FileText,
  Video,
  FlaskConical,
  UserRound,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";

import { api, API_BASE } from "./api";
import "./styles.css";

/* =========================================================
   HELPERS
========================================================= */

function getId(item) {
  return item?.id ?? item?._id ?? "";
}

function getServerBase() {
  return API_BASE.replace(/\/api\/?$/, "");
}

function getImageUrl(value) {
  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${getServerBase()}${value}`;
  }

  return `${getServerBase()}/${value}`;
}

function formatDate(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getYouTubeId(url) {
  if (!url) return "";

  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/]+)/
  );

  return match ? match[1] : "";
}

function getYouTubeThumbnail(url) {
  const id = getYouTubeId(url);

  if (!id) return "";

  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function getArrayValue(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value || "";
}

/* =========================================================
   NAVIGATION
========================================================= */

function Nav() {
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    {
      id: "projects",
      label: "Projects",
      icon: FolderKanban,
    },
    {
      id: "university",
      label: "University",
      icon: GraduationCap,
    },
    {
      id: "research",
      label: "Research",
      icon: BrainCircuit,
    },
    {
      id: "blog",
      label: "Blog",
      icon: BookOpen,
    },
    {
      id: "youtube",
      label: "YouTube",
      icon: YT,
    },
    {
      id: "contact",
      label: "Contact",
      icon: Mail,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      const sections = navItems
        .map((item) =>
          document.getElementById(item.id)
        )
        .filter(Boolean);

      let current = "home";

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();

        if (rect.top <= 180) {
          current = section.id;
        }
      });

      setActive(current);
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  function goTo(id) {
    setActive(id);
    setMenuOpen(false);

    const section =
      document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function goHome() {
    setActive("home");
    setMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <header
      className={`siteHeader ${
        scrolled ? "scrolled" : ""
      }`}
    >
      <nav className="floatingNav">
        <Link
          className="navBrand"
          to="/"
          onClick={goHome}
        >
          <img
            src={logo}
            alt="Tarek Chy"
            className="navLogo"
          />


          <span className="logoText">
            Tarek<span>Chy</span>
          </span>

          <img
  src={logo}
  alt="Tarek Chy"
  className="navLogo"
/>

<span className="logoText">
  Tarek<span>Chy</span>
</span>


        </Link>

        <div className="navLinks">
          {navItems.map(
            ({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`navItem ${
                  active === id
                    ? "active"
                    : ""
                }`}
                onClick={() => goTo(id)}
              >
                <Icon size={16} />

                <span>{label}</span>

                {active === id && (
                  <span className="navActiveDot" />
                )}
              </button>
            )
          )}
        </div>

        <div className="navStatus">
          <span className="navStatusDot" />
          <span>Available</span>
        </div>

        <button
          type="button"
          className={`mobileMenu ${
            menuOpen ? "open" : ""
          }`}
          onClick={() =>
            setMenuOpen((value) => !value)
          }
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div
        className={`mobileNav ${
          menuOpen ? "show" : ""
        }`}
      >
        {navItems.map(
          ({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={
                active === id
                  ? "mobileNavItem active"
                  : "mobileNavItem"
              }
              onClick={() => goTo(id)}
            >
              <Icon size={18} />

              <span>{label}</span>

              <ArrowUpRight size={15} />
            </button>
          )
        )}
      </div>
    </header>
  );
}

/* =========================================================
   HOME - Simplified
========================================================= */






function Home() {
  const [p, setP] = useState([]);
  const [b, setB] = useState([]);
  const [v, setV] = useState([]);
  const [profile, setProfile] = useState({});
  const [research, setResearch] = useState([]);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typedAbout, setTypedAbout] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadHomeContent() {
      try {
        setLoading(true);
        
        const projectsData = await api("/projects").catch(() => []);
        const blogsData = await api("/blogs").catch(() => []);
        const youtubeData = await api("/youtube").catch(() => []);
        const researchData = await api("/research").catch(() => []);
        const profileData = await api("/profile").catch(() => ({}));

        if (!mounted) return;

        setP(Array.isArray(projectsData) ? projectsData : []);
        setB(Array.isArray(blogsData) ? blogsData : []);
        setV(Array.isArray(youtubeData) ? youtubeData : []);
        setResearch(Array.isArray(researchData) ? researchData : []);
        setProfile(profileData || {});
      } catch (error) {
        console.error("HOME CONTENT LOAD ERROR:", error);
        setP([]);
        setB([]);
        setV([]);
        setResearch([]);
        setProfile({});
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadHomeContent();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const text =
      "I'm a Computer Science student who learns by building real things.";

    let index = 0;

    const timer = setInterval(() => {
      index += 1;

      setTypedAbout(
        text.slice(0, index)
      );

      if (index >= text.length) {
        clearInterval(timer);
      }
    }, 55);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="loadingContainer">
        <div className="loadingSpinner" />
        <p>Loading portfolio...</p>
      </div>
    );
  }

  return (
    <>
      <Nav />

      <section className="hero premiumHero">
        <div className="heroGrid" />
        <div className="heroGlow heroGlowOne" />
        <div className="heroGlow heroGlowTwo" />

        <div className="heroContainer">
          <div className="heroContent">
            <div className="heroEyebrow">
              <span className="liveDot" />
              OPEN TO LEARNING & BUILDING
            </div>

            <h1 className="heroTitle">
              Building ideas
              <br />
              <span className="gradientText">
                into reality.
              </span>
            </h1>

            <p className="heroDescription">
              I'm Tarek Chy — a Computer Science
              student and builder exploring
              software, mobile apps, IoT, AI and
              cybersecurity.
            </p>

            <div className="heroActions">
              <a
                href="#projects"
                className="heroPrimaryBtn"
              >
                <span>Explore my work</span>
                <ArrowUpRight size={18} />
              </a>

              <a
                href="#youtube"
                className="heroSecondaryBtn"
              >
                <Play size={16} fill="currentColor" />
                Watch tutorials
              </a>
            </div>

            <div className="heroSocials">
              <a
                href="https://github.com/tarekchy30/"
                target="_blank"
                rel="noreferrer"
              >
                <Github size={17} />
                <span>GitHub</span>
              </a>

              <a
                href="https://www.linkedin.com/in/tarek-ahemd-chowdhury-b94960262/"
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin size={17} />
                <span>LinkedIn</span>
              </a>

              <a
                href="https://www.youtube.com/@CodeCrack0"
                target="_blank"
                rel="noreferrer"
              >
                <YT size={17} />
                <span>YouTube</span>
              </a>
            </div>
          </div>

          <div className="heroVisual premiumVisual">
            <div className="floatingTech techOne">
              <Code2 size={17} />
              <span>Software</span>
            </div>

            <div className="floatingTech techTwo">
              <Cpu size={17} />
              <span>IoT</span>
            </div>

            <div className="floatingTech techThree">
              <BrainCircuit size={17} />
              <span>AI</span>
            </div>

            <div className="floatingTech techFour">
              <Smartphone size={17} />
              <span>Android</span>
            </div>

            <div className="profileSystem">
              <div className="orbit orbitOuter">
                <span className="orbitDot" />
              </div>

              <div className="orbit orbitMiddle">
                <span className="orbitDot" />
              </div>

              <div className="profileHalo" />

              <div className="profileImageWrapper">
                {profile.profileImage ? (
                  <img
                    src={getImageUrl(profile.profileImage)}
                    alt={profile.name || "Tarek Chy"}
                  />
                ) : (
                  <div className="profilePlaceholder">
                    TC
                  </div>
                )}
              </div>

              <div className="profileStatus">
                <span />
                Building & Learning
              </div>
            </div>

            <div className="codeCard">
              <div className="codeHeader">
                <div className="codeDots">
                  <span />
                  <span />
                  <span />
                </div>
                <span>tarekchy.dev</span>
                <Code2 size={15} />
              </div>

              <div className="codeBody">
                <div>
                  <span className="codePurple">const</span>{" "}
                  <span className="codeBlue">tarek</span>{" "}
                  = {"{"}
                </div>

                <div className="codeIndent">
                  <span className="codeKey">focus:</span>{" "}
                  <span className="codeGreen">"building"</span>,
                </div>

                <div className="codeIndent">
                  <span className="codeKey">areas:</span> [
                </div>

                <div className="codeIndent2">
                  <span className="codeGreen">"Software"</span>,
                  <br />
                  <span className="codeGreen">"IoT"</span>,{" "}
                  <span className="codeGreen">"AI"</span>
                </div>

                <div className="codeIndent">],</div>

                <div className="codeIndent">
                  <span className="codeKey">mindset:</span>{" "}
                  <span className="codeGreen">"learn by building"</span>
                </div>

                <div>
                  {"}"}
                  <span className="typingCursor" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <a href="#projects" className="scrollIndicator">
          <span />
          SCROLL TO EXPLORE
        </a>
      </section>

      <section className="miniStats">
        <div className="container">
          <div className="miniStat">
            <strong>{String(Math.max(p.length, 0)).padStart(2, "0")}</strong>
            <span>Projects</span>
          </div>

          <div className="miniDivider" />

          <div className="miniStat">
            <strong>∞</strong>
            <span>Experiments</span>
          </div>

          <div className="miniDivider" />

          <div className="miniStat">
            <strong>01</strong>
            <span>Journey</span>
          </div>

          <div className="miniDivider" />

          <div className="miniStat">
            <strong>06</strong>
            <span>Tech Areas</span>
          </div>
        </div>
      </section>

      <section className="aboutSection uniqueAbout">
        <div className="aboutGrid" />
        <div className="aboutGlow aboutGlow1" />
        <div className="aboutGlow aboutGlow2" />
        <div className="aboutOrbit aboutOrbit1" />
        <div className="aboutOrbit aboutOrbit2" />

        <div className="container aboutContainer">
          <div className="aboutLeft aboutReveal">
            <div className="aboutLabel">
              <span className="aboutDot" />
              ABOUT ME
            </div>

            <h2>
              I build,
              <br />
              <span>experiment & learn.</span>
              <br />
              <em>Every project moves me forward.</em>
            </h2>

            <div className="aboutLine">
              <span />
            </div>

            <div className="aboutMiniStatus">
              <span className="statusPulse" />
              <span>Currently learning & building</span>
            </div>
          </div>

          <div className="aboutRight">
            <div className="aboutCard aboutReveal">
              <div className="aboutCardTop">
                <span>01</span>
                <span>WHO I AM</span>
                <span className="aboutLive">LIVE</span>
              </div>

              <h3 className="aboutTypingTitle">
                <span className="typingText">{typedAbout}</span>
                <span className="typingCursor" />
              </h3>

              <p>
                I'm Tarek Chy, a Computer Science & Engineering
                student from Bangladesh with a curiosity for
                software development, mobile apps, IoT, AI,
                cybersecurity and computer vision.
              </p>

              <p>
                I believe the best way to learn technology is to build
                with it. From university projects and hardware
                experiments to research and software applications, every
                project gives me something new to understand.
              </p>

              <div className="aboutTags">
                {[
                  "Software",
                  "Mobile",
                  "IoT",
                  "AI",
                  "Cybersecurity",
                  "Research",
                ].map((tag, index) => (
                  <span key={tag} style={{ "--i": index }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="aboutBottom">
                <div className="aboutQuote">
                  <span>"</span>
                  Learn by building.
                </div>

                <div className="aboutCode">
                  <span>const</span> mindset ={" "}
                  <strong>"keep_building"</strong>;
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

   
<Block id="projects" num="01" title="Things I've built.">

  <div className="projectsIntro">
    <p>
      A collection of software, mobile,
      IoT and experimental projects I've
      built while learning and exploring
      technology.
    </p>
  </div>

  <div className="projectsGrid">

    {p.slice(0, 6).map((x, i) => {

      const linkUrl = x.liveUrl || x.github || null;

      return (
        <a
          className="projectCard"
          key={x.id || x.title || i}
          href={linkUrl || "#"}
          target={linkUrl ? "_blank" : undefined}
          rel={linkUrl ? "noopener noreferrer" : undefined}
          onClick={(e) => {
            if (!linkUrl) {
              e.preventDefault();
            }
          }}
        >

          {/* PROJECT IMAGE */}
          <div className="projectVisual">

            {x.image ? (
              <img
                src={
                  x.image.startsWith("http")
                    ? x.image
                    : `${API_BASE.replace("/api", "")}${x.image}`
                }
                alt={x.title || "Project"}
              />
            ) : (
              <div className="projectPlaceholder">
                <strong>
                  {i % 2 ? "</>" : "{ }"}
                </strong>
              </div>
            )}

            <div className="projectImageOverlay" />

            <div className="projectNumber">
              0{i + 1}
            </div>

            <div className="projectCategory">
              {x.category || "PROJECT"}
            </div>

            <div className="projectArrow">
              <ArrowUpRight />
            </div>

          </div>

          {/* PROJECT CONTENT */}
          <div className="projectContent">

            <div className="projectTitleRow">

              <h3>
                {x.title}
              </h3>

              <span className="projectIndex">
                / {String(i + 1).padStart(2, "0")}
              </span>

            </div>

            <p>
              {x.description}
            </p>

            {/* TECHNOLOGY TAGS */}
            <div className="projectTags">

              {(Array.isArray(x.tech) ? x.tech : []).map((t, index) => (
                <span key={`${t}-${index}`}>
                  {t}
                </span>
              ))}

            </div>

            {/* PROJECT LINKS */}
            <div className="projectLinks">

              {x.liveUrl && (
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(
                      x.liveUrl,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                >
                  Live Demo <ArrowUpRight size={15} />
                </span>
              )}

              {x.github && (
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(
                      x.github,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                >
                  GitHub <Github size={15} />
                </span>
              )}

            </div>

          </div>

        </a>
      );

    })}

  </div>

</Block>

      <Block id="university" num="02" title="My university archive.">

  <div className="universityArchive">

    <div className="universityGlow" />

    <div className="universityIcon">

      <GraduationCap />

    </div>

    <div className="universityContent">

      <div className="universityTop">

        <span>02</span>

        <span>ACADEMIC JOURNEY</span>

      </div>

      <h3>

        Coursework, labs,

        <br />

        <span>assignments & projects.</span>

      </h3>

      <p>

        A growing archive of my Computer Science journey —

        including university coursework, laboratory work,

        assignments, semester projects and academic experiments.

      </p>

      <div className="universityTags">

        <span>Coursework</span>

        <span>Labs</span>

        <span>Assignments</span>

        <span>Semester Projects</span>

      </div>

    </div>

    <div className="universityArrow">

      <ArrowUpRight />

    </div>

    <div className="universityLines" />

  </div>

</Block>

<Block id="research" num="03" title="Exploring before I specialize.">

  <div className="researchIntro">
    <div className="researchLabel">
      <span className="researchDot" />
      AREAS I'M EXPLORING
    </div>

    <p>
      I'm interested in the intersection of intelligent systems,
      cybersecurity and human-centered technology.
    </p>
  </div>

  <div className="researchGrid">
    {research.slice(0, 6).map((x, i) => {
  const iconMap = {
    BrainCircuit,
    Code2,
    Globe,
    Cpu,
    Smartphone,
    FlaskConical,
    GraduationCap,
  };

  const Icon = iconMap[x.icon] || BrainCircuit;

  return (
    <a
      key={x.id || x._id || x.title}
      href={x.link || "#"}
      target={x.link ? "_blank" : undefined}
      rel={x.link ? "noreferrer" : undefined}
      className="researchCard"
      onClick={(e) => {
        if (!x.link) {
          e.preventDefault();
        }
      }}
    >
      <div className="researchCardTop">
        <span>
          {String(i + 1).padStart(2, "0")}
        </span>

        <span className="researchCode">
          {x.icon || "RESEARCH"}
        </span>
      </div>

      <div className="researchCardIcon">
        <Icon size={25} />
      </div>

      <h3>{x.title}</h3>

      <p>{x.description}</p>

      <div className="researchCardBottom">
        <span>
          {(x.status || "EXPLORING").toUpperCase()}
        </span>

        <ArrowUpRight />
      </div>
    </a>
  );
})}
  </div>

  {!research.length && (
    <div className="note">
      <BrainCircuit />
      Research topics added from the private dashboard
      will appear here.
    </div>
  )}

</Block>

      <Block id="blog" num="03" title="What I'm learning, documented.">

  <div className="blogSectionIntro">
    <div className="blogSectionLabel">
      <span className="blogPulseDot" />
      LATEST FROM MY NOTEBOOK
    </div>

    <p>
      Ideas, experiments, technical lessons and things I'm discovering
      while building.
    </p>
  </div>

  <div className="blogGrid">

    {b.slice(0, 3).map((x, i) => {

      const imageUrl = x.coverImage
        ? x.coverImage.startsWith("http")
          ? x.coverImage
          : `${API_BASE.replace("/api", "")}${x.coverImage}`
        : null;


      return (
        <article
          className={`projectCard ${isExternal ? 'clickable' : ''}`}
          key={getId(x) || `${x.title}-${i}`}
          onClick={() => {
            if (isExternal) {
              window.open(linkUrl, '_blank');
            }
          }}
          style={{
            cursor: isExternal ? 'pointer' : 'default',
          }}
        >
          <div className="projectVisual">
            {x.image ? (
              <img
                src={getImageUrl(x.image)}
                alt={x.title}
                loading="lazy"
              />
            ) : (
              <div className="projectPlaceholder">
                <strong>{i % 2 ? "</>" : "{ }"}</strong>
              </div>
            )}

            <div className="projectImageOverlay" />

            <div className="projectNumber">
              {String(i + 1).padStart(2, "0")}
            </div>

            <div className="projectCategory">
              {x.category || "PROJECT"}
            </div>

            {/* Links container */}
            <div className="projectLinks">
              {x.github && (
                <a
                  href={x.github}
                  target="_blank"
                  rel="noreferrer"
                  className="projectLink"
                  aria-label={`Open ${x.title} on GitHub`}
                  onClick={(e) => e.stopPropagation()}
                  title="View on GitHub"
                >
                  <Github size={16} />
                </a>
              )}
              {x.liveUrl && (
                <a
                  href={x.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="projectLink live"
                  aria-label={`Open ${x.title} live demo`}
                  onClick={(e) => e.stopPropagation()}
                  title="View Live Demo"
                >
                  <Globe size={16} />
                </a>
              )}
            </div>
          </div>

          <div className="projectContent">
            <div className="projectTitleRow">
              <h3>{x.title}</h3>
              <span className="projectIndex">
                / {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            <p>{x.description}</p>

            <div className="projectTags">
              {(Array.isArray(x.tech) ? x.tech : []).map((t, index) => (
                <span key={`${t}-${index}`}>{t}</span>
              ))}
            </div>

            {/* Link indicators at bottom */}
            {isExternal && (
              <div className="projectLinkHint">
                <span>
                  {x.liveUrl && <span>🔗 Live Demo</span>}
                  {x.liveUrl && x.github && <span> • </span>}
                  {x.github && <span>💻 GitHub</span>}
                </span>
                <ArrowUpRight size={14} />
              </div>
            )}
          </div>
        </article>
      );
    })}
  </div>

  {!p.length && (
    <div className="note">
      <FolderKanban />
      No projects published yet. Add one from the admin panel.
    </div>
  )}
</Block>

      <Block id="university" num="02" title="My university archive.">
        <div className="universityArchive">
          <div className="universityGlow" />
          <div className="universityIcon">
            <GraduationCap />
          </div>

          <div className="universityContent">
            <div className="universityTop">
              <span>02</span>
              <span>ACADEMIC JOURNEY</span>
            </div>

            <h3>
              Coursework, labs,
              <br />
              <span>assignments & projects.</span>
            </h3>

            <p>
              A growing archive of my Computer Science journey —
              including university coursework, laboratory work,
              assignments, semester projects and academic experiments.
            </p>

            <div className="universityTags">
              <span>Coursework</span>
              <span>Labs</span>
              <span>Assignments</span>
              <span>Semester Projects</span>
            </div>
          </div>

          <div className="universityArrow">
            <ArrowUpRight />
          </div>

          <div className="universityLines" />
        </div>
      </Block>

      <Block id="research" num="03" title="Exploring before I specialize.">
        <div className="researchIntro">
          <div className="researchLabel">
            <span className="researchDot" />
            AREAS I'M EXPLORING
          </div>

          <p>
            I'm interested in the intersection of intelligent
            systems, cybersecurity and human-centered technology.
          </p>
        </div>

        <div className="researchGrid">
          {research.slice(0, 6).map((x, i) => {
            const iconMap = {
              BrainCircuit,
              Code2,
              Globe,
              Cpu,
              Smartphone,
              FlaskConical,
              GraduationCap,
            };

            const Icon = iconMap[x.icon] || BrainCircuit;
            const hasLink = Boolean(x.link);

            return (
              <a
                key={getId(x) || `${x.title}-${i}`}
                href={hasLink ? x.link : "#"}
                target={hasLink ? "_blank" : undefined}
                rel={hasLink ? "noreferrer" : undefined}
                className="researchCard"
                onClick={(e) => {
                  if (!hasLink) {
                    e.preventDefault();
                  }
                }}
              >
                <div className="researchCardTop">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span className="researchCode">{x.icon || "RESEARCH"}</span>
                </div>

                <div className="researchCardIcon">
                  <Icon size={25} />
                </div>

                <h3>{x.title}</h3>
                <p>{x.description}</p>

                <div className="researchCardBottom">
                  <span>{(x.status || "EXPLORING").toUpperCase()}</span>
                  <ArrowUpRight />
                </div>
              </a>
            );
          })}
        </div>

        {!research.length && (
          <div className="note">
            <BrainCircuit />
            Research topics added from the private dashboard will appear here.
          </div>
        )}
      </Block>

      <Block id="blog" num="04" title="What I'm learning, documented.">
        <div className="blogSectionIntro">
          <div className="blogSectionLabel">
            <span className="blogPulseDot" />
            LATEST FROM MY NOTEBOOK
          </div>

          <p>
            Ideas, experiments, technical
            lessons and things I'm discovering
            while building.
          </p>
        </div>

        <div className="blogGrid">
          {b.slice(0, 3).map((x, i) => {
            const imageUrl = getImageUrl(x.coverImage);
            const id = getId(x);

            return (
              <Link
                to={`/blog/${id}`}
                className={`blogCard blogCard${i + 1}`}
                key={id || `${x.title}-${i}`}
                style={{ "--delay": `${i * 0.15}s` }}
              >
                <div className="blogCardImage">
                  {imageUrl ? (
                    <img src={imageUrl} alt={x.title} loading="lazy" />
                  ) : (
                    <div className="blogImagePlaceholder">
                      <BookOpen size={42} />
                    </div>
                  )}

                  <div className="blogImageShade" />

                  <span className="blogCardNumber">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="blogCardCategory">
                    {x.category || "ARTICLE"}
                  </span>

                  <div className="blogCardView">
                    <ArrowUpRight size={20} />
                  </div>
                </div>

                <div className="blogCardContent">
                  <div className="blogCardMeta">
                    <span>{x.category || "ARTICLE"}</span>
                    <span>{formatDate(x.created_at || x.createdAt)}</span>
                  </div>

                  <h3>{x.title}</h3>

                  <p>
                    {x.excerpt ||
                      "A technical article documenting what I'm learning and building."}
                  </p>

                  <div className="blogCardRead">
                    <span>Read article</span>
                    <span className="blogReadArrow">
                      <ArrowUpRight size={17} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {!b.length && (
          <div className="note animatedNote">
            <BookOpen />
            <div>
              <b>Nothing published yet.</b>
              <p>Blog posts added from the private dashboard will appear here.</p>
            </div>
          </div>
        )}
      </Block>

<Block id="youtube" num="04" title="Build with me.">

  <div className="cards">

    {v.slice(0, 6).map((x, i) => {

  const videoId =
    x.videoId ||
    getYouTubeId(x.youtubeUrl);

  const thumbnail =
    getYouTubeThumbnail(x.youtubeUrl) ||
    x.thumbnail;

  return (

        <article

          className="card video"

          key={x.id || `${x.title}-${i}`}

        >

          <div

            className="videoThumb"

            onClick={() => {

              if (videoId) {

                setPlayingVideo({

                  id: videoId,

                  title: x.title

                });

              }

            }}

          >

            {thumbnail && (

              <img

                src={thumbnail}

                alt={x.title}

              />

            )}

            <button

              className="videoPlay"

              type="button"

              aria-label={`Play ${x.title}`}

            >

              <Play fill="currentColor" />

            </button>

          </div>

          <div className="videoInfo">

            <small>

              {x.category || "TUTORIAL"}

            </small>

            <h3>

              {x.title}

            </h3>

          </div>

        </article>

      );

    })}

  </div>

  {!v.length && (

    <div className="note">

      <YT />

      YouTube tutorials added from admin

      will appear here.

    </div>

  )}

  {/* VIDEO MODAL */}

  {playingVideo && (

    <div

      className="videoModal"

      onClick={(e) => {

        if (e.target === e.currentTarget) {

          setPlayingVideo(null);

        }

      }}

    >

      <div className="videoModalContent">

        <button

          className="videoClose"

          type="button"

          onClick={() => setPlayingVideo(null)}

          aria-label="Close video"

        >

          <X />

        </button>

        <div className="videoFrame">

          <iframe

            src={`https://www.youtube.com/embed/${playingVideo.id}?autoplay=1`}

            title={playingVideo.title}

            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"

            allowFullScreen

          />

        </div>

      </div>

    </div>

  )}

</Block>
      <section id="contact" className="contactSection">
        <div className="contactGlow contactGlowOne" />
        <div className="contactGlow contactGlowTwo" />

        <div className="contactContainer">
          <div className="contactHeader">
            <span className="sectionEyebrow">06 / CONTACT</span>

            <h2>
              Let's build something
              <span> meaningful.</span>
            </h2>

            <p>
              Have an idea, project, research collaboration, or
              just want to say hello? Send me a message.
            </p>
          </div>

          <div className="contactGrid">
            <div className="contactIntro">
              <div className="contactOrb">
                <div className="orbCore">
                  <span>✦</span>
                </div>
                <div className="orbRing orbRing1" />
                <div className="orbRing orbRing2" />
                <div className="orbRing orbRing3" />
              </div>

              <div className="contactStatus">
                <span className="statusDot" />
                <span>Available for interesting projects</span>
              </div>

              <h3>
                Let's turn an idea
                <br />
                into something real.
              </h3>

              <p>
                Whether it's software, AI, robotics, research, or a
                creative web project, I'm always interested in learning
                and building.
              </p>

              <div className="contactLinks">
                <a href="mailto:tarekchy569@gmail.com" className="contactLink">
                  <div className="contactLinkIcon">✉</div>
                  <div>
                    <small>Email</small>
                    <strong>tarekchy569@gmail.com</strong>
                  </div>
                  <span className="contactArrow">↗</span>
                </a>

                <a
                  href="https://github.com/tarekchy30/"
                  target="_blank"
                  rel="noreferrer"
                  className="contactLink"
                >
                  <div className="contactLinkIcon">⌘</div>
                  <div>
                    <small>GitHub</small>
                    <strong>github.com/tarekchy30</strong>
                  </div>
                  <span className="contactArrow">↗</span>
                </a>
              </div>
            </div>

            <div className="contactCard">
              <div className="contactCardTop">
                <div>
                  <span className="terminalDot red" />
                  <span className="terminalDot yellow" />
                  <span className="terminalDot green" />
                </div>
                <span className="terminalTitle">message.init()</span>
              </div>

              <form
                className="contactForm"
                onSubmit={(e) => {
                  e.preventDefault();

                  const form = e.currentTarget;
                  const name = form.name.value.trim();
                  const email = form.email.value.trim();
                  const message = form.message.value.trim();

                  const subject = encodeURIComponent(
                    `Portfolio Contact from ${name}`
                  );

                  const body = encodeURIComponent(
                    `Name: ${name}\nEmail: ${email}\n\n${message}`
                  );

                  window.location.href =
                    `mailto:tarekchy569@gmail.com?subject=${subject}&body=${body}`;
                }}
              >
                <div className="formRow">
                  <label>
                    <span>01</span>
                    Your name
                    <input
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      required
                    />
                  </label>

                  <label>
                    <span>02</span>
                    Email address
                    <input
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                    />
                  </label>
                </div>

                <label>
                  <span>03</span>
                  Your message
                  <textarea
                    name="message"
                    rows="6"
                    placeholder="Tell me about your idea..."
                    required
                  />
                </label>

                <button type="submit" className="contactSubmit">
                  <span>Send message</span>
                  <span className="submitArrow">↗</span>
                </button>
              </form>
            </div>
          </div>

          <div className="contactFooter">
            <span>© {new Date().getFullYear()} Tarek Chy</span>
            <span className="footerLine" />
            <span>Built with curiosity & code.</span>
          </div>
        </div>
      </section>

      <footer className="siteFooter">
        <div className="footerContainer">
          <div className="footerTop">
            <div className="footerBrand">
              <div className="footerLogo">TK</div>
              <div>
                <h3>Tarek Chy</h3>
                <p>Building ideas into software, experiments & research.</p>
              </div>
            </div>

            <div className="footerSocials">
              <a href="https://github.com/tarekchy30/" target="_blank" rel="noreferrer">
                GitHub<span>↗</span>
              </a>

              <a
                href="https://www.linkedin.com/in/tarek-ahemd-chowdhury-b94960262/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn<span>↗</span>
              </a>

              <a href="mailto:tarekchy569@gmail.com">
                Email<span>↗</span>
              </a>
            </div>
          </div>

          <div className="footerBigText">
            <span>LET'S BUILD.</span>
          </div>

          <div className="footerBottom">
            <span>© {new Date().getFullYear()} Tarek Chy</span>

            <span className="footerMade">
              Designed & built with
              <span className="footerHeart">✦</span>
              curiosity
            </span>

            <button
              type="button"
              className="backToTop"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
            >
              Back to top
              <span>↑</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}

function Block({ id, num, title, children }) {
  return (
    <section id={id} className="section dark">
      <div className="container">
        <small>
          {num} / {id}
        </small>

        <h2>{title}</h2>

        {children}
      </div>
    </section>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function Login() {
  const nav = useNavigate();

  const [f, setF] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function go(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(f),
      });

      if (!data?.token) {
        throw new Error("Login succeeded but no token was returned.");
      }

      localStorage.setItem("token", data.token);
      nav("/admin");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <form onSubmit={go}>
        <Link className="brand" to="/">
          <i>TC</i>
          Tarek Chy
        </Link>

        <small>PRIVATE ADMIN ACCESS</small>

        <h1>Welcome back.</h1>

        <label>
          Email
          <input
            type="email"
            value={f.email}
            required
            autoComplete="email"
            onChange={(e) =>
              setF({
                ...f,
                email: e.target.value,
              })
            }
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={f.password}
            required
            autoComplete="current-password"
            onChange={(e) =>
              setF({
                ...f,
                password: e.target.value,
              })
            }
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="btn main" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
          {!loading && <ArrowUpRight />}
        </button>
      </form>
    </div>
  );
}

/* =========================================================
   ADMIN RESOURCES
========================================================= */

const res = [
  ["projects", "Projects", FolderKanban],
  ["university", "University", GraduationCap],
  ["research", "Research", BrainCircuit],
  ["blogs", "Blog", FileText],
  ["youtube", "YouTube", Video],
  ["experiments", "Experiments", FlaskConical],
];

/* =========================================================
   ADMIN - FIXED VERSION
========================================================= */

/* =========================================================
   ADMIN - FIXED
========================================================= */

function Admin() {
  const nav = useNavigate();

  const [tab, setTab] = useState("dashboard");
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [edit, setEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to load data from Supabase
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      if (tab === "dashboard") {
        const data = await api("/admin/stats");
        setStats(data || {});
        console.log("📊 Stats loaded:", data);
      } else if (tab !== "profile") {
        const data = await api(`/admin/${tab}`);
        const items = Array.isArray(data) ? data : [];
        setItems(items);
        console.log(`📋 ${tab} loaded:`, items.length, "items");
      }
    } catch (error) {
      console.error("LOAD ERROR:", error);
      setError(`Failed to load: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    loadData();
  }, [tab]);

  function out() {
    localStorage.removeItem("token");
    nav("/admin/login");
  }

  // Manual refresh function
  const refresh = () => {
    loadData();
  };

  return (
    <div className="admin">
      <aside>
        <Link className="brand" to="/">
          <i>TC</i>
          Tarek
        </Link>

        <button
          type="button"
          className={tab === "dashboard" ? "on" : ""}
          onClick={() => {
            setTab("dashboard");
            setEdit(null);
          }}
        >
          <LayoutDashboard />
          Dashboard
        </button>

        {res.map(([resource, name, Icon]) => (
          <button
            key={resource}
            type="button"
            className={tab === resource ? "on" : ""}
            onClick={() => {
              setTab(resource);
              setEdit(null);
            }}
          >
            <Icon />
            {name}
          </button>
        ))}

        <button
          type="button"
          className={tab === "profile" ? "on" : ""}
          onClick={() => {
            setTab("profile");
            setEdit(null);
          }}
        >
          <UserRound />
          Profile
        </button>

        <button type="button" className="logout" onClick={out}>
          <LogOut />
          Logout
        </button>
        
        <button type="button" className="refresh" onClick={refresh}>
          🔄 Refresh
        </button>
      </aside>

      <main>
        <div className="adminhead">
          <div>
            <small>PRIVATE CONTROL CENTER</small>
            <h1>
              {tab === "dashboard"
                ? "Dashboard"
                : tab === "profile"
                ? "Profile"
                : res.find((x) => x[0] === tab)?.[1]}
            </h1>
            {error && <div className="error" style={{color: 'red'}}>{error}</div>}
          </div>

          {tab !== "dashboard" && tab !== "profile" && (
            <button
              type="button"
              className="btn main"
              onClick={() => setEdit({})}
            >
              <Plus />
              Add new
            </button>
          )}
        </div>

        {loading && tab !== "dashboard" && (
          <div className="note">Loading...</div>
        )}

        {tab === "dashboard" ? (
          <div className="adminstats">
            {res.map(([resource, name, Icon]) => (
              <div key={resource}>
                <Icon />
                <b>{stats[resource] || 0}</b>
                <small>{name}</small>
              </div>
            ))}
          </div>
        ) : tab === "profile" ? (
          <Profile />
        ) : (
          <Manager
            r={tab}
            items={items}
            setItems={setItems}
            edit={edit}
            setEdit={setEdit}
            loadData={loadData}
          />
        )}
      </main>
    </div>
  );
}

/* =========================================================
   MANAGER - FIXED
========================================================= */

function Manager({ r, items, setItems, edit, setEdit, loadData }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(data) {
    try {
      setSaving(true);
      setError("");

      const id = getId(data);
      const url = id ? `/admin/${r}/${id}` : `/admin/${r}`;
      const method = id ? "PUT" : "POST";

      // Clean the data - remove any fields that shouldn't be sent
      const cleanData = { ...data };
      delete cleanData.id;
      delete cleanData._id;
      delete cleanData.created_at;
      delete cleanData.updated_at;
      
      // Ensure tech/tags are arrays
      ['tech', 'tags', 'technology'].forEach(key => {
        if (cleanData[key]) {
          if (typeof cleanData[key] === 'string') {
            cleanData[key] = cleanData[key].split(',').map(t => t.trim()).filter(Boolean);
          } else if (!Array.isArray(cleanData[key])) {
            cleanData[key] = [];
          }
        } else {
          cleanData[key] = [];
        }
      });

      console.log("📤 SAVING TO SUPABASE:", {
        url,
        method,
        data: cleanData,
      });

      const saved = await api(url, {
        method,
        body: JSON.stringify(cleanData),
      });

      console.log("✅ SAVED SUCCESSFULLY:", saved);

      // Update local state
      if (id) {
        setItems((current) =>
          current.map((item) =>
            String(getId(item)) === String(id) ? saved : item
          )
        );
      } else {
        setItems((current) => [saved, ...current]);
      }

      setEdit(null);
      
      // IMPORTANT: Reload data from Supabase to ensure consistency
      setTimeout(() => {
        loadData();
      }, 1000);

      alert(`✅ ${r} saved successfully to Supabase! ID: ${saved.id}`);
    } catch (error) {
      console.error("❌ SAVE ERROR:", error);
      setError(error.message);
      alert(`❌ Save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function del(id) {
    if (!confirm(`Delete this ${r} item?`)) {
      return;
    }

    try {
      await api(`/admin/${r}/${id}`, {
        method: "DELETE",
      });

      setItems((current) =>
        current.filter((item) => String(getId(item)) !== String(id))
      );

      setTimeout(() => {
        loadData();
      }, 1000);

      alert(`✅ ${r} deleted successfully!`);
    } catch (error) {
      console.error("DELETE ERROR:", error);
      alert(`❌ Delete failed: ${error.message}`);
    }
  }

  return (
    <>
      {edit !== null && (
        <Editor
          r={r}
          data={edit}
          save={save}
          cancel={() => setEdit(null)}
          saving={saving}
        />
      )}

      {error && <div className="error" style={{color: 'red', padding: '10px', margin: '10px 0', background: '#ffeeee'}}>❌ {error}</div>}

      <div className="list">
        {items.map((item, index) => {
          const id = getId(item);

          return (
            <div key={id || `${item.title}-${index}`}>
              <div>
                <small>
                  {item.category || item.course || item.status || "ITEM"}
                </small>
                <h3>{item.title || "Untitled"}</h3>
                <p>{item.description || item.excerpt || ""}</p>
                {item.id && <small style={{color: '#999'}}>ID: {item.id}</small>}
              </div>

              <span>
                <button
                  type="button"
                  onClick={() => setEdit(item)}
                  aria-label="Edit"
                >
                  <Pencil />
                </button>

                <button
                  type="button"
                  onClick={() => del(id)}
                  aria-label="Delete"
                >
                  <Trash2 />
                </button>
              </span>
            </div>
          );
        })}

        {!items.length && <div className="note">No items found.</div>}
      </div>
    </>
  );
}

/* =========================================================
   IMAGE UPLOAD
========================================================= */

async function uploadImageFile(file) {
  if (!file) return null;

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file.");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image must be smaller than 8MB.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Image upload failed.");
  }

  const imageUrl = data.url || data.imageUrl;

  if (!imageUrl) {
    throw new Error("Upload succeeded but server did not return an image URL.");
  }

  return imageUrl;
}

/* =========================================================
   IMAGE DROPZONE
========================================================= */

function ImageDropzone({
  value,
  onChange,
  inputId = "image-upload",
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadImage(file) {
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const url = await uploadImageFile(file);
      onChange(url);
    } catch (err) {
      console.error("IMAGE UPLOAD ERROR:", err);
      setError(err.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    uploadImage(file);
  }

  return (
    <div
      className={`dropzone ${dragging ? "dragging" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={(e) => uploadImage(e.target.files?.[0])}
      />

      <label htmlFor={inputId}>
        {value ? (
          <img className="image-preview" src={getImageUrl(value)} alt="Uploaded preview" />
        ) : (
          <>
            <div className="upload-icon">↑</div>
            <strong>{uploading ? "Uploading..." : "Drop your image here"}</strong>
            <span>or click to choose from your device</span>
            <small>JPG, PNG, WEBP, GIF • Max 8MB</small>
          </>
        )}
      </label>

      {value && !uploading && (
        <button type="button" className="remove-image" onClick={() => onChange("")}>
          Remove image
        </button>
      )}

      {error && <div className="upload-error">{error}</div>}
      {uploading && <div className="upload-progress">Uploading image...</div>}
    </div>
  );
}

/* =========================================================
   MANAGER - FIXED VERSION
========================================================= */



/* =========================================================
   BLOG EDITOR
========================================================= */



/* =========================================================
   EDITOR
========================================================= */

function Editor({ r, data, save, cancel, saving }) {
  const initialData = useMemo(() => {
    const flatData = { ...data };
    
    if (flatData.data && typeof flatData.data === 'object') {
      Object.assign(flatData, flatData.data);
      delete flatData.data;
    }
    
    return {
      ...flatData,
      tech: getArrayValue(flatData.tech),
      tags: getArrayValue(flatData.tags),
      technology: getArrayValue(flatData.technology),
    };
  }, [data]);

  const [f, setF] = useState(initialData);

  useEffect(() => {
    setF(initialData);
  }, [initialData]);

  function set(key, value) {
    setF((current) => ({
      ...current,
      [key]: value,
    }));
  }

  let fields = [];

  if (r === "projects") {
    fields = ["title", "description", "category", "tech", "github", "liveUrl"];
  } else if (r === "blogs") {
    fields = ["title", "excerpt", "content", "category", "tags", "coverImage"];
  } else if (r === "research") {
    fields = ["title", "description", "icon", "link", "status"];
  } else if (r === "youtube") {
    fields = ["title", "youtubeUrl", "description", "category"];
  } else if (r === "university") {
    fields = ["title", "course", "semester", "type", "description", "fileUrl", "github", "liveUrl"];
  } else {
    fields = ["title", "description", "technology", "status", "github"];
  }

  async function submit(e) {
    e.preventDefault();

    const d = { ...f };

    ["tech", "tags", "technology"].forEach((key) => {
      if (key in d) {
        if (typeof d[key] === "string") {
          d[key] = d[key]
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
        } else if (!Array.isArray(d[key])) {
          d[key] = [];
        }
      } else {
        d[key] = [];
      }
    });

    delete d.data;

    if (r === "youtube") {
      d.videoId = getYouTubeId(d.youtubeUrl);
      d.thumbnail = getYouTubeThumbnail(d.youtubeUrl);
    }

    if (r === "blogs") {
      d.content = d.content || "";
      if (!d.slug) {
        d.slug =
          (d.title || "untitled")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") +
          "-" +
          Date.now();
      }
    }

    console.log("📤 Submitting data:", d);
    await save(d);
  }

  const isEditing = Boolean(getId(data));

  return (
    <div className="editor">
      <div>
        <h2>
          {isEditing ? "Edit" : "Add"} {r}
        </h2>

        <button type="button" onClick={cancel} aria-label="Close editor">
          <X />
        </button>
      </div>

      <form onSubmit={submit}>
        {fields.map((key) => {
          if (key === "content") {
            return (
              <div className="editorField" key={key}>
                <label>Article Content</label>
                <BlogEditor value={f.content || ""} onChange={(value) => set("content", value)} />
              </div>
            );
          }

          if (key === "coverImage" && r === "blogs") {
            return (
              <div className="image-field" key={key}>
                <small>BLOG COVER IMAGE</small>
                <ImageDropzone
                  inputId="blog-cover-image"
                  value={f.coverImage || ""}
                  onChange={(value) => set("coverImage", value)}
                />
              </div>
            );
          }

          return (
            <label key={key}>
              {key}
              <input
                value={f[key] ?? ""}
                onChange={(e) => set(key, e.target.value)}
              />
            </label>
          );
        })}

        {r === "projects" && (
          <div className="image-field">
            <small>PROJECT IMAGE</small>
            <ImageDropzone
              inputId="project-image"
              value={f.image || ""}
              onChange={(value) => set("image", value)}
            />
          </div>
        )}

        {r === "experiments" && (
          <div className="image-field">
            <small>EXPERIMENT IMAGE</small>
            <ImageDropzone
              inputId="experiment-image"
              value={f.image || ""}
              onChange={(value) => set("image", value)}
            />
          </div>
        )}

        <label>
          Status
          <select
            value={f.status || "published"}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="published">published</option>
            <option value="draft">draft</option>
          </select>
        </label>

        <div className="right">
          <button type="button" className="btn" onClick={cancel} disabled={saving}>
            Cancel
          </button>

          <button type="submit" className="btn main" disabled={saving}>
            <Save />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function Profile() {
  const [f, setF] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const data = await api("/profile");
        if (mounted) {
          setF(data || {});
        }
      } catch (err) {
        console.error("PROFILE LOAD ERROR:", err);
        if (mounted) {
          setError(err.message || "Failed to load profile.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  async function save(e) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      await api("/admin/profile", {
        method: "PUT",
        body: JSON.stringify(f),
      });

      alert("Profile saved successfully.");
    } catch (err) {
      console.error("PROFILE SAVE ERROR:", err);
      setError(err.message || "Profile save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="note">Loading profile...</div>;
  }

  return (
    <form className="editor" onSubmit={save}>
      {error && <div className="error">{error}</div>}

      <div className="image-field">
        <small>PROFILE PHOTO</small>
        <ImageDropzone
          inputId="profile-image"
          value={f.profileImage || ""}
          onChange={(value) =>
            setF((current) => ({
              ...current,
              profileImage: value,
            }))
          }
        />
      </div>

      {[
        "name",
        "headline",
        "bio",
        "email",
        "location",
        "education",
        "cvUrl",
        "github",
        "linkedin",
        "youtube",
      ].map((key) => (
        <label key={key}>
          {key}

          {key === "bio" ? (
            <textarea
              value={f[key] || ""}
              rows={5}
              onChange={(e) =>
                setF((current) => ({
                  ...current,
                  [key]: e.target.value,
                }))
              }
            />
          ) : (
            <input
              value={f[key] || ""}
              onChange={(e) =>
                setF((current) => ({
                  ...current,
                  [key]: e.target.value,
                }))
              }
            />
          )}
        </label>
      ))}

      <button type="submit" className="btn main" disabled={saving}>
        <Save />
        {saving ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}

/* =========================================================
   BLOG DETAILS
========================================================= */

function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadBlog() {
      try {
        setLoading(true);
        setError("");

        const blogs = await api("/blogs");

        if (!mounted) return;

        const list = Array.isArray(blogs) ? blogs : [];
        const found = list.find(
          (x) => String(x.id) === String(id) || String(x._id) === String(id)
        );

        if (!found) {
          setError("Blog post not found.");
          setBlog(null);
          return;
        }

        setBlog(found);

        setLatestPosts(
          list
            .filter((x) => String(getId(x)) !== String(id))
            .slice(0, 5)
        );
      } catch (err) {
        console.error("BLOG LOAD ERROR:", err);
        if (mounted) {
          setError("Failed to load this blog.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadBlog();

    return () => {
      mounted = false;
    };
  }, [id]);

  const filteredLatest = latestPosts.filter(
    (post) =>
      !searchTerm ||
      post.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="blogDetailsLoading">
        <div className="loadingSpinner" />
        <p>Loading article...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blogDetailsLoading">
        <h1>{error || "Article not found"}</h1>
        <Link to="/">← Back to portfolio</Link>
      </div>
    );
  }

  const coverImage = getImageUrl(blog.coverImage);

  function shareUrl(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(blog.title || "Article");

    if (platform === "facebook") {
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    }

    if (platform === "linkedin") {
      return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    }

    return `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
  }

  return (
    <div className="blogDetailsPage">
      <section className="blogDetailsHero">
        {coverImage && <img src={coverImage} alt={blog.title} />}

        <div className="blogDetailsHeroContent">
          <div className="category-badge">{blog.category || "ARTICLE"}</div>
          <h1>{blog.title}</h1>

          <div className="blogHeroMeta">
            <span>{formatDate(blog.created_at || blog.createdAt)}</span>
            <span>No Comments</span>
            <span>{blog.views || 0} Views</span>
          </div>
        </div>
      </section>

      <div className="blogDetailsContainer">
        <div className="blogDetailsLayout">
          <article className="blogArticle">
            <div
              className="ql-editor"
              dangerouslySetInnerHTML={{
                __html: blog.content || "",
              }}
            />

            <div className="blogShare">
              <span>Share this article</span>

              <a
                href={shareUrl("facebook")}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                f
              </a>

              <a
                href={shareUrl("x")}
                target="_blank"
                rel="noreferrer"
                aria-label="X"
              >
                𝕏
              </a>

              <a
                href={shareUrl("linkedin")}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                in
              </a>
            </div>
          </article>

          <aside className="blogSidebar">
            <div className="blogSidebarSearch">
              <span className="blogSidebarSearchIcon">⌕</span>

              <input
                type="search"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="blogSidebarCard blogPopular">
              <h3>Popular Post</h3>

              {latestPosts.slice(0, 2).map((post) => (
                <Link
                  key={getId(post)}
                  to={`/blog/${getId(post)}`}
                  className="blogLatestPost"
                >
                  {post.coverImage && (
                    <img src={getImageUrl(post.coverImage)} alt={post.title} />
                  )}

                  <div>
                    <strong>{post.title}</strong>
                    <time>{formatDate(post.created_at || post.createdAt)}</time>
                  </div>
                </Link>
              ))}
            </div>

            <div className="blogNewsletter">
              <p>
                Signup our newsletter to get update information,
                news, insight or promotions.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Newsletter signup will be connected to your email service.");
                }}
              >
                <input type="text" placeholder="Name" required />
                <input type="email" placeholder="Email" required />
                <button type="submit">Sign Up</button>
              </form>
            </div>

            <div className="blogSidebarCard blogLatest">
              <h3>Latest Post</h3>

              {filteredLatest.map((post) => {
                const postId = getId(post);

                return (
                  <Link
                    to={`/blog/${postId}`}
                    className="blogLatestPost"
                    key={postId}
                  >
                    {post.coverImage && (
                      <img src={getImageUrl(post.coverImage)} alt={post.title} />
                    )}

                    <div>
                      <strong>{post.title}</strong>
                      <time>{formatDate(post.created_at || post.createdAt)}</time>
                    </div>
                  </Link>
                );
              })}

              {!filteredLatest.length && <p>No matching posts.</p>}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog/:id" element={<BlogDetails />} />
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          localStorage.getItem("token") ? (
            <Admin />
          ) : (
            <Login />
          )
        }
      />
    </Routes>
  );
}

/* =========================================================
   REACT ROOT
========================================================= */

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />

  </BrowserRouter>
);


 



function BlogEditor({ value, onChange }) {

  const quillRef = React.useRef(null);

  async function imageHandler() {

    const input = document.createElement("input");

    input.setAttribute("type", "file");

    input.setAttribute("accept", "image/*");

    input.click();

    input.onchange = async () => {

      const file = input.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {

        alert("Please select an image.");

        return;

      }

      if (file.size > 8 * 1024 * 1024) {

        alert("Image must be smaller than 8MB.");

        return;

      }

      try {

        const formData = new FormData();

        formData.append("image", file);

        const token = localStorage.getItem("token");

        const response = await fetch(

          `${API_BASE}/upload`,

          {

            method: "POST",

            headers: {

              Authorization: `Bearer ${token}`,

            },

            body: formData,

          }

        );

        const data = await response.json();

        if (!response.ok) {

          throw new Error(data.message || "Image upload failed");

        }

        const quill = quillRef.current.getEditor();

        const range = quill.getSelection(true);

        const imageUrl = data.url.startsWith("http")

          ? data.url

          : `${API_BASE.replace("/api", "")}${data.url}`;

        quill.insertEmbed(

          range.index,

          "image",

          imageUrl

        );

        quill.setSelection(

          range.index + 1

        );

      } catch (error) {

        alert(error.message);

      }

    };

  }

  const modules = {

    toolbar: {

      container: [

        [{ header: [1, 2, 3, false] }],

        ["bold", "italic", "underline", "strike"],

        [{ list: "ordered" }, { list: "bullet" }],

        [{ align: [] }],

        ["blockquote", "code-block"],

        ["link", "image"],

        ["clean"],

      ],

      handlers: {

        image: imageHandler,

      },

    },

  };

  return (

    <ReactQuill

      ref={quillRef}

      theme="snow"

      value={value || ""}

      onChange={onChange}

      modules={modules}

      formats={[

        "header",

        "bold",

        "italic",

        "underline",

        "strike",

        "list",

        "bullet",

        "align",

        "blockquote",

        "code-block",

        "link",

        "image",

      ]}

    />

  );

}

