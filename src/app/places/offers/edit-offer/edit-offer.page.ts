import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place;
  editOfferForm: FormGroup;
  private placesSub: Subscription;
  startDate;
  endDate;
  isLoading: boolean = false;
  placeId: string;

  constructor(
    private placesService: PlacesService,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private fb: FormBuilder,
    private loadingCtrl: LoadingController,
    private router: Router,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers')
        return;
      }
      this.placeId = paramMap.get('placeId');
      this.isLoading = true;
      this.placesSub = this.placesService
      .getPlace(paramMap.get('placeId'))
      .subscribe( place => { 
        this.place = place
        this.editOfferForm = this.fb.group({
          title: [this.place.title, [Validators.required, Validators.minLength(3), Validators.maxLength(18)]],
          description: [this.place.description, [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
          price: [this.place.price, [Validators.required]],
          dateFrom: [this.place.availableFrom.toISOString(), Validators.required],
          dateTo: [this.place.availableTo.toISOString(), Validators.required]
          
        })
        this.isLoading = false;
      },
      error => {
        this.alertCtrl.create({
          header: 'Oops, something went wront.',
          message: 'This place does not exist.',
          buttons: [
            {
              text: 'Okay',
              handler: () => {
                this.router.navigate(['/places/tabs/offers'])
              }}
          ]

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

  onUpdateOffer() {
    if (!this.editOfferForm.valid) {
      return;
    }
    this.loadingCtrl.create({
      message: 'Updating place...'
    })
    .then(loadingEl => {
      loadingEl.present();
      this.placesService.updatePlace(
        this.place.id,
        this.editOfferForm.value.title,
        this.editOfferForm.value.description,
        new Date(this.editOfferForm.value.dateFrom),
        new Date(this.editOfferForm.value.dateTo)
      )
      .subscribe( () => {
        loadingEl.dismiss();
        this.editOfferForm.reset();
        this.router.navigate(['/places/tabs/offers'])
      })
    })

    // console.log(this.editOfferForm);
  }

  datesValid() {
    const startDate = new Date(this.editOfferForm.value.dateFrom);
    const endDate = new Date(this.editOfferForm.value.dateTo);
    return endDate > startDate;
  }
}
