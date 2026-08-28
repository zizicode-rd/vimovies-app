import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect fallback domain root to Spanish site
  redirect('/es');
}
