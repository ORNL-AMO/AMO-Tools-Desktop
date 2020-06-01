import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingTowerResultsComponent } from './cooling-tower-results.component';

describe('CoolingTowerResultsComponent', () => {
  let component: CoolingTowerResultsComponent;
  let fixture: ComponentFixture<CoolingTowerResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoolingTowerResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingTowerResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
