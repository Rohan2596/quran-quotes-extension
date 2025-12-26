
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("dailyBibleVerse", {
    when: Date.now() + 5000,
    periodInMinutes: 1440
  });
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === "dailyBibleVerse") {
    fetch(chrome.runtime.getURL("quotes.json"))
      .then(res => res.json())
      .then(verses => {
        const v = verses[Math.floor(Math.random() * verses.length)];

        chrome.notifications.create({
          type: "basic",
          iconUrl: chrome.runtime.getURL("icon/icon48.png"),
          title: "Daily Bible Verse",
          message: `${v.text}\n— ${v.ref}`
        });
      });
  }
});
