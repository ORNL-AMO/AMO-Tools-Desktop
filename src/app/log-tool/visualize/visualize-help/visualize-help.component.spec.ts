import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizeHelpComponent } from './visualize-help.component';

describe('VisualizeHelpComponent', () => {
  let component: VisualizeHelpComponent;
  let fixture: ComponentFixture<VisualizeHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizeHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizeHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
