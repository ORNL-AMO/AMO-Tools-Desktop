import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WallLossesLabelsComponent } from './wall-losses-labels.component';

describe('WallLossesLabelsComponent', () => {
  let component: WallLossesLabelsComponent;
  let fixture: ComponentFixture<WallLossesLabelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WallLossesLabelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WallLossesLabelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
