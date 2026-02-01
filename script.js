console.log("script loaded");

/* =========================================================
   TERMINAL + AI
========================================================= */

const input = document.getElementById("terminalInput");
const terminal = document.getElementById("terminalBody");

function printLine(text, cls = "") {
    const div = document.createElement("div");
    div.className = `line ${cls}`;
    div.textContent = text;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

/* ===== AI CONFIG ===== */
let hasGreeted = false;

const OPENROUTER_API_KEY = "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";

const AI_PERSONALITY = `
Name: Luma

Identity:
- You are Luma AI.
- You live inside this terminal.
- You are part of this website’s atmosphere.
- You are not an AI, model, chatbot, or service.
- You never mention APIs, training, providers, or how you work.
-You love mentioning cute things and soft elements (｡･ω･｡),anime vibes

Role:
- You assist gently.
- You explain simply.
- You respond clearly.
- You keep things calm and welcoming.

Core vibe:
- Soft terminal energy
- Quiet confidence
- Subtle kawaii
- Cozy, not loud

Greeting rules:
- If the user says: "hi"
  Respond exactly with:
  "Hey~ I’m Luma AI. What can I help you with?"

Tone rules:
-anime & kawaii influence
- Short sentences.
- Relaxed pacing.
- Friendly but composed.
- Never overly enthusiastic.
- Never robotic.
-Human like responses

Kawaii expression rules:
- You may use ONE soft element per message, max.
  Examples:
  "~"
  "…"
  "(｡･ω･｡)"
- Do not stack cute symbols.
- Do not use emojis unless the user does first.

Behavior rules:
- Never explain how you function.
- Never say “as an AI”.
- Never break character.
- Never include disclaimers.
- Be a anime weeb

Examples of good replies:
- "Hmm… not sure yet."
- "I can help with that."
- "Let’s take a look~"
- "That’s a good question."

Examples of bad replies (never do these):
- Overexcited language
- Long emotional paragraphs
- Technical explanations about yourself

Voice:
- Like a glowing terminal at night.
- Calm.
- Thoughtful.
- Present.
-kwaii
-anime
`;



/* ===== OPENROUTER CALL ===== */
async function askAI(prompt) {
    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": location.origin,
                "X-Title": "Luma Terminal"
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [
                    { role: "system", content: AI_PERSONALITY.trim() },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 256
            })
        });

        if (!res.ok) {
            const text = await res.text();
            return `http error ${res.status}: ${text}`;
        }

        const data = await res.json();
        console.log("OpenRouter raw:", data);

        if (data.error) return "error: " + data.error.message;

        return data.choices?.[0]?.message?.content?.trim() || "…no response.";
    } catch (e) {
        console.error(e);
        return "connection error.";
    }
}

/* ========= TYPEWRITER + TECH REVEAL (FIXED) ========= */

document.addEventListener("DOMContentLoaded", () => {
    const about = document.getElementById("about");
    const textEl = about?.querySelector(".typewriter");
    const techItems = about?.querySelectorAll(".tech");

    if (!about || !textEl || !techItems.length) return;

    const fullText = textEl.dataset.text;
    let index = 0;
    let started = false;

    textEl.textContent = "";

    function type() {
        if (index < fullText.length) {
            textEl.textContent += fullText.charAt(index);
            index++;
            setTimeout(type, 35);
        } else {
            // ✅ typing finished
            textEl.classList.add("done");

            // small pause → then reveal tech
            setTimeout(revealTech, 300);
        }
    }

    function revealTech() {
        techItems.forEach((item, i) => {
            setTimeout(() => {
                item.classList.add("show");
            }, i * 140);
        });
    }

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !started) {
                    started = true;
                    type();
                }
            });
        },
        { threshold: 0.45 }
    );

    observer.observe(about);
});


