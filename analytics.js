(function () {
  const config = window.SITE_ANALYTICS || {};

  function cleanPayload(payload) {
    return Object.entries(payload || {}).reduce((result, entry) => {
      const [key, value] = entry;
      if (value === undefined || value === null || value === "") {
        return result;
      }
      result[key] = String(value).slice(0, 180);
      return result;
    }, {});
  }

  window.trackSiteEvent = function trackSiteEvent(name, payload) {
    if (!config.enabled || config.provider === "none") {
      return;
    }

    const data = cleanPayload(payload);

    if (config.provider === "umami" && window.umami) {
      window.umami.track(name, data);
      return;
    }

    if (config.provider === "ga" && window.gtag) {
      window.gtag("event", name, data);
    }
  };
})();
