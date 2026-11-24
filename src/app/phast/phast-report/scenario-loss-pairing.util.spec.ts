import { WallLoss } from '../../shared/models/phast/losses/wallLoss';
import { findModificationLoss } from './scenario-loss-pairing.util';

const wall = (id: string | undefined, name: string): WallLoss => ({ id, name } as WallLoss);

describe('findModificationLoss', () => {
  it('matches by id, whatever the modification\'s order', () => {
    const modificationItems = [wall('b', 'B'), wall('a', 'A')];

    expect(findModificationLoss(wall('a', 'A'), 0, modificationItems)).toBe(modificationItems[1]);
  });

  it('finds nothing for a baseline item the modification removed', () => {
    expect(findModificationLoss(wall('a', 'A'), 0, [wall('b', 'B')])).toBeUndefined();
    expect(findModificationLoss(wall('a', 'A'), 0, undefined)).toBeUndefined();
  });

  it('matches by position when items have no ids, as legacy saved them', () => {
    const modificationItems = [wall(undefined, 'First'), wall(undefined, 'Second')];

    expect(findModificationLoss(wall(undefined, 'Second'), 1, modificationItems)).toBe(modificationItems[1]);
    expect(findModificationLoss(wall('a', 'A'), 0, modificationItems)).toBe(modificationItems[0]);
  });
});
