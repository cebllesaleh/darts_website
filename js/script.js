// EmailJS – Contact form (https://www.emailjs.com/)
// 1. Add your public key from EmailJS → Account → API Keys
// 2. Create an email template with variables: {{name}}, {{email}}, {{subject}}, {{message}}
// 3. Copy the template ID and set EMAILJS_TEMPLATE_ID below
const EMAILJS_SERVICE_ID = 'service_xyug5p8';
const EMAILJS_TEMPLATE_ID = 'template_ibxk1sr';
const EMAILJS_AUTOREPLY_TEMPLATE_ID = 'template_lph6bud';
const EMAILJS_PUBLIC_KEY = 'JKgoA4k2k3yV_z1Si';

function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent;

    if (!EMAILJS_PUBLIC_KEY) {
        alert('Email service not configured. Please add your EmailJS public key.');
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
    }

    (async function initAndSend() {
        if (typeof emailjs === 'undefined') {
            alert('Email service failed to load. Please try again later.');
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
            return;
        }
        try {
            await emailjs.init(EMAILJS_PUBLIC_KEY);
            const result = await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);
            if (result.status === 200) {
                // Send auto-reply to the user (non-blocking – main email already sent)
                try {
                    const formData = new FormData(form);
                    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_AUTOREPLY_TEMPLATE_ID, {
                        name: formData.get('name'),
                        reply_to: formData.get('reply_to')
                    });
                } catch (autoReplyErr) {
                    console.warn('Auto-reply failed:', autoReplyErr);
                }
                alert('Thank you for your message. The committee will get back to you soon.');
                form.reset();
                if (document.getElementById('contactModal')) {
                    document.getElementById('contactModal').classList.remove('show');
                }
            } else {
                throw new Error(result.text || 'Send failed');
            }
        } catch (err) {
            console.error('EmailJS error:', err);
            alert('Sorry, we could not send your message. Please try emailing info@bermudadartsleague.com directly.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    })();
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-section') === sectionId) {
            btn.classList.add('active');
        }
    });
    document.getElementById(sectionId).classList.add('active');
    closeMobileNav();
    if (sectionId === 'gallery') {
        initGalleryFolders();
    }
    if (sectionId === 'homepage') {
        renderBulletinFlyers();
        renderHomepageImages();
    }
}

// Mobile hamburger menu
function toggleMobileNav() {
    const drawer = document.getElementById('navDrawer');
    const overlay = document.getElementById('navOverlay');
    const hamburger = document.getElementById('hamburgerBtn');
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
        closeMobileNav();
    } else {
        drawer.classList.add('open');
        overlay.classList.add('open');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        drawer.setAttribute('aria-hidden', 'false');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        // Move focus into drawer for keyboard/screen reader users
        const closeBtn = drawer.querySelector('.nav-drawer-close');
        closeBtn?.focus();
    }
}

