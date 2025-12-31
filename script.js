let allLogLines = [];

function formatLogs() {
    const input = document.getElementById("logInput").value;
    const output = document.getElementById("logOutput");
    output.innerHTML = "";
    allLogLines = [];

    if (!input.trim()) return;

    const lines = input.split(/\r?\n/);

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        let span = document.createElement("span");
        span.dataset.raw = trimmed;

        // Timestamp hover
        span.innerHTML = detectTimestamp(trimmed);

        // JSON detection
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            try {
                span.className = "log-json";
                span.innerHTML =
                    `<pre>${JSON.stringify(JSON.parse(trimmed), null, 2)}</pre>`;
            } catch {}
        }
        else if (/^ERROR/.test(trimmed)) span.className = "log-error";
        else if (/^WARN/.test(trimmed)) span.className = "log-warn";
        else if (/^INFO/.test(trimmed)) span.className = "log-info";
        else if (/^DEBUG|TRACE/.test(trimmed)) span.className = "log-debug";
        else if (trimmed.startsWith("at ") || trimmed.startsWith("Caused by")) {
            span.className = "log-stack";
            span.innerText = "    " + trimmed;
        }

        output.appendChild(span);
        output.appendChild(document.createTextNode("\n"));
        allLogLines.push(span);
    });
}

function detectTimestamp(text) {
    return text.replace(/\b\d{10,13}\b/g, match => {
        let date = match.length === 13
            ? new Date(Number(match))
            : new Date(Number(match) * 1000);

        if (isNaN(date.getTime())) return match;

        return `<span title="UTC: ${date.toUTCString()} | IST: ${date.toLocaleString('en-IN')}">${match}</span>`;
    });
}

/* 🔍 Search */
function filterLogs() {
    const q = document.getElementById("searchInput").value.toLowerCase();
    allLogLines.forEach(line => {
        line.style.display = line.dataset.raw.toLowerCase().includes(q) ? "" : "none";
    });
}

/* 📋 Copy ONLY formatted logs */
function copyFormattedLogs() {
    const text = document.getElementById("logOutput").innerText;
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
    alert("Formatted logs copied!");
}

/* 📸 Screenshot formatted logs only */
function screenshotLogs() {
    const output = document.getElementById("logOutput");
    if (!output.innerText.trim()) {
        alert("No formatted logs to capture");
        return;
    }

    // Detect theme background correctly
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    const panelBg = getComputedStyle(output).backgroundColor;
    const backgroundColor =
        panelBg === "rgba(0, 0, 0, 0)" ? bodyBg : panelBg;

    const lines = Array.from(output.childNodes)
        .filter(n => n.nodeType === Node.ELEMENT_NODE)
        .map(el => ({
            text: el.innerText.replace(/\n$/, ""),
            color: getComputedStyle(el).color
        }));

    const fontSize = 14;
    const lineHeight = 20;
    const padding = 20;
    const font = `${fontSize}px monospace`;

    // Measure width
    const measureCanvas = document.createElement("canvas");
    const mCtx = measureCanvas.getContext("2d");
    mCtx.font = font;

    let maxWidth = 0;
    lines.forEach(l => {
        const w = mCtx.measureText(l.text).width;
        if (w > maxWidth) maxWidth = w;
    });

    const canvas = document.createElement("canvas");
    canvas.width = maxWidth + padding * 2;
    canvas.height = lines.length * lineHeight + padding * 2;

    const ctx = canvas.getContext("2d");

    // ✅ Paint correct background FIRST
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = font;
    ctx.textBaseline = "top";

    let y = padding;
    lines.forEach(line => {
        ctx.fillStyle = line.color;
        ctx.fillText(line.text, padding, y);
        y += lineHeight;
    });

    const link = document.createElement("a");
    link.download = "formatted-logs.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}


/* ⏱ Timestamp converter */
function convertTimestamp() {
    const input = document.getElementById("timestampInput").value.trim();
    let date;

    if (/^\d+$/.test(input)) {
        date = input.length >= 13
            ? new Date(Number(input))
            : new Date(Number(input) * 1000);
    } else {
        date = new Date(input);
    }

    if (isNaN(date.getTime())) {
        document.getElementById("timestampOutput").innerText = "Invalid date";
        return;
    }

    document.getElementById("timestampOutput").innerHTML =
        `<strong>UTC:</strong> ${date.toUTCString()}<br>
     <strong>Local:</strong> ${date.toString()}`;
}

/* 🌗 Theme */
function toggleTheme() {
    document.body.classList.toggle("light");
}
