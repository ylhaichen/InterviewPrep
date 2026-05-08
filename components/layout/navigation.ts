import {
  BookOpen,
  Brain,
  CircleHelp,
  Compass,
  FlaskConical,
  GitBranchPlus,
  Home,
  Network,
  Settings
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Home Dashboard", icon: Home },
  { href: "/papers", label: "Paper Radar", icon: BookOpen },
  { href: "/concepts", label: "Concept Atlas", icon: Brain },
  { href: "/graph", label: "Knowledge Graph", icon: Network },
  { href: "/quiz", label: "Quiz Arena", icon: CircleHelp },
  { href: "/interview", label: "Interview Mode", icon: FlaskConical },
  { href: "/roadmap", label: "Learning Roadmap", icon: Compass },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/papers?focus=import", label: "Manual Import", icon: GitBranchPlus }
];