function closeMobileNav() {
    const drawer = document.getElementById('navDrawer');
    const overlay = document.getElementById('navOverlay');
    const hamburger = document.getElementById('hamburgerBtn');
    // Move focus before hiding - avoids aria-hidden on focused element (accessibility)
    if (drawer.contains(document.activeElement)) {
        hamburger?.focus();
    }
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// Bulletin Board – Event Flyers
// Add flyers via code: put image paths in BULLETIN_FLYERS below, or call addFlyerFromSrc('path/to/flyer.jpg')
const BULLETIN_FLYERS_KEY = 'bermudaDartsBulletinFlyers';
const BULLETIN_FLYERS = [
    { src: 'images/flyers/DARTS winner.webp', id: 1 },
    { src: 'images/flyers/DartTeam .jpg', id: 2 },
    { src: 'images/flyers/registration poster.webp', id: 3 },
];

function getBulletinFlyers() {
    // Use BULLETIN_FLYERS as the single source of truth – one of each, no duplicates or blanks
    if (BULLETIN_FLYERS.length > 0) {
        const flyers = BULLETIN_FLYERS.map((f, i) => ({ src: f.src, id: f.id ?? i }));
        saveBulletinFlyers(flyers);
        return flyers;
    }
    return JSON.parse(localStorage.getItem(BULLETIN_FLYERS_KEY) || '[]');
}

function saveBulletinFlyers(flyers) {
    localStorage.setItem(BULLETIN_FLYERS_KEY, JSON.stringify(flyers));
}

function addFlyerFromSrc(src) {
    const flyers = getBulletinFlyers();
    flyers.push({ src, id: Date.now() + Math.random() });
    saveBulletinFlyers(flyers);
    renderBulletinFlyers();
}

function removeFlyer(id) {
    const flyers = getBulletinFlyers().filter(f => String(f.id) !== String(id));
    saveBulletinFlyers(flyers);
    renderBulletinFlyers();
}

function renderBulletinFlyers() {
    const container = document.getElementById('bulletinFlyers');
    if (!container) return;

    const flyers = getBulletinFlyers();
    if (flyers.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = flyers.map((f, i) => `
        <article class="flyer-pin-card" style="--tilt: ${(i % 3) * 2 - 2}deg">
            <span class="notice-pin" aria-hidden="true"></span>
            <img src="${f.src}" alt="Event flyer" onclick="openImageModal(this.src, 'Event flyer')">
            <button class="flyer-remove" onclick="removeFlyer('${f.id}')" aria-label="Remove flyer">&times;</button>
        </article>
    `).join('');
}

// League Spotlight – add images via code (same pattern as GALLERY_FOLDERS)
const HOMEPAGE_IMAGES = [
    { src: 'images/gallery/spotlight.webp', alt: 'Match night' },
    { src: 'images/gallery/spotlight1.webp', alt: 'Match night' },
    { src: 'images/gallery/spotlight2.webp', alt: 'Match night' },
   
   
    // Add more: { src: 'images/gallery/your-photo.jpg', alt: 'Description' },
];

function renderHomepageImages() {
    const grid = document.getElementById('homepageImagesGrid');
    if (!grid) return;

    if (HOMEPAGE_IMAGES.length === 0) {
        grid.innerHTML = '';
        return;
    }

    grid.innerHTML = HOMEPAGE_IMAGES.map(img => {
        const src = img.src;
        const alt = (img.alt || 'Featured').replace(/"/g, '&quot;');
        return `<div class="homepage-image-cell"><img src="${src}" alt="${alt}" loading="eager" onclick="openImageModal(this.src, this.alt)"></div>`;
    }).join('');
}

// Gallery folders – collapsible folders with pictures
const GALLERY_FOLDERS = [
    {
        name: 'Match Nights',
        images: [
            { src: 'images/gallery/1.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/2.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/3.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/4.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/5.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/6.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/7.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/8.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/9.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/10.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/11.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/12.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/13.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/14.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/15.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/16.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/17.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/18.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/19.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/20.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/21.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/22.jpg', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/23.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/24.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/25.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/26.jpg', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/27.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/28.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/29.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/30.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/31.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/32.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/33.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/34.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/35.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/36.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/37.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/38.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/39.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/40.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/41.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/42.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/43.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/44.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/christmas 2.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/christmas 3.webp', alt: 'Bermuda Darts League' },
            { src: 'images/gallery/christmas 4.webp', alt: 'Bermuda Darts League' }
            
        ]
    }
];

function initGalleryFolders() {
    const container = document.getElementById('galleryFolders');
    if (!container) return;

    container.innerHTML = '';
    const savedImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
    const folders = [...GALLERY_FOLDERS];
    if (savedImages.length > 0) {
        folders.push({
            name: 'My Uploads',
            images: savedImages.map(i => ({ src: i.src, alt: i.name || 'Uploaded' }))
        });
    }

    folders.forEach((folder, folderIndex) => {
        const folderEl = document.createElement('div');
        folderEl.className = 'gallery-folder';
        folderEl.innerHTML = `
            <button class="gallery-folder-header" aria-expanded="false" aria-controls="folder-content-${folderIndex}">
                <span class="gallery-folder-icon">›</span>
                <span class="gallery-folder-name">${folder.name}</span>
                <span class="gallery-folder-count">${folder.images.length} photos</span>
            </button>
            <div class="gallery-folder-content" id="folder-content-${folderIndex}" hidden>
                <div class="gallery-folder-grid"></div>
            </div>
        `;

        const header = folderEl.querySelector('.gallery-folder-header');
        const content = folderEl.querySelector('.gallery-folder-content');
        const grid = folderEl.querySelector('.gallery-folder-grid');

        const isUploadsFolder = folder.name === 'My Uploads';
        folder.images.forEach(img => {
            const cell = document.createElement('div');
            cell.className = 'gallery-folder-cell';
            cell.innerHTML = `<img src="${img.src}" alt="${img.alt}">` +
                (isUploadsFolder ? '<button class="gallery-cell-delete" aria-label="Delete">&times;</button>' : '');
            cell.onclick = (e) => {
                if (!e.target.classList.contains('gallery-cell-delete')) openImageModal(img.src, img.alt);
            };
            const delBtn = cell.querySelector('.gallery-cell-delete');
            if (delBtn) {
                delBtn.onclick = (e) => { e.stopPropagation(); deleteImage(img.src); };
            }
            grid.appendChild(cell);
        });

        header.onclick = () => {
            const isExpanded = content.hidden;
            content.hidden = !isExpanded;
            header.setAttribute('aria-expanded', !isExpanded);
            folderEl.classList.toggle('expanded', !isExpanded);
        };

        container.appendChild(folderEl);
    });
}


// PDF Upload - Rules
const rulesUploadArea = document.getElementById('rulesUploadArea');
const rulesPdfInput = document.getElementById('rulesPdfInput');
const rulesFileLink = document.getElementById('rulesFileLink');
const rulesMessage = document.getElementById('rulesMessage');

if (rulesUploadArea) {
    rulesUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        rulesUploadArea.classList.add('dragover');
    });

    rulesUploadArea.addEventListener('dragleave', () => {
        rulesUploadArea.classList.remove('dragover');
    });

    rulesUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        rulesUploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            displayRulesPDF(file);
        } else {
            showRulesMessage('Please upload a PDF file', 'error');
        }
    });
}

