import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { FederatedHostShell } from '@/core/federation/federated-host-shell';

describe('FederatedHostShell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FederatedHostShell],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows the spinner until the first NavigationEnd after mount', () => {
    const router = TestBed.inject(Router);
    const events = router.events as unknown as Subject<NavigationEnd>;
    const fixture = TestBed.createComponent(FederatedHostShell);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('[data-testid="federated-shell-loading"]')).not.toBeNull();
    expect(host.querySelector('ui-spinner')).not.toBeNull();

    events.next(new NavigationEnd(1, '/profile-management', '/profile-management'));
    fixture.detectChanges();

    expect(host.querySelector('[data-testid="federated-shell-loading"]')).toBeNull();
    expect(host.querySelector('router-outlet')).not.toBeNull();
  });
});
