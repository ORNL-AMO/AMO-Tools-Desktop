import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatSystemSetupComponent } from './psat-system-setup.component';

describe('PsatSystemSetupComponent', () => {
  let component: PsatSystemSetupComponent;
  let fixture: ComponentFixture<PsatSystemSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatSystemSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatSystemSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
