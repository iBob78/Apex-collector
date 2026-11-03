import { findCollectionNumberGap } from '../collectionNumber';

describe('findCollectionNumberGap', () => {
  it('attribue le premier trou avant de passer au numéro suivant', () => {
    expect(findCollectionNumberGap([1, 2, 3, 5, 6, 8, 9])).toEqual({
      missing: 4,
      nextExpected: 4,
    });
    expect(findCollectionNumberGap([1, 2, 3, 4, 5, 6, 8, 9])).toEqual({
      missing: 7,
      nextExpected: 7,
    });
  });

  it('ne réclame pas de numéro explicite dans un catalogue continu', () => {
    expect(findCollectionNumberGap([])).toEqual({ missing: null, nextExpected: 1 });
    expect(findCollectionNumberGap([1, 2, 3])).toEqual({
      missing: null,
      nextExpected: 4,
    });
  });

  it('réutilise le premier numéro si le catalogue démarre à 2', () => {
    expect(findCollectionNumberGap([2, 3])).toEqual({
      missing: 1,
      nextExpected: 1,
    });
  });

  it('poursuit la recherche au-delà de la limite de pagination', () => {
    const firstPage = findCollectionNumberGap([1, 2, 3]);
    const secondPage = findCollectionNumberGap([4, 6, 7], firstPage.nextExpected);
    expect(secondPage).toEqual({ missing: 5, nextExpected: 5 });
  });

  it('ignore les doublons et les numéros invalides en lecture', () => {
    expect(findCollectionNumberGap([0, 1, 1, 2, 4])).toEqual({
      missing: 3,
      nextExpected: 3,
    });
  });
});
