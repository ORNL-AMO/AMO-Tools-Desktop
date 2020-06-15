import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizeDataComponent } from './visualize-data.component';

describe('VisualizeDataComponent', () => {
  let component: VisualizeDataComponent;
  let fixture: ComponentFixture<VisualizeDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizeDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizeDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
