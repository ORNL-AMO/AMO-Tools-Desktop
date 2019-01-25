import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurbineDiagramComponent } from './turbine-diagram.component';

describe('TurbineDiagramComponent', () => {
  let component: TurbineDiagramComponent;
  let fixture: ComponentFixture<TurbineDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurbineDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurbineDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
