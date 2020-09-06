import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from '../../places.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';
import { Place } from '../../place.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { Subscription } from 'rxjs';
import { BookingsService } from '../../../bookings/bookings.service';
import { AuthService } from '../../../auth/auth.service';
import { switchMap, take } from 'rxjs/operators';


@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable: boolean = false;
  isLoading: boolean = false;
  private placesSub: Subscription;
  constructor(
    private placesService: PlacesService,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingsService: BookingsService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      let fetchedUserId: string;
      this.authService.userId.pipe(take(1), switchMap( userId => {
        if (!userId) {
          throw Error ('No user id found.')
        }
        fetchedUserId = userId;
        this.isLoading = true;
        return this.placesService
        .getPlace(paramMap.get('placeId'))
      }))
      .subscribe( place => {
        this.place = place;
        this.isBookable = place.userId !== fetchedUserId;
        this.isLoading = false;
      },
      error => {
        this.alertCtrl.create({
          header: 'Something went wrong.',
          message: 'Place could not be found.',
          buttons: [{
            text: 'Ok',
            handler: () => {
              this.router.navigate(['/places/tabs/discover'])
            }
          }]
        })
        .then( loadingEl => {
          loadingEl.present();
        })
      });
    })
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
    
  }

  onBookPlace() {
    // console.log('Booking!')
    this.actionSheetCtrl.create({
      header: 'Select date',
      buttons: [
        {
          text: 'Choose date',
          handler: () => {
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'Cancel'
        }
      ]
    })
    .then(actionSheetEl => {
      actionSheetEl.present();
    })
   
    
  }

  openBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: { 
        selectedPlace: this.place,
        selectedMode: mode
      }
    })
    .then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss();
    })
    .then(resultData => {
      // console.log(resultData.data, resultData.role);
      if (resultData.role === 'confirm') {
        // console.log('BOOKED!', resultData, resultData.role)
        const data = resultData.data.bookingData
        this.loadingCtrl.create({
          message: 'Creating booking...'
        }).then( loadingEl => {
          loadingEl.present();
          this.bookingsService.addBooking(
            this.place.id,
            this.place.title,
            this.place.imageUrl,
            data.firstName,
            data.lastName,
            data.guestNumber,
            data.dateFrom,
            data.dateFrom
          ).subscribe( () => {
            loadingEl.dismiss();
            this.router.navigate(['/bookings'])
          })
        })
        
      }
    })
  }

}
