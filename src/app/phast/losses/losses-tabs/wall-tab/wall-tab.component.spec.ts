import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WallTabComponent } from './wall-tab.component';

describe('WallTabComponent', () => {
  let component: WallTabComponent;
  let fixture: ComponentFixture<WallTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WallTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WallTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
