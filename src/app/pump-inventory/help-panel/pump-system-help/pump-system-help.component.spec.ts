import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpSystemHelpComponent } from './pump-system-help.component';

describe('PumpSystemHelpComponent', () => {
  let component: PumpSystemHelpComponent;
  let fixture: ComponentFixture<PumpSystemHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpSystemHelpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PumpSystemHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
