import { renderToStaticMarkup } from "react-dom/server";

export function iconToDataUrl(icon: React.ReactElement, size = 38) {
    const svgString = renderToStaticMarkup(icon);
    return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svgString),
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(size / 2, size / 2),
    };
}

export const warnTriangleSvg = () =>
    'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='42' height='42' viewBox='0 0 24 24'>
       <path d='M12 2L22 20H2z' fill='#FDE68A' stroke='#F59E0B' stroke-width='1.6'/>
       <rect x='11' y='8' width='2' height='6' rx='1' fill='#92400E'/>
       <circle cx='12' cy='17' r='1.3' fill='#92400E'/>
     </svg>`
    );

export const critTriangleSvg = () =>
    'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='42' height='42' viewBox='0 0 24 24'>
       <path d='M12 2L22 20H2z' fill='#FCA5A5' stroke='#DC2626' stroke-width='1.6'/>
       <rect x='11' y='8' width='2' height='6' rx='1' fill='#7F1D1D'/>
       <circle cx='12' cy='17' r='1.3' fill='#7F1D1D'/>
     </svg>`
    );

export const waterAlertSvg = () =>
    'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'>
       <circle cx='12' cy='12' r='11' fill='#fff' stroke='#f43f5e' stroke-width='1.5'/>
       <path d='M12 4c3 4 5 6 5 9a5 5 0 1 1-10 0c0-3 2-5 5-9z' fill='#ef4444'/>
       <circle cx='12' cy='12' r='2' fill='#fff' opacity='0.6'/>
     </svg>`
    );

export const cropIcons: Record<string, string> = {
    chili: `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'>
               <circle cx='12' cy='12' r='11' fill='#fff6e6' stroke='#eab308' stroke-width='1.5'/>
               <path d='M7 14c4 0 6-4 9-4 1.6 0 2.8 1.3 2.8 2.9 0 3.8-3.8 6.5-7.8 6.5S5 17.9 5 15c0-0.6.1-1.2.3-1.7' fill='#ef4444'/>
               <path d='M15 9c-.2-1.8 1.6-3.3 3.1-2.4' stroke='#16a34a' stroke-width='1.5' fill='none'/>
             </svg>`,
    corn: `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'>
               <circle cx='12' cy='12' r='11' fill='#f0fdf4' stroke='#10b981' stroke-width='1.5'/>
               <path d='M12 5c2.5 0 4 2.5 4 6s-1.5 8-4 8-4-4.5-4-8 1.5-6 4-6z' fill='#f59e0b'/>
               <path d='M8 9c2 1 6 1 8 0' stroke='#a16207' stroke-width='1' fill='none'/>
             </svg>`,
    carrot: `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'>
               <circle cx='12' cy='12' r='11' fill='#fefce8' stroke='#f59e0b' stroke-width='1.5'/>
               <path d='M7 15l7-7 3 3-7 7-4 1z' fill='#fb923c'/>
               <path d='M14 7l2-3 3 2' stroke='#22c55e' stroke-width='1.5' fill='none'/>
             </svg>`,
    field: `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'>
               <rect x='2' y='2' width='20' height='20' rx='10' fill='#e2f3d6' stroke='#84cc16' stroke-width='1.5'/>
               <path d='M4 16c4-2 8-2 16 0M4 12c6-2 10-2 16 0' stroke='#65a30d' stroke-width='1.2' fill='none'/>
             </svg>`,
    blueberry: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="23" fill="#EEF2FF" stroke="#6366F1" stroke-width="1.5"/>
          <!-- bacche -->
          <circle cx="20" cy="27" r="8" fill="#3B82F6"/>
          <circle cx="28" cy="21" r="8" fill="#2563EB"/>
          <!-- calici -->
          <path d="M20 22.6l2 1.2-0.7 2.1 1.9 1.4-2.3.1-0.9 2-0.9-2-2.3-.1 1.9-1.4-0.7-2.1z" fill="#1E40AF" opacity=".9"/>
          <path d="M28 16.6l2 1.2-0.7 2.1 1.9 1.4-2.3.1-0.9 2-0.9-2-2.3-.1 1.9-1.4-0.7-2.1z" fill="#1E40AF" opacity=".9"/>
          <!-- foglioline -->
          <path d="M29 12c2.8 0 4.2 1.3 5 3-2.2.7-4.5.4-6.2-1.2 0 0 .8-1.8 1.2-1.8z" fill="#16A34A"/>
          <path d="M24 13c-1.8-1.1-3.6-1.1-5.5-.3.5 1.9 2 3.1 4 3.3 0 0 1.5-1.7 1.5-3z" fill="#22C55E"/>
        </svg>`,
    raspberry: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="23" fill="#FEE2E2" stroke="#EF4444" stroke-width="1.5"/>
          <path d="M16 22c-2 0-4-2-4-4s2-4 4-4 4 2 4 4-2 4-4 4z" fill="#F87171"/>
          <path d="M32 22c-2 0-4-2-4-4s2-4 4-4 4 2 4 4-2 4-4 4z" fill="#F87171"/>
        </svg>`,
    blackberry: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="23" fill="#E5E7EB" stroke="#6B7280" stroke-width="1.5"/>
          <path d="M16 22c-2 0-4-2-4-4s2-4 4-4 4 2 4 4-2 4-4 4z" fill="#FBBF24"/>
          <path d="M32 22c-2 0-4-2-4-4s2-4 4-4 4 2 4 4-2 4-4 4z" fill="#FBBF24"/>
        </svg>`
}
export const cropIconSvg = (crop?: string) => {
    const svg = cropIcons[crop ?? 'field'] ?? cropIcons.field
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
}