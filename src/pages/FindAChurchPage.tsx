import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ChurchDirectory } from '../components/ChurchDirectory';
import { ChurchStructuredData } from '../components/ChurchStructuredData';

export function FindAChurchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const initialState = searchParams.get('state') ?? 'ALL';

  function handleFiltersChange(updates: { query?: string; state?: string }) {
    setSearchParams(
      (prev) => {
        const updated = new URLSearchParams(prev);
        if (updates.query !== undefined) {
          if (updates.query.trim()) {
            updated.set('q', updates.query);
          } else {
            updated.delete('q');
          }
        }
        if (updates.state !== undefined) {
          if (updates.state && updates.state !== 'ALL') {
            updated.set('state', updates.state);
          } else {
            updated.delete('state');
          }
        }
        return updated;
      },
      { replace: true }
    );
  }

  return (
    <>
      <PageHeader
        title="Find a church"
        description="Search by suburb, town or postcode, or use your location, to find service times and directions for your nearest CRCA church."
        breadcrumbs={[{ label: 'Find a church' }]}
      />

      <ChurchDirectory
        externalQuery={initialQuery}
        initialStateFilter={initialState}
        onFiltersChange={handleFiltersChange}
      />
      <ChurchStructuredData />
    </>
  );
}
