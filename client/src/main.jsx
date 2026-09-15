import React, {
  lazy,
  Suspense,
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

const ReactQuill = lazy(() =>
  Promise.all([
    import("react-quill"),
    import("react-quill/dist/quill.snow.css"),
  ]).then(([module]) => ({ default: module.default }))
);

import {
  ArrowUpRight,
  ArrowDown,
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
  Users,
  Sparkles,
  Compass,
  Terminal,
  Keyboard,
  MousePointer2,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Eye,
  Search,
  PenTool,
  Hammer,
  TestTube2,
  MessageSquare,
  LockKeyhole,
  ShoppingBag,
  PackageOpen,
} from "lucide-react";

import { api, API_BASE } from "./api";
import "./styles.css";
import "./reactions/reaction.css";
import ReactionButtons from "./reactions/ReactionButtons";
import { ReactionProvider } from "./reactions/ReactionContext";

const favicon = document.querySelector('link[rel="icon"]') || document.createElement("link");
favicon.rel = "icon";
favicon.type = "image/png";
favicon.href = logo;
document.head.appendChild(favicon);

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

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getContentRouteId(item) {
  return String(getId(item) || slugify(item?.title) || "");
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
    {
      id: "store",
      label: "Store",
      icon: ShoppingBag,
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

    if (id === "store" && window.location.pathname !== "/") {
      window.location.href = "/store";
      return;
    }

    const section =
      document.getElementById(id);

    if (id === "store" && !section) {
      window.location.href = "/store";
      return;
    }

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

function CommandPalette() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([
    {
      type: "system",
      text: "Tarek OS ready. Type help to see available commands.",
    },
  ]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  function scrollToSection(id) {
    navigate("/");
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function runCommand(value) {
    const command = value.trim().toLowerCase();
    if (!command) return;

    if (command === "clear") {
      setHistory([]);
      setQuery("");
      return;
    }

    const destinations = {
      about: "about",
      projects: "projects",
      research: "research",
      contact: "contact",
    };

    let response = "";
    if (command === "help") {
      response = "Available: help, about, projects, research, contact, clear.";
    } else if (destinations[command]) {
      scrollToSection(destinations[command]);
      response = `Opening ${command}…`;
    } else {
      response = `Command not found: ${command}. Try help.`;
    }

    setHistory((current) => [
      ...current,
      { type: "command", text: `> ${command}` },
      { type: "system", text: response },
    ]);
    setQuery("");
  }

  return (
    <>
      <button
        type="button"
        className="commandLauncher"
        onClick={() => setOpen(true)}
        aria-label="Open portfolio command palette"
      >
        <Terminal size={16} />
        <span>Open terminal</span>
        <kbd>Ctrl K</kbd>
      </button>

      {open && (
        <div
          className="commandOverlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="commandPalette" role="dialog" aria-modal="true" aria-labelledby="command-title">
            <div className="commandPaletteHeader">
              <div>
                <span className="commandEyebrow"><span className="consolePulse" /> TAREK OS</span>
                <h2 id="command-title">Command palette</h2>
              </div>
              <button type="button" className="commandClose" onClick={() => setOpen(false)} aria-label="Close terminal">
                <X size={18} />
              </button>
            </div>

            <div className="commandHistory" aria-live="polite">
              {history.map((entry, index) => (
                <div className={`commandLine ${entry.type}`} key={`${entry.text}-${index}`}>
                  {entry.text}
                </div>
              ))}
            </div>

            <form
              className="commandInputRow"
              onSubmit={(event) => {
                event.preventDefault();
                runCommand(query);
              }}
            >
              <span aria-hidden="true">$</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="try: projects"
                aria-label="Terminal command"
                autoComplete="off"
              />
              <button type="submit" aria-label="Run command"><ArrowUpRight size={17} /></button>
            </form>

            <div className="commandSuggestions" aria-label="Available commands">
              {["help", "about", "projects", "research", "contact", "clear"].map((command) => (
                <button key={command} type="button" onClick={() => runCommand(command)}>
                  {command}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SystemStatus() {
  const [state, setState] = useState("checking");
  const [checkedAt, setCheckedAt] = useState(null);

  async function checkStatus() {
    setState("checking");
    try {
      await api("/health");
      setState("operational");
    } catch (error) {
      console.warn("SYSTEM STATUS CHECK:", error.message);
      setState("degraded");
    } finally {
      setCheckedAt(new Date());
    }
  }

  useEffect(() => {
    checkStatus();
    const interval = window.setInterval(checkStatus, 60000);
    return () => window.clearInterval(interval);
  }, []);

  const isOperational = state === "operational";
  const isChecking = state === "checking";
  const statusLabel = isChecking ? "Checking" : isOperational ? "Operational" : "Degraded";

  return (
    <section className="systemStatusSection revealSection" aria-labelledby="system-status-title">
      <div className="container">
        <div className="systemStatusHeader">
          <div>
            <span className="sectionEyebrow">LIVE / SYSTEM STATUS</span>
            <h2 id="system-status-title">The portfolio is online.</h2>
            <p>Public services are checked without exposing private infrastructure details.</p>
          </div>
          <button type="button" className="statusRefresh" onClick={checkStatus} disabled={isChecking}>
            <RefreshCw size={15} className={isChecking ? "spin" : ""} />
            Check now
          </button>
        </div>

        <div className="systemStatusGrid">
          <div className={`systemStatusSummary ${state}`}>
            {isOperational ? <CheckCircle2 size={25} /> : isChecking ? <Activity size={25} /> : <AlertTriangle size={25} />}
            <div>
              <strong>{statusLabel}</strong>
              <span>{checkedAt ? `Last checked ${checkedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Connecting to services…"}</span>
            </div>
          </div>
          <div className="systemStatusItems">
            {[
              ["Portfolio API", isOperational],
              ["Supabase content", isOperational],
              ["Visitor telemetry", isOperational],
            ].map(([label, online]) => (
              <div className="systemStatusItem" key={label}>
                <span className={`statusIndicator ${isChecking ? "checking" : online ? "online" : "offline"}`} />
                <span>{label}</span>
                <small>{isChecking ? "checking" : online ? "online" : "retrying"}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function getPasswordStrength(password) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["Start typing", "Very weak", "Weak", "Fair", "Strong", "Excellent"];
  return { score, checks, label: labels[score] };
}

function PasswordStrengthDemo() {
  const [password, setPassword] = useState("");
  const strength = getPasswordStrength(password);

  return (
    <div className="labCard passwordLab">
      <div className="labCardHeader">
        <span className="labIndex">01</span>
        <span className="labTag"><ShieldCheck size={14} /> PRIVACY-FIRST</span>
      </div>
      <h3>Password strength checker</h3>
      <p>Test a password locally. Nothing is sent anywhere.</p>
      <label className="labInputLabel" htmlFor="password-lab-input">Try a sample password</label>
      <input
        id="password-lab-input"
        className="labInput"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Type to analyze"
      />
      <div className="strengthMeter" aria-label={`${strength.label} password strength`}>
        {[1, 2, 3, 4, 5].map((level) => (
          <span key={level} className={level <= strength.score ? `level-${strength.score}` : ""} />
        ))}
      </div>
      <div className="strengthMeta">
        <strong>{strength.label}</strong>
        <span>{strength.score}/5 checks</span>
      </div>
      <ul className="labChecks">
        {["8+ characters", "Uppercase letter", "Lowercase letter", "Number", "Symbol"].map((label, index) => (
          <li className={strength.checks[index] ? "passed" : ""} key={label}>
            <span>{strength.checks[index] ? "✓" : "○"}</span>{label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActivityDemo() {
  const [activity, setActivity] = useState({ keys: 0, clicks: 0, moves: 0, signal: [] });
  const moveFrame = useRef(null);

  useEffect(() => {
    const onKey = () => setActivity((current) => ({ ...current, keys: current.keys + 1, signal: [...current.signal.slice(-23), 70 + Math.random() * 30] }));
    const onClick = () => setActivity((current) => ({ ...current, clicks: current.clicks + 1, signal: [...current.signal.slice(-23), 42 + Math.random() * 28] }));
    const onMove = () => {
      if (moveFrame.current) return;
      moveFrame.current = window.requestAnimationFrame(() => {
        moveFrame.current = null;
        setActivity((current) => ({ ...current, moves: current.moves + 1, signal: [...current.signal.slice(-23), 18 + Math.random() * 30] }));
      });
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
      window.removeEventListener("pointermove", onMove);
      if (moveFrame.current) window.cancelAnimationFrame(moveFrame.current);
    };
  }, []);

  return (
    <div className="labCard activityLab">
      <div className="labCardHeader">
        <span className="labIndex">02</span>
        <span className="labTag"><Activity size={14} /> LIVE INPUT</span>
      </div>
      <h3>Interaction signal</h3>
      <p>Move, click or type anywhere to shape this tiny activity visualization.</p>
      <div className="activityBars" aria-label="Live interaction visualization">
        {(activity.signal.length ? activity.signal : [18, 28, 22, 38, 26, 46, 31, 55]).map((height, index) => (
          <span key={`${height}-${index}`} style={{ height: `${height}%` }} />
        ))}
      </div>
      <div className="activityStats">
        <span><Keyboard size={15} /><strong>{activity.keys}</strong><small>keys</small></span>
        <span><MousePointer2 size={15} /><strong>{activity.moves}</strong><small>moves</small></span>
        <span><span className="clickGlyph">●</span><strong>{activity.clicks}</strong><small>clicks</small></span>
      </div>
      <small className="labFootnote">Counts stay in this tab and reset on refresh.</small>
    </div>
  );
}

function ProjectLab() {
  return (
    <section id="lab" className="projectLabSection revealSection" aria-labelledby="project-lab-title">
      <div className="container">
        <div className="labHeader">
          <div>
            <span className="sectionEyebrow">07 / DIGITAL LABORATORY</span>
            <h2 id="project-lab-title">Small tools. Useful ideas.</h2>
          </div>
          <p>Hands-on demos built with browser APIs and plain React—no extra dependencies required.</p>
        </div>
        <LabPipeline />
        <div className="labGrid">
          <PasswordStrengthDemo />
          <ActivityDemo />
        </div>
      </div>
    </section>
  );
}

const visitorPaths = [
  {
    id: "hire",
    label: "I want to hire a builder",
    icon: UserRound,
    description: "See practical builds, technical range and the fastest way to start a conversation.",
    keywords: ["software", "web", "app", "api", "react", "node", "portfolio", "full"],
    links: ["projects", "contact"],
  },
  {
    id: "ai",
    label: "I’m exploring AI and research",
    icon: BrainCircuit,
    description: "Follow the experiments where curiosity becomes a tested idea.",
    keywords: ["ai", "machine", "learning", "research", "behavior", "vision", "model", "data"],
    links: ["research", "projects", "youtube"],
  },
  {
    id: "learn",
    label: "I want to learn something",
    icon: BookOpen,
    description: "Find tutorials and explainers that are useful beyond a quick demo.",
    keywords: ["learn", "tutorial", "guide", "android", "security", "coding", "programming"],
    links: ["youtube", "projects", "research"],
  },
  {
    id: "collaborate",
    label: "I have an idea to explore",
    icon: Compass,
    description: "Understand how I move from an open question to a working experiment.",
    keywords: ["iot", "sensor", "hardware", "security", "experiment", "build", "research"],
    links: ["projects", "research", "contact"],
  },
];

function ChooseYourPath({ projects, blogs, videos, research }) {
  const [selectedId, setSelectedId] = useState("hire");
  const selectedPath = visitorPaths.find((path) => path.id === selectedId) || visitorPaths[0];
  const PathIcon = selectedPath.icon;

  const recommendations = useMemo(() => {
    const sources = [
      ...projects.map((item) => ({ ...item, source: "Project", target: "#projects" })),
      ...research.map((item) => ({ ...item, source: "Research", target: "#research" })),
      ...videos.map((item) => ({ ...item, source: "Tutorial", target: "#youtube" })),
      ...blogs.map((item) => ({ ...item, source: "Article", target: "#blog" })),
    ];
    const ranked = sources
      .map((item, index) => {
        const haystack = [item.title, item.description, item.category, item.content, item.tech, item.tags]
          .flatMap((value) => Array.isArray(value) ? value : [value])
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const score = selectedPath.keywords.reduce((total, keyword) => total + (haystack.includes(keyword) ? 1 : 0), 0);
        return { item, score, index };
      })
      .sort((a, b) => b.score - a.score || a.index - b.index);
    return ranked.slice(0, 3).map(({ item }) => item);
  }, [blogs, projects, research, selectedPath, videos]);

  return (
    <section id="pathfinder" className="pathfinderSection revealSection" aria-labelledby="pathfinder-title">
      <div className="container">
        <div className="pathfinderHeader">
          <div>
            <span className="sectionEyebrow">08 / FIND YOUR PATH</span>
            <h2 id="pathfinder-title">Start where it matters to you.</h2>
          </div>
          <p>Tell me what brought you here. I’ll turn the portfolio into a short, useful route instead of making you search through everything.</p>
        </div>

        <div className="pathfinder">
          <div className="pathChoices" role="group" aria-label="Choose what you want to explore">
            {visitorPaths.map((path) => {
              const Icon = path.icon;
              return (
                <button
                  type="button"
                  key={path.id}
                  className={`pathChoice ${selectedId === path.id ? "active" : ""}`}
                  onClick={() => setSelectedId(path.id)}
                  aria-pressed={selectedId === path.id}
                >
                  <Icon size={18} />
                  <span>{path.label}</span>
                  <ArrowUpRight size={14} />
                </button>
              );
            })}
          </div>

          <div className="pathResults" aria-live="polite">
            <div className="pathResultIntro">
              <span className="pathResultIcon"><PathIcon size={20} /></span>
              <div>
                <span className="pathResultKicker">YOUR RECOMMENDED ROUTE</span>
                <h3>{selectedPath.label}</h3>
                <p>{selectedPath.description}</p>
              </div>
            </div>
            <div className="pathResultList">
              {recommendations.length ? recommendations.map((item, index) => (
                <a className="pathResult" href={item.target} key={`${getId(item) || item.title}-${index}`}>
                  <span className="pathResultNumber">{String(index + 1).padStart(2, "0")}</span>
                  <span className="pathResultCopy">
                    <small>{item.source}</small>
                    <strong>{item.title || "Explore this section"}</strong>
                    <span>{item.description || "Open this part of the portfolio to explore the details."}</span>
                  </span>
                  <ArrowUpRight size={16} />
                </a>
              )) : (
                <p className="pathEmpty">Content is loading. Choose a route again in a moment.</p>
              )}
            </div>
            <a className="pathContactLink" href={selectedPath.links.includes("contact") ? "#contact" : `#${selectedPath.links[0]}`}>
              Continue to {selectedPath.links[0]} <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function DigitalStore({ products = [], fullPage = false }) {
  const [downloadFx, setDownloadFx] = useState(null);
  const [reactions, setReactions] = useState({});
  const [reactionError, setReactionError] = useState("");

  useEffect(() => {
    const themeProducts = products.filter((product) => {
      const type = String(product.productType || "").toLowerCase();
      return product.id && (type.includes("theme") || type.includes("website"));
    });

    Promise.all(
      themeProducts.map(async (product) => {
        try {
          const data = await api(`/products/${product.id}/reactions`);
          return [String(product.id), data];
        } catch (error) {
          console.error("PRODUCT REACTIONS LOAD ERROR:", error);
          return [String(product.id), { reactions: {}, selected: null, unavailable: true }];
        }
      })
    ).then((entries) => setReactions(Object.fromEntries(entries)));
  }, [products]);

  async function downloadProduct(product, event) {
    const source = getImageUrl(product.freeDownloadUrl || product.pdfUrl);
    if (!source) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    setDownloadFx({
      title: product.title,
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
      state: "downloading",
    });

    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${slugify(product.title) || "digital-product"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      setDownloadFx((current) => current ? { ...current, state: "complete" } : current);
    } catch (error) {
      console.error("PRODUCT DOWNLOAD ERROR:", error);
      window.open(source, "_blank", "noopener,noreferrer");
      setDownloadFx((current) => current ? { ...current, state: "complete" } : current);
    }

    window.setTimeout(() => setDownloadFx(null), 2200);
  }

  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const visibleProducts = products.filter((product) => product.status !== "draft");
  const filteredProducts = visibleProducts.filter((product) => {
    const type = String(product.productType || "").toLowerCase();
    const matchesCategory = category === "all" || (category === "books" && type.includes("book")) || (category === "themes" && (type.includes("theme") || type.includes("website"))) || (category === "resources" && !type.includes("book") && !type.includes("theme") && !type.includes("website"));
    const matchesQuery = !query.trim() || `${product.title} ${product.description} ${product.productType}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <>
    {downloadFx && (
      <div
        className={`downloadFlight ${downloadFx.state}`}
        style={{ "--download-x": `${downloadFx.x}px`, "--download-y": `${downloadFx.y}px` }}
        role="status"
        aria-live="polite"
      >
        <span className="downloadFlightIcon"><ArrowDown size={16} /></span>
        <span>{downloadFx.state === "complete" ? "Download started" : "Preparing download..."}</span>
      </div>
    )}
    {reactionError && <div className="storeReactionNotice" role="status">{reactionError}</div>}
    <section id={fullPage ? undefined : "store"} className={`digitalStoreSection ${fullPage ? "storePageSection" : "revealSection"}`} aria-labelledby="store-title">
      <div className="container">
        <div className="storeHero">
          <div><span className="sectionEyebrow">09 / DIGITAL MARKET</span><h2 id="store-title">Books, themes and useful digital products.</h2><p>Discover practical resources made to help you learn, launch and build better.</p></div>
          <div className="storeHeroOrb"><ShoppingBag size={28} /><span>CURATED<br />DIGITAL GOODS</span></div>
        </div>
        <div className="storeToolbar">
          <div className="storeCategories">
            {[['all', 'All products'], ['books', 'Books'], ['themes', 'Website themes'], ['resources', 'Resources']].map(([id, label]) => <button key={id} type="button" className={category === id ? "active" : ""} onClick={() => setCategory(id)}>{label}</button>)}
          </div>
          <label className="storeSearch"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" /></label>
        </div>
        {filteredProducts.length ? <div className="storeGrid">
          {filteredProducts.map((product, index) => {
            const isBook = String(product.productType || "").toLowerCase().includes("book");
            const isTheme = String(product.productType || "").toLowerCase().includes("theme") || String(product.productType || "").toLowerCase().includes("website");
            const isFree = product.downloadType === "free" || (!product.price && !product.checkoutUrl);
            const framework = product.framework || (Array.isArray(product.technology) ? product.technology[0] : "") || "React";
            const views = product.views || "";
            return <article className={`storeCard ${isBook ? "bookProductCard" : ""} ${isTheme ? "themeProductCard" : ""}`} key={getId(product) || `${product.title}-${index}`}>
              <div className="storeCardVisual">{product.image ? <img src={getImageUrl(product.image)} alt="" loading="lazy" /> : <PackageOpen size={34} />}<span>{product.productType || "DIGITAL PRODUCT"}</span>{product.rating && <b className="storeRating">★ {product.rating}</b>}</div>
              <div className="storeCardBody">
                {isTheme && <div className="themeCreatorRow"><span className="themeCreatorAvatar">T</span><h3>{product.title}</h3><span className="themeFramework">{framework}</span><ReactionButtons productId={product.id} value={reactions[String(product.id)]} onChange={(data) => { setReactions((current) => ({ ...current, [String(product.id)]: data })); setReactionError(""); }} onError={setReactionError} /><span className="themeStat"><Eye size={15} /> {views || "—"}</span></div>}
                {!isTheme && <><div className="storeCardMeta"><small>{isBook ? "BOOK" : "ITEM"} · {String(index + 1).padStart(2, "0")}</small>{isFree ? <strong className="freeLabel">FREE</strong> : product.price && <strong>{product.currency || "USD"} {product.price}</strong>}</div>
                <h3>{product.title}</h3><p>{product.description}</p>{Array.isArray(product.features) && product.features.length > 0 && <ul>{product.features.slice(0, 3).map((feature) => <li key={feature}>{feature}</li>)}</ul>}</>}
                <div className="storeCardActions">
                  {product.previewUrl && <a href={product.previewUrl} target="_blank" rel="noreferrer">Live preview <ExternalLink size={14} /></a>}
                  {isFree && (product.freeDownloadUrl || product.pdfUrl) && (
                    <button className="storeFreeButton" type="button" onClick={(event) => downloadProduct(product, event)}>
                      {isTheme ? "Download theme" : "Download"} <ArrowUpRight size={15} />
                    </button>
                  )}
                  {!isFree && (product.checkoutUrl || isTheme) && (
                    <a
                      className="storeBuyButton"
                      href={product.checkoutUrl || "/#contact"}
                      target={product.checkoutUrl ? "_blank" : undefined}
                      rel={product.checkoutUrl ? "noreferrer" : undefined}
                    >
                      {isTheme ? "Buy me a coffee" : "Buy now"} <ArrowUpRight size={15} />
                    </a>
                  )}
                  {!isFree && !product.checkoutUrl && !isTheme && (
                    <a className="storeBuyButton" href="/#contact">
                      Request access <MessageSquare size={15} />
                    </a>
                  )}
                </div>
              </div>
            </article>;
          })}
        </div> : <div className="storeEmpty"><ShoppingBag size={22} /><strong>{visibleProducts.length ? "No products match your search." : "New digital products are coming soon."}</strong><span>{visibleProducts.length ? "Try another category or search term." : "Add books, website themes and resources from the admin panel."}</span></div>}
      </div>
    </section>
    </>
  );
}
function StorePage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/products")
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((loadError) => setError(loadError.message || "Could not load the store."));
  }, []);

  return (
    <>
      <Nav />
      {error ? <div className="container note">{error}</div> : <DigitalStore products={products} fullPage />}
    </>
  );
}

function Guestbook() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ name: "", role: "", message: "", website: "" });
  const [state, setState] = useState("idle");
  const [feedback, setFeedback] = useState("");

  async function loadEntries() {
    try {
      const data = await api("/guestbook");
      setEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn("GUESTBOOK LOAD ERROR:", error.message);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setState("loading");
    setFeedback("");
    try {
      await api("/guestbook", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", role: "", message: "", website: "" });
      setState("success");
      setFeedback("Thanks — your note is in the moderation queue.");
    } catch (error) {
      setState("error");
      setFeedback(error.message || "Could not submit your note.");
    }
  }

  return (
    <section id="guestbook" className="guestbookSection revealSection" aria-labelledby="guestbook-title">
      <div className="container">
        <div className="guestbookHeader">
          <div>
            <span className="sectionEyebrow">09 / GUESTBOOK</span>
            <h2 id="guestbook-title">Leave a signal.</h2>
          </div>
          <p>A moderated wall for thoughtful notes, build feedback and kind hellos. Your message appears after approval.</p>
        </div>
        <div className="guestbookGrid">
          <form className="guestbookForm" onSubmit={submit}>
            <div className="guestbookFormRow">
              <label>Name<input required minLength={2} maxLength={80} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" /></label>
              <label>Role <span>(optional)</span><input maxLength={100} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} placeholder="Builder, student..." /></label>
            </div>
            <label>Message<textarea required minLength={8} maxLength={500} rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="What did you discover here?" /></label>
            <input className="guestbookHoneypot" tabIndex="-1" autoComplete="off" aria-hidden="true" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} />
            <div className="guestbookFormFooter">
              <small>Messages are reviewed before they go public.</small>
              <button type="submit" className="heroPrimaryBtn" disabled={state === "loading"}>{state === "loading" ? "Sending..." : "Sign the guestbook"} <MessageSquare size={16} /></button>
            </div>
            {feedback && <p className={`guestbookFeedback ${state}`}>{feedback}</p>}
          </form>
          <div className="guestbookWall">
            {entries.length ? entries.map((entry) => (
              <article className="guestbookNote" key={entry.id}>
                <div><strong>{entry.name}</strong><small>{entry.role || "Visitor"}</small></div>
                <p>“{entry.message}”</p>
                <time>{formatDate(entry.created_at)}</time>
              </article>
            )) : <div className="guestbookEmpty">The wall is quiet for now.<br />Be the first approved note.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

function SecretInteractions() {
  const [focusMode, setFocusMode] = useState(false);
  const [konami, setKonami] = useState(false);
  const [toast, setToast] = useState("");
  const code = useRef([]);

  useEffect(() => {
    const konamiKeys = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    const onKeyDown = (event) => {
      if (event.key.toLowerCase() === "t" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        setFocusMode((current) => {
          const next = !current;
          document.body.classList.toggle("focusMode", next);
          setToast(next ? "Focus mode on — T to toggle" : "Focus mode off");
          return next;
        });
      }
      code.current = [...code.current, event.key].slice(-konamiKeys.length);
      if (code.current.every((key, index) => key.toLowerCase() === konamiKeys[index].toLowerCase())) {
        setKonami(true);
        setToast("Secret unlocked — welcome, curious builder.");
        code.current = [];
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <>
      {konami && <div className="konamiBadge" role="status">★ curiosity mode unlocked <button type="button" onClick={() => setKonami(false)} aria-label="Dismiss secret">×</button></div>}
      {toast && !konami && <div className="secretToast" role="status">{toast}</div>}
    </>
  );
}

const skillNodes = [
  {
    id: "software",
    label: "Software",
    icon: Code2,
    detail: "Product-minded web experiences, APIs and tools that turn messy ideas into useful systems.",
    tools: "React · Node.js · SQLite",
    x: 50,
    y: 50,
  },
  {
    id: "mobile",
    label: "Mobile",
    icon: Smartphone,
    detail: "Small, focused mobile apps with clear flows and interfaces that feel good to use.",
    tools: "Android · React Native",
    x: 18,
    y: 22,
  },
  {
    id: "iot",
    label: "IoT",
    icon: Cpu,
    detail: "Connecting sensors, hardware and software into experiments you can see and measure.",
    tools: "ESP32 · Sensors · MQTT",
    x: 82,
    y: 25,
  },
  {
    id: "ai",
    label: "AI / ML",
    icon: BrainCircuit,
    detail: "Exploring practical intelligence: computer vision, useful automation and data-informed decisions.",
    tools: "Python · Vision · Models",
    x: 83,
    y: 77,
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
    detail: "Learning to build with privacy, resilient defaults and a healthy curiosity about failure modes.",
    tools: "Web security · Privacy",
    x: 17,
    y: 77,
  },
  {
    id: "research",
    label: "Research",
    icon: FlaskConical,
    detail: "Keeping questions open long enough to test assumptions and find a better direction.",
    tools: "Experiments · Notes · Iteration",
    x: 50,
    y: 13,
  },
];

function SkillsConstellation() {
  const [activeId, setActiveId] = useState("software");
  const activeSkill = skillNodes.find((skill) => skill.id === activeId) || skillNodes[0];
  const ActiveIcon = activeSkill.icon;

  return (
    <section id="skills" className="skillsSection revealSection" aria-labelledby="skills-title">
      <div className="container">
        <div className="skillsHeader">
          <div>
            <span className="sectionEyebrow">01 / SKILLS CONSTELLATION</span>
            <h2 id="skills-title">A map of what I’m building toward.</h2>
          </div>
          <p>Choose a node to see how the disciplines connect. The center is always the next experiment.</p>
        </div>

        <div className="skillsConstellation">
          <div className="skillsMap" aria-label="Interactive technology map">
            <svg className="skillsConnections" viewBox="0 0 100 100" aria-hidden="true">
              {skillNodes.slice(1).map((skill) => (
                <line
                  key={skill.id}
                  x1="50"
                  y1="50"
                  x2={skill.x}
                  y2={skill.y}
                  className={activeId === skill.id || activeId === "software" ? "is-connected" : ""}
                />
              ))}
              <line x1="18" y1="22" x2="50" y2="13" className={activeId === "research" ? "is-connected" : ""} />
              <line x1="82" y1="25" x2="83" y2="77" className={activeId === "ai" ? "is-connected" : ""} />
              <line x1="17" y1="77" x2="18" y2="22" className={activeId === "mobile" ? "is-connected" : ""} />
            </svg>

            <div className="skillsMapCore" aria-hidden="true">
              <Sparkles size={18} />
              <span>BUILD</span>
            </div>

            {skillNodes.map((skill) => {
              const Icon = skill.icon;
              const isActive = activeId === skill.id;
              return (
                <button
                  type="button"
                  key={skill.id}
                  className={`skillNode ${isActive ? "active" : ""} ${skill.id === "software" ? "skillNodeCore" : ""}`}
                  style={{ left: `${skill.x}%`, top: `${skill.y}%` }}
                  aria-pressed={isActive}
                  aria-label={`Explore ${skill.label}`}
                  onClick={() => setActiveId(skill.id)}
                >
                  <span className="skillNodeIcon"><Icon size={18} /></span>
                  <span>{skill.label}</span>
                </button>
              );
            })}
          </div>

          <div className="skillDetail" aria-live="polite">
            <div className="skillDetailTop">
              <span className="skillDetailIcon"><ActiveIcon size={21} /></span>
              <span className="skillDetailIndex">{String(skillNodes.findIndex((skill) => skill.id === activeId) + 1).padStart(2, "0")} / 06</span>
            </div>
            <h3>{activeSkill.label}</h3>
            <p>{activeSkill.detail}</p>
            <div className="skillTools"><span>EXPLORING WITH</span><strong>{activeSkill.tools}</strong></div>
            <div className="skillDetailHint"><span className="statusDot" /> Select another node to trace the next connection</div>
          </div>
        </div>
      </div>
    </section>
  );
}

const processStages = [
  { title: "Observe", icon: Eye, summary: "Start with the person, constraint or signal.", detail: "I look for the real problem behind the request—what is happening now, what feels difficult and what evidence can guide the first move.", output: "A sharper question" },
  { title: "Research", icon: Search, summary: "Gather context before choosing a direction.", detail: "I read, compare approaches and run small probes so the solution is grounded in context instead of assumptions.", output: "Useful constraints" },
  { title: "Design", icon: PenTool, summary: "Make the idea visible and testable.", detail: "Flows, interfaces and system boundaries become concrete here. A good design makes the next decision easier.", output: "A clear blueprint" },
  { title: "Build", icon: Hammer, summary: "Turn the smallest useful slice into reality.", detail: "I build in short loops, keeping the code understandable and the feedback close to the work.", output: "A working slice" },
  { title: "Test", icon: TestTube2, summary: "Challenge the happy path.", detail: "I test behavior, edge cases and the experience itself—because reliability is part of the design, not a final polish step.", output: "Honest feedback" },
  { title: "Improve", icon: RefreshCw, summary: "Keep what works. Rework what does not.", detail: "Every release is a new observation. I document the lesson, improve the system and carry the learning forward.", output: "The next iteration" },
];

function ProcessTimeline() {
  const [activeStage, setActiveStage] = useState(0);
  const timelineRef = useRef(null);

  useEffect(() => {
    const updateActiveStage = () => {
      if (!timelineRef.current) return;
      const cards = [...timelineRef.current.querySelectorAll(".processStage")];
      const target = window.innerHeight * 0.42;
      let closest = 0;
      let distance = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const nextDistance = Math.abs(card.getBoundingClientRect().top - target);
        if (nextDistance < distance) {
          distance = nextDistance;
          closest = index;
        }
      });
      setActiveStage(closest);
    };

    updateActiveStage();
    window.addEventListener("scroll", updateActiveStage, { passive: true });
    window.addEventListener("resize", updateActiveStage);
    return () => {
      window.removeEventListener("scroll", updateActiveStage);
      window.removeEventListener("resize", updateActiveStage);
    };
  }, []);

  return (
    <section id="process" className="processSection revealSection" aria-labelledby="process-title" ref={timelineRef}>
      <div className="container">
        <div className="processHeader">
          <div>
            <span className="sectionEyebrow">03 / ENGINEERING PROCESS</span>
            <h2 id="process-title">Curiosity, with a repeatable loop.</h2>
          </div>
          <p>Scroll through the stages I use to turn an open-ended idea into something useful—and keep improving it.</p>
        </div>

        <div className="processTimeline">
          <div className="processTrack" aria-hidden="true"><span style={{ height: `${(activeStage / (processStages.length - 1)) * 100}%` }} /></div>
          {processStages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = activeStage === index;
            return (
              <article className={`processStage ${isActive ? "active" : ""}`} key={stage.title}>
                <button type="button" className="processMarker" onClick={() => setActiveStage(index)} aria-label={`Show ${stage.title} stage`} aria-pressed={isActive}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Icon size={17} />
                </button>
                <div className="processStageBody">
                  <span className="processStageKicker">STAGE {String(index + 1).padStart(2, "0")}</span>
                  <h3>{stage.title}</h3>
                  <p>{stage.summary}</p>
                  <div className="processStageDetail">
                    <span>{stage.detail}</span>
                    <strong>OUTPUT / {stage.output}</strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const labStages = [
  { title: "Collect signals", label: "01", icon: Activity, detail: "Observe the inputs: a cursor move, a password check, a question or a rough idea." },
  { title: "Shape a hypothesis", label: "02", icon: BrainCircuit, detail: "Turn those signals into a small, testable interaction instead of a giant first release." },
  { title: "Make it tangible", label: "03", icon: Code2, detail: "Build the useful slice with browser APIs and plain React, keeping the experiment readable." },
  { title: "Measure & improve", label: "04", icon: RefreshCw, detail: "Notice what works, adjust the edges and let the next experiment inherit the learning." },
];

function LabPipeline() {
  const [progress, setProgress] = useState(0);
  const [selectedStage, setSelectedStage] = useState(0);
  const pipelineRef = useRef(null);

  useEffect(() => {
    const updateProgress = () => {
      const element = pipelineRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const range = Math.max(rect.height + window.innerHeight * 0.45, 1);
      const next = Math.max(0, Math.min(1, (window.innerHeight * 0.72 - rect.top) / range));
      setProgress(next);
      setSelectedStage(Math.min(labStages.length - 1, Math.floor(next * labStages.length)));
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const currentStage = labStages[selectedStage];
  const CurrentIcon = currentStage.icon;

  return (
    <div className="labPipeline" ref={pipelineRef}>
      <div className="labPipelineVisual">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path d="M14 16 C 48 4, 86 18, 75 48 S 34 58, 24 83" />
          <path d="M14 16 C 35 39, 54 42, 75 48" className="labPipelineCross" />
        </svg>
        <span className="labPipelineProgress" style={{ height: `${progress * 100}%` }} />
        {labStages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = selectedStage === index;
          return (
            <button
              type="button"
              key={stage.title}
              className={`labPipelineNode ${isActive ? "active" : ""} ${index < selectedStage ? "complete" : ""}`}
              style={{ "--node-position": `${16 + index * 22}%` }}
              onClick={() => setSelectedStage(index)}
              aria-label={`Show laboratory stage ${stage.label}: ${stage.title}`}
              aria-pressed={isActive}
            >
              <Icon size={15} />
              <span>{stage.label}</span>
            </button>
          );
        })}
      </div>
      <div className="labPipelineCopy" aria-live="polite">
        <span className="sectionEyebrow">SCROLL-DRIVEN WORKBENCH</span>
        <div className="labPipelineTitle"><CurrentIcon size={20} /><span>{currentStage.title}</span></div>
        <p>{currentStage.detail}</p>
        <div className="labPipelineMeta"><span>LAB PROGRESS</span><strong>{Math.round(progress * 100)}%</strong></div>
        <div className="labPipelineBar"><span style={{ width: `${progress * 100}%` }} /></div>
        <div className="labPipelineSteps">{labStages.map((stage, index) => <button type="button" key={stage.title} className={selectedStage === index ? "active" : ""} onClick={() => setSelectedStage(index)}>{stage.title}</button>)}</div>
      </div>
    </div>
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
  const [products, setProducts] = useState([]);
  const [projectReactions, setProjectReactions] = useState({});
  const [playingVideo, setPlayingVideo] = useState(null);
  const [typedAbout, setTypedAbout] = useState("");
  const [exploreProgress, setExploreProgress] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [suggestion, setSuggestion] = useState("");

  useEffect(() => {
    const showTimer = window.setTimeout(() => setShowWelcome(true), 450);
    const hideTimer = window.setTimeout(() => setShowWelcome(false), 8500);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    const exitKey = "portfolio-exit-prompt-shown";
    const canShow = () =>
      window.innerWidth > 700 &&
      !sessionStorage.getItem(exitKey) &&
      !showExitPrompt;

    function handleExitIntent(event) {
      if (event.clientY <= 0 && canShow()) {
        sessionStorage.setItem(exitKey, "1");
        setShowExitPrompt(true);
      }
    }

    document.addEventListener("mouseout", handleExitIntent);
    return () => document.removeEventListener("mouseout", handleExitIntent);
  }, [showExitPrompt]);

  function sendSuggestion(event) {
    event.preventDefault();
    const message = suggestion.trim();
    if (!message) return;

    const subject = encodeURIComponent("Portfolio suggestion");
    const body = encodeURIComponent(message);
    window.location.href = `mailto:tarekchy569@gmail.com?subject=${subject}&body=${body}`;
    setShowExitPrompt(false);
  }

  useEffect(() => {
    let mounted = true;

    async function loadHomeContent() {
      try {
        const homeData = await api("/home");
        const projectsData = homeData?.projects || [];
        const blogsData = homeData?.blogs || [];
        const youtubeData = homeData?.youtube || [];
        const researchData = homeData?.research || [];
        const productsData = homeData?.products || [];
        const profileData = homeData?.profile || {};

        if (!mounted) return;

        setP(Array.isArray(projectsData) ? projectsData : []);
        setB(Array.isArray(blogsData) ? blogsData : []);
        setV(Array.isArray(youtubeData) ? youtubeData : []);
        setResearch(Array.isArray(researchData) ? researchData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setProfile(profileData || {});
      } catch (error) {
        console.error("HOME CONTENT LOAD ERROR:", error);
        setP([]);
        setB([]);
        setV([]);
        setResearch([]);
        setProducts([]);
        setProfile({});
      }
    }

    loadHomeContent();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const handlePointer = (event) => {
      root.style.setProperty("--pointer-x", `${event.clientX}px`);
      root.style.setProperty("--pointer-y", `${event.clientY}px`);
    };
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setExploreProgress(maxScroll > 0 ? Math.min(100, Math.round((window.scrollY / maxScroll) * 100)) : 0);
    };
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      }),
      { threshold: 0.12 }
    );

    document.querySelectorAll(".revealSection, .interactiveCard").forEach((element) => observer.observe(element));
    window.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [p.length, b.length, v.length, research.length, products.length]);

  useEffect(() => {
    Promise.all(
      p.filter((project) => project.id).map(async (project) => {
        try {
          return [String(project.id), await api(`/projects/${project.id}/reactions`)];
        } catch (error) {
          console.error("PROJECT REACTIONS LOAD ERROR:", error);
          return [String(project.id), {}];
        }
      })
    ).then((entries) => setProjectReactions(Object.fromEntries(entries)));
  }, [p]);

  useEffect(() => {
    const visitKey = "portfolio-visit-recorded";

    if (sessionStorage.getItem(visitKey)) {
      return;
    }

    api("/visits", {
      method: "POST",
      body: JSON.stringify({ page: window.location.pathname }),
    })
      .then(() => sessionStorage.setItem(visitKey, "1"))
      .catch((error) => {
        console.error("VISITOR TRACKING ERROR:", error);
      });
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

  return (
    <>
      {showWelcome && (
        <aside className="welcomeToast" role="status" aria-live="polite">
          <div className="welcomeToastIcon"><Sparkles size={18} /></div>
          <div className="welcomeToastCopy">
            <strong>Thank you for visiting!</strong>
            <span>Take a look around — I hope you find something useful and inspiring.</span>
          </div>
          <button type="button" onClick={() => setShowWelcome(false)} aria-label="Close welcome message">
            <X size={15} />
          </button>
        </aside>
      )}
      {showExitPrompt && (
        <div className="exitPromptBackdrop" role="presentation">
          <section className="exitPrompt" role="dialog" aria-modal="true" aria-labelledby="exit-prompt-title">
            <button
              type="button"
              className="exitPromptClose"
              onClick={() => setShowExitPrompt(false)}
              aria-label="Close suggestion prompt"
            >
              <X size={16} />
            </button>
            <div className="exitPromptIcon"><MessageSquare size={20} /></div>
            <span className="sectionEyebrow">BEFORE YOU GO</span>
            <h2 id="exit-prompt-title">Do you have a suggestion?</h2>
            <p>Your feedback can help me make this portfolio more useful. I would love to hear it.</p>
            <form onSubmit={sendSuggestion}>
              <textarea
                value={suggestion}
                onChange={(event) => setSuggestion(event.target.value)}
                placeholder="What could I improve or add?"
                rows="4"
                autoFocus
              />
              <div className="exitPromptActions">
                <button type="button" className="exitPromptSkip" onClick={() => setShowExitPrompt(false)}>Maybe later</button>
                <button type="submit" className="exitPromptSend" disabled={!suggestion.trim()}>Send suggestion <ArrowUpRight size={15} /></button>
              </div>
            </form>
          </section>
        </div>
      )}
      <div className="experienceRail" aria-label={`Portfolio exploration progress: ${exploreProgress}%`}>
        <span style={{ height: `${exploreProgress}%` }} />
        <strong>{String(exploreProgress).padStart(2, "0")}%</strong>
      </div>

      <Nav />
      <CommandPalette />
      <SecretInteractions />

      <section className="hero premiumHero">
        <div className="heroGrid" />
        <div className="heroGlow heroGlowOne" />
        <div className="heroGlow heroGlowTwo" />

        <div className="heroContainer">
          <div className="heroContent">
            <div className="heroEyebrow">
              <span className="liveDot" />
              <span>OPEN TO LEARNING & BUILDING</span>
              <Sparkles size={13} />
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

            <a href="#about" className="explorePrompt">
              <Compass size={15} />
              <span>Start the journey</span>
              <small>01 — 06</small>
            </a>

            <div className="journeyConsole">
              <div className="journeyConsoleHeader">
                <span><span className="consolePulse" /> TAREK OS / EXPLORATION MODE</span>
                <span>v2.026</span>
              </div>
              <div className="journeyConsoleBody">
                <div>
                  <strong>{String(p.length).padStart(2, "0")}</strong>
                  <span>builds</span>
                </div>
                <div>
                  <strong>{String(research.length).padStart(2, "0")}</strong>
                  <span>ideas</span>
                </div>
                <div>
                  <strong>{String(v.length).padStart(2, "0")}</strong>
                  <span>tutorials</span>
                </div>
              </div>
              <div className="journeyConsoleFooter">
                <span>MISSION: DISCOVER THE WORK</span>
                <a href="#projects">LAUNCH <ArrowUpRight size={12} /></a>
              </div>
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

      <section id="about" className="aboutSection uniqueAbout revealSection">
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

      <SkillsConstellation />

<Block id="projects" num="02" title="Things I've built.">

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
      const projectRouteId = getContentRouteId(x);

      return (
        <Link
          className="projectCard"
          key={x.id || x.title || i}
          style={{ "--project-index": i }}
          to={`/projects/${encodeURIComponent(projectRouteId)}`}
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

            <ReactionButtons
              resource="projects"
              productId={x.id}
              value={projectReactions[String(x.id)]}
              onChange={(data) =>
                setProjectReactions((current) => ({
                  ...current,
                  [String(x.id)]: data,
                }))
              }
              onError={(message) => console.error("PROJECT REACTION ERROR:", message)}
            />

            {/* PROJECT LINKS */}
            <div className="projectLinks">

              {x.liveUrl && (
                <span
                  className="projectLink live"
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
                  className="projectLink github"
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

        </Link>
      );

    })}

  </div>

</Block>

      <ProcessTimeline />

      <Block id="university" num="04" title="My university archive.">

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

<Block id="research" num="05" title="Exploring before I specialize.">

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
      className="researchCard interactiveCard"
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

      <Block id="blog" num="06" title="What I'm learning, documented.">

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
      const linkUrl = x.liveUrl || x.github || null;
      const isExternal = Boolean(linkUrl);


      return (
        <article
          className={`projectCard interactiveCard ${isExternal ? 'clickable' : ''}`}
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

      <ProjectLab />
      <ChooseYourPath projects={p} blogs={b} videos={v} research={research} />
      <DigitalStore products={products} />
      <Guestbook />


<Block id="youtube" num="08" title="Build with me.">

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
            <span className="sectionEyebrow">09 / CONTACT</span>

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
    <section id={id} className="section dark revealSection">
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
  ["products", "Digital Store", ShoppingBag],
];

/* =========================================================
   ADMIN - FIXED VERSION
========================================================= */

/* =========================================================
   ADMIN - FIXED
========================================================= */

function VisitorInsights({ insights }) {
  if (!insights) return null;
  const list = (values) => values?.length ? values.map((item) => (
    <li key={item.label}><span title={item.label}>{item.label}</span><strong>{item.count}</strong></li>
  )) : <li className="insightsEmpty">No data yet</li>;

  return (
    <section className="visitorInsights" aria-labelledby="visitor-insights-title">
      <div className="insightsHeader">
        <div><small>TELEMETRY / LAST 7 DAYS</small><h2 id="visitor-insights-title">What visitors explored</h2></div>
        <div className="insightsPulse"><strong>{insights.last7Days || 0}</strong><span>visits · {insights.uniqueLast7Days || 0} unique</span></div>
      </div>
      <div className="insightsGrid">
        <div><h3>Top pages</h3><ol>{list(insights.topPages)}</ol></div>
        <div><h3>Referrers</h3><ol>{list(insights.topReferrers)}</ol></div>
      </div>
    </section>
  );
}

function GuestbookModeration({ items, onChange }) {
  const [busy, setBusy] = useState("");
  async function moderate(id, status) {
    setBusy(`${id}-${status}`);
    try {
      await api(`/admin/guestbook/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await onChange();
    } catch (error) {
      alert(error.message || "Could not update guestbook entry.");
    } finally {
      setBusy("");
    }
  }
  async function remove(id) {
    if (!confirm("Delete this guestbook entry permanently?")) return;
    setBusy(`${id}-delete`);
    try {
      await api(`/admin/guestbook/${id}`, { method: "DELETE" });
      await onChange();
    } catch (error) {
      alert(error.message || "Could not delete guestbook entry.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="guestbookAdminList">
      <p className="adminHint">Approve thoughtful notes to publish them publicly. Rejected notes remain private for your audit trail.</p>
      {!items.length && <div className="note">No guestbook submissions yet.</div>}
      {items.map((entry) => (
        <article className={`guestbookAdminRow status-${entry.status}`} key={entry.id}>
          <div className="guestbookAdminCopy">
            <div><strong>{entry.name}</strong><span>{entry.role || "Visitor"}</span><em>{entry.status}</em></div>
            <p>{entry.message}</p>
            <small>{new Date(entry.created_at).toLocaleString()}</small>
          </div>
          <div className="guestbookAdminActions">
            {entry.status !== "approved" && <button type="button" disabled={!!busy} onClick={() => moderate(entry.id, "approved")}>{busy === `${entry.id}-approved` ? "..." : "Approve"}</button>}
            {entry.status !== "rejected" && <button type="button" disabled={!!busy} onClick={() => moderate(entry.id, "rejected")}>{busy === `${entry.id}-rejected` ? "..." : "Reject"}</button>}
            {entry.status !== "pending" && <button type="button" disabled={!!busy} onClick={() => moderate(entry.id, "pending")}>Pending</button>}
            <button type="button" className="danger" disabled={!!busy} onClick={() => remove(entry.id)}>{busy === `${entry.id}-delete` ? "..." : "Delete"}</button>
          </div>
        </article>
      ))}
    </div>
  );
}
function Admin() {
  const nav = useNavigate();

  const [tab, setTab] = useState("dashboard");
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [visitorInsights, setVisitorInsights] = useState(null);
  const [edit, setEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to load data from Supabase
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      if (tab === "dashboard") {
        const [data, insights] = await Promise.all([
          api("/admin/stats"),
          api("/admin/visitor-insights"),
        ]);
        setStats(data || {});
        setVisitorInsights(insights || null);
        console.log("📊 Stats loaded:", data);
      } else if (tab !== "profile") {
        const data = await api(
          tab === "visitors" ? "/admin/visitors" : `/admin/${tab}`
        );
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

        <button
          type="button"
          className={tab === "visitors" ? "on" : ""}
          onClick={() => {
            setTab("visitors");
            setEdit(null);
          }}
        >
          <Users />
          Visitors
        </button>
        <button
          type="button"
          className={tab === "guestbook" ? "on" : ""}
          onClick={() => {
            setTab("guestbook");
            setEdit(null);
          }}
        >
          <MessageSquare />
          Guestbook
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
                : tab === "visitors"
                ? "Visitors"
                : tab === "guestbook"
                ? "Guestbook"
                : res.find((x) => x[0] === tab)?.[1]}
            </h1>
            {error && <div className="error" style={{color: 'red'}}>{error}</div>}
          </div>

          {tab !== "dashboard" && tab !== "profile" && tab !== "visitors" && tab !== "guestbook" && (
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
          <>
            <div className="adminstats">
              <div>
                <Users />
                <b>{stats.uniqueVisitors || 0}</b>
                <small>Unique visitors</small>
              </div>
              <div>
                <Users />
                <b>{stats.visits || 0}</b>
                <small>Total visits</small>
              </div>
              {res.map(([resource, name, Icon]) => (
                <div key={resource}>
                  <Icon />
                  <b>{stats[resource] || 0}</b>
                  <small>{name}</small>
                </div>
              ))}
            </div>
            <VisitorInsights insights={visitorInsights} />
          </>
        ) : tab === "profile" ? (
          <Profile />
        ) : tab === "visitors" ? (
          <VisitorList items={items} />
        ) : tab === "guestbook" ? (
          <GuestbookModeration items={items} onChange={loadData} />
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

function VisitorList({ items }) {
  if (!items.length) {
    return <div className="note">No visits recorded yet.</div>;
  }

  function VisitorInsights({ insights }) {
    if (!insights) return null;
    const list = (values) => values?.length ? values.map((item) => (
      <li key={item.label}><span title={item.label}>{item.label}</span><strong>{item.count}</strong></li>
    )) : <li className="insightsEmpty">No data yet</li>;

    return (
      <section className="visitorInsights" aria-labelledby="visitor-insights-title">
        <div className="insightsHeader">
          <div><small>TELEMETRY / LAST 7 DAYS</small><h2 id="visitor-insights-title">What visitors explored</h2></div>
          <div className="insightsPulse"><strong>{insights.last7Days || 0}</strong><span>visits · {insights.uniqueLast7Days || 0} unique</span></div>
        </div>
        <div className="insightsGrid">
          <div><h3>Top pages</h3><ol>{list(insights.topPages)}</ol></div>
          <div><h3>Referrers</h3><ol>{list(insights.topReferrers)}</ol></div>
        </div>
      </section>
    );
  }

  function GuestbookModeration({ items, onChange }) {
    const [busy, setBusy] = useState("");
    async function moderate(id, status) {
      setBusy(`${id}-${status}`);
      try {
        await api(`/admin/guestbook/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
        await onChange();
      } catch (error) {
        alert(error.message || "Could not update guestbook entry.");
      } finally {
        setBusy("");
      }
    }
    async function remove(id) {
      if (!confirm("Delete this guestbook entry permanently?")) return;
      setBusy(`${id}-delete`);
      try {
        await api(`/admin/guestbook/${id}`, { method: "DELETE" });
        await onChange();
      } catch (error) {
        alert(error.message || "Could not delete guestbook entry.");
      } finally {
        setBusy("");
      }
    }

    return (
      <div className="guestbookAdminList">
        <p className="adminHint">Approve thoughtful notes to publish them publicly. Rejected notes remain private for your audit trail.</p>
        {!items.length && <div className="note">No guestbook submissions yet.</div>}
        {items.map((entry) => (
          <article className={`guestbookAdminRow status-${entry.status}`} key={entry.id}>
            <div className="guestbookAdminCopy">
              <div><strong>{entry.name}</strong><span>{entry.role || "Visitor"}</span><em>{entry.status}</em></div>
              <p>{entry.message}</p>
              <small>{new Date(entry.created_at).toLocaleString()}</small>
            </div>
            <div className="guestbookAdminActions">
              {entry.status !== "approved" && <button type="button" disabled={!!busy} onClick={() => moderate(entry.id, "approved")}>{busy === `${entry.id}-approved` ? "..." : "Approve"}</button>}
              {entry.status !== "rejected" && <button type="button" disabled={!!busy} onClick={() => moderate(entry.id, "rejected")}>{busy === `${entry.id}-rejected` ? "..." : "Reject"}</button>}
              {entry.status !== "pending" && <button type="button" disabled={!!busy} onClick={() => moderate(entry.id, "pending")}>Pending</button>}
              <button type="button" className="danger" disabled={!!busy} onClick={() => remove(entry.id)}>{busy === `${entry.id}-delete` ? "..." : "Delete"}</button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="visitorList">
      {items.map((visitor) => (
        <div className="visitorRow" key={visitor.id}>
          <div>
            <strong>Visitor {visitor.visitor_id}</strong>
            <small>{visitor.page}</small>
          </div>
          <div>
            <strong>{visitor.user_agent || "Unknown browser"}</strong>
            <small>
              {visitor.referrer || "Direct visit"} ·{" "}
              {new Date(visitor.visited_at).toLocaleString()}
            </small>
          </div>
        </div>
      ))}
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
      ['tech', 'tags', 'technology', 'features'].forEach(key => {
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

async function uploadPdfFile(file) {
  if (!file || file.type !== "application/pdf") throw new Error("Please select a PDF file.");
  if (file.size > 25 * 1024 * 1024) throw new Error("PDF must be smaller than 25MB.");
  const formData = new FormData(); formData.append("image", file);
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/upload`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: formData });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "PDF upload failed.");
  return data.url || data.imageUrl || "";
}
function PdfDropzone({ value, onChange }) {
  const [uploading, setUploading] = useState(false); const [error, setError] = useState("");
  async function choose(file) { if (!file) return; setError(""); setUploading(true); try { onChange(await uploadPdfFile(file)); } catch (err) { setError(err.message || "PDF upload failed."); } finally { setUploading(false); } }
  return <div className="pdfDropzone"><label>BOOK PDF FILE<input type="file" accept="application/pdf,.pdf" onChange={(event) => choose(event.target.files?.[0])} /></label><span>{uploading ? "Uploading PDF..." : value ? "PDF uploaded successfully" : "Choose a PDF (max 25MB)"}</span>{value && <a href={getImageUrl(value)} target="_blank" rel="noreferrer">Open uploaded PDF</a>}{error && <small>{error}</small>}</div>;
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
  } else if (r === "products") {
    fields = ["title", "description", "productType", "framework", "downloadType", "price", "currency", "checkoutUrl", "freeDownloadUrl", "previewUrl", "features"];
  } else if (r === "university") {
    fields = ["title", "course", "semester", "type", "description", "fileUrl", "github", "liveUrl"];
  } else {
    fields = ["title", "description", "technology", "status", "github"];
  }

  async function submit(e) {
    e.preventDefault();

    const d = { ...f };

    ["tech", "tags", "technology", "features"].forEach((key) => {
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

          if (key === "downloadType" && r === "products") {
            return (
              <label key={key}>
                Download access
                <select value={f[key] || "free"} onChange={(event) => set(key, event.target.value)}>
                  <option value="free">Free download</option>
                  <option value="paid">Paid purchase</option>
                </select>
              </label>
            );
          }

          if (key === "framework" && r === "products") {
            return (
              <label key={key}>
                Theme framework
                <select value={f[key] || "React"} onChange={(event) => set(key, event.target.value)}>
                  <option value="React">React</option>
                  <option value="Next.js">Next.js</option>
                  <option value="HTML / CSS">HTML / CSS</option>
                  <option value="Vue">Vue</option>
                  <option value="WordPress">WordPress</option>
                </select>
              </label>
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
        {r === "products" && String(f.productType || "").toLowerCase().includes("book") && (
          <div className="bookUploadPanel">
            <strong>BOOK DOWNLOAD FILE</strong>
            <span>Upload the PDF that visitors will download.</span>
            <PdfDropzone value={f.pdfUrl || f.freeDownloadUrl || ""} onChange={(value) => { set("pdfUrl", value); set("freeDownloadUrl", value); }} />
          </div>
        )}

        {r === "products" && (
          <div className="image-field">
            <small>PRODUCT COVER IMAGE</small>
            <ImageDropzone
              inputId="product-image"
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
   PROJECT DETAILS
========================================================= */

function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProject() {
      try {
        const projects = await api("/projects");
        const list = Array.isArray(projects) ? projects : [];
        const found = list.find((item) => (
          String(getId(item)) === String(id) ||
          getContentRouteId(item) === decodeURIComponent(String(id))
        ));

        if (!mounted) return;
        if (!found) {
          setError("Project case study not found.");
        } else {
          setProject(found);
        }
      } catch (loadError) {
        console.error("PROJECT LOAD ERROR:", loadError);
        if (mounted) setError("Failed to load this project.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProject();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="projectDetailsLoading">
        <div className="loadingSpinner" />
        <p>Loading case study…</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="projectDetailsLoading">
        <h1>{error || "Project not found"}</h1>
        <Link to="/">← Back to portfolio</Link>
      </div>
    );
  }

  const image = getImageUrl(project.image);
  const details = project.details && typeof project.details === "object" ? project.details : {};
  const tech = Array.isArray(project.tech) ? project.tech : [];
  const features = Array.isArray(project.features)
    ? project.features
    : Array.isArray(details.features)
      ? details.features
      : tech;
  const challenge = project.challenge || details.challenge || "Turning an idea into a dependable, useful experience.";
  const solution = project.solution || details.solution || project.description || "A focused build shaped by iteration, feedback and practical constraints.";
  const outcome = project.outcome || details.outcome || project.result || "A working project that made the next question easier to explore.";

  return (
    <div className="projectDetailsPage">
      <header className="projectDetailsNav">
        <Link to="/" className="detailBack"><ArrowLeft size={16} /> Back to portfolio</Link>
        <span className="detailCode">CASE STUDY / {String(getId(project)).padStart(2, "0")}</span>
      </header>
      <main>
        <section className="projectDetailsHero">
          <div className="projectDetailsHeroCopy">
            <span className="sectionEyebrow">{project.category || "PROJECT"} / CASE STUDY</span>
            <h1>{project.title}</h1>
            <p>{project.description || "A project built while learning by doing."}</p>
            <div className="projectDetailsActions">
              {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">Live demo <ExternalLink size={15} /></a>}
              {project.github && <a href={project.github} target="_blank" rel="noreferrer">Source code <Github size={15} /></a>}
            </div>
          </div>
          <div className="projectDetailsVisual">
            {image ? <img src={image} alt={project.title} /> : <div className="projectDetailPlaceholder"><Code2 size={52} /></div>}
          </div>
        </section>

        <section className="projectDetailsBody">
          <div className="projectDetailsMeta">
            <div><small>ROLE</small><strong>{project.role || "Builder & researcher"}</strong></div>
            <div><small>YEAR</small><strong>{project.year || formatDate(project.created_at) || "Ongoing"}</strong></div>
            <div><small>STACK</small><strong>{tech.length ? tech.join(" · ") : "Exploration in progress"}</strong></div>
          </div>
          <div className="caseStudyGrid">
            <article><span>01 / THE CHALLENGE</span><h2>Start with a real problem.</h2><p>{challenge}</p></article>
            <article><span>02 / THE APPROACH</span><h2>Make the next step tangible.</h2><p>{solution}</p></article>
            <article><span>03 / THE OUTCOME</span><h2>Leave room to keep learning.</h2><p>{outcome}</p></article>
          </div>
          {!!features.length && (
            <div className="caseStudyFeatures">
              <span>BUILD NOTES</span>
              <div>{features.map((feature, index) => <span key={`${feature}-${index}`}>{feature}</span>)}</div>
            </div>
          )}
        </section>
      </main>
    </div>
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
      <Route path="/store" element={<StorePage />} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
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
    <ReactionProvider>
      <App />
    </ReactionProvider>

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
    <Suspense fallback={<div className="note">Loading editor...</div>}>
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
    </Suspense>

  );
}
