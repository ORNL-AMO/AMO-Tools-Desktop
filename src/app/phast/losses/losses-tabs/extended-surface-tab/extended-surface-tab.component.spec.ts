import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendedSurfaceTabComponent } from './extended-surface-tab.component';

describe('ExtendedSurfaceTabComponent', () => {
  let component: ExtendedSurfaceTabComponent;
  let fixture: ComponentFixture<ExtendedSurfaceTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtendedSurfaceTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendedSurfaceTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
