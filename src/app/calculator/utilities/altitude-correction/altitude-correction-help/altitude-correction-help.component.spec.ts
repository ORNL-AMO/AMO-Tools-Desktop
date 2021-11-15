import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltitudeCorrectionHelpComponent } from './altitude-correction-help.component';

describe('AltitudeCorrectionHelpComponent', () => {
  let component: AltitudeCorrectionHelpComponent;
  let fixture: ComponentFixture<AltitudeCorrectionHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AltitudeCorrectionHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AltitudeCorrectionHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