function loadRulesPDF(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
        displayRulesPDF(file);
    } else {
        showRulesMessage('Please upload a valid PDF file', 'error');
    }
}

function displayRulesPDF(file) {
    const fileURL = URL.createObjectURL(file);

    if (rulesFileLink) {
        rulesFileLink.style.display = 'block';
        rulesFileLink.innerHTML = `
            <a href="${fileURL}" target="_blank" style="
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.6rem 1rem;
                border-radius: 4px;
                border: 2px solid var(--neon-green);
                color: var(--text-primary);
                text-decoration: none;
                background: rgba(57, 255, 20, 0.1);
            ">
                <span>📄</span>
                <span>${file.name}</span>
            </a>
        `;
    }

    showRulesMessage('Rules file ready. Click the file name to open.', 'success');
}

function showRulesMessage(text, type) {
    rulesMessage.textContent = text;
    rulesMessage.className = `message show ${type}`;
    setTimeout(() => {
        rulesMessage.classList.remove('show');
    }, 3000);
}


// Practice Mode Selection
function startGame(mode) {
    document.getElementById('modeSelection').style.display = 'none';
    if (mode === '501') {
        document.getElementById('game501').classList.add('active');
        resetGame('501');
    } else if (mode === 'cricket') {
        document.getElementById('gameCricket').classList.add('active');
        initCricket();
    }
}

function backToModes() {
    document.getElementById('modeSelection').style.display = 'grid';
    document.getElementById('game501').classList.remove('active');
    document.getElementById('gameCricket').classList.remove('active');
}

// 501 Game Logic - Two Players
let currentPlayer501 = 1;
let score501Player1 = 501;
let score501Player2 = 501;
let throwHistoryPlayer1 = [];
let throwHistoryPlayer2 = [];

