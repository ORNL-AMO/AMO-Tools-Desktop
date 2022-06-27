import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingTowerBasinResultsComponent } from './cooling-tower-basin-results.component';

describe('CoolingTowerBasinResultsComponent', () => {
  let component: CoolingTowerBasinResultsComponent;
  let fixture: ComponentFixture<CoolingTowerBasinResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoolingTowerBasinResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingTowerBasinResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
