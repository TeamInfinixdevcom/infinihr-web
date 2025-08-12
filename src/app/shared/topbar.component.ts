import { Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule }  from '@angular/material/button';
import { MatIconModule }    from '@angular/material/icon';

    @Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [MatToolbarModule, MatButtonModule, MatIconModule],
    template: `
        <mat-toolbar color="primary">
        <span class="font-semibold">{{ title }}</span>
        <span style="flex:1"></span>
        <ng-content></ng-content>
        </mat-toolbar>
    `
    })
    export class TopbarComponent {
    @Input() title = '';
    }
