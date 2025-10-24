// script.js - Tối ưu hiệu suất và trải nghiệm người dùng

// Kết hợp cả hai API URL
const API_URL = "https://script.google.com/macros/s/AKfycbw5sjUwJfwRtKBQQu5FgYrmgSjoQ22vvnmlv99H7YJHTVgVZRXm1vWB7fFJg8B2O2M7/exec";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby_jnFFS0Adq6yBqm5VQHjy2Ap59kqFclYDiJlHYkEwmvV21QQZzp-ZvJ27xumt3IDR/exec";

// Dữ liệu mặc định (từ file 1)
const defaultData = {
    tkb: {
        0: ["Nghỉ"],
        1: ["Null"],
        2: ["Null"],
        3: ["Null"],
        4: ["Null"],
        5: ["Null"],
        6: ["Nghỉ"]
    },
    truc: {
        0: "Chủ nhật: Không trực",
        1: "Null",
        2: "Null",
        3: "Null",
        4: "Null",
        5: "Null",
        6: "Null",
    }
};

const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

// Biến toàn cục để lưu dữ liệu từ API
let currentData = {
    tkb: defaultData.tkb,
    truc: defaultData.truc,
    btvn: [],
    changelog: [],
    notices: []
};

// Biến theo dõi trạng thái
let isLoading = false;
let refreshTimer = null;

// Biến cho tính năng làm mới tự động
let autoRefreshInterval = null;
let isAutoRefreshEnabled = false;
let lastData = null;

// Cache DOM elements
const elements = {
    // Canvas
    sky: document.getElementById("sky"),
    // Loading
    loadingScreen: document.getElementById("loadingScreen"),
    themeLoading: document.getElementById("themeLoading"),
    // Menu
    menuBtn: document.getElementById("menuBtn"),
    menuPanel: document.getElementById("menuPanel"),
    menuDark: document.getElementById("menuDark"),
    menuLiquid: document.getElementById("menuLiquid"),
    menuPopup: document.getElementById("menuPopup"),
    // Popup
    popup: document.getElementById("popup"),
    popupClose: document.getElementById("popupClose"),
    popupCard: document.getElementById("popupCard"),
    // Content
    btvnContainer: document.getElementById("btvnContainer"),
    noticesContainer: document.getElementById("noticesContainer"),
    tkbContainer: document.getElementById("tkbContainer"),
    showFullBtn: document.getElementById("showFullBtn"),
    fullTKB: document.getElementById("fullTKB"),
    changelogContainer: document.getElementById("changelogContainer"),
    // Color themes
    colorThemes: document.querySelectorAll(".color-theme"),
    // Refresh button
    refreshBtn: document.getElementById("refreshBtn")
};

/* -------------------------
Canvas bầu trời sao - chỉ hoạt động trong dark mode
------------------------- */
const canvas = elements.sky;
const ctx = canvas.getContext("2d");

// Tối ưu hiệu suất canvas
let animationFrameId = null;
let meteorInterval = null;
let stars = [];
let meteors = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Tạo lại các ngôi sao khi kích thước canvas thay đổi
    createStars();
}

function createStars() {
    stars = [];
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5,
            opacity: Math.random(),
            blinkSpeed: 0.005 + Math.random() * 0.01
        });
    }
}

function createMeteor() {
    meteors.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height / 2),
        length: Math.random() * 80 + 40,
        speed: Math.random() * 12 + 8,
        opacity: 1,
        angle: Math.random() * Math.PI / 4 + Math.PI / 4
    });
}

function initCanvas() {
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    
    // Vẽ bầu trời
    function drawSky() {
        const isDarkMode = document.body.classList.contains("dark");
        
        // Xóa canvas trước khi vẽ
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Chỉ vẽ khi dark mode được bật
        if (isDarkMode) {
            // Nền trời
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Vẽ sao
            for (const star of stars) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${star.opacity})`;
                ctx.fill();
                
                // Hiệu ứng nhấp nháy
                star.opacity += (Math.random() - 0.5) * star.blinkSpeed;
                if (star.opacity < 0.3) star.opacity = 0.3;
                if (star.opacity > 1) star.opacity = 1;
            }
            
            // Vẽ sao băng
            for (let i = meteors.length - 1; i >= 0; i--) {
                const meteor = meteors[i];
                ctx.strokeStyle = `rgba(255,255,255,${meteor.opacity})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(meteor.x, meteor.y);
                ctx.lineTo(
                    meteor.x - meteor.length * Math.cos(meteor.angle),
                    meteor.y - meteor.length * Math.sin(meteor.angle)
                );
                ctx.stroke();
                
                meteor.x += meteor.speed * Math.cos(meteor.angle);
                meteor.y += meteor.speed * Math.sin(meteor.angle);
                meteor.opacity -= 0.02;
                
                if (meteor.opacity <= 0) {
                    meteors.splice(i, 1);
                }
            }
            
            // Bắt đầu tạo sao băng nếu chưa có interval
            if (meteorInterval === null) {
                meteorInterval = setInterval(createMeteor, 3000);
            }
        } else {
            // Dừng tạo sao băng khi không ở dark mode
            if (meteorInterval !== null) {
                clearInterval(meteorInterval);
                meteorInterval = null;
                meteors.length = 0; // Xóa tất cả sao băng
            }
        }
        
        animationFrameId = requestAnimationFrame(drawSky);
    }
    
    // Bắt đầu vẽ bầu trời
    drawSky();
}

