import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LossTabBadgeComponent } from './loss-tab-badge.component';

describe('LossTabBadgeComponent', () => {
  let fixture: ComponentFixture<LossTabBadgeComponent>;

  const badge = (): HTMLElement | null => fixture.nativeElement.querySelector('.badge');

  function render(count: number | undefined, invalid: boolean): void {
    fixture.componentRef.setInput('count', count);
    fixture.componentRef.setInput('invalid', invalid);
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [LossTabBadgeComponent] });
    fixture = TestBed.createComponent(LossTabBadgeComponent);
  });

  it('shows the entry count in green while valid', () => {
    render(3, false);

    expect(badge().textContent.trim()).toBe('3');
    expect(badge().classList).toContain('success');
    expect(badge().classList).not.toContain('missing-data');
  });

  it('shows the entry count in red while invalid', () => {
    render(2, true);

    expect(badge().textContent.trim()).toBe('2');
    expect(badge().classList).toContain('missing-data');
    expect(badge().classList).not.toContain('success');
  });

  it('shows an exclamation for an invalid step that holds no entries', () => {
    render(undefined, true);

    expect(badge().querySelector('.fa-exclamation')).not.toBeNull();
  });

  describe('needing a visit', () => {
    function renderNeedsVisit(count: number | undefined, invalid: boolean): void {
      fixture.componentRef.setInput('needsVisit', true);
      render(count, invalid);
    }

    it('shows an orange exclamation, even for a step with entries', () => {
      renderNeedsVisit(3, false);

      expect(badge().classList).toContain('input-error');
      expect(badge().classList).not.toContain('success');
      expect(badge().querySelector('.fa-exclamation')).not.toBeNull();
    });

    it('shows a step with no entries', () => {
      renderNeedsVisit(0, false);

      expect(badge()).not.toBeNull();
    });

    it('stays red while the step is invalid', () => {
      renderNeedsVisit(2, true);

      expect(badge().classList).toContain('missing-data');
      expect(badge().classList).not.toContain('input-error');
    });
  });

  it('shows nothing for a valid step with no entries', () => {
    render(0, false);

    expect(badge()).toBeNull();
  });
});
