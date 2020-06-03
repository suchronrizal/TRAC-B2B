import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcoountComponent } from './acoount.component';

describe('AcoountComponent', () => {
  let component: AcoountComponent;
  let fixture: ComponentFixture<AcoountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcoountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcoountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
