"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() { }; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  /* function testWebP(callback) {
  var webP = new Image();
  webP.onload = webP.onerror = function () {
  callback(webP.height == 2);
  };
  webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
  }
  testWebP(function (support) {
  if (support == true) {
  document.querySelector('body').classList.add('webp');
  }else{
  document.querySelector('body').classList.add('no-webp');
  }
  });*/

  feather.replace();

  (function () {
    var sidebar = document.querySelector('.sidebar'),
      catSubMenu = document.querySelector('.cat-sub-menu'),
      sidebarBtns = document.querySelectorAll('.sidebar-toggle');

    var _iterator = _createForOfIteratorHelper(sidebarBtns),
      _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var sidebarBtn = _step.value;

        if (sidebarBtn && catSubMenu && sidebarBtn) {
          sidebarBtn.addEventListener('click', function () {
            var _iterator2 = _createForOfIteratorHelper(sidebarBtns),
              _step2;

            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var sdbrBtn = _step2.value;
                sdbrBtn.classList.toggle('rotated');
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }

            sidebar.classList.toggle('hidden');
            catSubMenu.classList.remove('visible');
          });
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  })();

  // (function () {
  //   var showMenu = document.querySelector('.lang-switcher');
  //   var langMenu = document.querySelector('.lang-menu');
  //   var layer = document.querySelector('.layer');

  //   if (showMenu) {
  //     showMenu.addEventListener('click', function () {
  //       langMenu.classList.add('active');
  //       layer.classList.add('active');
  //     });

  //     if (layer) {
  //       layer.addEventListener('click', function (e) {
  //         if (langMenu.classList.contains('active')) {
  //           langMenu.classList.remove('active');
  //           layer.classList.remove('active');
  //         }
  //       });
  //     }
  //   }
  // })();

  // (function () {
  //   var userDdBtnList = document.querySelectorAll('.dropdown-btn');
  //   var userDdList = document.querySelectorAll('.users-item-dropdown');
  //   var layer = document.querySelector('.layer');
  //   let dropdown = document.getElementById('profile')
  //   dropdown.addEventListener('click', function (e) {
  //     console.log('hi', userDdList)
  //     profile.classList.add('active');
  //   })

  // if (userDdList && userDdBtnList) {
  //   var _iterator3 = _createForOfIteratorHelper(userDdBtnList),
  //     _step3;

  //   try {
  //     for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
  //       var userDdBtn = _step3.value;
  //       userDdBtn.addEventListener('click', function (e) {
  //         layer.classList.add('active');

  //         var _iterator4 = _createForOfIteratorHelper(userDdList),
  //           _step4;

  //         try {
  //           for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
  //             var userDd = _step4.value;

  //             if (e.currentTarget.nextElementSibling == userDd) {
  //               if (userDd.classList.contains('active')) {
  //                 userDd.classList.remove('active');
  //               } else {
  //                 userDd.classList.add('active');
  //               }
  //             } else {
  //               userDd.classList.remove('active');
  //             }
  //           }
  //         } catch (err) {
  //           _iterator4.e(err);
  //         } finally {
  //           _iterator4.f();
  //         }
  //       });
  //     }
  //   } catch (err) {
  //     _iterator3.e(err);
  //   } finally {
  //     _iterator3.f();
  //   }
  // }

  // if (layer) {
  //   layer.addEventListener('click', function (e) {
  //     var _iterator5 = _createForOfIteratorHelper(userDdList),
  //       _step5;

  //     try {
  //       for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
  //         var userDd = _step5.value;

  //         if (userDd.classList.contains('active')) {
  //           userDd.classList.remove('active');
  //           layer.classList.remove('active');
  //         }
  //       }
  //     } catch (err) {
  //       _iterator5.e(err);
  //     } finally {
  //       _iterator5.f();
  //     }
  //   });
  // }
  // })();

  (function () {
    Chart.defaults.backgroundColor = '#000';
    var darkMode = localStorage.getItem('darkMode');
    var darkModeToggle = document.querySelector('.theme-switcher');

    var enableDarkMode = function enableDarkMode() {
      document.body.classList.add('darkmode');
      localStorage.setItem('darkMode', 'enabled');
    };

    var disableDarkMode = function disableDarkMode() {
      document.body.classList.remove('darkmode');
      localStorage.setItem('darkMode', null);
    };

    if (darkMode === 'enabled') {
      enableDarkMode();
    }

    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', function () {
        darkMode = localStorage.getItem('darkMode');

        if (darkMode !== 'enabled') {
          enableDarkMode();
        } else {
          disableDarkMode();
        }

        addData();
      });
    }
  })();

  (function () {
    var checkAll = document.querySelector('.check-all');
    var checkers = document.querySelectorAll('.check');

    if (checkAll && checkers) {
      checkAll.addEventListener('change', function (e) {
        var _iterator6 = _createForOfIteratorHelper(checkers),
          _step6;

        try {
          for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
            var checker = _step6.value;

            if (checkAll.checked) {
              checker.checked = true;
              checker.parentElement.parentElement.parentElement.classList.add('active');
            } else {
              checker.checked = false;
              checker.parentElement.parentElement.parentElement.classList.remove('active');
            }
          }
        } catch (err) {
          _iterator6.e(err);
        } finally {
          _iterator6.f();
        }
      });

      var _iterator7 = _createForOfIteratorHelper(checkers),
        _step7;

      try {
        var _loop = function _loop() {
          var checker = _step7.value;
          checker.addEventListener('change', function (e) {
            checker.parentElement.parentElement.parentElement.classList.toggle('active');

            if (!checker.checked) {
              checkAll.checked = false;
            }

            var totalCheckbox = document.querySelectorAll('.users-table .check');
            var totalChecked = document.querySelectorAll('.users-table .check:checked');

            if (totalCheckbox && totalChecked) {
              if (totalCheckbox.length == totalChecked.length) {
                checkAll.checked = true;
              } else {
                checkAll.checked = false;
              }
            }
          });
        };

        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
    }
  })();

  (function () {
    var checkAll = document.querySelector('.check-all');
    var checkers = document.querySelectorAll('.check');
    var checkedSum = document.querySelector('.checked-sum');

    if (checkedSum && checkAll && checkers) {
      checkAll.addEventListener('change', function (e) {
        var totalChecked = document.querySelectorAll('.users-table .check:checked');
        checkedSum.textContent = totalChecked.length;
      });

      var _iterator8 = _createForOfIteratorHelper(checkers),
        _step8;

      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var checker = _step8.value;
          checker.addEventListener('change', function (e) {
            var totalChecked = document.querySelectorAll('.users-table .check:checked');
            checkedSum.textContent = totalChecked.length;
          });
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }
    }
  })();

  var charts = {};
  var gridLine;
  var titleColor;

  (function () {
    /* Add gradient to chart */
    var width, height, gradient;

    function getGradient(ctx, chartArea) {
      var chartWidth = chartArea.right - chartArea.left;
      var chartHeight = chartArea.bottom - chartArea.top;

      if (gradient === null || width !== chartWidth || height !== chartHeight) {
        width = chartWidth;
        height = chartHeight;
        gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.4)');
      }

      return gradient;
    }
    /* Visitors chart */


    var ctx = document.getElementById('myChart');

    if (ctx) {
      var myCanvas = ctx.getContext('2d');
      var myChart = new Chart(myCanvas, {
        type: 'line',
        data: {
          labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Last 6 months',
            data: [35, 27, 40, 15, 30, 25, 45],
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            backgroundColor: ['rgba(95, 46, 234, 1)'],
            borderColor: ['rgba(95, 46, 234, 1)'],
            borderWidth: 2
          }, {
            label: 'Previous',
            data: [20, 36, 16, 45, 29, 32, 10],
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            backgroundColor: ['rgba(75, 222, 151, 1)'],
            borderColor: ['rgba(75, 222, 151, 1)'],
            borderWidth: 2
          }]
        },
        options: {
          scales: {
            y: {
              min: 0,
              max: 100,
              ticks: {
                stepSize: 25
              },
              grid: {
                display: false
              }
            },
            x: {
              grid: {
                color: gridLine
              }
            }
          },
          elements: {
            point: {
              radius: 2
            }
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 8,
                boxHeight: 8,
                usePointStyle: true,
                font: {
                  size: 12,
                  weight: '500'
                }
              }
            },
            title: {
              display: true,
              text: ['Visitor statistics', 'Nov - July'],
              align: 'start',
              color: '#171717',
              font: {
                size: 16,
                family: 'Inter',
                weight: '600',
                lineHeight: 1.4
              }
            }
          },
          tooltips: {
            mode: 'index',
            intersect: false
          },
          hover: {
            mode: 'nearest',
            intersect: true
          }
        }
      });
      charts.visitors = myChart;
    }
    /* Customers chart */


    var customersChart = document.getElementById('customersChart');

    if (customersChart) {
      var customersChartCanvas = customersChart.getContext('2d');
      var myCustomersChart = new Chart(customersChartCanvas, {
        type: 'line',
        data: {
          labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: '+958',
            data: [90, 10, 80, 20, 70, 30, 50],
            tension: 0.4,
            backgroundColor: function backgroundColor(context) {
              var chart = context.chart;
              var ctx = chart.ctx,
                chartArea = chart.chartArea;

              if (!chartArea) {
                // This case happens on initial chart load
                return null;
              }

              return getGradient(ctx, chartArea);
            },
            borderColor: ['#fff'],
            borderWidth: 2,
            fill: true
          }]
        },
        options: {
          scales: {
            y: {
              display: false
            },
            x: {
              display: false
            }
          },
          elements: {
            point: {
              radius: 1
            }
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                color: '#fff',
                size: 18,
                fontStyle: 800,
                boxWidth: 0
              }
            },
            title: {
              display: true,
              text: ['New Customers', '28 Daily Avg.'],
              align: 'start',
              color: '#fff',
              font: {
                size: 16,
                family: 'Inter',
                weight: '600',
                lineHeight: 1.4
              },
              padding: {
                top: 20
              }
            }
          },
          maintainAspectRatio: false
        }
      });
      customersChart.customers = myCustomersChart;
    }
  })();
  /* Change data of all charts */


  function addData() {
    var darkMode = localStorage.getItem('darkMode');

    if (darkMode === 'enabled') {
      gridLine = '#37374F';
      titleColor = '#EFF0F6';
    } else {
      gridLine = '#EEEEEE';
      titleColor = '#171717';
    }

    if (charts.hasOwnProperty('visitors')) {
      charts.visitors.options.scales.x.grid.color = gridLine;
      charts.visitors.options.plugins.title.color = titleColor;
      charts.visitors.options.scales.y.ticks.color = titleColor;
      charts.visitors.options.scales.x.ticks.color = titleColor;
      charts.visitors.update();
    }
  }

  addData();
});

