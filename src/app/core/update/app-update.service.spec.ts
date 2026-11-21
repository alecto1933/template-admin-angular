import { TestBed } from '@angular/core/testing';
import { AppUpdateService } from '@/core/update/app-update.service';

const REMOTE_ENTRY = 'http://localhost:4201/remoteEntry.json';
const REMOTE_BUILD_ID = 'r1';
const HOST_BUILD_ID = 'h1';

interface FetchState {
  manifest: Record<string, string> | null;
  host: string | null;
  remote: string | null;
  throwRemote: boolean;
}

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    json: async () => body,
  } as Response;
}

function createFetchStub(initial: Partial<FetchState> = {}) {
  const state: FetchState = {
    manifest: { 'profile-management': REMOTE_ENTRY },
    host: HOST_BUILD_ID,
    remote: REMOTE_BUILD_ID,
    throwRemote: false,
    ...initial,
  };

  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('federation.manifest.json')) {
      return state.manifest ? jsonResponse(state.manifest) : ({ ok: false } as Response);
    }
    const remote = url.includes('4201');
    if (remote && state.throwRemote) {
      throw new Error('offline');
    }
    const buildId = remote ? state.remote : state.host;
    return buildId ? jsonResponse({ version: '2.0.0', buildId }) : ({ ok: false } as Response);
  });

  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, state };
}

function createService(): AppUpdateService {
  TestBed.configureTestingModule({});
  return TestBed.inject(AppUpdateService);
}

