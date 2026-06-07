(function () {
  const catalog = Array.isArray(window.RESOURCE_CATALOG) ? window.RESOURCE_CATALOG : [];
  const subjectsEl = document.querySelector("#subjects");
  const searchInput = document.querySelector("#searchInput");
  const clearSearch = document.querySelector("#clearSearch");
  const emptyState = document.querySelector("#emptyState");
  const subjectCount = document.querySelector("#subjectCount");
  const fileCount = document.querySelector("#fileCount");
  const openSubjects = new Set();
  const track = window.trackSiteEvent || function () {};
  let searchTimer = null;
  const subjectDescriptions = {
    "C与C++": "C/C++ 课程作业、源码、工程与编译结果",
    "初等数论": "初等数论试卷、答案与参考资料",
    "复变函数": "复变函数课程试卷与复习资料",
    "实变函数": "实变函数课程试卷、回忆版与复习材料",
    "常微分方程": "常微分方程相关试卷与资料",
    "抽象代数": "抽象代数课程试卷、答案与回忆资料",
    "数值分析一": "数值分析一代码、Notebook、作业与实验结果",
    "数学分析": "数学分析课程试卷与复习资料",
    "数学模型": "数学建模与数学模型案例、Notebook、代码与报告",
    "普通物理上": "普通物理上课程讲义、试卷与复习资料",
    "普通物理下": "普通物理下课程讲义、试卷与复习资料",
    "概率论": "概率论课程试卷、回忆版与文档",
    "运筹学": "运筹学课程试卷与复习资料",
    "高等代数": "高等代数试卷、答案与回忆资料"
  };

  function normalize(value) {
    return String(value || "").toLocaleLowerCase("zh-CN");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function highlight(value, query) {
    const text = escapeHtml(value);
    if (!query) {
      return text;
    }

    const source = String(value || "");
    const lowerSource = normalize(source);
    const lowerQuery = normalize(query);
    const index = lowerSource.indexOf(lowerQuery);
    if (index === -1) {
      return text;
    }

    const end = index + query.length;
    return [
      escapeHtml(source.slice(0, index)),
      "<mark>",
      escapeHtml(source.slice(index, end)),
      "</mark>",
      escapeHtml(source.slice(end))
    ].join("");
  }

  function getTypeSummary(files) {
    const counts = files.reduce((acc, file) => {
      const type = file.type || "file";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"))
      .slice(0, 4);
  }

  function fileMatches(file, query) {
    const target = `${file.name} ${file.path} ${file.type}`;
    return normalize(target).includes(normalize(query));
  }

  function subjectMatches(subject, query) {
    const target = `${subject.name} ${getSubjectDescription(subject)}`;
    return normalize(target).includes(normalize(query));
  }

  function getSubjectDescription(subject) {
    return subjectDescriptions[subject.name] || subject.description || `${subject.name} 相关课程资料`;
  }

  function createFileItem(file, query) {
    const href = file.path.split("/").map(encodeURIComponent).join("/");
    const item = document.createElement("article");
    item.className = "file-item";
    item.innerHTML = `
      <div class="file-meta">
        <div class="file-name">${highlight(file.name, query)}</div>
        <div class="file-path">${highlight(file.path, query)}</div>
      </div>
      <div class="file-actions">
        <a class="action primary" href="${escapeHtml(href)}" target="_blank" rel="noopener" data-action="open">打开</a>
        <a class="action" href="${escapeHtml(href)}" download="${escapeHtml(file.name)}" data-action="download">下载</a>
      </div>
    `;

    item.querySelector('[data-action="open"]').addEventListener("click", () => {
      track("open_file", {
        file: file.path,
        name: file.name,
        type: file.type
      });
    });

    item.querySelector('[data-action="download"]').addEventListener("click", () => {
      track("download_file", {
        file: file.path,
        name: file.name,
        type: file.type
      });
    });

    return item;
  }

  function render() {
    const query = searchInput.value.trim();
    const normalizedQuery = normalize(query);
    let visibleSubjectCount = 0;
    let visibleFileCount = 0;

    subjectsEl.innerHTML = "";

    catalog.forEach((subject) => {
      const matchedSubject = query && subjectMatches(subject, query);
      const description = getSubjectDescription(subject);
      const matchedFiles = query ? subject.files.filter((file) => fileMatches(file, query)) : subject.files;
      const files = query ? matchedFiles : subject.files;

      if (query && files.length === 0 && !matchedSubject) {
        return;
      }

      visibleSubjectCount += 1;
      visibleFileCount += files.length;

      const isOpen = query
        ? files.length > 0
        : openSubjects.has(subject.name);

      const card = document.createElement("article");
      card.className = "subject-card";
      card.dataset.open = String(isOpen);
      card.innerHTML = `
        <button class="subject-button" type="button" aria-expanded="${isOpen}">
          <div>
            <div class="subject-title">
              <h2>${highlight(subject.name, query)}</h2>
              <small>${files.length} / ${subject.files.length} 份</small>
            </div>
            <p class="subject-desc">${highlight(description, query)}</p>
          </div>
          <div class="type-row" aria-label="文件类型统计"></div>
          <span class="chevron" aria-hidden="true"></span>
        </button>
        <div class="file-list"></div>
      `;

      const button = card.querySelector(".subject-button");
      const typeRow = card.querySelector(".type-row");
      const fileList = card.querySelector(".file-list");

      getTypeSummary(subject.files).forEach(([type, count]) => {
        const chip = document.createElement("span");
        chip.className = "type-chip";
        chip.textContent = `${type} ${count}`;
        typeRow.appendChild(chip);
      });

      files.forEach((file) => fileList.appendChild(createFileItem(file, query)));

      button.addEventListener("click", () => {
        if (normalizedQuery) {
          searchInput.value = "";
          openSubjects.add(subject.name);
          track("expand_subject", {
            subject: subject.name,
            files: subject.files.length,
            source: "search"
          });
          render();
          return;
        }

        if (openSubjects.has(subject.name)) {
          openSubjects.delete(subject.name);
          track("collapse_subject", {
            subject: subject.name,
            files: subject.files.length
          });
        } else {
          openSubjects.add(subject.name);
          track("expand_subject", {
            subject: subject.name,
            files: subject.files.length
          });
        }
        render();
      });

      subjectsEl.appendChild(card);
    });

    subjectCount.textContent = visibleSubjectCount;
    fileCount.textContent = visibleFileCount;
    emptyState.hidden = visibleSubjectCount > 0;
    clearSearch.style.visibility = query ? "visible" : "hidden";
  }

  searchInput.addEventListener("input", () => {
    render();
    window.clearTimeout(searchTimer);
    const query = searchInput.value.trim();
    if (!query) {
      return;
    }
    searchTimer = window.setTimeout(() => {
      track("search", {
        query,
        length: query.length
      });
    }, 700);
  });

  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    searchInput.focus();
    track("clear_search");
    render();
  });

  track("catalog_loaded", {
    subjects: catalog.length,
    files: catalog.reduce((total, subject) => total + subject.files.length, 0)
  });
  render();
})();
