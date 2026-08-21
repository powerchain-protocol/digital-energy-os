import type { ComponentType } from "react";
import {
  BackpackIcon,
  BarChartIcon,
  ChatBubbleIcon,
  CubeIcon,
  DashboardIcon,
  FileTextIcon,
  GearIcon,
  GlobeIcon,
  HomeIcon,
  LightningBoltIcon,
  MixerHorizontalIcon,
  PersonIcon,
  ReaderIcon,
  RocketIcon,
  MagicWandIcon,
  Link2Icon,
  SewingPinIcon,
} from "@radix-ui/react-icons";
import type { AppRole } from "@/types/auth";
import { ROUTES } from "@/config/routes";

export type NavigationIcon = ComponentType<{ className?: string }>;
export type NavigationItem = {
  label: string;
  href: string;
  icon: NavigationIcon;
  roles?: AppRole[];
  description?: string;
};
export type NavigationGroup = { label: string; items: NavigationItem[] };

const all: AppRole[] = ["consumer", "prosumer", "client", "company", "admin", "super-admin"];
const operators: AppRole[] = ["prosumer", "company", "admin", "super-admin"];
const admins: AppRole[] = ["admin", "super-admin"];

export const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    label: "Operations",
    items: [
      { label: "Overview", href: ROUTES.home, icon: DashboardIcon, roles: all },
      { label: "Ecosystem", href: ROUTES.ecosystem, icon: RocketIcon, roles: all },
      { label: "Intelligence Cloud", href: ROUTES.platform, icon: GlobeIcon, roles: all, description: "Clouds, fabrics, runtimes and studios" },
      { label: "Energy", href: ROUTES.energy, icon: LightningBoltIcon, roles: all },
      { label: "AI Energy Intelligence", href: ROUTES.intelligence, icon: MagicWandIcon },
      { label: "Proof of Energy", href: ROUTES.proofOfEnergy, icon: Link2Icon },
      { label: "Blockchain", href: ROUTES.blockchain, icon: GlobeIcon, roles: operators },
      { label: "Digital Twins", href: ROUTES.digitalTwins, icon: CubeIcon },
      { label: "Renewables", href: ROUTES.renewables, icon: SewingPinIcon, roles: all },
      { label: "Smart Grid", href: ROUTES.smartGridMap, icon: GlobeIcon, roles: operators },
      { label: "Smart Meters", href: ROUTES.smartMeters, icon: MixerHorizontalIcon, roles: operators },
      { label: "Analytics", href: ROUTES.analytics, icon: BarChartIcon, roles: operators },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Exchange", href: ROUTES.exchange, icon: BarChartIcon, roles: all },
      { label: "Local P2P Energy", href: ROUTES.p2pEnergy, icon: LightningBoltIcon, roles: all },
      { label: "Marketplace", href: ROUTES.marketplace, icon: GlobeIcon, roles: all },
      { label: "Carbon Exchange", href: ROUTES.carbonExchange, icon: GlobeIcon, roles: all },
      { label: "Certification", href: ROUTES.certification, icon: ReaderIcon, roles: all },
      { label: "Checkout", href: ROUTES.checkout, icon: BackpackIcon, roles: all },
      { label: "Crowdfunding", href: ROUTES.crowdfunding, icon: RocketIcon, roles: all },
      { label: "Projects", href: ROUTES.projects, icon: ReaderIcon, roles: all },
    ],
  },
  {
    label: "Assets & Edge",
    items: [
      { label: "Portfolio", href: ROUTES.portfolio, icon: CubeIcon, roles: ["prosumer", "client", "company", "admin", "super-admin"] },
      { label: "Hardware Fleet", href: ROUTES.hardwares, icon: CubeIcon, roles: operators },
      { label: "Device Products", href: ROUTES.deviceProducts, icon: BackpackIcon, roles: all },
      { label: "Firmware", href: ROUTES.firmwares, icon: GearIcon, roles: operators },
      { label: "DePIN & Helium", href: ROUTES.depin, icon: RocketIcon, roles: operators },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Wallet", href: ROUTES.wallet, icon: BackpackIcon, roles: all },
      { label: "Tokenization", href: ROUTES.tokenization, icon: CubeIcon, roles: all },
      { label: "PWRC Token", href: ROUTES.tokenPwrc, icon: CubeIcon, roles: all },
      { label: "Rewards & Leaderboard", href: ROUTES.leaderboard, icon: BarChartIcon, roles: all },
      { label: "Governance", href: ROUTES.governance, icon: CubeIcon, roles: all },
      { label: "Billing", href: ROUTES.billing, icon: FileTextIcon, roles: all },
      { label: "Pricing", href: ROUTES.pricing, icon: FileTextIcon, roles: all },
      { label: "CRM", href: ROUTES.crm, icon: PersonIcon, roles: ["company", "admin", "super-admin"] },
      { label: "Case Studies", href: ROUTES.caseStudies, icon: HomeIcon, roles: all },
    ],
  },
  {
    label: "References",
    items: [
      { label: "Documentation", href: ROUTES.docs, icon: ReaderIcon, roles: all, description: "Platform guides, API references and standards" },
      { label: "Architecture", href: ROUTES.architecture, icon: CubeIcon, roles: all },
      { label: "Engineering Framework", href: ROUTES.framework, icon: RocketIcon, roles: all },
      { label: "Technical Standards", href: ROUTES.standards, icon: FileTextIcon, roles: all },
      { label: "Protocols", href: ROUTES.protocols, icon: Link2Icon, roles: all },
      { label: "Legal & Policies", href: ROUTES.docsLegal, icon: FileTextIcon, roles: all },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Participants", href: ROUTES.participants, icon: PersonIcon, roles: ["company", "admin", "super-admin"] },
      { label: "Users", href: ROUTES.users, icon: PersonIcon, roles: admins },
      { label: "Organization", href: ROUTES.organization, icon: CubeIcon, roles: admins },
      { label: "Settings", href: ROUTES.profile, icon: GearIcon, roles: all },
    ],
  },
];
