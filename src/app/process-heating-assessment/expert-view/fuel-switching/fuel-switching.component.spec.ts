import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { ModalDialogService } from '../../../shared/modal-dialog.service';
import { EnergySourceChangeDialogComponent, EnergySourceChangeDialogData } from '../../assessment-settings/energy-source-change-dialog/energy-source-change-dialog.component';
import { LossView } from '../../models/views';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { FuelSwitchingComponent } from './fuel-switching.component';

const FUEL = { energyResultUnit: 'MMBtu', energySourceType: 'Fuel', furnaceType: null, customFurnaceName: null } as Settings;
const INFRARED = { ...FUEL, energySourceType: 'Electricity', furnaceType: 'Electrical Infrared' } as Settings;
const CUSTOM = { ...FUEL, energySourceType: 'Electricity', furnaceType: 'Custom Electrotechnology', customFurnaceName: 'Kiln' } as Settings;

class FakeProcessHeatingAssessmentService {
  readonly settings = signal<Record<string, Settings>>({ baseline: FUEL, 'mod-1': FUEL });

  scenarioSettings(scenario: string): Settings {
    return this.settings()[scenario];
  }
}

describe('FuelSwitchingComponent', () => {
  let fixture: ComponentFixture<FuelSwitchingComponent>;
  let component: FuelSwitchingComponent;
  let assessmentService: FakeProcessHeatingAssessmentService;
  let modificationService: jasmine.SpyObj<ModificationService>;
  let modalDialogService: jasmine.SpyObj<ModalDialogService>;
  let uiService: jasmine.SpyObj<ProcessHeatingUiService>;

  function create(scenario: string, settings: Record<string, Settings> = { baseline: FUEL, 'mod-1': FUEL }): void {
    assessmentService.settings.set(settings);
    fixture = TestBed.createComponent(FuelSwitchingComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('scenario', scenario);
    fixture.detectChanges();
  }

  function dialogResult(confirmed: boolean | undefined): void {
    modalDialogService.openModal.and.returnValue({ closed: of(confirmed) } as never);
  }

  const query = (selector: string): HTMLElement | null => fixture.nativeElement.querySelector(selector);

  beforeEach(() => {
    modificationService = jasmine.createSpyObj('ModificationService', ['setEnergySource'], {
      modifications: signal([{ id: 'mod-1', scenarioOverrides: { name: 'Scenario 1' } }]),
    });
    modalDialogService = jasmine.createSpyObj('ModalDialogService', ['openModal']);
    uiService = jasmine.createSpyObj('ProcessHeatingUiService', ['markTabsToVisit']);
    dialogResult(true);

    TestBed.configureTestingModule({
      declarations: [FuelSwitchingComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ProcessHeatingAssessmentService, useClass: FakeProcessHeatingAssessmentService },
        { provide: ModificationService, useValue: modificationService },
        { provide: ModalDialogService, useValue: modalDialogService },
        { provide: ProcessHeatingUiService, useValue: uiService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    assessmentService = TestBed.inject(ProcessHeatingAssessmentService) as unknown as FakeProcessHeatingAssessmentService;
  });

  describe('initialization', () => {
    it("loads the scenario's own energy source into the form", () => {
      create('mod-1', { baseline: FUEL, 'mod-1': CUSTOM });

      expect(component.form.getRawValue()).toEqual({
        energySourceType: 'Electricity', furnaceType: 'Custom Electrotechnology', customFurnaceName: 'Kiln',
      });
    });

    it('is read-only for the baseline', () => {
      create('baseline');

      expect(component.form.disabled).toBeTrue();
    });

    it('is editable for a modification', () => {
      create('mod-1');

      expect(component.form.enabled).toBeTrue();
    });
  });

  describe('scenario settings changes', () => {
    it("reloads the form when the scenario's energy source changes, such as a baseline change it follows", () => {
      create('mod-1');

      assessmentService.settings.set({ baseline: INFRARED, 'mod-1': INFRARED });
      fixture.detectChanges();

      expect(component.form.getRawValue().furnaceType).toBe('Electrical Infrared');
    });

    it('stops reloading after destroy', () => {
      create('mod-1');
      fixture.destroy();

      assessmentService.settings.set({ baseline: INFRARED, 'mod-1': INFRARED });
      TestBed.tick();

      expect(component.form.getRawValue().energySourceType).toBe('Fuel');
    });
  });

  describe('energy source changes', () => {
    it('starts Electrotechnology on the first furnace type and saves after confirmation', async () => {
      create('mod-1');
      component.form.controls.energySourceType.setValue('Electricity');

      await component.changeEnergySourceType();

      expect(modificationService.setEnergySource).toHaveBeenCalledWith('mod-1', {
        energySourceType: 'Electricity', furnaceType: 'Electrical Infrared', customFurnaceName: null,
      });
    });

    it('clears the furnace type when switching away from Electrotechnology', async () => {
      create('mod-1', { baseline: FUEL, 'mod-1': INFRARED });
      component.form.controls.energySourceType.setValue('Steam');

      await component.changeEnergySourceType();

      expect(modificationService.setEnergySource).toHaveBeenCalledWith('mod-1', jasmine.objectContaining({ energySourceType: 'Steam', furnaceType: null }));
    });

    it('opens the confirm dialog with the modification name and both energy sources, without the inheriting-modifications note', async () => {
      create('mod-1');
      component.form.controls.energySourceType.setValue('Electricity');

      await component.changeEnergySourceType();

      const [dialogComponent, config] = modalDialogService.openModal.calls.mostRecent().args;
      const data = config.data as EnergySourceChangeDialogData;
      expect(dialogComponent).toBe(EnergySourceChangeDialogComponent);
      expect(data).toEqual(jasmine.objectContaining({
        scenarioName: 'Scenario 1',
        fromEnergySource: 'Fuel-fired',
        toEnergySource: 'Electrotechnology (Electrical Infrared)',
        hasInheritingModifications: false,
      }));
      expect(data.addedTabs.map(tab => tab.view)).toContain(LossView.ENERGY_INPUT_EXHAUST_GAS);
    });

    it('restores the form and saves nothing when the change is cancelled', async () => {
      dialogResult(undefined);
      create('mod-1');
      component.form.controls.energySourceType.setValue('Steam');

      await component.changeEnergySourceType();

      expect(modificationService.setEnergySource).not.toHaveBeenCalled();
      expect(component.form.getRawValue()).toEqual({ energySourceType: 'Fuel', furnaceType: null, customFurnaceName: null });
    });

    it('saves a furnace type that keeps the same heating equipment configuration without asking', async () => {
      create('mod-1', { baseline: FUEL, 'mod-1': INFRARED });
      component.form.controls.furnaceType.setValue('Vacuum Furnace');

      await component.save();

      expect(modalDialogService.openModal).not.toHaveBeenCalled();
      expect(modificationService.setEnergySource).toHaveBeenCalledWith('mod-1', jasmine.objectContaining({ furnaceType: 'Vacuum Furnace' }));
    });

    it('saves a custom furnace name without asking', async () => {
      create('mod-1', { baseline: FUEL, 'mod-1': CUSTOM });
      component.form.controls.customFurnaceName.setValue('Oven');

      await component.save();

      expect(modalDialogService.openModal).not.toHaveBeenCalled();
      expect(modificationService.setEnergySource).toHaveBeenCalledWith('mod-1', jasmine.objectContaining({ customFurnaceName: 'Oven' }));
    });
  });

  describe('tabs to visit', () => {
    it('marks Operations and the tabs the new energy source adds once the change is confirmed', async () => {
      create('mod-1');
      component.form.controls.energySourceType.setValue('Electricity');
      component.form.controls.furnaceType.setValue('Electric Arc Furnace (EAF)');

      await component.save();

      expect(uiService.markTabsToVisit).toHaveBeenCalledWith('mod-1', [LossView.OPERATIONS, LossView.ENERGY_INPUT, LossView.EXHAUST_GAS, LossView.SLAG]);
    });

    it('marks nothing when the change is cancelled', async () => {
      dialogResult(undefined);
      create('mod-1');
      component.form.controls.energySourceType.setValue('Steam');

      await component.changeEnergySourceType();

      expect(uiService.markTabsToVisit).not.toHaveBeenCalled();
    });

    it('marks nothing when the heating equipment configuration stays the same', async () => {
      create('mod-1', { baseline: FUEL, 'mod-1': INFRARED });
      component.form.controls.furnaceType.setValue('Vacuum Furnace');

      await component.save();

      expect(uiService.markTabsToVisit).not.toHaveBeenCalled();
    });
  });

  describe('differsFromBaseline', () => {
    it("is true when the modification's energy source differs from the baseline's", () => {
      create('mod-1', { baseline: FUEL, 'mod-1': INFRARED });

      expect(component.differsFromBaseline()).toBeTrue();
      expect(query('.energy-source.indicate-different')).not.toBeNull();
    });

    it("is false when the modification's energy source matches the baseline's", () => {
      create('mod-1');

      expect(component.differsFromBaseline()).toBeFalse();
    });

    it('is false for the baseline', () => {
      create('baseline', { baseline: INFRARED, 'mod-1': FUEL });

      expect(component.differsFromBaseline()).toBeFalse();
    });
  });

  describe('template visibility', () => {
    it('hides the furnace type and custom name for a fuel-fired source', () => {
      create('mod-1');

      expect(query('[formControlName="furnaceType"]')).toBeNull();
      expect(query('[formControlName="customFurnaceName"]')).toBeNull();
    });

    it('shows the furnace type but not the custom name for a standard electric furnace', () => {
      create('mod-1', { baseline: FUEL, 'mod-1': INFRARED });

      expect(query('[formControlName="furnaceType"]')).not.toBeNull();
      expect(query('[formControlName="customFurnaceName"]')).toBeNull();
    });

    it('shows the custom name for Custom Electrotechnology', () => {
      create('mod-1', { baseline: FUEL, 'mod-1': CUSTOM });

      expect(query('[formControlName="customFurnaceName"]')).not.toBeNull();
    });

    it('points the baseline to Assessment Settings', () => {
      create('baseline');

      expect(query('.baseline-note')?.textContent).toContain('Assessment Settings');
    });

    it('has no Assessment Settings note for a modification', () => {
      create('mod-1');

      expect(query('.baseline-note')).toBeNull();
    });
  });
});
