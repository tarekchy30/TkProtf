
import React, { useEffect, useState } from "react";

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

const demo = [

  {

    title: "SecureShield",

    category: "Android",

    description:

      "Android security vault concept with panic activation and protected media.",

    tech: ["Java", "Android", "Firebase"],

    github: "https://github.com/tarekchy30/SecureShield/",

  },

  {

    title: "Student Management System",

    category: "Full Stack",

    description: "MERN-based student management application.",

    tech: ["React", "Node.js", "MongoDB"],

  },

  {

    title: "ESP32 Radar",

    category: "IoT",

    description:

      "Radar-style visualization using ESP32, ultrasonic sensing and a servo.",

    tech: ["ESP32", "Arduino"],

  },

];

function Nav() {

  const [active, setActive] = useState("home");

  const [scrolled, setScrolled] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [

    { id: "projects", label: "Projects", icon: FolderKanban },

    { id: "university", label: "University", icon: GraduationCap },

    { id: "research", label: "Research", icon: BrainCircuit },

    { id: "blog", label: "Blog", icon: BookOpen },

    { id: "youtube", label: "YouTube", icon: YT },

    { id: "contact", label: "Contact", icon: Mail },

  ];

  useEffect(() => {

    const handleScroll = () => {

      setScrolled(window.scrollY > 30);

      const sections = navItems

        .map((item) => document.getElementById(item.id))

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

    window.addEventListener("scroll", handleScroll);

    return () => {

      window.removeEventListener("scroll", handleScroll);

    };

  }, []);

  const goTo = (id) => {

    setActive(id);

    setMenuOpen(false);

    const section = document.getElementById(id);

    if (section) {

      section.scrollIntoView({

        behavior: "smooth",

        block: "start",

      });

    }

  };

  return (

    <header className={`siteHeader ${scrolled ? "scrolled" : ""}`}>

      <nav className="floatingNav">

        {/* LOGO */}

        <Link

          className="navBrand"

          to="/"

          onClick={() => {

            setActive("home");

            setMenuOpen(false);

            window.scrollTo({

              top: 0,

              behavior: "smooth",

            });

          }}

        >

          <img
  src={logo}
  alt="Tarek Chy"
  className="navLogo"
/>

<span className="logoText">
  Tarek<span>Chy</span>
</span>

        </Link>

        {/* DESKTOP NAVIGATION */}

        <div className="navLinks">

          {navItems.map(({ id, label, icon: Icon }) => (

            <button

              key={id}

              className={`navItem ${

                active === id ? "active" : ""

              }`}

              onClick={() => goTo(id)}

            >

              <Icon size={16} />

              <span>{label}</span>

              {active === id && (

                <span className="navActiveDot" />

              )}

            </button>

          ))}

        </div>

        {/* RIGHT STATUS */}

        <div className="navStatus">

          <span className="navStatusDot" />

          <span>Available</span>

        </div>

        {/* MOBILE BUTTON */}

        <button

          className={`mobileMenu ${

            menuOpen ? "open" : ""

          }`}

          onClick={() => setMenuOpen(!menuOpen)}

          aria-label="Toggle navigation"

        >

          <span />

          <span />

          <span />

        </button>

      </nav>

      {/* MOBILE NAV */}

      <div

        className={`mobileNav ${

          menuOpen ? "show" : ""

        }`}

      >

        {navItems.map(({ id, label, icon: Icon }) => (

          <button

            key={id}

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

        ))}

      </div>

    </header>

  );

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

  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}



function Home() {

     const [p, setP] = useState(demo);

  const [b, setB] = useState([]);

  const [v, setV] = useState([]);

  const [profile, setProfile] = useState({});

  const [research, setResearch] = useState([]);

  const [playingVideo, setPlayingVideo] = useState(null);
  const [typedAbout, setTypedAbout] = useState("");

  useEffect(() => {
  Promise.all([
    api("/projects"),
    api("/blogs"),
    api("/youtube"),
    api("/research"),
    api("/profile"),
  ])
    .then(([a, c, d, researchData, profileData]) => {
      if (a?.length) setP(a);

      setB(c || []);
      setV(d || []);
      setResearch(researchData || []);
      setProfile(profileData || {});
    })
    .catch((error) => {
      console.error("HOME CONTENT LOAD ERROR:", error);
    });
}, []);

useEffect(() => {
  const text =
    "I'm a Computer Science student who learns by building real things.";

  let index = 0;

  const timer = setInterval(() => {
    setTypedAbout(text.slice(0, index + 1));
    index++;

    if (index === text.length) {
      clearInterval(timer);
    }
  }, 55);

  return () => clearInterval(timer);
}, []);

  return (

    <>

      <Nav />

      <section className="hero premiumHero">

  <div className="heroGrid" />

  <div className="heroGlow heroGlowOne" />

  <div className="heroGlow heroGlowTwo" />

  <div className="heroContainer">

    {/* LEFT CONTENT */}

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

        I'm Tarek Chy — a Computer Science student and

        builder exploring software, mobile apps, IoT,

        AI and cybersecurity.

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

      {/* SOCIALS */}

      <div className="heroSocials">

        <a

          href="https://github.com/tarekchy30/"

          target="_blank"

          rel="noreferrer"

        >

          <Github size={17} />

          <span>GitHub</span>

        </a>

        <a href="https://www.linkedin.com/in/tarek-ahemd-chowdhury-b94960262/">

          <Linkedin size={17} />

          <span>LinkedIn</span>

        </a>

        <a href="https://www.youtube.com/@CodeCrack0">

          <YT size={17} />

          <span>YouTube</span>

        </a>

      </div>

    </div>

    {/* RIGHT VISUAL */}

    <div className="heroVisual premiumVisual">

      {/* FLOATING TECHNOLOGY BADGES */}

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

      {/* PROFILE SYSTEM */}

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

              src={

                profile.profileImage.startsWith("http")

                  ? profile.profileImage

                  : `${API_BASE.replace("/api", "")}${profile.profileImage}`

              }

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

      {/* CODE CARD */}

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

            <span className="codeGreen">

              "building"

            </span>,

          </div>

          <div className="codeIndent">

            <span className="codeKey">areas:</span>{" "}

            [

          </div>

          <div className="codeIndent2">

            <span className="codeGreen">

              "Software"

            </span>,

            <br />

            <span className="codeGreen">

              "IoT"

            </span>,

            {" "}

            <span className="codeGreen">

              "AI"

            </span>

          </div>

          <div className="codeIndent">

            ],

          </div>

          <div className="codeIndent">

            <span className="codeKey">

              mindset:

            </span>{" "}

            <span className="codeGreen">

              "learn by building"

            </span>

          </div>

          <div>

            {"}"}

            <span className="typingCursor" />

          </div>

        </div>

      </div>

    </div>

  </div>

  {/* SCROLL INDICATOR */}

  <a

    href="#projects"

    className="scrollIndicator"

  >

    <span />

    SCROLL TO EXPLORE

  </a>

</section>

      <section className="miniStats">

  <div className="container">

    <div className="miniStat">

      <strong>06+</strong>

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

    {/* LEFT */}
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

    {/* RIGHT */}
    <div className="aboutRight">

      <div className="aboutCard aboutReveal">

        <div className="aboutCardTop">
          <span>01</span>
          <span>WHO I AM</span>
          <span className="aboutLive">
            LIVE
          </span>
        </div>

       <h3 className="aboutTypingTitle">
  <span className="typingText">
    {typedAbout}
  </span>
  <span className="typingCursor"></span>
</h3>

        <p>
          I'm Tarek Chy, a Computer Science & Engineering student
          from Bangladesh with a curiosity for software development,
          mobile apps, IoT, AI, cybersecurity and computer vision.
        </p>

        <p>
          I believe the best way to learn technology is to build with it.
          From university projects and hardware experiments to research
          and software applications, every project gives me something
          new to understand.
        </p>

        <div className="aboutTags">
          <span style={{ "--i": 0 }}>Software</span>
          <span style={{ "--i": 1 }}>Mobile</span>
          <span style={{ "--i": 2 }}>IoT</span>
          <span style={{ "--i": 3 }}>AI</span>
          <span style={{ "--i": 4 }}>Cybersecurity</span>
          <span style={{ "--i": 5 }}>Research</span>
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

      A collection of software, mobile, IoT and experimental projects

      I've built while learning and exploring technology.

    </p>

  </div>

  <div className="projectsGrid">

    {p.slice(0, 6).map((x, i) => (

      <a
  className="projectCard"
  key={x.id || x.title}
  href={x.liveUrl || x.github || "#"}
target={x.liveUrl || x.github ? "_blank" : undefined}
rel={x.liveUrl || x.github ? "noopener noreferrer" : undefined}
onClick={(e) => {
  if (!x.liveUrl && !x.github) {
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

              alt={x.title}

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

            <h3>{x.title}</h3>

            <span className="projectIndex">

              / {String(i + 1).padStart(2, "0")}

            </span>

          </div>

          <p>

            {x.description}

          </p>

         <div className="projectTags">
  {(x.tech || []).map((t, index) => (
    <span key={`${t}-${index}`}>
      {t}
    </span>
  ))}
</div>

<div className="projectLinks">

  {x.liveUrl && (
    <a
      href={x.liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      Live Demo <ArrowUpRight size={15} />
    </a>
  )}

  {x.github && (
    <a
      href={x.github}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      GitHub <Github size={15} />
    </a>
  )}

</div>

        </div>

      </a>

    ))}

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
        <Link
          to={`/blog/${x.id || x._id}`}
          className={`blogCard blogCard${i + 1}`}
          key={x.id || x._id || x.title}
          style={{
            "--delay": `${i * 0.15}s`,
          }}
        >

          {/* IMAGE */}
          <div className="blogCardImage">

            {imageUrl ? (
              <img
                src={imageUrl}
                alt={x.title}
                loading="lazy"
              />
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

          {/* CONTENT */}
          <div className="blogCardContent">

            <div className="blogCardMeta">
              <span>
                {x.category || "ARTICLE"}
              </span>

              <span>
                {formatDate(x.created_at || x.createdAt)}
              </span>
            </div>

            <h3>
              {x.title}
            </h3>

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

        <p>
          Blog posts added from the private dashboard will appear here.
        </p>
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
  <div className="contactGlow contactGlowOne"></div>
  <div className="contactGlow contactGlowTwo"></div>

  <div className="contactContainer">

    {/* Header */}
    <div className="contactHeader">
      <span className="sectionEyebrow">05 / CONTACT</span>

      <h2>
        Let's build something
        <span> meaningful.</span>
      </h2>

      <p>
        Have an idea, project, research collaboration, or just want to say
        hello? Send me a message.
      </p>
    </div>

    <div className="contactGrid">

      {/* Left side */}
      <div className="contactIntro">

        <div className="contactOrb">
          <div className="orbCore">
            <span>✦</span>
          </div>

          <div className="orbRing orbRing1"></div>
          <div className="orbRing orbRing2"></div>
          <div className="orbRing orbRing3"></div>
        </div>

        <div className="contactStatus">
          <span className="statusDot"></span>
          <span>Available for interesting projects</span>
        </div>

        <h3>
          Let's turn an idea
          <br />
          into something real.
        </h3>

        <p>
          Whether it's software, AI, robotics, research, or a creative web
          project, I'm always interested in learning and building.
        </p>

        <div className="contactLinks">

          <a
            href="mailto:tarekchy569@gmail.com"
            className="contactLink"
          >
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

      {/* Form */}
      <div className="contactCard">

        <div className="contactCardTop">
          <div>
            <span className="terminalDot red"></span>
            <span className="terminalDot yellow"></span>
            <span className="terminalDot green"></span>
          </div>

          <span className="terminalTitle">
            message.init()
          </span>
        </div>

        <form
          className="contactForm"
          onSubmit={(e) => {
            e.preventDefault();

            const form = e.currentTarget;
            const name = form.name.value;
            const email = form.email.value;
            const message = form.message.value;

            const subject = encodeURIComponent(
              `Portfolio Contact from ${name}`
            );

            const body = encodeURIComponent(
              `Name: ${name}\nEmail: ${email}\n\n${message}`
            );

            window.location.href =
              `mailto:your-email@example.com?subject=${subject}&body=${body}`;
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
            ></textarea>
          </label>

          <button type="submit" className="contactSubmit">
            <span>Send message</span>
            <span className="submitArrow">↗</span>
          </button>

        </form>
      </div>

    </div>

    {/* Bottom line */}
    <div className="contactFooter">
      <span>© {new Date().getFullYear()} Tarek Chy</span>

      <span className="footerLine"></span>

      <span>Built with curiosity & code.</span>
    </div>

  </div>
</section>

<footer className="siteFooter">
  <div className="footerContainer">

    {/* Top */}
    <div className="footerTop">

      <div className="footerBrand">
        <div className="footerLogo">TK</div>

        <div>
          <h3>Tarek Chy</h3>
          <p>
            Building ideas into software, experiments & research.
          </p>
        </div>
      </div>

      <div className="footerSocials">

        <a
          href="https://github.com/tarekchy30/"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
        >
          GitHub
          <span>↗</span>
        </a>

        <a
          href="https://www.linkedin.com/in/tarek-ahemd-chowdhury-b94960262/"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
        >
          LinkedIn
          <span>↗</span>
        </a>

        <a
          href="mailto:tarekchy569@gmail.com"
          aria-label="Email"
        >
          Email
          <span>↗</span>
        </a>

      </div>

    </div>


    {/* Big text */}
    <div className="footerBigText">
      <span>LET'S BUILD.</span>
    </div>


    {/* Bottom */}
    <div className="footerBottom">

      <span>
        © {new Date().getFullYear()} Tarek Chy
      </span>

      <span className="footerMade">
        Designed & built with
        <span className="footerHeart">✦</span>
        curiosity
      </span>

      <button
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

function Login() {

  const nav = useNavigate(),

    [f, setF] = useState({}),

    [e, setE] = useState("");

  async function go(x) {

    x.preventDefault();

    try {

      let d = await api("/auth/login", {

        method: "POST",

        body: JSON.stringify(f),

      });

      localStorage.token = d.token;

      nav("/admin");

    } catch (e) {

      setE(e.message);

    }

  }

  return (

    <div className="login">

      <form onSubmit={go}>

        <Link className="brand" to="/">

          <i>TC</i>Tarek Chy

        </Link>

        <small>PRIVATE ADMIN ACCESS</small>

        <h1>Welcome back.</h1>

        <label>

          Email

          <input

            type="email"

            required

            onChange={(x) => setF({ ...f, email: x.target.value })}

          />

        </label>

        <label>

          Password

          <input

            type="password"

            required

            onChange={(x) => setF({ ...f, password: x.target.value })}

          />

        </label>

        {e && <p className="error">{e}</p>}

        <button className="btn main">

          Sign in <ArrowUpRight />

        </button>

      </form>

    </div>

  );

}

const res = [

  ["projects", "Projects", FolderKanban],

  ["university", "University", GraduationCap],

  ["research", "Research", BrainCircuit],

  ["blogs", "Blog", FileText],

  ["youtube", "YouTube", Video],

  ["experiments", "Experiments", FlaskConical],

];

function Admin() {

  const nav = useNavigate(),

    [tab, setTab] = useState("dashboard"),

    [items, setItems] = useState([]),

    [stats, setStats] = useState({}),

    [edit, setEdit] = useState(null);

  useEffect(() => {

    if (tab === "dashboard") api("/admin/stats").then(setStats);

    else if (tab !== "profile") api("/admin/" + tab).then(setItems);

  }, [tab]);

  function out() {

    localStorage.clear();

    nav("/admin/login");

  }

  return (

    <div className="admin">

      <aside>

        <Link className="brand" to="/">

          <i>TC</i>Tarek

        </Link>

        <button

          className={tab === "dashboard" ? "on" : ""}

          onClick={() => setTab("dashboard")}

        >

          <LayoutDashboard />

          Dashboard

        </button>

        {res.map(([r, n, I]) => (

          <button

            className={tab === r ? "on" : ""}

            onClick={() => {

              setTab(r);

              setEdit(null);

            }}

          >

            <I />

            {n}

          </button>

        ))}

        <button onClick={() => setTab("profile")}>

          <UserRound />

          Profile

        </button>

        <button className="logout" onClick={out}>

          <LogOut />

          Logout

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

          </div>

          {tab !== "dashboard" && tab !== "profile" && (

            <button className="btn main" onClick={() => setEdit({})}>

              <Plus /> Add new

            </button>

          )}

        </div>

        {tab === "dashboard" ? (

          <div className="adminstats">

            {res.map(([r, n, I]) => (

              <div>

                <I />

                <b>{stats[r] || 0}</b>

                <small>{n}</small>

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

          />

        )}

      </main>

    </div>

  );

}

function Manager({ r, items, setItems, edit, setEdit }) {

  async function save(d) {

    try {

      // Support both MongoDB _id and normal id

      const id = d.id || d._id;

      const url = id

        ? `/admin/${r}/${id}`

        : `/admin/${r}`;

      const method = id ? "PUT" : "POST";

      console.log("SAVING:", {

        resource: r,

        id,

        method,

        data: d,

      });

      const x = await api(url, {

        method,

        body: JSON.stringify(d),

      });

      if (id) {

        setItems(

          items.map((item) =>

            String(item.id || item._id) === String(id)

              ? x

              : item

          )

        );

      } else {

        setItems([x, ...items]);

      }

      setEdit(null);

      alert("Blog saved successfully!");

    } catch (error) {

      console.error("SAVE ERROR:", error);

      alert(`Save failed: ${error.message}`);

    }

  }

  async function del(id) {

    if (!confirm("Delete this item?")) return;

    try {

      await api(`/admin/${r}/${id}`, {

        method: "DELETE",

      });

      setItems(

        items.filter(

          (x) => String(x.id || x._id) !== String(id)

        )

      );

    } catch (error) {

      console.error("DELETE ERROR:", error);

      alert(`Delete failed: ${error.message}`);

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

        />

      )}

      <div className="list">

        {items.map((x) => {

          const id = x.id || x._id;

          return (

            <div key={id}>

              <div>

                <small>

                  {x.category || x.course || x.status}

                </small>

                <h3>{x.title}</h3>

                <p>

                  {x.description || x.excerpt}

                </p>

              </div>

              <span>

                <button onClick={() => setEdit(x)}>

                  <Pencil />

                </button>

                <button onClick={() => del(id)}>

                  <Trash2 />

                </button>

              </span>

            </div>

          );

        })}

      </div>

    </>

  );

}

function ImageDropzone({ value, onChange }) {

  const [dragging, setDragging] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");

  async function uploadImage(file) {

    if (!file) return;

    if (!file.type.startsWith("image/")) {

      setError("Please select an image file.");

      return;

    }

    if (file.size > 8 * 1024 * 1024) {

      setError("Image must be smaller than 8MB.");

      return;

    }

    setError("");

    setUploading(true);

    try {

      const formData = new FormData();

      formData.append("image", file);

      const token = localStorage.getItem("token");

      const response = await fetch(

        `${API_BASE}/upload`,

        {

          method: "POST",

          headers: {

            Authorization: `Bearer ${token}`

          },

          body: formData

        }

      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(

          data.message || "Upload failed"

        );

      }

      onChange(data.url);

    } catch (error) {

      setError(error.message);

    } finally {

      setUploading(false);

    }

  }

  function handleDrop(e) {

    e.preventDefault();

    setDragging(false);

    const file =

      e.dataTransfer.files?.[0];

    uploadImage(file);

  }

  return (

    <div

      className={`dropzone ${

        dragging ? "dragging" : ""

      }`}

      onDragOver={(e) => {

        e.preventDefault();

        setDragging(true);

      }}

      onDragLeave={() => {

        setDragging(false);

      }}

      onDrop={handleDrop}

    >

      <input

        id="project-image"

        type="file"

        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"

        onChange={(e) =>

          uploadImage(e.target.files?.[0])

        }

      />

      <label htmlFor="project-image">

        {value ? (

          <img

            className="image-preview"

            src={

              value.startsWith("http")

                ? value

                : `${API_BASE.replace("/api", "")}${value}`

            }

            alt="Project preview"

          />

        ) : (

          <>

            <div className="upload-icon">

              ↑

            </div>

            <strong>

              {uploading

                ? "Uploading..."

                : "Drop your project image here"}

            </strong>

            <span>

              or click to choose from your device

            </span>

            <small>

              JPG, PNG, WEBP, GIF • Max 8MB

            </small>

          </>

        )}

      </label>

      {value && !uploading && (

        <button

          type="button"

          className="remove-image"

          onClick={() =>

            onChange("")

          }

        >

          Remove image

        </button>

      )}

      {error && (

        <div className="upload-error">

          {error}

        </div>

      )}

    </div>

  );

}

function Editor({

  r,

  data,

  save,

  cancel

}) {

  let init = {

    ...data,

    tech: (data.tech || []).join(", "),

    tags: (data.tags || []).join(", "),

    technology: (data.technology || []).join(", ")

  };

  const [f, setF] = useState(init);

  const set = (key, value) => {

    setF({

      ...f,

      [key]: value

    });

  };

  let fields =

    r === "projects"

      ? [

          "title",

          "description",

          "category",

          "tech",

          "github",

          "liveUrl"

        ]

      : r === "blogs"

      ? [

          "title",

          "excerpt",

          "content",

          "category",

          "tags",

          "coverImage"

        ]

      : r === "research"

      ? [

      "title",

      "description",

      "icon",

      "link",

      "status",

        ]

      : r === "youtube"

      ? [

          "title",

          "youtubeUrl",

          "description",

          "category",

        ]

      : r === "university"

      ? [

          "title",

          "course",

          "semester",

          "type",

          "description",

          "fileUrl",

          "github",

          "liveUrl"

        ]

      : [

          "title",

          "description",

          "technology",

          "status",

          "github"

        ];

 async function submit(e){

  e.preventDefault();

  let d = {...f};

  ["tech","tags","technology"].forEach(k =>

    k in d &&

    (

      d[k] = d[k]

        .split(",")

        .map(x => x.trim())

        .filter(Boolean)

    )

  );

  // Automatically get YouTube video ID + thumbnail

  if (r === "youtube") {

    d.videoId = getYouTubeId(d.youtubeUrl);

    d.thumbnail = getYouTubeThumbnail(d.youtubeUrl);

  }

  await save(d);

}

  return (

    <div className="editor">

      <div>

        <h2>

          {data.id ? "Edit" : "Add"} {r}

        </h2>

        <button

          type="button"

          onClick={cancel}

        >

          <X />

        </button>

      </div>

      <form onSubmit={submit}>

        {fields.map((key) =>

  key === "image" ? null : key === "content" ? (

    <div className="editorField" key={key}>

      <label>Article Content</label>

      <ReactQuill

        theme="snow"

        value={f.content || ""}

        onChange={(value) => set("content", value)}

        modules={{

          toolbar: [

            [{ header: [1, 2, 3, false] }],

            ["bold", "italic", "underline", "strike"],

            [{ list: "ordered" }, { list: "bullet" }],

            [{ align: [] }],

            ["blockquote", "code-block"],

            ["link", "image"],

            ["clean"],

          ],

        }}

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

    </div>

  ) : (

    <label key={key}>

      {key}

      <input

        value={f[key] || ""}

        onChange={(e) => set(key, e.target.value)}

      />

    </label>

  )

)}

        {r === "projects" && (

          <div className="image-field">

            <small>

              PROJECT IMAGE

            </small>

            <ImageDropzone

              value={f.image || ""}

              onChange={value =>

                set("image", value)

              }

            />

          </div>

        )}

        {r === "experiments" && (

          <div className="image-field">

            <small>

              EXPERIMENT IMAGE

            </small>

            <ImageDropzone

              value={f.image || ""}

              onChange={value =>

                set("image", value)

              }

            />

          </div>

        )}

        <label>

          Status

          <select

            value={

              f.status || "published"

            }

            onChange={e =>

              set(

                "status",

                e.target.value

              )

            }

          >

            <option value="published">

              published

            </option>

            <option value="draft">

              draft

            </option>

          </select>

        </label>

        <div className="right">

          <button

            type="button"

            className="btn"

            onClick={cancel}

          >

            Cancel

          </button>

          <button

            type="submit"

            className="btn main"

          >

            <Save />

            Save

          </button>

        </div>

      </form>

    </div>

  );

}

function Profile() {

  const [f, setF] = useState({});

  useEffect(() => {

    api("/profile").then(setF);

  }, []);

  async function save(e) {

    e.preventDefault();

    await api("/admin/profile", {

      method: "PUT",

      body: JSON.stringify(f),

    });

    alert("Profile saved");

  }

  return (

    <form className="editor" onSubmit={save}>

      {/* PROFILE PHOTO */}

      <div className="image-field">

        <small>PROFILE PHOTO</small>

        <ImageDropzone

          value={f.profileImage || ""}

          onChange={(value) =>

            setF({

              ...f,

              profileImage: value,

            })

          }

        />

      </div>

      {/* PROFILE INFORMATION */}

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

      ].map((k) => (

        <label key={k}>

          {k}

          <input

            value={f[k] || ""}

            onChange={(e) =>

              setF({

                ...f,

                [k]: e.target.value,

              })

            }

          />

        </label>

      ))}

      <button type="submit" className="btn main">

        <Save />

        Save profile

      </button>

    </form>

  );

}

function formatDate(date) {

  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {

    month: "long",

    day: "numeric",

    year: "numeric",

  });

}

function BlogDetails() {

  const { id } = useParams();

  const [blog, setBlog] = useState(null);

  const [latestPosts, setLatestPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    async function loadBlog() {

      try {

        const blogs = await api("/blogs");

        console.log("BLOG ID FROM URL:", id);

        console.log("ALL BLOGS:", blogs);

        const found = blogs.find(

          (x) =>

            String(x.id) === String(id) ||

            String(x._id) === String(id)

        );

        if (!found) {

          setError("Blog post not found.");

          return;

        }

        console.log("FOUND BLOG:", found);

        console.log("BLOG CONTENT:", found.content);

        setBlog(found);

        // Latest posts

        setLatestPosts(

          blogs

            .filter(

              (x) =>

                String(x.id || x._id) !== String(id)

            )

            .slice(0, 5)

        );

      } catch (err) {

        console.error("BLOG LOAD ERROR:", err);

        setError("Failed to load this blog.");

      } finally {

        setLoading(false);

      }

    }

    loadBlog();

  }, [id]);

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

        <Link to="/">

          ← Back to portfolio

        </Link>

      </div>

    );

  }

  const coverImage = blog.coverImage

    ? blog.coverImage.startsWith("http")

      ? blog.coverImage

      : `${API_BASE.replace("/api", "")}${blog.coverImage}`

    : null;

  return (

    <div className="blogDetailsPage">

      {/* ================= HERO ================= */}

      <section className="blogDetailsHero">

        {coverImage && (

          <img

            src={coverImage}

            alt={blog.title}

          />

        )}

        <div className="blogDetailsHeroContent">

          <div className="category-badge">

            {blog.category || "ARTICLE"}

          </div>

          <h1>

            {blog.title}

          </h1>

          <div className="blogHeroMeta">

            <span>

              {formatDate(

                blog.created_at || blog.createdAt

              )}

            </span>

            <span>

              No Comments

            </span>

            <span>

              {blog.views || 0} Views

            </span>

          </div>

        </div>

      </section>

      {/* ================= CONTENT ================= */}

      <div className="blogDetailsContainer">

        <div className="blogDetailsLayout">

          {/* ================= ARTICLE ================= */}

          <article className="blogArticle">

            <div

              className="ql-editor"

              dangerouslySetInnerHTML={{

                __html: blog.content || "",

              }}

            />

            {/* SHARE */}

            <div className="blogShare">

              <span>

                Share this article

              </span>

              <a

                href="#"

                aria-label="Facebook"

              >

                f

              </a>

              <a

                href="#"

                aria-label="X"

              >

                𝕏

              </a>

              <a

                href="#"

                aria-label="LinkedIn"

              >

                in

              </a>

            </div>

          </article>

          {/* ================= SIDEBAR ================= */}

          <aside className="blogSidebar">

            {/* SEARCH */}

            <div className="blogSidebarSearch">

              <span className="blogSidebarSearchIcon">

                ⌕

              </span>

              <input

                type="search"

                placeholder="Search"

              />

            </div>

            {/* POPULAR */}

            <div className="blogSidebarCard blogPopular">

              <h3>

                Popular Post

              </h3>

            </div>

            {/* NEWSLETTER */}

            <div className="blogNewsletter">

              <p>

                Signup our newsletter to get update

                information, news, insight or promotions.

              </p>

              <form

                onSubmit={(e) => e.preventDefault()}

              >

                <input

                  type="text"

                  placeholder="Name"

                />

                <input

                  type="email"

                  placeholder="Email"

                />

                <button type="submit">

                  Sign Up

                </button>

              </form>

            </div>

            {/* LATEST POSTS */}

            <div className="blogSidebarCard blogLatest">

              <h3>

                Latest Post

              </h3>

              {latestPosts.map((post) => {

                const postImage = post.coverImage

                  ? post.coverImage.startsWith("http")

                    ? post.coverImage

                    : `${API_BASE.replace(

                        "/api",

                        ""

                      )}${post.coverImage}`

                  : null;

                return (

                  <Link

                    to={`/blog/${post.id || post._id}`}

                    className="blogLatestPost"

                    key={post.id || post._id}

                  >

                    {postImage && (

                      <img

                        src={postImage}

                        alt={post.title}

                      />

                    )}

                    <div>

                      <strong>

                        {post.title}

                      </strong>

                      <time>

                        {formatDate(

                          post.created_at ||

                          post.createdAt

                        )}

                      </time>

                    </div>

                  </Link>

                );

              })}

            </div>

          </aside>

        </div>

      </div>

    </div>

  );

}

function App() {

  return (

    <Routes>

      <Route path="/" element={<Home />} />

      <Route

        path="/blog/:id"

        element={<BlogDetails />}

      />

      <Route

        path="/admin/login"

        element={<Login />}

      />

      <Route

        path="/admin"

        element={

          localStorage.token ? <Admin /> : <Login />

        }

      />

    </Routes>

  );

}

createRoot(document.getElementById("root")).render(

  <BrowserRouter>

    <App />

  </BrowserRouter>,

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
