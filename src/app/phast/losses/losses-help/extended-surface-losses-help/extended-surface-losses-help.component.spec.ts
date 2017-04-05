import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendedSurfaceLossesHelpComponent } from './extended-surface-losses-help.component';

describe('ExtendedSurfaceLossesHelpComponent', () => {
  let component: ExtendedSurfaceLossesHelpComponent;
  let fixture: ComponentFixture<ExtendedSurfaceLossesHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtendedSurfaceLossesHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendedSurfaceLossesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
