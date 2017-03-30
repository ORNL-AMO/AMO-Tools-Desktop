import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendedSurfaceLossesFormComponent } from './extended-surface-losses-form.component';

describe('ExtendedSurfaceLossesFormComponent', () => {
  let component: ExtendedSurfaceLossesFormComponent;
  let fixture: ComponentFixture<ExtendedSurfaceLossesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtendedSurfaceLossesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendedSurfaceLossesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
