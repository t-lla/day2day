import { loadComponent } from './loader.js';

let overlay: HTMLDivElement;
let modal: HTMLDivElement;
let loginFormContainer: HTMLDivElement;
let signupFormContainer: HTMLDivElement;
let loginForm: HTMLFormElement;
let signupForm: HTMLFormElement;
let closeBtn: HTMLElement;
let sidebarItems: NodeListOf<HTMLElement>;

export async function initEntry(): Promise<void> {

  await loadComponent('#entry-container', '../../components/entry.html');


  overlay = document.getElementById('entry-overlay') as HTMLDivElement;
  modal = document.getElementById('entry-modal') as HTMLDivElement;
  loginFormContainer = document.getElementById('login-form-container') as HTMLDivElement;
  signupFormContainer = document.getElementById('signup-form-container') as HTMLDivElement;
  loginForm = document.getElementById('login-form') as HTMLFormElement;
  signupForm = document.getElementById('signup-form') as HTMLFormElement;
  closeBtn = document.getElementById('close-entry') as HTMLElement;
  sidebarItems = document.querySelectorAll('.terminal-tree li') as NodeListOf<HTMLElement>;


  overlay.addEventListener('click', hideEntryModal);
  closeBtn.addEventListener('click', hideEntryModal);


  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {

      sidebarItems.forEach(i => i.classList.remove('selected'));
      
      item.classList.add('selected');
      
      const formType = item.getAttribute('data-form');
      if (formType === 'login') {
        loginFormContainer.classList.remove('hidden');
        signupFormContainer.classList.add('hidden');
      } else if (formType === 'signup') {
        loginFormContainer.classList.add('hidden');
        signupFormContainer.classList.remove('hidden');
      }
    });
  });


  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    
    console.log(`Login attempt: ${username}`);
    

    localStorage.setItem('user', JSON.stringify({ username, name: username }));
    hideEntryModal();
    

    window.location.reload();
  });
  
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = (document.getElementById('newUsername') as HTMLInputElement).value;
    const password = (document.getElementById('newPassword') as HTMLInputElement).value;
    const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement).value;
    
    if (password !== confirmPassword) {
      const errorElement = document.getElementById('signup-error');
      if (errorElement) {
        errorElement.textContent = 'Passwords do not match';
      }
      return;
    }
    
    console.log(`Register attempt: ${username}`);
    
    localStorage.setItem('user', JSON.stringify({ username, name: username }));
    hideEntryModal();
    
    window.location.reload();
  });
}

export function showEntryModal(): void {
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
  
  sidebarItems.forEach(item => {
    if (item.getAttribute('data-form') === 'login') {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
  
  loginFormContainer.classList.remove('hidden');
  signupFormContainer.classList.add('hidden');
  
  setTimeout(() => {
    (document.getElementById('username') as HTMLInputElement)?.focus();
  }, 100);
}

export function hideEntryModal(): void {
  overlay.classList.add('hidden');
  modal.classList.add('hidden');
}