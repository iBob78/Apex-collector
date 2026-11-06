import { render, screen } from '@testing-library/react';
import Card from '../Card';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/contexts/SitePreferencesContext', () => ({
  useSitePreferences: () => ({
    language: 'fr',
    units: 'metric',
    t: (message: string) => message,
  }),
}));

jest.mock('../SafeImage', () => function MockSafeImage() {
  return null;
});
jest.mock('../IPBadge', () => function MockIPBadge() {
  return <div data-testid="ip-badge" />;
});

describe('Card competition type badge', () => {
  it('displays the vehicle category below its fuel badge', () => {
    render(
      <Card
        id="vehicle-1"
        category="vehicle"
        make="Porsche"
        model="911 GT3 R"
        year={2026}
        rarity="Rare"
        power_hp={565}
        torque_nm={0}
        max_speed_kmh={0}
        weight_t={0}
        fuel_type="ES"
        competition_type="WEC"
        competition_type_custom="LMGT3"
        country_code="DE"
        is_record
        record_description="Record du tour en catégorie LMGT3"
        showLevel={false}
      />,
    );

    const fuelBadge = screen.getByLabelText('Carburant : Essence');
    const categoryBadge = screen.getByLabelText('Type de compétition : WEC · LMGT3');
    const flag = screen.getByRole('img', { name: 'Drapeau : DE' });
    const record = screen.getByRole('img', { name: 'Record' });

    expect(record.querySelector('svg')).toBeInTheDocument();
    expect(flag.parentElement).toBe(record.parentElement);
    expect(flag.compareDocumentPosition(record) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(categoryBadge.textContent).toBe('WEC · LMGT3');
    expect(fuelBadge.compareDocumentPosition(categoryBadge) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