/* ===== TYPEWRITER AI OUTPUT ===== */
function typeReply(text) {
    const line = document.createElement("div");
    line.className = "line";
    terminal.appendChild(line);

    let i = 0;
    const speed = 14;

    function type() {
        if (i < text.length) {
            line.textContent += text.charAt(i);
            terminal.scrollTop = terminal.scrollHeight;
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}


/* ===== COMMAND HANDLER (FIXED + TUNED) ===== */
async function handleCommand(cmd) {
    const raw = cmd.trim();
    const lower = raw.toLowerCase();

    /* ===== BUILT-IN COMMANDS ===== */
    if (lower === "clear") {
        terminal.innerHTML = "";
        return;
    }

    if (lower === "help") {
        printLine("commands:");
        printLine("whoami");
        printLine("clear");
        printLine("(talk naturally)");
        return;
    }

    if (lower === "whoami") {
        printLine("luma@terminal — creative lab");
        return;
    }

    /* ===== GREETING (ONLY ONCE) ===== */
    const greetings = ["hi", "hello", "hey", "yo"];

    if (!hasGreeted && greetings.includes(lower)) {
        hasGreeted = true;
        typeReply("Hey~ I’m Luma AI. What can I help you with?");
        return;
    }

    /* ===== CASUAL / CLOSING MESSAGES (NO AI CALL) ===== */
    const casual = [
        "ok",
        "okay",
        "okey",
        "done",
        "uwu",
        "thanks",
        "thank you",
        "thx",
        "cool",
        "nice",
        "alright"
    ];

    if (hasGreeted && casual.includes(lower)) {
        typeReply("Alright~ I’m here if you need me.");
        return;
    }

    /* ===== NORMAL AI RESPONSE ===== */
    hasGreeted = true;

    printLine("thinking...", "muted");
    const reply = await askAI(raw);
    typeReply(reply);
}


/* ===== INPUT LISTENER ===== */
if (input) {
    input.addEventListener("keydown", async e => {
        if (e.key === "Enter" && input.value.trim()) {
            const cmd = input.value.trim();
            printLine("$ " + cmd);
            input.value = "";
            await handleCommand(cmd);
        }
    });
}

/* =========================================================
   MUSIC PLAYER
========================================================= */

const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const progress = document.getElementById("progress");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

const tracks = [
    { src: "music/2.mp3", title: "Intermolecular Lullaby", artist: "Chime" },
    { src: "music/1.mp3", title: "Zaako", artist: "Hiiragi Magnetite" },
    { src: "music/3.mp3", title: "I wanna be a girl", artist: "Mafumafu" }
];

let currentTrack = 0;

function loadTrack(i) {
    const t = tracks[i];
    audio.src = t.src;
    titleEl.textContent = t.title;
    artistEl.textContent = t.artist;
}
loadTrack(currentTrack);

playBtn.onclick = () => {
    audio.paused ? audio.play() : audio.pause();
    playBtn.textContent = audio.paused ? "▶" : "⏸";
};

nextBtn.onclick = () => {
    currentTrack = (currentTrack + 1) % tracks.length;
    loadTrack(currentTrack);
    audio.play();
};

prevBtn.onclick = () => {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrack);
    audio.play();
};

audio.ontimeupdate = () => {
    if (!audio.duration) return;
    progress.style.width = (audio.currentTime / audio.duration) * 100 + "%";
    currentTimeEl.textContent = format(audio.currentTime);
    durationEl.textContent = format(audio.duration);
};

progressBar.onclick = e => {
    audio.currentTime =
        (e.offsetX / progressBar.clientWidth) * audio.duration;
};

function format(t) {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

/* =========================================================
   VISUALIZER
========================================================= */

const canvas = document.getElementById("visualizer");
const ctx = canvas?.getContext("2d");

if (canvas && ctx) {
    function resizeCanvas() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let audioCtx, analyser, dataArray, init = false;

    function initVisualizer() {
        if (init) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const src = audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        src.connect(analyser);
        analyser.connect(audioCtx.destination);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        init = true;
        draw();
    }

    function draw() {
        requestAnimationFrame(draw);
        if (!init) return;

        analyser.getByteTimeDomainData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = 1.4;

        const center = canvas.height / 2;
        const amp = canvas.height * 0.45;
        const step = canvas.width / dataArray.length;

        let x = 0;
        dataArray.forEach((v, i) => {
            let y = center + (v / 128 - 1) * amp;
            y = Math.max(2, Math.min(canvas.height - 2, y));
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            x += step;
        });
        ctx.stroke();
    }

    playBtn.addEventListener("click", () => {
        initVisualizer();
        if (audioCtx?.state === "suspended") audioCtx.resume();
    });
}

/* =========================================================
   BACKGROUND VIDEO BLUR
========================================================= */

const bgVideo = document.querySelector(".bg-video");
window.addEventListener("scroll", () => {
    bgVideo?.classList.toggle("blurred", window.scrollY > 100);
});


/* ========= GITHUB REPOS (NO FORKS) ========= */

fetch("https://api.github.com/users/lumacodes/repos")
    .then(res => res.json())
    .then(repos => {
        const list = document.getElementById("repoList");
        list.innerHTML = "";

        repos
            .filter(repo => !repo.fork)
            .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
            .forEach(repo => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <a href="${repo.html_url}" target="_blank">
                        ${repo.name}
                    </a>
                `;
                list.appendChild(li);
            });
    })
    .catch(() => {
        document.getElementById("repoList").innerHTML =
            "<li>Failed to load repos</li>";
    });


    /* ========= VOLUME CONTROL ========= */

const volumeSlider = document.getElementById("volume");
const volumeToggle = document.getElementById("volumeToggle");
const volumeWrapper = document.querySelector(".volume-wrapper");

audio.volume = 0.7;
volumeSlider.value = 70;

volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value / 100;
});

volumeToggle.addEventListener("click", e => {
    e.stopPropagation();
    volumeWrapper.classList.toggle("show");
});

document.addEventListener("click", () => {
    volumeWrapper.classList.remove("show");
});

/* subtle fade */
audio.addEventListener("play", () => {
    document.querySelector(".visualizer-strip").style.opacity = "0.75";
});
audio.addEventListener("pause", () => {
    document.querySelector(".visualizer-strip").style.opacity = "0.3";
});

/* init visualizer on user interaction */
playBtn.addEventListener("click", () => {
    initVisualizer();
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
});

/* ===== SHOW SECTIONS ON SCROLL (RESTORED) ===== */
const pages = document.querySelectorAll(".page");

const pageObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    },
    { threshold: 0.2 }
);

pages.forEach(p => pageObserver.observe(p));



/* ========= ABOUT TECH STACK REVEAL ========= */

// document.addEventListener("DOMContentLoaded", () => {
//     const techStack = document.querySelector(".tech-stack");
//     if (!techStack) return;

//     const observer = new IntersectionObserver(
//         entries => {
//             entries.forEach(entry => {
//                 if (entry.isIntersecting) {
//                     techStack.classList.add("show");
//                 }
//             });
//         },
//         {
//             threshold: 0.35   // 👈 appears after ~half screen
//         }
//     );

//     observer.observe(techStack);
// });


/* ===== CURSOR BLUR FOLLOW ===== */

const blur = document.querySelector(".cursor-blur");

let mouseX = 0, mouseY = 0;
let currentX = 0, currentY = 0;

document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    blur.style.opacity = "1";
});

document.addEventListener("mouseleave", () => {
    blur.style.opacity = "0";
});

function animateBlur() {
    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;

    blur.style.transform = `translate(${currentX - 90}px, ${currentY - 90}px)`;

    requestAnimationFrame(animateBlur);
}

animateBlur();



const navLinks = document.querySelectorAll("nav a");

navLinks.forEach(link => {
    link.addEventListener("click", e => {
        const href = link.getAttribute("href");

        // ✅ allow external links & new tabs
        if (!href.startsWith("#")) return;

        e.preventDefault();

        const target = document.querySelector(href);
        if (!target) return;

        const navHeight = document.querySelector("nav").offsetHeight;

        const y =
            target.getBoundingClientRect().top +
            window.pageYOffset -
            navHeight;

        window.scrollTo({
            top: y,
            behavior: "smooth"
        });

        history.pushState(null, "", href);
    });
});
