import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolidChargeMaterialFormComponent } from './solid-charge-material-form.component';

describe('SolidChargeMaterialFormComponent', () => {
  let component: SolidChargeMaterialFormComponent;
  let fixture: ComponentFixture<SolidChargeMaterialFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolidChargeMaterialFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolidChargeMaterialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
