import Link from 'next/link';

interface HeaderProps {
  currentPage?: 'home' | 'interactions' | 'faq' | 'history';
}

export default function Header({ currentPage = 'home' }: HeaderProps) {
  const getNavLinkClass = (page: string) => {
    if (currentPage === page) {
      return 'text-blue-600 font-medium';
    }
    return 'text-gray-700 hover:text-blue-600 transition-colors';
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Mediphant
          </Link>
          <nav className="flex space-x-8">
            <Link
              href="/interactions"
              className={getNavLinkClass('interactions')}
            >
              Drug Interactions
            </Link>
            <Link
              href="/faq"
              className={getNavLinkClass('faq')}
            >
              FAQ Search
            </Link>
            <Link
              href="/history"
              className={getNavLinkClass('history')}
            >
              History
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}