function resetGame(mode) {
    if (mode === '501') {
        currentPlayer501 = 1;
        score501Player1 = 501;
        score501Player2 = 501;
        throwHistoryPlayer1 = [];
        throwHistoryPlayer2 = [];
        
        document.getElementById('score501Player1').textContent = '501';
        document.getElementById('score501Player2').textContent = '501';
        document.getElementById('history501Player1').innerHTML = '<h5 style="margin-bottom: 0.5rem; color: var(--neon-green); font-size: 0.9rem;">History</h5>';
        document.getElementById('history501Player2').innerHTML = '<h5 style="margin-bottom: 0.5rem; color: var(--neon-green); font-size: 0.9rem;">History</h5>';

        updatePlayerIndicator501();

        const totalInput = document.getElementById('throwTotal');
        if (totalInput) {
            totalInput.value = '';
            totalInput.focus();
        }
        document.getElementById('message501').classList.remove('show');
    } else if (mode === 'cricket') {
        initCricket();
    }
}

function updatePlayerIndicator501() {
    if (currentPlayer501 === 1) {
        document.getElementById('player1Indicator').style.display = 'block';
        document.getElementById('player2Indicator').style.display = 'none';
        document.getElementById('player1Section').style.borderColor = 'var(--neon-green)';
        document.getElementById('player2Section').style.borderColor = 'rgba(57, 255, 20, 0.2)';
    } else {
        document.getElementById('player1Indicator').style.display = 'none';
        document.getElementById('player2Indicator').style.display = 'block';
        document.getElementById('player1Section').style.borderColor = 'rgba(57, 255, 20, 0.2)';
        document.getElementById('player2Section').style.borderColor = 'var(--neon-green)';
    }
}

function recordThrow501() {
    const totalInput = document.getElementById('throwTotal');
    const throwTotal = parseInt(totalInput.value) || 0;

    if (throwTotal < 0 || throwTotal > 180) {
        showMessage501('Total must be between 0 and 180.', 'error');
        return;
    }

    if (currentPlayer501 === 1) {
        const newScore = score501Player1 - throwTotal;

        if (newScore < 0) {
            showMessage501('Player 1 Bust! Score would go below 0. Try again.', 'error');
            return;
        }

        if (newScore === 0) {
            score501Player1 = 0;
            document.getElementById('score501Player1').textContent = '0';
            addThrowToHistory(1, throwTotal, score501Player1);
            showMessage501('🎯 Player 1 WINS! Hit exactly 0!', 'success');
            return;
        }

        score501Player1 = newScore;
        document.getElementById('score501Player1').textContent = score501Player1;
        addThrowToHistory(1, throwTotal, score501Player1);
    } else {
        const newScore = score501Player2 - throwTotal;

        if (newScore < 0) {
            showMessage501('Player 2 Bust! Score would go below 0. Try again.', 'error');
            return;
        }

        if (newScore === 0) {
            score501Player2 = 0;
            document.getElementById('score501Player2').textContent = '0';
            addThrowToHistory(2, throwTotal, score501Player2);
            showMessage501('🎯 Player 2 WINS! Hit exactly 0!', 'success');
            return;
        }

        score501Player2 = newScore;
        document.getElementById('score501Player2').textContent = score501Player2;
        addThrowToHistory(2, throwTotal, score501Player2);
    }

    // Switch players
    currentPlayer501 = currentPlayer501 === 1 ? 2 : 1;
    updatePlayerIndicator501();

    totalInput.value = '';
    totalInput.focus();
}

function addThrowToHistory(player, total, remaining) {
    const entry = document.createElement('div');
    entry.className = 'throw-entry';
    entry.innerHTML = `
        <span>Scored: ${total}</span>
        <span>Remaining: ${remaining}</span>
    `;
    const historyId = player === 1 ? 'history501Player1' : 'history501Player2';
    const historyEl = document.getElementById(historyId);
    historyEl.insertBefore(entry, historyEl.children[historyEl.children.length > 0 ? 1 : 0]);
}