/* -------------------------
Tab Navigation functionality - Cập nhật để hỗ trợ tab fixed có thể thu gọn
------------------------- */
function initTabNavigation() {
    // Cập nhật selector để sử dụng tab fixed
    const tabButtons = document.querySelectorAll('.tab-btn-fixed');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const tabIndicator = document.querySelector('.tab-indicator-fixed');
    const tabNavigationFixed = document.getElementById('tabNavigationFixed');
    const tabExpandBtn = document.getElementById('tabExpandBtn');
    
    // Biến theo dõi trạng thái tab
    let tabTimeout = null;
    let isTabInteracted = false;
    
    // Thời gian chờ trước khi thu gọn tab (tăng lên 8 giây để người dùng có thời gian thao tác)
    const TAB_HIDE_DELAY = 8000;
    // Thời gian chờ trước khi ẩn tab thêm (tăng lên 15 giây)
    const TAB_MINIMIZE_DELAY = 15000;
    
    // Function to update indicator position
    function updateIndicator(activeTab) {
        const tabRect = activeTab.getBoundingClientRect();
        const containerRect = activeTab.parentElement.getBoundingClientRect();

        // Cập nhật vị trí và kích thước cho indicator
        tabIndicator.style.left = `${tabRect.left - containerRect.left}px`;
        tabIndicator.style.width = `${tabRect.width}px`;
        tabIndicator.style.height = '3px';
        tabIndicator.style.borderRadius = '3px 3px 0 0';
    }
    
    // Function to switch tabs
    function switchTab(targetTab) {
        // Update active states
        tabButtons.forEach(btn => {
            if (btn === targetTab) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            }
        });
        
        // Update panel visibility
        const tabId = targetTab.getAttribute('data-tab');
        tabPanels.forEach(panel => {
            if (panel.id === `${tabId}-panel`) {
                panel.classList.add('active');
                panel.setAttribute('aria-hidden', 'false');
            } else {
                panel.classList.remove('active');
                panel.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Update indicator position
        updateIndicator(targetTab);
        
        // Save active tab to localStorage
        localStorage.setItem('activeTab', tabId);
        
        // Reset timer khi có tương tác
        resetTabTimer();
    }
    
    // Reset timer cho tab
    function resetTabTimer() {
        // Xóa timer hiện tại nếu có
        if (tabTimeout) {
            clearTimeout(tabTimeout);
        }
        
        // Đánh dấu là có tương tác
        isTabInteracted = true;
        
        // Hiển thị tab đầy đủ
        showFullTab();
        
        // Đặt timer mới để thu gọn tab
        tabTimeout = setTimeout(() => {
            minimizeTab();
        }, TAB_HIDE_DELAY);
    }
    
    // Hiển thị tab đầy đủ
    function showFullTab() {
        tabNavigationFixed.classList.remove('minimized', 'hidden');
        tabExpandBtn.classList.remove('visible');
    }
    
    // Thu gọn tab
    function minimizeTab() {
        tabNavigationFixed.classList.remove('hidden');
        tabNavigationFixed.classList.add('minimized');
        tabExpandBtn.classList.remove('visible');
        
        // Đặt timer để ẩn tab thêm
        tabTimeout = setTimeout(() => {
            hideTab();
        }, TAB_MINIMIZE_DELAY);
    }
    
    // Ẩn tab
    function hideTab() {
        tabNavigationFixed.classList.remove('minimized');
        tabNavigationFixed.classList.add('hidden');
        tabExpandBtn.classList.add('visible');
    }
    
    // Xử lý sự kiện khi di chuột vào khu vực tab
    tabNavigationFixed.addEventListener('mouseenter', () => {
        resetTabTimer();
    });
    
    // Xử lý sự kiện khi di chuột ra khỏi khu vực tab
    tabNavigationFixed.addEventListener('mouseleave', () => {
        if (isTabInteracted) {
            tabTimeout = setTimeout(() => {
                minimizeTab();
            }, TAB_HIDE_DELAY);
        }
    });
    
    // Xử lý sự kiện khi nhấp vào nút mở rộng
    tabExpandBtn.addEventListener('click', () => {
        resetTabTimer();
    });
    
    // Xử lý sự kiện touch cho thiết bị di động - cải thiện để dễ thao tác hơn
    tabNavigationFixed.addEventListener('touchstart', (e) => {
        resetTabTimer();
        // Không ngăn chặn hành vi mặc định để vẫn cho phép cuộn trang
    }, { passive: true });
    
    // Thêm sự kiện touchend để đảm bảo tab chuyển khi người dùng nhấc tay
    tabNavigationFixed.addEventListener('touchend', (e) => {
        // Xác định vị trí touch
        const touch = e.changedTouches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Kiểm tra nếu element là tab button
        if (element && element.classList.contains('tab-btn-fixed')) {
            // Kích hoạt sự kiện click
            element.click();
        }
    });
    
    // Add click event listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button);
        });
    });
    
    // Initialize indicator position
    const activeTab = document.querySelector('.tab-btn-fixed.active');
    if (activeTab) {
        updateIndicator(activeTab);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const currentActiveTab = document.querySelector('.tab-btn-fixed.active');
        if (currentActiveTab) {
            updateIndicator(currentActiveTab);
        }
    });
    
    // Restore active tab from localStorage
    const savedTabId = localStorage.getItem('activeTab');
    if (savedTabId) {
        const savedTab = document.querySelector(`.tab-btn-fixed[data-tab="${savedTabId}"]`);
        if (savedTab) {
            switchTab(savedTab);
        }
    }
    
    // Khởi động timer ban đầu
    resetTabTimer();
}

