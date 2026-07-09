export type PackageTheme = {
  name: string;
  logoClass?: string; // Optional class for logo, e.g. 'brightness-0 invert' for dark themes
  navbarBg: string; // Full Tailwind class for Navbar background
  navbarText: string; // Full Tailwind class for Navbar text
  buttonBg: string; // Full Tailwind class for primary button background
  buttonHoverBg: string; // Full Tailwind class for primary button hover background
  buttonText: string; // Full Tailwind class for primary button text
  subNavbarBg: string; // Full Tailwind class for Subnavbar background
  subNavbarLinkText: string; // Full Tailwind class for Subnavbar link text
  subNavbarLinkHoverText: string; // Full Tailwind class for Subnavbar link hover text
  subNavbarActiveIndicator: string; // Full Tailwind classes for active link indicator
  subNavbarActiveText?: string; // Full Tailwind class for active link text color
  subNavbarDropdownBg: string; // Full Tailwind class for dropdown background
  subNavbarDropdownHoverBg: string; // Full Tailwind class for dropdown item hover background
  subNavbarDropdownHoverText: string; // Full Tailwind class for dropdown item hover text
  logoContainerClass?: string; // Optional wrapper class for logo container
  userDropdownClass: string; // Tailwind class for the user dropdown button trigger
  langSwitcherClass: string; // Tailwind class for language switcher container
  langBtnActive: string; // Tailwind class for active language button
  langBtnInactive: string; // Tailwind class for inactive language button
  bellBtnClass: string; // Tailwind class for notification bell button
  navbarBorderAndShadow?: string; // Dynamic header border and shadow
  badgeText?: string; // Premium membership badge text
  badgeClass?: string; // Tailwind class for badge text color
  avatarRingClass?: string; // Tailwind class for avatar golden/ruby ring gradient
  employerBackendButtonBg: string; // Specific button for employer backend
  employerBackendButtonHoverBg: string;
  employerBackendButtonText: string;
  adminBackendButtonBg: string; // Specific button for admin backend
  adminBackendButtonHoverBg: string;
  adminBackendButtonText: string;
};

