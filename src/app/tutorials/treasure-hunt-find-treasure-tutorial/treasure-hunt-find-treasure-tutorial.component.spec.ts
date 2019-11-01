import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureHuntFindTreasureTutorialComponent } from './treasure-hunt-find-treasure-tutorial.component';

describe('TreasureHuntFindTreasureTutorialComponent', () => {
  let component: TreasureHuntFindTreasureTutorialComponent;
  let fixture: ComponentFixture<TreasureHuntFindTreasureTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureHuntFindTreasureTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureHuntFindTreasureTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
