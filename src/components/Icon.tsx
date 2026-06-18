import { ReactNode, SVGProps } from "react";
import "./Icon.css";

/* Jango icon system - custom inline SVGs, one consistent style. */
/* stroke 1.75, 24x24, currentColor, round caps/joins. No emojis. */

type SvgP = SVGProps<SVGSVGElement>;
const base = (p: SvgP) => ({
  viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  width: "1em", height: "1em", ...p,
});

/* ---- individual glyph components ---- */
export const TrophyIcon = (p: SvgP) => (<svg {...base(p)}><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M17 5h2.5a2 2 0 0 1 0 4c-.6 1.6-1.7 2.4-2.5 2.7"/><path d="M7 5H4.5a2 2 0 0 0 0 4c.6 1.6 1.7 2.4 2.5 2.7"/><path d="M9 18h6"/><path d="M10 18c0-1.5-.5-2.3-1-3"/><path d="M14 18c0-1.5.5-2.3 1-3"/><path d="M8 21h8"/></svg>);
export const CoinsIcon = (p: SvgP) => (<svg {...base(p)}><circle cx="9" cy="9" r="5"/><path d="M16.5 4.8a5 5 0 0 1 0 8.4"/><path d="M19 7a5 5 0 0 1 0 8.4"/><path d="M7 9h3M9 7v4"/></svg>);
export const GamepadIcon = (p: SvgP) => (<svg {...base(p)}><path d="M7 8h10a5 5 0 0 1 4.9 4l.8 4a2.2 2.2 0 0 1-4 1.6L17 15H7l-1.7 2.6a2.2 2.2 0 0 1-4-1.6l.8-4A5 5 0 0 1 7 8Z"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r=".6" fill="currentColor"/><circle cx="18" cy="13.5" r=".6" fill="currentColor"/></svg>);
export const PlayIcon = (p: SvgP) => (<svg {...base(p)}><path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5Z"/></svg>);
export const SwordsIcon = (p: SvgP) => (<svg {...base(p)}><path d="M14.5 4H20v5.5L9.5 20 4 14.5 14.5 4Z"/><path d="M14.5 14.5 20 20"/><path d="M8 8 4 4"/><path d="M16 16l-2 2"/></svg>);
export const TargetIcon = (p: SvgP) => (<svg {...base(p)}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>);
export const FlameIcon = (p: SvgP) => (<svg {...base(p)}><path d="M12 3c1 3-1.5 4-1.5 6.5A2.5 2.5 0 0 0 14 11c.3-1 .2-2 0-2.7 1.8 1.2 3 3.3 3 5.7a5 5 0 0 1-10 .3C7 11 9.5 8 12 3Z"/></svg>);
export const CrownIcon = (p: SvgP) => (<svg {...base(p)}><path d="M4 8l3.5 3L12 5l4.5 6L20 8l-1.5 9h-13L4 8Z"/><path d="M5.5 20h13"/><circle cx="4" cy="8" r="1.1" fill="currentColor"/><circle cx="20" cy="8" r="1.1" fill="currentColor"/><circle cx="12" cy="4.6" r="1.1" fill="currentColor"/></svg>);
export const SparklesIcon = (p: SvgP) => (<svg {...base(p)}><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z"/><path d="M18.5 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z"/></svg>);
export const BoltIcon = (p: SvgP) => (<svg {...base(p)}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>);
export const CartIcon = (p: SvgP) => (<svg {...base(p)}><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2.2l2 13h12l2-9H6"/></svg>);
export const LockIcon = (p: SvgP) => (<svg {...base(p)}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><path d="M12 15v2"/></svg>);
export const CheckCircleIcon = (p: SvgP) => (<svg {...base(p)}><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9"/></svg>);
export const AlertCircleIcon = (p: SvgP) => (<svg {...base(p)}><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5"/><circle cx="12" cy="16.2" r=".7" fill="currentColor"/></svg>);
export const InfoIcon = (p: SvgP) => (<svg {...base(p)}><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.8" r=".7" fill="currentColor"/></svg>);
export const SearchIcon = (p: SvgP) => (<svg {...base(p)}><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>);
export const UsersIcon = (p: SvgP) => (<svg {...base(p)}><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6"/><path d="M17.5 13.5A5.5 5.5 0 0 1 20.5 19"/></svg>);
export const MessageIcon = (p: SvgP) => (<svg {...base(p)}><path d="M4 5h16v11H8l-4 3V5Z"/><path d="M8 9.5h8M8 12.5h5"/></svg>);
export const SettingsIcon = (p: SvgP) => (<svg {...base(p)}><circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.5M12 19v2.5M5 5l1.8 1.8M17.2 17.2L19 19M2.5 12H5M19 12h2.5M5 19l1.8-1.8M17.2 6.8 19 5"/></svg>);
export const ShieldIcon = (p: SvgP) => (<svg {...base(p)}><path d="M12 3 5 6v5c0 4.4 2.9 7.6 7 9 4.1-1.4 7-4.6 7-9V6l-7-3Z"/><path d="M9 12l2 2 4-4"/></svg>);
export const ChartIcon = (p: SvgP) => (<svg {...base(p)}><path d="M4 4v16h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/></svg>);
export const MedalIcon = (p: SvgP) => (<svg {...base(p)}><circle cx="12" cy="14" r="5"/><path d="M9 9.5 6.5 3M15 9.5 17.5 3"/><path d="M12 12.2l.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2.8-1.6Z"/></svg>);
export const GemIcon = (p: SvgP) => (<svg {...base(p)}><path d="M6 3h12l3 5-9 13L3 8l3-5Z"/><path d="M3 8h18M9 3 7 8l5 13M15 3l2 5-5 13"/></svg>);
export const ArrowUpRightIcon = (p: SvgP) => (<svg {...base(p)}><path d="M7 17 17 7M9 7h8v8"/></svg>);
export const ArrowDownIcon = (p: SvgP) => (<svg {...base(p)}><path d="M12 5v14M6 13l6 6 6-6"/></svg>);
export const ArrowRightIcon = (p: SvgP) => (<svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
export const ArrowLeftIcon = (p: SvgP) => (<svg {...base(p)}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>);
export const SendIcon = (p: SvgP) => (<svg {...base(p)}><path d="M21 3 3 11l7 2.5L13 21l8-18Z"/><path d="M10 13.5 21 3"/></svg>);
export const CardIcon = (p: SvgP) => (<svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 9.5h18M6.5 14.5h4"/></svg>);
export const BankIcon = (p: SvgP) => (<svg {...base(p)}><path d="M4 9 12 4l8 5"/><path d="M5 9v8M9 9v8M15 9v8M19 9v8"/><path d="M3.5 20h17"/></svg>);
export const ScaleIcon = (p: SvgP) => (<svg {...base(p)}><path d="M12 4v16M7 20h10"/><path d="M12 6 5 8l-2 5a3 3 0 0 0 6 0L7 8M12 6l7 2 2 5a3 3 0 0 1-6 0l2-5"/></svg>);
export const EditIcon = (p: SvgP) => (<svg {...base(p)}><path d="M14 5l5 5M4 20l1-4L16 5l3 3L8 19l-4 1Z"/></svg>);
export const CloseIcon = (p: SvgP) => (<svg {...base(p)}><path d="M6 6l12 12M18 6 6 18"/></svg>);
export const StarIcon = (p: SvgP) => (<svg {...base(p)}><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z"/></svg>);
export const DiceIcon = (p: SvgP) => (<svg {...base(p)}><rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.1" fill="currentColor"/><circle cx="15" cy="9" r="1.1" fill="currentColor"/><circle cx="9" cy="15" r="1.1" fill="currentColor"/><circle cx="15" cy="15" r="1.1" fill="currentColor"/></svg>);
export const BellIcon = (p: SvgP) => (<svg {...base(p)}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>);
export const HomeIcon = (p: SvgP) => (<svg {...base(p)}><path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></svg>);
export const BuildingIcon = (p: SvgP) => (<svg {...base(p)}><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/></svg>);
export const ListIcon = (p: SvgP) => (<svg {...base(p)}><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>);
export const TerminalIcon = (p: SvgP) => (<svg {...base(p)}><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7 9l3 3-3 3M13 15h4"/></svg>);
export const CalendarIcon = (p: SvgP) => (<svg {...base(p)}><rect x="4" y="5" width="16" height="16" rx="2.5"/><path d="M4 9.5h16M8 3v4M16 3v4"/></svg>);
export const CheckIcon = (p: SvgP) => (<svg {...base(p)}><path d="M5 12.5 10 17 19 7"/></svg>);

export type IconName =
  "Trophy" | "Coins" | "Gamepad" | "Play" | "Swords" | "Target" | "Flame" | "Crown" | "Sparkles" | "Bolt" | "Cart" | "Lock" | "CheckCircle" | "AlertCircle" | "Info" | "Search" | "Users" | "Message" | "Settings" | "Shield" | "Chart" | "Medal" | "Gem" | "ArrowUpRight" | "ArrowDown" | "ArrowRight" | "ArrowLeft" | "Send" | "Card" | "Bank" | "Scale" | "Edit" | "Close" | "Star" | "Dice" | "Bell" | "Home" | "Building" | "List" | "Terminal" | "Calendar" | "Check";

const REGISTRY: Record<string, (p: SvgP) => ReactNode> = {
  Trophy: TrophyIcon,
  Coins: CoinsIcon,
  Gamepad: GamepadIcon,
  Play: PlayIcon,
  Swords: SwordsIcon,
  Target: TargetIcon,
  Flame: FlameIcon,
  Crown: CrownIcon,
  Sparkles: SparklesIcon,
  Bolt: BoltIcon,
  Cart: CartIcon,
  Lock: LockIcon,
  CheckCircle: CheckCircleIcon,
  AlertCircle: AlertCircleIcon,
  Info: InfoIcon,
  Search: SearchIcon,
  Users: UsersIcon,
  Message: MessageIcon,
  Settings: SettingsIcon,
  Shield: ShieldIcon,
  Chart: ChartIcon,
  Medal: MedalIcon,
  Gem: GemIcon,
  ArrowUpRight: ArrowUpRightIcon,
  ArrowDown: ArrowDownIcon,
  ArrowRight: ArrowRightIcon,
  ArrowLeft: ArrowLeftIcon,
  Send: SendIcon,
  Card: CardIcon,
  Bank: BankIcon,
  Scale: ScaleIcon,
  Edit: EditIcon,
  Close: CloseIcon,
  Star: StarIcon,
  Dice: DiceIcon,
  Bell: BellIcon,
  Home: HomeIcon,
  Building: BuildingIcon,
  List: ListIcon,
  Terminal: TerminalIcon,
  Calendar: CalendarIcon,
  Check: CheckIcon,
};

export function Icon({ name, ...rest }: { name: IconName } & SvgP) {
  const C = REGISTRY[name] || REGISTRY.Info;
  return C(rest) as JSX.Element;
}

type Tone = "primary" | "secondary" | "accent" | "success" | "warning" | "danger" | "gold" | "neutral";
type Size = "sm" | "md" | "lg" | "xl";

interface BadgeProps {
  name: IconName; tone?: Tone; size?: Size;
  shape?: "square" | "circle"; glow?: boolean; className?: string;
}

export function IconBadge({ name, tone = "primary", size = "md", shape = "square", glow = true, className = "" }: BadgeProps) {
  return (
    <span className={`icon-badge ib-${tone} ib-${size} ib-${shape}${glow ? " ib-glow" : ""} ${className}`} aria-hidden="true">
      <Icon name={name} />
    </span>
  );
}

export function FeatureIcon({ name, tone = "primary", size = "lg", glow = true, className = "" }: BadgeProps) {
  return <IconBadge name={name} tone={tone} size={size} shape="square" glow={glow} className={`feature-icon ${className}`} />;
}

export function StatIcon({ name, tone = "neutral", size = "sm", className = "" }: BadgeProps) {
  return <IconBadge name={name} tone={tone} size={size} shape="square" glow={false} className={`stat-icon ${className}`} />;
}

export function NavIcon({ name, className = "" }: { name: IconName; className?: string }) {
  return (<span className={`nav-icon ${className}`} aria-hidden="true"><Icon name={name} /></span>);
}

export function ActionIcon({ name, tone = "neutral", label, onClick, className = "" }: { name: IconName; tone?: Tone; label: string; onClick?: () => void; className?: string }) {
  return (
    <button type="button" className={`action-icon ai-${tone} ${className}`} onClick={onClick} aria-label={label} title={label}>
      <Icon name={name} />
    </button>
  );
}
