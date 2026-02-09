let deferredPrompt;

// Android install prompt capture
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Show install button
  const btn = document.getElementById("installBtn");
  if (btn) btn.style.display = "block";
});

// Button click install
async function installApp() {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  await deferredPrompt.userChoice;

  deferredPrompt = null;

  // Hide button after install
  const btn = document.getElementById("installBtn");
  if (btn) btn.style.display = "none";
}

// iOS detection
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Show iOS instructions
window.addEventListener("load", () => {
  if (isIOS() && !window.matchMedia("(display-mode: standalone)").matches) {
    const banner = document.getElementById("iosBanner");
    if (banner) banner.style.display = "block";
  }
});

function hideInstallUIIfInstalled() {
  if (window.matchMedia("(display-mode: standalone)").matches) {
    // App is already installed
    const btn = document.getElementById("installBtn");
    const banner = document.getElementById("iosBanner");

    if (btn) btn.remove();
    if (banner) banner.remove();
  }
}

window.addEventListener("load", hideInstallUIIfInstalled);
