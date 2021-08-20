import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltitudeCorrectionComponent } from './altitude-correction.component';

describe('AltitudeCorrectionComponent', () => {
  let component: AltitudeCorrectionComponent;
  let fixture: ComponentFixture<AltitudeCorrectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AltitudeCorrectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AltitudeCorrectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
