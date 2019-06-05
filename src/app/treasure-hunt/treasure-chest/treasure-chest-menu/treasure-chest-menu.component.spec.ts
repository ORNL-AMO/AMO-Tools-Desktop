import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureChestMenuComponent } from './treasure-chest-menu.component';

describe('TreasureChestMenuComponent', () => {
  let component: TreasureChestMenuComponent;
  let fixture: ComponentFixture<TreasureChestMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureChestMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureChestMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
