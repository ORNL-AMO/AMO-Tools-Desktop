import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnloadPointComponent } from './unload-point.component';

describe('UnloadPointComponent', () => {
  let component: UnloadPointComponent;
  let fixture: ComponentFixture<UnloadPointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnloadPointComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnloadPointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
