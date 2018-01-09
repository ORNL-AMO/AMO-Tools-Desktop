import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolidLoadChargeMaterialHelpComponent } from './solid-load-charge-material-help.component';

describe('SolidLoadChargeMaterialHelpComponent', () => {
  let component: SolidLoadChargeMaterialHelpComponent;
  let fixture: ComponentFixture<SolidLoadChargeMaterialHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolidLoadChargeMaterialHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolidLoadChargeMaterialHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
