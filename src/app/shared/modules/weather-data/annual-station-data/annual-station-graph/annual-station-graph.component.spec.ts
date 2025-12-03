import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualStationGraphComponent } from './annual-station-graph.component';

describe('AnnualStationGraphComponent', () => {
  let component: AnnualStationGraphComponent;
  let fixture: ComponentFixture<AnnualStationGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnualStationGraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnualStationGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
