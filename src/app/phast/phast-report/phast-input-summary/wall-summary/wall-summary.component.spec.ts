import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PHAST } from '../../../../shared/models/phast/phast';
import { WallLoss } from '../../../../shared/models/phast/losses/wallLoss';
import { Settings } from '../../../../shared/models/settings';
import { WallLossesSurfaceDbService } from '../../../../indexedDb/wall-losses-surface-db.service';
import { WallSummaryComponent } from './wall-summary.component';

function buildWall(id: string, surfaceArea: number): WallLoss {
  return { id, name: `Wall ${id}`, surfaceArea, surfaceTemperature: 300, ambientTemperature: 80 } as WallLoss;
}

function buildPhast(baselineWalls: WallLoss[], modificationWalls: WallLoss[]): PHAST {
  return {
    losses: { wallLosses: baselineWalls },
    modifications: [{ id: 'm1', phast: { name: 'Mod 1', losses: { wallLosses: modificationWalls }, valid: { wallValid: true } } }],
  } as unknown as PHAST;
}

describe('WallSummaryComponent', () => {
  let fixture: ComponentFixture<WallSummaryComponent>;
  let component: WallSummaryComponent;

  beforeEach(() => {
    const wallDbService = jasmine.createSpyObj<WallLossesSurfaceDbService>('WallLossesSurfaceDbService', ['getAllWithObservable']);
    wallDbService.getAllWithObservable.and.returnValue(of([]));
    TestBed.configureTestingModule({
      declarations: [WallSummaryComponent],
      providers: [{ provide: WallLossesSurfaceDbService, useValue: wallDbService }],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(WallSummaryComponent);
    component = fixture.componentInstance;
    component.settings = { unitsOfMeasure: 'Imperial' } as Settings;
  });

  describe('initialization', () => {
    it('pairs each modification item with the baseline item of the same id', () => {
      component.phast = buildPhast([buildWall('a', 100), buildWall('b', 200)], [buildWall('b', 250), buildWall('a', 100)]);

      fixture.detectChanges();

      expect(component.lossData.map(data => data.modifications[0].surfaceArea)).toEqual([100, 250]);
    });

    it('renders a blank modification cell for a baseline item the modification removed', () => {
      component.phast = buildPhast([buildWall('a', 100), buildWall('b', 200)], [buildWall('a', 100)]);
      component.collapse = false;

      fixture.detectChanges();

      expect(component.lossData[1].modifications[0]).toEqual({});
      expect(fixture.nativeElement.textContent).toContain('Wall b');
    });
  });
});
