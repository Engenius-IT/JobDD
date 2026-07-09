// Define a type for the theme structure for better type safety
export type PackageTheme = {
  name: string;
  navbarBg: string; // Full Tailwind class for Navbar background
  navbarText: string; // Full Tailwind class for Navbar text
  buttonBg: string; // Full Tailwind class for primary button background
  buttonHoverBg: string; // Full Tailwind class for primary button hover background
  buttonText: string; // Full Tailwind class for primary button text
  subNavbarBg: string; // Full Tailwind class for Subnavbar background
  subNavbarLinkText: string; // Full Tailwind class for Subnavbar link text
  subNavbarLinkHoverText: string; // Full Tailwind class for Subnavbar link hover text
  subNavbarActiveIndicator: string; // Full Tailwind classes for active link indicator (gradient + shadow)
  subNavbarDropdownBg: string; // Full Tailwind class for dropdown background
  subNavbarDropdownHoverBg: string; // Full Tailwind class for dropdown item hover background
  subNavbarDropdownHoverText: string; // Full Tailwind class for dropdown item hover text
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
    navbarBg: 'bg-gradient-to-r from-orange-400 to-yellow-400', // ส้ม/เหลือง
    navbarText: 'text-gray-900',
    buttonBg: 'bg-orange-600',
    buttonHoverBg: 'hover:bg-orange-700',
    buttonText: 'text-white',
    subNavbarBg: 'bg-orange-500', // A solid color for subnavbar for simplicity, or a lighter gradient
    subNavbarLinkText: 'text-white/80',
    subNavbarLinkHoverText: 'hover:text-white',
    subNavbarActiveIndicator: 'bg-gradient-to-r from-yellow-300 via-orange-300 to-red-400 shadow-[0_0_8px_rgba(253,186,116,0.8)]', // Yellow/Orange glow
    subNavbarDropdownBg: 'bg-white',
    subNavbarDropdownHoverBg: 'hover:bg-orange-50',
    subNavbarDropdownHoverText: 'hover:text-orange-600',
    employerBackendButtonBg: 'bg-amber-400', // Existing color for employer button
    employerBackendButtonHoverBg: 'hover:bg-amber-300',
    employerBackendButtonText: 'text-gray-900',
    adminBackendButtonBg: 'bg-red-600', // Existing color for admin button
    adminBackendButtonHoverBg: 'hover:bg-red-700',
    adminBackendButtonText: 'text-white',
  },
  PREMIUM: {
    name: 'PREMIUM',
    navbarBg: 'bg-gradient-to-r from-blue-900 to-blue-700', // น้ำเงินเข้มเรืองแสง
    navbarText: 'text-white',
    buttonBg: 'bg-blue-600',
    buttonHoverBg: 'hover:bg-blue-700',
    buttonText: 'text-white',
    subNavbarBg: 'bg-blue-800', // Darker blue for subnavbar
    subNavbarLinkText: 'text-white/80',
    subNavbarLinkHoverText: 'hover:text-white',
    subNavbarActiveIndicator: 'bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 shadow-[0_0_8px_rgba(147,197,253,0.8)]', // Blue glow
    subNavbarDropdownBg: 'bg-white',
    subNavbarDropdownHoverBg: 'hover:bg-blue-50',
    subNavbarDropdownHoverText: 'hover:text-blue-600',
    employerBackendButtonBg: 'bg-blue-600', // Themed employer button
    employerBackendButtonHoverBg: 'hover:bg-blue-700',
    employerBackendButtonText: 'text-white',
    adminBackendButtonBg: 'bg-red-700', // Admin button can remain distinct or be themed
    adminBackendButtonHoverBg: 'hover:bg-red-800',
    adminBackendButtonText: 'text-white',
  },
  VIP: {
    name: 'VIP',
    navbarBg: 'bg-gradient-to-r from-red-700 to-pink-500', // แดง/ชมพูไล่เฉด
    navbarText: 'text-white',
    buttonBg: 'bg-red-500',
    buttonHoverBg: 'hover:bg-red-600',
    buttonText: 'text-white',
    subNavbarBg: 'bg-red-600', // Darker red for subnavbar
    subNavbarLinkText: 'text-white/80',
    subNavbarLinkHoverText: 'hover:text-white',
    subNavbarActiveIndicator: 'bg-gradient-to-r from-pink-300 via-red-300 to-red-400 shadow-[0_0_8px_rgba(252,165,165,0.8)]', // Red/Pink glow
    subNavbarDropdownBg: 'bg-white',
    subNavbarDropdownHoverBg: 'hover:bg-red-50',
    subNavbarDropdownHoverText: 'hover:text-red-600',
    employerBackendButtonBg: 'bg-red-500', // Themed employer button
    employerBackendButtonHoverBg: 'hover:bg-red-600',
    employerBackendButtonText: 'text-white',
    adminBackendButtonBg: 'bg-purple-700', // Admin button can be distinct for VIP
    adminBackendButtonHoverBg: 'hover:bg-purple-800',
    adminBackendButtonText: 'text-white',
  },
  DEFAULT: { // For Jobseeker or users without a specific package
    name: 'DEFAULT',
    navbarBg: 'bg-white', // Default white background
    navbarText: 'text-gray-900', // Default text color
    buttonBg: 'bg-[#A80010]', // Existing register button color
    buttonHoverBg: 'hover:bg-[#E00016]', // Existing register button hover color (adjusted for consistency)
    buttonText: 'text-white',
    subNavbarBg: 'bg-[#202063]', // Existing subnavbar background color (from register page example)
    subNavbarLinkText: 'text-white/80',
    subNavbarLinkHoverText: 'hover:text-white',
    subNavbarActiveIndicator: 'bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 shadow-[0_0_8px_rgba(147,197,253,0.8)]', // Existing blue glow
    subNavbarDropdownBg: 'bg-white',
    subNavbarDropdownHoverBg: 'hover:bg-blue-50',
    subNavbarDropdownHoverText: 'hover:text-blue-600',
    employerBackendButtonBg: 'bg-amber-400', // Existing color for employer button
    employerBackendButtonHoverBg: 'hover:bg-amber-300',
    employerBackendButtonText: 'text-gray-900',
    adminBackendButtonBg: 'bg-red-600', // Existing color for admin button
    adminBackendButtonHoverBg: 'hover:bg-red-700',
    adminBackendButtonText: 'text-white',
  }
};

// หมายเหตุ:
// หากสีที่ต้องการใช้ (เช่น #202063 หรือ #00003D) ไม่ได้อยู่ใน Tailwind's default color palette
// คุณจะต้องเพิ่มสีเหล่านั้นเข้าไปในไฟล์ tailwind.config.js ของโปรเจกต์
// ตัวอย่างการเพิ่มใน tailwind.config.js:
/*
module.exports = {
  theme: {
    extend: {
      colors: {
        'custom-dark-blue': '#202063',
        'custom-darker-blue': '#00003D',
        // เพิ่มสีอื่นๆ ที่ต้องการใช้ เช่น
        // 'pro-yellow': '#FFD700',
        // 'pro-orange': '#FFA500',
        // 'premium-navy': '#00008B',
        // 'vip-crimson': '#DC143C',
      },
    },
  },
};
*/
// หลังจากเพิ่มใน tailwind.config.js แล้ว คุณสามารถใช้ชื่อสีที่กำหนดเองใน packageThemes ได้ เช่น
// navbarBg: 'custom-dark-blue',