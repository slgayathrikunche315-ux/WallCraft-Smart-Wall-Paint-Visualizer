import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyDesigns } from './my-designs';

describe('MyDesigns', () => {
  let component: MyDesigns;
  let fixture: ComponentFixture<MyDesigns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyDesigns],
    }).compileComponents();

    fixture = TestBed.createComponent(MyDesigns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
