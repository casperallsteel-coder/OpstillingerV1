// State Management
let sheets = JSON.parse(localStorage.getItem('ropox_sheets')) || [];
let currentEditingId = null;
let currentViewingId = null;

// DOM Elements
const views = {
    home: document.getElementById('view-home'),
    form: document.getElementById('view-form'),
    detail: document.getElementById('view-detail')
};

// Form elements
const form = document.getElementById('sheet-form');
const fVarenummer = document.getElementById('f-varenummer');
const fProgram = document.getElementById('f-program');
const fMaskine = document.getElementById('f-maskine');
const fG54 = document.getElementById('f-g54');
const fG55 = document.getElementById('f-g55');
const fG56 = document.getElementById('f-g56');
const fTools = document.getElementById('f-tools');
const fImage = document.getElementById('f-image');
const imgPreviewContainer = document.getElementById('image-preview-container');
const imgPreview = document.getElementById('image-preview');
const uploadLabel = document.querySelector('.image-upload-label');
let currentImageDataUrl = null;

// Navigation logic
function navigateTo(viewName) {
    Object.values(views).forEach(v => v.classList.remove('active'));
    views[viewName].classList.add('active');
    
    if (viewName === 'home') renderSheetsList();
}

document.getElementById('btn-home').addEventListener('click', () => navigateTo('home'));
document.getElementById('btn-new').addEventListener('click', () => {
    currentEditingId = null;
    document.getElementById('form-title').textContent = 'Opret Opstillingsblad';
    form.reset();
    currentImageDataUrl = null;
    updateImagePreview();
    navigateTo('form');
});
document.getElementById('btn-cancel').addEventListener('click', () => navigateTo('home'));
document.getElementById('btn-back').addEventListener('click', () => navigateTo('home'));

document.getElementById('btn-edit').addEventListener('click', () => {
    const sheet = sheets.find(s => s.id === currentViewingId);
    if(sheet) loadForm(sheet);
});

// Image Upload Handling (Client Side Base64)
fImage.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentImageDataUrl = event.target.result;
            updateImagePreview();
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('btn-remove-image').addEventListener('click', () => {
    currentImageDataUrl = null;
    fImage.value = '';
    updateImagePreview();
});

function updateImagePreview() {
    if (currentImageDataUrl) {
        imgPreview.src = currentImageDataUrl;
        imgPreviewContainer.classList.remove('hidden');
        uploadLabel.classList.add('hidden');
    } else {
        imgPreview.src = '';
        imgPreviewContainer.classList.add('hidden');
        uploadLabel.classList.remove('hidden');
    }
}

// Form Submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const sheetData = {
        id: currentEditingId || Date.now().toString(),
        varenummer: fVarenummer.value,
        program: fProgram.value,
        maskine: fMaskine.value,
        g54: fG54.value,
        g55: fG55.value,
        g56: fG56.value,
        tools: fTools.value,
        image: currentImageDataUrl,
        date: new Date().toLocaleDateString('da-DK')
    };

    if (currentEditingId) {
        sheets = sheets.map(s => s.id === currentEditingId ? sheetData : s);
    } else {
        sheets.push(sheetData);
    }

    localStorage.setItem('ropox_sheets', JSON.stringify(sheets));
    navigateTo('home');
});

function loadForm(sheet) {
    currentEditingId = sheet.id;
    document.getElementById('form-title').textContent = 'Rediger Opstillingsblad';
    
    fVarenummer.value = sheet.varenummer || '';
    fProgram.value = sheet.program || '';
    fMaskine.value = sheet.maskine || '';
    fG54.value = sheet.g54 || '';
    fG55.value = sheet.g55 || '';
    fG56.value = sheet.g56 || '';
    fTools.value = sheet.tools || '';
    
    currentImageDataUrl = sheet.image || null;
    updateImagePreview();
    
    navigateTo('form');
}

// List Rendering & Search
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', renderSheetsList);

function renderSheetsList() {
    const container = document.getElementById('sheets-list');
    const query = searchInput.value.toLowerCase();
    
    const filtered = sheets.filter(s => 
        (s.varenummer && s.varenummer.toLowerCase().includes(query)) ||
        (s.maskine && s.maskine.toLowerCase().includes(query)) ||
        (s.program && s.program.toLowerCase().includes(query))
    );

    container.innerHTML = '';
    
    if(filtered.length === 0) {
        container.innerHTML = '<p style="color: #6B7280; grid-column: 1/-1;">Ingen opstillingsblade fundet.</p>';
        return;
    }

    filtered.forEach(sheet => {
        const card = document.createElement('div');
        card.className = 'sheet-card';
        card.innerHTML = `
            <h3>${sheet.varenummer}</h3>
            <span class="machine-tag">${sheet.maskine}</span>
            <p><strong>Prog:</strong> ${sheet.program || '-'}</p>
            <p style="margin-top:auto; font-size: 0.8rem; color:#6b7280;">Opdateret: ${sheet.date}</p>
        `;
        card.addEventListener('click', () => showDetail(sheet.id));
        container.appendChild(card);
    });
}

// Detail View
function showDetail(id) {
    const sheet = sheets.find(s => s.id === id);
    if(!sheet) return;
    
    currentViewingId = id;
    
    document.getElementById('d-varenummer').textContent = sheet.varenummer;
    document.getElementById('d-maskine').textContent = sheet.maskine || '-';
    document.getElementById('d-program').textContent = sheet.program || '-';
    document.getElementById('d-dato').textContent = sheet.date;
    
    document.getElementById('d-g54').textContent = sheet.g54 || '-';
    document.getElementById('d-g55').textContent = sheet.g55 || '-';
    document.getElementById('d-g56').textContent = sheet.g56 || '-';
    
    document.getElementById('d-tools').textContent = sheet.tools || 'Ingen værktøjer angivet.';

    const imgEl = document.getElementById('d-image');
    const noImgEl = document.getElementById('d-no-image');
    
    if(sheet.image) {
        imgEl.src = sheet.image;
        imgEl.classList.remove('hidden');
        noImgEl.classList.add('hidden');
    } else {
        imgEl.classList.add('hidden');
        noImgEl.classList.remove('hidden');
    }

    navigateTo('detail');
}

// Init with some dummy data if empty
if(sheets.length === 0) {
    sheets = [
        {
            id: '1', varenummer: 'ROP-10045', program: 'O5002', maskine: 'Mazak Integrex',
            g54: 'X10 Y-20 Z100', g55: '', g56: '', tools: 'T01 - 10mm Pindfræser\nT02 - 5.5mm Bor',
            date: new Date().toLocaleDateString('da-DK'), image: null
        },
        {
            id: '2', varenummer: 'ADD-9921', program: 'O991', maskine: 'Haas VF-2',
            g54: 'X0 Y0 Z0', g55: 'X100 Y0 Z0', g56: '', tools: 'T05 - Planfræser 50mm',
            date: new Date().toLocaleDateString('da-DK'), image: null
        }
    ];
    localStorage.setItem('ropox_sheets', JSON.stringify(sheets));
}

// Initial render
renderSheetsList();
