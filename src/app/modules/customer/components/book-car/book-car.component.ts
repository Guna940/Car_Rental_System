import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '../../../../auth/components/services/storage/storage.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-book-car',
  templateUrl: './book-car.component.html',
  styleUrls: ['./book-car.component.scss']
})
export class BookCarComponent implements OnInit {
  carId: number = this.activeRoute.snapshot.params['id'];
  car: any;
  validateForm!: FormGroup;
  isSpinning: boolean = false;

  constructor(
    private service: CustomerService,
    private activeRoute: ActivatedRoute,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialize form with custom validators
    this.validateForm = this.fb.group(
      {
        fromDate: [null, Validators.required],
        toDate: [null, Validators.required],
      },
      { validators: this.validateDateRange } // Custom validator for date range
    );

    this.getCarById();
  }

  /**
   * Custom validator to ensure 'fromDate' is before 'toDate'.
   */
  validateDateRange = (control: FormGroup): { [key: string]: boolean } | null => {
    const fromDate = control.get('fromDate')?.value;
    const toDate = control.get('toDate')?.value;
    if (fromDate && toDate && new Date(fromDate) >= new Date(toDate)) {
      return { dateRangeInvalid: true };
    }
    return null;
  };

  /**
   * Fetch car details by ID.
   */
  private getCarById() {
    this.service.getCarById(this.carId).subscribe(
      (res) => {
        this.car = res;
        this.car.processedImage = `data:image/jpeg;base64,${res.returnedImage}`;
      },
      (error) => {
        this.message.error('Error fetching car details.');
      }
    );
  }

  /**
   * Handle form submission.
   * @param formData Form data with user-selected dates.
   */
  onSubmit(formData: any) {
    if (this.validateForm.valid) {
      this.bookACar(formData);
    } else {
      this.message.error('Please fill out the form correctly before submitting.');
    }
  }

  /**
   * Book a car using the selected dates and user information.
   * @param data Form data containing 'fromDate' and 'toDate'.
   */
  bookACar(data: any) {
    this.isSpinning = true;

    const bookACarDto = {
      fromDate: new Date(data.fromDate).getTime(), // Convert to timestamp
      toDate: new Date(data.toDate).getTime(), // Convert to timestamp
      userId: StorageService.getUserId(),
      carId: this.carId,
    };

    this.service.bookACar(bookACarDto).subscribe(
      (res) => {
        this.isSpinning = false;
        this.message.success('Car booked successfully.');
        this.router.navigateByUrl('/customer/dashboard');
      },
      (error) => {
        this.isSpinning = false;
        this.message.error('Error occurred while booking the car.');
      }
    );
  }
}