export const packageThemes: Record<string, PackageTheme> = {
  PRO: {
    name: 'PRO',
    logoContainerClass: 'bg-white/30 backdrop-blur-md border border-white/40 px-3.5 py-1 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-[2px] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(216,154,0,0.15)]',
    userDropdownClass: 'bg-white/18 backdrop-blur-[12px] border border-white/35 rounded-xl px-4 py-1 shadow-[0_8px_20px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(255,255,255,0.4)] text-gray-900/90 transition-all duration-200 hover:-translate-y-[2px] hover:scale-[1.02] hover:shadow-[0_4px_15px_rgba(216,154,0,0.15)] focus:outline-none my-1',
    langSwitcherClass: 'hidden md:flex items-center gap-1 bg-white/20 backdrop-blur-md border border-white/30 p-1 rounded-lg transition-all duration-200 hover:-translate-y-[2px] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(216,154,0,0.1)]',
    langBtnActive: 'bg-white/90 text-amber-900 shadow-sm font-bold ring-1 ring-white/10',
    langBtnInactive: 'text-gray-900/80 hover:text-amber-900 hover:bg-white/20',
    bellBtnClass: 'relative p-2 text-gray-900/90 bg-white/30 backdrop-blur-md border border-white/40 rounded-xl hover:text-amber-900 hover:bg-white/40 transition-all duration-200 hover:-translate-y-[2px] hover:scale-[1.05] hover:shadow-[0_4px_12px_rgba(216,154,0,0.15)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] my-1',
    navbarBg: 'bg-[linear-gradient(to_right,#FFF9EB_0%,#F8D978_35%,#F4C542_70%,#D89A00_100%)]', 
    navbarBorderAndShadow: 'border-t border-white/45 border-b border-[#B98C00]/15 shadow-[0_6px_18px_rgba(0,0,0,0.08)]',
    badgeText: 'PRO MEMBER',
    badgeClass: 'text-[#C99700]',
    avatarRingClass: 'bg-gradient-to-tr from-[#FFF9EB] via-[#F8D978] to-[#D89A00]',
    navbarText: 'text-gray-900/90 font-semibold tracking-[0.5px]',
    buttonBg: 'bg-amber-600',
    buttonHoverBg: 'hover:bg-amber-700',
    buttonText: 'text-white',
    subNavbarBg: 'bg-[linear-gradient(to_right,#F5D061_0%,#E6B222_100%)] border-t border-[#FFD76A]/30', 
    subNavbarLinkText: 'text-amber-950/85 hover:text-amber-950',
    subNavbarLinkHoverText: 'hover:text-amber-950 hover:-translate-y-[2px] hover:scale-[1.02]',
    subNavbarActiveIndicator: 'absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[3px] rounded-full bg-gradient-to-r from-white via-yellow-100 to-amber-100 shadow-[0_0_8px_rgba(255,255,255,0.9)]', 
    subNavbarActiveText: 'font-semibold text-amber-950',
    subNavbarDropdownBg: 'bg-white',
    subNavbarDropdownHoverBg: 'hover:bg-amber-50',
    subNavbarDropdownHoverText: 'hover:text-amber-700',
    employerBackendButtonBg: 'bg-gradient-to-b from-[#F6CF58] to-[#D79A00] border border-[#B97D00] shadow-[0_6px_14px_rgba(0,0,0,0.10)] rounded-full', 
    employerBackendButtonHoverBg: 'hover:opacity-95',
    employerBackendButtonText: 'text-amber-950 font-bold',
    adminBackendButtonBg: 'bg-red-800/20 border border-red-800/30', 
    adminBackendButtonHoverBg: 'hover:bg-red-800/30',
    adminBackendButtonText: 'text-red-950 font-bold',
  },
  PREMIUM: {
    name: 'PREMIUM',
    logoContainerClass: 'bg-gradient-to-b from-[#E0F2FE] to-[#93C5FD] border border-[#60A5FA]/60 px-3.5 py-1 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-[2px] hover:scale-[1.02]',
    userDropdownClass: 'bg-gradient-to-b from-[#E0F2FE] to-[#93C5FD] border border-[#60A5FA]/60 rounded-full px-4 py-1 text-black hover:opacity-95 transition-all focus:outline-none shadow-sm',
    langSwitcherClass: 'hidden md:flex items-center gap-1 bg-[#E0F2FE] border border-[#60A5FA]/60 p-1 rounded-full shadow-sm transition-all',
    langBtnActive: 'bg-white text-black shadow-sm font-bold rounded-full ring-1 ring-black/5',
    langBtnInactive: 'text-black/70 hover:text-black hover:bg-white/20 rounded-full',
    bellBtnClass: 'relative p-2 text-black bg-gradient-to-b from-[#E0F2FE] to-[#93C5FD] border border-[#60A5FA]/60 rounded-full hover:opacity-95 transition-all shadow-sm',
    navbarBg: 'bg-galaxy-stars', 
    navbarBorderAndShadow: 'border-b border-[#1B3EA6]/15 shadow-[0_6px_18px_rgba(0,0,0,0.08)]',
    badgeText: 'PREMIUM MEMBER',
    badgeClass: 'text-[#1B3EA6]',
    avatarRingClass: 'bg-gradient-to-tr from-[#E0F2FE] via-[#93C5FD] to-[#1B3EA6]',
    navbarText: 'text-gray-900/90 font-semibold tracking-[0.5px]',
    buttonBg: 'bg-blue-600',
    buttonHoverBg: 'hover:bg-blue-700',
    buttonText: 'text-white',
    subNavbarBg: 'bg-[#1B3583] border-t border-white/10', 
    subNavbarLinkText: 'text-white/80 hover:text-white',
    subNavbarLinkHoverText: 'hover:text-white hover:-translate-y-[2px] hover:scale-[1.02]',
    subNavbarActiveIndicator: 'absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[3px] rounded-full bg-gradient-to-r from-white via-cyan-100 to-sky-100 shadow-[0_0_8px_rgba(255,255,255,0.9)]', 
    subNavbarActiveText: 'font-semibold text-white',
    subNavbarDropdownBg: 'bg-white',
    subNavbarDropdownHoverBg: 'hover:bg-blue-50',
    subNavbarDropdownHoverText: 'hover:text-blue-700',
    employerBackendButtonBg: 'bg-gradient-to-b from-[#E0F2FE] to-[#93C5FD] border border-[#60A5FA]/60 shadow-[0_4px_10px_rgba(0,0,0,0.05)] rounded-full', 
    employerBackendButtonHoverBg: 'hover:opacity-95',
    employerBackendButtonText: 'text-black font-bold',
    adminBackendButtonBg: 'bg-blue-800/20 border border-blue-800/30', 
    adminBackendButtonHoverBg: 'hover:bg-blue-800/30',
    adminBackendButtonText: 'text-blue-955 font-bold text-blue-950',
  },
  VIP: {
    name: 'VIP',
    logoContainerClass: 'bg-[#FDF6F3] border border-red-900/10 px-3.5 py-1 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-[2px] hover:scale-[1.01]',
    userDropdownClass: 'bg-[#FDF6F3] border border-red-900/10 rounded-xl px-4 py-1.5 text-red-950 hover:bg-[#FAF0EC] transition-all focus:outline-none my-1 shadow-sm',
    langSwitcherClass: 'hidden md:flex items-center gap-1 bg-[#FDF6F3] border border-red-900/10 p-1 rounded-lg shadow-sm transition-all',
    langBtnActive: 'bg-[#C9A227] text-white shadow-sm font-bold',
    langBtnInactive: 'text-red-950/70 hover:text-[#C9A227] hover:bg-[#FAF0EC]',
    bellBtnClass: 'relative p-2 text-red-950 bg-[#FDF6F3] border border-red-900/10 rounded-xl hover:text-red-950 hover:bg-[#FAF0EC] transition-all shadow-sm my-1',
    navbarBg: 'bg-[linear-gradient(135deg,#6B1B27_0%,#8B2332_35%,#6B1B27_70%,#4A0F1A_100%)]', 
    navbarBorderAndShadow: 'border-t border-white/10 border-b border-[#4A0F1A]/40 shadow-[0_6px_18px_rgba(0,0,0,0.1)]',
    navbarText: 'text-white/90 font-semibold tracking-[0.5px]',
    buttonBg: 'bg-[#C9A227] border border-[#A88118]',
    buttonHoverBg: 'hover:bg-[#A88118]',
    buttonText: 'text-white',
    subNavbarBg: 'bg-[linear-gradient(135deg,#4C1019_0%,#621721_35%,#4C1019_70%,#30080F_100%)] border-t border-[#8B2332]/15', 
    subNavbarLinkText: 'text-[#F5E6E3]/85 hover:text-white',
    subNavbarLinkHoverText: 'hover:text-white hover:-translate-y-[2px] hover:scale-[1.02]',
    subNavbarActiveIndicator: 'absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[3px] rounded-full bg-gradient-to-r from-[#FDF6F3] via-[#C9A227] to-[#FDF6F3] shadow-[0_0_8px_rgba(201,162,39,0.6)]', 
    subNavbarActiveText: 'font-semibold text-white',
    subNavbarDropdownBg: 'bg-white',
    subNavbarDropdownHoverBg: 'hover:bg-[#FAF0EC]',
    subNavbarDropdownHoverText: 'hover:text-[#7A1F2B]',
    badgeText: 'VIP MEMBER',
    badgeClass: 'text-[#C9A227]',
    avatarRingClass: 'bg-gradient-to-tr from-[#FDF6F3] via-[#E6BE53] to-[#C9A227]',
    employerBackendButtonBg: 'bg-gradient-to-b from-[#E6BE53] via-[#C9A227] to-[#A88118] border border-[#916E10] shadow-[0_6px_14px_rgba(0,0,0,0.15)] rounded-full', 
    employerBackendButtonHoverBg: 'hover:opacity-95',
    employerBackendButtonText: 'text-amber-950 font-bold',
    adminBackendButtonBg: 'bg-red-800/20 border border-red-800/30', 
    adminBackendButtonHoverBg: 'hover:bg-red-800/30',
    adminBackendButtonText: 'text-red-950 font-bold',
  },
  DEFAULT: {
    name: 'DEFAULT',
    userDropdownClass: 'flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors focus:outline-none',
    langSwitcherClass: 'hidden md:flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200',
    langBtnActive: 'px-2.5 py-1 text-xs font-bold rounded-md transition-all bg-white text-(--color-primary) shadow-sm ring-1 ring-gray-200/50',
    langBtnInactive: 'px-2.5 py-1 text-xs font-bold rounded-md transition-all text-gray-500 hover:text-gray-700 hover:bg-gray-100',
    bellBtnClass: 'relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors',
    navbarBg: 'bg-white', 
    navbarText: 'text-gray-900', 
    buttonBg: 'bg-[#A80010]', 
    buttonHoverBg: 'hover:bg-[#E00016]', 
    buttonText: 'text-white',
    subNavbarBg: 'animate-luxury-flow border-t border-blue-950/20', 
    subNavbarLinkText: 'text-white/80',
    subNavbarLinkHoverText: 'hover:text-white',
    subNavbarActiveIndicator: 'absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[3px] rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 shadow-[0_0_8px_rgba(147,197,253,0.8)]', 
    subNavbarActiveText: 'font-semibold text-white text-glow-blue',
    subNavbarDropdownBg: 'bg-white',
    subNavbarDropdownHoverBg: 'hover:bg-blue-50',
    subNavbarDropdownHoverText: 'hover:text-blue-600',
    employerBackendButtonBg: 'bg-amber-400 rounded-xl', 
    employerBackendButtonHoverBg: 'hover:bg-amber-300',
    employerBackendButtonText: 'text-gray-900',
    adminBackendButtonBg: 'bg-red-600', 
    adminBackendButtonHoverBg: 'hover:bg-red-700',
    adminBackendButtonText: 'text-white',
  }
};
