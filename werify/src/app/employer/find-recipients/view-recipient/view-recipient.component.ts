import { Component, OnInit } from '@angular/core';
import { OrganizationService } from 'src/app/services/organization.service';
import { RecipientService } from 'src/app/services/recipient.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Certificate } from 'src/app/models/certificate';
import { Recipient } from 'src/app/models/recipient';
import Swal from 'sweetalert2';
import { Chat } from 'src/app/models/chat';
import { HireRequest } from 'src/app/models/hire-request';


import Web3 from 'web3';
const wa = window as any;


@Component({
  selector: 'app-view-recipient',
  templateUrl: './view-recipient.component.html',
  styleUrls: ['./view-recipient.component.css']
})
export class ViewRecipientComponent implements OnInit {


  private applications_counts = 0;
  private certificates_counts = 0;

  private contract;
  private web3;
  private account: string;
  private imageSrc;
  private certificates: Certificate[] = [];
  private rec: Recipient;
  private hireRequest = new HireRequest(null, localStorage.getItem("Ousername"), null, null, null, false, null);
  constructor(private recService: RecipientService, private orgService: OrganizationService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {

    if (window.hasOwnProperty('web3')) {
      let ethereum = wa.ethereum;
      ethereum.enable();
      this.web3 = new Web3();
      this.web3.setProvider(wa.web3.currentProvider);
      var address = "0xfe4B085669f71608de16428d3815Bc4194aB2145";
      this.contract = new this.web3.eth.Contract([
        {
          "constant": false,
          "inputs": [
            {
              "name": "cert_id",
              "type": "string"
            },
            {
              "name": "sender",
              "type": "string"
            },
            {
              "name": "reciever",
              "type": "string"
            },
            {
              "name": "date",
              "type": "string"
            }
          ],
          "name": "IssueCertificate",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "CertificateCounter",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "certs",
          "outputs": [
            {
              "name": "id",
              "type": "uint256"
            },
            {
              "name": "cert_id",
              "type": "string"
            },
            {
              "name": "sender",
              "type": "string"
            },
            {
              "name": "reciever",
              "type": "string"
            },
            {
              "name": "date",
              "type": "string"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "index",
              "type": "uint256"
            }
          ],
          "name": "getCertificateDetail",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            },
            {
              "name": "",
              "type": "string"
            },
            {
              "name": "",
              "type": "string"
            },
            {
              "name": "",
              "type": "string"
            },
            {
              "name": "",
              "type": "string"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "index",
              "type": "uint256"
            },
            {
              "name": "cert_id",
              "type": "string"
            }
          ],
          "name": "werify",
          "outputs": [
            {
              "name": "",
              "type": "bool"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }
      ], address);
      this.web3.eth.getAccounts().then((accounts) => {
        this.account = accounts[0];
        // console.log(accounts);
      });
    } else {
      Swal.fire("Error", "No Metamask Installed", "error");
    }
    var username = this.route.snapshot.paramMap.get('username');
    this.recService.recipientDetailsForOrganization(username).subscribe(
      data => {
        this.rec = data[0];
        this.imageSrc = "http://localhost:3000/assets/" + this.rec.img_path
        this.orgService.recCountforOrg(this.rec.username).subscribe(
          data => {
            this.certificates_counts = data["docs1"];
            this.applications_counts = data["docs2"];
          },
          err => { console.log(err) }
        )
      },
      err => { console.log(err) }
    );
    this.recService.getRecipientCertificatesForOrganization(username).subscribe(
      (data: Certificate[]) => {
        this.certificates = data["docs"];
      },
      err => { console.log(err) }
    )



  }

  sendhireRequest(username: string) {
    Swal.fire({
      title: "Send Hire Request",
      html: '<input id="swal-input1" placeholder="Enter Job Title" class="swal2-input">' +
        '<input type="number" id="swal-input2" placeholder="Enter Estimated Salary" class="swal2-input">',
      showCancelButton: true
    }).then((result) => {
      if ((<HTMLInputElement>document.getElementById("swal-input1")).value != '' && (<HTMLInputElement>document.getElementById("swal-input2")).value != '') {
        this.hireRequest.job_title = (<HTMLInputElement>document.getElementById("swal-input1")).value;
        this.hireRequest.salary = (<HTMLInputElement>document.getElementById("swal-input2")).value;
        this.hireRequest.to = this.rec.username;
        this.hireRequest.status = null;
        this.orgService.sendHireRequest(this.hireRequest).subscribe(
          data => {
            if (data["message"] == "success") {
              Swal.fire("Success", "Hire Request Sent to " + this.hireRequest.to, "success");
            } else if (data["message"] == "present") {
              Swal.fire("Unsuccessful", "There is a Pending Request to " + this.hireRequest.to, "error");
            }
          },
          err => { console.log(err) }
        )
      } else {
        Swal.fire("Error", "Fill the Job Title and Salary Field ", "error");
      }
    })

  }

  contact(username: string) {
    const chat = new Chat(null, localStorage.getItem("Ousername"), username, null, null, [], false, false, false, false, false, false);
    this.orgService.CreateChat(chat).subscribe(
      data => {
        if (data["message"] == "success") {
          this.router.navigate(['employer/'.concat(localStorage.getItem('Ousername').concat('/inbox/'.concat(data["id"])))]);
        } else if (data["message"] == 'fail') {
          this.router.navigate(['employer/'.concat(localStorage.getItem('Ousername').concat('/inbox/'.concat(data["id"])))]);
        }
      },
      err => { console.log(err) }
    )
  }

  Verify(block_no: string, cert_no: string) {
    if (false) {

    } else {
      this.contract.methods.werify(block_no, cert_no).call().then((data) => {
        // console.log(data);
        if (data == true) {
          Swal.fire("Verified", "Verified Successfully", "success");
        } else {
          Swal.fire("Not in Blockchain", "Unverified", "error");
        }
      });
    }
  }
}