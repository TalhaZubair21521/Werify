import { Component, OnInit } from '@angular/core';
import { Organization } from '../models/organization';
import { OrganizationService } from '../services/organization.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-issuer',
  templateUrl: './issuer.component.html',
  styleUrls: ['./issuer.component.css']
})
export class IssuerComponent implements OnInit {

  username: string;
  imageSrc;
  org: Organization;
  hidden = false;
  constructor(private route: ActivatedRoute, private router: Router, private orgService: OrganizationService) { }

  ngOnInit() {
    var name = this.route.snapshot.paramMap.get("username");
    if (name != localStorage.getItem("Ousername")) {
      this.router.navigate(["/"]);
    }
    this.orgService.orgDetails().subscribe(
      data => {
        this.org = data[0];
        if (this.org.img_path) {
          this.imageSrc = "http://localhost:3000/assets/" + this.org.img_path;
        }
        if (this.org.profile_completed_status == false) {
          this.hidden = true;
        }
        if (this.org.approved == null) {
          this.hidden = true;
        }
      },
      err => { console.log(err) }
    );
  }
  goto() {
    this.username = this.route.snapshot.paramMap.get("username");
    this.router.navigate(["issuer/".concat(this.username)]);
  }
  logout() {
    localStorage.removeItem('Ousername');
    localStorage.removeItem('Otoken');
    this.router.navigate(["/"]);
  }
  switchToEmployerMode() {
    console.log("here");
    this.username = this.route.snapshot.paramMap.get("username");
    this.router.navigate(["employer/".concat(this.username)]);
  }

}
