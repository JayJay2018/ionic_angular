import { Component, OnInit, Input } from '@angular/core';
import { Place } from 'src/app/places/place.model';
import { ModalController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';


@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
  @Input() selectedPlace: Place;
  @Input() selectedMode: 'select' | 'random';
  startDate;
  endDate;
  
  createBookingForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    guestNumber: [null, Validators.required],
    dateFrom: [this.startDate, Validators.required],
    dateTo: [null, Validators.required]
  })

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    // console.log('this', this.createBookingForm.value)
    // console.log('this', this.selectedPlace)
    // console.log(this.selectedMode);
    const availableFrom = new Date(this.selectedPlace.availableFrom);
    const availableTo = new Date(this.selectedPlace.availableTo);
    if (this.selectedMode === 'random') {
      this.startDate = new Date(
        availableFrom.getTime() +
          Math.random() *
            (availableTo.getTime() -
              7 * 24 * 60 * 60 * 1000 -
              availableFrom.getTime())
      ).toISOString();
      // console.log('should be random?_time', this.startDate);
      this.createBookingForm.patchValue({dateFrom: this.startDate});
      this.endDate = new Date(
        new Date(this.startDate).getTime() +
          Math.random() *
            (new Date(this.startDate).getTime() +
              6 * 24 * 60 * 60 * 1000 -
              new Date(this.startDate).getTime())
      ).toISOString();
      this.createBookingForm.patchValue({dateTo: this.endDate});
    }
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
    
  }

  onBookPlace() {
    // console.log(this.createBookingForm)
    this.modalCtrl.dismiss({
      bookingData: {
        firstName: this.createBookingForm.value['firstName'],
        lastName: this.createBookingForm.value['lastName'],
        guestNumber: +this.createBookingForm.value['guestNumber'],
        dateFrom: new Date(this.createBookingForm.value['dateFrom']),
        dateTo: new Date(this.createBookingForm.value['dateTo'])
      }
    }, 'confirm')
  }

  datesValid() {
    const startDate = new Date(this.createBookingForm.value['dateFrom'])
    const endDate = new Date(this.createBookingForm.value['dateTo'])
    return endDate > startDate;
  }

}
