import DatenschutzPage from '@/components/legal/DatenschutzPage';

export const metadata = {
  title: 'Datenschutz | ZSCORE.studio',
  description: 'Datenschutzerklärung für ZSCORE.studio.',
  openGraph: {
    title: 'Datenschutz | ZSCORE.studio',
    description: 'Datenschutzerklärung für ZSCORE.studio.',
    type: 'website',
  },
};

export default function DatenschutzRoutePage() {
  return <DatenschutzPage />;
}
