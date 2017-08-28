import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WallLossesSurfaceComponent } from './wall-losses-surface.component';

describe('WallLossesSurfaceComponent', () => {
  let component: WallLossesSurfaceComponent;
  let fixture: ComponentFixture<WallLossesSurfaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WallLossesSurfaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WallLossesSurfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
