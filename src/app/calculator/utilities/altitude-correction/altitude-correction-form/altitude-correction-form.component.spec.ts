import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltitudeCorrectionFormComponent } from './altitude-correction-form.component';

describe('AltitudeCorrectionFormComponent', () => {
  let component: AltitudeCorrectionFormComponent;
  let fixture: ComponentFixture<AltitudeCorrectionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AltitudeCorrectionFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AltitudeCorrectionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
