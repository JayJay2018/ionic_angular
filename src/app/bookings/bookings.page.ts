import { Component, OnInit, OnDestroy } from '@angular/core';
import { Booking } from './booking.model';
import { Subscription } from 'rxjs';
import { BookingsService } from './bookings.service';
import { IonItemSliding, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  isLoading:  boolean = false;
  private bookingSub: Subscription;
  constructor(
    private bookingsService: BookingsService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.bookingSub = this.bookingsService.bookings.subscribe( bookings => {
      this.loadedBookings = bookings;
      // console.log(this.loadedBookings)
    },
    error => {
      console.error('error', error);
    }) 
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingsService.fetchBookings()
    .subscribe( () => {
      this.isLoading = false;
    },
    errorRes => {
      console.error('error', errorRes)
    });
  }

  onCancelBooking(bookingId: string, slidingEl: IonItemSliding) {
    console.log('Cancel...');
    slidingEl.close();
    this.loadingCtrl.create({
      message: 'Cancelling...'
    }).then( loadingEl => {
      loadingEl.present();
      this.bookingsService.cancelBooking(bookingId)
      .subscribe( () => {
        loadingEl.dismiss();
      });
    })
  }

  ngOnDestroy() {
    if (this.bookingSub) {
      this.bookingSub.unsubscribe();
    }
  }

}