function showMessage501(text, type) {
    const msg = document.getElementById('message501');
    msg.textContent = text;
    msg.className = `message show ${type}`;
    setTimeout(() => {
        msg.classList.remove('show');
    }, 3000);
}

// Cricket Game Logic - Two Players
const cricketNumbers = [15, 16, 17, 18, 19, 20, 'BULL'];
let currentPlayerCricket = 1;
let cricketMarksPlayer1 = {};
let cricketMarksPlayer2 = {};

function initCricket() {
    currentPlayerCricket = 1;
    cricketMarksPlayer1 = {};
    cricketMarksPlayer2 = {};
    cricketNumbers.forEach(num => {
        cricketMarksPlayer1[num] = 0;
        cricketMarksPlayer2[num] = 0;
    });
    updateCricketPlayerIndicator();
    renderCricketBoard();
    document.getElementById('messageCricket').classList.remove('show');
}

function updateCricketPlayerIndicator() {
    if (currentPlayerCricket === 1) {
        document.getElementById('cricketPlayer1Indicator').style.opacity = '1';
        document.getElementById('cricketPlayer2Indicator').style.opacity = '0.5';
        document.getElementById('cricketPlayer1Indicator').querySelector('.current-badge').style.display = 'block';
        document.getElementById('cricketPlayer2Indicator').querySelector('.current-badge').style.display = 'none';
    } else {
        document.getElementById('cricketPlayer1Indicator').style.opacity = '0.5';
        document.getElementById('cricketPlayer2Indicator').style.opacity = '1';
        document.getElementById('cricketPlayer1Indicator').querySelector('.current-badge').style.display = 'none';
        document.getElementById('cricketPlayer2Indicator').querySelector('.current-badge').style.display = 'block';
    }
}

function renderCricketBoard() {
    const board1 = document.getElementById('cricketBoardPlayer1');
    const board2 = document.getElementById('cricketBoardPlayer2');
    board1.innerHTML = '';
    board2.innerHTML = '';
    
    cricketNumbers.forEach(num => {
        // Player 1 board
        const cell1 = document.createElement('div');
        cell1.className = 'cricket-number';
        if (cricketMarksPlayer1[num] >= 3) {
            cell1.classList.add('closed');
        }
        cell1.innerHTML = `
            <div class="cricket-num">${num}</div>
            <div class="cricket-marks">${getMarksDisplay(cricketMarksPlayer1[num])}</div>
        `;
        cell1.onclick = () => addMark(1, num);
        board1.appendChild(cell1);

        // Player 2 board
        const cell2 = document.createElement('div');
        cell2.className = 'cricket-number';
        if (cricketMarksPlayer2[num] >= 3) {
            cell2.classList.add('closed');
        }
        cell2.innerHTML = `
            <div class="cricket-num">${num}</div>
            <div class="cricket-marks">${getMarksDisplay(cricketMarksPlayer2[num])}</div>
        `;
        cell2.onclick = () => addMark(2, num);
        board2.appendChild(cell2);
    });

    checkCricketWin();
}

function getMarksDisplay(marks) {
    if (marks === 0) return '';
    if (marks === 1) return '/';
    if (marks === 2) return 'X';
    if (marks >= 3) return '⊗';
    return '';
}

function addMark(player, num) {
    if (player !== currentPlayerCricket) {
        showMessageCricket(`It's Player ${currentPlayerCricket}'s turn!`, 'error');
        return;
    }

    const marks = player === 1 ? cricketMarksPlayer1 : cricketMarksPlayer2;
    
    if (marks[num] < 3) {
        marks[num]++;
        renderCricketBoard();
        
        // Switch players after adding a mark
        currentPlayerCricket = currentPlayerCricket === 1 ? 2 : 1;
        updateCricketPlayerIndicator();
    }
}

function checkCricketWin() {
    const allClosed1 = cricketNumbers.every(num => cricketMarksPlayer1[num] >= 3);
    const allClosed2 = cricketNumbers.every(num => cricketMarksPlayer2[num] >= 3);
    
    if (allClosed1 && allClosed2) {
        showMessageCricket('🎯 TIE! Both players closed all numbers!', 'success');
    } else if (allClosed1) {
        showMessageCricket('🎯 Player 1 WINS! All numbers closed!', 'success');
    } else if (allClosed2) {
        showMessageCricket('🎯 Player 2 WINS! All numbers closed!', 'success');
    }
}

