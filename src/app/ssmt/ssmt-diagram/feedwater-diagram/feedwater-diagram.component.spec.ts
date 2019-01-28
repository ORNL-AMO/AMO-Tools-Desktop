import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedwaterDiagramComponent } from './feedwater-diagram.component';

describe('FeedwaterDiagramComponent', () => {
  let component: FeedwaterDiagramComponent;
  let fixture: ComponentFixture<FeedwaterDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedwaterDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedwaterDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
