import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentControlsComponent } from './content-controls.component';

describe('ContentControlsComponent', () => {
  let component: ContentControlsComponent;
  let fixture: ComponentFixture<ContentControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentControlsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
