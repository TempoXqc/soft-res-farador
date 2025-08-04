import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    model = { charName: '', server: '', password: '' };

    constructor(private authService: AuthService, private router: Router) {}

    onSubmit() {
        this.authService.login(this.model).subscribe(response => {
            this.authService.setToken(response.token);
            this.router.navigate(['/raids']);
        });
    }
}