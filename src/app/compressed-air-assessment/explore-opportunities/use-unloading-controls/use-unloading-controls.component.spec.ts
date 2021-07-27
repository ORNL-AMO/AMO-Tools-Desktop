import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UseUnloadingControlsComponent } from './use-unloading-controls.component';

describe('UseUnloadingControlsComponent', () => {
  let component: UseUnloadingControlsComponent;
  let fixture: ComponentFixture<UseUnloadingControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UseUnloadingControlsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UseUnloadingControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
