import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderDiagramComponent } from './header-diagram.component';

describe('HeaderDiagramComponent', () => {
  let component: HeaderDiagramComponent;
  let fixture: ComponentFixture<HeaderDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
