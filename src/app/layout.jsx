import '../index.css';

export const metadata = {
  title: 'ZSCORE.studio - Editorial Infrastructure for Contemporary Music',
  description: 'ZSCORE.studio operates the structural integrity of musical materials, from initial preparation to reliable parts, rehearsal, and publication.',
  icons: {
    icon: '/logo.svg?v=2',
    shortcut: '/logo.svg?v=2',
    apple: '/logo.svg?v=2',
  },
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/logo.svg?v=2" />
        <link rel="icon" type="image/png" href="/logo.svg?v=2" />
        <link rel="apple-touch-icon" href="/logo.svg?v=2" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}