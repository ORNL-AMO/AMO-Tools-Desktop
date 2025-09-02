import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualStationDataComponent } from './annual-station-data.component';

describe('AnnualStationDataComponent', () => {
  let component: AnnualStationDataComponent;
  let fixture: ComponentFixture<AnnualStationDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnualStationDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnualStationDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
