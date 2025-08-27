import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnloadPointHelpComponent } from './unload-point-help.component';

describe('UnloadPointHelpComponent', () => {
  let component: UnloadPointHelpComponent;
  let fixture: ComponentFixture<UnloadPointHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnloadPointHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnloadPointHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
