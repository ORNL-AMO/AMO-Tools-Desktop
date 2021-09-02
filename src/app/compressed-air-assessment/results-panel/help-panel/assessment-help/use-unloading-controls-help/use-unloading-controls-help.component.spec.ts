import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UseUnloadingControlsHelpComponent } from './use-unloading-controls-help.component';

describe('UseUnloadingControlsHelpComponent', () => {
  let component: UseUnloadingControlsHelpComponent;
  let fixture: ComponentFixture<UseUnloadingControlsHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UseUnloadingControlsHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UseUnloadingControlsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
