/* =====================================================
   LostLink - Smart Lost & Found Portal
   script.js
===================================================== */

// ⚠️ Replace this with your actual API Gateway invoke URL
const API_BASE_URL = "https://6bazzmwda3.execute-api.ap-south-1.amazonaws.com/";

let allItems = [];
let selectedImageBase64 = null;
let selectedImageName = null;
let itemIdPendingDelete = null;

/* =====================================================
   INIT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMobileMenu();
  initUploadBox();
  initFormSubmit();
  initSearchAndFilter();
  initModals();
  initBackToTop();
  initSmoothScroll();

  fetchItems();
});

/* =====================================================
   LOADING OVERLAY
===================================================== */

function hideLoadingOverlay() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.add("hide");
}

function showLoadingOverlay() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.remove("hide");
}

/* =====================================================
   TOAST NOTIFICATIONS
===================================================== */

let toastTimeout = null;

function showToast(title, message, type = "success") {
  const toast = document.getElementById("toast");
  const icon = document.getElementById("toastIcon");
  const toastTitle = document.getElementById("toastTitle");
  const toastMessage = document.getElementById("toastMessage");

  toastTitle.textContent = title;
  toastMessage.textContent = message;

  toast.classList.remove("error");
  if (type === "error") {
    toast.classList.add("error");
    icon.className = "fa-solid fa-circle-exclamation";
  } else {
    icon.className = "fa-solid fa-circle-check";
  }

  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

/* =====================================================
   FETCH ALL ITEMS (GET /items)
===================================================== */

async function fetchItems() {
  showLoadingOverlay();

  try {
    const res = await fetch(`${API_BASE_URL}/items`);

    if (!res.ok) throw new Error("Failed to fetch items");

    const data = await res.json();

    allItems = Array.isArray(data) ? data : [];

    renderItems(allItems);
    updateStats(allItems);
  } catch (err) {
    console.error(err);
    showToast("Error", "Could not load items. Please try again.", "error");
    renderItems([]);
    updateStats([]);
  } finally {
    hideLoadingOverlay();
  }
}

/* =====================================================
   STATS
===================================================== */

function updateStats(items) {
  const total = items.length;
  const lost = items.filter((i) => i.Status === "Lost").length;
  const found = items.filter((i) => i.Status === "Found").length;
  const returned = items.filter((i) => i.Status === "Returned").length;

  animateCount("totalItems", total);
  animateCount("lostItems", lost);
  animateCount("foundItems", found);
  animateCount("returnedItems", returned);
}

function animateCount(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;

  let current = 0;
  const step = Math.max(1, Math.ceil(target / 30));

  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.textContent = current;
  }, 25);
}

/* =====================================================
   RENDER ITEM CARDS
===================================================== */

