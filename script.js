// Alpaca Customizer Logic
const alpacaParts = {
    backgrounds: ['blue50.png', 'blue60.png', 'blue70.png', 'darkblue30.png', 'darkblue50.png', 'darkblue70.png', 'green50.png', 'green60.png', 'green70.png', 'grey40.png', 'grey70.png', 'grey80.png', 'red50.png', 'red60.png', 'red70.png', 'yellow50.png', 'yellow60.png', 'yellow70.png'],
    accessories: ['earings.png', 'flower.png', 'glasses.png', 'headphone.png'],
    ears: ['default.png', 'tilt-backward.png', 'tilt-forward.png'],
    eyes: ['default.png', 'angry.png', 'naughty.png', 'panda.png', 'smart.png', 'star.png'],
    hair: ['default.png', 'bang.png', 'curls.png', 'elegant.png', 'fancy.png', 'quiff.png', 'short.png'],
    leg: ['default.png', 'bubble-tea.png', 'cookie.png', 'game-console.png', 'tilt-backward.png', 'tilt-forward.png'],
    mouth: ['default.png', 'astonished.png', 'eating.png', 'laugh.png', 'tongue.png'],
    neck: ['default.png', 'bend-backward.png', 'bend-forward.png', 'thick.png'],
    nose: ['nose.png']
};

let currentSelection = {};
for (const part in alpacaParts) {
    currentSelection[part] = alpacaParts[part][0];
}
currentSelection.name = 'Unnamed Alpaca';

const historyStack = [];
const alpacaPreview = document.getElementById('alpaca-preview');
const customizationControls = document.getElementById('customization-controls');
const randomizeBtn = document.getElementById('randomize');
const downloadBtn = document.getElementById('download');
const saveBtn = document.getElementById('save-favorite');
const loadSelect = document.getElementById('load-favorite');
const undoBtn = document.getElementById('undo');
const alpacaNameInput = document.getElementById('alpaca-name-input');
const alpacaNameDisplay = document.createElement('div');
alpacaNameDisplay.id = 'alpaca-name-display';
alpacaPreview.appendChild(alpacaNameDisplay);

alpacaNameInput.addEventListener('input', (e) => {
    const alpacaName = e.target.value.trim() || 'Unnamed Alpaca';
    currentSelection.name = alpacaName;
    alpacaNameDisplay.textContent = alpacaName;
    createAlpaca();
});

if (currentSelection.name) {
    alpacaNameInput.value = currentSelection.name;
    alpacaNameDisplay.textContent = currentSelection.name;
}

function createAlpaca() {
    alpacaPreview.innerHTML = '';
    historyStack.push({ ...currentSelection });
    if (historyStack.length > 50) historyStack.shift();
    alpacaNameDisplay.textContent = currentSelection.name || 'Unnamed Alpaca';
    for (const part in alpacaParts) {
        const filename = currentSelection[part];
        const img = document.createElement('img');
        img.src = `assets/${part}/${filename}`;
        img.classList.add(part);
        img.onload = () => alpacaPreview.appendChild(img);
        img.onerror = () => console.warn(`Missing: ${img.src}`);
    }
}

function createCustomizationDropdowns() {
    customizationControls.innerHTML = '';
    const groupMap = {
        "Head": ["hair", "ears", "eyes", "nose", "mouth"],
        "Body": ["neck", "leg", "accessories"],
        "Background": ["backgrounds"]
    };

    for (const group in groupMap) {
        const groupWrapper = document.createElement('div');
        groupWrapper.classList.add('customizer-group');
        const header = document.createElement('div');
        header.classList.add('accordion-header');
        header.textContent = group;
        header.addEventListener('click', () => {
            groupWrapper.classList.toggle('open');
        });
        const content = document.createElement('div');
        content.classList.add('accordion-content');
        const partList = groupMap[group];
        partList.forEach(part => {
            if (!alpacaParts[part]) return;
            const wrapper = document.createElement('div');
            wrapper.classList.add('customizer-item');
            const label = document.createElement('label');
            label.textContent = part.charAt(0).toUpperCase() + part.slice(1);
            label.setAttribute('for', `${part}-select`);
            const select = document.createElement('select');
            select.name = part;
            select.id = `${part}-select`;
            alpacaParts[part].forEach(filename => {
                const option = document.createElement('option');
                option.value = filename;
                option.textContent = filename.replace('.png', '').replace(/-/g, ' ');
                select.appendChild(option);
            });
            select.value = currentSelection[part] || alpacaParts[part][0];
            select.addEventListener('change', (e) => {
                e.stopPropagation();
                currentSelection[part] = e.target.value;
                createAlpaca();
            });
            const resetButton = document.createElement('button');
            resetButton.textContent = 'Reset';
            resetButton.classList.add('reset-button');
            resetButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const defaultOption = alpacaParts[part][0];
                currentSelection[part] = defaultOption;
                select.value = defaultOption;
                createAlpaca();
            });
            wrapper.appendChild(label);
            wrapper.appendChild(select);
            wrapper.appendChild(resetButton);
            content.appendChild(wrapper);
        });
        groupWrapper.appendChild(header);
        groupWrapper.appendChild(content);
        customizationControls.appendChild(groupWrapper);
    }
}

