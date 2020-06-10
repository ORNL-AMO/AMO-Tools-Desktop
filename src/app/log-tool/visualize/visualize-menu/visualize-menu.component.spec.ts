import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizeMenuComponent } from './visualize-menu.component';

describe('VisualizeMenuComponent', () => {
  let component: VisualizeMenuComponent;
  let fixture: ComponentFixture<VisualizeMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizeMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizeMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
