import { Alpaca } from "./components/Alpaca";
import { BookIcon, CardsIcon, ChartIcon, HomeIcon, PracticeIcon, SidebarIcon } from "./components/Icons";
import { useEffect, type ReactNode } from "react";
import type { CourseState } from "./lib/lesson";
import { useProgress } from "./lib/progress";
import { useSidebarCollapsed } from "./lib/settings";
import { loadEpochs } from "./program";
import { allLoaded, neededEpochs, useContent } from "./program/useContent";
import { href, useRoute } from "./lib/router";
import { CoursePage } from "./sections/CoursePage";
import { MistakesPage, MistakesPractice } from "./sections/MistakesPage";
import { WritePage } from "./sections/WritePage";
import { Home } from "./sections/Home";
import { ProgressPage } from "./sections/ProgressPage";
import { LessonPlayer } from "./sections/lesson/LessonPlayer";
import { Drill, MixedPractice } from "./sections/grammar/Drill";
import { GrammarHome } from "./sections/grammar/GrammarHome";
import { Tables } from "./sections/grammar/Tables";
import { TopicView } from "./sections/grammar/TopicView";
import { DayView } from "./sections/words/DayView";
import { LearnDay, Review } from "./sections/words/Review";
import { WordsHome } from "./sections/words/WordsHome";

function page(route: string[]): ReactNode {
  const [section, a, b] = route;
  switch (section) {
    case "words":
      if (a === "review") return <Review />;
      if (a === "learn") return <LearnDay key={b} day={Number(b)} />;
      if (a === "day") return <DayView day={Number(b)} />;
      return <WordsHome />;
    case "grammar":
      if (a === "tables") return <Tables />;
      if (a && b === "drill") return <Drill key={a} id={a} />;
      if (a) return <TopicView id={a} />;
      return <GrammarHome />;
    case "lesson":
      return <LessonPlayer key={a} id={a} />;
    case "course":
      return <CoursePage />;
    case "write":
      return <WritePage />;
    case "mistakes":
      return a === "practice" ? <MistakesPractice /> : <MistakesPage />;
    case "practice":
      return <MixedPractice />;
    case "stats":
    case "progress":
      return <ProgressPage />;
    default:
      return <Home />;
  }
}

/** Practice screens take the whole viewport: no navigation, nothing to distract. */
const isFocus = (r: string[]) =>
  r[0] === "lesson" || r[0] === "practice" || (r[0] === "mistakes" && r[1] === "practice") || (r[0] === "words" && (r[1] === "review" || r[1] === "learn")) || r[2] === "drill";

export function App() {
  const route = useRoute();
  const { ready, meta, items } = useProgress();
  const [collapsed, setCollapsed] = useSidebarCollapsed();
  // Only the epochs needed now are loaded (current, started, the next one, the one in the URL).
  useContent();
  const needed = ready ? neededEpochs(meta.course as Partial<CourseState> | undefined, items, route) : [];
  const neededKey = needed.join(",");
  useEffect(() => {
    if (neededKey) void loadEpochs(neededKey.split(","));
  }, [neededKey]);
  const section = route[0] === "progress" ? "stats" : route[0] === "write" || route[0] === "mistakes" ? "course" : route[0] ?? "";

  if (!ready || !allLoaded(needed))
    return (
      <div className="loading">
        <Alpaca size={72} mood="think" />
      </div>
    );
  if (isFocus(route)) return <div className="focus-shell">{page(route)}</div>;

  // Reviews happen inside the daily lesson (warm-up), so the menu carries no counters.
  const NAV = [
    { id: "", label: "Сегодня", icon: <HomeIcon size={20} /> },
    { id: "course", label: "Курс", icon: <PracticeIcon size={20} /> },
    { id: "words", label: "Слова", icon: <CardsIcon size={20} /> },
    { id: "grammar", label: "Грамматика", icon: <BookIcon size={20} /> },
    { id: "stats", label: "Статистика", icon: <ChartIcon size={20} /> },
  ];

  return (
    <div className={`shell${collapsed ? " collapsed" : ""}`}>
      <aside className="sidebar">
        <a href={href()} className="brand" title="Alpaca Greek">
          <span className="brand-mark"><Alpaca size={30} /></span>
          <span className="side-label">Alpaca Greek</span>
        </a>
        <nav className="side-nav">
          {NAV.map((n) => (
            <a key={n.id} href={href(...(n.id ? [n.id] : []))} className={section === n.id ? "active" : ""} title={collapsed ? n.label : undefined}>
              {n.icon}
              <span className="side-label">{n.label}</span>
            </a>
          ))}
        </nav>
        <button
          className="side-collapse"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
          title={collapsed ? "Развернуть меню" : "Свернуть меню"}
        >
          <SidebarIcon size={20} />
          <span className="side-label">Свернуть</span>
        </button>
      </aside>

      <main className="main">
        <div className="container">{page(route)}</div>
      </main>

      <nav className="tabbar">
        {NAV.map((n) => (
          <a key={n.id} href={href(...(n.id ? [n.id] : []))} className={section === n.id ? "active" : ""}>
            <span className="tab-icon">{n.icon}</span>
            <span>{n.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
