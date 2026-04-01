// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
    if (sectionId === 'gallery') {
        sortGalleryBySize();
    }
}

// Sort gallery images so same dimensions are grouped together
function sortGalleryBySize() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    const items = Array.from(galleryGrid.querySelectorAll('.gallery-item'));
    if (items.length === 0) return;

    const getDimensions = (item) => {
        const img = item.querySelector('img');
        if (!img) return Promise.resolve({ item, key: '0x0' });
        return new Promise((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
                const key = `${img.naturalWidth}x${img.naturalHeight}`;
                resolve({ item, key });
            } else {
                img.onload = () => {
                    const key = `${img.naturalWidth}x${img.naturalHeight}`;
                    resolve({ item, key });
                };
                img.onerror = () => resolve({ item, key: '0x0' });
            }
        });
    };

    Promise.all(items.map(getDimensions)).then((results) => {
        results.sort((a, b) => {
            if (a.key !== b.key) return a.key.localeCompare(b.key);
            return 0;
        });
        results.forEach(({ item }) => galleryGrid.appendChild(item));
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
    const totalInput = document.getElementById('throwTotal');
    if (totalInput) {
        totalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                recordThrow501();
            }
        });
    }

    // Initialize gallery drag and drop
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
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your message. The committee will get back to you soon.');
            contactForm.reset();
            if (contactModal) {
                contactModal.classList.remove('show');
            }
        });
    }

    // Enable lightbox on any existing gallery images
    const staticGalleryImages = document.querySelectorAll('#galleryGrid .gallery-item img');
    staticGalleryImages.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => openImageModal(img.src, img.alt));
    });
});

// Photo Gallery
const galleryUploadArea = document.getElementById('galleryUploadArea');
const imageInput = document.getElementById('imageInput');
const galleryGrid = document.getElementById('galleryGrid');
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

    // Load saved images from localStorage
    loadSavedImages();
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
                saveImageToStorage(e.target.result, file.name);
            };
            reader.readAsDataURL(file);
        }
    });
}

function addImageToGallery(imageSrc, imageName) {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.innerHTML = `
        <img src="${imageSrc}" alt="${imageName}">
        <button class="delete-btn" onclick="deleteImage(this)" title="Delete image">×</button>
    `;
    const imgEl = galleryItem.querySelector('img');
    if (imgEl) {
        imgEl.style.cursor = 'pointer';
        imgEl.addEventListener('click', () => openImageModal(imageSrc, imageName));
    }
    galleryGrid.appendChild(galleryItem);
}

function deleteImage(btn) {
    const galleryItem = btn.parentElement;
    const img = galleryItem.querySelector('img');
    const imageSrc = img.src;
    
    // Remove from localStorage
    removeImageFromStorage(imageSrc);
    
    // Remove from DOM
    galleryItem.remove();
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