import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingTowerHelpComponent } from './cooling-tower-help.component';

describe('CoolingTowerHelpComponent', () => {
  let component: CoolingTowerHelpComponent;
  let fixture: ComponentFixture<CoolingTowerHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoolingTowerHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingTowerHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
