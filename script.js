async function generateTicket() {
  // Show loading popup
  showLoading();

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape"); // ticket style

    // Gradient background (blue to white)
    for (let i = 0; i < 90; i++) {
      const shade = 255 - i; // from white → light blue
      doc.setFillColor(200, 220, shade);
      doc.rect(10, 10 + i, 270, 1, "F");
    }

    let name = document.getElementById("name").value || "Anonymous Minister";

    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    let activities = Array.from(checkboxes).map(cb => cb.value).join(", ") || "No activities selected";

    // Brand colors
    const maroon = [128, 0, 64]; // Qatar-style deep maroon
    const gray = [230, 230, 230];

    // Ticket outline - rectangle (draw first)
    doc.setLineWidth(1.5);
    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(255, 255, 255);
    doc.rect(10, 10, 270, 120, "FD");

    // Blue header bar - rectangle
    doc.setFillColor(0, 51, 153);
    doc.rect(10, 10, 270, 20, "F");

    // Divider (stub vs main ticket) - dashed tear line
    doc.setLineWidth(0.5);
    doc.setDrawColor(100); // softer grey instead of pure black

    // jsPDF supports dashed lines:
    doc.setLineDash([3, 3], 0); // 3pt dash, 3pt gap
    doc.line(200, 10, 200, 130);

    // reset line dash back to solid for other shapes
    doc.setLineDash([]);

    // Logo (your Ministers pilot pic)
    const logo = await loadImage("scade.jpg");
    doc.addImage(logo, "JPEG", 15, 12, 18, 14);

    // Header text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("MINISTERS AIRLINES – BOARDING PASS", 40, 23);

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Background watermark (tiled logo, faint)
    const pattern = await loadImage("scade.jpg");
    doc.setGState(new doc.GState({ opacity: 0.08 })); // transparency
    for (let x = 30; x < 270; x += 60) {
      for (let y = 30; y < 100; y += 40) {
        doc.addImage(pattern, "JPEG", x, y, 20, 15);
      }
    }
    doc.setGState(new doc.GState({ opacity: 1 }));

    // Passenger info (main)
    doc.setFontSize(12);
    doc.text(`Passenger: ${name}`, 20, 40);
    doc.text("Flight: MNS420", 20, 50);
    doc.text("Seat: " + (Math.floor(Math.random() * 50) + 1) + "B", 20, 60);
    doc.text("Gate: Halfort Apartments", 20, 70);
    doc.text("Departure: Friday 3:00 PM", 20, 80);
    doc.text("Activities: " + activities, 20, 90);

    // Stub section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("MNS420", 210, 40);
    doc.setFontSize(10);
    doc.text(`Passenger: ${name}`, 210, 55);
    doc.text("Halfort Apt.", 210, 65);
    doc.text("Dep: Fri 3:00 PM", 210, 75);

    // QR code (encodes ticket info)
    const qrData = `Ministers Airlines | ${name} | Flight MNS420 | Halfort 3PM | ${activities}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}`;
    const qrImg = await loadImage(qrUrl);
    doc.addImage(qrImg, "PNG", 250, 20, 25, 25);

    // Footer message
    doc.setFont("times", "oblique");
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80); // subtle grey
    doc.text("Tupatane Airport", 135, 125, { align: "center" });

    // Save PDF after generation
    doc.save(`${name}_boarding_pass.pdf`);

    // Success popup
    showSuccess();

  } catch (err) {
    console.error("Error generating ticket:", err);
    alert("Something went wrong while generating your boarding pass!");
  } finally {
    // Hide loader after short delay
    setTimeout(hideLoading, 2000);
  }
}

// Helper: load external image into base64
function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = url;
  });
}

// --- Loading + Success Popup ---
function showLoading() {
  const loader = document.createElement("div");
  loader.id = "loadingPopup";
  loader.innerHTML = `
    <div style="
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5); display: flex; align-items: center; 
      justify-content: center; z-index: 9999;">
      <div style="background: white; padding: 20px 30px; border-radius: 12px; 
                  text-align: center; font-family: sans-serif; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
        <div class="spinner" style="margin-bottom: 10px;"></div>
        <p>Generating your boarding pass...</p>
      </div>
    </div>
  `;
  document.body.appendChild(loader);

  // Add spinner CSS
  const style = document.createElement("style");
  style.innerHTML = `
    .spinner {
      width: 30px;
      height: 30px;
      border: 3px solid #ccc;
      border-top: 3px solid #003399;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

function showSuccess() {
  const popup = document.getElementById("loadingPopup");
  if (popup) {
    popup.querySelector("div").innerHTML = `
      <p style="font-size: 18px; color: green; font-weight: bold;">
        ✅ Boarding Pass Downloaded!
      </p>
    `;
  }
}

function hideLoading() {
  const popup = document.getElementById("loadingPopup");
  if (popup) popup.remove();
}
