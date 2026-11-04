import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutWorkspaceComponent, WorkspaceVariant } from './layout-workspace.component';

@Component({
  standalone: true,
  imports: [LayoutWorkspaceComponent],
  template: `
    <app-layout-workspace [variant]="variant()" mainLabel="Inputs" asideLabel="Results">
      <div lyMain class="test-main">Main content</div>
      <div lyAside class="test-aside">Aside content</div>
    </app-layout-workspace>
  `,
})
class TestHostComponent {
  variant = signal<WorkspaceVariant>('even');
}

describe('LayoutWorkspaceComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: HTMLElement;

  function workspace(): HTMLElement {
    return host.querySelector('app-layout-workspace');
  }

  function switches(): HTMLButtonElement[] {
    return Array.from(host.querySelectorAll('.ly-workspace__switch'));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('projects main and aside content into their panels', () => {
    expect(host.querySelector('.ly-workspace__main .test-main')).toBeTruthy();
    expect(host.querySelector('.ly-workspace__aside .test-aside')).toBeTruthy();
  });

  it('applies the workspace and variant classes to the host', () => {
    expect(workspace().classList).toContain('ly-workspace');
    expect(workspace().classList).toContain('ly-workspace--even');

    fixture.componentInstance.variant.set('weighted');
    fixture.detectChanges();
    expect(workspace().classList).toContain('ly-workspace--weighted');
    expect(workspace().classList).not.toContain('ly-workspace--even');
  });

  it('starts on the main panel and switches to the aside', () => {
    expect(workspace().getAttribute('data-active-panel')).toBe('main');
    expect(switches().map(button => button.textContent.trim())).toEqual(['Inputs', 'Results']);

    switches()[1].click();
    fixture.detectChanges();

    expect(workspace().getAttribute('data-active-panel')).toBe('aside');
    expect(switches()[1].getAttribute('aria-selected')).toBe('true');
    expect(switches()[0].getAttribute('aria-selected')).toBe('false');
  });

  it('signals a window resize after switching so charts in the shown panel redraw', async () => {
    const resized = jasmine.createSpy('resize');
    window.addEventListener('resize', resized);

    switches()[1].click();
    fixture.detectChanges();
    await new Promise(resolve => requestAnimationFrame(resolve));

    window.removeEventListener('resize', resized);
    // * at least once: a switch made by another test can also land in this window
    expect(resized).toHaveBeenCalled();
  });

  it('renders no switcher or aside for the solo variant and always shows main', () => {
    switches()[1].click();
    fixture.componentInstance.variant.set('solo');
    fixture.detectChanges();

    expect(switches().length).toBe(0);
    expect(host.querySelector('.ly-workspace__aside')).toBeNull();
    expect(workspace().getAttribute('data-active-panel')).toBe('main');
  });
});
