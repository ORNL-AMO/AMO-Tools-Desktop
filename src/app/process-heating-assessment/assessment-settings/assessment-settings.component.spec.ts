import { DialogRef } from '@angular/cdk/dialog';
import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { SettingsService } from '../../settings/settings.service';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { Settings } from '../../shared/models/settings';
import { SnackbarService } from '../../shared/snackbar-notification/snackbar.service';
import { UnitsChangeAction, UnitsChangeDialogComponent } from '../../shared/units-change-dialog/units-change-dialog.component';
import { PHAST } from '../models/phast';
import { ProcessHeatingModification } from '../models/modification';
import { LossView } from '../models/views';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { AssessmentSettingsComponent } from './assessment-settings.component';
import { EnergySourceChangeDialogComponent } from './energy-source-change-dialog/energy-source-change-dialog.component';

function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    id: 1,
    assessmentId: 7,
    unitsOfMeasure: 'Imperial',
    energyResultUnit: 'MMBtu',
    energySourceType: 'Fuel',
    currency: '$',
    facilityInfo: { facilityName: 'Plant A', facilityContact: { contactName: 'Pat' } },
    ...overrides,
  } as Settings;
}

function makePhast(): PHAST {
  return { equipmentNotes: 'Notes', operatingHours: { operatingConditions: 'Full load' } };
}

