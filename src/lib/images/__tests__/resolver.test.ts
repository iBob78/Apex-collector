import { getPublicImage, normalize, buildVehicleKey, resolveDrivetrainLayoutIcon } from '../resolver';
import { IMAGE_PATHS } from '../paths';

describe('Image Resolver', () => {
    describe('normalize', () => {
        it('should normalize strings correctly', () => {
            expect(normalize('Ferrari 488 GTB')).toBe('ferrari-488-gtb');
            expect(normalize('  Audi  R8 ')).toBe('audi-r8');
            expect(normalize('Porsche 911! GT3?')).toBe('porsche-911-gt3');
        });

        it('should handle null/undefined', () => {
            expect(normalize(null)).toBe('unknown');
            expect(normalize(undefined)).toBe('unknown');
        });
    });

    describe('getPublicImage', () => {
        // Note: Mocking process.env might be needed for full testing
        it('should return absolute URLs as is', () => {
            const url = 'https://example.com/test.jpg';
            expect(getPublicImage(url)).toBe(url);
        });

        it('should return local paths starting with / as is', () => {
            const path = '/local/image.png';
            expect(getPublicImage(path)).toBe(path);
        });
    });

    describe('buildVehicleKey', () => {
        it('should build correct vehicle keys', () => {
            const params = {
                make: 'Ferrari',
                model: '488 GTB',
                year: 2015
            };
            const expected = `${IMAGE_PATHS.VEHICLE_CARD}/ferrari-488-gtb-2015.jpg`;
            expect(buildVehicleKey(params)).toBe(expected);
        });
    });

    it('should use the Supabase circuit card placeholder key', () => {
        expect(IMAGE_PATHS.PLACEHOLDERS.CIRCUIT_CARD).toBe('placeholders/circuit-default.jpg');
    });

    describe('resolveDrivetrainLayoutIcon', () => {
        it.each(['MR', 'FF', 'FR', 'MF', 'FA', 'RR', 'MA'])('resolves the %s layout icon', (layout) => {
            expect(resolveDrivetrainLayoutIcon(layout)).toBeDefined();
            expect(IMAGE_PATHS.ICONS.DRIVETRAIN_LAYOUT[layout as keyof typeof IMAGE_PATHS.ICONS.DRIVETRAIN_LAYOUT])
                .toBe(`icons/${layout}.png`);
        });

        it('normalizes case and whitespace', () => {
            expect(resolveDrivetrainLayoutIcon(' mr ')).toBeDefined();
        });

        it('does not resolve unsupported layouts', () => {
            expect(resolveDrivetrainLayoutIcon('AWD')).toBeUndefined();
            expect(resolveDrivetrainLayoutIcon(null)).toBeUndefined();
        });
    });
});
