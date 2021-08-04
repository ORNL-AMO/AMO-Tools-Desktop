import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeMaterialResultsComponent } from './charge-material-results.component';

describe('ChargeMaterialResultsComponent', () => {
  let component: ChargeMaterialResultsComponent;
  let fixture: ComponentFixture<ChargeMaterialResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargeMaterialResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargeMaterialResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