/* -------------------------
Menu
------------------------- */
function initMenu() {
    // Toggle menu
    elements.menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isExpanded = elements.menuBtn.getAttribute("aria-expanded") === "true";
        elements.menuBtn.setAttribute("aria-expanded", !isExpanded);
        elements.menuPanel.setAttribute("aria-hidden", isExpanded);
        elements.menuPanel.style.display = isExpanded ? "none" : "block";
    });
    
    // Close menu when clicking outside
    document.addEventListener("click", (ev) => {
        if (!elements.menuPanel.contains(ev.target) && ev.target !== elements.menuBtn) {
            elements.menuBtn.setAttribute("aria-expanded", "false");
            elements.menuPanel.setAttribute("aria-hidden", "true");
            elements.menuPanel.style.display = "none";
        }
    });
    
    // Dark mode toggle
    elements.menuDark.addEventListener("click", () => {
        showThemeLoading();
        
        setTimeout(() => {
            document.body.classList.toggle("dark");
            localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
            applyThemeFromStorage();
            hideThemeLoading();
        }, 500);
    });
    
    // Liquid/Normal mode toggle
    elements.menuLiquid.addEventListener("click", () => {
        showThemeLoading();
        
        setTimeout(() => {
            document.body.classList.toggle("normal-mode");
            localStorage.setItem("liquidMode", document.body.classList.contains("normal-mode") ? "normal" : "liquid");
            applyThemeFromStorage();
            hideThemeLoading();
        }, 500);
    });
    
    // Popup toggle
    elements.menuPopup.addEventListener("click", () => {
        openPopup(true);
    });
    
    // Auto refresh toggle - Thêm mới
    const menuAutoRefresh = document.getElementById("menuAutoRefresh");
    if (menuAutoRefresh) {
        menuAutoRefresh.addEventListener("click", toggleAutoRefresh);
    }
    
    // Color theme selection
    elements.colorThemes.forEach(btn => {
        btn.addEventListener("click", () => {
            const theme = btn.dataset.theme;
            showThemeLoading();
            
            setTimeout(() => {
                applyColorTheme(theme);
                hideThemeLoading();
            }, 500);
        });
        
        // Keyboard navigation
        btn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                btn.click();
            }
        });
    });
}

/* -------------------------
Theme functions
------------------------- */
function applyThemeFromStorage() {
    // Áp dụng dark mode
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        elements.menuDark.innerHTML = '<span class="menu-item-icon"><i class="fas fa-sun"></i></span><span class="menu-item-text">Light Mode</span>';
        applyColorTheme("black");
    } else {
        document.body.classList.remove("dark");
        elements.menuDark.innerHTML = '<span class="menu-item-icon"><i class="fas fa-moon"></i></span><span class="menu-item-text">Dark Mode</span>';
        const savedTheme = localStorage.getItem("colorTheme") || "blue";
        applyColorTheme(savedTheme);
    }

    // Áp dụng liquid/normal mode
    if (localStorage.getItem("liquidMode") === "normal") {
        document.body.classList.add("normal-mode");
        elements.menuLiquid.innerHTML = '<span class="menu-item-icon"><i class="fas fa-magic"></i></span><span class="menu-item-text">Đang hiển thị giao diện thường</span>';
    } else {
        document.body.classList.remove("normal-mode");
        elements.menuLiquid.innerHTML = '<span class="menu-item-icon"><i class="fas fa-magic"></i></span><span class="menu-item-text">Đang hiển thị Liquid Glass</span>';
    }
}

