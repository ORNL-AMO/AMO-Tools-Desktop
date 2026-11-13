import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuxiliaryEquipmentItemResult, AuxiliaryEquipmentResults } from '../../models/auxiliary-equipment';
import { ProcessHeatingModification } from '../../models/modification';
import { AuxiliaryEquipmentResultsService } from '../../services/auxiliary-equipment-results.service';
import { ModificationService } from '../../services/modification.service';
import { AuxiliaryEquipmentResultsComponent, buildAuxiliaryEquipmentRows } from './auxiliary-equipment-results.component';

describe('buildAuxiliaryEquipmentRows', () => {
  const item = (id: string, name: string, energyUse: number): AuxiliaryEquipmentItemResult => ({ id, name, power: 0, energyUse, energyCost: 0 });
  const results = (...items: AuxiliaryEquipmentItemResult[]): AuxiliaryEquipmentResults =>
    ({ items, isComplete: true, totalPower: 0, totalEnergyUse: 0, totalEnergyCost: 0 });

  it('lists baseline items alone when no modification is compared', () => {
    expect(buildAuxiliaryEquipmentRows(results(item('a', 'Fan', 100)), undefined)).toEqual([
      { name: 'Fan', baseline: 100, modification: undefined },
    ]);
  });

  it('matches items by id, keeps baseline order, uses the modification name, and appends modification-only items', () => {
    const rows = buildAuxiliaryEquipmentRows(
      results(item('a', 'Fan', 100), item('b', 'Pump', 50)),
      results(item('c', 'Blower', 20), item('a', 'Fan (VFD)', 60)),
    );

    expect(rows).toEqual([
      { name: 'Fan (VFD)', baseline: 100, modification: 60 },
      { name: 'Pump', baseline: 50, modification: undefined },
      { name: 'Blower', baseline: undefined, modification: 20 },
    ]);
  });
});

describe('AuxiliaryEquipmentResultsComponent', () => {
  let fixture: ComponentFixture<AuxiliaryEquipmentResultsComponent>;
  let resultsByScenario: Record<string, AuxiliaryEquipmentResults>;

  const totals = (totalEnergyUse: number, isComplete = true): AuxiliaryEquipmentResults =>
    ({ items: [], isComplete, totalPower: 10, totalEnergyUse, totalEnergyCost: totalEnergyUse / 10 });
  const element = (): HTMLElement => fixture.nativeElement;
  const cells = (label: string): string[] => {
    const row = Array.from(element().querySelectorAll('tr')).find(tr => tr.cells[0]?.textContent.trim() === label);
    return Array.from(row.cells).slice(1).map(cell => cell.textContent.trim());
  };
  const render = (scenario: string): void => {
    fixture.componentRef.setInput('scenario', scenario);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    resultsByScenario = { baseline: totals(1000), 'mod-1': totals(600) };
    const modifications = signal<ProcessHeatingModification[]>([{ id: 'mod-1', scenarioOverrides: { name: 'VFD' } }]);

    await TestBed.configureTestingModule({
      declarations: [AuxiliaryEquipmentResultsComponent],
      providers: [
        { provide: AuxiliaryEquipmentResultsService, useValue: { scenarioResults: (scenario: string) => resultsByScenario[scenario] } },
        { provide: ModificationService, useValue: { modifications } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AuxiliaryEquipmentResultsComponent);
  });

  describe('template conditional rendering', () => {
    it('shows totals and savings without the missing-inputs alert when every scenario is complete', () => {
      render('mod-1');

      expect(element().querySelector('.alert-danger')).toBeNull();
      expect(cells('Total Energy Use (kWh/yr)')).toEqual(['1,000', '600']);
      expect(cells('Energy Savings (kWh/yr)')).toEqual(['— —', '400']);
      expect(cells('Cost Savings ($/yr)')).toEqual(['— —', '40']);
    });

    it('shows the alert and hides baseline totals when baseline is missing inputs', () => {
      resultsByScenario.baseline = totals(1000, false);
      render('baseline');

      expect(element().querySelector('.alert-danger')).not.toBeNull();
      expect(cells('Total Power (kW)')).toEqual(['— —']);
      expect(cells('Total Energy Use (kWh/yr)')).toEqual(['— —']);
    });

    it('keeps baseline totals but hides modification totals and savings when only the modification is missing inputs', () => {
      resultsByScenario['mod-1'] = totals(600, false);
      render('mod-1');

      expect(element().querySelector('.alert-danger')).not.toBeNull();
      expect(cells('Total Energy Use (kWh/yr)')).toEqual(['1,000', '— —']);
      expect(cells('Total Energy Cost ($/yr)')).toEqual(['100', '— —']);
      expect(cells('Energy Savings (kWh/yr)')).toEqual(['— —', '— —']);
      expect(cells('Cost Savings ($/yr)')).toEqual(['— —', '— —']);
    });

    it('hides the savings rows when no modification is compared', () => {
      render('baseline');

      expect(element().textContent).not.toContain('Energy Savings');
    });
  });
});
