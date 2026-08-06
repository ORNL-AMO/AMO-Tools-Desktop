import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IntegratePumpInventoryComponent } from './integrate-pump-inventory.component';
import { PsatIntegrationService } from '../../shared/connected-inventory/psat-integration.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { IntegrationStateService } from '../../shared/connected-inventory/integration-state.service';
import { ConnectedInventoryData, ConnectedItem, InventoryOption } from '../../shared/connected-inventory/integrations';
import { Assessment } from '../../shared/models/assessment';
import { PSAT } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

function makeAssessment(withConnectedItem: boolean): Assessment {
  const psat: PSAT = { inputs: { operating_hours: 8760, fluidType: 'water', fluidTemperature: 60 } };
  if (withConnectedItem) {
    psat.connectedItem = { name: 'Pump A', inventoryId: 1 } as ConnectedItem;
  }
  return { id: 1, type: 'PSAT', name: 'Test Assessment', psat };
}

describe('IntegratePumpInventoryComponent', () => {
  let component: IntegratePumpInventoryComponent;
  let fixture: ComponentFixture<IntegratePumpInventoryComponent>;
  let psatIntegrationServiceSpy: jasmine.SpyObj<PsatIntegrationService>;
  let helpPanelServiceSpy: jasmine.SpyObj<HelpPanelService>;
  let integrationStateServiceSpy: jasmine.SpyObj<IntegrationStateService>;
  let connectedInventoryData: BehaviorSubject<ConnectedInventoryData>;

  function setInputs(assessment: Assessment) {
    component.assessment = assessment;
    component.psat = assessment.psat;
    component.settings = MOCK_SETTINGS;
    component.selected = false;
  }

  beforeEach(async () => {
    connectedInventoryData = new BehaviorSubject<ConnectedInventoryData>({ connectedItem: undefined });

    psatIntegrationServiceSpy = jasmine.createSpyObj('PsatIntegrationService', [
      'setPSATConnectedInventoryData', 'setPSATFromExistingPumpItem', 'removeConnectedPumpInventory', 'initInventoriesAndOptions',
    ]);
    psatIntegrationServiceSpy.initInventoriesAndOptions.and.returnValue(Promise.resolve([]));

    helpPanelServiceSpy = jasmine.createSpyObj('HelpPanelService', [], { currentField: new BehaviorSubject<string>(null) });

    integrationStateServiceSpy = jasmine.createSpyObj('IntegrationStateService', [], { connectedInventoryData });

    await TestBed.configureTestingModule({
      declarations: [IntegratePumpInventoryComponent],
      providers: [
        { provide: PsatIntegrationService, useValue: psatIntegrationServiceSpy },
        { provide: HelpPanelService, useValue: helpPanelServiceSpy },
        { provide: IntegrationStateService, useValue: integrationStateServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(IntegratePumpInventoryComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      setInputs(makeAssessment(false));
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('does not call setPSATConnectedInventoryData when the assessment has no connectedItem', () => {
      setInputs(makeAssessment(false));
      fixture.detectChanges();

      expect(psatIntegrationServiceSpy.setPSATConnectedInventoryData).not.toHaveBeenCalled();
    });

    it('calls setPSATConnectedInventoryData and emits savePsat/saved when the assessment already has a connectedItem', () => {
      const assessment = makeAssessment(true);
      setInputs(assessment);
      const savedEmitted: boolean[] = [];
      const savePsatEmitted: PSAT[] = [];
      component.saved.subscribe(v => savedEmitted.push(v));
      component.savePsat.subscribe(v => savePsatEmitted.push(v));

      fixture.detectChanges();

      expect(psatIntegrationServiceSpy.setPSATConnectedInventoryData).toHaveBeenCalledWith(assessment, MOCK_SETTINGS);
      expect(savePsatEmitted).toEqual([assessment.psat]);
      expect(savedEmitted).toEqual([true]);
    });

    it('assigns inventorySelectOptions from initInventoriesAndOptions once it resolves', async () => {
      const options: InventoryOption[] = [{ id: 1, display: 'Inventory 1', catalogItemOptions: [] }];
      psatIntegrationServiceSpy.initInventoriesAndOptions.and.returnValue(Promise.resolve(options));
      setInputs(makeAssessment(false));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.inventorySelectOptions).toEqual({
        label: 'Select Pump Inventory',
        itemName: 'Pump',
        inventoryOptions: options,
        shouldResetForm: false,
      });
    });
  });

  describe('handleConnectedInventoryEvents (connectedInventoryData subscription)', () => {
    beforeEach(async () => {
      setInputs(makeAssessment(false));
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('calls setPSATFromExistingPumpItem and emits saved when the emitted data can connect', async () => {
      psatIntegrationServiceSpy.setPSATFromExistingPumpItem.and.callFake(async (data: ConnectedInventoryData) => {
        data.isConnected = true;
      });
      const savedEmitted: boolean[] = [];
      component.saved.subscribe(v => savedEmitted.push(v));

      connectedInventoryData.next({ isConnected: false, canConnect: true });
      await fixture.whenStable();

      expect(psatIntegrationServiceSpy.setPSATFromExistingPumpItem).toHaveBeenCalledWith(
        { isConnected: true, canConnect: true }, component.psat, component.assessment
      );
      expect(savedEmitted).toEqual([true]);
    });

    it('does not call setPSATFromExistingPumpItem when the data cannot connect and does not need unit conversion', async () => {
      connectedInventoryData.next({ isConnected: false, canConnect: false, shouldConvertItemUnits: false });
      await fixture.whenStable();

      expect(psatIntegrationServiceSpy.setPSATFromExistingPumpItem).not.toHaveBeenCalled();
    });

    it('calls removeConnectedPumpInventory, clears connectedItem, and emits saved when shouldDisconnect is true', async () => {
      const connectedItem = { name: 'Pump A', inventoryId: 1 } as ConnectedItem;
      component.psat.connectedItem = connectedItem;
      const savedEmitted: boolean[] = [];
      component.saved.subscribe(v => savedEmitted.push(v));

      connectedInventoryData.next({ isConnected: true, shouldDisconnect: true, connectedItem, ownerAssessmentId: 5 });
      await fixture.whenStable();

      expect(psatIntegrationServiceSpy.removeConnectedPumpInventory).toHaveBeenCalledWith(connectedItem, 5);
      expect(component.psat.connectedItem).toBeUndefined();
      expect(savedEmitted).toEqual([true]);
    });
  });

  describe('template visibility', () => {
    it('hides app-inventory-integration before inventorySelectOptions is set', () => {
      psatIntegrationServiceSpy.initInventoriesAndOptions.and.returnValue(new Promise<InventoryOption[]>(() => { /* never resolves */ }));
      setInputs(makeAssessment(false));

      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-inventory-integration')).toBeNull();
    });

    it('shows app-inventory-integration once inventorySelectOptions is set', async () => {
      setInputs(makeAssessment(false));

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-inventory-integration')).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops calling setPSATFromExistingPumpItem after the component is destroyed', async () => {
      setInputs(makeAssessment(false));
      fixture.detectChanges();
      await fixture.whenStable();

      fixture.destroy();
      psatIntegrationServiceSpy.setPSATFromExistingPumpItem.calls.reset();
      connectedInventoryData.next({ isConnected: false, canConnect: true });

      expect(psatIntegrationServiceSpy.setPSATFromExistingPumpItem).not.toHaveBeenCalled();
    });
  });
});
