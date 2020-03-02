import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureHuntTutorialComponent } from './treasure-hunt-tutorial.component';

describe('TreasureHuntTutorialComponent', () => {
  let component: TreasureHuntTutorialComponent;
  let fixture: ComponentFixture<TreasureHuntTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureHuntTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureHuntTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
