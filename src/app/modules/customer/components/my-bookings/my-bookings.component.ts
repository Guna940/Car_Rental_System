import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  carId: number | null = null;
  car: any;
  isSpinning = false;
  message: any;

  constructor(private service: CustomerService, private activeRoute: ActivatedRoute) {}

  ngOnInit() {
    // Initialize carId using the ActivatedRoute
    this.carId = +this.activeRoute.snapshot.params['id']; // Convert to number if needed

    // Call methods to fetch data
    this.getBookingsByUserId();
    if (this.carId) {
      this.getCarById();
    }
  }

  /**
   * Fetch bookings by user ID and map details.
   */
  private getBookingsByUserId() {
    this.isSpinning = true;

    this.service.getBookingsByUserId().subscribe(
      (data) => {
        this.bookings = data.map((booking: any) => ({
          id: booking.id,
          carName: booking.car?.name || 'Unknown Car',
          fromDate: new Date(booking.fromDate),
          toDate: new Date(booking.toDate),
          price: booking.price || 'N/A',
          bookCarStatus: booking.bookCarStatus || 'Unknown',
          carImage: booking.car?.image || 'assets/default-car.png', // Fallback image
        }));
        this.isSpinning = false;
      },
      (error) => {
        console.error('Error fetching bookings:', error);
        this.isSpinning = false;
      }
    );
  }

  private getCarById() {
    this.service.getCarById(this.carId!).subscribe(
      (res) => {
        this.car = res;
        this.car.processedImage = `data:image/jpeg;base64,${res.returnedImage}`;
      },
      (error) => {
        console.error('Error fetching car details:', error);
      }
    );
  }

  /**
   * Get CSS class based on the booking status.
   * @param status The booking status string.
   */
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }
}
