import ImpressumPage from '@/components/legal/ImpressumPage';

export const metadata = {
  title: 'Impressum | ZSCORE.studio',
  description: 'Impressum und rechtliche Angaben für ZSCORE.studio.',
  openGraph: {
    title: 'Impressum | ZSCORE.studio',
    description: 'Impressum und rechtliche Angaben für ZSCORE.studio.',
    type: 'website',
  },
};

export default function ImpressumRoutePage() {
  return <ImpressumPage />;
}
