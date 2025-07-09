let currentPageData = {
    total: 0,
    page: 1,
    limit: 10
};
$(document).ready(function () {
    let allData = [];
    let filteredData = [];

    function showLoading() {
        $("#data-table").html('<tr><td colspan="5" class="text-center"><i class="fa fa-spinner fa-spin"></i> Đang tải dữ liệu...</td></tr>');
    }

    function showError(message) {
        $("#data-table").html('<tr><td colspan="5" class="text-center text-danger">' + message + '</td></tr>');
    }

    function populateTable(data) {
        $("#data-table").empty();

        if (data.length === 0) {
            $("#data-table").html('<tr><td colspan="5" class="text-center text-muted">Không tìm thấy dữ liệu phù hợp</td></tr>');
            return;
        }

        $.each(data, function (index, item) {
            var row = '<tr>' +
                '<td>' + item.profile_id + '</td>' +
                '<td>' + item.profile_name + '</td>' +
                '<td>' + item.password + '</td>' +
                '<td>' + item.browser_id + '</td>' +
                '<td>' + item.status + '</td>' +
                '</tr>';

            $("#data-table").append(row);
        });
    }

    async function searchBtn() {
        const loading = document.getElementById("loading");
        const data_table = document.getElementById("data-table");
        var profileName = document.getElementById('searchProfileName').value;
        var profileId = document.getElementById('searchProfileId').value;
        const status = ($('#selectProfile').val() ?? "").toLowerCase();

        upLoading(loading, data_table)

        const profileNameArray = profileName.split("\n").map(k => k.trim()).filter(k => k !== "");
        const profileIdArray = profileId.split("\n").map(k => k.trim()).filter(k => k !== "");
        try {
            const response = await fetch("search__action", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    profileId: profileIdArray,
                    profileName: profileNameArray,
                    status: status
                })

            })

            if (!response.ok) {
                return
            }
            const result = await response.json();
            filteredData = result.data;
            total = result.total;
            page = result.page;
            limit = result.limit;

            stopLoading(loading);
            populateTable(filteredData);
            renderPaginate(total, page, limit);

        } catch (error) {
            data_table.innerHTML = `<div class="error">Lỗi xảy ra khi tìm kiếm</div>`;
        }
    }
    function upLoading(loading, data_table) {
        loading.style.display = "block";
        data_table.innerHTML = "";
    }
    function stopLoading(loading) {
        loading.style.display = "none";
    }
    function clearSearch() {
        $('#searchProfileName, #selectProfile, #searchProfileId').val('');
        getData();
    }

    function getData() {
        showLoading();
        $.ajax({
            url: "get_profile",
            method: 'GET',
            dataType: 'json',
            success: function (response) {
                console.log('API Response:', response);

                var result = response;

                page = result['page'];
                limit = result['limit'];
                allData = result['data'] || [];
                total = result['total'];
                console.log('total:', total);
                filteredData = [...allData];
                console.log('filteredData:', filteredData);
                populateTable(filteredData);
                renderPaginate(total, page, limit);

                currentPageData = { total, page, limit };
                showSummaryBar();
            },
            error: function (xhr, status, error) {
                console.error('API Error:', error);
                var errorMessage = 'Lỗi khi tải dữ liệu: ' + error;
                showError(errorMessage);
            },

        });

    }

    async function fetchPage(page) {
        try {
            const total = currentPageData.total;
            const limit = currentPageData.limit;
            const response = await fetch(`paginate_page/${page}?total=${total}&limit=${limit}`, {
                method: "GET",
            })

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            }

            const result = await response.json()
            const data = result.result
            setTimeout(() => {
                renderPaginate(total, page, limit);
                populateTable(data);
                window.addEventListener('load', () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }, 100);

        } catch (error) {

        }
    }

    function renderPaginate(total, page, limit) {
        const pages = Math.ceil(total / limit);
        const current = page;
        let html = '';
        html += `<li class="previous"><a href="#" class="big-arrow">&laquo;</a></li>`;
        for (let i = 1; i <= pages; i++) {
            html += `<li><button   ${i === current ? 'disabled' : ''}>${i}</button></li>`;
        }
        html += `<li class="next"><a href="#" class="big-arrow">&raquo;</a></li>`;
        document.getElementById("paginate_page").innerHTML = `<ul>${html}</ul>`;

        currentPageData = { total, page, limit };
    }
    function showSummaryBar() {
        const total = currentPageData.total;
        const summary_bar_total = document.querySelector('.summary-bar-total');
        summary_bar_total.textContent = `${total}`;
    }
    function refreshPage() {
        clearSearch();
        getData();
    }
    // Event handlers
    $('#btnSearch').click(searchBtn);
    $('#btnRefresh').click(getData);
    $('#btnClear').click(clearSearch);
    $('#btnRefresh').click(refreshPage)
    $('#paginate_page').on('click', 'button', function () {
        const page = parseInt($(this).text());
        fetchPage(page);
    });

    $('#searchProfileName, #searchBrowserId, #searchProfileId').keypress(function (e) {
        if (e.which === 13) {
            timKiem();
        }
    });
    getData();
});
