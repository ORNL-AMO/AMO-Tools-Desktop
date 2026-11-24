import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PHAST } from '../../../../shared/models/phast/phast';
import { CoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';
import { Settings } from '../../../../shared/models/settings';
import { CoolingSummaryComponent } from './cooling-summary.component';

function buildCooling(id: string, flowRate: number): CoolingLoss {
  return { id, name: `Cooling ${id}`, coolingLossType: 'Liquid', liquidCoolingLoss: { flowRate } } as CoolingLoss;
}

describe('CoolingSummaryComponent', () => {
  let fixture: ComponentFixture<CoolingSummaryComponent>;
  let component: CoolingSummaryComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoolingSummaryComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(CoolingSummaryComponent);
    component = fixture.componentInstance;
    component.settings = { unitsOfMeasure: 'Imperial' } as Settings;
  });

  describe('initialization', () => {
    it('leaves a blank modification entry for a baseline item the modification removed, instead of failing', () => {
      component.phast = {
        losses: { coolingLosses: [buildCooling('a', 10), buildCooling('b', 20)] },
        modifications: [{ id: 'm1', phast: { name: 'Mod 1', losses: { coolingLosses: [buildCooling('b', 25)] }, valid: { coolingValid: true } } }],
      } as unknown as PHAST;
      component.collapse = false;

      fixture.detectChanges();

      expect(component.lossData[0].modifications[0]).toEqual({});
      expect(component.lossData[1].modifications[0].flowRate).toBe(25);
    });
  });
});