document.addEventListener('DOMContentLoaded', function () {
  const mainCategoryApiUrl = '/api/category';
  const subCategoryApiUrl = '/api/sub-category';
  const categories = {};

  makeRequest('/api/user/profile', function (data) {
    const permissionData = JSON.parse(data.permissions)
    let object = ['users', 'products', 'categories', 'admin-users', 'home', 'orders', 'features', 'queries', 'brands', 'blogs', 'keyfacts', 'about', 'recipies', 'basic-vichaar']
    let permissionLessTabs = [];
    object.map((key) => {
      if (!permissionData.includes(key)) {
        permissionLessTabs.push(key)
      }
    })
    if (!permissionLessTabs.includes('products')) {
      makeRequest(mainCategoryApiUrl, function (mainCategoryData) {
        processMainCategories(mainCategoryData);
        makeRequest(subCategoryApiUrl, function (subCategoryData) {
          processSubCategories(subCategoryData);
          filterAndRenderCategories();
        });
      });
    }
    else {
      filterAndRenderCategories();
    }
    permissionLessTabs.map((key) => {
      if (key !== 'products') {
        console.log()
        document.getElementById(key).style.display = 'none'
      }
    })
  })

  function makeRequest(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        callback(data);
      } else {
        console.error('Request failed with status:', xhr.status);
      }
    };
    xhr.onerror = function () {
      console.error('Request failed');
    };
    xhr.send();
  }

  function processMainCategories(mainCategoryData) {
    mainCategoryData.forEach(function (mainCategory) {
      const ID = mainCategory.ID;
      if (!categories[ID]) {
        categories[ID] = {};
      }
      categories[ID].main = mainCategory;
    });
  }

  function processSubCategories(subCategoryData) {
    subCategoryData.forEach(function (subCategory) {
      const mcID = subCategory.mcID;
      if (!categories[mcID]) {
        categories[mcID] = {};
      }
      if (!categories[mcID].sub) {
        categories[mcID].sub = [];
      }
      categories[mcID].sub.push(subCategory);
    });
  }

  const delay = ms => new Promise(res => setTimeout(res, ms));

  async function myFunction(text) {
    var x = document.getElementById("snackbar");
    x.className = "show";
    x.innerText = text
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
    await delay(2000);
  }

  function filterAndRenderCategories() {
    const filteredCategories = Object.entries(categories)
      .filter(([mcID, category]) => category.main && category.sub)
      .reduce((obj, [mcID, category]) => {
        obj[mcID] = category;
        return obj;
      }, {});

    const sidebarBodyMenu = document.querySelector('.sidebar-body-menu');

    Object.entries(filteredCategories).forEach(([mcID, category]) => {
      // Create the main category list item
      var mainCategoryListItem = document.createElement('li');

      // Create the main category link
      var mainCategoryLink = document.createElement('a');
      mainCategoryLink.href = '#'; // Update the href accordingly
      mainCategoryLink.classList.add('show-cat-btn'); // Add show-cat-btn class
      mainCategoryLink.classList.add('mainCategory'); // Add show-cat-btn class
      mainCategoryLink.innerHTML = `
            <span class="icon document" aria-hidden="true"></span>
            ${category.main.categoryName}
            <span class="category__btn transparent-btn" title="Open list">
            <span class="sr-only">Open list</span>
            <span class="icon arrow-down" aria-hidden="true"></span>
            </span>
            `;

      // Add event listener to the main category link
      mainCategoryLink.addEventListener('click', function () {
        var subMenu = this.nextElementSibling;
        subMenu.classList.toggle('active');
      });

      // Append the main category link to the main category list item
      mainCategoryListItem.appendChild(mainCategoryLink);

      // Create the sublist for subcategories
      var subCategoryList = document.createElement('ul');
      subCategoryList.classList.add('cat-sub-menu'); // Add cat-sub-menu class
      var subCategoryIDs = [];

      // Loop through the subcategories array
      category.sub.forEach(subCategory => {
        // Create the subcategory list item
        var subCategoryListItem = document.createElement('li');

        // Create the subcategory link
        var subCategoryLink = document.createElement('a');
        subCategoryLink.href = '/products/' + subCategory.ID; // Assuming the subcategory object has a 'link' property
        subCategoryLink.textContent = subCategory.subCategoryName; // Assuming the subcategory object has a 'name' property
        subCategoryIDs.push(subCategory.ID);

        // Append the subcategory link to the subcategory list item
        subCategoryListItem.appendChild(subCategoryLink);

        // Append the subcategory list item to the sublist
        subCategoryList.appendChild(subCategoryListItem);
        mainCategoryLink.setAttribute('id', subCategoryIDs.join(' '));
      });

      // Append the sublist to the main category list item
      mainCategoryListItem.appendChild(subCategoryList);

      // Append the main category list item to the sidebar body menu
      sidebarBodyMenu.appendChild(mainCategoryListItem);
    });

    const showCatBtns = document.querySelectorAll('.show-cat-btn');
    if (showCatBtns) {
      showCatBtns.forEach(function (showCatBtn) {
        const catSubMenu = showCatBtn.nextElementSibling;
        showCatBtn.addEventListener('click', function (e) {
          e.preventDefault();
          catSubMenu.classList.toggle('visible');
          const catBtnToRotate = document.querySelector('.category__btn');
          catBtnToRotate.classList.toggle('rotated');
        });
      });
    }
    changeActiveLink();
  }

  function changeActiveLink() {
    const currentPath = window.location.pathname.split('/')[2];
    const sidebarLinks = document.querySelectorAll('.sidebar-body-menu a');
    sidebarLinks.forEach(link => {
      const href = link.getAttribute('href');
      const id = link.getAttribute('id');
      const catSubMenu = link.nextElementSibling;
      console.log(sidebarLinks, href, window.location.pathname.endsWith(href))
      if (href && window.location.pathname.endsWith(href)) {
        link.classList.add('active');
      } else if ((window.location.pathname.endsWith('/main-category') || window.location.pathname.endsWith('/sub-category')) && link.getAttribute('id') === 'categories') {
        catSubMenu.classList.toggle('visible');
        link.classList.add('active');
      } else if ((window.location.pathname.includes('/home')) && link.getAttribute('id') === 'home') {
        catSubMenu.classList.toggle('visible');
        link.classList.add('active');
      } else if (id && id.split(" ").includes(currentPath)) {
        catSubMenu.classList.toggle('visible');
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  var logoutBtn = document.getElementById('logoutbtn');
  console.log(logoutBtn)
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function () {
      var xhr = new XMLHttpRequest();
      await myFunction('Logout successfull')
      xhr.open('GET', '/api/auth/logout', true);
      xhr.withCredentials = true; // Include cookies in the request
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          window.location.href = '/'; // Redirect to homepage upon successful logout
        } else {
          console.error('Logout failed:', xhr.statusText);
          // Optionally, inform the user about the logout failure
        }
      };
      xhr.onerror = function () {
        console.error('Error during logout:', xhr.statusText);
        // Optionally, inform the user about the logout failure
      };
      xhr.send();
    });
  }

  let dropdown = document.getElementById('profileButtom')
  console.log(dropdown)
  if (dropdown) {
    dropdown.addEventListener('click', function (e) {
      document.getElementById('profile').classList.toggle('active');
    })
  }
});
