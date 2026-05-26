import { Component } from '@angular/core';
import { attempts } from '../../shared/models/skillmark-demo-data';

@Component({
  selector: 'app-organization-members',
  standalone: true,
  templateUrl: './organization-members.component.html',
  styleUrl: './organization-members.component.scss',
})
export class OrganizationMembersComponent {
  readonly members = [
    { name: 'Ahmad Khalil', email: 'ahmad@csclub.edu', role: 'OWNER', status: 'ACTIVE', joined: '2026-01-10' },
    { name: 'Sara Nasser', email: 'sara@csclub.edu', role: 'PARTICIPANT', status: 'ACTIVE', joined: '2026-02-14' },
    { name: 'Lina Omar', email: 'lina@csclub.edu', role: 'PARTICIPANT', status: 'ACTIVE', joined: '2026-02-17' },
    { name: 'Omar Saleh', email: 'omar@csclub.edu', role: 'PARTICIPANT', status: 'REMOVED', joined: '2026-03-01' },
  ];
  readonly attempts = attempts;
}