function updateDropdownSelections() {
    const selects = customizationControls.querySelectorAll('select');
    selects.forEach(select => {
        const part = select.name;
        select.value = currentSelection[part];
    });
}

function updateFavoritesDropdown() {
    const currentUser = localStorage.getItem ('currentUser');
    const key = `favorites_${currentUser}`;
    const favorites = JSON.parse(localStorage.getItem(key)) || {};
    loadSelect.innerHTML = `<option value="">⭐ Load Favorite</option>`;
    for (const name in favorites) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        loadSelect.appendChild(option);
    }
}

function randomizeAlpaca() {
    for (const part in alpacaParts) {
        const options = alpacaParts[part];
        currentSelection[part] = options[Math.floor(Math.random() * options.length)];
    }
    createAlpaca();
    updateDropdownSelections();
}

randomizeBtn.addEventListener('click', randomizeAlpaca);

downloadBtn.addEventListener('click', () => {
    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
        showAuthModal();
        return;
    }

    // Ensure images are fully loaded before capturing
    const images = alpacaPreview.querySelectorAll('img');
    const allLoaded = Array.from(images).every(img => img.complete && img.naturalHeight !== 0);

    if (!allLoaded) {
        alert("Please wait for all images to load before downloading.");
        return;
    }
    

    html2canvas(alpacaPreview, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null  // optional: make background transparent
    }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = (currentSelection.name || 'alpaca-avatar') + '.png';
        document.body.appendChild(link);  // Required for Firefox
        link.click();
        document.body.removeChild(link);
    }).catch(err => {
        console.error("Error generating image:", err);
        alert("There was a problem generating the image.");
    });
});



saveBtn.addEventListener('click', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showAuthModal();
    } else {
        const nameInput = alpacaNameInput.value.trim();
        if (!nameInput) {
            alert("Please enter a name for your alpaca before saving.");
            return;
        }

        const key = `favorites_${currentUser}`;
        const favorites = JSON.parse(localStorage.getItem('key')) || {};
        favorites[nameInput] = { ...currentSelection };
        localStorage.setItem(key, JSON.stringify(favorites));
        alert('Favorite saved successfully!');
        updateFavoritesDropdown();
    }
});

loadSelect.addEventListener('change', () => {
    const currentUser = localStorage.getItem('currentUser');
    const key = `favorites_${currentUser}`;
    const favorites = JSON.parse(localStorage.getItem(key)) || {};
    const selected = loadSelect.value;
    if (favorites[selected]) {
        currentSelection = { ...favorites[selected] };
        createAlpaca();
        updateDropdownSelections();
    }
});

undoBtn.addEventListener('click', () => {
    if (historyStack.length > 1) {
        historyStack.pop();
        currentSelection = historyStack.pop();
        createAlpaca();
        updateDropdownSelections();
    } else {
        alert("Nothing to undo!");
    }
});

// Theme toggle
const themeSwitch = document.getElementById('theme-switch');
const themeLabel = document.getElementById('theme-label');
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    themeSwitch.checked = true;
    themeLabel.textContent = '🌙 Dark Mode';
}
themeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('dark');
    const mode = document.body.classList.contains('dark') ? 'dark' : 'light';
    themeLabel.textContent = mode === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode';
    localStorage.setItem('theme', mode);
});

// Auth modal
const authModal = document.getElementById('auth-modal');
const closeBtn = document.getElementById('modal-close');
const showSignUpLink = document.getElementById('show-sign-up');
const showSignInLink = document.getElementById('show-sign-in');
const signUpWrapper = document.getElementById('sign-up-form-wrapper');
const signInFormWrapper = document.getElementById('sign-in-form');
const signUpForm = document.getElementById('sign-up');
const signInForm = document.getElementById('sign-in');

function showAuthModal() {
    authModal.style.display = 'block';
}

closeBtn.addEventListener('click', () => {
    authModal.style.display = 'none';
});

window.onclick = function (event) {
    if (event.target === authModal) {
        authModal.style.display = 'none';
    }
};

showSignUpLink.addEventListener('click', () => {
    signInFormWrapper.style.display = 'none';
    signUpWrapper.style.display = 'block';
});

showSignInLink.addEventListener('click', () => {
    signUpWrapper.style.display = 'none';
    signInFormWrapper.style.display = 'block';
});

signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const message = document.getElementById('sign-up-message');

    message.textContent = '';// Clear previous

    if (!name || !email || !password || !confirmPassword) {
        message.textContent = "Please fill out all fields.";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || {};

    if (users[email]) {
        message.textContent = "User already exists. Please sign in.";
        return;
    }

    users[email] = { name, password };

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', email);

    /*alert("Sign-Up successful!");*/
    updateProfileDisplay(name, email); 
    authModal.style.display = 'none';
    profileToggle.style.display = "inline-block";
});


signInForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('sign-in-email').value;
    const password = document.getElementById('sign-in-password').value;
    const message = document.getElementById('sign-in-message');

    message.textContent = ''; 

    const users = JSON.parse(localStorage.getItem('users')) || {};


    if (!email || !password) {
        message.textContent = "Please enter email and password.";
        return;
    }

    if (!users[email]) {
        message.textContent = "User not found. Please sign up.";
        return;
    }

    if (users[email].password !== password) {
        message.textContent = "Incorrect password.";
        return;
    }

    const user = users[email];
    localStorage.setItem('currentUser', email);
    message.textContent = "Sign-In successful!";

    updateProfileDisplay(user.name, email); // ✅ show actual name
    authModal.style.display = 'none';
    profileToggle.style.display = "inline-block";
});

const forgotPasswordLink = document.getElementById("forgot-password-link");
const forgotWrapper = document.getElementById("forgot-password-wrapper");
const forgotForm = document.getElementById("forgot-password-form");
const forgotMsg = document.getElementById("forgot-password-msg");
const forgotUserName = document.getElementById("forgot-user-name");

forgotPasswordLink.addEventListener("click", () => {
    signInFormWrapper.style.display = 'none';
    signUpWrapper.style.display = 'none';
    forgotWrapper.style.display = 'block';
    forgotForm.reset();
    forgotUserName.textContent = "";
    forgotMsg.textContent = "";
});

forgotForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Reset password form submitted"); // Add this line

    const email = document.getElementById("forgot-email").value.trim();
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-new-password").value;

    const users = JSON.parse(localStorage.getItem("users")) || {};
    const user = users[email];

    if (!user) {
        showFormMessage(forgotMsg, "User not found.", "error");
        return;
    }
    
    if (!newPassword || !confirmPassword) {
        showFormMessage(forgotMsg, "Please enter and confirm your new password.", "error");
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showFormMessage(forgotMsg, "Passwords do not match.", "error");
        return;
    }
    
    users[email].password = newPassword;
    localStorage.setItem("users", JSON.stringify(users));
    showFormMessage(forgotMsg, "Password reset successful! You can now sign in.", "success");
    

    setTimeout(() => {
        forgotWrapper.style.display = "none";
        signInFormWrapper.style.display = "block";
    }, 3000);
});


function showFormMessage(element, message, type = "info") {
    element.textContent = message;
    element.classList.remove("error", "success", "info");
    element.classList.add(type);

    // Optionally hide after 3 seconds
    setTimeout(() => {
        element.textContent = "";
        element.classList.remove("error", "success", "info");
    }, 3000);
}




// Profile

function updateProfileDisplay(name, email) {
    document.getElementById('profile-name').textContent = name;
    document.getElementById('profile-email').textContent = email;
}


document.getElementById("profile-toggle").addEventListener("click", () => {
    const profile = document.getElementById("user-profile");
    profile.style.display = profile.style.display === "none" ? "block" : "none";
    const userEmail = localStorage.getItem("currentUser");
    if (userEmail) {
        document.getElementById("profile-email").textContent = userEmail;
    }
});

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    document.getElementById("user-profile").style.display = "none";
    document.getElementById("profile-toggle").style.display = "none";
    /*alert("You’ve been logged out!");*/
    location.reload();
});

document.getElementById("delete-profile-btn").addEventListener("click", () => {
    const currentUserEmail = localStorage.getItem("currentUser");
    if (!currentUserEmail) return;

    const users = JSON.parse(localStorage.getItem("users")) || {};
    if (users[currentUserEmail]) {
        delete users[currentUserEmail];
        localStorage.setItem("users", JSON.stringify(users));
    }

    // Clear session and reload UI
    localStorage.removeItem("currentUser");
    document.getElementById("user-profile").style.display = "none";
    document.getElementById("profile-toggle").style.display = "none";
    showFormMessage(document.getElementById("user-profile"), "Your profile has been deleted.", "success");
    setTimeout(() => {
        location.reload(); // Optional: refresh the page after 2 sec
    }, 2000);
});


// Show profile button if logged in
const profileToggle = document.getElementById("profile-toggle");
const currentUserEmail = localStorage.getItem("currentUser");

if (currentUserEmail) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const currentUser = users[currentUserEmail];
    if (currentUser) {
        updateProfileDisplay(currentUser.name, currentUserEmail);
        profileToggle.style.display = "inline-block";
    }
} 


// Init
updateFavoritesDropdown();
createCustomizationDropdowns();
createAlpaca();
