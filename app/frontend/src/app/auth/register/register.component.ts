import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    model = { charName: '', server: '', password: '' };

    constructor(private authService: AuthService, private router: Router) {}

    onSubmit() {
        this.authService.register(this.model).subscribe(() => {
            this.router.navigate(['/login']);
        });
    }
}