import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ChurchDirectory } from '../components/ChurchDirectory';

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
        eyebrow="Congregations Across Australia"
        title="Find a Local CRCA Church"
        description="Browse our congregations across nearly every Australian state and territory. Search by suburb or postcode, sort by nearest location, and preview each church's website, livestream, Facebook page, or sermon podcast."
        breadcrumbs={[{ label: 'Find a Church' }]}
      />

      <ChurchDirectory
        externalQuery={initialQuery}
        initialStateFilter={initialState}
        onFiltersChange={handleFiltersChange}
      />
    </>
  );
}