function showMessageCricket(text, type) {
    const msg = document.getElementById('messageCricket');
    msg.textContent = text;
    msg.className = `message show ${type}`;
}

// Allow Enter key for 501 throws
document.addEventListener('DOMContentLoaded', () => {
    renderBulletinFlyers();
    renderHomepageImages();

    // Mobile nav
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navOverlay = document.getElementById('navOverlay');
    const navDrawerClose = document.querySelector('.nav-drawer-close');
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleMobileNav);
    if (navOverlay) navOverlay.addEventListener('click', closeMobileNav);
    if (navDrawerClose) navDrawerClose.addEventListener('click', closeMobileNav);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileNav();
    });

    const totalInput = document.getElementById('throwTotal');
    if (totalInput) {
        totalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                recordThrow501();
            }
        });
    }

    // Initialize gallery
    initGalleryUpload();

    // Contact modal behaviour
    const contactOpenBtn = document.getElementById('contactOpenBtn');
    const contactModal = document.getElementById('contactModal');
    const contactCloseBtn = document.getElementById('contactCloseBtn');
    const contactForm = document.getElementById('contactForm');

    if (contactOpenBtn && contactModal) {
        contactOpenBtn.addEventListener('click', () => {
            contactModal.classList.add('show');
        });
    }

    if (contactCloseBtn && contactModal) {
        contactCloseBtn.addEventListener('click', () => {
            contactModal.classList.remove('show');
        });
    }

    // Close modal when clicking on the dark overlay
    if (contactModal) {
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                contactModal.classList.remove('show');
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

});

// Photo Gallery
const galleryUploadArea = document.getElementById('galleryUploadArea');
const imageInput = document.getElementById('imageInput');
const imageModal = document.getElementById('imageModal');
const imageModalImg = document.getElementById('imageModalImg');
const imageModalClose = document.getElementById('imageModalClose');

function initGalleryUpload() {
    if (!galleryUploadArea) return;

    galleryUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        galleryUploadArea.classList.add('dragover');
    });

    galleryUploadArea.addEventListener('dragleave', () => {
        galleryUploadArea.classList.remove('dragover');
    });

    galleryUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        galleryUploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            displayImages(files);
        }
    });
}

function openImageModal(src, altText) {
    if (!imageModal || !imageModalImg) return;
    imageModalImg.src = src;
    imageModalImg.alt = altText || '';
    imageModal.classList.add('show');
}

if (imageModal && imageModalClose) {
    imageModalClose.addEventListener('click', () => {
        imageModal.classList.remove('show');
    });

    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.classList.remove('show');
        }
    });
}

function loadImages(event) {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
        displayImages(files);
    }
}

function displayImages(files) {
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                addImageToGallery(e.target.result, file.name);
            };
            reader.readAsDataURL(file);
        }
    });
}

function addImageToGallery(imageSrc, imageName) {
    saveImageToStorage(imageSrc, imageName);
    if (document.getElementById('gallery')?.classList.contains('active')) {
        initGalleryFolders();
    }
}

function deleteImage(imageSrc) {
    removeImageFromStorage(imageSrc);
    if (document.getElementById('gallery')?.classList.contains('active')) {
        initGalleryFolders();
    }
}

function saveImageToStorage(imageSrc, imageName) {
    let savedImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
    savedImages.push({ src: imageSrc, name: imageName });
    localStorage.setItem('galleryImages', JSON.stringify(savedImages));
}

function removeImageFromStorage(imageSrc) {
    let savedImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
    savedImages = savedImages.filter(img => img.src !== imageSrc);
    localStorage.setItem('galleryImages', JSON.stringify(savedImages));
}

function loadSavedImages() {
    const savedImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
    savedImages.forEach(img => {
        addImageToGallery(img.src, img.name);
    });
}