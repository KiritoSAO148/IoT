document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("#dataTable tbody");
  const itemsPerPage = 20;
  let currentPage = 1;
  let sortBy = "id";

  function renderTable(startIndex, endIndex, data) {
    tableBody.innerHTML = "";

    for (let i = startIndex; i < endIndex; i++) {
      const rowData = data[i];
      if (!rowData) break;

      const row = document.createElement("tr");
      Object.values(rowData).forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });

      tableBody.appendChild(row);
    }
  }

  function renderPagination(totalPages) {
    // const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginationContainer = document.querySelector(".pagination");
    paginationContainer.innerHTML = "";

    const maxVisiblePages = 5;
    const halfMaxVisiblePages = Math.floor(maxVisiblePages / 2);
    const startPage = Math.max(1, currentPage - halfMaxVisiblePages);
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    const previousButton = document.createElement("a");
    previousButton.href = "#";
    previousButton.textContent = "Previous";
    previousButton.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;
        renderTable(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        );
        renderPagination(totalPages);
      }
    });

    if (currentPage > 1) {
      paginationContainer.appendChild(previousButton);
    } else {
      const disabledPreviousButton = document.createElement("span");
      disabledPreviousButton.textContent = "Previous";
      disabledPreviousButton.classList.add("disabled");
      paginationContainer.appendChild(disabledPreviousButton);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageLink = document.createElement("a");
      pageLink.href = "#";
      pageLink.textContent = i;

      if (i === currentPage) {
        pageLink.classList.add("active");
      }

      pageLink.addEventListener("click", function () {
        currentPage = i;
        // renderTable(
        //   (currentPage - 1) * itemsPerPage,
        //   currentPage * itemsPerPage
        // );
        // renderPagination();
        fetchDataAndRender(totalPages);
      });

      paginationContainer.appendChild(pageLink);
    }

    const nextButton = document.createElement("a");
    nextButton.href = "#";
    nextButton.textContent = "Next";
    nextButton.addEventListener("click", function () {
      if (currentPage < totalPages) {
        currentPage++;
        renderTable(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        );
        renderPagination(totalPages);
      }
    });

    if (currentPage < totalPages) {
      paginationContainer.appendChild(nextButton);
    } else {
      const disabledNextButton = document.createElement("span");
      disabledNextButton.textContent = "Next";
      disabledNextButton.classList.add("disabled");
      paginationContainer.appendChild(disabledNextButton);
    }
  }

  // Initial render
  // renderTable(0, itemsPerPage);
  // renderPagination();

  function fetchDataAndRender() {
    const apiUrl = "http://localhost:3000/api/v1/history-sensor";

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        data.reverse();

        data.sort((a, b) => {
          if (a[sortBy] < b[sortBy]) return -1;
          if (a[sortBy] > b[sortBy]) return 1;
          return 0;
        });

        renderTable(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage,
          data
        );
        renderPagination(Math.ceil(data.length / itemsPerPage));
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  const sortCategorySelect = document.getElementById("sortCategory");
  sortCategorySelect.addEventListener("change", function () {
    sortBy = sortCategorySelect.value;
    currentPage = 1;
    fetchDataAndRender();
  });

  fetchDataAndRender();

  function searchDataAndRender() {
    const searchCategorySelect = document.getElementById("searchCategory");
    const searchInput = document
      .getElementById("searchInput")
      .value.toLowerCase();
    const searchCategory = searchCategorySelect.value;

    fetchSearchDataAndRender(searchCategory, searchInput);
  }

  function fetchSearchDataAndRender(searchCategory = "all", searchInput = "") {
    const apiUrl = "http://localhost:3000/api/v1/history-sensor";

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        data.reverse();

        // Apply search filter
        data = data.filter((item) => {
          if (searchCategory === "all") {
            return (
              String(item.temperature).toLowerCase().includes(searchInput) ||
              String(item.humidity).toLowerCase().includes(searchInput) ||
              String(item.light).toLowerCase().includes(searchInput) ||
              String(item.date).toLowerCase().includes(searchInput) ||
              String(item.time).toLowerCase().includes(searchInput)
            );
          } else {
            return String(item[searchCategory])
              .toLowerCase()
              .includes(searchInput);
          }
        });

        renderTable(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage,
          data
        );
        renderPagination(Math.ceil(data.length / itemsPerPage));
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  const searchButton = document.getElementById("searchButton");
  searchButton.addEventListener("click", searchDataAndRender);
});
