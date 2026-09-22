(function () {
  const config = window.FEEDBACK_CONFIG || {};
  const typeGrid = document.querySelector("#typeGrid");
  const form = document.querySelector("#feedbackForm");
  const fileField = document.querySelector("#fileField");
  const githubField = document.querySelector("#githubField");
  const contactInput = document.querySelector("#fContact");
  const messageInput = document.querySelector("#fMessage");
  const formTip = document.querySelector("#formTip");
  const submitBtn = document.querySelector("#submitBtn");
  const successNote = document.querySelector("#successNote");
  const track = window.trackSiteEvent || function () {};

  const typeLabels = {
    "download-broken": "文件下载损坏",
    "contribution": "投稿更新题目",
    "join-contribute": "申请加入贡献与组织",
    "join-org": "申请加入组织",
    "other": "其他问题"
  };

  const typeHints = {
    "other": "侵权删除、内容纠错、意见建议都可以在这里说。"
  };

  function selectedType() {
    const checked = typeGrid.querySelector('input[name="feedbackType"]:checked');
    return checked ? checked.value : null;
  }

  function syncFields() {
    const type = selectedType();
    form.hidden = !type;
    fileField.hidden = type !== "download-broken";
    githubField.hidden = type !== "join-org";
    formTip.textContent = type ? typeHints[type] : "";

    typeGrid.querySelectorAll(".type-card").forEach((card) => {
      card.classList.toggle("is-selected", card.dataset.value === type);
    });
  }

  typeGrid.addEventListener("change", () => {
    syncFields();
    const type = selectedType();
    if (type) {
      track("feedback_type", { type });
    }
  });

  function buildMessage() {
    const type = selectedType();
    const name = form.elements.name.value.trim();
    const contact = form.elements.contact.value.trim();
    const targetFile = form.elements.targetFile.value.trim();
    const github = form.elements.github.value.trim();
    const message = form.elements.message.value.trim();

    const lines = [
      "【" + (typeLabels[type] || "反馈") + "】",
      "称呼：" + (name || "（未填写）"),
      "联系方式：" + contact
    ];

    if (targetFile) {
      lines.push("涉及文件：" + targetFile);
    }
    if (github) {
      lines.push("GitHub：" + github);
    }

    lines.push("", "详细说明：", message);

    return {
      title: "[LZU Math Resources] " + (typeLabels[type] || "反馈"),
      text: lines.join("\n"),
      data: { type, name, contact, targetFile, github, message }
    };
  }

  function buildMailto() {
    const msg = buildMessage();
    const subject = encodeURIComponent(msg.title);
    const body = encodeURIComponent(msg.text);
    return "mailto:" + config.email + "?subject=" + subject + "&body=" + body;
  }

  async function submitForm() {
    const msg = buildMessage();

    if (config.provider === "formspree" && config.formspreeEndpoint) {
      const response = await fetch(config.formspreeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(msg.data)
      });
      if (!response.ok) {
        throw new Error("Formspree 提交失败：" + response.status);
      }
      return;
    }

    if (config.provider === "formsubmit" && config.email) {
      const type = selectedType();
      const payload = {
        _subject: msg.title,
        _template: "table",
        _captcha: "false",
        "反馈类型": typeLabels[type] || type,
        "称呼": msg.data.name || "（未填写）",
        "联系方式": msg.data.contact,
        "涉及文件": msg.data.targetFile || "",
        "GitHub": msg.data.github || "",
        "详细说明": msg.data.message
      };
      const response = await fetch("https://formsubmit.co/ajax/" + config.email, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (String(result.success) !== "true") {
        throw new Error(result.message || "提交失败：" + response.status);
      }
      return;
    }

    throw new Error("未配置推送服务");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const type = selectedType();
    const contact = contactInput.value.trim();
    const message = messageInput.value.trim();

    if (!type) {
      formTip.textContent = "请先选择一个反馈类型。";
      typeGrid.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!contact) {
      contactInput.focus();
      formTip.textContent = "请留下至少一种联系方式（邮箱 / QQ / 微信）。";
      return;
    }
    if (!message) {
      messageInput.focus();
      formTip.textContent = "请填写详细说明。";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "发送中…";

    track("feedback_submit", {
      type,
      hasFile: fileField.hidden ? "no" : "yes",
      hasGithub: githubField.hidden ? "no" : "yes"
    });

    const useInline =
      (config.provider === "formsubmit" && config.email) ||
      (config.provider === "formspree" && config.formspreeEndpoint);

    if (useInline) {
      submitForm()
        .then(() => {
          form.hidden = true;
          successNote.hidden = false;
          track("feedback_success", { type });
        })
        .catch((error) => {
          submitBtn.disabled = false;
          submitBtn.textContent = "发送反馈";
          formTip.textContent = "发送失败，请直接邮件联系：" + config.email + "（" + error.message + "）";
        });
      return;
    }

    window.location.href = buildMailto();
    submitBtn.disabled = false;
    submitBtn.textContent = "发送反馈";
    formTip.textContent = "已打开你的邮件客户端，若没有自动弹出，请直接邮件联系：" + config.email;
  });

  syncFields();
  track("feedback_page_view");
})();
