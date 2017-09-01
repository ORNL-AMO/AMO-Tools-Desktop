import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendedSurfaceLossesComponent } from './extended-surface-losses.component';

describe('ExtendedSurfaceLossesComponent', () => {
  let component: ExtendedSurfaceLossesComponent;
  let fixture: ComponentFixture<ExtendedSurfaceLossesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtendedSurfaceLossesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendedSurfaceLossesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