describe('AppUpdateService (multi source)', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('establishes baselines for the host and remote without reporting an update', async () => {
    const { fetchMock } = createFetchStub();
    const service = createService();

    await service.ready;

    expect(service.updateAvailable()).toBe(false);
    expect(service.pending()).toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/federation\.manifest\.json\?t=\d+$/),
      { cache: 'no-store' },
    );
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/version\.json\?t=\d+$/), {
      cache: 'no-store',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/localhost:4201\/version\.json\?t=\d+$/),
      { cache: 'no-store' },
    );
  });

  it('reports an update when only the remote build changes', async () => {
    const { state } = createFetchStub();
    const service = createService();
    await service.ready;

    state.remote = 'r2';

    expect(await service.checkNow(true)).toBe(true);
    expect(service.updateAvailable()).toBe(true);
    expect(service.pending()).toHaveLength(1);
    expect(service.pending()[0]).toMatchObject({ id: 'profile-management', buildId: 'r2' });
  });

  it('reports an update when only the host build changes', async () => {
    const { state } = createFetchStub();
    const service = createService();
    await service.ready;

    state.host = 'h2';

    expect(await service.checkNow(true)).toBe(true);
    expect(service.pending().map((entry) => entry.id)).toEqual(['host']);
    expect(service.pending()[0].buildId).toBe('h2');
  });

  it('ignores a failing source without blocking the other', async () => {
    const { state } = createFetchStub();
    const service = createService();
    await service.ready;

    state.throwRemote = true;
    state.host = 'h2';

    expect(await service.checkNow(true)).toBe(true);
    expect(service.pending().map((entry) => entry.id)).toEqual(['host']);

    state.throwRemote = false;
    state.remote = 'r2';

    expect(await service.checkNow(true)).toBe(true);
    expect(
      service
        .pending()
        .map((entry) => entry.id)
        .sort(),
    ).toEqual(['host', 'profile-management']);
  });

  it('treats a missing remote version.json as unknown instead of an error', async () => {
    const { state } = createFetchStub({ remote: null });
    const service = createService();
    await service.ready;

    expect(service.updateAvailable()).toBe(false);

    state.remote = REMOTE_BUILD_ID;
    expect(await service.checkNow(true)).toBe(false);

    state.remote = 'r2';
    expect(await service.checkNow(true)).toBe(true);
    expect(service.pending().map((entry) => entry.id)).toEqual(['profile-management']);
  });

  it('ignores malformed or failed responses and recovers later', async () => {
    const { state } = createFetchStub({ host: null, remote: null });
    const service = createService();
    await service.ready;

    expect(service.updateAvailable()).toBe(false);

    state.host = HOST_BUILD_ID;
    state.remote = REMOTE_BUILD_ID;
    expect(await service.checkNow(true)).toBe(false);
    expect(service.updateAvailable()).toBe(false);

    state.host = 'h2';
    expect(await service.checkNow(true)).toBe(true);
    expect(service.pending().map((entry) => entry.id)).toEqual(['host']);
  });

  it('treats a malformed host payload as unknown instead of an error', async () => {
    const { fetchMock } = createFetchStub({ manifest: null });
    let hostBody: unknown = {};
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      return jsonResponse(url.includes('federation.manifest.json') ? {} : hostBody);
    });

    const service = createService();
    await service.ready;

    for (const body of [{ buildId: '' }, { buildId: 123 }, {}]) {
      hostBody = body;
      expect(await service.checkNow(true)).toBe(false);
      expect(service.updateAvailable()).toBe(false);
      expect(service.pending()).toEqual([]);
    }
  });

  it('treats a malformed remote payload as unknown instead of an error', async () => {
    const { fetchMock } = createFetchStub();
    let remoteBody: unknown = { buildId: '' };
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('federation.manifest.json')) {
        return jsonResponse({ 'profile-management': REMOTE_ENTRY });
      }
      return jsonResponse(url.includes('4201') ? remoteBody : { buildId: HOST_BUILD_ID });
    });

    const service = createService();
    await service.ready;

    for (const body of [{ buildId: '' }, { buildId: 123 }, {}]) {
      remoteBody = body;
      expect(await service.checkNow(true)).toBe(false);
      expect(service.updateAvailable()).toBe(false);
    }

    remoteBody = { buildId: REMOTE_BUILD_ID };
    expect(await service.checkNow(true)).toBe(false);
    expect(service.updateAvailable()).toBe(false);
  });

  it('falls back to the host source when the manifest is unavailable', async () => {
    const { fetchMock, state } = createFetchStub({ manifest: null });
    const service = createService();
    await service.ready;

    const requestedRemote = fetchMock.mock.calls.some(([input]) => String(input).includes('4201'));
    expect(requestedRemote).toBe(false);

    state.host = 'h2';
    expect(await service.checkNow(true)).toBe(true);
    expect(service.pending().map((entry) => entry.id)).toEqual(['host']);
  });

  it('falls back to the host source when the manifest payload is malformed', async () => {
    const { fetchMock } = createFetchStub({
      manifest: [] as unknown as Record<string, string>,
    });
    const service = createService();
    await service.ready;

    const requestedRemote = fetchMock.mock.calls.some(([input]) => String(input).includes('4201'));
    expect(requestedRemote).toBe(false);
    expect(service.updateAvailable()).toBe(false);
  });

  it('skips unusable manifest entries but keeps the valid remotes', async () => {
    const { fetchMock, state } = createFetchStub({
      manifest: { 'profile-management': REMOTE_ENTRY, broken: 'http://[invalid' },
    });
    const service = createService();
    await service.ready;

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/localhost:4201\/version\.json\?t=\d+$/),
      { cache: 'no-store' },
    );
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes('invalid'))).toBe(false);

    state.remote = 'r2';
    expect(await service.checkNow(true)).toBe(true);
    expect(service.pending().map((entry) => entry.id)).toEqual(['profile-management']);
  });

  it('keeps the newest result when checks overlap', async () => {
    const { fetchMock } = createFetchStub();
    const service = createService();
    await service.ready;

    let resolveSlowHost: (response: Response) => void = () => undefined;
    const slowHost = new Promise<Response>((resolve) => {
      resolveSlowHost = resolve;
    });

    // Check A: host response hangs, remote resolves immediately.
    fetchMock.mockImplementationOnce(() => slowHost);
    const checkA = service.checkNow(true);

    // Check B: starts while A is still in flight and reports the host change.
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      return jsonResponse({ buildId: url.includes('4201') ? REMOTE_BUILD_ID : 'h2' });
    });
    const checkB = service.checkNow(true);
    expect(await checkB).toBe(true);

    // Check A resolves last without a change; it must not clear B's banner.
    resolveSlowHost(jsonResponse({ buildId: HOST_BUILD_ID }));
    expect(await checkA).toBe(false);
    expect(service.updateAvailable()).toBe(true);
    expect(service.pending().map((entry) => entry.buildId)).toEqual(['h2']);
  });

  it('dismisses exact version pairs and re-shows a newer build', async () => {
    const { state } = createFetchStub();
    const service = createService();
    await service.ready;

    state.host = 'h2';
    state.remote = 'r2';
    expect(await service.checkNow(true)).toBe(true);
    expect(service.pending()).toHaveLength(2);

    service.dismiss();
    expect(service.updateAvailable()).toBe(false);

    expect(await service.checkNow(true)).toBe(false);

    state.remote = 'r3';
    expect(await service.checkNow(true)).toBe(true);
    expect(service.pending().map((entry) => entry.id)).toEqual(['profile-management']);
  });

  it('skips overlapping automatic checks until the minimum gap has elapsed', async () => {
    const { fetchMock, state } = createFetchStub();
    const service = createService();
    await service.ready;

    const callsAfterReady = fetchMock.mock.calls.length;
    state.host = 'h2';

    expect(await service.checkNow()).toBe(false);
    expect(fetchMock.mock.calls.length).toBe(callsAfterReady);
  });

  it('checks again when the window regains focus', async () => {
    const { fetchMock, state } = createFetchStub();
    const service = createService();
    await service.ready;

    state.host = 'h2';
    const callsBeforeFocus = fetchMock.mock.calls.length;
    window.dispatchEvent(new Event('focus'));

    await vi.waitFor(() => expect(service.updateAvailable()).toBe(true));
    expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBeforeFocus);
  });

  it('builds a reload URL that keeps the hash route and adds the build id', () => {
    window.location.hash = '#/profile-management/bank';
    createFetchStub();
    const service = createService();

    const url = service.buildReloadUrl('h2');

    expect(url).toContain('v=h2');
    expect(url).toContain('#/profile-management/bank');
  });

  it('reloads with the comma-joined build ids of every pending source', async () => {
    const { state } = createFetchStub();
    const service = createService();
    await service.ready;

    state.host = 'h2';
    state.remote = 'r2';
    await service.checkNow(true);

    const replace = vi.fn();
    vi.stubGlobal('location', {
      href: 'http://localhost/ivendor/#/home',
      replace,
      reload: vi.fn(),
    });
    service.reload();

    expect(replace).toHaveBeenCalledTimes(1);
    expect(String(replace.mock.calls[0][0])).toContain('v=h2%2Cr2');
  });

  it('reloads the page in place when nothing is pending', () => {
    createFetchStub();
    const service = createService();

    const reload = vi.fn();
    vi.stubGlobal('location', {
      href: 'http://localhost/ivendor/#/home',
      replace: vi.fn(),
      reload,
    });
    service.reload();

    expect(reload).toHaveBeenCalledTimes(1);
  });
});
