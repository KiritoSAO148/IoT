document.addEventListener("DOMContentLoaded", function () {
  let sortDirection = "asc";
  let sortField = "id"; // Mặc định sort theo cột "id"
  let currentPage = 1; // Lưu trang hiện tại
  let keyword = "";
  let searchField = "all";

  document.querySelectorAll(".sortable").forEach((th) => {
    th.addEventListener("click", () => {
      sortField = th.dataset.field; // Lấy giá trị sortField từ thuộc tính data-field của tiêu đề cột
      sortDirection = sortDirection === "asc" ? "desc" : "asc";

      getDataForPage(currentPage); // Truyền sortField vào hàm getDataForPage
    });
  });

  function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  function displayData(data) {
    const tableBody = document.querySelector("#dataTable tbody");
    tableBody.innerHTML = "";

    data.forEach((row) => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${row.id}</td>
        <td>${row.device_name.toUpperCase()}</td>
        <td>${row.status === "1" ? "ON" : "OFF"}</td>
        <td>${formatDateTime(row.created_at)}</td>
      `;
      tableBody.appendChild(newRow);
    });
  }

  function getDataForPage(page, pageSize) {
    const sortBy = sortDirection;
    keyword = document.getElementById("searchInput").value;
    searchField = document.getElementById("searchCategory").value;

    fetch(
      `http://localhost:3000/api/v1/history-action?page=${page}&pageSize=${pageSize}&sortField=${sortField}&sortBy=${sortBy}&keyword=${keyword}&searchField=${searchField}`
    )
      .then((response) => response.json())
      .then((data) => {
        displayData(data.data);
        updatePagination(data.pagination);
        currentPage = page;
      })
      .catch((error) => console.error("Error:", error));
  }

  const searchButton = document.getElementById("searchButton");
  searchButton.addEventListener("click", function () {
    // Gọi hàm getDataForPage để lấy dữ liệu với trang đầu tiên
    getDataForPage(1, 10);
  });

  const paginationContainer = document.querySelector(".pagination");

  // Hàm cập nhật giao diện phân trang
  function updatePagination(pagination) {
    paginationContainer.innerHTML = "";

    const { currentPage, totalPages } = pagination;
    const maxVisiblePages = 5; // Số lượng trang tối đa được hiển thị

    let startPage = currentPage - Math.floor(maxVisiblePages / 2);
    startPage = Math.max(startPage, 1);
    let endPage = startPage + maxVisiblePages - 1;
    endPage = Math.min(endPage, totalPages);

    for (let i = startPage; i <= endPage; i++) {
      const pageLink = document.createElement("a");
      pageLink.href = "#";
      pageLink.textContent = i;
      if (i === currentPage) {
        pageLink.classList.add("active");
      }
      pageLink.addEventListener("click", () => {
        getDataForPage(i, 10);
      });
      paginationContainer.appendChild(pageLink);
    }

    if (startPage > 1) {
      const prevLink = document.createElement("a");
      prevLink.href = "#";
      prevLink.textContent = "Prev";
      prevLink.addEventListener("click", () => {
        getDataForPage(currentPage - 1, 10);
      });
      paginationContainer.prepend(prevLink);
    }

    if (endPage < totalPages) {
      const nextLink = document.createElement("a");
      nextLink.href = "#";
      nextLink.textContent = "Next";
      nextLink.addEventListener("click", () => {
        getDataForPage(currentPage + 1, 10);
      });
      paginationContainer.appendChild(nextLink);
    }
  }

  // Gọi hàm lấy dữ liệu cho trang đầu tiên khi trang được tải

  getDataForPage(1, 10); // Gọi hàm với sortField mặc định là "id"
});
