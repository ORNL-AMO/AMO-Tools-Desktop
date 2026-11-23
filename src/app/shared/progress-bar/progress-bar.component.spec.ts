import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBarComponent, ProgressBarStatus } from './progress-bar.component';

describe('ProgressBarComponent', () => {
  let fixture: ComponentFixture<ProgressBarComponent>;

  const bar = (): HTMLElement => fixture.nativeElement.querySelector('[role="progressbar"]');
  const render = (inputs: { percent?: number, label?: string, status?: ProgressBarStatus }) => {
    Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProgressBarComponent] });
    fixture = TestBed.createComponent(ProgressBarComponent);
  });

  it('fills to the percent and shows it rounded, with matching aria values', () => {
    render({ percent: 42.6 });

    expect(bar().style.width).toBe('42.6%');
    expect(bar().textContent.trim()).toBe('43%');
    expect(bar().getAttribute('aria-valuenow')).toBe('42.6');
    expect(bar().getAttribute('aria-valuemin')).toBe('0');
    expect(bar().getAttribute('aria-valuemax')).toBe('100');
  });

  it('has an accessible name, defaulting to Progress', () => {
    render({});
    expect(bar().getAttribute('aria-label')).toBe('Progress');

    fixture.componentRef.setInput('ariaLabel', 'Reset progress');
    fixture.detectChanges();
    expect(bar().getAttribute('aria-label')).toBe('Reset progress');
  });

  it('shows a label in place of the percent', () => {
    render({ percent: 100, label: 'Reset complete' });

    expect(bar().textContent.trim()).toBe('Reset complete');
    expect(bar().getAttribute('aria-valuetext')).toBe('Reset complete');
  });

  it('clamps values outside 0 to 100', () => {
    render({ percent: 140 });
    expect(bar().style.width).toBe('100%');

    render({ percent: -5 });
    expect(bar().style.width).toBe('0%');
  });

  it('marks complete and error states for styling', () => {
    render({ status: 'complete' });
    expect(bar().classList).toContain('complete');
    expect(bar().classList).not.toContain('error');

    render({ status: 'error' });
    expect(bar().classList).toContain('error');
    expect(bar().classList).not.toContain('complete');
  });
});
