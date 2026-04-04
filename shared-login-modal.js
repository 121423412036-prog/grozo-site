(function () {
  if (window.__sharedLoginModalInitialized) return;
  window.__sharedLoginModalInitialized = true;

  const config = window.SharedLoginModalConfig || {};

  function injectStyles() {
    if (document.getElementById('sharedLoginModalStyles')) return;
    const style = document.createElement('style');
    style.id = 'sharedLoginModalStyles';
    style.textContent = `
      .login-modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.4); display:none; align-items:center; justify-content:center; z-index:145; padding:16px; }
      .login-modal-backdrop.active { display:flex; animation:sharedLoginFadeIn 0.3s ease-in; }
      @keyframes sharedLoginFadeIn { from { opacity:0; } to { opacity:1; } }

      .login-modal {
        width: min(700px, 92vw);
        min-height: 450px;
        display: flex;
        border-radius: 12px;
        overflow: hidden;
        background: #fff;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        position: relative;
      }
      .login-modal-close {
        position: absolute;
        top: 10px;
        right: 12px;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        cursor: pointer;
        z-index: 5;
      }
      .login-modal-left {
        width: 65%;
        background: linear-gradient(135deg, #6a0dad, #8e2de2);
        color: #fff;
        padding: 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .login-modal-right {
        width: 35%;
        padding: 40px;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 12px;
      }
      .login-brand-title { font-size:32px; margin-bottom:12px; }
      .login-brand-logo { width:150px; height:auto; display:block; margin-bottom:24px; }
      .login-brand-subtitle { font-size:24px; font-weight:700; line-height:1.25; opacity:0.95; margin-bottom:18px; }
      .input-box { background:#fff; border-radius:30px; padding:12px; display:flex; align-items:center; gap:10px; }
      .input-box span { color:#111; font-weight:600; }
      .input-box input { border:none; outline:none; width:100%; font-size:16px; background:transparent; }
      .login-consent { margin-top:30px; text-align:center; font-size:13px; line-height:1.5; color:rgba(255,255,255,0.95); }
      .login-consent a { color:#4800bd; text-decoration:underline; font-weight:600; }
      .login-btn { margin-top:20px; background:#ff007a; color:#fff; border:none; padding:12px; width:100%; border-radius:30px; font-size:16px; font-weight:600; cursor:pointer; }

      .otp-container { display:none; padding-top:10px; }
      .otp-back-arrow { position:absolute; top:20px; left:24px; border:none; background:transparent; padding:0; cursor:pointer; line-height:0; z-index:5; }
      .otp-note { margin-bottom:14px; }
      .otp-inputs { display:flex; gap:10px; margin-top:20px; justify-content:center; }
      .otp-inputs input { width:40px; height:40px; border-radius:50%; text-align:center; font-size:18px; border:none; outline:none; color:#111; background:#fff; }
      .otp-inputs input:focus { box-shadow:0 0 0 2px rgba(255,0,122,0.35); }
      .timer { margin-top:20px; font-size:20px; font-weight:600; text-align:center; }
      .otp-resend-row { margin-top:26px; text-align:center; font-size:14px; color:#fff; }
      .otp-resend-link { border:none; background:transparent; color:#fff; text-decoration:underline; font-size:15px; font-weight:600; cursor:pointer; padding:0; }
      .login-modal-right h2 { color:#5a0dab; }
      .store-badge { width:150px; height:auto; }

      @media (max-width:900px) {
        .login-modal { min-height: auto; flex-direction: column; }
        .login-modal-left,
        .login-modal-right { width:100%; padding:24px; }
        .otp-inputs { gap:8px; }
        .otp-inputs input { width:36px; height:36px; }
      }
    `;
    document.head.appendChild(style);
  }

  function injectMarkup() {
    const old = document.getElementById('loginModalBackdrop');
    if (old) old.remove();

    const rightTitle = config.rightTitle || 'Order faster & easier every time';
    const rightSubtitle = config.rightSubtitle || 'with Grozo App';

    const html = `
      <div id="loginModalBackdrop" class="login-modal-backdrop" onclick="closeLoginModal(event)">
        <div class="login-modal" onclick="event.stopPropagation();">
          <button class="login-modal-close" onclick="closeLoginModal()" aria-label="Close login modal">
            <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M18 6L6 18M6 6l12 12" stroke="black" stroke-width="3.5" stroke-linecap="round"/>
            </svg>
          </button>

          <div class="login-modal-left">
            <div id="loginBox">
              <img src="grozo logo.png" alt="Grozo" class="login-brand-logo" />
              <p class="login-brand-subtitle">Lowest Prices Everyday in minutes</p>

              <div class="input-box">
                <span>+91</span>
                <input type="tel" id="phoneInput" placeholder="Enter Phone Number" maxlength="10" inputmode="numeric" />
              </div>
              <button class="login-btn" onclick="sendOTP()">Continue</button>
              <p class="login-consent">
                By continuing, you agree to our<br>
                <a href="terms-and-conditions.html" target="_blank" rel="noopener">Terms of Service</a> &amp;
                <a href="privacy-note.html" target="_blank" rel="noopener">Privacy Policy</a>
              </p>
            </div>

            <div id="otpBox" class="otp-container">
              <button class="otp-back-arrow" onclick="backToPhoneLogin()" aria-label="Back to phone input">
                <svg width="30" height="30" viewBox="0 0 30 24" aria-hidden="true" focusable="false">
                  <path d="M25 12H8" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>
                  <path d="M12 6L6 12L12 18" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </svg>
              </button>
              <h1 class="login-brand-title">OTP Verification</h1>
              <p class="otp-note">OTP sent to <span id="showNumber"></span></p>

              <div class="otp-inputs" id="otpInputs">
                <input maxlength="1" inputmode="numeric" />
                <input maxlength="1" inputmode="numeric" />
                <input maxlength="1" inputmode="numeric" />
                <input maxlength="1" inputmode="numeric" />
                <input maxlength="1" inputmode="numeric" />
                <input maxlength="1" inputmode="numeric" />
              </div>

              <div class="timer" id="otpTimer">00:30</div>
              <button class="login-btn" onclick="verifyOTP()">Verify</button>
            </div>
          </div>

          <div class="login-modal-right">
            <h2>${rightTitle}</h2>
            <p>${rightSubtitle}</p>
            <img class="store-badge" src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" />
            <img class="store-badge" src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" />
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
  }

  let otpTimerInterval;
  let currentPhone;
  let confirmationResult;

  function getOtpInputs() {
    return Array.from(document.querySelectorAll('#otpInputs input'));
  }

  function clearOtpInputs() {
    getOtpInputs().forEach((input) => {
      input.value = '';
    });
  }

  function getEnteredOtp() {
    return getOtpInputs().map((input) => input.value.trim()).join('');
  }

  function focusFirstOtpInput() {
    const inputs = getOtpInputs();
    if (inputs.length) inputs[0].focus();
  }

  function initOtpInputAutoAdvance() {
    const wrapper = document.getElementById('otpInputs');
    if (!wrapper || wrapper.dataset.bound === 'true') return;

    const inputs = getOtpInputs();
    inputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 1);
        if (input.value && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace' && !input.value && index > 0) {
          inputs[index - 1].focus();
        }
      });
    });

    wrapper.dataset.bound = 'true';
  }

  function startOTPTimer() {
    clearInterval(otpTimerInterval);
    let seconds = 30;
    const timerElement = document.getElementById('otpTimer');
    if (!timerElement) return;
    timerElement.textContent = '00:30';

    otpTimerInterval = setInterval(() => {
      const secText = seconds < 10 ? '0' + seconds : String(seconds);
      timerElement.textContent = `00:${secText}`;
      seconds -= 1;

      if (seconds < 0) {
        clearInterval(otpTimerInterval);
        timerElement.innerHTML = '<div class="otp-resend-row">Didn\'t get it? <button class="otp-resend-link" type="button" onclick="resendOTP()">Resend OTP(SMS)</button></div>';
      }
    }, 1000);
  }

  window.openLoginModal = function () {
    const backdrop = document.getElementById('loginModalBackdrop');
    if (backdrop) backdrop.classList.add('active');
    const phoneInput = document.getElementById('phoneInput');
    if (phoneInput) phoneInput.value = '';
    clearOtpInputs();
    document.getElementById('loginBox').style.display = 'block';
    document.getElementById('otpBox').style.display = 'none';
    confirmationResult = null;
    initOtpInputAutoAdvance();
  };

  window.closeLoginModal = function (e) {
    if (e && e.target !== e.currentTarget) return;
    const backdrop = document.getElementById('loginModalBackdrop');
    if (backdrop) backdrop.classList.remove('active');
    clearInterval(otpTimerInterval);
    document.getElementById('loginBox').style.display = 'block';
    document.getElementById('otpBox').style.display = 'none';
    confirmationResult = null;
    clearOtpInputs();
  };

  window.sendOTP = function () {
    const phoneInput = document.getElementById('phoneInput');
    const phone = (phoneInput ? phoneInput.value : '').trim();

    if (!/^\d{10}$/.test(phone)) {
      alert('Enter valid phone number');
      return;
    }

    if (!window.firebase || !firebase.auth) {
      alert('Firebase OTP is not configured yet. Please check Firebase setup.');
      return;
    }

    try {
      // 🔒 Create reCAPTCHA only ONCE - never clear/recreate
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
          size: 'invisible'
        });
        window.recaptchaVerifier.render();
        console.log('✓ reCAPTCHA created for phone auth');
      } else {
        console.log('✓ reCAPTCHA already exists, reusing');
      }
    } catch (err) {
      console.warn('reCAPTCHA setup error:', err.message);
      alert('Error setting up security verification. Please try again.');
      return;
    }

    const fullPhone = '+91' + phone;
    currentPhone = phone;

    firebase.auth().signInWithPhoneNumber(fullPhone, window.recaptchaVerifier)
      .then(function (result) {
        confirmationResult = result;

        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('otpBox').style.display = 'block';
        document.getElementById('showNumber').textContent = '+91 ' + phone;

        clearOtpInputs();
        focusFirstOtpInput();
        startOTPTimer();

        console.log('OTP SENT');
      })
      .catch(function (error) {
        console.error(error);
        alert(error.message || 'Failed to send OTP');
      });
  };

  window.resendOTP = function () {
    if (!currentPhone) {
      alert('Please enter phone number first');
      window.backToPhoneLogin();
      return;
    }
    if (!window.firebase || !firebase.auth) {
      alert('Firebase OTP is not configured yet. Please check Firebase setup.');
      return;
    }

    try {
      // 🔒 Ensure reCAPTCHA exists, create only if needed
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
          size: 'invisible'
        });
        window.recaptchaVerifier.render();
        console.log('✓ reCAPTCHA created for resend');
      } else {
        console.log('✓ reCAPTCHA exists, reusing for resend');
      }
    } catch (err) {
      console.warn('reCAPTCHA setup error on resend:', err.message);
      alert('Error setting up security verification. Please try again.');
      return;
    }

    firebase.auth().signInWithPhoneNumber('+91' + currentPhone, window.recaptchaVerifier)
      .then(function (result) {
        confirmationResult = result;
        clearOtpInputs();
        focusFirstOtpInput();
        startOTPTimer();
      })
      .catch(function (error) {
        console.error(error);
        alert(error.message || 'Failed to resend OTP');
      });
  };

  window.verifyOTP = function () {
    const enteredOTP = getEnteredOtp();
    if (!/^\d{6}$/.test(enteredOTP)) {
      alert('Please enter valid 6-digit OTP');
      return;
    }

    if (!confirmationResult) {
      alert('Please request OTP first');
      return;
    }

    confirmationResult.confirm(enteredOTP)
      .then(function (result) {
        const user = result.user;
        const existing = JSON.parse(localStorage.getItem('grozo_user') || 'null') || {};
        const userData = {
          name: existing.name || 'Grozo User',
          phone: user.phoneNumber || ('+91' + currentPhone),
          uid: user.uid,
          email: existing.email || '',
          picture: existing.picture || ''
        };

        localStorage.setItem('grozo_user', JSON.stringify(userData));

        if (typeof config.onLoginSuccess === 'function') {
          config.onLoginSuccess(userData);
        }

        alert('Login Successful ✅');
        window.closeLoginModal();
      })
      .catch(function (error) {
        console.error(error);
        alert('Invalid OTP ❌');
      });
  };

  window.backToPhoneLogin = function () {
    clearInterval(otpTimerInterval);
    document.getElementById('otpBox').style.display = 'none';
    document.getElementById('loginBox').style.display = 'block';
    clearOtpInputs();
  };

  function init() {
    injectStyles();
    injectMarkup();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
