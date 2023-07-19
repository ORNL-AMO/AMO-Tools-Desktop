import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpFieldHelpComponent } from './pump-field-help.component';

describe('PumpFieldHelpComponent', () => {
  let component: PumpFieldHelpComponent;
  let fixture: ComponentFixture<PumpFieldHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpFieldHelpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PumpFieldHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
