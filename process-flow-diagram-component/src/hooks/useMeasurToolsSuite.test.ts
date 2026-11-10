import { afterEach, describe, expect, it, vi } from 'vitest';
import useMeasurToolsSuite from './useMeasurToolsSuite';
import createModule from 'measur-tools-suite';

const mocks = vi.hoisted(() => ({ setModule: vi.fn() }));
vi.mock('react', () => ({
  useState: () => [null, mocks.setModule],
  useEffect: (initialize: () => void) => initialize()
}));
vi.mock('measur-tools-suite', () => ({ default: vi.fn() }));

describe('process-flow Suite beta initialization', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

  it.each(['https://example.test/measur/', 'file:///opt/measur/dist/browser/index.html'])(
    'uses the package default factory and resolves WASM beside the document: %s', async baseURI => {
      vi.stubGlobal('document', { baseURI });
      const module = { WaterAssessment: class {} };
      vi.mocked(createModule).mockResolvedValue(module as never);
      useMeasurToolsSuite();
      await vi.waitFor(() => expect(mocks.setModule).toHaveBeenCalledWith(module));
      const options = vi.mocked(createModule).mock.calls[0][0];
      const locateFile = options.locateFile as (path: string) => string;
      expect(locateFile('client.wasm')).toBe(new URL('client.wasm', baseURI).href);
    }
  );
});