function applyColorTheme(theme) {
    // Xóa tất cả các class màu chủ đề
    document.body.classList.remove("theme-pink", "theme-blue", "theme-green", "theme-fresh", 'theme-popular', 'theme-white', 'theme-black', 'theme-aquaviolet', 'theme-mint');

    // Thêm class màu chủ đề được chọn
    if (theme) {
        document.body.classList.add(`theme-${theme}`);
    }

    // Cập nhật trạng thái active cho các nút màu
    elements.colorThemes.forEach(btn => {
        btn.classList.remove("active");
        btn.setAttribute("aria-checked", "false");
        if (btn.dataset.theme === theme) {
            btn.classList.add("active");
            btn.setAttribute("aria-checked", "true");
        }
    });

    // Lưu màu chủ đề vào localStorage (chỉ khi không ở dark mode)
    if (!document.body.classList.contains("dark")) {
        localStorage.setItem("colorTheme", theme);
    }
}

function showThemeLoading() {
    elements.themeLoading.classList.add("active");
}

function hideThemeLoading() {
    elements.themeLoading.classList.remove("active");
}

/* -------------------------
Popup logic (1 lần/ngày)
------------------------- */
function initPopup() {
    elements.popupClose.addEventListener("click", closePopup);
    
    // Đóng popup khi click bên ngoài popup
    elements.popup.addEventListener("click", (e) => {
        if (e.target === elements.popup) {
            closePopup();
        }
    });
    
    // Đóng popup khi nhấn phím Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && elements.popup.classList.contains("open")) {
            closePopup();
        }
    });
}

function openPopup(force = false) {
    const today = new Date().toLocaleDateString('vi-VN');
    
    if (force) {
        elements.popup.classList.add("open");
        document.body.classList.add("popup-open");
        // Ngăn cuộn trang khi popup mở
        document.body.style.overflow = "hidden";
        return;
    }

    const lastShown = localStorage.getItem('popupShownDate');
    if (lastShown !== today) {
        elements.popup.classList.add("open");
        localStorage.setItem('popupShownDate', today);
        document.body.classList.add("popup-open");
        // Ngăn cuộn trang khi popup mở
        document.body.style.overflow = "hidden";
    }
}

function closePopup() {
    elements.popup.classList.remove("open");
    document.body.classList.remove("popup-open");
    // Khôi phục lại khả năng cuộn trang
    document.body.style.overflow = "";
}

/* -------------------------
Data functions
------------------------- */

// ✅ Danh sách môn học cố định từ trang admin
const SUBJECT_LIST = [
  "Toán - Đại số", "Toán - Hình học", "Ngữ văn", "Tiếng Anh", "Vật lý",
  "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "GDCD",
  "Tin học", "Công nghệ", "GDTC", "GDĐP", "Mĩ thuật", "Âm nhạc", "HĐTN"
];

// ✅ Hàm đảm bảo tất cả môn đều có trong danh sách (dù trống dữ liệu)
function ensureAllSubjects(btvnArray) {
  const map = {};
  btvnArray.forEach(item => { map[item.subject] = item; });

  const fullList = SUBJECT_LIST.map(sub => {
    if (map[sub]) return map[sub];
    return { subject: sub, content: "(Chưa có bài tập)", date: "", note: "" };
  });
  return fullList;
}

async function fetchData() {
  if (isLoading) return null;
  
  isLoading = true;

  try {
    const res = await fetch(SCRIPT_URL + "?action=getAll");
    const data = await res.json();

    if (!data || !data.result) return null;

    // ✅ Bổ sung dữ liệu trống cho các môn chưa có
    data.result.btvn = ensureAllSubjects(data.result.btvn || []);

    // ✅ Trả về dữ liệu đã chuẩn hóa
    return data.result;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  } finally {
    isLoading = false;
  }
}
// Hàm render BTVN từ API
function renderBTVN(data) {
    const container = elements.btvnContainer;
    if (!data?.btvn?.length) {
        container.innerHTML = "<p>Chưa có bài tập.</p>";
        return;
    }

    let html = "";
    const subjects = {};
    
    // Nhóm bài theo môn học
    data.btvn.forEach(item => {
        if (!subjects[item.subject]) {
            subjects[item.subject] = [];
        }
        subjects[item.subject].push(item);
    });

    // Render theo từng môn
    Object.keys(subjects).forEach(subject => {
        html += `<h2 class="animate-item">${getSubjectIcon(subject)} ${subject}</h2>`;
        html += '<ul class="animate-item">';
        
        subjects[subject].forEach(item => {
            html += `<li>${item.content}</li>`;
        });
        
        html += '</ul>';
    });

    container.innerHTML = html;
}

