function mainMenu() {
    document.querySelector('header').classList.remove('hidden');
    document.getElementById('app').classList.remove('hidden');
}

function navigateToApp() {
    document.querySelector('header').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    loadSection('habits');
}

function loadSection(section) {
    const content = document.getElementById('content');
    fetch(`js/${section}.js`)
}


  