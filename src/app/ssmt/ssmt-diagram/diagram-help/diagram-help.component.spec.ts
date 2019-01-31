import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramHelpComponent } from './diagram-help.component';

describe('DiagramHelpComponent', () => {
  let component: DiagramHelpComponent;
  let fixture: ComponentFixture<DiagramHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiagramHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagramHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