// Hàm render TKB từ API
function renderTKB(data) {
    const container = elements.tkbContainer;
    if (!data?.tkb) {
        container.innerHTML = "<p>Không có dữ liệu TKB.</p>";
        return;
    }

    const d = getVNDateObj();
    let day = d.getDay();
    const hour = d.getHours();

    if (hour < 7) day = (day - 1 + 7) % 7;

    let showDay;
    if (day === 5 || day === 6 || day === 0) showDay = 1;
    else showDay = (day + 1) % 7;

    let tomorrowDate = new Date(d);
    if (day === 5) tomorrowDate.setDate(d.getDate() + ((1 + 7 - day) % 7));
    else if (day === 6) tomorrowDate.setDate(d.getDate() + ((1 + 7 - day) % 7));
    else if (day === 0) tomorrowDate.setDate(d.getDate() + 1);
    else tomorrowDate.setDate(d.getDate() + 1);

    const formattedDate = tomorrowDate.toLocaleDateString("vi-VN");

    let html = `<p>Hôm nay: <strong>${dayNames[d.getDay()]}</strong>, ${d.toLocaleDateString('vi-VN')} — Hiển thị TKB <strong>${dayNames[showDay]}</strong>, ngày ${formattedDate}</p>`;
    html += `<div class="inline-note">❗Lưu ý: Sau 7:00 sáng TKB sẽ chuyển sang ngày tiếp theo.</div>`;

    html += `<div class="day-container">`;
    html += `<div class="day-header">${dayNames[showDay]}</div>`;
    html += `<div class="session-container">`;

    // Buổi sáng
    html += `<div class="session-header morning-header">Buổi sáng</div>`;
    html += `<table class="session-table"><thead><tr><th>Tiết</th><th>Môn / Nội dung</th></tr></thead><tbody>`;
    if (data.tkb[showDay]) {
        data.tkb[showDay]
            .filter(p => p.buoi === "Sáng")
            .forEach(p => {
                html += `<tr><td>${p.tiet}</td><td>${p.subject}</td></tr>`;
            });
    }
    html += `</tbody></table>`;

    // Buổi chiều
    html += `<div class="session-header afternoon-header">Buổi chiều</div>`;
    html += `<table class="session-table"><thead><tr><th>Tiết</th><th>Môn / Nội dung</th></tr></thead><tbody>`;
    if (data.tkb[showDay]) {
        data.tkb[showDay]
            .filter(p => p.buoi === "Chiều")
            .forEach(p => {
                html += `<tr><td>${p.tiet}</td><td>${p.subject}</td></tr>`;
            });
    }
    html += `</tbody></table>`;

    html += `</div></div>`;
    html += `<p style="margin-top:10px;"><b>Lịch trực: </b> <span id="todayTruc">${data.tkb[showDay]?.[0]?.truc || 'Không có dữ liệu'}</span></p>`;

    container.innerHTML = html;
}

