import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessSteamUsageModalComponent } from './process-steam-usage-modal.component';
import { ProcessSteamUsageService } from './process-steam-usage.service';

describe('ProcessSteamUsageModalComponent form', () => {
  let fixture: ComponentFixture<ProcessSteamUsageModalComponent>;
  let component: ProcessSteamUsageModalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessSteamUsageModalComponent],
      providers: [ProcessSteamUsageService]
    }).overrideComponent(ProcessSteamUsageModalComponent, { set: { template: '' } });
    fixture = TestBed.createComponent(ProcessSteamUsageModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', new ProcessSteamUsageService().getDefaultData(75, 33));
    fixture.componentRef.setInput('settings', { steamMassFlowMeasurement: 'klb' });
    fixture.componentRef.setInput('pressureLevel', 'lowPressure');
    fixture.componentRef.setInput('idPrefix', 'test');
    fixture.detectChanges();
  });

  it('rejects blank, negative and fractional loss counts', () => {
    const quantity = component.rows.at(0).controls.quantity;
    for (const value of [null, -1, 1.5]) {
      quantity.setValue(value);
      expect(component.form.invalid).toBeTrue();
    }
    quantity.setValue(0);
    expect(component.form.valid).toBeTrue();
  });

  it('validates names, flows and inclusive recovery bounds', () => {
    const row = component.rows.at(2).controls;
    row.name.setValue('   ');
    expect(component.form.invalid).toBeTrue();
    row.name.setValue('Dryer');
    for (const value of [null, -1]) {
      row.steamUsage.setValue(value);
      expect(component.form.invalid).toBeTrue();
    }
    row.steamUsage.setValue(0);
    for (const value of [null, -1, 101]) {
      row.condensateRecoveryRate.setValue(value);
      expect(component.form.invalid).toBeTrue();
    }
    for (const value of [0, 100]) {
      row.condensateRecoveryRate.setValue(value);
      expect(component.form.valid).toBeTrue();
    }
  });

  it('keeps fixed loss rows and gives added processes distinct default names after deletion', () => {
    component.removeRow(0);
    expect(component.rows.length).toBe(3);
    component.addRow();
    component.removeRow(2);
    component.addRow();
    expect(component.getData().rows.map(row => row.name)).toEqual(['Steam Leaks', 'Steam Trap Leaks', 'Process 2', 'Process 1']);
  });

  it('excludes unchecked rows and reloads fresh data rather than retaining canceled input', () => {
    component.rows.at(2).controls.condensateRecoverable.setValue(false);
    component.toggleRecoverable(2);
    expect(component.totals.recoveredCondensate).toBe(0);
    fixture.componentRef.setInput('data', new ProcessSteamUsageService().getDefaultData(100, 25));
    fixture.detectChanges();
    expect(component.rows.length).toBe(3);
    expect(component.totals.recoveredCondensate).toBe(25);
  });
});
