import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PlacesService } from '../../places.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  
  newOfferForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(18)]],
    description: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    price: [null, Validators.required],
    dateFrom: [null],
    dateTo: [null]
  })
  constructor(
    private fb: FormBuilder,
    private placesService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController) { }

  ngOnInit() {
    console.log(this.newOfferForm)
  }

  onCreateOffer() {
    if (!this.newOfferForm.valid) {
      return
    }
    this.loadingCtrl.create({
      message: 'Creating place...'
    })
    .then(loadingEl => {
      loadingEl.present();
      this.placesService.addPlace(
        this.newOfferForm.value.title,
        this.newOfferForm.value.description,
        +this.newOfferForm.value.price,
        new Date(this.newOfferForm.value.dateFrom),
        new Date(this.newOfferForm.value.dateTo)
      )
      .subscribe( () => {
        loadingEl.dismiss();
        this.newOfferForm.reset();
        this.router.navigate(['/places/tabs/offers']);
    })
    })
   

    // console.log(this.newOfferForm);
  }

}
