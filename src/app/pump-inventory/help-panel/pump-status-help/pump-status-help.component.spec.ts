import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpStatusHelpComponent } from './pump-status-help.component';

describe('PumpStatusHelpComponent', () => {
  let component: PumpStatusHelpComponent;
  let fixture: ComponentFixture<PumpStatusHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpStatusHelpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PumpStatusHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
