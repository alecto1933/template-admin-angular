import { TestBed } from '@angular/core/testing';
import { AppUpdateService, AppVersionInfo } from '@/core/update/app-update.service';

function jsonResponse(info: Partial<AppVersionInfo>): Response {
  return {
    ok: true,
    json: async () => info,
  } as Response;
}

describe('AppUpdateService', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let service: AppUpdateService;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(jsonResponse({ buildId: 'build-1' }));
    vi.stubGlobal('fetch', fetchMock);
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppUpdateService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });

  it('establishes a baseline on the first check without reporting an update', async () => {
    const changed = await service.checkNow(true);

    expect(changed).toBe(false);
    expect(service.updateAvailable()).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/version\.json\?t=\d+$/),
      { cache: 'no-store' },
    );
  });

  it('reports an update when the server build id differs', async () => {
    await service.checkNow(true);
    fetchMock.mockResolvedValueOnce(jsonResponse({ buildId: 'build-2', version: '2.0.1' }));

    const changed = await service.checkNow(true);

    expect(changed).toBe(true);
    expect(service.updateAvailable()).toBe(true);
    expect(service.latestVersion()?.buildId).toBe('build-2');
  });

  it('ignores failed or malformed responses', async () => {
    await service.checkNow(true);

    fetchMock.mockRejectedValueOnce(new Error('offline'));
    expect(await service.checkNow(true)).toBe(false);

    fetchMock.mockResolvedValueOnce({ ok: false } as Response);
    expect(await service.checkNow(true)).toBe(false);

    fetchMock.mockResolvedValueOnce(jsonResponse({}));
    expect(await service.checkNow(true)).toBe(false);

    expect(service.updateAvailable()).toBe(false);
  });

  it('dismisses a version and only shows a newer build afterwards', async () => {
    await service.checkNow(true);
    fetchMock.mockResolvedValueOnce(jsonResponse({ buildId: 'build-2' }));
    await service.checkNow(true);
    expect(service.updateAvailable()).toBe(true);

    service.dismiss();
    expect(service.updateAvailable()).toBe(false);

    fetchMock.mockResolvedValueOnce(jsonResponse({ buildId: 'build-2' }));
    expect(await service.checkNow(true)).toBe(false);

    fetchMock.mockResolvedValueOnce(jsonResponse({ buildId: 'build-3' }));
    expect(await service.checkNow(true)).toBe(true);
  });

  it('builds a reload URL that keeps the hash route and adds the build id', () => {
    window.location.hash = '#/home';

    const url = service.buildReloadUrl('build-9');

    expect(url).toContain('v=build-9');
    expect(url).toContain('#/home');
  });
});