// Hàm render changelog từ API
function renderChangelog(data) {
  const container = elements.changelogContainer;
  if (!data?.changelog?.length) {
    container.innerHTML = "<p>Chưa có dữ liệu changelog.</p>";
    return;
  }

  // Nếu log có dạng "[23/10/2025] v2.3 - nội dung thay đổi", tách phần ngày + version + nội dung
  const parsedLogs = data.changelog.map(line => {
    const parts = line.split(" - ");
const header = parts[0] || "";
const content = parts.slice(1).join(" - ") || "";

const dateMatch = header.match(/\[(.*?)\]/);
const numMatch = header.match(/#(\d+)/);

const date = dateMatch ? dateMatch[1] : "";
const version = numMatch ? `#${numMatch[1]}` : "";

return { date, version, content: content.trim() };

    if (match) {
      return { date: match[1], version: match[2] || "Cập nhật", content: match[3] };
    } else {
      return { date: "", version: "Cập nhật", content: line };
    }
  });

  // Gom nhóm theo ngày hoặc version
  const grouped = {};
  parsedLogs.forEach(log => {
    const key = `${log.date} ${log.version}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(log.content);
  });

  // Tạo HTML
  let html = `
    <div class="changelog-section">
      <h3 style="margin-bottom:10px;">📝 Nhật ký thay đổi</h3>
  `;

  Object.keys(grouped).forEach(key => {
    const [date, version] = key.split(" ");
    html += `
      <div class="changelog-card">
        <div class="changelog-header">
          <span class="changelog-version">❗ ${version}</span>
          ${date ? `<span class="changelog-date">📅 ${date}</span>` : ""}
        </div>
        <ul class="changelog-list">
          ${grouped[key].map(item => `<li>🔹 ${item}</li>`).join("")}
        </ul>
      </div>
    `;
  });

  html += "</div>";
  container.innerHTML = html;
}

// Hàm render thông báo từ API
function renderNotices(data) {
    const container = elements.noticesContainer;
    if (!data?.notices?.length) {
        container.style.display = "none";
        return;
    }

    let html = '<strong>THÔNG BÁO:</strong>';
    html += '<ul>';
    
    data.notices.forEach(notice => {
        html += `<li>${notice}</li>`;
    });
    
    html += '</ul>';
    container.innerHTML = html;
    container.style.display = "block";
}

// Hàm lấy icon cho môn học
function getSubjectIcon(subject) {
    const icons = {
        'Địa lí': '📘',
        'Toán học': '➗',
        'Ngữ văn': '✍',
        'Sinh học': '🧬',
        'GDĐP': '🏠',
        'Lịch sử': '📜',
        'Vật lý': '🔬',
        'HĐTN, HN': '🤝',
        'Mĩ thuật': '🎨',
        'Hóa học': '⚗',
        'Tiếng Anh': '🇬🇧',
        'Công dân': '👥',
        'Công nghệ': '🔧',
        'Âm nhạc': '🎶',
        'Tin học': '💻'
    };
    return icons[subject] || '📚';
}

// Hàm tải và hiển thị toàn bộ dữ liệu
async function loadAllData() {
    const data = await fetchData();
    if (data) {
        // Cập nhật dữ liệu toàn cục
        currentData = {
            tkb: data.tkb || defaultData.tkb,
            truc: data.truc || defaultData.truc,
            btvn: data.btvn || [],
            changelog: data.changelog || [],
            notices: data.notices || []
        };
        
        // Lưu dữ liệu để so sánh sau này
        lastData = JSON.parse(JSON.stringify(currentData));
        
        renderBTVN(currentData);
        renderTKB(currentData);
        renderChangelog(currentData);
        renderNotices(currentData);
    } else {
        // Sử dụng dữ liệu mặc định nếu không tải được từ API
        currentData = {
            tkb: defaultData.tkb,
            truc: defaultData.truc,
            btvn: [],
            changelog: [],
            notices: []
        };
        
        // Lưu dữ liệu để so sánh sau này
        lastData = JSON.parse(JSON.stringify(currentData));
        
        renderBTVN(currentData);
        renderTKB(currentData);
        renderChangelog(currentData);
        renderNotices(currentData);
    }
}

// Giữ nguyên hàm renderTodayTKB từ File 1 nhưng sửa để sử dụng dữ liệu từ API
async function renderTodayTKB() {
    renderTKB(currentData);
}

// Helper function: get VN date/time (works cross-browser)
function getVNDateObj() {
    const s = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh'
    });
    return new Date(s);
}

/* -------------------------
Tính năng làm mới tự động
------------------------- */
// Hàm so sánh dữ liệu
function hasDataChanged(newData, oldData) {
    if (!oldData) return true;
    
    // So sánh BTVN
    if (JSON.stringify(newData.btvn) !== JSON.stringify(oldData.btvn)) return true;
    
    // So sánh TKB
    if (JSON.stringify(newData.tkb) !== JSON.stringify(oldData.tkb)) return true;
    
    // So sánh thông báo
    if (JSON.stringify(newData.notices) !== JSON.stringify(oldData.notices)) return true;
    
    // So sánh changelog
    if (JSON.stringify(newData.changelog) !== JSON.stringify(oldData.changelog)) return true;
    
    return false;
}

// Hàm làm mới tự động
async function autoRefreshData() {
    try {
        const data = await fetchData();
        if (data && hasDataChanged(data, lastData)) {
            // Cập nhật dữ liệu nếu có thay đổi
            lastData = JSON.parse(JSON.stringify(data));
            currentData = {
                tkb: data.tkb || defaultData.tkb,
                truc: data.truc || defaultData.truc,
                btvn: data.btvn || [],
                changelog: data.changelog || [],
                notices: data.notices || []
            };
            
            // Cập nhật giao diện
            renderBTVN(currentData);
            renderTKB(currentData);
            renderChangelog(currentData);
            renderNotices(currentData);
        }
    } catch (error) {
        console.error("Lỗi khi làm mới tự động:", error);
    }
}

// Hàm bật/tắt làm mới tự động
function toggleAutoRefresh() {
    isAutoRefreshEnabled = !isAutoRefreshEnabled;
    
    if (isAutoRefreshEnabled) {
        // Bật làm mới tự động
        autoRefreshInterval = setInterval(autoRefreshData, 20000); // Mỗi 10 giây
        document.getElementById("menuAutoRefresh").innerHTML = 
            '<span class="menu-item-icon"><i class="fas fa-pause-circle"></i></span><span class="menu-item-text">Tắt làm mới tự động</span>';
        
        // Ẩn nút làm mới thủ công
        if (elements.refreshBtn) {
            elements.refreshBtn.style.display = "none";
        }
        
        // Hiển thị thông báo
        showNotification("Đã bật làm mới tự động mỗi 10 giây");
    } else {
        // Tắt làm mới tự động
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
        }
        document.getElementById("menuAutoRefresh").innerHTML = 
            '<span class="menu-item-icon"><i class="fas fa-sync-alt"></i></span><span class="menu-item-text">Bật làm mới tự động</span>';
        
        // Hiện nút làm mới thủ công
        if (elements.refreshBtn) {
            elements.refreshBtn.style.display = "flex";
        }
        
        // Hiển thị thông báo
        showNotification("Đã tắt làm mới tự động");
    }
    
    // Lưu trạng thái vào localStorage
    localStorage.setItem('autoRefreshEnabled', isAutoRefreshEnabled);
}
// Hàm hiển thị thông báo nhỏ
function showNotification(message) {
    // Tạo phần tử thông báo
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Thêm vào body
    document.body.appendChild(notification);
    
    // Hiển thị thông báo
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Ẩn sau 3 giây
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/* -------------------------
Event listeners
------------------------- */
function initEventListeners() {
    // Xử lý nút xem toàn bộ TKB
    elements.showFullBtn.addEventListener("click", function() {
        const isExpanded = this.getAttribute("aria-expanded") === "true";
        this.setAttribute("aria-expanded", !isExpanded);
        elements.fullTKB.setAttribute("aria-hidden", isExpanded);
        
        if (isExpanded) {
            elements.fullTKB.style.display = "none";
            this.innerHTML = '<i class="fas fa-calendar-week"></i> Xem toàn bộ TKB';
            return;
        }

        let html = `<div style="margin-bottom:8px;"><strong>📅 Thời khóa biểu cả tuần</strong></div>`;
        for (let k = 1; k <= 5; k++) {
            html += `<div class="day-container">`;
            html += `<div class="day-header">${dayNames[k]}</div>`;
            html += `<div class="session-container">`;

            // Buổi sáng
            html += `<div class="session-header morning-header">Buổi sáng</div>`;
            html += `<table class="session-table"><thead><tr><th>Tiết</th><th>Môn</th></tr></thead><tbody>`;
            if (currentData.tkb[k]) {
                currentData.tkb[k].filter(p => p.buoi === "Sáng").forEach(p => {
                    html += `<tr><td>${p.tiet}</td><td>${p.subject}</td></tr>`;
                });
            }
            html += `</tbody></table>`;

            // Buổi chiều
            html += `<div class="session-header afternoon-header">Buổi chiều</div>`;
            html += `<table class="session-table"><thead><tr><th>Tiết</th><th>Môn</th></tr></thead><tbody>`;
            if (currentData.tkb[k]) {
                currentData.tkb[k].filter(p => p.buoi === "Chiều").forEach(p => {
                    html += `<tr><td>${p.tiet}</td><td>${p.subject}</td></tr>`;
                });
            }
            html += `</tbody></table>`;

            html += `<div class="truc-container" style="margin-top: 12px; padding: 8px; background: var(--table-header-bg); border-radius: 8px;">`;
            html += `<strong style="color: var(--table-header-text);">🧹 Lịch trực: </strong>`;
            html += `<span>${currentData.tkb[k]?.[0]?.truc || 'Không có dữ liệu'}</span>`;
            html += `</div>`;

            html += `</div></div><div class="day-divider"></div>`;
        }

        elements.fullTKB.innerHTML = html;
        elements.fullTKB.style.display = "block";
        this.innerHTML = '<i class="fas fa-times"></i> Ẩn toàn bộ';
    });
    
    // Xử lý sự kiện xoay màn hình
    window.addEventListener("orientationchange", function() {
        // Cập nhật lại kích thước canvas bầu trời sao
        resizeCanvas();

        // Cập nhật lại vị trí các phần tử
        setTimeout(function() {
            renderTodayTKB();
        }, 300);
    });
    
    // Thêm sự kiện touch để cải thiện trải nghiệm trên thiết bị cảm ứng
    document.addEventListener("touchstart", function() {}, {
        passive: true
    });
}

/* -------------------------
Initialization
------------------------- */
function initApp() {
    // Áp dụng chủ đề từ lưu trữ
    applyThemeFromStorage();
    
    // Khôi phục trạng thái làm mới tự động
    // Mặc định là bật nếu chưa có giá trị trong localStorage
    const savedAutoRefresh = localStorage.getItem('autoRefreshEnabled');
    if (savedAutoRefresh === null || savedAutoRefresh === 'true') {
        isAutoRefreshEnabled = true;
        autoRefreshInterval = setInterval(autoRefreshData, 10000);
        document.getElementById("menuAutoRefresh").innerHTML = 
            '<span class="menu-item-icon"><i class="fas fa-pause-circle"></i></span><span class="menu-item-text">Tắt làm mới tự động</span>';
        
        // Ẩn nút làm mới thủ công khi tự động được bật
        if (elements.refreshBtn) {
            elements.refreshBtn.style.display = "none";
        }
        
        // Lưu trạng thái vào localStorage
        localStorage.setItem('autoRefreshEnabled', 'true');
    }
    
    // Khởi tạo các thành phần
    initCanvas();
    initMenu();
    initPopup();
    initTabNavigation();
    initEventListeners();
    
    // Mở popup nếu cần
    openPopup(false);
    
    // Ẩn màn hình loading
    setTimeout(function() {
        elements.loadingScreen.style.opacity = "0";
        setTimeout(function() {
            elements.loadingScreen.style.display = "none";
        }, 500);
    }, 1500);
    
    // Tải dữ liệu từ API
    loadAllData();

    // Khởi tạo nút làm mới dữ liệu
    initRefreshButton();

    // Cập nhật TKB mỗi phút
    refreshTimer = setInterval(renderTodayTKB, 60 * 1000);
    
    // Áp dụng hiệu ứng xuất hiện cho các phần tử
    const fadeElements = document.querySelectorAll('.fade-in-text');
    fadeElements.forEach((element, index) => {
        setTimeout(function() {
            element.style.animationDelay = `${index * 0.1}s`;
        }, 100);
    });

    const animateElements = document.querySelectorAll('.animate-item');
    animateElements.forEach((element, index) => {
        setTimeout(function() {
            element.style.animationDelay = `${0.2 + index * 0.05}s`;
        }, 100);
    });

    // Tối ưu hóa cho thiết bị di động
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        // Thêm class mobile vào body để áp dụng CSS riêng
        document.body.classList.add("mobile-device");

        // Tối ưu hóa popup cho thiết bị di động
        elements.popupCard.style.maxHeight = "80vh";
        elements.popupCard.style.overflowY = "auto";
        elements.popupCard.style.webkitOverflowScrolling = "touch";

        // Tối ưu hóa các bảng để cuộn ngang nếu cần
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            const wrapper = document.createElement("div");
            wrapper.style.overflowX = "auto";
            wrapper.style.marginBottom = "10px";
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });

        // Tăng kích thước các nút bấm cho dễ thao tác
        const buttons = document.querySelectorAll('button, .menu-btn, #showFullBtn');
        buttons.forEach(button => {
            button.style.minHeight = "44px"; // Kích thước tối thiểu theo khuyến nghị của Apple
            button.style.minWidth = "44px";
        });

        // Tối ưu hóa menu cho thiết bị di động
        elements.menuPanel.style.maxHeight = "70vh";
        elements.menuPanel.style.overflowY = "auto";
    }
}
// --- Nút làm mới dữ liệu ---
function initRefreshButton() {
    const refreshBtn = elements.refreshBtn;
    if (!refreshBtn) return;

    refreshBtn.addEventListener("click", async () => {
        if (isLoading) return; // tránh spam
        
        // Thêm hiệu ứng xoay cho icon
        const icon = refreshBtn.querySelector('i');
        if (icon) {
            icon.classList.add('fa-spin');
        }
        
        await loadAllData(); // Gọi lại API và render toàn bộ dữ liệu mới
        
        // Ngừng hiệu ứng xoay
        if (icon) {
            icon.classList.remove('fa-spin');
        }
    });
}

// Khởi tạo ứng dụng khi DOM đã tải
document.addEventListener("DOMContentLoaded", initApp);

// Dọn dẹp khi trang bị đóng
window.addEventListener("beforeunload", () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    if (meteorInterval) {
        clearInterval(meteorInterval);
    }
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
});