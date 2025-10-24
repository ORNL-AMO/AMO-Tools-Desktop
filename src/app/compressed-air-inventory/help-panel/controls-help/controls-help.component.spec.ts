import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlsHelpComponent } from './controls-help.component';

describe('ControlsHelpComponent', () => {
  let component: ControlsHelpComponent;
  let fixture: ComponentFixture<ControlsHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlsHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
