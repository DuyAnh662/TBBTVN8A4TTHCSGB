// admin.js - Tối ưu hiệu suất và trải nghiệm người dùng
document.addEventListener("DOMContentLoaded", () => {
  // Cache DOM elements
  const elements = {
    loginBox: document.getElementById("login-box"),
    adminPanel: document.getElementById("admin-panel"),
    loginMsg: document.getElementById("loginMsg"),
    loginForm: document.getElementById("loginForm"),
    logoutBtn: document.getElementById("logoutBtn"),
    // BTVN elements
    btvnForm: document.getElementById("btvnForm"),
    subject: document.getElementById("subject"),
    btvn_content: document.getElementById("btvn_content"),
    updateBTVN: document.getElementById("updateBTVN"),
    addNewBTVN: document.getElementById("addNewBTVN"),
    // TKB elements
    tkbForm: document.getElementById("tkbForm"),
    tkb_day: document.getElementById("tkb_day"),
    tkb_truc: document.getElementById("tkb_truc"),
    periodsContainer: document.getElementById("periodsContainer"),
    addPeriod: document.getElementById("addPeriod"),
    updateTKB: document.getElementById("updateTKB"),
    addNewTKB: document.getElementById("addNewTKB"),
    // Changelog elements
    changelogForm: document.getElementById("changelogForm"),
    changelog_text: document.getElementById("changelog_text"),
    updateChangelog: document.getElementById("updateChangelog"),
    addNewChangelog: document.getElementById("addNewChangelog"),
    // Data viewer
    refreshData: document.getElementById("refreshData"),
    dataViewer: document.getElementById("dataViewer")
  };
// Hàm băm SHA-256 trả về chuỗi hex
async function sha256Hex(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
  // ----- LOGIN -----
  // Kiểm tra trạng thái đăng nhập
  if (localStorage.getItem("adminLogged") === "true") {
    showAdmin();
  }

  // Xử lý form đăng nhập
  elements.loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin();
  });

  // Xử lý đăng xuất
  elements.logoutBtn.addEventListener("click", handleLogout);

async function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    elements.loginMsg.textContent = "Vui lòng nhập tên đăng nhập và mật khẩu!";
    showToast("Vui lòng nhập đủ thông tin", "error");
    return;
  }

  const enteredHash = await sha256Hex(password);

  if (username === CONFIG.ADMIN_USERNAME && enteredHash === CONFIG.ADMIN_PASSWORD_HASH) {
    localStorage.setItem("adminLogged", "true");
    showAdmin();
    showToast("Đăng nhập thành công", "success");
  } else {
    elements.loginMsg.textContent = "Sai tài khoản hoặc mật khẩu!";
    showToast("Sai tài khoản hoặc mật khẩu", "error");
  }
}

  function handleLogout() {
    localStorage.removeItem("adminLogged");
    showToast("Đã đăng xuất", "info");
    setTimeout(() => location.reload(), 1000);
  }

  function showAdmin() {
    elements.loginBox.style.display = "none";
    elements.adminPanel.style.display = "block";
    // Thêm hiệu ứng fade-in cho các phần tử
    document.querySelectorAll('.card').forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-in');
      }, index * 100);
    });
  }

  // ----- TOAST -----
  function showToast(message, type = "info") {
    // Xóa toast cũ nếu có
    const existingToast = document.querySelector(".toast");
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Hiển thị toast
    setTimeout(() => toast.classList.add("show"), 10);

    // Ẩn toast sau một khoảng thời gian
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
  }

  // ----- BTVN -----
  function getBTVNData() {
    return {
      subject: elements.subject.value,
      content: elements.btvn_content.value,
      note: ""
    };
  }

  // Cập nhật BTVN (ghi đè)
  elements.updateBTVN.addEventListener("click", () => {
    const data = getBTVNData();
    if (!data.subject || !data.content) {
      showToast("Vui lòng nhập đầy đủ thông tin", "error");
      return;
    }
    postData({ action: "overwriteBTVN", item: data });
  });

  // Thêm mới BTVN
  elements.addNewBTVN.addEventListener("click", () => {
    const data = getBTVNData();
    if (!data.subject || !data.content) {
      showToast("Vui lòng nhập đầy đủ thông tin", "error");
      return;
    }
    postData({ action: "addBTVN", item: data });
  });

  // ----- TKB -----
  elements.addPeriod.addEventListener("click", addPeriod);
  elements.updateTKB.addEventListener("click", () => saveAllPeriods(true));
  elements.addNewTKB.addEventListener("click", () => saveAllPeriods(false));

  function addPeriod() {
    const periodRow = document.createElement("div");
    periodRow.className = "period-row fade-in";
    periodRow.innerHTML = `
      <select class="period-buoi" required>
        <option value="Sáng">Sáng</option>
        <option value="Chiều">Chiều</option>
      </select>
      <select class="period-tiet" required>
        ${[1, 2, 3, 4, 5].map(i => `<option value="${i}">Tiết ${i}</option>`).join("")}
      </select>
      <select class="period-subject" required>
        <option value="">-- Môn học --</option>
        <option value="Toán">Toán</option>
        <option value="Ngữ văn">Ngữ văn</option>
        <option value="Tiếng Anh">Tiếng Anh</option>
        <option value="Vật lý">Vật lý</option>
        <option value="Hóa học">Hóa học</option>
        <option value="Sinh học">Sinh học</option>
        <option value="Lịch sử">Lịch sử</option>
        <option value="Địa lý">Địa lý</option>
        <option value="GDCD">GDCD</option>
        <option value="Tin học">Tin học</option>
        <option value="Công nghệ">Công nghệ</option>
        <option value="Thể dục">Thể dục</option>
        <option value="Nghỉ">Nghỉ</option>
      </select>
      <button type="button" class="removePeriod" aria-label="Xóa tiết">❌</button>
    `;
    
    periodRow.querySelector(".removePeriod").addEventListener("click", () => {
      periodRow.style.transform = "translateX(100%)";
      periodRow.style.opacity = "0";
      setTimeout(() => periodRow.remove(), 300);
    });
    
    elements.periodsContainer.appendChild(periodRow);
  }

  async function saveAllPeriods(overwrite) {
    const day = elements.tkb_day.value;
    const truc = elements.tkb_truc.value;
    const periodRows = elements.periodsContainer.querySelectorAll(".period-row");

    if (!day || periodRows.length === 0) {
      showToast("Chọn thứ và nhập ít nhất 1 tiết", "error");
      return;
    }
    
    if (!truc) {
      showToast("Chọn tổ trực cho ngày này", "error");
      return;
    }

    // Thu thập dữ liệu các tiết
    const periods = [];
    let hasError = false;
    
    periodRows.forEach(row => {
      const buoi = row.querySelector(".period-buoi").value;
      const tiet = row.querySelector(".period-tiet").value;
      const subject = row.querySelector(".period-subject").value;
      
      if (!subject) {
        showToast("Vui lòng chọn môn học cho tất cả các tiết", "error");
        hasError = true;
        return;
      }
      
      periods.push({ buoi, tiet, subject });
    });
    
    if (hasError) return;

    postData({
      action: "updateTKB",
      item: { day, truc, periods: JSON.stringify(periods) },
      overwrite: overwrite
    });
  }

  // ----- CHANGELOG -----
  function getChangelogData() {
    return { text: elements.changelog_text.value };
  }

  elements.updateChangelog.addEventListener("click", () => {
    const data = getChangelogData();
    if (!data.text) {
      showToast("Vui lòng nhập nội dung changelog", "error");
      return;
    }
    postData({ action: "updateChangelog", item: data, overwrite: true });
  });

  elements.addNewChangelog.addEventListener("click", () => {
    const data = getChangelogData();
    if (!data.text) {
      showToast("Vui lòng nhập nội dung changelog", "error");
      return;
    }
    postData({ action: "updateChangelog", item: data, overwrite: false });
  });

  // ----- DATA VIEWER -----
  elements.refreshData.addEventListener("click", loadData);

  // ----- COMMON -----
  async function postData(data) {
    if (window.isLoading) {
      showToast("Đang xử lý yêu cầu trước đó, vui lòng đợi...", "info");
      return;
    }
    
    window.isLoading = true;
    
    try {
      const formData = new FormData();
      formData.append("action", data.action);
      formData.append("overwrite", data.overwrite ? "true" : "false");

      if (data.item) {
        for (let key in data.item) {
          formData.append(key, data.item[key] ?? "");
        }
      }

      // Hiển thị trạng thái đang tải
      showToast("Đang xử lý...", "info");
      
      const response = await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        body: formData
      });
      
      const result = await response.json();
      console.log("RESPONSE:", result);

      if (result.status === "success") {
        showToast("✅ " + (result.result?.action || "Thành công"), "success");
        loadData();
      } else {
        showToast("❌ " + (result.message || "Lỗi không rõ"), "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("⚠️ Gửi thất bại: " + error.message, "error");
    } finally {
      window.isLoading = false;
    }
  }

  async function loadData() {
    const dataViewer = elements.dataViewer;
    dataViewer.textContent = "Đang tải dữ liệu...";
    
    try {
      const response = await fetch(CONFIG.SCRIPT_URL + "?action=getAll");
      const data = await response.json();
      dataViewer.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      dataViewer.textContent = "Lỗi: " + error.message;
    }
  }

  // Tải dữ liệu ban đầu
  loadData();
});