import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolidLoadChargeMaterialComponent } from './solid-load-charge-material.component';

describe('SolidLoadChargeMaterialComponent', () => {
  let component: SolidLoadChargeMaterialComponent;
  let fixture: ComponentFixture<SolidLoadChargeMaterialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolidLoadChargeMaterialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolidLoadChargeMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
