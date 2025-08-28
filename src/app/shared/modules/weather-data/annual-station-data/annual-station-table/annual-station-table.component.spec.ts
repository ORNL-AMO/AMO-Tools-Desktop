import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualStationTableComponent } from './annual-station-table.component';

describe('AnnualStationTableComponent', () => {
  let component: AnnualStationTableComponent;
  let fixture: ComponentFixture<AnnualStationTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnualStationTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnualStationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
