import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvalidModificationAlertComponent } from './invalid-modification-alert.component';

describe('InvalidModificationAlertComponent', () => {
  let fixture: ComponentFixture<InvalidModificationAlertComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [InvalidModificationAlertComponent] });
    fixture = TestBed.createComponent(InvalidModificationAlertComponent);
  });

  it('renders one alert per modification naming its failing steps', () => {
    fixture.componentRef.setInput('modifications', [
      { id: 'mod1', name: 'Scenario 1', errors: ['Errors found in Wall', 'Errors found in Cooling'] },
      { id: 'mod2', name: 'Scenario 2', errors: ['Errors found in Operations'] },
    ]);
    fixture.detectChanges();

    const alerts = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.alert-danger'));
    const lines = (alert: HTMLElement): string[] => Array.from<HTMLElement>(alert.querySelectorAll('div')).map(line => line.textContent.trim());
    expect(alerts.map(lines)).toEqual([
      ['Invalid Modification: Scenario 1', 'Errors found in Wall', 'Errors found in Cooling'],
      ['Invalid Modification: Scenario 2', 'Errors found in Operations'],
    ]);
  });
});
