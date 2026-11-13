export default function manifest() {
  return {
    name: 'IBI Kids',
    short_name: 'IBI Kids',
    description: 'ألعاب ووسائل تعليمية و علاجية للأطفال — توصيل إلى جميع الولايات',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#17131A',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      { src: '/favicon-ibi.png', sizes: '192x192', type: 'image/png' },
      { src: '/favicon-ibi.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