function renderItems(items) {
  const container = document.getElementById("itemsContainer");
  const emptyState = document.getElementById("emptyState");

  container.innerHTML = "";

  if (!items || items.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.dataset.id = item.ItemID;

    const statusClass = item.Status === "Found" ? "found" : "lost";

    card.innerHTML = `
      <div class="item-image">
        <img src="${escapeHtml(item.ImageURL)}" alt="${escapeHtml(item.ItemTitle)}" loading="lazy" />
        <span class="status-badge ${statusClass}">${escapeHtml(item.Status)}</span>
      </div>
      <div class="item-content">
        <h3>${escapeHtml(item.ItemTitle)}</h3>
        <p class="item-description">${truncate(escapeHtml(item.Description), 90)}</p>
        <div class="item-info">
          <i class="fa-solid fa-location-dot"></i>
          <span>${escapeHtml(item.Location)}</span>
        </div>
        <div class="item-info">
          <i class="fa-solid fa-user"></i>
          <span>${escapeHtml(item.ConcernPerson)}</span>
        </div>
        <div class="item-footer">
          <div class="item-phone">
            <i class="fa-solid fa-phone"></i>
            <span>${escapeHtml(item.Phone)}</span>
          </div>
          <button class="view-btn" data-id="${item.ItemID}">
            <i class="fa-solid fa-eye"></i>
            View
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  // Attach view button listeners
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => openItemModal(btn.dataset.id));
  });
}

function truncate(text, length) {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "…" : text;
}

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* =====================================================
   SEARCH & FILTER
===================================================== */

function initSearchAndFilter() {
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");

  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;

    const filtered = allItems.filter((item) => {
      const matchesQuery = item.ItemTitle.toLowerCase().includes(query);
      const matchesStatus = status === "All" || item.Status === status;
      return matchesQuery && matchesStatus;
    });

    renderItems(filtered);
  }

  searchInput.addEventListener("input", applyFilters);
  statusFilter.addEventListener("change", applyFilters);
}

/* =====================================================
   IMAGE UPLOAD (DRAG & DROP + CLICK)
===================================================== */

function initUploadBox() {
  const uploadBox = document.getElementById("uploadBox");
  const imageInput = document.getElementById("imageInput");
  const chooseImageBtn = document.getElementById("chooseImage");
  const previewImage = document.getElementById("previewImage");

  chooseImageBtn.addEventListener("click", () => imageInput.click());
  uploadBox.addEventListener("click", (e) => {
    if (e.target === uploadBox || e.target.tagName === "I" || e.target.tagName === "H3" || e.target.tagName === "P") {
      imageInput.click();
    }
  });

  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handleImageFile(file, previewImage);
  });

  ["dragenter", "dragover"].forEach((evt) => {
    uploadBox.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadBox.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach((evt) => {
    uploadBox.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadBox.classList.remove("dragover");
    });
  });

  uploadBox.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file, previewImage);
  });
}

function handleImageFile(file, previewImage) {
  if (!file.type.startsWith("image/")) {
    showToast("Invalid File", "Please select a valid image file.", "error");
    return;
  }

  selectedImageName = file.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    selectedImageBase64 = e.target.result; // includes data:...;base64, prefix
    previewImage.src = selectedImageBase64;
    previewImage.classList.add("show");
  };
  reader.readAsDataURL(file);
}

/* =====================================================
   FORM SUBMIT (POST /item)
===================================================== */

function initFormSubmit() {
  const form = document.getElementById("reportForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const itemTitle = document.getElementById("itemTitle").value.trim();
    const concernPerson = document.getElementById("concernPerson").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const location = document.getElementById("location").value.trim();
    const description = document.getElementById("description").value.trim();
    const status = document.getElementById("status").value;

    if (!selectedImageBase64 || !selectedImageName) {
      showToast("Image Required", "Please upload an image of the item.", "error");
      return;
    }

    const payload = {
      ItemTitle: itemTitle,
      Description: description,
      ConcernPerson: concernPerson,
      Location: location,
      Status: status,
      Phone: phone,
      ImageName: selectedImageName,
      ImageData: selectedImageBase64,
    };

    const submitBtn = form.querySelector(".submit-btn");
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting...`;

    try {
      const res = await fetch(`${API_BASE_URL}/item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Upload failed");

      showToast("Success", "Item reported successfully!", "success");

      form.reset();
      selectedImageBase64 = null;
      selectedImageName = null;
      const previewImage = document.getElementById("previewImage");
      previewImage.src = "";
      previewImage.classList.remove("show");

      await fetchItems();

      document.getElementById("browse").scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error(err);
      showToast("Error", "Could not submit item. Please try again.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  });
}

/* =====================================================
   ITEM DETAILS MODAL (GET /item?id=)
===================================================== */

function initModals() {
  const itemModal = document.getElementById("itemModal");
  const closeModal = document.getElementById("closeModal");
  const deleteModal = document.getElementById("deleteModal");
  const deleteItemBtn = document.getElementById("deleteItemBtn");
  const cancelDelete = document.getElementById("cancelDelete");
  const confirmDelete = document.getElementById("confirmDelete");

  closeModal.addEventListener("click", () => itemModal.classList.remove("show"));

  itemModal.addEventListener("click", (e) => {
    if (e.target === itemModal) itemModal.classList.remove("show");
  });

  deleteItemBtn.addEventListener("click", () => {
    itemIdPendingDelete = itemModal.dataset.currentId;
    itemModal.classList.remove("show");
    deleteModal.classList.add("show");
  });

  cancelDelete.addEventListener("click", () => {
    deleteModal.classList.remove("show");
    itemIdPendingDelete = null;
  });

  deleteModal.addEventListener("click", (e) => {
    if (e.target === deleteModal) deleteModal.classList.remove("show");
  });

  confirmDelete.addEventListener("click", () => {
    if (itemIdPendingDelete) deleteItem(itemIdPendingDelete);
  });
}

async function openItemModal(itemId) {
  const itemModal = document.getElementById("itemModal");

  showLoadingOverlay();

  try {
    const res = await fetch(`${API_BASE_URL}/item?id=${encodeURIComponent(itemId)}`);

    if (!res.ok) throw new Error("Item not found");

    const item = await res.json();

    document.getElementById("modalImage").src = item.ImageURL;
    document.getElementById("modalTitle").textContent = item.ItemTitle;
    document.getElementById("modalDescription").textContent = item.Description;
    document.getElementById("modalPerson").textContent = item.ConcernPerson;
    document.getElementById("modalPhone").textContent = item.Phone;
    document.getElementById("modalLocation").textContent = item.Location;

    const statusEl = document.getElementById("modalStatus");
    statusEl.textContent = item.Status;
    statusEl.className = "status-badge " + (item.Status === "Found" ? "found" : "lost");

    itemModal.dataset.currentId = item.ItemID;
    itemModal.classList.add("show");
  } catch (err) {
    console.error(err);
    showToast("Error", "Could not load item details.", "error");
  } finally {
    hideLoadingOverlay();
  }
}

/* =====================================================
   DELETE ITEM (DELETE /item?id=)
===================================================== */

async function deleteItem(itemId) {
  const deleteModal = document.getElementById("deleteModal");
  const confirmBtn = document.getElementById("confirmDelete");
  const originalHtml = confirmBtn.innerHTML;

  confirmBtn.disabled = true;
  confirmBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Deleting...`;

  try {
    const res = await fetch(`${API_BASE_URL}/item?id=${encodeURIComponent(itemId)}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Delete failed");

    showToast("Deleted", "Item has been removed successfully.", "success");

    deleteModal.classList.remove("show");
    itemIdPendingDelete = null;

    await fetchItems();
  } catch (err) {
    console.error(err);
    showToast("Error", "Could not delete item. Please try again.", "error");
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = originalHtml;
  }
}

/* =====================================================
   DARK MODE TOGGLE
===================================================== */

function initTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const icon = themeToggle.querySelector("i");

  const savedTheme = getStoredTheme();
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    icon.className = "fa-solid fa-sun";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    storeTheme(isDark ? "dark" : "light");
  });
}

// In-memory theme store (localStorage is unavailable in this sandboxed
// preview). Replace with localStorage on your own hosted deployment if desired.
let inMemoryTheme = null;
function getStoredTheme() {
  return inMemoryTheme;
}
function storeTheme(value) {
  inMemoryTheme = value;
}

/* =====================================================
   MOBILE MENU
===================================================== */

function initMobileMenu() {
  const menuBtn = document.querySelector(".menu-btn");
  const closeMenuBtn = document.getElementById("closeMenu");
  const mobileMenu = document.getElementById("mobileMenu");
  const menuBackdrop = document.getElementById("menuBackdrop");

  function openMenu() {
    mobileMenu.classList.add("show");
    menuBackdrop.classList.add("show");
  }

  function closeMenu() {
    mobileMenu.classList.remove("show");
    menuBackdrop.classList.remove("show");
  }

  menuBtn.addEventListener("click", openMenu);
  closeMenuBtn.addEventListener("click", closeMenu);
  menuBackdrop.addEventListener("click", closeMenu);

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

/* =====================================================
   BACK TO TOP
===================================================== */

function initBackToTop() {
  const backToTop = document.getElementById("backToTop");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* =====================================================
   SMOOTH SCROLL FOR NAV LINKS
===================================================== */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });
}
