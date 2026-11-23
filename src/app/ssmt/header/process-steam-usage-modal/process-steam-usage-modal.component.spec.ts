import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessSteamUsageModalComponent } from './process-steam-usage-modal.component';
import { OTHER_STEAM_USE_NAME, ProcessSteamUsageService } from './process-steam-usage.service';

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
    fixture.componentRef.setInput('idPrefix', 'test');
    fixture.detectChanges();
  });

  it('has no quantity fields', () => {
    expect(Object.keys(component.rows.at(0).controls)).not.toContain('quantity');
    expect(component.getData().rows.every(row => !('quantity' in row))).toBeTrue();
  });

  it('validates names, flows and inclusive recovery bounds', () => {
    const row = component.rows.at(0).controls;
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

  it('validates the Other (Miscellaneous) steam usage like a process row', () => {
    const other = component.rows.at(1).controls;
    for (const value of [null, -1]) {
      other.steamUsage.setValue(value);
      expect(component.form.invalid).toBeTrue();
      expect(component.canApply).toBeFalse();
    }
    other.steamUsage.setValue(2.5);
    component.calculate();
    expect(component.form.valid).toBeTrue();
    expect(component.totals.processSteamUsage).toBe(77.5);
  });

  it('keeps Other (Miscellaneous) last and gives added processes distinct default names after deletion', () => {
    component.removeRow(1);
    expect(component.rows.length).toBe(2);
    component.addRow();
    component.removeRow(0);
    component.addRow();
    expect(component.getData().rows.map(row => row.name)).toEqual(['Process 2', 'Process 1', OTHER_STEAM_USE_NAME]);
    expect(component.getData().rows.map(row => row.type)).toEqual(['process', 'process', 'other']);
  });

  it('lets Other (Miscellaneous) be marked recoverable, unchecked by default', () => {
    const other = component.rows.at(1).controls;
    other.steamUsage.setValue(25);
    component.calculate();
    expect(other.condensateRecoverable.value).toBeFalse();
    expect(component.totals.recoveredCondensate).toBe(24.75);

    other.condensateRecoverable.setValue(true);
    other.condensateRecoveryRate.setValue(50);
    component.calculate();
    expect(component.totals.recoveredCondensate).toBe(37.25);
  });

  it('only allows applying a valid calculation with a total above 0', () => {
    expect(component.canApply).toBeTrue();

    component.rows.at(0).controls.steamUsage.setValue(0);
    component.calculate();
    expect(component.form.valid).toBeTrue();
    expect(component.canApply).toBeFalse();

    component.removeRow(0);
    expect(component.totals.processSteamUsage).toBe(0);
    expect(component.canApply).toBeFalse();

    component.rows.at(0).controls.steamUsage.setValue(0.5);
    component.calculate();
    expect(component.canApply).toBeTrue();

    component.rows.at(0).controls.steamUsage.setValue(-0.5);
    component.calculate();
    expect(component.canApply).toBeFalse();
  });

  it('excludes unchecked rows and reloads fresh data rather than retaining canceled input', () => {
    component.rows.at(0).controls.condensateRecoverable.setValue(false);
    component.toggleRecoverable(0);
    expect(component.totals.recoveredCondensate).toBe(0);
    fixture.componentRef.setInput('data', new ProcessSteamUsageService().getDefaultData(100, 25));
    fixture.detectChanges();
    expect(component.rows.length).toBe(2);
    expect(component.totals.recoveredCondensate).toBe(25);
  });
});