describe('AssessmentSettingsComponent', () => {
  let fixture: ComponentFixture<AssessmentSettingsComponent>;
  let component: AssessmentSettingsComponent;
  let settingsSignal: WritableSignal<Settings>;
  let processHeatingSignal: WritableSignal<PHAST>;
  let assessmentService: jasmine.SpyObj<ProcessHeatingAssessmentService>;
  let modalDialogService: jasmine.SpyObj<ModalDialogService>;
  let snackbarService: jasmine.SpyObj<SnackbarService>;

  function chooseUnitsChangeAction(action: UnitsChangeAction | undefined): void {
    modalDialogService.openModal.and.returnValue({ closed: of(action) } as DialogRef<unknown, unknown>);
  }

  function chooseEnergySourceChange(confirmed: boolean | undefined): void {
    modalDialogService.openModal.and.returnValue({ closed: of(confirmed) } as DialogRef<unknown, unknown>);
  }

  function switchToElectricity(): void {
    component.settingsForm.patchValue({ energySourceType: 'Electricity', furnaceType: 'Electrical Infrared', energyResultUnit: 'kWh' });
  }

  beforeEach(() => {
    settingsSignal = signal(makeSettings());
    processHeatingSignal = signal(makePhast());
    assessmentService = jasmine.createSpyObj<ProcessHeatingAssessmentService>(
      'ProcessHeatingAssessmentService',
      ['saveSettings', 'setProcessHeating', 'getModifications'],
      { settingsSignal, processHeatingSignal, assessment$: of({ name: 'Furnace' }) as never },
    );
    assessmentService.saveSettings.and.resolveTo(false);
    assessmentService.getModifications.and.returnValue([]);
    modalDialogService = jasmine.createSpyObj<ModalDialogService>('ModalDialogService', ['openModal']);
    snackbarService = jasmine.createSpyObj<SnackbarService>('SnackbarService', ['setSnackbarMessage']);

    TestBed.configureTestingModule({
      declarations: [AssessmentSettingsComponent],
      imports: [ReactiveFormsModule],
      providers: [
        SettingsService,
        { provide: ProcessHeatingAssessmentService, useValue: assessmentService },
        { provide: ModalDialogService, useValue: modalDialogService },
        { provide: SnackbarService, useValue: snackbarService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(AssessmentSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('builds the settings form from the current settings', () => {
      expect(component.settingsForm.value.unitsOfMeasure).toBe('Imperial');
      expect(component.settingsForm.value.energyResultUnit).toBe('MMBtu');
    });

    it('builds the meta form from settings and assessment data', () => {
      expect(component.metaForm.getRawValue()).toEqual({
        facilityName: 'Plant A',
        contactName: 'Pat',
        equipmentNotes: 'Notes',
        operatingConditions: 'Full load',
      });
    });
  });

  describe('saveSettings', () => {
    it('saves and converts without asking when the unit system is unchanged', async () => {
      component.settingsForm.patchValue({ energyResultUnit: 'GJ' });

      await component.saveSettings();

      expect(modalDialogService.openModal).not.toHaveBeenCalled();
      const [saved, convertData] = assessmentService.saveSettings.calls.mostRecent().args;
      expect(saved.energyResultUnit).toBe('GJ');
      expect(saved.id).toBe(1);
      expect(saved.assessmentId).toBe(7);
      expect(convertData).toBeTrue();
    });

    it('asks for confirmation when the unit system changes', async () => {
      chooseUnitsChangeAction('convert');
      component.settingsForm.patchValue({ unitsOfMeasure: 'Metric' });

      await component.saveSettings();

      expect(modalDialogService.openModal).toHaveBeenCalledWith(
        UnitsChangeDialogComponent, { data: { fromUnits: 'Imperial', toUnits: 'Metric' } },
      );
    });

    it('converts the data when the user chooses convert', async () => {
      chooseUnitsChangeAction('convert');
      component.settingsForm.patchValue({ unitsOfMeasure: 'Metric' });

      await component.saveSettings();

      const [saved, convertData] = assessmentService.saveSettings.calls.mostRecent().args;
      expect(saved.unitsOfMeasure).toBe('Metric');
      expect(convertData).toBeTrue();
    });

    it('shows a success message after converting the data', async () => {
      assessmentService.saveSettings.and.resolveTo(true);
      chooseUnitsChangeAction('convert');
      component.settingsForm.patchValue({ unitsOfMeasure: 'Metric' });

      await component.saveSettings();

      expect(snackbarService.setSnackbarMessage).toHaveBeenCalledWith('Values converted from Imperial to Metric.', 'info', 'short');
    });

    it('shows a success message after an energy unit only change', async () => {
      assessmentService.saveSettings.and.resolveTo(true);
      component.settingsForm.patchValue({ energyResultUnit: 'GJ' });

      await component.saveSettings();

      expect(snackbarService.setSnackbarMessage).toHaveBeenCalledWith('Values converted from MMBtu to GJ.', 'info', 'short');
    });

    it('shows no message when the save converted no values', async () => {
      chooseUnitsChangeAction('convert');
      component.settingsForm.patchValue({ unitsOfMeasure: 'Metric' });

      await component.saveSettings();

      expect(snackbarService.setSnackbarMessage).not.toHaveBeenCalled();
    });

    it('keeps facility info saved while the units dialog was open', async () => {
      const updatedFacilityInfo = { facilityName: 'Plant B', facilityContact: { contactName: 'Pat' } };
      modalDialogService.openModal.and.callFake(() => {
        settingsSignal.set({ ...makeSettings(), facilityInfo: updatedFacilityInfo });
        return { closed: of<UnitsChangeAction>('convert') } as DialogRef<never, never>;
      });
      component.settingsForm.patchValue({ unitsOfMeasure: 'Metric' });

      await component.saveSettings();

      const [saved] = assessmentService.saveSettings.calls.mostRecent().args;
      expect(saved.facilityInfo).toEqual(updatedFacilityInfo);
    });

    it('shows no message when relabeling, cancelling, or changing no units', async () => {
      chooseUnitsChangeAction('relabel');
      component.settingsForm.patchValue({ unitsOfMeasure: 'Metric' });
      await component.saveSettings();

      chooseUnitsChangeAction(undefined);
      component.settingsForm.patchValue({ unitsOfMeasure: 'Metric' });
      await component.saveSettings();

      await component.saveSettings();

      expect(snackbarService.setSnackbarMessage).not.toHaveBeenCalled();
    });

    it('relabels the data without converting when the user chooses relabel', async () => {
      chooseUnitsChangeAction('relabel');
      component.settingsForm.patchValue({ unitsOfMeasure: 'Metric' });

      await component.saveSettings();

      const [saved, convertData] = assessmentService.saveSettings.calls.mostRecent().args;
      expect(saved.unitsOfMeasure).toBe('Metric');
      expect(convertData).toBeFalse();
    });

    it('restores the form and skips saving when the user cancels', async () => {
      chooseUnitsChangeAction(undefined);
      component.settingsForm.patchValue({ unitsOfMeasure: 'Metric', energyResultUnit: 'GJ' });

      await component.saveSettings();

      expect(assessmentService.saveSettings).not.toHaveBeenCalled();
      expect(component.settingsForm.value.unitsOfMeasure).toBe('Imperial');
      expect(component.settingsForm.value.energyResultUnit).toBe('MMBtu');
    });
  });

  describe('energy source change', () => {
    beforeEach(() => {
      processHeatingSignal.set({ ...makePhast(), losses: { flueGasLosses: [{}] } });
    });

    it('lists the hidden and added tabs when the energy source changes', async () => {
      chooseEnergySourceChange(true);
      switchToElectricity();

      await component.saveSettings();

      expect(modalDialogService.openModal).toHaveBeenCalledWith(EnergySourceChangeDialogComponent, {
        data: {
          scenarioName: 'Baseline',
          fromEnergySource: 'Fuel-fired',
          toEnergySource: 'Electrotechnology (Electrical Infrared)',
          hiddenTabs: [{ view: LossView.FLUE_GAS, label: 'Flue Gas' }, { view: LossView.GAS_LEAKAGE, label: 'Gas Leakage' }],
          addedTabs: [{ view: LossView.ENERGY_INPUT_EXHAUST_GAS, label: 'Energy Input Exhaust Gas' }],
          hasInheritingModifications: false,
        },
      });
    });

    it('saves the new energy source when confirmed', async () => {
      chooseEnergySourceChange(true);
      switchToElectricity();

      await component.saveSettings();

      const [saved] = assessmentService.saveSettings.calls.mostRecent().args;
      expect(saved.energySourceType).toBe('Electricity');
      expect(saved.furnaceType).toBe('Electrical Infrared');
    });

    it('restores the form and skips saving when cancelled', async () => {
      chooseEnergySourceChange(undefined);
      switchToElectricity();

      await component.saveSettings();

      expect(assessmentService.saveSettings).not.toHaveBeenCalled();
      expect(component.settingsForm.value.energySourceType).toBe('Fuel');
      expect(component.settingsForm.value.energyResultUnit).toBe('MMBtu');
    });

    it('asks when only a modification exists and notes that it inherits the change', async () => {
      processHeatingSignal.set(makePhast());
      assessmentService.getModifications.and.returnValue([{ id: 'mod-1' } as ProcessHeatingModification]);
      chooseEnergySourceChange(true);
      switchToElectricity();

      await component.saveSettings();

      const [, config] = modalDialogService.openModal.calls.mostRecent().args;
      expect(config.data).toEqual(jasmine.objectContaining({ hasInheritingModifications: true }));
    });

    it('omits the inheriting note when every modification has its own energy source', async () => {
      assessmentService.getModifications.and.returnValue([
        { id: 'mod-1', energySource: { energySourceType: 'Steam', furnaceType: null } } as ProcessHeatingModification,
      ]);
      chooseEnergySourceChange(true);
      switchToElectricity();

      await component.saveSettings();

      const [, config] = modalDialogService.openModal.calls.mostRecent().args;
      expect(config.data).toEqual(jasmine.objectContaining({ hasInheritingModifications: false }));
    });

    it('saves without asking when there is no loss data and no modification', async () => {
      processHeatingSignal.set(makePhast());
      switchToElectricity();

      await component.saveSettings();

      expect(modalDialogService.openModal).not.toHaveBeenCalled();
      expect(assessmentService.saveSettings).toHaveBeenCalled();
    });

    it('saves without asking when the furnace changes within the same configuration', async () => {
      settingsSignal.set(makeSettings({ energySourceType: 'Electricity', furnaceType: 'Electrical Infrared', energyResultUnit: 'kWh' }));
      fixture.detectChanges();
      component.settingsForm.patchValue({ furnaceType: 'Induction Heating and Melting' });

      await component.saveSettings();

      expect(modalDialogService.openModal).not.toHaveBeenCalled();
      expect(assessmentService.saveSettings).toHaveBeenCalled();
    });
  });

  describe('settings effect', () => {
    it('rebuilds the settings form when settings change elsewhere', () => {
      settingsSignal.set({ ...makeSettings(), unitsOfMeasure: 'Metric' });
      fixture.detectChanges();

      expect(component.settingsForm.value.unitsOfMeasure).toBe('Metric');
    });

    it('keeps the same settings form after its own save', async () => {
      assessmentService.saveSettings.and.callFake(async (newSettings: Settings) => {
        settingsSignal.set(newSettings);
        return false;
      });
      const form = component.settingsForm;

      await component.saveSettings();
      fixture.detectChanges();

      expect(component.settingsForm).toBe(form);
    });
  });

  describe('meta form', () => {
    it('saves facility info and notes after the debounce', fakeAsync(() => {
      component.metaForm.patchValue({ facilityName: 'Plant B', equipmentNotes: 'Updated' });
      tick(300);

      const [saved] = assessmentService.saveSettings.calls.mostRecent().args;
      expect(saved.facilityInfo.facilityName).toBe('Plant B');
      expect(saved.facilityInfo.facilityContact.contactName).toBe('Pat');
      expect(assessmentService.setProcessHeating).toHaveBeenCalledWith(jasmine.objectContaining({ equipmentNotes: 'Updated' }));
    }));

    it('stops saving after the component is destroyed', fakeAsync(() => {
      assessmentService.saveSettings.calls.reset();
      fixture.destroy();

      component.metaForm.patchValue({ facilityName: 'Plant B' });
      tick(300);

      expect(assessmentService.saveSettings).not.toHaveBeenCalled();
    }));
  });
});
