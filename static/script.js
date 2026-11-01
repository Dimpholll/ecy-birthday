// ---------- LAMP ----------
function toggleLamp() {
    document.getElementById("lamp").classList.toggle("on");
    document.body.classList.toggle("light-on");

    const msg = document.getElementById("message");
    msg.innerHTML = document.body.classList.contains("light-on")
        ? "Thank you!<br>Oh... There's a candle."
        : "Can you open the light, Please";
}

// grab the small candle
document.getElementById("pickup").addEventListener("click", function () {
    document.body.classList.add("candle-mode");
});

// ---------- CANDLE SCENE ----------
const lightBtn = document.getElementById("lightBtn");
const flame = document.getElementById("bigFlame");
const countEl = document.getElementById("count");
const sceneTitle = document.getElementById("sceneTitle");
const candle = document.getElementById("candle");

let micStream = null;

lightBtn.addEventListener("click", async function () {
    const song = document.getElementById("bdSong");
    song.play().then(() => { song.pause(); song.currentTime = 0; }).catch(() => {});

    lightBtn.style.display = "none";
    flame.classList.add("lit");
    sceneTitle.textContent = "Make a wish...";

    // ask for the mic now, so the permission popup appears during the countdown
    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
        micStream = null;   // no mic: she can tap the candle instead
    }

    startCountdown();
});

function startCountdown() {
    const steps = ["1", "2", "3", "Blow!"];
    let i = 0;
    countEl.textContent = steps[0];

    const timer = setInterval(function () {
        i++;
        countEl.textContent = steps[i];

        if (i === steps.length - 1) {
            clearInterval(timer);
            listenForBlow();
        }
    }, 1000);
}

function listenForBlow() {
    // no mic or permission denied: tap the candle instead
    if (!micStream) {
        countEl.textContent = "Tap the candle to blow!";
        candle.style.cursor = "pointer";
        candle.addEventListener("click", blowOut, { once: true });
        return;
    }

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(micStream).connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    const startTime = Date.now();

    function check() {
        analyser.getByteTimeDomainData(data);

        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
        }
        const volume = Math.sqrt(sum / data.length);

        // ignore the first half second, then react to a loud breath
        if (Date.now() - startTime > 500 && volume > 0.2) {
            micStream.getTracks().forEach(t => t.stop());
            blowOut();
            return;
        }
        requestAnimationFrame(check);
    }
    check();
}

function blowOut() {
    flame.classList.remove("lit");
    flame.classList.add("out");
    countEl.textContent = "";

    sceneTitle.style.opacity = "0";      // title fades away
    candle.classList.add("gone");        // candle fades away

    setTimeout(function () {
        document.body.classList.add("birthday-mode");
        document.getElementById("bdSong").play().catch(() => {});
        document.getElementById("bdVideo").play().catch(() => {});

        // start the tree growing
        const tree = document.getElementById("bdTreeFrame");
        tree.src = tree.dataset.src;
    }, 900);
}

// ---------- GO TO FINAL SCENE ----------
document.getElementById("proceedBtn").addEventListener("click", function () {
    document.body.classList.add("final-mode");
    document.getElementById("bdVideo").pause();
    document.getElementById("bdSong").pause();   // stop the birthday song
    document.getElementById("bdTreeFrame").src = "about:blank";   // stop the tree
});

// ---------- POPUPS ----------
const herSong = document.getElementById("herSong");
const disc = document.getElementById("disc");
const playBtn = document.getElementById("playBtn");

function playHerSong() {
    herSong.play().catch(() => {});
    disc.classList.add("spin");
    playBtn.textContent = "⏸ Pause";
}

function pauseHerSong() {
    herSong.pause();
    disc.classList.remove("spin");
    playBtn.textContent = "▶ Play";
}

playBtn.addEventListener("click", function () {
    if (herSong.paused) { playHerSong(); } else { pauseHerSong(); }
});

function closeModals() {
    document.querySelectorAll(".modal").forEach(m => m.classList.remove("open"));
    pauseHerSong();
}

// open a popup when a card is clicked
document.querySelectorAll(".card[data-modal]").forEach(function (card) {
    card.addEventListener("click", function () {
        const id = card.dataset.modal;
        document.getElementById(id).classList.add("open");
        if (id === "musicModal") { playHerSong(); }
    });
});

// close with ✕, by clicking outside the box, or with Esc
document.querySelectorAll(".modal-close").forEach(function (btn) {
    btn.addEventListener("click", closeModals);
});

document.querySelectorAll(".modal").forEach(function (modal) {
    modal.addEventListener("click", function (e) {
        if (e.target === modal) { closeModals(); }
    });
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeModals(); }
});

// ---------- TULIPS ----------
const tulips = document.querySelectorAll(".bq-tulip");
const flowerNote = document.getElementById("flowerNote");
const bq = document.querySelector(".bq");

function floatHeart(e) {
    const box = bq.getBoundingClientRect();
    const h = document.createElement("span");
    h.className = "float-heart";
    h.textContent = "💗";
    h.style.left = (e.clientX - box.left) + "px";
    h.style.top = (e.clientY - box.top) + "px";
    bq.appendChild(h);
    setTimeout(function () { h.remove(); }, 1500);
}

tulips.forEach(function (tulip) {
    tulip.addEventListener("click", function (e) {
        if (!tulip.classList.contains("bloom")) { floatHeart(e); }
        tulip.classList.add("bloom");

        if (document.querySelectorAll(".bq-tulip.bloom").length === tulips.length) {
            flowerNote.textContent = "These are for you. 🌷";
        }
    });
});